import { Router } from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from "../controllers/watchlistController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getWatchlist);
router.post("/", requireAuth, addToWatchlist);
router.delete("/:tmdbId", requireAuth, removeFromWatchlist);

export default router;
