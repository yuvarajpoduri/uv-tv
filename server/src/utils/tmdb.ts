import axios from "axios";
import dns from "dns";
import https from "https";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore if not supported in environment
}

const BASE_URLS = ["https://api.themoviedb.org/3", "https://api.tmdb.org/3"];

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 Hours cache

const httpsAgent = new https.Agent({
  keepAlive: true,
  family: 4
});

function client(baseURL: string) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not defined");
  return axios.create({
    baseURL,
    params: { api_key: apiKey },
    timeout: 5000,
    httpsAgent
  });
}

async function cachedGet(url: string, params: Record<string, any> = {}) {
  const key = url + JSON.stringify(params);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;

  for (const baseUrl of BASE_URLS) {
    try {
      const { data } = await client(baseUrl).get(url, { params });
      cache.set(key, { data, expires: Date.now() + CACHE_TTL });
      return data;
    } catch (err: any) {
      // Try next endpoint
    }
  }

  if (hit) {
    return hit.data;
  }

  if (url.includes("/search") || url.includes("/trending") || url.includes("/popular")) {
    return { results: [], total_pages: 0 };
  }
  if (url.includes("/credits")) {
    return { cast: [], crew: [] };
  }
  return {};
}

export async function searchTV(query: string, page = 1) {
  return cachedGet("/search/tv", { query, page, include_adult: false });
}

export async function getTrendingTV() {
  return cachedGet("/trending/tv/week");
}

export async function getPopularTV(page = 1) {
  return cachedGet("/tv/popular", { page });
}

export async function getTVDetails(tmdbId: number) {
  return cachedGet(`/tv/${tmdbId}`, {
    append_to_response: "credits,videos,watch/providers"
  });
}

export async function getTVSeasonDetails(tmdbId: number, seasonNumber: number) {
  return cachedGet(`/tv/${tmdbId}/season/${seasonNumber}`);
}

export async function getPersonDetails(personId: number) {
  return cachedGet(`/person/${personId}`);
}

export async function getPersonTVCredits(personId: number) {
  return cachedGet(`/person/${personId}/tv_credits`);
}

export async function searchPerson(query: string) {
  return cachedGet("/search/person", { query, include_adult: false });
}

export function mapSeriesSummary(s: any) {
  return {
    tmdbId: s.id,
    name: s.name || s.original_name || "",
    posterPath: s.poster_path || "",
    backdropPath: s.backdrop_path || "",
    overview: s.overview || "",
    firstAirDate: s.first_air_date || "",
    rating: s.vote_average ? Number((s.vote_average / 2).toFixed(1)) : 0
  };
}

export function mapSeriesDetails(s: any) {
  const creatorObj = s.created_by?.[0];
  const creator = creatorObj?.name || "";

  const rawCast = (s.credits?.cast || []).slice(0, 8);
  const cast = rawCast.map((c: any) => c.name);
  const castInfo = rawCast.map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character || "",
    profilePath: c.profile_path || null
  }));

  const trailer = (s.videos?.results || []).find(
    (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const providers = s["watch/providers"]?.results?.IN || s["watch/providers"]?.results?.US || {};
  const providerList = providers?.flatrate?.map((p: any) => p.provider_name) || [];

  const seasonsSummary = (s.seasons || [])
    .filter((sec: any) => sec.season_number > 0)
    .map((sec: any) => ({
      seasonNumber: sec.season_number,
      name: sec.name || `Season ${sec.season_number}`,
      episodeCount: sec.episode_count || 0,
      airDate: sec.air_date || "",
      posterPath: sec.poster_path || "",
      overview: sec.overview || ""
    }));

  return {
    tmdbId: s.id,
    name: s.name || s.original_name || "",
    originalName: s.original_name || "",
    tagline: s.tagline || "",
    posterPath: s.poster_path || "",
    backdropPath: s.backdrop_path || "",
    overview: s.overview || "",
    numberOfSeasons: s.number_of_seasons || seasonsSummary.length || 1,
    numberOfEpisodes: s.number_of_episodes || 0,
    genres: (s.genres || []).map((g: any) => g.name),
    status: s.status || "Ended",
    firstAirDate: s.first_air_date || "",
    networks: (s.networks || []).map((n: any) => n.name),
    rating: s.vote_average ? Number((s.vote_average / 2).toFixed(1)) : 0,
    voteCount: s.vote_count || 0,
    creator,
    cast,
    castInfo,
    trailerKey: trailer?.key || null,
    watchProviders: providerList,
    seasonsSummary
  };
}
