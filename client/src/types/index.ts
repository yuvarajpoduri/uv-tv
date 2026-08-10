export type OTTPlatform =
  | "netflix"
  | "prime"
  | "jiohotstar"
  | "sonyliv"
  | "zee5"
  | "appletv"
  | "jiocinema"
  | "youtube"
  | "tv"
  | "other-ott"
  | "other";

export interface User {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate?: string;
  posterPath?: string;
  overview?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath?: string | null;
}

export interface Series {
  _id?: string;
  id?: string;
  tmdbId: number;
  name: string;
  originalName?: string;
  tagline?: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  genres: string[];
  status: string;
  firstAirDate: string;
  networks?: string[];
  rating: number;
  voteCount?: number;
  creator?: string;
  creatorInfo?: { id?: number; profilePath?: string | null };
  cast?: string[];
  castInfo?: CastMember[];
  trailerKey?: string | null;
  watchProviders?: string[];
  seasonsSummary?: SeasonSummary[];
}

export interface SeasonRating {
  seasonNumber: number;
  rating: number;
  completedAt: string;
  review?: string;
  note?: string;
}

export interface EpisodeLog {
  seasonNumber: number;
  episodeNumber: number;
  watchedAt: string;
}

export interface WatchProgress {
  _id: string;
  userId: string;
  seriesId: Series;
  tmdbId: number;
  platform: OTTPlatform;
  status: "watching" | "completed" | "on_hold" | "dropped";
  currentSeason: number;
  currentEpisode: number;
  totalEpisodesInCurrentSeason: number;
  seasonRatings: SeasonRating[];
  episodeLogs?: EpisodeLog[];
  overallRating?: number;
  isFavorite: boolean;
  notes?: string;
  startedAt: string;
  lastWatchedAt: string;
}

export interface WatchlistEntry {
  _id: string;
  userId: string;
  seriesId: Series;
  plannedDate?: string;
  priority: "low" | "medium" | "high";
  platform?: string;
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  name: string;
  planName?: string;
  cost?: number;
  billingCycle?: "monthly" | "yearly";
  renewalDate?: string;
  active: boolean;
  notes?: string;
}

export interface StatsData {
  totalShowsTracked: number;
  currentlyWatchingCount: number;
  completedShowsCount: number;
  totalSeasonsCompleted: number;
  totalEpisodesWatched: number;
  totalWatchTimeHours: number;
  totalWatchTimeDays: number;
  avgSeasonRating: number;
  topPlatform: string;
  platforms: Array<{ name: string; count: number }>;
  genres: Array<{ name: string; count: number }>;
  dailyCounts?: Record<string, number>;
  recentShows: WatchProgress[];
}

export interface Episode {
  id: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string;
  stillPath: string;
  runtime: number;
  voteAverage: number;
}
