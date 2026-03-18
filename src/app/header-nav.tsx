"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/upload", label: "Upload Track" },
  { href: "/my-tracks", label: "My Tracks" },
  { href: "/listen", label: "Listen Page" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="ml-auto flex items-center gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
              isActive
                ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                : "bg-transparent text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
