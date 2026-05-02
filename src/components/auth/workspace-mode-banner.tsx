"use client";

import Link from "next/link";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";

export function WorkspaceModeBanner() {
  const { cloudError, cloudStatus, mode, supabaseConfigured, user } = useWorkspaceData();

  if (mode === "cloud") {
    return (
      <div className="rounded-[1.9rem] border border-white/75 bg-[linear-gradient(180deg,rgba(232,244,236,0.96),rgba(255,253,248,0.9))] px-5 py-4 shadow-[0_20px_60px_-42px_rgba(23,55,44,0.6)] ring-1 ring-white/50">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
          Supabase workspace
        </p>
        <p className="mt-2 text-sm leading-7 text-stone">
          Signed in as <span className="font-semibold text-charcoal">{user?.email ?? "your account"}</span>.
          Projects, reports, site visits, and subscription usage now save to Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.9rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(243,234,219,0.78))] px-5 py-4 shadow-[0_20px_60px_-42px_rgba(23,55,44,0.6)] ring-1 ring-white/45">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
        Demo mode
      </p>
      <p className="mt-2 text-sm leading-7 text-stone">
        {supabaseConfigured
          ? "You are in local demo mode right now. Sign in when you want Supabase to become the active workspace data store."
          : "Authentication becomes available after Supabase environment variables are configured. Until then, the app stays local-only."}
      </p>
      <p className="mt-2 text-sm leading-7 text-stone">
        Privacy-first workflow: use client nicknames, suburb-only location, and review exports before sharing.
      </p>
      {cloudStatus === "error" && cloudError ? (
        <p className="mt-2 text-sm font-medium text-[#8A3F31]">{cloudError}</p>
      ) : null}
      {supabaseConfigured ? (
        <Link
          href="/auth"
          className="yb-button yb-button-primary mt-4 text-sm"
        >
          Sign in to Supabase
        </Link>
      ) : null}
    </div>
  );
}
