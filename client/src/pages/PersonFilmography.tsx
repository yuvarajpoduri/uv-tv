import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Tv, User as UserIcon } from "lucide-react";
import { api } from "../lib/api";
import { tmdbImage } from "../lib/utils";
import SeriesCard from "../components/SeriesCard";
import LoadingScreen from "../components/LoadingScreen";

export default function PersonFilmography() {
  const { personId } = useParams<{ personId: string }>();
  const [data, setData] = useState<{ person: any; shows: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchPerson() {
    try {
      const { data } = await api.get(`/series/person/${personId}`);
      setData(data);
    } catch (err) {
      console.error("Failed to fetch person filmography", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPerson();
  }, [personId]);

  if (loading) return <LoadingScreen />;
  if (!data) return <div className="p-8 text-center text-white">Person not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Person Header */}
      <div className="glass rounded-3xl p-6 border border-white/10 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-base-900 shrink-0 border border-white/10">
          {data.person.profilePath ? (
            <img
              src={tmdbImage(data.person.profilePath, "w200")}
              alt={data.person.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              <UserIcon className="w-8 h-8" />
            </div>
          )}
        </div>
        <div>
          <span className="text-xs font-mono text-accent-purple font-semibold uppercase">{data.person.knownForDepartment || "TV Creator / Actor"}</span>
          <h1 className="text-2xl font-extrabold text-white font-display">{data.person.name}</h1>
          <p className="text-xs text-zinc-400 mt-1">{data.shows?.length || 0} TV Shows in credits</p>
        </div>
      </div>

      {/* Shows Grid */}
      <div>
        <h2 className="text-lg font-bold text-white font-display mb-4">TV Series Filmography</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.shows?.map((s) => (
            <SeriesCard key={s.tmdbId} series={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
