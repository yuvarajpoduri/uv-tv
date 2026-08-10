import { Router } from "express";
import {
  search,
  trending,
  getById,
  getSeasonDetails,
  getPersonFilmography
} from "../controllers/seriesController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/search", requireAuth, search);
router.get("/trending", requireAuth, trending);
router.get("/person/:personId", requireAuth, getPersonFilmography);
router.get("/:tmdbId", requireAuth, getById);
router.get("/:tmdbId/season/:seasonNumber", requireAuth, getSeasonDetails);

export default router;
