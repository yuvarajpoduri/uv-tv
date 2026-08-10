import { Response } from "express";
import Watchlist from "../models/Watchlist.js";
import WatchProgress from "../models/WatchProgress.js";
import { AuthRequest } from "../middleware/auth.js";
import { findOrCreateSeries } from "./seriesController.js";

export async function getWatchlist(req: AuthRequest, res: Response) {
  const list = await Watchlist.find({ userId: req.userId })
    .populate("seriesId")
    .sort({ createdAt: -1 });

  res.json(list);
}

export async function addToWatchlist(req: AuthRequest, res: Response) {
  const { tmdbId, plannedDate, priority, platform, notes } = req.body;
  if (!tmdbId) {
    res.status(400).json({ message: "tmdbId is required" });
    return;
  }

  const series = await findOrCreateSeries(tmdbId);

  let existing = await Watchlist.findOne({ userId: req.userId, seriesId: series._id });
  if (existing) {
    if (plannedDate !== undefined) existing.plannedDate = plannedDate;
    if (priority) existing.priority = priority;
    if (platform !== undefined) existing.platform = platform;
    if (notes !== undefined) existing.notes = notes;
    await existing.save();
    await existing.populate("seriesId");
    res.json(existing);
    return;
  }

  const created = await Watchlist.create({
    userId: req.userId,
    seriesId: series._id,
    plannedDate,
    priority: priority || "medium",
    platform: platform || "",
    notes: notes || ""
  });

  await created.populate("seriesId");
  res.status(201).json(created);
}

export async function removeFromWatchlist(req: AuthRequest, res: Response) {
  const tmdbId = Number(req.params.tmdbId);
  const series = await findOrCreateSeries(tmdbId);
  await Watchlist.findOneAndDelete({ userId: req.userId, seriesId: series._id });
  res.json({ message: "Removed from watchlist" });
}
