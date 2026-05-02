import Stripe from "stripe";

import type { BillingInterval, SubscriptionPlanKey } from "@/types/yardbrief";

export interface StripePlanSelection {
  plan: Exclude<SubscriptionPlanKey, "free">;
  interval: BillingInterval;
}

interface StripePriceMapping extends StripePlanSelection {
  priceId: string;
}

let stripeInstance: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeInstance;
}

export function getStripeWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return process.env.STRIPE_WEBHOOK_SECRET;
}

export function getStripePriceCatalog(): StripePriceMapping[] {
  const catalog = [
    {
      plan: "solo",
      interval: "monthly",
      priceId: process.env.STRIPE_SOLO_MONTHLY_PRICE_ID ?? "",
    },
    {
      plan: "solo",
      interval: "yearly",
      priceId: process.env.STRIPE_SOLO_YEARLY_PRICE_ID ?? "",
    },
    {
      plan: "pro",
      interval: "monthly",
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
    },
    {
      plan: "pro",
      interval: "yearly",
      priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? "",
    },
    {
      plan: "team",
      interval: "monthly",
      priceId: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? "",
    },
    {
      plan: "team",
      interval: "yearly",
      priceId: process.env.STRIPE_TEAM_YEARLY_PRICE_ID ?? "",
    },
  ] satisfies StripePriceMapping[];

  return catalog.filter((entry) => entry.priceId);
}

export function getStripePriceId(selection: StripePlanSelection) {
  const match = getStripePriceCatalog().find(
    (entry) => entry.plan === selection.plan && entry.interval === selection.interval,
  );

  if (!match) {
    throw new Error(`No Stripe price is configured for ${selection.plan} ${selection.interval}.`);
  }

  return match.priceId;
}

export function findPlanByStripePriceId(priceId: string) {
  return getStripePriceCatalog().find((entry) => entry.priceId === priceId) ?? null;
}

export function resolveAppUrl(request: Request) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const origin = request.headers.get("origin");

  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  return url.origin.replace(/\/$/, "");
}

// Future mobile subscriptions should come through RevenueCat and write into the
// same Supabase subscription row so web Stripe billing and mobile billing stay unified.
