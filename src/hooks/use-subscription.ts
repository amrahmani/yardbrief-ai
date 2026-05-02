"use client";

import { useMemo } from "react";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { getSubscriptionPlanDefinition } from "@/lib/subscription-store";

export function useSubscription() {
  const { ready, subscription, projectCount } = useWorkspaceData();

  const planDefinition = useMemo(
    () => getSubscriptionPlanDefinition(subscription.plan),
    [subscription.plan],
  );

  const projectLimit =
    planDefinition.projects_limit === null
      ? {
          allowed: true,
          current: projectCount,
          limit: null,
          remaining: null,
        }
      : {
          allowed: projectCount < planDefinition.projects_limit,
          current: projectCount,
          limit: planDefinition.projects_limit,
          remaining: Math.max(planDefinition.projects_limit - projectCount, 0),
        };

  const reportLimit =
    planDefinition.reports_per_month_limit === null
      ? {
          allowed: true,
          current: subscription.reports_generated_this_month,
          limit: null,
          remaining: null,
        }
      : {
          allowed:
            subscription.reports_generated_this_month <
            planDefinition.reports_per_month_limit,
          current: subscription.reports_generated_this_month,
          limit: planDefinition.reports_per_month_limit,
          remaining: Math.max(
            planDefinition.reports_per_month_limit -
              subscription.reports_generated_this_month,
            0,
          ),
        };

  return {
    ready,
    subscription,
    planDefinition,
    localProjectCount: projectCount,
    projectLimit,
    reportLimit,
  };
}
