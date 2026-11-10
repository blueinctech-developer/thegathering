/** Giant scrolling lettering, alternating solid and outlined words (the page's one marquee). */
export function KineticBand({ words }: { words: string[] }) {
  const items = words.filter(Boolean);
  if (!items.length) return null;
  const row = [...items, ...items, ...items];
  return (
    <section aria-label={items.join(", ")} className="marquee overflow-hidden py-10 md:py-16">
      <div className="marquee-track flex w-max items-center gap-10 md:gap-16" aria-hidden>
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10 md:gap-16">
            <span className={`t-kinetic ${i % 2 ? "t-outline" : ""}`}>{w}</span>
            <span className="inline-block size-4 rotate-45 bg-gold md:size-6" />
          </span>
        ))}
      </div>
    </section>
  );
}
