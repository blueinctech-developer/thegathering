import type { ReactNode } from "react";

/** Small server-rendered building blocks for admin forms. */
export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  help,
  required,
  long,
  rows,
  className,
  ...rest
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  help?: string;
  required?: boolean;
  long?: boolean;
  rows?: number;
  className?: string;
  placeholder?: string;
  step?: string;
  min?: string | number;
}) {
  // The label wraps its control, so no id is needed even when the same form repeats on a page.
  return (
    <div className={className}>
      <label className="block">
        <span className="field-label">
          {label}
          {required && <span className="text-accent-text"> *</span>}
        </span>
        {long ? (
          <textarea name={name} defaultValue={defaultValue ?? ""} rows={rows ?? 4} required={required} className="input" {...rest} />
        ) : (
          <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} className="input" {...rest} />
        )}
      </label>
      {help && <p className="field-help">{help}</p>}
    </div>
  );
}

export function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}

export function AdminTitle({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {intro && <p className="mt-2 max-w-[70ch] text-ink-2">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-7 ${className ?? ""}`}>
      {title && <h2 className="mb-5 text-xl">{title}</h2>}
      {children}
    </section>
  );
}

export function AdminSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="mb-8 h-10 w-64 rounded-lg bg-surface-2" />
      <div className="grid gap-4">
        <div className="h-32 rounded-[var(--radius-card)] bg-surface-2" />
        <div className="h-32 rounded-[var(--radius-card)] bg-surface-2" />
        <div className="h-32 rounded-[var(--radius-card)] bg-surface-2" />
      </div>
    </div>
  );
}
