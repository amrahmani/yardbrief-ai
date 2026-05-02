"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface ProjectTabsProps {
  projectId: string;
}

const items = [
  { key: "overview", label: "Overview", getHref: (projectId: string) => `/projects/${projectId}` },
  {
    key: "site-visit",
    label: "Site visit",
    getHref: (projectId: string) => `/projects/${projectId}/site-visit`,
  },
  {
    key: "reports",
    label: "Reports",
    getHref: (projectId: string) => `/projects/${projectId}/reports/new`,
  },
];

function getActiveTab(pathname: string) {
  if (pathname.includes("/site-visit")) return "site-visit";
  if (pathname.includes("/reports/")) return "reports";
  return "overview";
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <div className="mt-6 overflow-x-auto rounded-full border border-white/70 bg-white/72 p-2 shadow-[0_16px_40px_-30px_rgba(23,55,44,0.4)]">
      <div className="flex min-w-max gap-2">
        {items.map((item) => {
          const active = item.key === activeTab;

          return (
            <Link
              key={item.key}
              href={item.getHref(projectId)}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-forest text-white shadow-[0_14px_28px_-18px_rgba(23,55,44,0.8)]"
                  : "bg-beige/70 text-charcoal hover:bg-beige",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
