import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { ReportPdfDocument } from "@/components/reports/report-pdf-document";

describe("ReportPdfDocument", () => {
  it("renders a PDF buffer without crashing", async () => {
    const buffer = await renderToBuffer(
      createElement(ReportPdfDocument, {
        businessName: "YardBrief Demo Studio",
        clientNickname: "Willow client",
        date: "2 May 2026",
        disclaimer:
          "This report is generated from user-provided information and should be reviewed before sending.",
        projectName: "Willow Lane Refresh",
        reportContent: "# Client Brief\n\n## Summary\n\n- Confirm drainage scope\n- Confirm palette",
        reportType: "Client Brief",
        watermarkEnabled: true,
      }),
    );

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
