import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv, Check } from "lucide-react";
import { OTTPlatform, Series } from "../types";
import { api } from "../lib/api";

interface LogTVModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: Series;
  initialPlatform?: OTTPlatform;
  initialSeason?: number;
  initialEpisode?: number;
  onSuccess: () => void;
}

const PLATFORMS: Array<{ id: OTTPlatform; label: string; bg: string }> = [
  { id: "netflix", label: "Netflix", bg: "bg-red-950/80 text-red-300 border-red-800/60" },
  { id: "prime", label: "Prime Video", bg: "bg-blue-950/80 text-blue-300 border-blue-800/60" },
  { id: "jiohotstar", label: "JioHotstar", bg: "bg-indigo-950/80 text-indigo-300 border-indigo-800/60" },
  { id: "sonyliv", label: "Sony LIV", bg: "bg-orange-950/80 text-orange-300 border-orange-800/60" },
  { id: "zee5", label: "Zee5", bg: "bg-purple-950/80 text-purple-300 border-purple-800/60" },
  { id: "appletv", label: "Apple TV+", bg: "bg-zinc-800 text-zinc-200 border-zinc-700" },
  { id: "jiocinema", label: "JioCinema", bg: "bg-pink-950/80 text-pink-300 border-pink-800/60" },
  { id: "youtube", label: "YouTube", bg: "bg-red-900/60 text-red-300 border-red-700/60" },
  { id: "tv", label: "Live TV", bg: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60" },
  { id: "other-ott", label: "Other OTT", bg: "bg-base-800 text-zinc-300 border-zinc-700" }
];

export default function LogTVModal({
  isOpen,
  onClose,
  series,
  initialPlatform = "netflix",
  initialSeason = 1,
  initialEpisode = 1,
  onSuccess
}: LogTVModalProps) {
  const [platform, setPlatform] = useState<OTTPlatform>(initialPlatform);
  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [watchedAt, setWatchedAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPlatform(initialPlatform || "netflix");
    setSeason(initialSeason || 1);
    setEpisode(initialEpisode || 1);
    setWatchedAt(new Date().toISOString().slice(0, 10));
  }, [initialPlatform, initialSeason, initialEpisode, isOpen]);

  if (!isOpen) return null;

  const maxSeasons = series.numberOfSeasons || 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/progress/start", {
        tmdbId: series.tmdbId,
        platform,
        currentSeason: season,
        currentEpisode: episode,
        watchedAt: watchedAt ? new Date(watchedAt).toISOString() : undefined
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to log show", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pb-28 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-base-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto no-scrollbar my-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-base-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-xs font-semibold mb-2">
                <Tv className="w-3.5 h-3.5" />
                <span>Track Series</span>
              </div>
              <h2 className="text-xl font-bold text-white font-display pr-6">{series.name}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{series.numberOfSeasons} Seasons • {series.numberOfEpisodes || "Multiple"} Episodes</p>
            </div>

            {/* OTT Platform Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Select OTT Platform / Source
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                {PLATFORMS.map((p) => {
                  const selected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all flex items-center justify-center gap-1 ${
                        selected
                          ? "bg-accent-orange text-white border-accent-orange shadow-glow"
                          : p.bg
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Season & Episode Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Starting Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(Number(e.target.value))}
                  className="w-full bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors"
                >
                  {Array.from({ length: maxSeasons }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      Season {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Starting Episode</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={episode}
                  onChange={(e) => setEpisode(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
            </div>

            {/* Watched Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">📅 Date Started Watching</label>
              <input
                type="date"
                value={watchedAt}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setWatchedAt(e.target.value)}
                className="w-full bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange transition-colors"
              />
              <p className="text-[10px] text-zinc-500 mt-1">This date will be used as the watch date for this episode.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-base-800 hover:bg-base-700 text-zinc-300 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-orange to-accent-yellow hover:opacity-90 text-white font-semibold text-sm shadow-glow transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Start Tracking"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
