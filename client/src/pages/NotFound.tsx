import { Link } from "react-router-dom";
import { Tv } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-base-900 border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
        <Tv className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h1 className="text-3xl font-extrabold text-white font-display mb-1">404</h1>
      <p className="text-xs text-zinc-400 max-w-xs mb-6">The page or TV show route you are looking for does not exist.</p>
      <Link
        to="/"
        className="py-2.5 px-5 rounded-xl bg-accent-purple text-white font-bold text-xs shadow-glow"
      >
        Return Home
      </Link>
    </div>
  );
}
