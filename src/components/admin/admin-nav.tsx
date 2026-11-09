"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDots,
  Coins,
  Image as ImageIcon,
  ListBullets,
  Microphone,
  Article,
  SquaresFour,
  Tray,
  UserCircle,
  Clock,
} from "@phosphor-icons/react";

const ITEMS = [
  { href: "/admin", label: "Overview", Icon: SquaresFour },
  { href: "/admin/enquiries", label: "Enquiries", Icon: Tray },
  { href: "/admin/event", label: "Event", Icon: CalendarDots },
  { href: "/admin/content", label: "Site content", Icon: Article },
  { href: "/admin/speakers", label: "Speakers", Icon: Microphone },
  { href: "/admin/programme", label: "Programme", Icon: Clock },
  { href: "/admin/lists", label: "Lists", Icon: ListBullets },
  { href: "/admin/streams", label: "Funding streams", Icon: Coins },
  { href: "/admin/media", label: "Photos and files", Icon: ImageIcon },
  { href: "/admin/account", label: "Account", Icon: UserCircle },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:overflow-visible lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent-text"
              >
                <Icon size={18} aria-hidden /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
