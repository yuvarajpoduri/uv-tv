import { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  Clock3,
  Flame,
  Star,
  Award,
  Tv,
  Sparkles,
  TrendingUp,
  Calendar,
  Layers,
  Activity
} from "lucide-react";
import { api } from "../lib/api";
import { StatsData } from "../types";
import { platformLabel } from "../lib/utils";
import LoadingScreen from "../components/LoadingScreen";

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const { data } = await api.get<StatsData>("/stats").catch(() => ({ data: null }));
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingScreen />;
  if (!stats) return null;

  return (
    <div className="px-4 sm:px-6 pt-4 pb-28 space-y-8 max-w-5xl mx-auto">
      {/* Top 4 Big Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          icon={<Tv size={18} />}
          accent="orange"
          label="Tracked Shows"
          value={`${stats.totalShowsTracked}`}
          subtext={`${stats.currentlyWatchingCount} active, ${stats.completedShowsCount} completed`}
        />
        <StatCard
          icon={<Clock3 size={18} />}
          accent="blue"
          label="Watch Time"
          value={`${stats.totalWatchTimeHours}h`}
          subtext={`~${stats.totalWatchTimeDays} days of TV watched`}
        />
        <StatCard
          icon={<Star size={18} />}
          accent="yellow"
          label="Avg Rating"
          value={`${stats.avgSeasonRating ? `★ ${stats.avgSeasonRating}` : "—"}`}
          subtext="Average season score"
        />
        <StatCard
          icon={<Layers size={18} />}
          accent="orange"
          label="Seasons Rated"
          value={`${stats.totalSeasonsCompleted}`}
          subtext="Total completed seasons"
        />
      </div>

      {/* Daily Watch Activity Heatmap */}
      <Section
        title="Daily Episodes Watched Heatmap"
        icon={<Activity size={16} className="text-accent-orange" />}
      >
        <ContributionHeatmap dailyCounts={stats.dailyCounts || {}} />
      </Section>

      {/* Top OTT Platforms Breakdown */}
      {stats.platforms && stats.platforms.length > 0 && (
        <Section
          title="Top OTT Platforms"
          icon={<Flame size={16} className="text-accent-orange" />}
        >
          <div className="space-y-2.5">
            {stats.platforms.map((p, idx) => {
              const maxCount = stats.platforms[0]?.count || 1;
              const pct = Math.round((p.count / maxCount) * 100) || 0;
              return (
                <div
                  key={p.name}
                  className="glass-card rounded-xl p-3 space-y-1.5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-white/30 text-[10px] font-mono">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {platformLabel(p.name)}
                    </span>
                    <span className="text-white/50 font-medium">
                      {p.count} {p.count === 1 ? "show" : "shows"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-orange to-accent-yellow rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Genre Preference Breakdown */}
      {stats.genres && stats.genres.length > 0 && (
        <Section
          title="Genre Preference Breakdown"
          icon={<Sparkles size={16} className="text-accent-yellow" />}
        >
          <div className="space-y-2.5">
            {stats.genres.map((g, idx) => {
              const maxCount = stats.genres[0]?.count || 1;
              const pct = Math.round((g.count / maxCount) * 100) || 0;
              return (
                <div
                  key={g.name}
                  className="glass-card rounded-xl p-3 space-y-1.5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-white/30 text-[10px] font-mono">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {g.name}
                    </span>
                    <span className="text-white/50 font-medium">
                      {g.count} {g.count === 1 ? "show" : "shows"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-red to-accent-orange rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Detailed Metrics */}
      <Section
        title="Detailed Metrics"
        icon={<TrendingUp size={16} className="text-accent-blue" />}
      >
        <div className="glass-card rounded-2xl divide-y divide-white/5 border border-white/10 overflow-hidden">
          <Row
            label="Total Tracked Shows"
            value={`${stats.totalShowsTracked}`}
            icon={<Tv size={13} className="text-accent-orange" />}
          />
          <Row
            label="Currently Watching"
            value={`${stats.currentlyWatchingCount} active shows`}
          />
          <Row
            label="Completed Shows"
            value={`${stats.completedShowsCount} shows`}
          />
          <Row
            label="Total Seasons Completed"
            value={`${stats.totalSeasonsCompleted} seasons`}
            icon={<Layers size={13} className="text-accent-yellow" />}
          />
          <Row
            label="Average Season Rating"
            value={stats.avgSeasonRating ? `★ ${stats.avgSeasonRating}` : "—"}
            icon={<Star size={13} className="text-accent-yellow" />}
          />
          <Row
            label="Total Watch Time"
            value={`${stats.totalWatchTimeHours} hours (~${stats.totalWatchTimeDays} days)`}
            icon={<Clock3 size={13} className="text-accent-blue" />}
          />
          <Row
            label="Top OTT Platform"
            value={stats.platforms[0] ? platformLabel(stats.platforms[0].name) : "—"}
            icon={<Flame size={13} className="text-accent-orange" />}
          />
          <Row
            label="Top TV Genre"
            value={stats.genres[0] ? stats.genres[0].name : "—"}
            icon={<Award size={13} className="text-accent-yellow" />}
          />
        </div>
      </Section>
    </div>
  );
}

function getLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// GitHub-Style Contribution Heatmap Component
function ContributionHeatmap({ dailyCounts }: { dailyCounts: Record<string, number> }) {
  const [selectedDay, setSelectedDay] = useState<{ dateStr: string; count: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const days: { dateStr: string; count: number }[] = [];
  const today = new Date();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  for (let i = 119; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateStr(d);
    days.push({
      dateStr,
      count: dailyCounts[dateStr] || 0,
    });
  }

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-1 min-w-[500px]">
          <div className="flex items-center justify-between text-[10px] text-white/40 mb-2 font-mono">
            <span>Past 4 months daily episodes watched (Click any day to view count)</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded bg-white/5 border border-white/5" />
              <div className="w-2.5 h-2.5 rounded bg-accent-orange/30 border border-accent-orange/40" />
              <div className="w-2.5 h-2.5 rounded bg-accent-orange/70 border border-accent-orange/80" />
              <div className="w-2.5 h-2.5 rounded bg-accent-yellow shadow-sm shadow-accent-yellow/40 border border-white/20" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-rows-7 grid-flow-col gap-1.5">
            {days.map(({ dateStr, count }) => {
              let color = "bg-white/5 border-white/5";
              if (count === 1) color = "bg-accent-orange/40 border-accent-orange/50";
              if (count === 2) color = "bg-accent-orange/80 border-accent-orange/90";
              if (count >= 3) color = "bg-accent-yellow border-white/30 shadow-md shadow-accent-yellow/40";

              const isSelected = selectedDay?.dateStr === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay({ dateStr, count })}
                  className={`w-3.5 h-3.5 rounded-sm border ${color} transition-all cursor-pointer hover:scale-125 ${
                    isSelected ? "ring-2 ring-white scale-125 z-10" : ""
                  }`}
                  title={`${dateStr}: ${count} ${count === 1 ? "episode" : "episodes"} watched`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-h-[36px] flex items-center">
        {selectedDay && (
          <div className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white">
            <span className="font-semibold text-white/70 flex items-center gap-1.5">
              <Calendar size={12} className="text-white/40" />
              {new Date(selectedDay.dateStr + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="font-extrabold text-accent-yellow bg-accent-yellow/15 px-2.5 py-0.5 rounded-full border border-accent-yellow/30">
              {selectedDay.count} {selectedDay.count === 1 ? "episode watched" : "episodes watched"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

const accentMap: Record<
  string,
  { text: string; bg: string; border: string; glow: string }
> = {
  orange: {
    text: "text-accent-orange",
    bg: "bg-accent-orange/10",
    border: "group-hover:border-accent-orange/40",
    glow: "group-hover:bg-accent-orange/20",
  },
  blue: {
    text: "text-accent-blue",
    bg: "bg-accent-blue/10",
    border: "group-hover:border-accent-blue/40",
    glow: "group-hover:bg-accent-blue/20",
  },
  yellow: {
    text: "text-accent-yellow",
    bg: "bg-accent-yellow/10",
    border: "group-hover:border-accent-yellow/40",
    glow: "group-hover:bg-accent-yellow/20",
  },
};

function StatCard({
  icon,
  accent,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  accent: "orange" | "blue" | "yellow";
  label: string;
  value: string;
  subtext: string;
}) {
  const a = accentMap[accent];
  return (
    <div
      className={`group relative overflow-hidden glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10 ${a.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
    >
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 ${a.glow} transition-opacity duration-300`}
      />
      <div className="relative flex items-center justify-between">
        <div
          className={`p-2 rounded-xl border border-white/10 ${a.bg} ${a.text}`}
        >
          {icon}
        </div>
      </div>
      <div className="relative mt-3">
        <p className="text-2xl font-display font-extrabold text-white leading-tight">
          {value}
        </p>
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-0.5">
          {label}
        </p>
        <p className="text-[10px] text-white/30 truncate mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors">
      <span className="text-xs text-white/50 flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className="text-xs text-white font-bold truncate max-w-[55%] text-right">
        {value}
      </span>
    </div>
  );
}
