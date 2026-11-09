import type { ReactNode } from "react";
import type { MediaRef } from "@/lib/content/queries";
import { MediaImage } from "@/components/media-image";

/** Inner page header: title and intro on the left, an optional photo offset to the right. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  photo,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  photo?: MediaRef | null;
  children?: ReactNode;
}) {
  return (
    <header className="wrap grid gap-10 pb-14 pt-12 md:pt-16 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pb-20">
      <div className={photo ? "lg:col-span-7" : "lg:col-span-9"}>
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem]">{title}</h1>
        {intro && <p className="mt-6 max-w-[58ch] text-lg text-ink-2 sm:text-xl">{intro}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
      {photo && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 lg:col-span-5 lg:aspect-[5/4] lg:translate-y-6">
          <MediaImage media={photo} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
      )}
    </header>
  );
}
