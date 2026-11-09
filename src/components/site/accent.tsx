/**
 * Sets the end of a heading in light italic, the COFWO headline style:
 * "The Move of the Spirit" -> "The Move <em>of the Spirit</em>".
 * Splits before the first "of/for/in/to/with/at" after the first word, otherwise at the midpoint.
 */
export function Accent({ text, period = false }: { text: string; period?: boolean }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <>{text}{period ? "." : ""}</>;
  let at = words.findIndex((w, i) => i > 0 && /^(of|for|in|to|with|at|into|beyond)$/i.test(w));
  if (at < 1) at = Math.ceil(words.length / 2);
  const end = words.slice(at).join(" ");
  return (
    <>
      {words.slice(0, at).join(" ")} <em>{end}{period && !/[.!?]$/.test(end) ? "." : ""}</em>
    </>
  );
}
