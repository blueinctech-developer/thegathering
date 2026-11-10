import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { MediaRef } from "@/lib/content/queries";
import { MediaImage } from "@/components/media-image";
import { Accent } from "./accent";

/** Centred section heading: heavy Archivo with a light italic accent phrase. */
export function SectionHead({
  title,
  intro,
  id,
  label,
  className = "",
}: {
  title: string;
  intro?: ReactNode;
  id?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      {label && <p className="t-label mb-5">{label}</p>}
      <h2 id={id} className="t-section">
        <Accent text={title} />
      </h2>
      {intro && <p className="t-lead mx-auto mt-5 max-w-[56ch]">{intro}</p>}
    </div>
  );
}

/** "See more" link with the round red arrow chip. */
export function ArrowLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  const body = (
    <>
      {children}
      <span className="chip" aria-hidden>
        <ArrowRight size={14} weight="bold" />
      </span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="arrow-link">
      {body}
    </a>
  ) : (
    <Link href={href} className="arrow-link">
      {body}
    </Link>
  );
}

/**
 * Inner page hero. With a photo: a rounded cinematic panel with the title over the image.
 * Without: centred title over a soft glow.
 */
export function PageHero({
  label,
  title,
  intro,
  photo,
  children,
}: {
  label?: string;
  title: string;
  intro?: string;
  photo?: MediaRef | null;
  children?: ReactNode;
}) {
  if (photo) {
    return (
      <header className="pb-16 md:pb-20">
        <div className="relative isolate overflow-hidden bg-ground text-white">
          <MediaImage media={photo} fill priority sizes="100vw" className="-z-20 object-cover grayscale-[35%]" alt="" />
          <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.25)_0%,rgb(0_0_0/0.45)_45%,rgb(0_0_0/0.85)_100%)]" />
          <div className="wrap flex min-h-[min(72vh,42rem)] flex-col justify-end pb-12 pt-24 sm:pb-16">
            {label && <p className="t-label mb-5 !text-gold">{label}</p>}
            <h1 className="t-display max-w-[15ch]">
              <Accent text={title} period />
            </h1>
            {intro && <p className="mt-6 max-w-[56ch] text-lg text-white/80">{intro}</p>}
            {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="panel-glow">
      <div className="wrap pb-16 pt-20 text-center md:pb-20 md:pt-28">
        {label && <p className="t-label mb-6">{label}</p>}
        <h1 className="t-display mx-auto max-w-[16ch]">
          <Accent text={title} period />
        </h1>
        {intro && <p className="t-lead mx-auto mt-6 max-w-[58ch]">{intro}</p>}
        {children && <div className="mt-10 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </header>
  );
}
