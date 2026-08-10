import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Star } from "lucide-react";
import { api } from "../lib/api";
import { WatchProgress } from "../types";
import { tmdbImage, platformLabel, formatDate } from "../lib/utils";
import EmptyState from "../components/EmptyState";
import { ProgressCardSkeleton } from "../components/Skeletons";

export default function History() {
  const [historyList, setHistoryList] = useState<WatchProgress[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "watching">("all");
  const [loading, setLoading] = useState(true);

  async function fetchHistory() {
    try {
      const { data } = await api.get<WatchProgress[]>("/progress/all").catch(() => ({ data: [] }));
      setHistoryList(data || []);
    } catch {
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = historyList.filter((p) => {
    if (!p) return false;
    if (filter === "completed") return p.status === "completed";
    if (filter === "watching") return p.status === "watching";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Watch History & Log</h1>
          <p className="text-xs text-zinc-400 mt-1">Record of watched TV series and season ratings</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-base-900 rounded-2xl border border-white/10 self-start sm:self-auto">
          {(["all", "completed", "watching"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-accent-orange text-white shadow-glow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <ProgressCardSkeleton />
          <ProgressCardSkeleton />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => {
            const series = item.seriesId;
            const tmdbId = series?.tmdbId || item.tmdbId;
            return (
              <div
                key={item._id}
                className="glass rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-base-900/60"
              >
                <div className="flex gap-4 items-center">
                  <Link to={`/show/${tmdbId}`} className="shrink-0 rounded-xl overflow-hidden w-16 h-22 bg-base-950">
                    <img
                      src={tmdbImage(series?.posterPath, "w200")}
                      alt={series?.name || "Series"}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-base-800 text-zinc-300 border border-zinc-700 uppercase">
                        {platformLabel(item.platform)}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        Last watched: {formatDate(item.lastWatchedAt)}
                      </span>
                    </div>

                    <Link to={`/show/${tmdbId}`}>
                      <h3 className="text-base font-bold text-white hover:text-accent-orange transition-colors font-display">
                        {series?.name || "TV Show"}
                      </h3>
                    </Link>

                    <div className="text-xs text-zinc-400">
                      Season {item.currentSeason} • Episode {item.currentEpisode} / {item.totalEpisodesInCurrentSeason}
                    </div>
                  </div>
                </div>

                {/* Season ratings summary */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {item.seasonRatings && item.seasonRatings.length > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] text-zinc-400">Rated {item.seasonRatings.length} Seasons</span>
                      {item.overallRating && (
                        <div className="flex items-center gap-1 text-accent-yellow font-bold text-sm mt-0.5">
                          <Star className="w-4 h-4 fill-accent-yellow" />
                          <span>Overall ★{item.overallRating}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">No ratings logged yet</span>
                  )}

                  <Link
                    to={`/show/${tmdbId}`}
                    className="py-2 px-3.5 rounded-xl bg-base-800 hover:bg-base-700 text-xs font-semibold text-zinc-200 border border-white/10"
                  >
                    View Show
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={HistoryIcon}
          title="No watch history found"
          description="Your completed and tracked TV shows will appear here once you log progress."
        />
      )}
    </div>
  );
}
