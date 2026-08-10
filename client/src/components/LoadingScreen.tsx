import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tv } from "lucide-react";

export default function LoadingScreen() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-base-950 flex items-center justify-center px-6">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <Tv size={36} className="text-accent-orange" />
        <span className="text-sm text-white/50 font-display tracking-wide">Loading the reel…</span>
        {slow && (
          <span className="text-xs text-white/30 max-w-xs">
            The server may be waking up from sleep — this can take up to a minute on the free tier.
          </span>
        )}
      </motion.div>
    </div>
  );
}
