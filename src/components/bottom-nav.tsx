"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/aujourdhui", label: "Aujourd'hui", icon: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z" },
  { href: "/programme", label: "Programme", icon: "M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" },
  { href: "/historique", label: "Historique", icon: "M5 20V10M12 20V4M19 20v-7" },
  { href: "/profil", label: "Profil", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card2/95 backdrop-blur">
      <ul className="mx-auto flex max-w-xl">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-1 py-3 text-[0.62rem] uppercase tracking-[0.14em] ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={it.icon} />
                </svg>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
