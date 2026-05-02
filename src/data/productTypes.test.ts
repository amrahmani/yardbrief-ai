import { describe, expect, it } from "vitest";

import {
  activeProductConfig,
  getEnabledProductConfigs,
  productTypes,
} from "@/data/productTypes";
import { ProductType } from "@/types/yardbrief";

describe("product type config", () => {
  it("enables only YardBrief in the current MVP", () => {
    const enabledProducts = getEnabledProductConfigs();

    expect(enabledProducts).toHaveLength(1);
    expect(enabledProducts[0]?.product_type).toBe(ProductType.YardBrief);
    expect(activeProductConfig.product_type).toBe(ProductType.YardBrief);
    expect(
      productTypes.filter((product) => !product.enabled).map((product) => product.product_type),
    ).toEqual([
      ProductType.DecorBrief,
      ProductType.KitchenBrief,
      ProductType.EventBrief,
    ]);
  });
});
