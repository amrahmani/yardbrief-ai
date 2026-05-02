"use client";

import { createContext, useContext } from "react";

import type { Project } from "@/types/yardbrief";

interface ProjectContextValue {
  project: Project | null;
  projectId: string;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

interface ProjectProviderProps {
  children: React.ReactNode;
  project: Project | null;
  projectId: string;
}

export function ProjectProvider({
  children,
  project,
  projectId,
}: ProjectProviderProps) {
  return (
    <ProjectContext.Provider value={{ project, projectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useCurrentProject() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useCurrentProject must be used within ProjectProvider.");
  }

  return context;
}
