import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { ListItem } from "@/lib/db/schema";
import { SectionHead } from "./ui";

/** Questions and answers on a grey band, as native disclosure widgets (works without JavaScript). */
export function FaqSection({ items, title = "Questions people ask" }: { items: ListItem[]; title?: string }) {
  if (!items.length) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.title, acceptedAnswer: { "@type": "Answer", text: f.body } })),
  };
  return (
    <section aria-labelledby="faq-h" className="bg-band py-24 md:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="wrap">
        <SectionHead id="faq-h" title={title} />
        <div className="mx-auto mt-14 grid max-w-3xl gap-3">
          {items.map((f) => (
            <details key={f.id} className="faq card group px-6 py-1 sm:px-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg tracking-tight">
                {f.title}
                <span className="faq-icon grid size-9 shrink-0 place-items-center rounded-full bg-band transition-transform duration-300">
                  <Plus size={16} aria-hidden />
                </span>
              </summary>
              <p className="pb-6 pr-12 text-ink-2">{f.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
