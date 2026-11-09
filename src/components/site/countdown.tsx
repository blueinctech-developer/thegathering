"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/**
 * Live countdown to the start of the conference. Renders nothing on the server (the time is
 * only known in the browser), then shows "happening now" during the event and hides afterwards.
 */
export function Countdown({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);

  if (now === null) {
    return <div className="h-[4.25rem]" aria-hidden />;
  }
  if (now >= end) {
    return null;
  }
  if (now >= start) {
    return (
      <p className="flex h-[4.25rem] items-center gap-3 font-display text-2xl font-semibold">
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-accent" />
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
    <div role="timer" aria-label={`${p.days} days, ${p.hours} hours and ${p.minutes} minutes to go`} className="flex gap-5 sm:gap-7">
      {cells.map(([value, label]) => (
        <div key={label} className="min-w-[3.2rem]">
          <span className="block font-display text-4xl font-semibold tabular-nums leading-none tracking-tight">
            {label === "Days" ? value : String(value).padStart(2, "0")}
          </span>
          <span className="mt-2 block text-xs font-medium uppercase tracking-[0.08em] text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
