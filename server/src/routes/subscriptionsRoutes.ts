import { Router } from "express";
import {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription
} from "../controllers/subscriptionsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getSubscriptions);
router.post("/", requireAuth, addSubscription);
router.put("/:id", requireAuth, updateSubscription);
router.delete("/:id", requireAuth, deleteSubscription);

export default router;
