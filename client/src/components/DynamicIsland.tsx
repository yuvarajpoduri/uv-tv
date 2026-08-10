import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, History as HistoryIcon, Bookmark, BarChart3, Tv } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/search", label: "Search", icon: Search },
  { path: "/history", label: "History", icon: HistoryIcon },
  { path: "/watchlist", label: "Watchlist", icon: Bookmark },
  { path: "/streaming", label: "OTT", icon: Tv },
  { path: "/stats", label: "Stats", icon: BarChart3 }
];

export default function DynamicIsland() {
  const location = useLocation();

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none safe-bottom">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="pointer-events-auto glass rounded-full p-1.5 border border-white/10 shadow-2xl flex items-center gap-1 bg-base-950/90 backdrop-blur-2xl"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative px-3 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors group"
            >
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-0 bg-accent-orange/20 border border-accent-orange/40 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-4 h-4 relative z-10 transition-colors ${
                  isActive ? "text-accent-orange" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              <span
                className={`relative z-10 hidden md:inline transition-colors ${
                  isActive ? "text-white font-bold" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
