"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandMark } from "@/components/layout/brand-mark";
import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { useProjects } from "@/hooks/use-projects";
import { platformRoadmap } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function getActiveKey(pathname: string) {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/projects/new") return "new";
  if (pathname.startsWith("/projects/")) return "projects";
  if (pathname === "/pricing") return "pricing";
  if (pathname === "/settings") return "settings";
  return "dashboard";
}

export function WorkspaceNav() {
  const pathname = usePathname();
  const { projects } = useProjects();
  const { mode, signOut, user } = useWorkspaceData();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const featuredProjectId = projects[0]?.id;
  const navItems = [
    { key: "dashboard", href: "/dashboard", label: "Dashboard" },
    {
      key: "projects",
      href: featuredProjectId ? `/projects/${featuredProjectId}` : "/dashboard",
      label: "Projects",
    },
    { key: "new", href: "/projects/new", label: "New brief" },
    { key: "pricing", href: "/pricing", label: "Pricing" },
    { key: "settings", href: "/settings", label: "Settings" },
  ];
  const activeKey = getActiveKey(pathname);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-6 space-y-5">
          <BrandMark className="w-full justify-start rounded-[1.75rem] px-4 py-4" />
          <div className="rounded-[2rem] border border-white/70 bg-white/82 p-4 shadow-[0_22px_60px_-36px_rgba(23,55,44,0.6)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Workspace
            </p>
            <nav className="mt-4 space-y-2">
              {navItems.map((item) => {
                const active = item.key === activeKey;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-forest text-white shadow-[0_16px_35px_-22px_rgba(23,55,44,0.9)]"
                        : "bg-beige/55 text-charcoal hover:bg-beige",
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] uppercase tracking-[0.22em] opacity-75">
                      {active ? "Live" : "Go"}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-white/82 p-4 shadow-[0_22px_60px_-36px_rgba(23,55,44,0.6)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Access
            </p>
            <p className="mt-3 text-sm leading-7 text-stone">
              {mode === "cloud"
                ? `Supabase active for ${user?.email ?? "your account"}.`
                : "Demo mode is active. Sign in when you want Supabase-backed workspace data."}
            </p>
            {mode === "cloud" ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="yb-button yb-button-muted mt-4 w-full text-sm"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            ) : (
              <Link
                href="/auth"
                className="yb-button yb-button-primary mt-4 w-full text-sm"
              >
                Sign in
              </Link>
            )}
          </div>
          <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(33,88,66,0.96),rgba(23,55,44,0.96))] p-5 text-white shadow-[0_24px_60px_-36px_rgba(23,55,44,0.9)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              SpaceBrief runway
            </p>
            <div className="mt-4 space-y-3">
              {platformRoadmap.map((product) => (
                <div
                  key={product.name}
                  className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-white/70">{product.audience}</p>
                    </div>
                    <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/80">
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-4 bottom-4 z-30 rounded-[1.8rem] border border-white/75 bg-[rgba(255,253,248,0.94)] px-2 py-2 shadow-[0_26px_50px_-30px_rgba(23,55,44,0.55)] ring-1 ring-white/50 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active = item.key === activeKey;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[1.2rem] px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] transition sm:text-[11px]",
                  active ? "bg-forest text-white shadow-[0_14px_28px_-22px_rgba(23,55,44,0.88)]" : "text-stone",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
