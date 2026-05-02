"use client";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";

export function useAppSettings() {
  const { ready, settings, updateSettings } = useWorkspaceData();
  return { ready, settings, updateSettings };
}
