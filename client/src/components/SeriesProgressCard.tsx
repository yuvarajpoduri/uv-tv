import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Star, ChevronRight, Calendar, Check, X } from "lucide-react";
import { WatchProgress } from "../types";
import { tmdbImage, platformLabel, platformBadgeColor } from "../lib/utils";
import { api } from "../lib/api";

interface SeriesProgressCardProps {
  progress: WatchProgress;
  onUpdate: (updatedProgress: WatchProgress, promptSeasonRatingNumber?: number | null) => void;
  onRateSeasonClick: (seasonNumber: number) => void;
}

export default function SeriesProgressCard({
  progress,
  onUpdate,
  onRateSeasonClick
}: SeriesProgressCardProps) {
  const [incrementing, setIncrementing] = useState(false);
  const [decrementing, setDecrementing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [watchedAt, setWatchedAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const dateInputRef = useRef<HTMLInputElement>(null);
  const series = progress.seriesId;

  const currentEp = progress.currentEpisode || 1;
  const totalEpInSeason = progress.totalEpisodesInCurrentSeason || 10;
  const currentSeason = progress.currentSeason || 1;

  // Calculate overall series episodes watched vs total show episodes
  let totalWatchedEps = 0;
  if (series && Array.isArray(series.seasonsSummary)) {
    for (let s = 1; s < currentSeason; s++) {
      const sSum = series.seasonsSummary.find((ss) => ss.seasonNumber === s);
      totalWatchedEps += sSum?.episodeCount || 10;
    }
  } else {
    totalWatchedEps = (currentSeason - 1) * 10;
  }
  totalWatchedEps += currentEp;

  const overallTotalEps = series?.numberOfEpisodes || (series?.numberOfSeasons ? series.numberOfSeasons * 10 : totalEpInSeason);
  const overallPercent = Math.min(Math.round((totalWatchedEps / Math.max(1, overallTotalEps)) * 100), 100);

  const isSeasonComplete = currentEp >= totalEpInSeason;
  const currentSeasonRating = progress.seasonRatings?.find((sr) => sr.seasonNumber === currentSeason);

  // Reset date to today whenever picker opens
  useEffect(() => {
    if (showDatePicker) {
      setWatchedAt(new Date().toISOString().slice(0, 10));
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [showDatePicker]);

  async function handleIncrement(customDate?: string) {
    if (incrementing) return;
    setIncrementing(true);
    setShowDatePicker(false);
    try {
      const { data } = await api.put(`/progress/${progress.tmdbId}/increment`, {
        watchedAt: customDate ? new Date(customDate).toISOString() : undefined
      });
      onUpdate(data.progress, data.promptSeasonRatingNumber);
    } catch (err) {
      console.error("Failed to increment episode", err);
    } finally {
      setIncrementing(false);
    }
  }

  async function handleDecrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (decrementing || (currentSeason === 1 && currentEp === 1)) return;
    setDecrementing(true);

    try {
      const { data } = await api.put(`/progress/${progress.tmdbId}/decrement`);
      onUpdate(data.progress);
    } catch (err) {
      console.error("Failed to decrement episode", err);
    } finally {
      setDecrementing(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-3.5 sm:p-4 relative overflow-hidden border border-white/10 shadow-card group transition-all"
    >
      {/* Background Subtle Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-orange/10 rounded-full blur-2xl pointer-events-none group-hover:bg-accent-orange/20 transition-all" />

      <div className="flex gap-3.5 items-start">
        {/* Poster */}
        <Link to={`/show/${progress.tmdbId}`} className="relative shrink-0 rounded-xl overflow-hidden group/poster">
          <img
            src={tmdbImage(series?.posterPath, "w200")}
            alt={series?.name}
            className="w-20 h-28 sm:w-24 sm:h-34 object-cover rounded-xl transition-transform duration-300 group-hover/poster:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-end p-1.5 justify-center">
            <span className="text-[10px] font-semibold text-white/90">View Show</span>
          </div>
        </Link>

        {/* Info & Controls */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              {/* Platform Pill */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${platformBadgeColor(progress.platform)}`}>
                {platformLabel(progress.platform)}
              </span>

              {/* Season / Overall Rating Badge */}
              {progress.overallRating ? (
                <div className="flex items-center gap-1 text-accent-yellow text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-yellow/10 border border-accent-yellow/30">
                  <Star className="w-3 h-3 fill-accent-yellow" />
                  <span>{progress.overallRating}</span>
                </div>
              ) : currentSeasonRating ? (
                <div className="flex items-center gap-1 text-accent-yellow text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-yellow/10 border border-accent-yellow/20">
                  <Star className="w-3 h-3 fill-accent-yellow" />
                  <span>S{currentSeason}: {currentSeasonRating.rating}</span>
                </div>
              ) : null}
            </div>

            {/* Show Title */}
            <Link to={`/show/${progress.tmdbId}`} className="block">
              <h3 className="text-base font-bold text-white truncate hover:text-accent-orange transition-colors font-display">
                {series?.name}
              </h3>
            </Link>

            {/* Progress Text */}
            <div className="mt-1 flex items-center justify-between text-xs text-zinc-300 font-medium">
              <span className="text-accent-orange font-semibold">
                S{currentSeason} E{currentEp} <span className="text-zinc-500 font-normal">({totalWatchedEps}/{overallTotalEps} total eps)</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">{overallPercent}%</span>
            </div>
          </div>

          {/* Visual Progress Bar calculated from Total Episodes Watched */}
          <div className="my-2.5">
            <div className="w-full h-2.5 bg-base-900 rounded-full overflow-hidden p-0.5 border border-white/5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-accent-red via-accent-orange to-accent-yellow rounded-full shadow-glow"
              />
            </div>
          </div>

          {/* Inline Date Picker for +1 Ep */}
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-base-950 border border-accent-orange/30">
                  <Calendar className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={watchedAt}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setWatchedAt(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleIncrement(watchedAt)}
                    className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title="Confirm"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="p-1 rounded-lg bg-base-800 text-zinc-400 hover:text-white transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {/* Quick -1 Episode Button */}
            <button
              onClick={handleDecrement}
              disabled={decrementing || (currentSeason === 1 && currentEp === 1)}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-base-800 hover:bg-base-700 text-zinc-300 border border-white/10 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
              title="Decrease Episode (-1)"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>1 Ep</span>
            </button>

            {/* Quick +1 Episode Button — click opens date picker */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDatePicker((v) => !v);
              }}
              disabled={incrementing}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl bg-accent-orange/20 hover:bg-accent-orange/30 text-accent-orange border border-accent-orange/30 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{incrementing ? "..." : "1 Ep"}</span>
            </button>

            {/* Rate Season Button / Prompt */}
            <button
              onClick={() => onRateSeasonClick(currentSeason)}
              className={`flex items-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                isSeasonComplete && !currentSeasonRating
                  ? "bg-accent-yellow/20 hover:bg-accent-yellow/30 text-accent-yellow border-accent-yellow/50 animate-pulse"
                  : "bg-base-800 hover:bg-base-700 text-zinc-300 border-white/10"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{currentSeasonRating ? `S${currentSeason}: ★${currentSeasonRating.rating}` : "Rate S" + currentSeason}</span>
            </button>

            <Link
              to={`/show/${progress.tmdbId}`}
              className="p-1.5 rounded-xl bg-base-800 hover:bg-base-700 text-zinc-400 hover:text-white border border-white/10 transition-colors shrink-0"
              title="Show Details"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
