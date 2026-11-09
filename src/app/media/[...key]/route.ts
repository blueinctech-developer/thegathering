import { getObject } from "@/lib/storage";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
  pdf: "application/pdf",
};

/** Serves uploaded files from the bucket. Keys are random and never reused, so responses cache forever. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[...key]">) {
  const { key } = await ctx.params;
  const path = key.join("/");
  if (!/^uploads\/[a-f0-9-]{36}\.(webp|jpe?g|png|avif|pdf)$/i.test(path)) {
    return new Response("Not found", { status: 404 });
  }
  const obj = await getObject(path);
  if (!obj) return new Response("Not found", { status: 404 });
  const ext = path.split(".").pop()!.toLowerCase();
  return new Response(Buffer.from(obj.body), {
    headers: {
      "Content-Type": obj.contentType || TYPES[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
