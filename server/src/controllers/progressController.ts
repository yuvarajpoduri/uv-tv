import { Response } from "express";
import WatchProgress from "../models/WatchProgress.js";
import Series from "../models/Series.js";
import Watchlist from "../models/Watchlist.js";
import { AuthRequest } from "../middleware/auth.js";
import { findOrCreateSeries } from "./seriesController.js";
import * as tmdb from "../utils/tmdb.js";

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

function syncEpisodeLogs(progress: any, series: any) {
  if (!progress.episodeLogs) progress.episodeLogs = [];
  const targetCount = calculateTotalWatchedCount(
    progress.currentSeason,
    progress.currentEpisode,
    series?.seasonsSummary
  );

  if (progress.episodeLogs.length > targetCount) {
    progress.episodeLogs = progress.episodeLogs.slice(0, targetCount);
  } else {
    while (progress.episodeLogs.length < targetCount) {
      progress.episodeLogs.push({
        seasonNumber: progress.currentSeason,
        episodeNumber: progress.currentEpisode,
        watchedAt: new Date()
      });
    }
  }

  // Force Mongoose to persist episodeLogs array updates
  progress.markModified("episodeLogs");
}

export async function getActiveProgress(req: AuthRequest, res: Response) {
  const activeList = await WatchProgress.find({
    userId: req.userId,
    status: "watching"
  })
    .populate("seriesId")
    .sort({ lastWatchedAt: -1 });

  res.json(activeList);
}

export async function getAllProgress(req: AuthRequest, res: Response) {
  const list = await WatchProgress.find({ userId: req.userId })
    .populate("seriesId")
    .sort({ lastWatchedAt: -1 });

  res.json(list);
}

export async function getProgressByTmdbId(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const progress = await WatchProgress.findOne({ userId: req.userId, tmdbId }).populate("seriesId");
  res.json(progress || null);
}

export async function startTracking(req: AuthRequest, res: Response) {
  const { tmdbId, platform, currentSeason = 1, currentEpisode = 1 } = req.body;
  if (!tmdbId) {
    res.status(400).json({ message: "tmdbId is required" });
    return;
  }

  const series = await findOrCreateSeries(tmdbId);

  // Fetch season info to get total episodes in season
  let seasonEpCount = 10;
  try {
    const seasonData = await tmdb.getTVSeasonDetails(tmdbId, currentSeason);
    seasonEpCount = seasonData?.episodes?.length || 10;
  } catch {}

  let progress = await WatchProgress.findOne({ userId: req.userId, seriesId: series._id });
  if (progress) {
    progress.status = "watching";
    progress.platform = platform || progress.platform || "netflix";
    progress.currentSeason = currentSeason;
    progress.currentEpisode = currentEpisode;
    progress.totalEpisodesInCurrentSeason = seasonEpCount;
    progress.lastWatchedAt = new Date();
    syncEpisodeLogs(progress, series);
    await progress.save();
  } else {
    progress = new WatchProgress({
      userId: req.userId,
      seriesId: series._id,
      tmdbId,
      platform: platform || "netflix",
      status: "watching",
      currentSeason,
      currentEpisode,
      totalEpisodesInCurrentSeason: seasonEpCount,
      seasonRatings: [],
      episodeLogs: [],
      startedAt: new Date(),
      lastWatchedAt: new Date()
    });
    syncEpisodeLogs(progress, series);
    await progress.save();
  }

  // Auto remove from watchlist if present
  await Watchlist.findOneAndDelete({ userId: req.userId, seriesId: series._id });

  await progress.populate("seriesId");
  res.json(progress);
}

