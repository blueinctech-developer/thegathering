import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";

/** Create an admin who signs in with email and password. Public sign-up is disabled. */
export async function createAdminUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  if (existing.length) throw new Error("An admin with that email already exists.");
  if (input.password.length < 10) throw new Error("Password must be at least 10 characters.");

  const id = randomUUID();
  const now = new Date();
  await db.insert(user).values({ id, name: input.name.trim(), email, emailVerified: true, createdAt: now, updatedAt: now });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  });
  return { id, email };
}

export async function setAdminPassword(userId: string, password: string) {
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  await db
    .update(account)
    .set({ password: await hashPassword(password), updatedAt: new Date() })
    .where(eq(account.userId, userId));
}
