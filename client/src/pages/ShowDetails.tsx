import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Bookmark,
  BookmarkCheck,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Tv,
  Plus,
  Layers,
  CheckCircle2,
  Clock,
  PauseCircle,
  RotateCcw,
  Trash2,
  Calendar,
  Check
} from "lucide-react";
import { api } from "../lib/api";
import { tmdbImage, formatDate } from "../lib/utils";
import { Series, WatchProgress, Episode } from "../types";
import LogTVModal from "../components/LogTVModal";
import SeasonRatingModal from "../components/SeasonRatingModal";
import AddToWatchlistModal from "../components/AddToWatchlistModal";
import TrailerModal from "../components/TrailerModal";
import LoadingScreen from "../components/LoadingScreen";

const DEFAULT_SYNOPSIS =
  "In this captivating TV series, unexpected twists and deep character journeys unfold across an unforgettable narrative. As secrets come to light, choices must be made that will alter the course of everything.";

export default function ShowDetailsPage() {
  const { tmdbId } = useParams();
  const idNum = Number(tmdbId);

  const [series, setSeries] = useState<Series | null>(null);
  const [progress, setProgress] = useState<WatchProgress | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [activeRatingSeasonNumber, setActiveRatingSeasonNumber] = useState<number>(1);

  // Accordions
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Record<number, Episode[]>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<Record<number, boolean>>({});
  const [showIncrementDatePicker, setShowIncrementDatePicker] = useState(false);
  const [incrementWatchedAt, setIncrementWatchedAt] = useState<string>(new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    if (!tmdbId) return;
    try {
      const { data } = await api.get(`/series/${tmdbId}`);
      setSeries(data);
      setProgress(data.progress || null);
      setInWatchlist(data.inWatchlist || false);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [tmdbId]);

  useEffect(() => {
    load();
  }, [load]);

  async function fetchSeasonEpisodes(seasonNumber: number) {
    if (seasonEpisodes[seasonNumber]) return;
    setLoadingEpisodes((prev) => ({ ...prev, [seasonNumber]: true }));
    try {
      const { data } = await api.get<{ episodes: Episode[] }>(`/series/${idNum}/season/${seasonNumber}`);
      setSeasonEpisodes((prev) => ({ ...prev, [seasonNumber]: data.episodes || [] }));
    } catch (err) {
      console.error(`Failed to fetch season ${seasonNumber} episodes`, err);
    } finally {
      setLoadingEpisodes((prev) => ({ ...prev, [seasonNumber]: false }));
    }
  }

  useEffect(() => {
    if (expandedSeason) {
      fetchSeasonEpisodes(expandedSeason);
    }
  }, [expandedSeason]);

  if (loading || !series) return <LoadingScreen />;

  const synopsisText = series.overview && series.overview.trim().length > 0 ? series.overview : DEFAULT_SYNOPSIS;
  const currentSeason = progress?.currentSeason || 1;
  const currentEp = progress?.currentEpisode || 1;
  const totalEpInSeason = progress?.totalEpisodesInCurrentSeason || 10;
  const seasonRatings = progress?.seasonRatings || [];
  const overallRating = progress?.overallRating;

  // Overall series progress calculation
  let totalWatchedEps = 0;
  if (series && Array.isArray(series.seasonsSummary)) {
    for (let s = 1; s < currentSeason; s++) {
      const sSum = series.seasonsSummary.find((ss) => ss.seasonNumber === s);
      totalWatchedEps += sSum?.episodeCount || 10;
    }
  } else {
    totalWatchedEps = (currentSeason - 1) * 10;
  }
  totalWatchedEps += currentEp;

  const overallTotalEps = series?.numberOfEpisodes || (series?.numberOfSeasons ? series.numberOfSeasons * 10 : totalEpInSeason);
  const overallPercent = Math.min(Math.round((totalWatchedEps / Math.max(1, overallTotalEps)) * 100), 100);

  function openRateSeason(seasonNum: number) {
    setActiveRatingSeasonNumber(seasonNum);
    setRatingModalOpen(true);
  }

  async function handleQuickIncrement(customDate?: string) {
    if (!progress) return;
    setShowIncrementDatePicker(false);
    try {
      const { data } = await api.put(`/progress/${idNum}/increment`, {
        watchedAt: customDate ? new Date(customDate).toISOString() : undefined
      });
      setProgress(data.progress);
      if (data.promptSeasonRatingNumber) {
        openRateSeason(data.promptSeasonRatingNumber);
      }
    } catch (err) {
      console.error("Failed to increment episode", err);
    }
  }

  async function handleStopWatching() {
    if (!progress) return;
    try {
      const { data } = await api.put(`/progress/${idNum}/stop`);
      setProgress(data.progress);
    } catch (err) {
      console.error("Failed to stop watching", err);
    }
  }

  async function handleResumeWatching() {
    if (!progress) return;
    try {
      const { data } = await api.put(`/progress/${idNum}/resume`);
      setProgress(data.progress);
    } catch (err) {
      console.error("Failed to resume watching", err);
    }
  }

  async function handleDeleteProgress() {
    if (!window.confirm(`Remove all watch data for "${series?.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/progress/${idNum}`);
      setProgress(null);
    } catch (err) {
      console.error("Failed to delete progress", err);
    }
  }

  return (
    <div className="pb-32 -mt-20 sm:-mt-24 max-w-5xl mx-auto w-full">
      {/* Hero Backdrop matching MovieDetails */}
      <div className="relative h-72 sm:h-80 w-full">
        {series.backdropPath ? (
          <img src={tmdbImage(series.backdropPath, "w780")} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-base-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-black/30" />
      </div>

      {/* Poster & Header info matching MovieDetails */}
      <div className="px-5 -mt-20 relative">
        <div className="flex gap-4">
          <div className="w-28 shrink-0 rounded-2xl overflow-hidden shadow-card border border-white/10">
            {series.posterPath ? (
              <img src={tmdbImage(series.posterPath, "w300")} className="w-full aspect-[2/3] object-cover" />
            ) : (
              <div className="w-full aspect-[2/3] bg-base-800 flex items-center justify-center text-white/30 text-xs font-bold">
                {series.name}
              </div>
            )}
          </div>
          <div className="flex-1 pt-16">
            <h1 className="text-xl font-display font-bold text-white leading-tight">{series.name}</h1>
            {series.tagline && <p className="text-xs text-white/40 italic mt-1">{series.tagline}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
              {series.rating > 0 && (
                <span className="flex items-center gap-1 text-accent-yellow font-bold">
                  <Star size={12} fill="currentColor" /> {series.rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Layers size={12} /> {series.numberOfSeasons} {series.numberOfSeasons === 1 ? "Season" : "Seasons"}
              </span>
              <span>{series.firstAirDate?.slice(0, 4)}</span>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mt-5 items-center">
          {progress && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-accent-orange/15 border border-accent-orange/30">
              <Eye size={12} className="text-accent-orange shrink-0" />
              <span className="text-accent-orange text-[11px] font-bold">Season {currentSeason} • Ep {currentEp}/{totalEpInSeason}</span>
              <span className="text-white text-[11px] font-black bg-accent-orange/35 px-1.5 py-0.5 rounded-md">{overallPercent}%</span>
            </div>
          )}

          {inWatchlist && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-accent-yellow/15 border border-accent-yellow/30">
              <Bookmark size={12} className="text-accent-yellow shrink-0" />
              <span className="text-accent-yellow text-[11px] font-bold">On Watchlist</span>
            </div>
          )}

          {overallRating && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-accent-yellow/15 border border-accent-yellow/30 text-accent-yellow text-[11px] font-bold">
              <Star size={12} fill="currentColor" />
              <span>Overall Score ★{overallRating}</span>
            </div>
          )}
        </div>

        {series.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {series.genres.map((g) => (
              <span key={g} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Synopsis Expandable */}
        <div className="mt-4">
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: synopsisExpanded ? "600px" : "72px" }}
          >
            <p className="text-sm text-white/70 leading-relaxed">
              {synopsisText}
            </p>
          </div>
          {synopsisText.length > 120 && (
            <button
              onClick={() => setSynopsisExpanded((prev) => !prev)}
              className="text-xs font-bold text-accent-orange hover:text-accent-orange/80 transition-colors inline-block mt-2 focus:outline-none"
            >
              {synopsisExpanded ? "View less" : "View more"}
            </button>
          )}
        </div>

        {/* Creator & Main Cast */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/50 font-display">
            Creator &amp; Main Cast
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {/* Creator */}
            {series.creator && (
              <Link
                to={`/person/${series.creatorInfo?.id || 0}?name=${encodeURIComponent(series.creator)}`}
                className="flex flex-col gap-1.5 shrink-0 group w-[72px] focus:outline-none"
              >
                <div className="w-[72px] h-[96px] rounded-lg overflow-hidden bg-base-800 border border-accent-orange/40 group-hover:border-accent-orange transition-all shadow-md flex items-center justify-center text-white/30 font-bold text-2xl">
                  {series.creatorInfo?.profilePath ? (
                    <img
                      src={tmdbImage(series.creatorInfo.profilePath, "w200")}
                      alt={series.creator}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    series.creator.charAt(0)
                  )}
                </div>
                <span className="text-[10px] font-extrabold line-clamp-1 leading-tight bg-gradient-to-r from-accent-orange to-yellow-300 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-accent-orange transition-all">
                  {series.creator}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md self-start bg-gradient-to-r from-accent-orange/30 to-yellow-500/20 border border-accent-orange/30 text-accent-orange">
                  Creator
                </span>
              </Link>
            )}

            {/* Cast */}
            {series.castInfo && series.castInfo.length > 0
              ? series.castInfo.slice(0, 6).map((c) => (
                  <Link
                    key={c.id || c.name}
                    to={`/person/${c.id || 0}?name=${encodeURIComponent(c.name)}`}
                    className="flex flex-col gap-1.5 shrink-0 group w-[72px] focus:outline-none"
                  >
                    <div className="w-[72px] h-[96px] rounded-lg overflow-hidden bg-base-800 border border-white/10 group-hover:border-white/30 transition-all shadow-md flex items-center justify-center text-white/30 font-bold text-2xl">
                      {c.profilePath ? (
                        <img
                          src={tmdbImage(c.profilePath, "w200")}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        c.name.charAt(0)
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white line-clamp-1 group-hover:text-white/80 transition-colors leading-tight">
                      {c.name}
                    </span>
                    {c.character && (
                      <span className="text-[9px] text-white/35 line-clamp-1 leading-tight -mt-0.5">
                        {c.character}
                      </span>
                    )}
                  </Link>
                ))
              : null}
          </div>
        </div>

        {series.trailerKey && (
          <button
            onClick={() => setTrailerModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-orange/15 border border-accent-orange/30 text-accent-orange hover:bg-accent-orange/25 text-xs font-semibold transition-all active:scale-95 shadow-sm"
          >
            <PlayCircle size={16} /> Watch Trailer
          </button>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <ActionButton
            icon={progress ? <Plus size={16} /> : <Tv size={16} />}
            label={progress ? "+1 Episode Watched" : "Start Tracking Series"}
            onClick={progress ? () => {
              setIncrementWatchedAt(new Date().toISOString().slice(0, 10));
              setShowIncrementDatePicker((v) => !v);
            } : () => setLogModalOpen(true)}
            primary
          />
          {inWatchlist ? (
            <ActionButton
              icon={<BookmarkCheck size={16} />}
              label="On Watchlist"
              onClick={() => setWatchlistModalOpen(true)}
            />
          ) : (
            <ActionButton
              icon={<Bookmark size={16} />}
              label="Add to Watchlist"
              onClick={() => setWatchlistModalOpen(true)}
            />
          )}
        </div>

        {/* Inline date picker for +1 Ep */}
        <AnimatePresence>
          {showIncrementDatePicker && progress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-base-950 border border-accent-orange/30">
                <Calendar size={14} className="text-accent-orange shrink-0" />
                <span className="text-xs text-white/60">Watched on:</span>
                <input
                  type="date"
                  value={incrementWatchedAt}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setIncrementWatchedAt(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                />
                <button
                  onClick={() => handleQuickIncrement(incrementWatchedAt)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent-orange text-white text-xs font-bold hover:opacity-90 transition-all active:scale-95"
                >
                  <Check size={12} /> Log
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Series management options when tracking */}
        {progress && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              {progress.status !== "on_hold" ? (
                <button
                  onClick={handleStopWatching}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-base-800 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 text-amber-400 text-xs font-semibold transition-all active:scale-95"
                >
                  <PauseCircle size={14} /> Stop Watching
                </button>
              ) : (
                <button
                  onClick={handleResumeWatching}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-base-800 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold transition-all active:scale-95"
                >
                  <RotateCcw size={14} /> Resume Watching
                </button>
              )}
              <button
                onClick={handleDeleteProgress}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-base-800 border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all active:scale-95"
              >
                <Trash2 size={14} /> Delete Series Log
              </button>
            </div>
          </div>
        )}
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-extrabold text-white/80 uppercase tracking-wider font-display">
            Seasons &amp; Episode Guide
          </h3>

          <div className="space-y-3">
            {series.seasonsSummary?.map((s) => {
              const isExpanded = expandedSeason === s.seasonNumber;
              const episodes = seasonEpisodes[s.seasonNumber] || [];
              const isEpLoading = loadingEpisodes[s.seasonNumber];

              // Calculate season completion progress
              let seasonStatus = "not-started";
              let seasonEpWatchedCount = 0;

              if (progress) {
                if (progress.currentSeason > s.seasonNumber) {
                  seasonStatus = "completed";
                  seasonEpWatchedCount = s.episodeCount;
                } else if (progress.currentSeason === s.seasonNumber) {
                  seasonStatus = "in-progress";
                  seasonEpWatchedCount = Math.min(progress.currentEpisode, s.episodeCount);
                }
              }

              const seasonPercent = Math.min(Math.round((seasonEpWatchedCount / Math.max(1, s.episodeCount)) * 100), 100);

              return (
                <div
                  key={s.seasonNumber}
                  className={`glass-card rounded-2xl border transition-all overflow-hidden ${
                    isExpanded ? "border-accent-orange/40 shadow-xl" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Minimalist Season Header Bar */}
                  <div
                    onClick={() => setExpandedSeason(isExpanded ? null : s.seasonNumber)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-base-800 border border-white/10 flex items-center justify-center shrink-0 font-display font-extrabold text-sm text-accent-orange shadow-md">
                        S{s.seasonNumber}
                      </div>
                      <h4 className="text-sm font-extrabold text-white font-display truncate">{s.name}</h4>
                    </div>

                    <div className="p-1 rounded-lg bg-base-800 text-white/50 shrink-0">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Season Progress Bar */}
                  <div className="w-full h-1.5 bg-base-950">
                    <div
                      className={`h-full transition-all duration-500 ${
                        seasonStatus === "completed"
                          ? "bg-emerald-500"
                          : seasonStatus === "in-progress"
                          ? "bg-accent-orange"
                          : "bg-transparent"
                      }`}
                      style={{ width: `${seasonPercent}%` }}
                    />
                  </div>

                  {/* Expanded Episode List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border-t border-white/5 bg-base-950/60 space-y-3"
                      >
                        {isEpLoading ? (
                          <div className="py-6 text-center text-xs text-white/40 font-mono animate-pulse">
                            Loading episode guide...
                          </div>
                        ) : episodes.length > 0 ? (
                          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                            {episodes.map((ep) => {
                              const isWatched =
                                progress &&
                                (progress.currentSeason > s.seasonNumber ||
                                  (progress.currentSeason === s.seasonNumber && ep.episodeNumber <= currentEp));

                              const epLog = progress?.episodeLogs?.find(
                                (log) => log.seasonNumber === s.seasonNumber && log.episodeNumber === ep.episodeNumber
                              );

                              return (
                                <div
                                  key={ep.id}
                                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                    isWatched
                                      ? "bg-base-900/80 border-emerald-500/25"
                                      : "bg-base-950/80 border-white/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                                        isWatched
                                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                          : "bg-base-800 text-white/40"
                                      }`}
                                    >
                                      {ep.episodeNumber}
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`text-xs font-bold truncate ${isWatched ? "text-white" : "text-white/70"}`}>
                                        {ep.name}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px]">
                                        {isWatched && (
                                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 size={10} className="text-emerald-400" />
                                            <span>Watched {epLog ? formatDate(epLog.watchedAt) : "logged"}</span>
                                          </span>
                                        )}
                                        {ep.airDate && (
                                          <span className="text-white/40 flex items-center gap-1">
                                            <Clock size={10} /> Airing: {ep.airDate}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-[10px] text-white/40 font-mono">{ep.runtime || 45}m</span>
                                    <div className="p-1">
                                      <CheckCircle2
                                        size={18}
                                        className={isWatched ? "text-emerald-400 fill-emerald-400/20" : "text-white/20"}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-white/40 py-3 text-center">
                            Episode details unavailable for this season.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LogTVModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        series={series}
        initialPlatform={progress?.platform || "netflix"}
        initialSeason={currentSeason}
        initialEpisode={currentEp}
        onSuccess={load}
      />

      <SeasonRatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        tmdbId={series.tmdbId}
        showTitle={series.name}
        seasonNumber={activeRatingSeasonNumber}
        existingRating={seasonRatings.find((sr) => sr.seasonNumber === activeRatingSeasonNumber)?.rating}
        existingReview={seasonRatings.find((sr) => sr.seasonNumber === activeRatingSeasonNumber)?.review}
        onSuccess={load}
      />

      <AddToWatchlistModal
        isOpen={watchlistModalOpen}
        onClose={() => setWatchlistModalOpen(false)}
        series={series}
        onSuccess={load}
      />

      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={series.trailerKey}
        title={series.name}
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary,
  full
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  full?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-semibold ${
        full ? "col-span-2" : ""
      } ${primary ? "bg-gradient-to-r from-accent-orange to-accent-yellow text-white shadow-glow" : "glass text-white/80"}`}
    >
      {icon} {label}
    </motion.button>
  );
}
