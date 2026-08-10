import { Router } from "express";
import {
  getActiveProgress,
  getAllProgress,
  getProgressByTmdbId,
  startTracking,
  updateProgress,
  incrementEpisode,
  decrementEpisode,
  rateSeason,
  stopWatching,
  resumeWatching,
  deleteProgress
} from "../controllers/progressController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/active", requireAuth, getActiveProgress);
router.get("/all", requireAuth, getAllProgress);
router.get("/:tmdbId", requireAuth, getProgressByTmdbId);
router.post("/start", requireAuth, startTracking);
router.put("/:tmdbId", requireAuth, updateProgress);
router.put("/:tmdbId/increment", requireAuth, incrementEpisode);
router.put("/:tmdbId/decrement", requireAuth, decrementEpisode);
router.put("/:tmdbId/stop", requireAuth, stopWatching);
router.put("/:tmdbId/resume", requireAuth, resumeWatching);
router.post("/:tmdbId/rate-season", requireAuth, rateSeason);
router.delete("/:tmdbId", requireAuth, deleteProgress);

export default router;
