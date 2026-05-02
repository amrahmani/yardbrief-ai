import { readLocalProjects } from "@/lib/project-store";
import type {
  LocalSubscriptionState,
  SubscriptionPlanDefinition,
  SubscriptionPlanKey,
} from "@/types/yardbrief";

export const LOCAL_SUBSCRIPTION_KEY = "yardbrief-ai-local-subscription";
export const LOCAL_SUBSCRIPTION_EVENT = "yardbrief-ai-subscription-updated";

export const subscriptionPlanDefinitions: Record<
  SubscriptionPlanKey,
  SubscriptionPlanDefinition
> = {
  free: {
    key: "free",
    label: "Free",
    projects_limit: 2,
    reports_per_month_limit: 5,
    ai_generations_per_month_limit: 0,
    team_members_limit: 1,
    watermark_enabled: true,
    custom_branding_enabled: false,
    pdf_export_enabled: true,
    advanced_templates_enabled: false,
  },
  solo: {
    key: "solo",
    label: "Solo",
    projects_limit: 20,
    reports_per_month_limit: 50,
    ai_generations_per_month_limit: 50,
    team_members_limit: 1,
    watermark_enabled: false,
    custom_branding_enabled: false,
    pdf_export_enabled: true,
    advanced_templates_enabled: false,
  },
  pro: {
    key: "pro",
    label: "Pro",
    projects_limit: null,
    reports_per_month_limit: 200,
    ai_generations_per_month_limit: 200,
    team_members_limit: 1,
    watermark_enabled: false,
    custom_branding_enabled: true,
    pdf_export_enabled: true,
    advanced_templates_enabled: true,
  },
  team: {
    key: "team",
    label: "Team",
    projects_limit: null,
    reports_per_month_limit: 500,
    ai_generations_per_month_limit: 500,
    team_members_limit: 10,
    watermark_enabled: false,
    custom_branding_enabled: true,
    pdf_export_enabled: true,
    advanced_templates_enabled: true,
  },
};

export function getUsageMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function createDefaultSubscriptionState(): LocalSubscriptionState {
  return {
    plan: "free",
    status: "demo",
    billing_interval: null,
    usage_month: getUsageMonth(),
    reports_generated_this_month: 0,
    ai_generations_this_month: 0,
    stripe_customer_id: "",
    stripe_subscription_id: "",
    stripe_price_id: "",
    current_period_end: null,
    cancel_at_period_end: false,
  };
}

function isValidPlanKey(value: unknown): value is SubscriptionPlanKey {
  return typeof value === "string" && value in subscriptionPlanDefinitions;
}

function normalizeSubscriptionState(
  value: Partial<LocalSubscriptionState> | null | undefined,
) {
  const defaults = createDefaultSubscriptionState();
  const plan = isValidPlanKey(value?.plan) ? value.plan : defaults.plan;
  const usageMonth = typeof value?.usage_month === "string" ? value.usage_month : defaults.usage_month;
  const monthChanged = usageMonth !== defaults.usage_month;

  return {
    plan,
    status: typeof value?.status === "string" ? value.status : defaults.status,
    billing_interval:
      value?.billing_interval === "monthly" || value?.billing_interval === "yearly"
        ? value.billing_interval
        : defaults.billing_interval,
    usage_month: defaults.usage_month,
    reports_generated_this_month:
      monthChanged || typeof value?.reports_generated_this_month !== "number"
        ? 0
        : Math.max(value.reports_generated_this_month, 0),
    ai_generations_this_month:
      monthChanged || typeof value?.ai_generations_this_month !== "number"
        ? 0
        : Math.max(value.ai_generations_this_month, 0),
    stripe_customer_id:
      typeof value?.stripe_customer_id === "string"
        ? value.stripe_customer_id
        : defaults.stripe_customer_id,
    stripe_subscription_id:
      typeof value?.stripe_subscription_id === "string"
        ? value.stripe_subscription_id
        : defaults.stripe_subscription_id,
    stripe_price_id:
      typeof value?.stripe_price_id === "string"
        ? value.stripe_price_id
        : defaults.stripe_price_id,
    current_period_end:
      typeof value?.current_period_end === "string" || value?.current_period_end === null
        ? (value.current_period_end ?? null)
        : defaults.current_period_end,
    cancel_at_period_end:
      typeof value?.cancel_at_period_end === "boolean"
        ? value.cancel_at_period_end
        : defaults.cancel_at_period_end,
  } satisfies LocalSubscriptionState;
}

export function readSubscriptionState() {
  if (typeof window === "undefined") {
    return createDefaultSubscriptionState();
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_SUBSCRIPTION_KEY);

    if (!raw) {
      return createDefaultSubscriptionState();
    }

    const parsed = JSON.parse(raw) as Partial<LocalSubscriptionState>;
    return normalizeSubscriptionState(parsed);
  } catch {
    return createDefaultSubscriptionState();
  }
}

export function writeSubscriptionState(state: LocalSubscriptionState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_SUBSCRIPTION_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(LOCAL_SUBSCRIPTION_EVENT));
}

export function getSubscriptionPlanDefinition(plan: SubscriptionPlanKey) {
  return subscriptionPlanDefinitions[plan];
}

export function getCurrentSubscriptionPlanDefinition() {
  return getSubscriptionPlanDefinition(readSubscriptionState().plan);
}

export function incrementSubscriptionUsage({
  reports = 0,
  aiGenerations = 0,
}: {
  reports?: number;
  aiGenerations?: number;
}) {
  const current = readSubscriptionState();
  writeSubscriptionState({
    ...current,
    reports_generated_this_month: current.reports_generated_this_month + reports,
    ai_generations_this_month: current.ai_generations_this_month + aiGenerations,
  });
}

export function getLocalProjectCount() {
  return readLocalProjects().length;
}

export function canCreateProject(plan: SubscriptionPlanDefinition) {
  if (plan.projects_limit === null) {
    return {
      allowed: true,
      current: getLocalProjectCount(),
      limit: null,
      remaining: null,
    };
  }

  const current = getLocalProjectCount();
  return {
    allowed: current < plan.projects_limit,
    current,
    limit: plan.projects_limit,
    remaining: Math.max(plan.projects_limit - current, 0),
  };
}

export function canGenerateReport(plan: SubscriptionPlanDefinition) {
  const subscription = readSubscriptionState();

  if (plan.reports_per_month_limit === null) {
    return {
      allowed: true,
      current: subscription.reports_generated_this_month,
      limit: null,
      remaining: null,
    };
  }

  const current = subscription.reports_generated_this_month;
  return {
    allowed: current < plan.reports_per_month_limit,
    current,
    limit: plan.reports_per_month_limit,
    remaining: Math.max(plan.reports_per_month_limit - current, 0),
  };
}
