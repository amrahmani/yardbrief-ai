"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(env.url, env.publishableKey);
}
