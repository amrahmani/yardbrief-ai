import { NextResponse } from "next/server";

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured, resolveAppUrl } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for this environment yet." },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in is required before opening billing management." },
      { status: 401 },
    );
  }

  const { data: subscriptionRow, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const customerId = subscriptionRow?.stripe_customer_id as string | undefined;

  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer record exists for this account yet." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${resolveAppUrl(request)}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
