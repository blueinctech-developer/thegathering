"use server";

import { createHash } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { escapeHtml, sendEmail } from "@/lib/email";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
};

const text = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`);

const contactSchema = z.object({
  name: text(120).min(2, "Please enter your name."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(200),
  phone: text(40).optional().default(""),
  subject: text(160).optional().default(""),
  message: text(5000).min(10, "Please write a short message (at least 10 characters)."),
});

const partnershipSchema = contactSchema.extend({
  organisation: text(160).optional().default(""),
  country: text(80).min(2, "Please tell us which country you are in."),
  interest: text(120).min(1, "Please choose how you would like to partner."),
});

const LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  organisation: "Organisation or church",
  country: "Country",
  interest: "Partnership interest",
  subject: "Subject",
  message: "Message",
};

async function submit(kind: "contact" | "partnership", formData: FormData): Promise<EnquiryState> {
  const raw = Object.fromEntries([...formData.entries()].filter(([k, v]) => !k.startsWith("$") && typeof v === "string")) as Record<string, string>;

  // Honeypot: real visitors never see or fill this field.
  if (raw.website) return { status: "success" };

  const schema = kind === "partnership" ? partnershipSchema : contactSchema;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      errors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", errors, values: raw };
  }
  const data = parsed.data as z.infer<typeof partnershipSchema>;

  // Light rate limit: 5 enquiries per address per hour.
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${ip}:${process.env.BETTER_AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
  const [recent] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(enquiries)
    .where(and(eq(enquiries.ipHash, ipHash), gt(enquiries.createdAt, sql`now() - interval '1 hour'`)));
  if ((recent?.n ?? 0) >= 5) {
    return { status: "error", message: "We have received several messages from you recently. Please try again later or email us directly.", values: raw };
  }

  // Save first, so nothing is lost if email delivery fails.
  const [row] = await db
    .insert(enquiries)
    .values({
      kind,
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      organisation: data.organisation ?? "",
      country: data.country ?? "",
      interest: data.interest ?? "",
      subject: data.subject ?? "",
      message: data.message,
      ipHash,
    })
    .returning({ id: enquiries.id });

  const fields = Object.entries(data).filter(([, v]) => typeof v === "string" && v !== "");
  const subject = kind === "partnership" ? `Partnership enquiry from ${data.name}` : `Website message: ${data.subject || data.name}`;
  const to = (process.env.ENQUIRY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const emailStatus = await sendEmail({
    to,
    replyTo: data.email,
    subject,
    text: fields.map(([k, v]) => `${LABELS[k] ?? k}: ${v}`).join("\n\n") + `\n\nReference: #${row.id}`,
    html:
      `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
      fields
        .map(([k, v]) => `<tr><th align="left" valign="top" style="color:#555;padding-right:16px">${escapeHtml(LABELS[k] ?? k)}</th><td style="white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`)
        .join("") +
      `</table><p style="font-family:Arial,sans-serif;font-size:12px;color:#777">Reference #${row.id}. Reply to this email to answer ${escapeHtml(data.name)} directly.</p>`,
  });
  await db.update(enquiries).set({ emailStatus }).where(eq(enquiries.id, row.id));

  return {
    status: "success",
    message:
      kind === "partnership"
        ? "Thank you for your interest in partnering with us. Our team will be in touch."
        : "Thank you for getting in touch. We will reply as soon as we can.",
  };
}

export async function submitContact(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  return submit("contact", formData);
}

export async function submitPartnership(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  return submit("partnership", formData);
}
