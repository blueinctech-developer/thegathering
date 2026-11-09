"use client";

import { useActionState, type ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { ActionResult } from "@/lib/admin/form";

/**
 * A form bound to a server action, with pending state and an inline result message.
 * `aside` (e.g. move/delete controls, which are forms themselves) renders beside the
 * submit row but outside this <form>, because forms cannot be nested.
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Save",
  className,
  aside,
}: {
  action: (prev: ActionResult, data: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  aside?: ReactNode;
}) {
  const [result, formAction, pending] = useActionState(action, null);
  return (
    <div className="relative">
      <form action={formAction} className={className}>
        {children}
        <div className={`mt-5 flex flex-wrap items-center gap-4 ${aside ? "pr-32" : ""}`}>
          <button type="submit" className="btn btn-primary min-h-11" disabled={pending} aria-busy={pending}>
            {pending ? "Saving..." : submitLabel}
          </button>
          {result && !pending && (
            <p role="status" className={`flex items-center gap-2 text-sm font-medium ${result.ok ? "text-[#067647] dark:text-[#47cd89]" : "text-[#b42318] dark:text-[#f97066]"}`}>
              {result.ok ? <CheckCircle size={18} aria-hidden /> : <WarningCircle size={18} aria-hidden />} {result.message}
            </p>
          )}
        </div>
      </form>
      {aside && <div className="absolute bottom-1 right-0">{aside}</div>}
    </div>
  );
}
