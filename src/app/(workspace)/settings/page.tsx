"use client";

import Link from "next/link";
import { useState } from "react";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { getProductConfig } from "@/data/productTypes";
import { InlineMessage } from "@/components/ui/inline-message";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionCard } from "@/components/ui/section-card";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useSubscription } from "@/hooks/use-subscription";
import type { ReportTone } from "@/types/yardbrief";

const toneOptions: ReportTone[] = [
  "Professional",
  "Friendly",
  "Concise",
  "Detailed",
];

function formatLimit(value: number | null) {
  return value === null ? "Unlimited" : String(value);
}

function formatEnabled(value: boolean) {
  return value ? "Enabled" : "Off";
}

export default function SettingsPage() {
  const { settings, updateSettings } = useAppSettings();
  const { localProjectCount, planDefinition, subscription } = useSubscription();
  const {
    cloudError,
    cloudStatus,
    exportLocalSnapshot,
    mode,
    resetLocalWorkspace,
    signOut,
    supabaseConfigured,
    user,
  } = useWorkspaceData();
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error" | "info">("success");
  const currentProductConfig = getProductConfig(
    settings.reportPreferences.defaultProductType,
  );

  function persistSettings(nextSettings: typeof settings) {
    void updateSettings(nextSettings).catch((error) => {
      setFeedbackTone("error");
      setFeedbackMessage(
        error instanceof Error ? error.message : "Settings could not be saved right now.",
      );
    });
  }

  function updateBusinessProfile(field: "businessName" | "contactEmail" | "phone", value: string) {
    persistSettings({
      ...settings,
      businessProfile: {
        ...settings.businessProfile,
        [field]: value,
      },
    });
  }

  function updateReportPreferences(
    field: "defaultTone" | "defaultDisclaimer",
    value: string,
  ) {
    persistSettings({
      ...settings,
      reportPreferences: {
        ...settings.reportPreferences,
        [field]: value,
      },
    });
  }

  function updatePrivacySetting(
    field:
      | "useClientNicknameByDefault"
      | "doNotRequireExactAddress"
      | "removeImageMetadataBeforeUpload"
      | "cloudSyncEnabled",
    value: boolean,
  ) {
    persistSettings({
      ...settings,
      privacySettings: {
        ...settings.privacySettings,
        [field]: value,
      },
    });
  }

  function handleExportPlaceholder() {
    const snapshot = exportLocalSnapshot();
    const localProjectsCount = snapshot?.localProjectsRaw
      ? JSON.parse(snapshot.localProjectsRaw).length
      : 0;

    setFeedbackTone("info");
    setFeedbackMessage(
      `Export all local data is still a placeholder. Current local snapshot includes ${localProjectsCount} local projects.`,
    );
  }

  function handleDeleteAllLocalData() {
    const confirmed = window.confirm(
      "Delete all YardBrief local data from this browser and reset settings to defaults?",
    );

    if (!confirmed) {
      return;
    }

    resetLocalWorkspace();
    setFeedbackTone("success");
    setFeedbackMessage("All local browser data was reset to the YardBrief defaults.");
  }

  async function handleSignOut() {
    try {
      await signOut();
      setFeedbackTone("success");
      setFeedbackMessage("Signed out. YardBrief has returned to local demo mode.");
    } catch (error) {
      setFeedbackTone("error");
      setFeedbackMessage(
        error instanceof Error ? error.message : "Sign out could not be completed right now.",
      );
    }
  }

  async function handleOpenBillingPortal() {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Billing portal could not be opened right now.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setFeedbackTone("error");
      setFeedbackMessage(
        error instanceof Error ? error.message : "Billing portal could not be opened right now.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Settings"
        title="Manage your local YardBrief workspace settings."
        description="These controls shape business details, report defaults, privacy behaviour, subscription visibility, and data controls across demo mode and signed-in Supabase mode."
        highlights={[
          "Business details for exports",
          "Privacy defaults for every job",
          "Local and cloud data controls",
        ]}
      />

      {feedbackMessage ? (
        <InlineMessage tone={feedbackTone} title="Workspace update">
          {feedbackMessage}
        </InlineMessage>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.04fr,0.96fr]">
        <div className="space-y-6">
          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              1. Business profile
            </p>
            <p className="mt-3 text-sm leading-7 text-stone">
              These details feed branded outputs where the MVP already supports them, such as PDF
              export business naming. In cloud mode they also sync to Supabase.
            </p>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Business name</span>
                <input
                  type="text"
                  value={settings.businessProfile.businessName}
                  onChange={(event) =>
                    updateBusinessProfile("businessName", event.target.value)
                  }
                  className="yb-field mt-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Contact email</span>
                <input
                  type="email"
                  value={settings.businessProfile.contactEmail}
                  onChange={(event) =>
                    updateBusinessProfile("contactEmail", event.target.value)
                  }
                  className="yb-field mt-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Phone optional</span>
                <input
                  type="tel"
                  value={settings.businessProfile.phone}
                  onChange={(event) => updateBusinessProfile("phone", event.target.value)}
                  placeholder="Optional phone number"
                  className="yb-field mt-2"
                />
              </label>

              <div className="rounded-[1.6rem] border border-dashed border-charcoal/14 bg-beige/45 px-4 py-5">
                <p className="text-sm font-semibold text-charcoal">Logo upload placeholder</p>
                <p className="mt-2 text-sm leading-7 text-stone">
                  Business logo upload will be added later. Pro plan branding rules already exist,
                  but this MVP does not store or render uploaded logo files yet.
                </p>
                <button
                  type="button"
                  className="yb-button yb-button-secondary mt-4"
                >
                  Logo Upload Placeholder
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              2. Default report preferences
            </p>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Default tone</span>
                <select
                  value={settings.reportPreferences.defaultTone}
                  onChange={(event) =>
                    updateReportPreferences(
                      "defaultTone",
                      event.target.value as ReportTone,
                    )
                  }
                  className="yb-field mt-2"
                >
                  {toneOptions.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Default disclaimer</span>
                <textarea
                  rows={5}
                  value={settings.reportPreferences.defaultDisclaimer}
                  onChange={(event) =>
                    updateReportPreferences("defaultDisclaimer", event.target.value)
                  }
                  className="yb-field yb-textarea mt-2 leading-7"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">
                  Default product type
                </span>
                <input
                  type="text"
                  value={currentProductConfig?.product_name ?? "YardBrief"}
                  disabled
                  className="yb-field mt-2 bg-beige/45"
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              3. Privacy settings
            </p>
            <div className="mt-5 space-y-3">
              <label className="flex items-start gap-3 rounded-[1.5rem] border border-charcoal/8 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={settings.privacySettings.useClientNicknameByDefault}
                  onChange={(event) =>
                    updatePrivacySetting(
                      "useClientNicknameByDefault",
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-charcoal/20 accent-forest"
                />
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    Use client nickname by default
                  </p>
                  <p className="mt-1 text-sm leading-7 text-stone">
                    Keeps client identity lighter in forms and reports unless you choose
                    otherwise.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-[1.5rem] border border-charcoal/8 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={settings.privacySettings.doNotRequireExactAddress}
                  onChange={(event) =>
                    updatePrivacySetting(
                      "doNotRequireExactAddress",
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-charcoal/20 accent-forest"
                />
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    Do not require exact address
                  </p>
                  <p className="mt-1 text-sm leading-7 text-stone">
                    Keeps the MVP aligned with suburb-or-area capture rather than exact property
                    address.
                  </p>
                </div>
              </label>

              <div className="rounded-[1.5rem] border border-charcoal/8 bg-beige/45 px-4 py-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={settings.privacySettings.removeImageMetadataBeforeUpload}
                    disabled
                    className="mt-1 h-4 w-4 rounded border-charcoal/20 accent-forest"
                  />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      Remove image metadata before upload, future feature
                    </p>
                    <p className="mt-1 text-sm leading-7 text-stone">
                      Currently off by default. Metadata stripping will be added when photo upload
                      is implemented.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-charcoal/8 bg-beige/45 px-4 py-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={mode === "cloud"}
                    disabled
                    className="mt-1 h-4 w-4 rounded border-charcoal/20 accent-forest"
                  />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      Cloud sync follows sign-in
                    </p>
                    <p className="mt-1 text-sm leading-7 text-stone">
                      Demo mode keeps data in this browser. After you sign in, Supabase becomes the
                      active data store for projects, reports, settings, and subscription usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard className="bg-[linear-gradient(135deg,rgba(232,244,236,0.86),rgba(255,253,248,0.98))]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              4. Subscription
            </p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-charcoal">{planDefinition.label}</h2>
                <p className="mt-2 text-sm leading-7 text-stone">
                  {mode === "cloud"
                    ? "Current plan and usage are loaded from Supabase for this signed-in workspace."
                    : "Current plan and usage stay in local demo mode until you sign in."}
                </p>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest">
                Usage month: {subscription.usage_month}
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                Workspace mode
              </p>
              <p className="mt-3 text-lg font-semibold text-charcoal">
                {mode === "cloud" ? "Supabase cloud mode" : "Local demo mode"}
              </p>
              <p className="mt-2 text-sm leading-7 text-stone">
                {mode === "cloud"
                  ? `Signed in as ${user?.email ?? "your account"}.`
                  : supabaseConfigured
                    ? "Sign in to move your local data into Supabase while keeping demo mode available when signed out."
                    : "Add Supabase environment variables to enable sign-in and cloud sync."}
              </p>
              {cloudStatus === "error" && cloudError ? (
                <p className="mt-3 text-sm font-medium text-[#8A3F31]">{cloudError}</p>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                {mode === "cloud" ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="yb-button yb-button-secondary"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    className="yb-button yb-button-primary"
                  >
                    Sign in to Supabase
                  </Link>
                )}
                <Link
                  href="/pricing"
                  className="yb-button yb-button-secondary"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  Current plan
                </p>
                <p className="mt-3 text-lg font-semibold text-charcoal">{planDefinition.label}</p>
              </div>
              <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  Subscription status
                </p>
                <p className="mt-3 text-lg font-semibold capitalize text-charcoal">
                  {subscription.status.replace(/_/g, " ")}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  Projects used
                </p>
                <p className="mt-3 text-lg font-semibold text-charcoal">
                  {localProjectCount} / {formatLimit(planDefinition.projects_limit)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  Reports this month
                </p>
                <p className="mt-3 text-lg font-semibold text-charcoal">
                  {subscription.reports_generated_this_month} /{" "}
                  {formatLimit(planDefinition.reports_per_month_limit)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  AI generations
                </p>
                <p className="mt-3 text-lg font-semibold text-charcoal">
                  {subscription.ai_generations_this_month} /{" "}
                  {formatLimit(planDefinition.ai_generations_per_month_limit)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  Billing interval
                </p>
                <p className="mt-3 text-lg font-semibold text-charcoal">
                  {subscription.billing_interval ?? "Not set"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  Renewal window
                </p>
                <p className="mt-3 text-lg font-semibold text-charcoal">
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString("en-AU")
                    : "To be confirmed"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Team members limit", formatLimit(planDefinition.team_members_limit)],
                ["PDF export", formatEnabled(planDefinition.pdf_export_enabled)],
                ["Custom branding", formatEnabled(planDefinition.custom_branding_enabled)],
                [
                  "Advanced templates",
                  formatEnabled(planDefinition.advanced_templates_enabled),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-2 rounded-[1.4rem] border border-charcoal/8 bg-beige/45 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-semibold text-charcoal">{label}</span>
                  <span className="text-sm text-stone">{value}</span>
                </div>
              ))}
            </div>

            {mode === "cloud" && subscription.stripe_customer_id ? (
              <button
                type="button"
                onClick={handleOpenBillingPortal}
                className="yb-button yb-button-secondary mt-5"
              >
                Manage Billing
              </button>
            ) : null}

          </SectionCard>

          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              5. Data controls
            </p>
            <p className="mt-3 text-sm leading-7 text-stone">
              Export is still a placeholder in this MVP. Delete resets locally created projects,
              subscription usage, and settings back to defaults for this browser.
            </p>

            <div className="mt-5 space-y-4">
              <button
                type="button"
                onClick={handleExportPlaceholder}
                className="yb-button yb-button-secondary yb-button-full"
              >
                Export all local data placeholder
              </button>

              <button
                type="button"
                onClick={handleDeleteAllLocalData}
                className="yb-button yb-button-danger yb-button-full"
              >
                Delete all local data
              </button>
            </div>
          </SectionCard>

          <SectionCard className="bg-[linear-gradient(180deg,rgba(33,88,66,0.98),rgba(23,55,44,0.96))] text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Local-first note
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/82">
              <p>
                {mode === "cloud"
                  ? "Signed-in changes now save to Supabase while local demo mode remains available when you sign out."
                  : "Changes save locally as you edit in demo mode."}
              </p>
              <p>
                {!supabaseConfigured
                  ? "Supabase auth and sync become available after NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are configured."
                  : "Magic link and email/password sign-in are available from the auth screen."}
              </p>
              <p>Logo upload and export packaging will be expanded in future iterations.</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
