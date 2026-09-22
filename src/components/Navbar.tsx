import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Calendar,
  Compass,
  Share2,
  BarChart2,
  Download,
  Palette,
  Maximize2,
  FolderOpen,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Upload,
  Sidebar as SidebarIcon,
  Library,
  Layers,
  FileUp,
  History,
  Cloud,
  CloudOff,
  CloudCheck,
  Target,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { User } from "firebase/auth";
import { onAuthUserChanged, getCurrentUser } from "../lib/firebase";
import { ActiveView, NovelProject, ProjectSettings } from "../types";
import { calculateTotalWords, exportProjectToNovelistFile } from "../utils/storage";
import { ThemeModal } from "./ThemeModal";

interface NavbarProps {
  project: NovelProject;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onNewProject: () => void;
  onResetDemo: () => void;
  onImportJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  onOpenExport: () => void;
  onOpenVersions: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  syncStatus?: "idle" | "saving" | "saved" | "error" | "offline";
  lastSyncedAt?: Date | null;
  onOpenCloudSync?: () => void;
  onOpenWordGoals?: () => void;
  isStorageDegraded?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeView,
  setActiveView,
  onUpdateProject,
  onNewProject,
  onResetDemo,
  onImportJson,
  isZenMode,
  setIsZenMode,
  onOpenExport,
  onOpenVersions,
  isSidebarOpen,
  onToggleSidebar,
  syncStatus = "saved",
  lastSyncedAt,
  onOpenCloudSync,
  onOpenWordGoals,
  isStorageDegraded = false,
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    const unsub = onAuthUserChanged((u) => setAuthUser(u));
    return () => unsub();
  }, []);

  const totalWords = calculateTotalWords(project);
  const targetWords = project.settings.targetTotalWords || 50000;
  const progressPercent = Math.min(100, Math.round((totalWords / targetWords) * 100));

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
    if (tabId === "home") {
      return activeView === "home";
    }
    if (tabId === "manuscript") {
      return activeView === "manuscript" || activeView === "editor";
    }
    if (tabId === "planning") {
      return activeView === "planning";
    }
    if (tabId === "codex") {
      return activeView === "codex" || activeView === "world";
    }
    if (tabId === "relationships") {
      return activeView === "relationships" || activeView === "relations";
    }
    if (tabId === "gallery") {
      return activeView === "gallery";
    }
    if (tabId === "export") {
      return activeView === "export";
    }
    return activeView === tabId;
  };

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
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
            title="Mostrar/Ocultar esquema del manuscrito"
          >
            <SidebarIcon className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => setActiveView("home")}
          className="flex items-center gap-1.5 font-novel-display font-bold text-sm sm:text-base tracking-wide text-[var(--text-main)] hover:opacity-85 transition-opacity"
          title="Ir a la página de Inicio y Gestión de Proyectos"
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
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-[var(--border-color)]"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="max-w-[140px] sm:max-w-[180px] truncate font-serif font-semibold text-xs">
              {project.title || "Novela sin título"}
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
                className="absolute left-0 top-full mt-1 w-72 rounded-xl shadow-xl border p-2 z-50 origin-top-left"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="text-[10px] font-semibold px-2 py-1 text-[var(--text-muted)] uppercase tracking-wider">
                  Proyecto Activo
                </div>
                <div className="px-2 py-1.5 text-sm font-semibold truncate border-b mb-1 pb-2 border-[var(--border-color)]">
                  {project.title}
                  <div className="text-xs font-normal text-[var(--text-muted)]">
                    {totalWords.toLocaleString()} palabras • {project.genre || "Ficción"}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      setActiveView("home");
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors"
                  >
                    <Library className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Gestionar Todas las Novelas</span>
                  </button>

                  {/* Word Goals Option */}
                  {onOpenWordGoals && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onOpenWordGoals();
                      }}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)]"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Metas y Objetivos de Palabras</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold">
                        {project.settings.enableWordGoals !== false ? "Activas" : "Libre"}
                      </span>
                    </button>
                  )}

                  {/* Cloud Sync Option */}
                  {onOpenCloudSync && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onOpenCloudSync();
                      }}
                      className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)]"
                    >
                      <div className="flex items-center gap-2">
                        <Cloud className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Guardado en la Nube & Respaldos</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        Online
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onNewProject();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5 text-[var(--accent-contrast)]" />
                    <span>Crear Nueva Novela</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      exportProjectToNovelistFile(project);
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)] font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Exportar archivo propio (.nvl)</span>
                  </button>

                  {/* Autoguardado de Versiones (3 últimas versiones) */}
                  <button
                    id="btn-project-versions"
                    onClick={() => {
                      setShowProjectMenu(false);
                      onOpenVersions();
                    }}
                    className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)]"
                    title="Abrir historial de autoguardado (últimas 3 versiones) y restaurar sesiones anteriores"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Autoguardado de Versiones</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] font-bold">
                      3 máx.
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onResetDemo();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Cargar Novela Demo (Fantasía)</span>
                  </button>

                  {onImportJson && (
                    <label className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importar archivo (.nvl / .novelist / .json)</span>
                      <input
                        type="file"
                        accept=".nvl,.novelist,.json"
                        onChange={(e) => {
                          setShowProjectMenu(false);
                          onImportJson(e);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Word count pill - separated with generous margin from the tab bar */}
        {project.settings.enableWordGoals !== false ? (
          <div
            onClick={() => onOpenWordGoals?.()}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 mr-3 lg:mr-5 rounded-full text-[11px] font-mono border whitespace-nowrap shrink-0 leading-none select-none cursor-pointer hover:border-[var(--accent)] hover:shadow-xs transition-all"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-color)",
              color: "var(--text-muted)",
            }}
            title={`Objetivo: ${targetWords.toLocaleString()} palabras (${progressPercent}% completado) - Clic para ajustar metas`}
          >
            <span className="font-semibold text-[var(--text-main)]">
              {totalWords.toLocaleString()}
            </span>
            <span className="text-[10px] opacity-80 hidden 2xl:inline">/ {targetWords.toLocaleString()} pal.</span>
            <div className="w-6 2xl:w-8 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shrink-0 ml-0.5">
              <div
                className="h-full bg-[var(--accent)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div
            onClick={() => onOpenWordGoals?.()}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 mr-3 lg:mr-5 rounded-full text-[11px] font-mono border whitespace-nowrap shrink-0 leading-none select-none cursor-pointer hover:border-[var(--accent)] hover:shadow-xs transition-all"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-color)",
              color: "var(--text-muted)",
            }}
            title="Conteo libre de palabras (Metas desactivadas) - Clic para configurar metas"
          >
            <span className="font-semibold text-[var(--text-main)]">
              {totalWords.toLocaleString()}
            </span>
            <span className="text-[10px] opacity-80">palabras</span>
          </div>
        )}
      </div>

      {/* Visual separation divider between project info / word counter and navigation tabs */}
      <div className="hidden xl:block h-4 w-[1px] bg-[var(--border-color)] shrink-0 mr-3 lg:mr-4 opacity-70" />

      {/* Center: Navigation Switcher - Fluid with responsive labels and overflow protection */}
      <nav className="flex items-center gap-0.5 bg-[var(--bg-input)] p-0.5 rounded-lg border border-[var(--border-color)] relative overflow-x-auto scrollbar-none min-w-0 max-w-full shrink mx-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isTabActive(item.id);

          return (
            <motion.button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveView(item.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
                isActive
                  ? "text-[var(--text-main)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title={item.label}
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

      {/* Right: Quick Utilities, Cloud, Themes & Export - Always fully visible, never clipped */}
      <div className="flex items-center gap-1 shrink-0 ml-1.5">
        {/* Storage Degraded Warning Indicator */}
        {isStorageDegraded && (
          <div
            id="storage-degraded-badge"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0"
            title="Almacenamiento no persistente: IndexedDB no está disponible o falló la escritura. Los cambios se mantienen en memoria temporal y se perderán al cerrar la pestaña. Exporta una copia para respaldar."
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="hidden sm:inline">Modo temporal (No persistente)</span>
            <span className="sm:hidden">Temporal</span>
          </div>
        )}

        {/* Cloud Sync Status & Trigger */}
        {onOpenCloudSync && (
          <motion.button
            id="navbar-cloud-sync-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenCloudSync}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border border-transparent hover:border-[var(--border-color)] shrink-0"
            title={
              isStorageDegraded
                ? "Almacenamiento no persistente: Los cambios no se guardan de forma duradera en el navegador."
                : authUser && !authUser.isAnonymous
                ? `Conectado con Google: ${authUser.email || authUser.displayName} (Gestionar sincronización)`
                : syncStatus === "saving"
                ? "Sincronizando con la nube..."
                : syncStatus === "offline"
                ? "Modo sin conexión: Los cambios están a salvo localmente y se sincronizarán al reconectar"
                : syncStatus === "error"
                ? "Error al guardar en la nube (haz clic para revisar o reintentar)"
                : lastSyncedAt
                ? `Copia en la nube actualizada (Última: ${lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
                : "Guardado en la Nube y sincronización con Google"
            }
          >
            {authUser && !authUser.isAnonymous ? (
              authUser.photoURL ? (
                <img
                  src={authUser.photoURL}
                  alt={authUser.displayName || "Google"}
                  className="w-4 h-4 rounded-full object-cover border border-[var(--border-color)] shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                  {authUser.displayName ? authUser.displayName[0].toUpperCase() : "G"}
                </span>
              )
            ) : !authUser ? (
              <Cloud className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            ) : syncStatus === "saving" ? (
              <RefreshCw className="w-3.5 h-3.5 text-[var(--accent)] animate-spin shrink-0" />
            ) : syncStatus === "offline" ? (
              <CloudOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : syncStatus === "error" ? (
              <Cloud className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : (
              <CloudCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
            <span className="hidden xl:inline text-[11px] font-medium">
              {isStorageDegraded
                ? "No persistente"
                : project.isDemo || project.id === "proj-sombras-alcaraz"
                ? "Copia local"
                : !authUser
                ? "Modo local"
                : syncStatus === "saving"
                ? "Guardando..."
                : syncStatus === "offline"
                ? "Sin conexión"
                : syncStatus === "error"
                ? "Reintentar guardado"
                : "Guardado en nube"}
            </span>
          </motion.button>
        )}

        {/* Theme Selector - Opens floating ThemeModal */}
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
          whileHover={activeView === "home" ? {} : { scale: 1.04 }}
          whileTap={activeView === "home" ? {} : { scale: 0.96 }}
          disabled={activeView === "home"}
          onClick={() => setIsZenMode(!isZenMode)}
          className={`p-1.5 rounded-md transition-colors ${
            activeView === "home"
              ? "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
              : isZenMode
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs"
              : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
          title={
            activeView === "home"
              ? "El Modo Enfoque/Zen está deshabilitado en la pantalla de Inicio"
              : "Modo Enfoque / Zen (Sin distracciones)"
          }
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </motion.button>

        {/* Direct .nvl Export Button */}
        <motion.button
          id="navbar-export-nvl-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            exportProjectToNovelistFile(project);
          }}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--bg-input)] hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-main)] border border-[var(--border-color)] transition-colors cursor-pointer shrink-0"
          title="Descargar copia de seguridad editable en formato propio .nvl"
        >
          <FileUp className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span className="hidden lg:inline">Exportar .nvl</span>
          <span className="hidden sm:inline lg:hidden">.nvl</span>
        </motion.button>

        {/* Export Modal trigger */}
        <motion.button
          id="export-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[var(--accent-contrast)] shrink-0" />
          <span>Exportar</span>
        </motion.button>
      </div>

      {/* Floating Theme Customization Modal */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        project={project}
        onUpdateProject={onUpdateProject}
      />
    </header>
  );
};
