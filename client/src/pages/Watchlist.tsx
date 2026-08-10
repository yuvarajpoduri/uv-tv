import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ArrowUpDown, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { WatchlistEntry } from "../types";
import { tmdbImage, countdownLabel } from "../lib/utils";
import EmptyState from "../components/EmptyState";

type SortKey = "planned" | "priority" | "recent" | "rating";

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("planned");

  useEffect(() => {
    api
      .get("/watchlist")
      .then(({ data }) => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteWatchlist(tmdbId?: number, e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!tmdbId) return;
    if (!window.confirm("Are you sure you want to remove this show from your watchlist?")) return;
    try {
      await api.delete(`/watchlist/${tmdbId}`);
      setItems((prev) => prev.filter((item) => item.seriesId?.tmdbId !== tmdbId));
    } catch {}
  }

  const priorityRank = { high: 0, medium: 1, low: 2 };

  const validItems = items.filter((item) => item && item.seriesId);

  const sorted = [...validItems].sort((a, b) => {
    if (sort === "planned") {
      if (!a.plannedDate && !b.plannedDate) return 0;
      if (!a.plannedDate) return 1;
      if (!b.plannedDate) return -1;
      return new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime();
    }
    if (sort === "priority") return priorityRank[a.priority] - priorityRank[b.priority];
    if (sort === "rating") return (b.seriesId?.rating || 0) - (a.seriesId?.rating || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="px-5 pt-6 safe-top max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-display font-bold text-white">Watchlist</h1>
        <SortMenu sort={sort} setSort={setSort} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28 bg-base-800 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your watchlist is empty"
          description="Keep track of TV series you want to watch later. Search for a show and tap Add to Watchlist."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((item) => {
            const series = item.seriesId;
            if (!series) return null;
            return (
              <Link key={item._id} to={`/show/${series.tmdbId}`} className="block">
                <div className="glass rounded-2xl p-3 flex gap-3 items-center border border-white/10 hover:border-white/20 transition-all">
                  <div className="w-16 h-24 rounded-xl overflow-hidden shrink-0 bg-base-800 shadow-md">
                    {series.posterPath && (
                      <img src={tmdbImage(series.posterPath, "w200")} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{series.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{series.numberOfSeasons} Seasons • {series.firstAirDate?.slice(0, 4)}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.plannedDate && (
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-accent-orange/15 text-accent-orange border border-accent-orange/20">
                          {countdownLabel(item.plannedDate)}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.priority === "high"
                            ? "bg-accent-red/15 text-accent-red border border-accent-red/20"
                            : item.priority === "medium"
                            ? "bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/20"
                            : "bg-white/5 text-white/40 border border-white/10"
                        }`}
                      >
                        {item.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteWatchlist(series.tmdbId, e)}
                    className="p-2 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red/20 text-xs shrink-0 active:scale-95 transition-all shadow-sm"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <div className="h-24" />
    </div>
  );
}

function SortMenu({ sort, setSort }: { sort: SortKey; setSort: (s: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const options: { value: SortKey; label: string }[] = [
    { value: "planned", label: "Planned Date" },
    { value: "priority", label: "Priority" },
    { value: "recent", label: "Recently Added" },
    { value: "rating", label: "Rating" }
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="glass rounded-full p-2.5 text-white/60">
        <ArrowUpDown size={15} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 glass rounded-2xl overflow-hidden z-20 w-40 border border-white/10 shadow-2xl">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                setSort(o.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 text-xs font-semibold ${
                sort === o.value ? "text-accent-orange bg-accent-orange/10" : "text-white/60 hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
