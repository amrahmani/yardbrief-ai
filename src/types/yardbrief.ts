export type PlatformStatus = "Live now" | "Coming soon";
export type ProjectStatus = "Active" | "Awaiting site visit" | "Report ready";
export enum ProductType {
  YardBrief = "yardbrief",
  DecorBrief = "decorbrief",
  KitchenBrief = "kitchenbrief",
  EventBrief = "eventbrief",
}
export type ProjectStage =
  | "Discovery"
  | "Site visit"
  | "Design brief"
  | "Client review"
  | "First visit"
  | "Quote preparation"
  | "Work in progress"
  | "Completed"
  | "Follow-up";
export type ReportStatus = "Drafting" | "Ready to send" | "Shared";
export type ReportTone = "Professional" | "Friendly" | "Concise" | "Detailed";
export type SubscriptionPlanKey = "free" | "solo" | "pro" | "team";
export type BillingInterval = "monthly" | "yearly";
export type SubscriptionStatus =
  | "demo"
  | "checkout_pending"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

export interface SubscriptionPlanDefinition {
  key: SubscriptionPlanKey;
  label: string;
  projects_limit: number | null;
  reports_per_month_limit: number | null;
  ai_generations_per_month_limit: number | null;
  team_members_limit: number | null;
  watermark_enabled: boolean;
  custom_branding_enabled: boolean;
  pdf_export_enabled: boolean;
  advanced_templates_enabled: boolean;
}

export interface LocalSubscriptionState {
  plan: SubscriptionPlanKey;
  status: SubscriptionStatus;
  billing_interval: BillingInterval | null;
  usage_month: string;
  reports_generated_this_month: number;
  ai_generations_this_month: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface BusinessProfileSettings {
  businessName: string;
  contactEmail: string;
  phone: string;
}

export interface DefaultReportPreferencesSettings {
  defaultTone: ReportTone;
  defaultDisclaimer: string;
  defaultProductType: ProductType;
}

export interface PrivacySettings {
  useClientNicknameByDefault: boolean;
  doNotRequireExactAddress: boolean;
  removeImageMetadataBeforeUpload: boolean;
  cloudSyncEnabled: boolean;
}

export interface LocalAppSettings {
  businessProfile: BusinessProfileSettings;
  reportPreferences: DefaultReportPreferencesSettings;
  privacySettings: PrivacySettings;
}

export interface ProductRoadmapItem {
  name: string;
  audience: string;
  status: PlatformStatus;
  summary: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  detail: string;
}

export interface TimelineItem {
  label: string;
  date: string;
  detail: string;
}

export interface SiteObservation {
  label: string;
  value: string;
}

export type SitePhotoType =
  | "Before"
  | "After"
  | "Issue"
  | "Access"
  | "Drainage"
  | "Plant/lawn condition"
  | "Other";

export interface SitePhotoPlaceholder {
  label: string;
  caption: string;
  photoType?: SitePhotoType;
  fileName?: string;
  previewUrl?: string;
}

export interface SiteVisitClientRequirements {
  mainClientGoals: string;
  preferredOutdoorStyle: string;
  budgetRange: string;
  priorityAreas: string;
  mustKeepItems: string;
  mustAvoidItems: string;
}

export interface SiteVisitConditions {
  accessConstraints: string;
  drainageNotes: string;
  slopeNotes: string;
  shadeSunNotes: string;
  soilLawnConditionNotes: string;
  petsChildrenConsiderations: string;
  existingIssues: string;
}

export interface SiteVisitWorkNotes {
  requiredWork: string;
  exclusions: string;
  sitePreparationNeeded: string;
  materialsToBeConfirmed: string;
  clientResponsibilities: string;
}

export interface SiteVisitFormData {
  visitDate: string;
  projectStage: ProjectStage;
  clientRequirements: SiteVisitClientRequirements;
  siteConditions: SiteVisitConditions;
  workNotes: SiteVisitWorkNotes;
  voiceNoteFileName: string;
  voiceNoteFileType: string;
  roughNote: string;
}

export interface SiteVisit {
  scheduledFor: string;
  lead: string;
  attendees: string[];
  checklist: string[];
  observations: SiteObservation[];
  constraints: string[];
  opportunities: string[];
  equipment: string[];
  photos: SitePhotoPlaceholder[];
  form?: SiteVisitFormData;
}

export interface RecentSiteVisit {
  id: string;
  title: string;
  date: string;
  lead: string;
  summary: string;
}

export interface ReportSection {
  title: string;
  body: string;
  bullets: string[];
}

export interface Report {
  id: string;
  title: string;
  type: string;
  tone?: ReportTone;
  markdown?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  audience: string;
  summary: string;
  highlights: string[];
  sections: ReportSection[];
  nextSteps: string[];
}

export interface ProjectMetric {
  label: string;
  value: string;
  detail: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientNickname: string;
  location: string;
  siteType: string;
  briefType: string;
  summary: string;
  notes: string;
  stage: ProjectStage;
  status: ProjectStatus;
  budgetRange: string;
  dueDate: string;
  lastUpdated: string;
  tags: string[];
  metrics: ProjectMetric[];
  goals: string[];
  deliverables: string[];
  timeline: TimelineItem[];
  siteVisit: SiteVisit;
  recentSiteVisits: RecentSiteVisit[];
  reports: Report[];
}

export interface PricingPlan {
  key: SubscriptionPlanKey;
  name: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  starterPrice?: string;
  cadenceLabel: string;
  summary: string;
  featured?: boolean;
  ctaLabel: string;
  features: string[];
}

export interface SettingsItem {
  label: string;
  value: string;
}

export interface SettingsPanel {
  title: string;
  description: string;
  items: SettingsItem[];
}

export interface FormField {
  label: string;
  placeholder: string;
  helper: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
}

export interface FormSection {
  title: string;
  description: string;
  fields: FormField[];
}

export interface ReportTypeOption {
  name: string;
  summary: string;
  output: string;
}
