export const EVENT_TZ = "Africa/Lagos";

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: EVENT_TZ });
const dayOnly = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: EVENT_TZ });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: EVENT_TZ });
const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: EVENT_TZ });
const short = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: EVENT_TZ });
const full = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: EVENT_TZ });

/** "27 to 29 November 2026" (or "30 November to 2 December 2026"). */
export function formatDateRange(start: Date, end: Date): string {
  const sameMonth = monthYear.format(start) === monthYear.format(end);
  if (sameMonth) return `${dayOnly.format(start)} to ${dayOnly.format(end)} ${monthYear.format(end)}`;
  return `${dayMonth.format(start)} to ${dayMonth.format(end)} ${year.format(end)}`;
}

/** "Fri 27 Nov" for a yyyy-mm-dd date column. */
export function formatDay(isoDate: string): string {
  return short.format(new Date(`${isoDate}T12:00:00Z`));
}

export function formatDateTime(d: Date): string {
  return full.format(d);
}

export function formatYear(d: Date): string {
  return year.format(d);
}

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const money = {
  ngn: (n: number) => ngn.format(n),
  gbp: (n: number) => gbp.format(n),
  usd: (n: number) => usd.format(n),
};

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function waHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function bareUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