export async function updateProgress(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const { currentSeason, currentEpisode, platform, status, isFavorite, notes } = req.body;

  const series = await Series.findOne({ tmdbId });
  if (!series) {
    res.status(404).json({ message: "Series not found" });
    return;
  }

  let progress = await WatchProgress.findOne({ userId: req.userId, seriesId: series._id });
  if (!progress) {
    res.status(404).json({ message: "Series progress not found" });
    return;
  }

  if (platform) progress.platform = platform;
  if (status) progress.status = status;
  if (isFavorite !== undefined) progress.isFavorite = isFavorite;
  if (notes !== undefined) progress.notes = notes;

  let seasonChanged = false;
  if (currentSeason !== undefined && currentSeason !== progress.currentSeason) {
    progress.currentSeason = currentSeason;
    seasonChanged = true;
  }

  if (currentEpisode !== undefined) {
    progress.currentEpisode = currentEpisode;
  }

  // Sync episode logs to match current episode & season
  syncEpisodeLogs(progress, series);

  // Update total episodes in current season if season changed or zero
  if (seasonChanged || !progress.totalEpisodesInCurrentSeason) {
    try {
      const seasonData = await tmdb.getTVSeasonDetails(tmdbId, progress.currentSeason);
      progress.totalEpisodesInCurrentSeason = seasonData?.episodes?.length || 10;
    } catch {}
  }

  // Check if current episode reaches total episodes for current season
  let seasonJustFinished = false;
  if (
    progress.currentEpisode >= progress.totalEpisodesInCurrentSeason &&
    progress.totalEpisodesInCurrentSeason > 0
  ) {
    // Check if season rating already exists
    const hasRating = progress.seasonRatings.some((sr) => sr.seasonNumber === progress.currentSeason);
    if (!hasRating) {
      seasonJustFinished = true;
    }
  }

  progress.lastWatchedAt = new Date();
  await progress.save();
  await progress.populate("seriesId");

  res.json({
    progress,
    seasonJustFinished,
    promptSeasonRatingNumber: seasonJustFinished ? progress.currentSeason : null
  });
}

export async function incrementEpisode(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);

  const series = await Series.findOne({ tmdbId });
  if (!series) {
    res.status(404).json({ message: "Series not found" });
    return;
  }

  let progress = await WatchProgress.findOne({ userId: req.userId, seriesId: series._id });
  if (!progress) {
    res.status(404).json({ message: "Series progress not found" });
    return;
  }

  let nextEp = progress.currentEpisode + 1;
  let seasonJustFinished = false;
  let seasonToRate = progress.currentSeason;

  if (nextEp > progress.totalEpisodesInCurrentSeason && progress.totalEpisodesInCurrentSeason > 0) {
    // Current season complete!
    const hasRating = progress.seasonRatings.some((sr) => sr.seasonNumber === progress.currentSeason);
    if (!hasRating) {
      seasonJustFinished = true;
      seasonToRate = progress.currentSeason;
    }

    // Move to next season if available
    if (progress.currentSeason < series.numberOfSeasons) {
      progress.currentSeason += 1;
      progress.currentEpisode = 1;
      try {
        const seasonData = await tmdb.getTVSeasonDetails(tmdbId, progress.currentSeason);
        progress.totalEpisodesInCurrentSeason = seasonData?.episodes?.length || 10;
      } catch {
        progress.totalEpisodesInCurrentSeason = 10;
      }
    } else {
      // Completed all seasons of the series!
      progress.currentEpisode = progress.totalEpisodesInCurrentSeason;
      progress.status = "completed";
    }
  } else {
    progress.currentEpisode = nextEp;
  }

  // Sync episode logs to match current episode & season
  syncEpisodeLogs(progress, series);

  progress.lastWatchedAt = new Date();
  await progress.save();
  await progress.populate("seriesId");

  res.json({
    progress,
    seasonJustFinished,
    promptSeasonRatingNumber: seasonJustFinished ? seasonToRate : null
  });
}

