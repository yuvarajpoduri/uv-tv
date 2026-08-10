# uv.tv — TV Series & Season Tracker

`uv.tv` is a personal, single-user mobile-first TV show diary and season progress tracker. Search series via TMDB, track your episode & season progress with a dedicated visual progress bar, select OTT streaming platforms, rate individual seasons upon completion, compute overall series scores, manage watchlists, and view detailed TV statistics — all wrapped in a dark cinematic UI.

Based on the **`movie-log`** design system and visual identity.

---

## Features

- **TMDB TV Integration**: Search TV shows, trending/popular series, full details, season and episode listings, cast/crew info.
- **Single-User Authorized Account**: Tailored specifically for `uv` (`uv.tv`).
- **Home Page Progress Component**: Visual progress card for every show currently being watched displaying e.g. `Season 2 • Episode 5 / 10` with progress bar, quick "+1 Episode" increment button, and platform badge.
- **Season Ratings & Overall Series Score**:
  - Prompt/modal triggered automatically when a season's final episode is finished.
  - Granular season rating (0.5 to 5.0 stars) with optional review notes.
  - Automatically calculates overall show rating as the average of all rated seasons.
  - Displays both individual season ratings and overall series rating.
- **OTT Platform Tracking**: Tag shows with platforms (Netflix, Prime Video, Disney+ Hotstar, SonyLIV, Zee5, Apple TV+, JioCinema, YouTube, Live TV, etc.).
- **Watchlist**: Track planned TV shows with priority levels and target watch dates.
- **TV Statistics**: Episode counts, season counts, estimated watch time in hours and days, platform distribution, top genres, and average season ratings.
- **Dynamic Island Nav**: Mobile-first floating bottom navigation pill.
- **PWA & Offline Support**: Cache shell assets and TMDB poster images for offline usage.

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, date-fns, vite-plugin-pwa
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, TMDB API
- **Auth**: JWT in HTTP-only cookies, bcrypt password hashing

---

## Getting Started

### 1. Installation

```bash
# Clone or navigate to tv-log
cd tv-log

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tv-log
JWT_SECRET=tv_log_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
TMDB_API_KEY=your_tmdb_v3_api_key
USER_USERNAME=uv
USER_PASSWORD=uvpass
USER_NAME=uv
```

### 3. Seed Single User

```bash
cd server
npm run seed
```

### 4. Running Locally

Start backend and frontend in separate terminals:

```bash
# Terminal 1 (Backend)
cd server
npm run dev

# Terminal 2 (Frontend)
cd client
npm run dev
```

Visit `http://localhost:5173` and log in with username `uv` and password `uvpass`.
