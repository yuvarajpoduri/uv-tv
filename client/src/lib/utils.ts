import { format, differenceInCalendarDays, isToday, isTomorrow } from "date-fns";

export function tmdbImage(path?: string, size = "w500"): string {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return "";
  return format(new Date(dateStr), "d MMMM yyyy");
}

export function countdownLabel(dateStr: string): string {
  const target = new Date(dateStr);
  const days = differenceInCalendarDays(target, new Date());
  if (days < 0) return "OVERDUE";
  if (isToday(target)) return "TONIGHT";
  if (isTomorrow(target)) return "TOMORROW";
  if (days === 0) return "TODAY";
  return `${days} DAYS`;
}

export function platformLabel(platform: string) {
  const map: Record<string, string> = {
    netflix: "Netflix",
    prime: "Prime Video",
    jiohotstar: "JioHotstar",
    sonyliv: "Sony LIV",
    zee5: "Zee5",
    appletv: "Apple TV+",
    jiocinema: "JioCinema",
    youtube: "YouTube",
    tv: "Live TV",
    "other-ott": "Other OTT",
    other: "Other"
  };
  return map[platform] || platform;
}

export function platformBadgeColor(platform: string) {
  const map: Record<string, string> = {
    netflix: "bg-red-950/70 text-red-400 border-red-800/40",
    prime: "bg-blue-950/70 text-blue-400 border-blue-800/40",
    jiohotstar: "bg-indigo-950/70 text-indigo-300 border-indigo-800/40",
    sonyliv: "bg-orange-950/70 text-orange-400 border-orange-800/40",
    zee5: "bg-purple-950/70 text-purple-300 border-purple-800/40",
    appletv: "bg-zinc-800/80 text-zinc-200 border-zinc-700",
    jiocinema: "bg-pink-950/70 text-pink-400 border-pink-800/40",
    youtube: "bg-red-900/60 text-red-300 border-red-700/40",
    tv: "bg-emerald-950/70 text-emerald-300 border-emerald-800/40",
    "other-ott": "bg-base-800 text-zinc-300 border-zinc-700",
    other: "bg-base-800 text-zinc-300 border-zinc-700"
  };
  return map[platform] || "bg-base-800 text-zinc-300 border-zinc-700";
}

export function tvHandle(username?: string) {
  return username ? `${username.toLowerCase()}.tv` : "uv.tv";
}

export function currency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
