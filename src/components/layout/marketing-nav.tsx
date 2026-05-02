import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/auth", label: "Sign in" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects/new", label: "New brief" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-charcoal/8 bg-[rgba(248,244,236,0.88)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <BrandMark />
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-stone transition hover:bg-white/70 hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="yb-button yb-button-primary px-4 text-sm"
        >
          Open app
        </Link>
      </div>
    </header>
  );
}
