import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap flex flex-1 flex-col items-start justify-center gap-6 py-24">
      <p className="eyebrow">Page not found</p>
      <h1 className="max-w-[16ch] text-5xl sm:text-6xl">We could not find that page</h1>
      <p className="max-w-[52ch] text-lg text-ink-2">The link may be old, or the page may have moved. Start again from the home page.</p>
      <Link href="/" className="btn btn-primary">Go to the home page</Link>
    </main>
  );
}
