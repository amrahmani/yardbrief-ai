import { activeProductConfig } from "@/data/productTypes";
import {
  LOCAL_PROJECTS_EVENT,
  LOCAL_PROJECTS_KEY,
  writeLocalProjects,
} from "@/lib/project-store";
import {
  LOCAL_SUBSCRIPTION_EVENT,
  LOCAL_SUBSCRIPTION_KEY,
  createDefaultSubscriptionState,
  writeSubscriptionState,
} from "@/lib/subscription-store";
import { ProductType } from "@/types/yardbrief";
import type { LocalAppSettings } from "@/types/yardbrief";

export const LOCAL_APP_SETTINGS_KEY = "yardbrief-ai-local-app-settings";
export const LOCAL_APP_SETTINGS_EVENT = "yardbrief-ai-app-settings-updated";

export const DEFAULT_REPORT_DISCLAIMER =
  "This report is generated from user-provided information and should be reviewed before sending. It is not legal, engineering, structural, plumbing, electrical, or compliance advice.";

function isValidProductType(value: unknown): value is ProductType {
  return Object.values(ProductType).includes(value as ProductType);
}

export function createDefaultAppSettings(): LocalAppSettings {
  return {
    businessProfile: {
      businessName: "Business Name Placeholder",
      contactEmail: "hello@example.com",
      phone: "",
    },
    reportPreferences: {
      defaultTone: "Professional",
      defaultDisclaimer: DEFAULT_REPORT_DISCLAIMER,
      defaultProductType: activeProductConfig.product_type,
    },
    privacySettings: {
      useClientNicknameByDefault: true,
      doNotRequireExactAddress: true,
      removeImageMetadataBeforeUpload: false,
      cloudSyncEnabled: false,
    },
  };
}

export function readAppSettings() {
  if (typeof window === "undefined") {
    return createDefaultAppSettings();
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_APP_SETTINGS_KEY);

    if (!raw) {
      return createDefaultAppSettings();
    }

    const parsed = JSON.parse(raw) as Partial<LocalAppSettings>;
    const defaults = createDefaultAppSettings();

    return {
      businessProfile: {
        businessName:
          parsed.businessProfile?.businessName ?? defaults.businessProfile.businessName,
        contactEmail:
          parsed.businessProfile?.contactEmail ?? defaults.businessProfile.contactEmail,
        phone: parsed.businessProfile?.phone ?? defaults.businessProfile.phone,
      },
      reportPreferences: {
        defaultTone:
          parsed.reportPreferences?.defaultTone ?? defaults.reportPreferences.defaultTone,
        defaultDisclaimer:
          parsed.reportPreferences?.defaultDisclaimer ??
          defaults.reportPreferences.defaultDisclaimer,
        defaultProductType:
          isValidProductType(parsed.reportPreferences?.defaultProductType)
            ? parsed.reportPreferences.defaultProductType
            : defaults.reportPreferences.defaultProductType,
      },
      privacySettings: {
        useClientNicknameByDefault:
          parsed.privacySettings?.useClientNicknameByDefault ??
          defaults.privacySettings.useClientNicknameByDefault,
        doNotRequireExactAddress:
          parsed.privacySettings?.doNotRequireExactAddress ??
          defaults.privacySettings.doNotRequireExactAddress,
        removeImageMetadataBeforeUpload:
          parsed.privacySettings?.removeImageMetadataBeforeUpload ??
          defaults.privacySettings.removeImageMetadataBeforeUpload,
        cloudSyncEnabled:
          parsed.privacySettings?.cloudSyncEnabled ??
          defaults.privacySettings.cloudSyncEnabled,
      },
    } satisfies LocalAppSettings;
  } catch {
    return createDefaultAppSettings();
  }
}

export function writeAppSettings(settings: LocalAppSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_APP_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(LOCAL_APP_SETTINGS_EVENT));
}

export function resetAllLocalData() {
  writeLocalProjects([]);
  writeSubscriptionState(createDefaultSubscriptionState());
  writeAppSettings(createDefaultAppSettings());
}

export function exportLocalDataSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return {
    appSettings: readAppSettings(),
    localProjectsRaw: window.localStorage.getItem(LOCAL_PROJECTS_KEY),
    subscriptionRaw: window.localStorage.getItem(LOCAL_SUBSCRIPTION_KEY),
  };
}

export function dispatchAllLocalDataEvents() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(LOCAL_APP_SETTINGS_EVENT));
  window.dispatchEvent(new Event(LOCAL_PROJECTS_EVENT));
  window.dispatchEvent(new Event(LOCAL_SUBSCRIPTION_EVENT));
}
