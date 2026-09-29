import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Calendar,
  Compass,
  Share2,
  Download,
  Palette,
  Maximize2,
  FolderOpen,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Sidebar as SidebarIcon,
  Library,
  Target,
  Image as ImageIcon,
  Check,
  Pencil,
  LogOut,
} from "lucide-react";
import { ActiveView, NovelProject } from "../types";
import { calculateTotalWords } from "../utils/storage";
import { demoProject } from "../data/demoProject";
import { ThemeModal } from "./ThemeModal";
import { EditProjectModal } from "./project/EditProjectModal";
import { useProjectStore } from "../stores/useProjectStore";

interface NavbarProps {
  project: NovelProject | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onNewProject: () => void;
  onOpenLocalFolder?: () => void;
  onOpenDemo?: () => void;
  onCloseProject?: () => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  onOpenExport: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  onOpenWordGoals?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeView,
  setActiveView,
  onUpdateProject,
  onNewProject,
  onOpenLocalFolder,
  onOpenDemo,
  onCloseProject,
  isZenMode,
  setIsZenMode,
  onOpenExport,
  isSidebarOpen,
  onToggleSidebar,
  isSaving = false,
  lastSavedAt,
  onOpenWordGoals,
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const totalWords = project ? calculateTotalWords(project) : 0;
  const targetWords = project?.settings?.targetTotalWords || 50000;
  const progressPercent = project
    ? Math.min(100, Math.round((totalWords / targetWords) * 100))
    : 0;

