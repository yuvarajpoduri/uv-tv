import { Schema, model, Document, Types } from "mongoose";

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

export interface ISeasonRating {
  seasonNumber: number;
  rating: number;
  completedAt: Date;
  review?: string;
  note?: string;
}

export interface IEpisodeLog {
  seasonNumber: number;
  episodeNumber: number;
  watchedAt: Date;
}

export interface IWatchProgress extends Document {
  userId: Types.ObjectId;
  seriesId: Types.ObjectId;
  tmdbId: number;
  platform: OTTPlatform;
  status: "watching" | "completed" | "on_hold" | "dropped";
  currentSeason: number;
  currentEpisode: number;
  totalEpisodesInCurrentSeason: number;
  seasonRatings: ISeasonRating[];
  episodeLogs: IEpisodeLog[];
  overallRating?: number;
  isFavorite: boolean;
  notes?: string;
  startedAt: Date;
  lastWatchedAt: Date;
  createdAt: Date;
}

const seasonRatingSchema = new Schema<ISeasonRating>({
  seasonNumber: { type: Number, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  completedAt: { type: Date, default: Date.now },
  review: { type: String, default: "" },
  note: { type: String, default: "" }
});

const episodeLogSchema = new Schema<IEpisodeLog>({
  seasonNumber: { type: Number, required: true },
  episodeNumber: { type: Number, required: true },
  watchedAt: { type: Date, default: Date.now }
});

const watchProgressSchema = new Schema<IWatchProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seriesId: { type: Schema.Types.ObjectId, ref: "Series", required: true, index: true },
    tmdbId: { type: Number, required: true, index: true },
    platform: {
      type: String,
      enum: [
        "netflix",
        "prime",
        "jiohotstar",
        "sonyliv",
        "zee5",
        "appletv",
        "jiocinema",
        "youtube",
        "tv",
        "other-ott",
        "other"
      ],
      default: "netflix"
    },
    status: {
      type: String,
      enum: ["watching", "completed", "on_hold", "dropped"],
      default: "watching"
    },
    currentSeason: { type: Number, default: 1 },
    currentEpisode: { type: Number, default: 1 },
    totalEpisodesInCurrentSeason: { type: Number, default: 10 },
    seasonRatings: [seasonRatingSchema],
    episodeLogs: [episodeLogSchema],
    overallRating: { type: Number, min: 0, max: 5 },
    isFavorite: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    lastWatchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

watchProgressSchema.index({ userId: 1, status: 1, lastWatchedAt: -1 });

export default model<IWatchProgress>("WatchProgress", watchProgressSchema);
