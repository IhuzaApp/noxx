import { createContext, useContext, useState, type ReactNode } from "react";
import { projects, type Project } from "./projects";

type Ctx = {
  current: Project;
  setCurrentId: (id: string) => void;
  all: Project[];
};

const ProjectContext = createContext<Ctx | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState(projects[0].id);
  const current = projects.find((p) => p.id === currentId) ?? projects[0];
  return (
    <ProjectContext.Provider value={{ current, setCurrentId, all: projects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