  const navItems: {
    id: ActiveView;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "home", label: "Inicio", shortLabel: "Inicio", icon: Library },
    { id: "manuscript", label: "Manuscrito", shortLabel: "Manuscrito", icon: BookOpen },
    { id: "planning", label: "Planeación", shortLabel: "Planeación", icon: Calendar },
    { id: "codex", label: "Biblia de Mundo", shortLabel: "Biblia", icon: Compass },
    { id: "relationships", label: "Mapa de Relaciones", shortLabel: "Relaciones", icon: Share2 },
    { id: "gallery", label: "Pizarra Visual", shortLabel: "Pizarra", icon: ImageIcon },
    { id: "export", label: "Maquetación & Exportar", shortLabel: "Exportar", icon: Download },
  ];

  const isTabActive = (tabId: ActiveView) => {
    if (tabId === "home") return activeView === "home";
    if (tabId === "manuscript") return activeView === "manuscript" || activeView === "editor";
    if (tabId === "planning") return activeView === "planning";
    if (tabId === "codex") return activeView === "codex" || activeView === "world";
    if (tabId === "relationships") return activeView === "relationships" || activeView === "relations";
    if (tabId === "gallery") return activeView === "gallery";
    if (tabId === "export") return activeView === "export";
    return activeView === tabId;
  };

  const projectPath = (project as any)?.projectPath as string | undefined;

  return (
    <header
      id="app-navbar"
      className="h-11 border-b px-3 flex items-center justify-between shrink-0 transition-colors relative z-50 select-none"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-color)",
        color: "var(--text-main)",
      }}
    >
      {/* Left: Brand & Project Selector */}
      <div className="flex items-center gap-2.5">
        {onToggleSidebar && (activeView === "manuscript" || activeView === "editor") && (
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
            title="Mostrar/Ocultar esquema del manuscrito"
          >
            <SidebarIcon className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => setActiveView("home")}
          className="flex items-center gap-1.5 font-novel-display font-bold text-sm sm:text-base tracking-wide text-[var(--text-main)] hover:opacity-85 transition-opacity cursor-pointer"
          title="Ir al inicio"
        >
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <span>NOVELORE</span>
        </button>

        <div className="h-3.5 w-px bg-[var(--border-color)]" />

        {/* Project Dropdown */}
        <div className="relative">
          <motion.button
            id="project-selector-btn"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-[var(--border-color)] cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="max-w-[140px] sm:max-w-[180px] truncate font-serif font-semibold text-xs">
              {project ? project.title || "Novela sin título" : "Sin novela activa"}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </motion.button>

          <AnimatePresence>
            {showProjectMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute left-0 top-full mt-1 w-80 rounded-xl shadow-xl border p-2 z-50 origin-top-left"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="text-[10px] font-semibold px-2 py-1 text-[var(--text-muted)] uppercase tracking-wider">
                  {project ? "Novela Activa" : "Estado"}
                </div>
                {project ? (
                  <div className="px-2 py-1.5 border-b mb-1 pb-2 border-[var(--border-color)]">
                    <div className="text-sm font-semibold truncate text-[var(--text-main)] font-serif">
                      {project.title}
                    </div>
                    <div className="text-xs font-normal text-[var(--text-muted)] mt-0.5">
                      {totalWords.toLocaleString()} palabras • {project.genre || "Ficción"}
                    </div>
                    {projectPath && (
                      <div
                        className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-1 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded"
                        title={projectPath}
                      >
                        {projectPath}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-2 py-1.5 border-b mb-1 pb-2 border-[var(--border-color)]">
                    <div className="text-xs text-[var(--text-muted)]">
                      Ninguna novela abierta actualmente
                    </div>
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      setActiveView("home");
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                  >
                    <Library className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Todas las Novelas (Inicio)</span>
                  </button>

                  {/* Probar demo si no hay proyecto activo */}
                  {!project && onOpenDemo && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onOpenDemo();
                      }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--accent)] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Probar Novela de Ejemplo</span>
                    </button>
                  )}

                  {onOpenLocalFolder && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onOpenLocalFolder();
                      }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)] cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{project ? "Abrir otra carpeta local..." : "Abrir carpeta local..."}</span>
                    </button>
                  )}

                  {project && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        setShowEditModal(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)] cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Configurar y editar novela...</span>
                    </button>
                  )}

                  {/* Word Goals Option */}
                  {project && onOpenWordGoals && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onOpenWordGoals();
                      }}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Metas y Objetivos de Palabras</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">
                        {project.settings?.enableWordGoals !== false ? "Activas" : "Libre"}
                      </span>
                    </button>
                  )}

                  {project && onCloseProject && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onCloseProject();
                      }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Novela / Volver al Taller</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onNewProject();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity mt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[var(--accent-contrast)]" />
                    <span>Crear Nueva Novela</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Word count pill */}
        {project && project.settings?.enableWordGoals !== false ? (
          <div
            onClick={onOpenWordGoals}
            className="hidden xl:flex items-center gap-2 px-3 py-1 mr-3 lg:mr-5 rounded-full text-[11px] font-mono border whitespace-nowrap shrink-0 leading-none select-none cursor-pointer hover:border-[var(--accent)] hover:shadow-xs transition-all"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
            title={`Meta de palabras: ${totalWords.toLocaleString()} / ${targetWords.toLocaleString()} (${progressPercent}%)`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="font-semibold text-[var(--text-main)]">
              {totalWords.toLocaleString()}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              / {targetWords.toLocaleString()}
            </span>
            <span className="text-[10px] text-[var(--accent)] font-semibold">
              {progressPercent}%
            </span>
          </div>
        ) : project ? (
          <div
            onClick={onOpenWordGoals}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 mr-3 lg:mr-5 rounded-full text-[11px] font-mono border whitespace-nowrap shrink-0 leading-none select-none cursor-pointer hover:border-[var(--accent)] hover:shadow-xs transition-all"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-color)",
              color: "var(--text-muted)",
            }}
            title="Escritura libre sin metas de conteo de palabras activas"
          >
            <span className="font-semibold text-[var(--text-main)]">
              {totalWords.toLocaleString()}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">palabras</span>
          </div>
        ) : null}
      </div>

      {/* Visual separation divider */}
      <div className="hidden xl:block h-4 w-[1px] bg-[var(--border-color)] shrink-0 mr-3 lg:mr-4 opacity-70" />

      {/* Center: Navigation Switcher */}
      <nav className="flex items-center gap-0.5 bg-[var(--bg-input)] p-0.5 rounded-lg border border-[var(--border-color)] relative overflow-x-auto scrollbar-none min-w-0 max-w-full shrink mx-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isTabActive(item.id);
          const isHome = item.id === "home";
          const isDimmed = !isHome && !project;

          return (
            <motion.button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveView(item.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-[var(--text-main)] font-semibold"
                  : isDimmed
                  ? "opacity-60 hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title={
                isDimmed
                  ? `${item.label} (Requiere una novela activa — clic para abrir una o probar la demo)`
                  : item.label
              }
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-[var(--bg-card)] rounded-md border border-[var(--border-color)] shadow-2xs -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline xl:hidden">{item.shortLabel}</span>
              <span className="hidden xl:inline">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Right: Save Status, Themes & Export */}
      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
        {/* Local Disk Save Status */}
        {project && (
          <div
            id="navbar-save-status"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-[var(--text-muted)] select-none shrink-0"
            title={
              isSaving
                ? "Guardando cambios en disco..."
                : lastSavedAt
                ? `Guardado en disco: ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Guardado localmente en disco"
            }
          >
            {isSaving ? (
              <RefreshCw className="w-3 h-3 text-[var(--accent)] animate-spin shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span className="hidden sm:inline font-mono">
              {isSaving ? "Guardando..." : "En disco"}
            </span>
          </div>
        )}

        {/* Theme Selector - Disponible siempre */}
        <motion.button
          id="theme-menu-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowThemeModal(true)}
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          title="Temas y atmósferas de escritura"
        >
          <Palette className="w-3.5 h-3.5" />
        </motion.button>

        {/* Zen Distraction-Free Mode */}
        <motion.button
          id="zen-mode-btn"
          whileHover={activeView === "home" || !project ? {} : { scale: 1.04 }}
          whileTap={activeView === "home" || !project ? {} : { scale: 0.96 }}
          onClick={() => {
            if (activeView !== "home" && project) setIsZenMode(!isZenMode);
          }}
          disabled={activeView === "home" || !project}
          className={`p-1.5 rounded-md transition-colors ${
            activeView === "home" || !project
              ? "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
              : isZenMode
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] cursor-pointer"
              : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
          }`}
          title={
            activeView === "home" || !project
              ? "El Modo Zen se activa dentro del manuscrito"
              : isZenMode
              ? "Salir del Modo Zen"
              : "Modo Zen libre de distracciones"
          }
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </motion.button>

        {/* Export Shortcut */}
        <motion.button
          id="quick-export-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenExport}
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          title="Maquetación editorial y exportación"
        >
          <Download className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Floating Theme Customizer Modal */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        project={project || demoProject}
        onUpdateProject={project ? onUpdateProject : () => {}}
      />

      {/* Modal: Editar Datos de la Novela */}
      {project && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={project}
          onUpdateProject={onUpdateProject}
        />
      )}
    </header>
  );
};
