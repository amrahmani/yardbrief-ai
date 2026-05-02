import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      return NextResponse.redirect(
        new URL("/auth?error=Unable%20to%20complete%20sign%20in.", requestUrl.origin),
      );
    }
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
