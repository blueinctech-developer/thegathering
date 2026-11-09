export type ActionResult = { ok: boolean; message: string } | null;

export const fd = {
  str(data: FormData, key: string, max = 4000): string {
    const v = data.get(key);
    return typeof v === "string" ? v.trim().slice(0, max) : "";
  },
  int(data: FormData, key: string): number {
    const n = Number(String(data.get(key) ?? "").replace(/[^\d-]/g, ""));
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  },
  optId(data: FormData, key: string): number | null {
    const n = Number(data.get(key));
    return Number.isInteger(n) && n > 0 ? n : null;
  },
  bool(data: FormData, key: string): boolean {
    const v = data.get(key);
    return v === "on" || v === "true" || v === "1";
  },
  file(data: FormData, key: string): File | null {
    const v = data.get(key);
    return v instanceof File && v.size > 0 ? v : null;
  },
  files(data: FormData, key: string): File[] {
    return data.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
  },
};

export const ok = (message: string): ActionResult => ({ ok: true, message });
export const fail = (message: string): ActionResult => ({ ok: false, message });
