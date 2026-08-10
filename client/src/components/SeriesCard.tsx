import { motion } from "framer-motion";
import { Star, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import { tmdbImage } from "../lib/utils";
import { Series } from "../types";

interface Props {
  series: Series;
  badge?: string;
  userRating?: number;
}

export default function SeriesCard({ series, badge, userRating }: Props) {
  const year = series.firstAirDate ? series.firstAirDate.slice(0, 4) : "";

  return (
    <Link to={`/show/${series.tmdbId}`}>
      <motion.div
        whileTap={{ scale: 0.96 }}
        className="relative rounded-2xl overflow-hidden bg-base-800 shadow-card aspect-[2/3] group hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/10"
      >
        {series.posterPath ? (
          <img
            src={tmdbImage(series.posterPath, "w300")}
            alt={series.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-xs px-2 text-center font-bold">
            <Tv size={24} className="mb-1" />
            <span>{series.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

        {/* Top Left: User Rating or Badge */}
        {typeof userRating === "number" && userRating > 0 ? (
          <span className="absolute top-2 left-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-accent-orange to-accent-yellow text-white flex items-center gap-0.5 shadow-md border border-white/20 z-10">
            <Star size={10} className="fill-white" /> {userRating}
          </span>
        ) : (
          badge && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-orange/85 text-white shadow-sm z-10">
              {badge}
            </span>
          )
        )}

        {/* Top Right: TMDB Rating */}
        {series.rating > 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-accent-yellow flex items-center gap-0.5 border border-white/10 shadow-md z-10">
            <Star size={10} className="fill-accent-yellow" /> {series.rating.toFixed(1)}
          </span>
        )}

        {/* Bottom Title & Year */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
          <p className="text-xs font-extrabold text-white leading-tight line-clamp-2">{series.name}</p>
          {year && <p className="text-[10px] font-semibold text-white/50 mt-0.5">{year}</p>}
        </div>
      </motion.div>
    </Link>
  );
}
