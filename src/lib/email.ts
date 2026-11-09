import "server-only";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

/**
 * Amazon SES (v2). Needs SES_REGION, SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY and a verified SES_FROM.
 * Returns "skipped" when SES is not configured, so local development works without it.
 */
let client: SESv2Client | null = null;

export function emailConfigured(): boolean {
  return Boolean(process.env.SES_FROM && process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY);
}

export async function sendEmail(msg: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<"sent" | "skipped" | "failed"> {
  if (!emailConfigured() || msg.to.length === 0) return "skipped";
  client ??= new SESv2Client({
    region: process.env.SES_REGION || "eu-west-2",
    credentials: {
      accessKeyId: process.env.SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
    },
  });
  try {
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: process.env.SES_FROM!,
        Destination: { ToAddresses: msg.to },
        ReplyToAddresses: msg.replyTo ? [msg.replyTo] : undefined,
        Content: {
          Simple: {
            Subject: { Data: msg.subject, Charset: "UTF-8" },
            Body: {
              Text: { Data: msg.text, Charset: "UTF-8" },
              Html: { Data: msg.html, Charset: "UTF-8" },
            },
          },
        },
      }),
    );
    return "sent";
  } catch (err) {
    console.error("[email] SES send failed", err);
    return "failed";
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
