"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none">
      <div className="glass glass-inner-glow rounded-full px-2 py-1.5 flex items-center gap-1 pointer-events-auto">
        <span className="glass-gloss rounded-full" />
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "relative z-10 px-4 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-colors",
                active
                  ? "text-[var(--color-ink)] bg-white/40"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
