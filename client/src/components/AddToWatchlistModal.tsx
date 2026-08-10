import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, Calendar } from "lucide-react";
import { Series } from "../types";
import { api } from "../lib/api";

interface AddToWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: Series;
  onSuccess: () => void;
}

export default function AddToWatchlistModal({
  isOpen,
  onClose,
  series,
  onSuccess
}: AddToWatchlistModalProps) {
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [plannedDate, setPlannedDate] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/watchlist", {
        tmdbId: series.tmdbId,
        priority,
        plannedDate: plannedDate || undefined,
        platform,
        notes
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to add to watchlist", err);
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-xs font-semibold mb-2">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Add to Watchlist</span>
              </div>
              <h2 className="text-xl font-bold text-white font-display pr-6">{series.name}</h2>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      priority === p
                        ? "bg-accent-orange text-white border-accent-orange shadow-glow"
                        : "bg-base-950 text-zinc-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent-orange" />
                <span>Planned Watch Date (Optional)</span>
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Recommended by friend, releases in Oct..."
                className="w-full bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent-orange"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-base-800 text-zinc-300 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold text-sm shadow-glow"
              >
                {loading ? "Saving..." : "Add to Watchlist"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
