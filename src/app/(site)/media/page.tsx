import type { Metadata } from "next";
import { Gallery } from "@/components/site/gallery";
import { ArrowLink, PageHero, SectionHead } from "@/components/site/ui";
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
      <PageHero label="Media" title="Moments of worship, prayer and care." intro="Photographs from past Gatherings, and video from the ministry's YouTube channel." />

      {gallery.length > 0 && (
        <section aria-label="Photo gallery" className="wrap pb-24 md:pb-32">
          <Gallery photos={gallery} />
        </section>
      )}

      {site.videoYoutubeId && (
        <section aria-labelledby="watch-h" className="bg-band py-24 md:py-32">
          <div className="wrap">
            <SectionHead id="watch-h" title="Watch on YouTube" intro="Messages, conference highlights and ministry updates." />
            <div className="mx-auto mt-14 w-full max-w-[24rem] rounded-[2rem] bg-card p-3">
              <YouTube id={site.videoYoutubeId} title={site.videoTitle} vertical />
            </div>
            {site.youtube && (
              <div className="mt-10 text-center">
                <ArrowLink href={site.youtube} external>Visit the channel</ArrowLink>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
