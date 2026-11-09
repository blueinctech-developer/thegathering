"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";

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
        className="grid size-11 place-items-center rounded-full border border-line text-ink"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <X size={20} /> : <List size={20} />}
      </button>
      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-[4.25rem] bottom-0 z-40 overflow-y-auto bg-bg px-4 pb-10 pt-4">
          <nav aria-label="Main">
            <ul className="divide-y divide-line border-b border-line">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex py-4 font-display text-2xl font-semibold tracking-tight text-ink aria-[current=page]:text-accent-text"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href={cta.href} className="btn btn-primary mt-8 w-full">
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
