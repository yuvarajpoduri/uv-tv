import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import seriesRoutes from "./routes/seriesRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import subscriptionsRoutes from "./routes/subscriptionsRoutes.js";
import WatchProgress from "./models/WatchProgress.js";
import Watchlist from "./models/Watchlist.js";
import Subscription from "./models/Subscription.js";

const app = express();
const PORT = process.env.PORT || 5000;
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = rawClientUrl
  .split(",")
  .map((u) => u.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy error: Origin ${origin} not allowed by CLIENT_URL setting`));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ status: "ok", app: "uv.tv" }));

app.use("/api/auth", authRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);

app.use(notFound);
app.use(errorHandler);

async function migrateJioHotstar() {
  try {
    await WatchProgress.updateMany(
      { platform: { $in: ["disney", "hotstar", "Disney+", "Hotstar", "Disney+ Hotstar", "disney+"] } },
      { $set: { platform: "jiohotstar" } }
    );
    await Watchlist.updateMany(
      { platform: { $in: ["disney", "hotstar", "Disney+", "Hotstar", "Disney+ Hotstar", "disney+"] } },
      { $set: { platform: "jiohotstar" } }
    );
    await Subscription.updateMany(
      { name: { $in: ["Disney+", "Hotstar", "Disney+ Hotstar", "disney", "hotstar"] } },
      { $set: { name: "JioHotstar" } }
    );
  } catch (e) {
    console.error("Migration JioHotstar notice:", e);
  }
}

async function start() {
  await connectDB();
  await migrateJioHotstar();
  app.listen(PORT, () => console.log(`uv.tv server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
