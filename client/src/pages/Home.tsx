import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tv, Clock, Layers, Bookmark, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { WatchProgress, Series, WatchlistEntry, StatsData } from "../types";
import { tmdbImage, formatDate } from "../lib/utils";
import SeriesProgressCard from "../components/SeriesProgressCard";
import SeasonRatingModal from "../components/SeasonRatingModal";
import EmptyState from "../components/EmptyState";
import { ProgressCardSkeleton, PosterGridSkeleton } from "../components/Skeletons";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeProgress, setActiveProgress] = useState<WatchProgress[]>([]);
  const [allProgress, setAllProgress] = useState<WatchProgress[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Season Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    tmdbId: number;
    title: string;
    seasonNumber: number;
    existingRating?: number;
    existingReview?: string;
  } | null>(null);

  async function loadData() {
    try {
      const [activeRes, allRes, watchlistRes, statsRes] = await Promise.all([
        api.get<WatchProgress[]>("/progress/active").catch(() => ({ data: [] })),
        api.get<WatchProgress[]>("/progress/all").catch(() => ({ data: [] })),
        api.get<WatchlistEntry[]>("/watchlist").catch(() => ({ data: [] })),
        api.get<StatsData>("/stats").catch(() => ({ data: null }))
      ]);

      setActiveProgress(activeRes.data || []);
      setAllProgress(allRes.data || []);
      setWatchlist(watchlistRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load home data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleProgressUpdate(updatedProgress: WatchProgress, promptSeasonRatingNumber?: number | null) {
    setActiveProgress((prev) =>
      prev.map((p) => (p._id === updatedProgress._id ? updatedProgress : p))
    );

    if (promptSeasonRatingNumber) {
      const series = updatedProgress.seriesId;
      const existingSr = updatedProgress.seasonRatings?.find(
        (sr) => sr.seasonNumber === promptSeasonRatingNumber
      );
      setRatingTarget({
        tmdbId: updatedProgress.tmdbId,
        title: series?.name || "TV Series",
        seasonNumber: promptSeasonRatingNumber,
        existingRating: existingSr?.rating || 4.5,
        existingReview: existingSr?.review || ""
      });
      setRatingModalOpen(true);
    }
  }

  function handleOpenRateSeason(progress: WatchProgress, seasonNumber: number) {
    const series = progress.seriesId;
    const existingSr = progress.seasonRatings?.find((sr) => sr.seasonNumber === seasonNumber);
    setRatingTarget({
      tmdbId: progress.tmdbId,
      title: series?.name || "TV Series",
      seasonNumber,
      existingRating: existingSr?.rating || 4.5,
      existingReview: existingSr?.review || ""
    });
    setRatingModalOpen(true);
  }

  // Filter 24 unique show posters for wall
  const seenIds = new Set<number>();
  const recentPosters: WatchProgress[] = [];
  for (const item of allProgress) {
    if (item.seriesId?.tmdbId && !seenIds.has(item.seriesId.tmdbId)) {
      seenIds.add(item.seriesId.tmdbId);
      recentPosters.push(item);
      if (recentPosters.length === 24) break;
    }
  }

  const upcomingWatchlist = watchlist.slice(0, 6);

  return (
    <div className="px-3 sm:px-6 pt-2 pb-28 space-y-8 max-w-5xl mx-auto w-full">
      {/* 1. TOP: 4x6 = 24 Posters Grid in Watch Orderwise (Posters Only) */}
      <div className="w-full flex justify-center pt-2">
        {loading ? (
          <PosterGridSkeleton count={8} />
        ) : recentPosters.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-white/40 space-y-2 w-full max-w-md">
            <p className="text-sm font-bold text-white/60">No watched TV series logged yet</p>
            <p>Search for TV series and track your progress to see your poster wall!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-4xl mx-auto">
            {recentPosters.map((item) => {
              const series = item.seriesId;
              return (
                <Link
                  key={item._id}
                  to={`/show/${item.tmdbId}`}
                  className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-base-800 shadow-xl border border-white/10 hover:border-accent-orange/50 hover:scale-105 transition-all duration-300 group block"
                  title={series?.name}
                >
                  {series?.posterPath ? (
                    <img
                      src={tmdbImage(series.posterPath, "w300")}
                      alt={series.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs px-2 text-center font-bold">
                      {series?.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Tracked, Watch Time & Seasons Quick Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-3.5 flex flex-col justify-between border border-accent-orange/20 shadow-md">
            <div className="flex items-center gap-1.5 text-accent-orange">
              <Tv size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Tracked Shows</span>
            </div>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1">{stats.totalShowsTracked}</p>
            <p className="text-[10px] text-white/40">{stats.currentlyWatchingCount} active</p>
          </div>

          <div className="glass-card rounded-2xl p-3.5 flex flex-col justify-between border border-accent-orange/20 shadow-md">
            <div className="flex items-center gap-1.5 text-accent-orange">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Watch Time</span>
            </div>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1">{stats.totalWatchTimeHours}h</p>
            <p className="text-[10px] text-white/40">~{stats.totalWatchTimeDays} days</p>
          </div>

          <div className="glass-card rounded-2xl p-3.5 flex flex-col justify-between border border-accent-yellow/20 shadow-md">
            <div className="flex items-center gap-1.5 text-accent-yellow">
              <Layers size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Seasons</span>
            </div>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1">{stats.totalSeasonsCompleted}</p>
            <p className="text-[10px] text-white/40">Rated seasons</p>
          </div>
        </div>
      )}

      {/* 3. Currently Watching Progress Section */}
      <section className="space-y-3 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv size={16} className="text-accent-orange" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Currently Watching
            </h2>
          </div>
          {activeProgress.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent-orange/20 text-accent-orange border border-accent-orange/30">
              {activeProgress.length} Active
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <ProgressCardSkeleton />
            <ProgressCardSkeleton />
          </div>
        ) : activeProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeProgress.map((progress) => (
              <SeriesProgressCard
                key={progress._id}
                progress={progress}
                onUpdate={handleProgressUpdate}
                onRateSeasonClick={(seasonNumber) => handleOpenRateSeason(progress, seasonNumber)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Tv}
            title="No series currently being watched"
            description="Search for a TV series and select your OTT platform to track season and episode progress."
            action={{
              label: "Search TV Series",
              onClick: () => navigate("/search")
            }}
          />
        )}
      </section>

      {/* 4. Upcoming Watchlist Section */}
      {upcomingWatchlist.length > 0 && (
        <div className="space-y-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-accent-yellow" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Upcoming Watchlist
              </h2>
            </div>
            <Link to="/watchlist" className="text-xs font-semibold text-accent-orange hover:underline flex items-center gap-1">
              View All <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {upcomingWatchlist.map((w) => (
              <Link
                key={w._id}
                to={`/show/${w.seriesId?.tmdbId}`}
                className="glass-card rounded-2xl p-2.5 flex items-center gap-3 border border-white/10 hover:border-accent-orange/40 transition-all group"
              >
                <div className="w-12 h-18 rounded-xl overflow-hidden bg-base-800 shrink-0 border border-white/10 shadow-md">
                  {w.seriesId?.posterPath && (
                    <img
                      src={tmdbImage(w.seriesId.posterPath, "w200")}
                      alt={w.seriesId.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{w.seriesId?.name}</p>
                  {w.plannedDate && (
                    <p className="text-[10px] font-semibold text-accent-yellow flex items-center gap-1 mt-1">
                      <Clock size={10} /> {formatDate(w.plannedDate)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Season Rating Modal */}
      {ratingTarget && (
        <SeasonRatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          tmdbId={ratingTarget.tmdbId}
          showTitle={ratingTarget.title}
          seasonNumber={ratingTarget.seasonNumber}
          existingRating={ratingTarget.existingRating}
          existingReview={ratingTarget.existingReview}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
