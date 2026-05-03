"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGroups } from "@/lib/admin-config";

const GROUP_ICONS: Record<string, string> = {
  "Overview":          "◈",
  "People & Access":   "👤",
  "Images & Captions": "🖼",
  "Humor System":      "🎭",
  "LLM System":        "🤖",
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      {adminNavGroups.map((group) => (
        <section key={group.title}>
          <h2
            className="flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--rf-muted)" }}
          >
            <span aria-hidden="true">{GROUP_ICONS[group.title] ?? "•"}</span>
            {group.title}
          </h2>
          <ul className="mt-1.5 space-y-0.5">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium"
                    style={
                      active
                        ? {
                            color: "var(--rf-accent)",
                            borderLeft: "2px solid var(--rf-accent)",
                            paddingLeft: "10px",
                            background: "rgba(219,74,43,0.06)",
                          }
                        : {
                            color: "var(--rf-primary)",
                            opacity: 0.65,
                            borderLeft: "2px solid transparent",
                          }
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