export async function decrementEpisode(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);

  const series = await Series.findOne({ tmdbId });
  if (!series) {
    res.status(404).json({ message: "Series not found" });
    return;
  }

  let progress = await WatchProgress.findOne({ userId: req.userId, seriesId: series._id });
  if (!progress) {
    res.status(404).json({ message: "Series progress not found" });
    return;
  }

  if (progress.currentEpisode > 1) {
    progress.currentEpisode -= 1;
  } else if (progress.currentSeason > 1) {
    progress.currentSeason -= 1;
    try {
      const seasonData = await tmdb.getTVSeasonDetails(tmdbId, progress.currentSeason);
      const epCount = seasonData?.episodes?.length || 10;
      progress.totalEpisodesInCurrentSeason = epCount;
      progress.currentEpisode = epCount;
    } catch {
      progress.totalEpisodesInCurrentSeason = 10;
      progress.currentEpisode = 10;
    }
  }

  // Sync episode logs to match current episode & season
  syncEpisodeLogs(progress, series);

  progress.lastWatchedAt = new Date();
  await progress.save();
  await progress.populate("seriesId");

  res.json({ progress });
}

export async function rateSeason(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const { seasonNumber, rating, review, note } = req.body;

  if (seasonNumber === undefined || rating === undefined) {
    res.status(400).json({ message: "seasonNumber and rating are required" });
    return;
  }

  const series = await Series.findOne({ tmdbId });
  if (!series) {
    res.status(404).json({ message: "Series not found" });
    return;
  }

  let progress = await WatchProgress.findOne({ userId: req.userId, seriesId: series._id });
  if (!progress) {
    res.status(404).json({ message: "Series progress not found" });
    return;
  }

  // Add or update season rating
  const existingIdx = progress.seasonRatings.findIndex((sr) => sr.seasonNumber === Number(seasonNumber));
  if (existingIdx >= 0) {
    progress.seasonRatings[existingIdx].rating = Number(rating);
    if (review !== undefined) progress.seasonRatings[existingIdx].review = review;
    if (note !== undefined) progress.seasonRatings[existingIdx].note = note;
    progress.seasonRatings[existingIdx].completedAt = new Date();
  } else {
    progress.seasonRatings.push({
      seasonNumber: Number(seasonNumber),
      rating: Number(rating),
      completedAt: new Date(),
      review: review || "",
      note: note || ""
    });
  }

  // Calculate overall series rating from all rated seasons
  if (progress.seasonRatings.length > 0) {
    const sum = progress.seasonRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = Number((sum / progress.seasonRatings.length).toFixed(1));
    progress.overallRating = avg;
  }

  // Check if all seasons have been rated & completed
  if (
    progress.seasonRatings.length >= series.numberOfSeasons &&
    series.numberOfSeasons > 0
  ) {
    progress.status = "completed";
  }

  progress.lastWatchedAt = new Date();
  await progress.save();
  await progress.populate("seriesId");

  res.json({
    progress,
    message: `Rated Season ${seasonNumber} successfully!`
  });
}

export async function stopWatching(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const series = await Series.findOne({ tmdbId });
  if (!series) {
    res.status(404).json({ message: "Series not found" });
    return;
  }
  const progress = await WatchProgress.findOne({ userId: req.userId, seriesId: series._id });
  if (!progress) {
    res.status(404).json({ message: "Progress not found" });
    return;
  }
  progress.status = "on_hold";
  progress.lastWatchedAt = new Date();
  await progress.save();
  await progress.populate("seriesId");
  res.json({ progress });
}

export async function resumeWatching(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const series = await Series.findOne({ tmdbId });
  if (!series) {
    res.status(404).json({ message: "Series not found" });
    return;
  }
  const progress = await WatchProgress.findOne({ userId: req.userId, seriesId: series._id });
  if (!progress) {
    res.status(404).json({ message: "Progress not found" });
    return;
  }
  progress.status = "watching";
  progress.lastWatchedAt = new Date();
  await progress.save();
  await progress.populate("seriesId");
  res.json({ progress });
}

export async function deleteProgress(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const series = await Series.findOne({ tmdbId });
  if (series) {
    await WatchProgress.findOneAndDelete({ userId: req.userId, seriesId: series._id });
  }
  res.json({ message: "Progress deleted" });
}
