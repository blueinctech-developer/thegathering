"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "@phosphor-icons/react";

/** YouTube embed that loads only when played (no third-party scripts or cookies until then). */
export function YouTube({ id, title, vertical = false }: { id: string; title: string; vertical?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const aspect = vertical ? "aspect-[9/16]" : "aspect-video";

  return (
    <div className={`relative overflow-hidden rounded-[var(--radius-card)] bg-ink/90 ${aspect}`}>
      {playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 size-full">
          <Image
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid size-[4.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-lg transition-transform duration-300 group-hover:scale-105">
            <Play size={26} weight="fill" className="ml-1" />
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}
