import { Response } from "express";
import Series from "../models/Series.js";
import WatchProgress from "../models/WatchProgress.js";
import Watchlist from "../models/Watchlist.js";
import { AuthRequest } from "../middleware/auth.js";
import * as tmdb from "../utils/tmdb.js";

function isMainstreamTVSeries(s: any): boolean {
  if (!s || (!s.id && !s.tmdbId)) return false;

  // Media type check if present
  if (s.media_type && s.media_type === "movie") return false;

  // Genre check (99 is TMDB genre ID for Documentary)
  if (Array.isArray(s.genre_ids) && s.genre_ids.includes(99)) return false;

  const title = (s.name || s.title || s.original_name || "").toLowerCase();
  const character = (s.character || "").toLowerCase();

  const forbiddenKeywords = [
    "behind the scenes",
    "the making of",
    "making of",
    "documentary",
    "b-roll",
    "interview",
    "archive footage",
    "special thanks",
    "retrospective",
    "bloopers",
    "deleted scenes",
    "trailer",
    "featurette",
    "reunion"
  ];

  for (const kw of forbiddenKeywords) {
    if (title.includes(kw) || character.includes(kw)) return false;
  }

  if (
    character === "himself" ||
    character === "herself" ||
    character === "self" ||
    character.startsWith("himself -") ||
    character.startsWith("herself -") ||
    character.startsWith("himself (") ||
    character.startsWith("herself (")
  ) {
    return false;
  }

  return true;
}

export async function findOrCreateSeries(tmdbId: number) {
  let series = await Series.findOne({ tmdbId });
  if (series) return series;
  const details = await tmdb.getTVDetails(tmdbId);
  const mapped = tmdb.mapSeriesDetails(details);
  series = await Series.create(mapped);
  return series;
}

export async function search(req: AuthRequest, res: Response) {
  const query = String(req.query.q || "");
  const page = Number(req.query.page || 1);

  if (!query.trim()) {
    const data = await tmdb.getPopularTV(page);
    const filtered = (data?.results || []).filter(isMainstreamTVSeries).map(tmdb.mapSeriesSummary);
    res.json({
      results: filtered,
      totalPages: data?.total_pages || 1
    });
    return;
  }

  const data = await tmdb.searchTV(query, page);
  const filtered = (data?.results || []).filter(isMainstreamTVSeries).map(tmdb.mapSeriesSummary);
  res.json({
    results: filtered,
    totalPages: data?.total_pages || 1
  });
}

export async function trending(req: AuthRequest, res: Response) {
  const data = await tmdb.getTrendingTV();
  const filtered = (data?.results || []).filter(isMainstreamTVSeries).map(tmdb.mapSeriesSummary);
  res.json({ results: filtered });
}

export async function getById(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const details = await tmdb.getTVDetails(tmdbId);
  const mapped = tmdb.mapSeriesDetails(details);
  const series = await findOrCreateSeries(tmdbId);

  const [progress, watchlistEntry] = await Promise.all([
    WatchProgress.findOne({ userId: req.userId, seriesId: series._id }),
    Watchlist.findOne({ userId: req.userId, seriesId: series._id })
  ]);

  res.json({
    ...mapped,
    id: series.id,
    progress: progress || null,
    inWatchlist: !!watchlistEntry,
    watchlistEntry: watchlistEntry || null
  });
}

export async function getSeasonDetails(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const seasonNumber = Number(req.params.seasonNumber || 1);

  try {
    const seasonData = await tmdb.getTVSeasonDetails(tmdbId, seasonNumber);
    res.json({
      seasonNumber: seasonData.season_number || seasonNumber,
      name: seasonData.name || `Season ${seasonNumber}`,
      overview: seasonData.overview || "",
      airDate: seasonData.air_date || "",
      posterPath: seasonData.poster_path || "",
      episodes: (seasonData.episodes || []).map((ep: any) => ({
        id: ep.id,
        episodeNumber: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        airDate: ep.air_date,
        stillPath: ep.still_path || "",
        runtime: ep.runtime || 45,
        voteAverage: ep.vote_average ? Number((ep.vote_average / 2).toFixed(1)) : 0
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch season details" });
  }
}

export async function getPersonFilmography(req: AuthRequest, res: Response) {
  let personId = Number(req.params.personId);
  const nameQuery = String(req.query.name || "");

  if ((!personId || isNaN(personId)) && nameQuery.trim()) {
    try {
      const searchRes = await tmdb.searchPerson(nameQuery.trim());
      if (searchRes?.results?.[0]?.id) {
        personId = searchRes.results[0].id;
      }
    } catch {}
  }

  if (!personId) {
    res.status(400).json({ message: "Invalid person ID" });
    return;
  }

  try {
    const [personDetails, credits] = await Promise.all([
      tmdb.getPersonDetails(personId).catch(() => null),
      tmdb.getPersonTVCredits(personId).catch(() => null)
    ]);

    if (!credits) {
      res.status(404).json({ message: "Person not found" });
      return;
    }

    const castShows = (credits.cast || []).filter(isMainstreamTVSeries);
    const crewShows = (credits.crew || []).filter(isMainstreamTVSeries);

    const showMap = new Map<number, any>();
    [...castShows, ...crewShows].forEach((s: any) => {
      if (s.id && !showMap.has(s.id)) {
        showMap.set(s.id, {
          tmdbId: s.id,
          name: s.name || s.original_name,
          posterPath: s.poster_path || "",
          firstAirDate: s.first_air_date || "",
          rating: s.vote_average ? Number((s.vote_average / 2).toFixed(1)) : 0,
          character: s.character || "",
          job: s.job || (castShows.some((c: any) => c.id === s.id) ? "Actor" : "Creator/Crew")
        });
      }
    });

    const filmography = Array.from(showMap.values()).sort((a, b) => {
      return (b.firstAirDate || "").localeCompare(a.firstAirDate || "");
    });

    res.json({
      person: {
        id: personId,
        name: personDetails?.name || "Unknown",
        profilePath: personDetails?.profile_path || null,
        biography: personDetails?.biography || "",
        knownForDepartment: personDetails?.known_for_department || ""
      },
      shows: filmography
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch filmography" });
  }
}
