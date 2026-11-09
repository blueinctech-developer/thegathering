import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/** Centred section heading: big, light, tight. */
export function SectionHead({
  title,
  intro,
  id,
  className = "",
}: {
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      <h2 id={id} className="t-section">
        {title}
      </h2>
      {intro && <p className="t-lead mx-auto mt-5 max-w-[56ch]">{intro}</p>}
    </div>
  );
}

/** "See more" link with the round ember arrow chip. */
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

/** Inner page hero: centred large title over a soft ember glow. */
export function PageHero({
  label,
  title,
  intro,
  children,
}: {
  label?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <header className="panel-glow">
      <div className="wrap pb-16 pt-20 text-center md:pb-20 md:pt-28">
        {label && <p className="t-label mb-6">{label}</p>}
        <h1 className="t-display mx-auto max-w-[16ch]">{title}</h1>
        {intro && <p className="t-lead mx-auto mt-6 max-w-[58ch]">{intro}</p>}
        {children && <div className="mt-10 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </header>
  );
}
