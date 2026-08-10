import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import SeriesCard from "../components/SeriesCard";
import { SeriesCardSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import { Series } from "../types";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Series[]>([]);
  const [trending, setTrending] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    async function loadTrending() {
      try {
        const { data } = await api.get<{ results: Series[] }>("/series/trending");
        setTrending(data.results || []);
      } catch {}
    }
    loadTrending();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get<{ results: Series[] }>("/series/search", { params: { q: query } });
        setResults(data.results || []);
        setError(data.results.length === 0 ? "No TV series found" : "");
      } catch {
        setError("Something went wrong searching");
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  return (
    <div className="px-4 sm:px-6 pt-4 pb-28 safe-top max-w-5xl mx-auto">
      <h1 className="text-xl font-display font-bold text-white mb-4">Search TV Series</h1>
      <div className="relative mb-6">
        <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search TV series title, actor, or creator..."
          className="w-full bg-base-800 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white outline-none border border-white/5 focus:border-accent-orange/50 shadow-inner"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {!query && trending.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-accent-orange" />
            <h2 className="text-sm font-semibold text-white/80">Trending This Week</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {trending.map((s) => (
              <SeriesCard key={s.tmdbId} series={s} />
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SeriesCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && query && error && (
        <EmptyState icon={SearchIcon} title={error} description="Try checking your spelling or searching for a different title." />
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {results.map((s) => (
            <SeriesCard key={s.tmdbId} series={s} />
          ))}
        </div>
      )}
    </div>
  );
}
