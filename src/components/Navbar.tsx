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
  X,
} from "lucide-react";
import { ActiveView, NovelProject } from "../types";
import { calculateTotalWords } from "../utils/storage";
import { ThemeModal } from "./ThemeModal";
import { useProjectStore } from "../stores/useProjectStore";

interface NavbarProps {
  project: NovelProject;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onUpdateProject: (updater: (prev: NovelProject) => NovelProject) => void;
  onNewProject: () => void;
  onOpenLocalFolder?: () => void;
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

  // Edit modal fields
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editTargetWords, setEditTargetWords] = useState<number>(50000);
  const [editSynopsis, setEditSynopsis] = useState("");

  const handleOpenEditModal = () => {
    setEditTitle(project.title || "");
    setEditSubtitle(project.subtitle || "");
    setEditAuthor(project.author || "");
    setEditGenre(project.genre || "Ficción");
    setEditTargetWords(project.settings?.targetTotalWords || 50000);
    setEditSynopsis(project.synopsis || project.logline || "");
    setShowProjectMenu(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const trimmedTitle = editTitle.trim();
    const trimmedAuthor = editAuthor.trim() || "Autor desconocido";
    const trimmedGenre = editGenre.trim() || "Ficción";
    const trimmedSubtitle = editSubtitle.trim();
    const trimmedSynopsis = editSynopsis.trim();
    const words = editTargetWords || 50000;

    onUpdateProject((prev) => ({
      ...prev,
      title: trimmedTitle,
      subtitle: trimmedSubtitle,
      author: trimmedAuthor,
      genre: trimmedGenre,
      synopsis: trimmedSynopsis,
      logline: trimmedSynopsis,
      settings: {
        ...prev.settings,
        targetTotalWords: words,
      },
    }));

    const activePath = (project as any).projectPath || useProjectStore.getState().projectPath;
    if (activePath) {
      await useProjectStore.getState().updateProjectMeta(activePath, {
        title: trimmedTitle,
        subtitle: trimmedSubtitle,
        author: trimmedAuthor,
        genre: trimmedGenre,
        synopsis: trimmedSynopsis,
        logline: trimmedSynopsis,
        targetWords: words,
      });
    }

    setShowEditModal(false);
  };

  const totalWords = calculateTotalWords(project);
  const targetWords = project.settings?.targetTotalWords || 50000;
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
    if (tabId === "home") return activeView === "home";
    if (tabId === "manuscript") return activeView === "manuscript" || activeView === "editor";
    if (tabId === "planning") return activeView === "planning";
    if (tabId === "codex") return activeView === "codex" || activeView === "world";
    if (tabId === "relationships") return activeView === "relationships" || activeView === "relations";
    if (tabId === "gallery") return activeView === "gallery";
    if (tabId === "export") return activeView === "export";
    return activeView === tabId;
  };

  const projectPath = (project as any).projectPath as string | undefined;

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
                className="absolute left-0 top-full mt-1 w-80 rounded-xl shadow-xl border p-2 z-50 origin-top-left"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="text-[10px] font-semibold px-2 py-1 text-[var(--text-muted)] uppercase tracking-wider">
                  Novela Activa
                </div>
                <div className="px-2 py-1.5 border-b mb-1 pb-2 border-[var(--border-color)]">
                  <div className="text-sm font-semibold truncate text-[var(--text-main)]">
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

                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      setActiveView("home");
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors"
                  >
                    <Library className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Todas las Novelas (Inicio)</span>
                  </button>

                  {onOpenLocalFolder && (
                    <button
                      onClick={() => {
                        setShowProjectMenu(false);
                        onOpenLocalFolder();
                      }}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)]"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Abrir otra carpeta local...</span>
                    </button>
                  )}

                  <button
                    onClick={handleOpenEditModal}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-main)]"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Configurar y editar novela...</span>
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
                        {project.settings?.enableWordGoals !== false ? "Activas" : "Libre"}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onNewProject();
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity mt-1"
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
        {project.settings?.enableWordGoals !== false ? (
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
        ) : (
          <div
            onClick={onOpenWordGoals}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 mr-3 lg:mr-5 rounded-full text-[11px] font-mono border whitespace-nowrap shrink-0 leading-none select-none cursor-pointer hover:border-[var(--accent)] hover:shadow-xs transition-all"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-color)",
              color: "var(--text-muted)",
            }}
            title="Conteo libre de palabras"
          >
            <span className="font-semibold text-[var(--text-main)]">
              {totalWords.toLocaleString()}
            </span>
            <span className="text-[10px] opacity-80">palabras</span>
          </div>
        )}
      </div>

      {/* Visual separation divider */}
      <div className="hidden xl:block h-4 w-[1px] bg-[var(--border-color)] shrink-0 mr-3 lg:mr-4 opacity-70" />

      {/* Center: Navigation Switcher */}
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

      {/* Right: Save Status, Themes & Export */}
      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
        {/* Local Disk Save Status */}
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

        {/* Theme Selector */}
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
          onClick={() => {
            if (activeView !== "home") setIsZenMode(!isZenMode);
          }}
          disabled={activeView === "home"}
          className={`p-1.5 rounded-md transition-colors ${
            activeView === "home"
              ? "opacity-30 cursor-not-allowed text-[var(--text-muted)]"
              : isZenMode
              ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
              : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
          }`}
          title={
            activeView === "home"
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
        project={project}
        onUpdateProject={onUpdateProject}
      />

      {/* Modal: Editar Datos de la Novela */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-left"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="font-bold text-lg text-[var(--text-main)] font-novel-display flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[var(--accent)]" />
                  <span>Configurar Datos de la Novela</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Modifica los metadatos de tu obra guardados en su archivo project.json.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Ruta física en disco (solo lectura) */}
              {(projectPath || useProjectStore.getState().projectPath) && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                    Ubicación física en disco
                  </label>
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-mono text-[var(--text-muted)] truncate select-all">
                    {projectPath || useProjectStore.getState().projectPath}
                  </div>
                </div>
              )}

              {/* Título */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Título de la Obra *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-sm text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] font-serif"
                  autoFocus
                />
              </div>

              {/* Subtítulo & Autor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                    Subtítulo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                    Nombre del Autor
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Género & Meta de Palabras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                    Género Literario
                  </label>
                  <input
                    type="text"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                    Meta de Palabras Global
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={editTargetWords}
                    onChange={(e) => setEditTargetWords(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-mono text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Sinopsis / Descripción corta */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                  Descripción Corta / Sinopsis
                </label>
                <textarea
                  rows={3}
                  value={editSynopsis}
                  onChange={(e) => setEditSynopsis(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] resize-none leading-relaxed"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
