"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ items }: { items: readonly { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-0.5">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="rounded-full px-3.5 py-2 text-[0.9375rem] text-ink-2 transition-colors hover:bg-band hover:text-ink aria-[current=page]:bg-band aria-[current=page]:text-ink"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
