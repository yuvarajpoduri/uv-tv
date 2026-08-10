import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Sparkles, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { WatchlistEntry } from "../types";
import { differenceInCalendarDays, isToday, isTomorrow } from "date-fns";
import { tmdbImage } from "../lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [nextRelease, setNextRelease] = useState<{
    title: string;
    tmdbId: number;
    backdropPath?: string;
    daysLabel: string;
    diffDays: number;
  } | null>(null);
  const [animatedFillDeg, setAnimatedFillDeg] = useState(0);
  const navbarRef = useRef<HTMLElement>(null);

  // Pin navbar to top of visual viewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let raf: number;
    function pin() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (navbarRef.current) {
          navbarRef.current.style.top = `${vv!.offsetTop + 12}px`;
        }
      });
    }
    vv.addEventListener("resize", pin);
    vv.addEventListener("scroll", pin);
    return () => {
      vv.removeEventListener("resize", pin);
      vv.removeEventListener("scroll", pin);
      cancelAnimationFrame(raf);
    };
  }, []);

  const isSubPage =
    location.pathname.startsWith("/show/") ||
    location.pathname.startsWith("/person/") ||
    location.pathname === "/history" ||
    location.pathname === "/streaming" ||
    location.pathname === "/stats";

  useEffect(() => {
    let mounted = true;
    async function fetchNextWatchlistRelease() {
      try {
        const { data } = await api.get<WatchlistEntry[]>("/watchlist");
        if (!mounted || !data || data.length === 0) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const itemsWithDates = data
          .map((item) => {
            const rawDate = item.plannedDate || item.seriesId?.firstAirDate;
            if (!rawDate) return null;
            const parsed = new Date(rawDate);
            if (isNaN(parsed.getTime())) return null;
            return { item, date: parsed };
          })
          .filter((x): x is { item: WatchlistEntry; date: Date } => x !== null && x.date >= today)
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (itemsWithDates.length > 0) {
          const closest = itemsWithDates[0];
          const diffDays = differenceInCalendarDays(closest.date, today);
          let label = `In ${diffDays}d`;
          if (isToday(closest.date)) label = "Today!";
          else if (isTomorrow(closest.date)) label = "Tomorrow!";

          setNextRelease({
            title: closest.item.seriesId.name,
            tmdbId: closest.item.seriesId.tmdbId,
            backdropPath: closest.item.seriesId.backdropPath || closest.item.seriesId.posterPath || "",
            daysLabel: label,
            diffDays
          });
        }
      } catch {
        // silent
      }
    }

    fetchNextWatchlistRelease();
    const interval = setInterval(fetchNextWatchlistRelease, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!user) return null;

  const handleDisplay = `${user.username.toLowerCase()}.tv`;

  // Countdown progress
  const MAX_DAYS = 30;
  const progressPct = nextRelease
    ? nextRelease.diffDays === 0
      ? 100
      : Math.max(3, Math.min(97, ((MAX_DAYS - nextRelease.diffDays) / MAX_DAYS) * 100))
    : 0;
  const fillDeg = (progressPct / 100) * 360;

  useEffect(() => {
    if (!nextRelease) return;
    const target = fillDeg;
    const duration = 1400;
    const startTime = performance.now();
    let raf: number;

    function frame(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedFillDeg(eased * target);
      if (t < 1) raf = requestAnimationFrame(frame);
    }

    setAnimatedFillDeg(0);
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [nextRelease?.tmdbId]);

  let daysColorClass = "text-white/70 font-semibold";
  let borderColor = "rgba(255,255,255,0.3)";
  let trackColor = "rgba(255,255,255,0.06)";

  if (nextRelease) {
    if (nextRelease.diffDays === 0) {
      daysColorClass = "text-accent-yellow font-black tracking-wide";
      borderColor = "rgba(242,193,74,0.75)";
    } else if (nextRelease.diffDays === 1) {
      daysColorClass = "text-accent-yellow font-extrabold";
      borderColor = "rgba(242,193,74,0.65)";
    } else if (nextRelease.diffDays <= 3) {
      daysColorClass = "text-accent-orange font-bold";
      borderColor = "rgba(242,135,74,0.65)";
    } else if (nextRelease.diffDays <= 7) {
      daysColorClass = "text-accent-orange font-bold";
      borderColor = "rgba(242,135,74,0.6)";
    }
  }

  const featherDeg = Math.max(0, animatedFillDeg - 4);
  const borderBg = `conic-gradient(from -90deg, ${borderColor} ${featherDeg}deg, ${borderColor} ${animatedFillDeg}deg, ${trackColor} ${animatedFillDeg}deg)`;

  return (
    <header
      ref={navbarRef}
      id="main-navbar"
      className="fixed top-3 left-0 right-0 z-40 flex justify-center px-4 sm:px-6 pointer-events-none"
    >
      <div className="glass rounded-full shadow-card px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-3 pointer-events-auto border border-white/10 backdrop-blur-2xl w-full max-w-5xl">
        {/* Brand / Back */}
        <div className="flex items-center gap-2 shrink-0">
          {isSubPage && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 shrink-0"
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <Link to="/" className="flex items-center group shrink-0 px-1">
            <span className="font-display text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-accent-orange bg-clip-text text-transparent group-hover:from-accent-orange group-hover:to-accent-yellow transition-all">
              {handleDisplay}
            </span>
          </Link>
        </div>

        {/* Countdown badge — conic-gradient thin border */}
        {nextRelease ? (
          <button
            onClick={() => navigate(`/show/${nextRelease.tmdbId}`)}
            title={`Next: ${nextRelease.title}`}
            className={`shrink-0 rounded-xl p-[1px] transition-all hover:scale-105 active:scale-95${
              nextRelease.diffDays === 0 ? " animate-released-burst" : ""
            }`}
            style={{ background: borderBg }}
          >
            <div className="bg-base-800 rounded-[11px] px-2 py-1 flex items-center gap-2">
              {nextRelease.backdropPath ? (
                <div className="w-11 h-6 rounded-md overflow-hidden bg-base-900 shrink-0">
                  <img
                    src={tmdbImage(nextRelease.backdropPath, "w300")}
                    alt={nextRelease.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Clock size={15} className="text-accent-yellow" />
              )}
              <span className={`text-xs tracking-wide whitespace-nowrap ${daysColorClass}`}>
                {nextRelease.diffDays === 0 ? "📺 Released!" : nextRelease.daysLabel}
              </span>
            </div>
          </button>
        ) : (
          <Link
            to="/watchlist"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <Sparkles size={13} className="text-accent-yellow" />
            <span>Watchlist Ready</span>
            <ChevronRight size={12} className="text-white/30" />
          </Link>
        )}

        {/* Logout */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red/20 text-xs font-bold transition-all active:scale-95"
            title="Log out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline text-xs">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
