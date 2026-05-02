"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SectionCard } from "@/components/ui/section-card";
import { pricingPlans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import type { BillingInterval, PricingPlan } from "@/types/yardbrief";

function getButtonClass(plan: PricingPlan, featured?: boolean) {
  if (featured) {
    return "yb-button w-full bg-white text-charcoal hover:bg-white/92";
  }

  if (plan.key === "free") {
    return "yb-button yb-button-primary w-full";
  }

  if (plan.key === "team") {
    return "yb-button yb-button-muted w-full";
  }

  return "yb-button yb-button-secondary w-full";
}

function getDisplayedPrice(plan: PricingPlan, billingInterval: BillingInterval) {
  if (plan.key === "free") {
    return {
      price: plan.starterPrice ?? "$0",
      cadence: plan.cadenceLabel,
    };
  }

  return {
    price:
      billingInterval === "monthly"
        ? plan.monthlyPrice ?? "To be configured"
        : plan.yearlyPrice ?? "To be configured",
    cadence: billingInterval === "monthly" ? "per month" : "per year",
  };
}

function isManagedStripeStatus(status: string) {
  return ["active", "trialing", "past_due", "incomplete", "paused"].includes(status);
}

function getPlanAudience(plan: PricingPlan) {
  if (plan.key === "free") return "Best for testing the workflow";
  if (plan.key === "solo") return "Best for solo operators";
  if (plan.key === "pro") return "Best for growing studios";
  return "Best for shared teams";
}

export function PricingPlansGrid() {
  const router = useRouter();
  const { mode, subscription, supabaseConfigured, user } = useWorkspaceData();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [busyPlan, setBusyPlan] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const hasManagedSubscription = useMemo(
    () =>
      mode === "cloud" &&
      Boolean(subscription.stripe_customer_id) &&
      isManagedStripeStatus(subscription.status),
    [mode, subscription.status, subscription.stripe_customer_id],
  );

  async function openBillingPortal() {
    setFeedbackMessage("");

    const response = await fetch("/api/stripe/portal", {
      method: "POST",
    });

    const payload = (await response.json()) as { error?: string; url?: string };

    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Billing portal could not be opened.");
    }

    window.location.assign(payload.url);
  }

  async function startCheckout(plan: PricingPlan) {
    if (plan.key === "free") {
      router.push("/dashboard");
      return;
    }

    if (!supabaseConfigured) {
      setFeedbackMessage(
        "Supabase sign-in must be configured before Stripe checkout can be used.",
      );
      return;
    }

    if (!user) {
      router.push("/auth");
      return;
    }

    setBusyPlan(plan.key);
    setFeedbackMessage("");

    try {
      if (hasManagedSubscription) {
        await openBillingPortal();
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: plan.key,
          billingInterval,
        }),
      });

      const payload = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Stripe Checkout could not be started.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error ? error.message : "Stripe billing could not be started.",
      );
    } finally {
      setBusyPlan("");
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard className="bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(232,244,236,0.82))]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Billing interval
            </p>
            <p className="mt-2 text-sm leading-7 text-stone">
              Stripe Checkout is available for web subscriptions. Mobile in-app purchases are not
              implemented yet.
            </p>
          </div>
          <div className="inline-flex rounded-full border border-charcoal/10 bg-white p-1">
            {(["monthly", "yearly"] as BillingInterval[]).map((interval) => (
              <button
                key={interval}
                type="button"
                onClick={() => setBillingInterval(interval)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  billingInterval === interval
                    ? "bg-forest text-white"
                    : "text-charcoal hover:bg-beige/55",
                )}
              >
                {interval === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>
        {feedbackMessage ? (
          <div className="mt-4 rounded-[1.4rem] border border-[#8A3F31]/16 bg-[#8A3F31]/6 px-4 py-4">
            <p className="text-sm font-semibold text-[#8A3F31]">{feedbackMessage}</p>
          </div>
        ) : null}
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-4">
        {pricingPlans.map((plan) => {
          const display = getDisplayedPrice(plan, billingInterval);
          const isCurrentPaidPlan =
            hasManagedSubscription && subscription.plan === plan.key;

          return (
            <SectionCard
              key={plan.key}
              className={
                plan.featured
                  ? "bg-[linear-gradient(180deg,rgba(33,88,66,0.98),rgba(23,55,44,0.96))] text-white"
                  : "bg-white"
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={
                      plan.featured
                        ? "text-xs font-semibold uppercase tracking-[0.22em] text-white/70"
                        : "text-xs font-semibold uppercase tracking-[0.22em] text-stone"
                    }
                  >
                    {display.cadence}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">{plan.name}</h2>
                  <p
                    className={
                      plan.featured ? "mt-2 text-sm text-white/76" : "mt-2 text-sm text-stone"
                    }
                  >
                    {getPlanAudience(plan)}
                  </p>
                </div>
                {plan.featured ? (
                  <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82">
                    Most popular
                  </span>
                ) : null}
              </div>

              <p className="mt-5 font-display text-4xl">{display.price}</p>
              {plan.key !== "free" ? (
                <p
                  className={
                    plan.featured ? "mt-2 text-sm text-white/70" : "mt-2 text-sm text-stone"
                  }
                >
                  {billingInterval === "yearly" ? "Billed annually on the web." : "Billed monthly on the web."}
                </p>
              ) : null}
              <p
                className={
                  plan.featured
                    ? "mt-4 text-sm leading-7 text-white/82"
                    : "mt-4 text-sm leading-7 text-stone"
                }
              >
                {plan.summary}
              </p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className={
                      plan.featured
                        ? "rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-3 text-sm text-white/86"
                        : "rounded-[1.4rem] border border-charcoal/8 bg-beige/55 px-4 py-3 text-sm text-stone"
                    }
                  >
                    {feature}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void startCheckout(plan)}
                disabled={busyPlan === plan.key}
                className={`mt-6 ${getButtonClass(plan, plan.featured)}`}
              >
                {busyPlan === plan.key
                  ? "Opening..."
                  : plan.key === "free"
                    ? plan.ctaLabel
                    : hasManagedSubscription
                      ? isCurrentPaidPlan
                        ? "Manage Billing"
                        : "Change Plan in Billing"
                      : plan.ctaLabel}
              </button>

              <p
                className={
                  plan.featured
                    ? "mt-3 text-xs leading-6 text-white/68"
                    : "mt-3 text-xs leading-6 text-stone"
                }
              >
                {plan.key === "free"
                  ? "Free remains local/demo-friendly."
                  : hasManagedSubscription
                    ? "Use Stripe Billing to manage changes for an existing subscription."
                    : user
                      ? "Starts a Stripe Checkout subscription for the web app."
                      : "Sign in first, then Stripe Checkout will open for this plan."}
              </p>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
