import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Sparkles, Check } from "lucide-react";
import { api } from "../lib/api";

interface SeasonRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  showTitle: string;
  seasonNumber: number;
  existingRating?: number;
  existingReview?: string;
  onSuccess: () => void;
}

export default function SeasonRatingModal({
  isOpen,
  onClose,
  tmdbId,
  showTitle,
  seasonNumber,
  existingRating = 4.5,
  existingReview = "",
  onSuccess
}: SeasonRatingModalProps) {
  const [rating, setRating] = useState<number>(existingRating);
  const [review, setReview] = useState<string>(existingReview);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setRating(existingRating || 4.5);
    setReview(existingReview || "");
    setSubmitted(false);
  }, [existingRating, existingReview, seasonNumber, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/progress/${tmdbId}/rate-season`, {
        seasonNumber,
        rating,
        review
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err) {
      console.error("Failed to rate season", err);
    } finally {
      setSaving(false);
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
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-base-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-accent-orange/20 text-accent-orange border border-accent-orange/40 flex items-center justify-center mb-4"
              >
                <Check className="w-8 h-8" />
              </motion.div>
              <h3 className="text-xl font-bold text-white font-display mb-1">Season {seasonNumber} Rated!</h3>
              <p className="text-sm text-zinc-400">Overall show rating updated automatically.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Season Completed!</span>
                </div>
                <h2 className="text-xl font-bold text-white font-display pr-6">Rate Season {seasonNumber}</h2>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">{showTitle}</p>
              </div>

              {/* Star Rating Selector */}
              <div className="bg-base-950 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-accent-yellow text-accent-yellow"
                            : star - 0.5 <= rating
                            ? "fill-accent-yellow/50 text-accent-yellow"
                            : "text-zinc-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-lg font-bold text-accent-yellow flex items-center gap-1">
                  <span>★ {rating.toFixed(1)}</span>
                  <span className="text-xs font-normal text-zinc-400">/ 5.0</span>
                </div>

                {/* Granular Slider for half stars */}
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full mt-3 accent-accent-orange cursor-pointer"
                />
              </div>

              {/* Review Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Season Review / Thoughts (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What did you think of this season?"
                  rows={3}
                  className="w-full bg-base-950 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent-orange/50 transition-colors resize-none"
                />
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
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-orange via-accent-orange to-accent-yellow hover:opacity-90 text-white font-semibold text-sm shadow-glow transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Season Rating"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
