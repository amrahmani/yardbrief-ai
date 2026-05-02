import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

import { activeProductConfig } from "@/data/productTypes";
import { createDefaultSubscriptionState } from "@/lib/subscription-store";
import { findPlanByStripePriceId, getStripe } from "@/lib/stripe/server";
import type { LocalSubscriptionState, SubscriptionPlanKey } from "@/types/yardbrief";

interface StripeSubscriptionRow {
  user_id: string;
  product_type: string;
  plan: SubscriptionPlanKey;
  status: LocalSubscriptionState["status"];
  billing_interval: LocalSubscriptionState["billing_interval"];
  usage_month: string;
  reports_generated_this_month: number;
  ai_generations_this_month: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

function getIntervalFromStripe(
  price: Stripe.Price | Stripe.DeletedPrice | null | undefined,
): LocalSubscriptionState["billing_interval"] {
  if (!price || price.deleted || !price.recurring?.interval) {
    return null;
  }

  return price.recurring.interval === "year" ? "yearly" : "monthly";
}

function getPlanFromStripe(
  price: Stripe.Price | Stripe.DeletedPrice | null | undefined,
  fallback: SubscriptionPlanKey = "free",
): SubscriptionPlanKey {
  if (!price || price.deleted) {
    return fallback;
  }

  const mapped = findPlanByStripePriceId(price.id);
  return mapped?.plan ?? fallback;
}

function normalizeStatus(
  status: Stripe.Subscription.Status | null | undefined,
): LocalSubscriptionState["status"] {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "unpaid":
      return "unpaid";
    case "paused":
      return "paused";
    default:
      return "demo";
  }
}

function buildStripeRow(args: {
  current: Partial<StripeSubscriptionRow> | null;
  userId: string;
  customerId: string;
  subscription: Stripe.Subscription;
}) {
  const { current, userId, customerId, subscription } = args;
  const defaults = createDefaultSubscriptionState();
  const firstItem = subscription.items.data[0];
  const price = firstItem?.price;
  const currentPeriodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : current?.current_period_end ?? null;
  const mappedPlan = getPlanFromStripe(
    price,
    subscription.status === "canceled" ? "free" : current?.plan ?? "free",
  );
  const normalizedStatus = normalizeStatus(subscription.status);

  return {
    user_id: userId,
    product_type: current?.product_type ?? activeProductConfig.product_type,
    plan: subscription.status === "canceled" ? "free" : mappedPlan,
    status: normalizedStatus,
    billing_interval: getIntervalFromStripe(price),
    usage_month: current?.usage_month ?? defaults.usage_month,
    reports_generated_this_month:
      current?.reports_generated_this_month ?? defaults.reports_generated_this_month,
    ai_generations_this_month:
      current?.ai_generations_this_month ?? defaults.ai_generations_this_month,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: price && !price.deleted ? price.id : "",
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
  } satisfies StripeSubscriptionRow;
}

async function loadSubscriptionRow(
  supabase: SupabaseClient,
  userId: string,
  customerId?: string,
  subscriptionId?: string,
) {
  if (subscriptionId) {
    const result = await supabase
      .from("subscriptions")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      return result.data as Partial<StripeSubscriptionRow>;
    }
  }

  if (customerId) {
    const result = await supabase
      .from("subscriptions")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      return result.data as Partial<StripeSubscriptionRow>;
    }
  }

  const result = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();

  if (result.error) {
    throw result.error;
  }

  return (result.data as Partial<StripeSubscriptionRow> | null) ?? null;
}

export async function syncStripeCustomerToSupabase(args: {
  supabase: SupabaseClient;
  userId: string;
  customerId: string;
}) {
  const { supabase, userId, customerId } = args;
  const current = await loadSubscriptionRow(supabase, userId, customerId);
  const defaults = createDefaultSubscriptionState();

  const row = {
    user_id: userId,
    product_type: current?.product_type ?? activeProductConfig.product_type,
    plan: current?.plan ?? defaults.plan,
    status: current?.status ?? "checkout_pending",
    billing_interval: current?.billing_interval ?? null,
    usage_month: current?.usage_month ?? defaults.usage_month,
    reports_generated_this_month:
      current?.reports_generated_this_month ?? defaults.reports_generated_this_month,
    ai_generations_this_month:
      current?.ai_generations_this_month ?? defaults.ai_generations_this_month,
    stripe_customer_id: customerId,
    stripe_subscription_id: current?.stripe_subscription_id ?? "",
    stripe_price_id: current?.stripe_price_id ?? "",
    current_period_end: current?.current_period_end ?? null,
    cancel_at_period_end: current?.cancel_at_period_end ?? false,
  } satisfies StripeSubscriptionRow;

  const { error } = await supabase.from("subscriptions").upsert(row, {
    onConflict: "user_id",
  });

  if (error) {
    throw error;
  }
}

export async function syncStripeSubscriptionToSupabase(args: {
  supabase: SupabaseClient;
  subscription: Stripe.Subscription;
  userId?: string;
}) {
  const { supabase, subscription, userId } = args;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const metadataUserId = subscription.metadata.supabaseUserId || userId;

  if (!metadataUserId) {
    throw new Error("Stripe subscription metadata is missing the Supabase user id.");
  }

  const current = await loadSubscriptionRow(
    supabase,
    metadataUserId,
    customerId,
    subscription.id,
  );
  const row = buildStripeRow({
    current,
    userId: metadataUserId,
    customerId,
    subscription,
  });

  const { error } = await supabase.from("subscriptions").upsert(row, {
    onConflict: "user_id",
  });

  if (error) {
    throw error;
  }
}

export async function syncStripeSessionCompletion(args: {
  supabase: SupabaseClient;
  checkoutSession: Stripe.Checkout.Session;
}) {
  const { supabase, checkoutSession } = args;
  const userId =
    checkoutSession.metadata?.supabaseUserId ||
    checkoutSession.client_reference_id ||
    "";
  const customerId =
    typeof checkoutSession.customer === "string"
      ? checkoutSession.customer
      : checkoutSession.customer?.id ?? "";

  if (!userId || !customerId) {
    return;
  }

  await syncStripeCustomerToSupabase({
    supabase,
    userId,
    customerId,
  });

  if (typeof checkoutSession.subscription === "string") {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription);
    await syncStripeSubscriptionToSupabase({
      supabase,
      subscription,
      userId,
    });
  }
}
