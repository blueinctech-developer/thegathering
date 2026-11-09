"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ items }: { items: readonly { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative rounded-full px-3.5 py-2 text-[0.9375rem] font-medium text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink"
            >
              {item.label}
              {active && <span aria-hidden className="absolute inset-x-3.5 -bottom-[0.2rem] h-0.5 rounded-full bg-accent" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
