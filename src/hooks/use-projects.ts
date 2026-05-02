"use client";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";

export function useProjects() {
  const { projects, ready } = useWorkspaceData();
  return { projects, ready };
}
