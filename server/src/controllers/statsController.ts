import { Response } from "express";
import WatchProgress from "../models/WatchProgress.js";
import { AuthRequest } from "../middleware/auth.js";

function getLocalDateStr(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateTotalWatchedCount(currentSeason: number, currentEpisode: number, seasonsSummary?: any[]): number {
  let count = 0;
  if (Array.isArray(seasonsSummary)) {
    for (let s = 1; s < currentSeason; s++) {
      const sSum = seasonsSummary.find((ss: any) => ss.seasonNumber === s);
      count += sSum?.episodeCount || 10;
    }
  } else {
    count = (currentSeason - 1) * 10;
  }
  count += currentEpisode;
  return count;
}

export async function getStats(req: AuthRequest, res: Response) {
  const allProgress = await WatchProgress.find({ userId: req.userId }).populate("seriesId");

  const totalShowsTracked = allProgress.length;
  const currentlyWatchingCount = allProgress.filter((p) => p.status === "watching").length;
  const completedShowsCount = allProgress.filter((p) => p.status === "completed").length;

  let totalEpisodesWatched = 0;
  let totalSeasonsCompleted = 0;
  let allSeasonRatings: number[] = [];
  const platformCounts: Record<string, number> = {};
  const genreCounts: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};

  allProgress.forEach((p) => {
    // Platform count
    if (p.platform) {
      platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
    }

    // Genre count from series
    const series = p.seriesId as any;
    if (series && Array.isArray(series.genres)) {
      series.genres.forEach((g: string) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    }

    // Season ratings & completed seasons
    if (p.seasonRatings && Array.isArray(p.seasonRatings)) {
      totalSeasonsCompleted += p.seasonRatings.length;
      p.seasonRatings.forEach((sr) => {
        if (typeof sr.rating === "number") {
          allSeasonRatings.push(sr.rating);
        }
      });
    }

    // Calculate total episodes watched for this show
    const totalEps = calculateTotalWatchedCount(p.currentSeason, p.currentEpisode, series?.seasonsSummary);
    totalEpisodesWatched += totalEps;

    // Real-time Episode Logs Daily Heatmap Count (strictly capped to totalEps)
    if (totalEps > 0) {
      if (p.episodeLogs && Array.isArray(p.episodeLogs) && p.episodeLogs.length > 0) {
        const validLogs = p.episodeLogs.slice(0, totalEps);
        validLogs.forEach((log: any) => {
          const dStr = getLocalDateStr(log.watchedAt || p.lastWatchedAt || new Date());
          dailyCounts[dStr] = (dailyCounts[dStr] || 0) + 1;
        });

        // Attribute any remaining uncached episodes to lastWatchedAt
        const remaining = totalEps - validLogs.length;
        if (remaining > 0) {
          const dStr = getLocalDateStr(p.lastWatchedAt || p.createdAt || new Date());
          dailyCounts[dStr] = (dailyCounts[dStr] || 0) + remaining;
        }
      } else {
        // Fallback for legacy history where episodeLogs array was not recorded yet
        const dStr = getLocalDateStr(p.lastWatchedAt || p.createdAt || new Date());
        dailyCounts[dStr] = (dailyCounts[dStr] || 0) + totalEps;
      }
    }
  });

  // Calculate watch time (approx 45 min per episode)
  const totalWatchTimeMinutes = totalEpisodesWatched * 45;
  const totalWatchTimeHours = Math.round(totalWatchTimeMinutes / 60);
  const totalWatchTimeDays = Number((totalWatchTimeHours / 24).toFixed(1));

  // Average season rating
  const avgSeasonRating =
    allSeasonRatings.length > 0
      ? Number((allSeasonRatings.reduce((a, b) => a + b, 0) / allSeasonRatings.length).toFixed(1))
      : 0;

  // Most watched OTT platform
  let topPlatform = "None";
  let maxPlatformCount = 0;
  Object.entries(platformCounts).forEach(([plat, count]) => {
    if (count > maxPlatformCount) {
      maxPlatformCount = count;
      topPlatform = plat;
    }
  });

  // Sort platforms for chart
  const platformsArray = Object.entries(platformCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Sort genres for chart
  const genresArray = Object.entries(genreCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  res.json({
    totalShowsTracked,
    currentlyWatchingCount,
    completedShowsCount,
    totalSeasonsCompleted,
    totalEpisodesWatched,
    totalWatchTimeHours,
    totalWatchTimeDays,
    avgSeasonRating,
    topPlatform,
    platforms: platformsArray,
    genres: genresArray,
    dailyCounts,
    recentShows: allProgress.slice(0, 5)
  });
}
