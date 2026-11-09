"use client";

import { useActionState } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { EnquiryState } from "@/app/(site)/enquiry-actions";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  autoComplete?: string;
  options?: string[];
  wide?: boolean;
  help?: string;
};

export function EnquiryForm({
  action,
  fields,
  submitLabel,
}: {
  action: (prev: EnquiryState, data: FormData) => Promise<EnquiryState>;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as EnquiryState);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <CheckCircle size={40} weight="light" className="text-accent-text" aria-hidden />
        <h3 className="text-2xl">Message received</h3>
        <p className="max-w-[48ch] text-ink-2">{state.message ?? "Thank you. We will be in touch."}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="grid gap-5 sm:grid-cols-2">
      {state.status === "error" && state.message && (
        <p role="alert" className="flex items-start gap-3 rounded-xl border border-[#fecdca] bg-[#fef3f2] p-4 text-sm font-medium text-[#b42318] sm:col-span-2 dark:border-[#7a271a] dark:bg-[#2d1512] dark:text-[#fda29b]">
          <WarningCircle size={20} className="shrink-0" aria-hidden /> {state.message}
        </p>
      )}
      {fields.map((f) => {
        const id = `f-${f.name}`;
        const err = state.errors?.[f.name];
        const common = {
          id,
          name: f.name,
          required: f.required,
          defaultValue: state.values?.[f.name] ?? "",
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err ? `${id}-err` : f.help ? `${id}-help` : undefined,
          className: "input",
        };
        return (
          <div key={f.name} className={f.wide || f.type === "textarea" ? "sm:col-span-2" : undefined}>
            <label htmlFor={id} className="field-label">
              {f.label}
              {f.required ? <span className="text-accent-text"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea {...common} rows={6} />
            ) : f.type === "select" ? (
              <select {...common}>
                <option value="">Choose one</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input {...common} type={f.type ?? "text"} autoComplete={f.autoComplete} />
            )}
            {f.help && !err && (
              <p id={`${id}-help`} className="field-help">
                {f.help}
              </p>
            )}
            {err && (
              <p id={`${id}-err`} className="field-error">
                {err}
              </p>
            )}
          </div>
        );
      })}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="f-website">Leave this empty</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending} aria-busy={pending}>
          {pending ? "Sending..." : submitLabel}
        </button>
        <p className="mt-4 text-sm text-muted">
          We use your details only to reply to you. See our <a className="link" href="/privacy">privacy policy</a>.
        </p>
      </div>
    </form>
  );
}
