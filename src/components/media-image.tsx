import Image from "next/image";
import type { MediaRef } from "@/lib/content/queries";

/** An uploaded photo, served through /media and optimised by next/image. */
export function MediaImage({
  media,
  sizes,
  className,
  priority,
  fill,
  alt,
}: {
  media: MediaRef;
  sizes: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  alt?: string;
}) {
  const src = `/media/${media.key}`;
  const text = alt ?? media.alt;
  if (fill || !media.width || !media.height) {
    return <Image src={src} alt={text} fill sizes={sizes} className={className} priority={priority} />;
  }
  return (
    <Image
      src={src}
      alt={text}
      width={media.width}
      height={media.height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
