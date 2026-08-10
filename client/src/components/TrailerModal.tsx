import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey?: string | null;
  title: string;
}

export default function TrailerModal({ isOpen, onClose, trailerKey, title }: TrailerModalProps) {
  if (!isOpen || !trailerKey) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md pb-24 sm:pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl bg-base-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
        >
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <h3 className="font-bold text-white text-base truncate font-display">{title} — Trailer</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-base-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
              title={`${title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
