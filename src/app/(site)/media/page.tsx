import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/site/page-header";
import { Gallery } from "@/components/site/gallery";
import { YouTube } from "@/components/site/youtube";
import { getGallery, getSite } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Media",
  description: "Photos and video from The Gathering: worship, prayer, outreach and the people we serve.",
};

export default async function MediaPage() {
  const [site, gallery] = await Promise.all([getSite(), getGallery()]);

  return (
    <>
      <PageHeader
        eyebrow="Media"
        title="Moments of worship, prayer and care"
        intro="Photographs from past Gatherings, and video from the ministry's YouTube channel."
      />

      {gallery.length > 0 && (
        <section aria-label="Photo gallery" className="wrap pb-20 md:pb-28">
          <Gallery photos={gallery} />
        </section>
      )}

      {site.videoYoutubeId && (
        <section aria-labelledby="watch-h" className="border-t border-line bg-surface py-20 md:py-28">
          <div className="wrap grid items-center gap-12 md:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
            <div className="mx-auto w-full max-w-[22rem]">
              <YouTube id={site.videoYoutubeId} title={site.videoTitle} vertical />
            </div>
            <div>
              <h2 id="watch-h" className="max-w-[18ch] text-4xl sm:text-5xl">Watch on YouTube</h2>
              <p className="mt-5 max-w-[52ch] text-lg text-ink-2">Messages, conference highlights and ministry updates from The Gathering.</p>
              {site.youtube && (
                <a href={site.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-8">
                  Visit the channel <ArrowUpRight size={18} aria-hidden />
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
