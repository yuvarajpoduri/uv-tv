import { Schema, model, Document } from "mongoose";

export interface ISeries extends Document {
  tmdbId: number;
  name: string;
  originalName?: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  genres: string[];
  status: string;
  firstAirDate: string;
  networks: string[];
  rating: number;
  voteCount: number;
  creator?: string;
  cast: string[];
  watchProviders: string[];
  seasonsSummary?: Array<{
    seasonNumber: number;
    name: string;
    episodeCount: number;
    airDate?: string;
    posterPath?: string;
    overview?: string;
  }>;
  createdAt: Date;
}

const seriesSchema = new Schema<ISeries>(
  {
    tmdbId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    originalName: { type: String },
    overview: { type: String, default: "" },
    posterPath: { type: String, default: "" },
    backdropPath: { type: String, default: "" },
    numberOfSeasons: { type: Number, default: 1 },
    numberOfEpisodes: { type: Number, default: 0 },
    genres: [{ type: String }],
    status: { type: String, default: "Ended" },
    firstAirDate: { type: String, default: "" },
    networks: [{ type: String }],
    rating: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    creator: { type: String, default: "" },
    cast: [{ type: String }],
    watchProviders: [{ type: String }],
    seasonsSummary: [
      {
        seasonNumber: { type: Number },
        name: { type: String },
        episodeCount: { type: Number },
        airDate: { type: String },
        posterPath: { type: String },
        overview: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default model<ISeries>("Series", seriesSchema);
