import React from "react";
import { TopNavigation } from "./navigation/TopNavigation";
import { ActiveView, NovelProject } from "../types";

export interface NavbarProps {
  project: NovelProject | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onNewProject: () => void;
  onOpenLocalFolder?: () => void;
  onOpenDemo?: () => void;
  onCloseProject?: () => void;
  isZenMode?: boolean;
  setIsZenMode?: (val: boolean) => void;
  onOpenExport: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  onOpenWordGoals?: () => void;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return <TopNavigation {...props} />;
};

export { TopNavigation };
