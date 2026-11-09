"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/**
 * Live countdown to the conference. Nothing renders on the server (the time is only known
 * in the browser). Shows "happening now" during the event and hides afterwards.
 */
export function Countdown({ startsAt, endsAt, tone = "light" }: { startsAt: string; endsAt: string; tone?: "light" | "dark" }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  const cell = tone === "dark" ? "bg-white/8 ring-1 ring-white/12" : "bg-card ring-1 ring-line";
  const sub = tone === "dark" ? "text-white/60" : "text-ink-3";

  if (now === null) return <div className="h-[4.5rem]" aria-hidden />;
  if (now >= end) return null;
  if (now >= start) {
    return (
      <p className="inline-flex h-[4.5rem] items-center gap-3 text-xl">
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember opacity-70" />
          <span className="relative inline-flex size-3 rounded-full bg-ember" />
        </span>
        Happening now
      </p>
    );
  }

  const p = parts(start - now);
  const cells: [number, string][] = [
    [p.days, "Days"],
    [p.hours, "Hours"],
    [p.minutes, "Minutes"],
    [p.seconds, "Seconds"],
  ];
  return (
    <div role="timer" aria-label={`${p.days} days, ${p.hours} hours and ${p.minutes} minutes to go`} className="inline-grid grid-cols-4 gap-2">
      {cells.map(([value, label]) => (
        <div key={label} className={`min-w-[4.25rem] rounded-2xl px-3 py-2.5 text-center ${cell}`}>
          <span className="block text-2xl tabular-nums leading-none tracking-tight">{label === "Days" ? value : String(value).padStart(2, "0")}</span>
          <span className={`mt-1.5 block text-[0.7rem] uppercase tracking-[0.06em] ${sub}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
