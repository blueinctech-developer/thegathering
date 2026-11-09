"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, List, X } from "@phosphor-icons/react";

export function MobileMenu({
  items,
  cta,
}: {
  items: readonly { href: string; label: string }[];
  cta: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full text-ink hover:bg-band"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <X size={24} /> : <List size={24} />}
      </button>
      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-canvas px-4 pb-10 pt-6">
          <nav aria-label="Main">
            <ul className="grid gap-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 text-3xl tracking-tight text-ink hover:bg-band aria-[current=page]:bg-band"
                  >
                    {item.label}
                    <ArrowRight size={20} className="text-ink-3" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href={cta.href} className="pill pill-ink pill-lg mt-8 w-full">
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
