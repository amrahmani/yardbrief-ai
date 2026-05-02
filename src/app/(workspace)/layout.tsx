import type { ReactNode } from "react";

import { WorkspaceModeBanner } from "@/components/auth/workspace-mode-banner";
import { WorkspaceNav } from "@/components/layout/workspace-nav";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-5 px-4 pb-28 pt-3 sm:px-6 sm:pt-5 lg:gap-6 lg:px-8 lg:pb-8">
      <WorkspaceNav />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <WorkspaceModeBanner />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
