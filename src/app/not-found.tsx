import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="t-label">Page not found</p>
      <h1 className="t-display max-w-[14ch]">We could not find that page</h1>
      <p className="max-w-[52ch] text-lg text-ink-2">The link may be old, or the page may have moved. Start again from the home page.</p>
      <Link href="/" className="pill pill-ink pill-lg">Go to the home page</Link>
    </main>
  );
}
