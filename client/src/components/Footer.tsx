import { useMemo } from "react";
import { randomFrom, FOOTER_QUOTES } from "../lib/quotes";

export default function Footer() {
  const quote = useMemo(() => randomFrom(FOOTER_QUOTES), []);
  return (
    <footer className="mt-10 mb-32 px-6 text-center">
      <p className="text-xs text-white/30 font-display italic">"{quote}"</p>
      <p className="text-[10px] text-white/15 mt-2">TV series data provided by TMDB</p>
    </footer>
  );
}
