import type { Metadata } from "next";

import { WorkspaceDataProvider } from "@/components/providers/workspace-data-provider";
import { activeProductConfig, getProductAppName } from "@/data/productTypes";
import "./globals.css";

const activeProductAppName = getProductAppName(activeProductConfig.product_type);

export const metadata: Metadata = {
  title: {
    default: activeProductAppName,
    template: `%s | ${activeProductAppName}`,
  },
  description:
    "Mobile-first SaaS starter for site visits, briefs, and client-ready landscape reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground font-sans">
        <WorkspaceDataProvider>{children}</WorkspaceDataProvider>
      </body>
    </html>
  );
}
