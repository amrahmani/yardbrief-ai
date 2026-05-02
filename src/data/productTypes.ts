import { ProductType } from "@/types/yardbrief";

export interface ProductConfig {
  product_type: ProductType;
  product_name: string;
  target_user: string;
  report_types: string[];
  enabled: boolean;
}

// This config is the expansion point for future SpaceBrief products.
// Today the UI should only expose products whose `enabled` flag is true.
// Future rollout can use the same structure to turn on routes, templates,
// pricing, onboarding, and product-specific settings without reshaping the app.
export const productTypes: ProductConfig[] = [
  {
    product_type: ProductType.YardBrief,
    product_name: "YardBrief",
    target_user: "Landscapers",
    report_types: [
      "Client Brief",
      "Site Visit Report",
      "Scope of Work",
      "Quote-Ready Summary",
      "Change Request Note",
      "Before/After Report",
      "Aftercare Guide",
      "Client Approval Message",
    ],
    enabled: true,
  },
  {
    product_type: ProductType.DecorBrief,
    product_name: "DecorBrief",
    target_user: "Interior decorators",
    report_types: [
      "Client Brief",
      "Room Notes",
      "Style Direction",
      "Scope of Work",
      "Change Request",
      "Client Approval Message",
    ],
    enabled: false,
  },
  {
    product_type: ProductType.KitchenBrief,
    product_name: "KitchenBrief",
    target_user: "Kitchen and bathroom designers",
    report_types: [
      "Measurement Checklist",
      "Fixture/Appliance Notes",
      "Scope of Work",
      "Client Decisions",
      "Variation Note",
      "Installation Readiness Checklist",
    ],
    enabled: false,
  },
  {
    product_type: ProductType.EventBrief,
    product_name: "EventBrief",
    target_user: "Event stylists",
    report_types: [
      "Event Brief",
      "Theme/Style Summary",
      "Venue Notes",
      "Setup Checklist",
      "Client Approval",
      "Change Request",
      "Pack-down Checklist",
    ],
    enabled: false,
  },
];

export const enabledProductTypes = productTypes.filter((product) => product.enabled);

// The current MVP is intentionally single-product in the UI.
// If more than one product becomes enabled later, this helper can be revisited
// to support product switching rather than assuming a single active product.
export const activeProductConfig =
  enabledProductTypes[0] ?? productTypes[0];

export function getProductConfig(productType: ProductType) {
  return productTypes.find((product) => product.product_type === productType);
}

export function getEnabledProductConfigs() {
  return enabledProductTypes;
}

export function getProductAppName(productType: ProductType) {
  const config = getProductConfig(productType);
  return `${config?.product_name ?? "SpaceBrief"} AI`;
}
