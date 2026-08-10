import { Schema, model, Document, Types } from "mongoose";

export interface IWatchlist extends Document {
  userId: Types.ObjectId;
  seriesId: Types.ObjectId;
  plannedDate?: Date;
  priority: "low" | "medium" | "high";
  platform?: string;
  notes?: string;
  createdAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seriesId: { type: Schema.Types.ObjectId, ref: "Series", required: true, index: true },
    plannedDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    platform: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, seriesId: 1 }, { unique: true });

export default model<IWatchlist>("Watchlist", watchlistSchema);
