import Image from "next/image";
import type { Media } from "@/lib/db/schema";

/** Choose an existing upload or upload a new file for one image/document slot. */
export function MediaSelect({
  label,
  name,
  current,
  options,
  accept = "image/jpeg,image/png,image/webp",
  help,
}: {
  label: string;
  name: string;
  current: Media | null;
  options: Media[];
  accept?: string;
  help?: string;
}) {
  const isImage = (m: Media) => m.contentType.startsWith("image/");
  return (
    <fieldset className="rounded-[var(--radius-card)] border border-line p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="flex gap-4">
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-2 text-xs text-muted">
          {current ? (
            isImage(current) ? (
              <Image src={`/media/${current.key}`} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              "PDF"
            )
          ) : (
            "None"
          )}
        </div>
        <div className="grid flex-1 gap-3">
          <label className="block">
            <span className="sr-only">Choose an existing file for {label}</span>
            <select name={name} defaultValue={current?.id ?? ""} className="input min-h-10 py-2 text-sm">
              <option value="">None</option>
              {options.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.alt || m.filename}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Or upload a new file: </span>
            <input type="file" name={`${name}Upload`} accept={accept} className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm file:font-medium" />
          </label>
        </div>
      </div>
      {help && <p className="field-help">{help}</p>}
    </fieldset>
  );
}
