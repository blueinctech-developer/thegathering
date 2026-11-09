import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Field, Panel } from "@/components/admin/fields";
import { RowActions } from "@/components/admin/row-actions";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { addAdmin, changePassword, removeAdmin } from "../actions";

export default function AccountPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Account />
    </Suspense>
  );
}

async function Account() {
  const me = await requireAdmin();
  const admins = await db.select({ id: user.id, name: user.name, email: user.email }).from(user).orderBy(asc(user.createdAt));

  return (
    <>
      <AdminTitle title="Account" intro={`Signed in as ${me.email}.`}>
        <SignOutButton />
      </AdminTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Change your password">
          <AdminForm action={changePassword} submitLabel="Change password">
            <div className="grid gap-4">
              <Field label="Current password" name="current" type="password" required />
              <Field label="New password" name="next" type="password" required help="At least 10 characters." />
              <Field label="Repeat new password" name="confirm" type="password" required />
            </div>
          </AdminForm>
        </Panel>
        <Panel title="Add an admin">
          <AdminForm action={addAdmin} submitLabel="Add admin">
            <div className="grid gap-4">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Temporary password" name="password" type="text" required help="At least 10 characters. Share it privately and ask them to change it." />
            </div>
          </AdminForm>
        </Panel>
      </div>
      <Panel title="Admins" className="mt-4">
        <ul className="divide-y divide-line">
          {admins.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>
                <span className="font-medium">{a.name}</span> <span className="text-sm text-muted">{a.email}</span>
                {a.id === me.id && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs">You</span>}
              </span>
              {a.id !== me.id && admins.length > 1 && <RowActions id={a.id} remove={removeAdmin} label={a.name} />}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
