import { NextResponse } from "next/server";

import { activeProductConfig } from "@/data/productTypes";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createDefaultSubscriptionState } from "@/lib/subscription-store";
import {
  getStripe,
  getStripePriceId,
  isStripeConfigured,
  resolveAppUrl,
  type StripePlanSelection,
} from "@/lib/stripe/server";
import { syncStripeCustomerToSupabase } from "@/lib/stripe/subscription-sync";
import type { BillingInterval, SubscriptionPlanKey } from "@/types/yardbrief";

export const runtime = "nodejs";

interface CheckoutRequestBody {
  plan: SubscriptionPlanKey;
  billingInterval: BillingInterval;
}

function isPaidPlan(plan: SubscriptionPlanKey): plan is Exclude<SubscriptionPlanKey, "free"> {
  return plan === "solo" || plan === "pro" || plan === "team";
}

function isValidInterval(value: string): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}

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
      { error: "Sign in is required before starting Stripe Checkout." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as Partial<CheckoutRequestBody>;

  if (!body.plan || !isPaidPlan(body.plan) || !body.billingInterval || !isValidInterval(body.billingInterval)) {
    return NextResponse.json(
      { error: "A valid paid plan and billing interval are required." },
      { status: 400 },
    );
  }

  const { data: currentSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subscriptionError) {
    return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
  }

  const existingStatus = currentSubscription?.status as string | undefined;
  const existingCustomerId = currentSubscription?.stripe_customer_id as string | undefined;
  const defaultSubscriptionState = createDefaultSubscriptionState();

  if (
    existingCustomerId &&
    currentSubscription?.stripe_subscription_id &&
    existingStatus &&
    ["active", "trialing", "past_due", "incomplete", "paused"].includes(existingStatus)
  ) {
    return NextResponse.json(
      {
        error: "An active Stripe subscription already exists. Open the billing portal to manage it.",
      },
      { status: 409 },
    );
  }

  const stripe = getStripe();
  const appUrl = resolveAppUrl(request);
  const selection = {
    plan: body.plan,
    interval: body.billingInterval,
  } satisfies StripePlanSelection;

  let customerId = existingCustomerId ?? "";

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: {
        supabaseUserId: user.id,
        productType: activeProductConfig.product_type,
      },
    });

    customerId = customer.id;

    await syncStripeCustomerToSupabase({
      supabase,
      userId: user.id,
      customerId,
    });
  }

  const priceId = getStripePriceId(selection);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/settings?stripe=success`,
    cancel_url: `${appUrl}/pricing?stripe=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      supabaseUserId: user.id,
      plan: selection.plan,
      billingInterval: selection.interval,
      productType: activeProductConfig.product_type,
    },
    subscription_data: {
      metadata: {
        supabaseUserId: user.id,
        plan: selection.plan,
        billingInterval: selection.interval,
        productType: activeProductConfig.product_type,
      },
    },
  });

  const { error: pendingError } = await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      product_type: activeProductConfig.product_type,
      plan:
        (currentSubscription?.plan as SubscriptionPlanKey | undefined) ??
        defaultSubscriptionState.plan,
      status: "checkout_pending",
      billing_interval: selection.interval,
      usage_month:
        (currentSubscription?.usage_month as string | undefined) ??
        defaultSubscriptionState.usage_month,
      reports_generated_this_month:
        (currentSubscription?.reports_generated_this_month as number | undefined) ??
        defaultSubscriptionState.reports_generated_this_month,
      ai_generations_this_month:
        (currentSubscription?.ai_generations_this_month as number | undefined) ??
        defaultSubscriptionState.ai_generations_this_month,
      stripe_customer_id: customerId,
      stripe_subscription_id:
        (currentSubscription?.stripe_subscription_id as string | undefined) ?? "",
      stripe_price_id: priceId,
      current_period_end:
        (currentSubscription?.current_period_end as string | null | undefined) ?? null,
      cancel_at_period_end:
        (currentSubscription?.cancel_at_period_end as boolean | undefined) ?? false,
    },
    {
      onConflict: "user_id",
    },
  );

  if (pendingError) {
    return NextResponse.json({ error: pendingError.message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
