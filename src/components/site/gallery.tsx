"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import type { MediaRef } from "@/lib/content/queries";

/** Masonry-style photo grid with an accessible full-screen viewer (native <dialog>). */
export function Gallery({ photos }: { photos: MediaRef[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    el.addEventListener("keydown", onKey);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => open(i)}
              className="group block w-full overflow-hidden rounded-[var(--radius-card)] bg-surface-2"
            >
              <Image
                src={`/media/${p.key}`}
                alt={p.alt}
                width={p.width ?? 1600}
                height={p.height ?? 1067}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <span className="sr-only">View larger: {p.alt}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {current && (
          <figure className="flex h-full flex-col items-center justify-center gap-4 px-4 pb-6 pt-16">
            <div className="relative h-full w-full">
              <Image src={`/media/${current.key}`} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            {current.alt && <figcaption className="text-center text-sm text-white/75">{current.alt}</figcaption>}
          </figure>
        )}
        <button type="button" onClick={close} className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <X size={22} /> <span className="sr-only">Close</span>
        </button>
        <button type="button" onClick={() => step(-1)} className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <CaretLeft size={22} /> <span className="sr-only">Previous photo</span>
        </button>
        <button type="button" onClick={() => step(1)} className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <CaretRight size={22} /> <span className="sr-only">Next photo</span>
        </button>
      </dialog>
    </>
  );
}
