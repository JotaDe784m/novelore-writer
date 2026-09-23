import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  FolderOpen,
  Sparkles,
  Clock,
  Target,
  FileText,
  ChevronRight,
  Library,
  SlidersHorizontal,
  X,
  Compass,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { useProjectStore } from "../../stores/useProjectStore";
import { NovelProject, ProjectView, RecentProjectMeta } from "../../types";

interface HomeDashboardProps {
  currentProject: NovelProject;
  onSelectProject: (project: NovelProject) => void;
  onNavigateView: (view: ProjectView) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentProject,
  onSelectProject,
  onNavigateView,
}) => {
  const recentProjects = useProjectStore((s) => s.recentProjects);
  const loadRecentProjects = useProjectStore((s) => s.loadRecentProjects);
  const removeRecentProject = useProjectStore((s) => s.removeRecentProject);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "words">("recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Formulario de nueva novela
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newGenre, setNewGenre] = useState("Fantasía");
  const [newLogline, setNewLogline] = useState("");
  const [newSynopsis, setNewSynopsis] = useState("");
  const [newTargetWords, setNewTargetWords] = useState(50000);

  // Formulario de edición de novela existente
  const [editingProject, setEditingProject] = useState<RecentProjectMeta | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editSynopsis, setEditSynopsis] = useState("");
  const [editTargetWords, setEditTargetWords] = useState(50000);

  useEffect(() => {
    loadRecentProjects();
  }, [currentProject]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const handleOpenLocalFolder = async () => {
    if (!window.electronAPI?.openProjectFolder) {
      showToast("El selector nativo requiere ejecutar Novelore en Electron (npm run dev:electron)", "error");
      return;
    }
    const openedProject = await useProjectStore.getState().openProjectFolder();
    if (openedProject) {
      onSelectProject(openedProject);
      showToast(`¡Novela "${openedProject.title}" abierta desde carpeta local!`);
      onNavigateView("manuscript");
    } else {
      const errorMsg = useProjectStore.getState().errorMessage;
      if (errorMsg) {
        showToast(errorMsg, "error");
      }
    }
  };

  const handleOpenRecent = async (folderPath: string) => {
    const loadedProject = await useProjectStore.getState().initOrLoadFromPath(folderPath);
    if (loadedProject) {
      onSelectProject(loadedProject);
      showToast(`Novela "${loadedProject.title}" cargada`);
      onNavigateView("manuscript");
    } else {
      const errorMsg = useProjectStore.getState().errorMessage;
      showToast(errorMsg || "No se pudo cargar la novela seleccionada", "error");
    }
  };

  const handleRemoveRecent = async (e: React.MouseEvent, folderPath: string) => {
    e.stopPropagation();
    await removeRecentProject(folderPath);
    showToast("Novela quitada del historial reciente");
  };

  const handleStartEditProject = (e: React.MouseEvent, p: RecentProjectMeta) => {
    e.stopPropagation();
    setEditingProject(p);
    setEditTitle(p.title || "");
    setEditSubtitle(p.subtitle || "");
    setEditAuthor(p.author || "");
    setEditGenre(p.genre || "Ficción");
    setEditSynopsis(p.synopsis || p.logline || "");
    setEditTargetWords(
      currentProject?.title === p.title ? currentProject.settings?.targetTotalWords || 50000 : 50000
    );
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editTitle.trim()) {
      showToast("Por favor ingresa un título para la novela", "error");
      return;
    }

    const store = useProjectStore.getState();
    const success = await store.updateProjectMeta(editingProject.path, {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      author: editAuthor.trim() || "Autor",
      genre: editGenre.trim() || "Ficción",
      synopsis: editSynopsis.trim(),
      targetWords: editTargetWords || 50000,
    });

    if (success) {
      if (currentProject?.title === editingProject.title) {
        onSelectProject({
          ...currentProject,
          title: editTitle.trim(),
          subtitle: editSubtitle.trim(),
          author: editAuthor.trim() || "Autor",
          genre: editGenre.trim() || "Ficción",
          synopsis: editSynopsis.trim(),
          settings: {
            ...currentProject.settings,
            targetTotalWords: editTargetWords || 50000,
          },
        });
      }
      setEditingProject(null);
      showToast(`¡Novela "${editTitle.trim()}" actualizada con éxito!`);
    } else {
      showToast(store.errorMessage || "Error al actualizar los datos", "error");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Por favor ingresa un título para la novela", "error");
      return;
    }

    if (!window.electronAPI?.createProjectFolder) {
      showToast("La creación nativa requiere ejecutar Novelore en Electron", "error");
      return;
    }

    const createdProject = await useProjectStore.getState().createProjectFolder({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      author: newAuthor.trim() || "Autor",
      genre: newGenre.trim() || "Ficción",
      synopsis: newSynopsis.trim(),
      logline: newLogline.trim(),
      targetWords: newTargetWords || 50000,
    });

    if (createdProject) {
      onSelectProject(createdProject);
      setIsCreateModalOpen(false);
      // Reset form
      setNewTitle("");
      setNewSubtitle("");
      setNewAuthor("");
      setNewLogline("");
      setNewSynopsis("");
      showToast(`¡Novela "${createdProject.title}" creada en tu equipo!`);
      onNavigateView("manuscript");
    } else {
      const errorMsg = useProjectStore.getState().errorMessage;
      if (errorMsg) {
        showToast(errorMsg, "error");
      }
    }
  };

  const filteredProjects = recentProjects
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.author && p.author.toLowerCase().includes(q)) ||
        (p.genre && p.genre.toLowerCase().includes(q)) ||
        (p.synopsis && p.synopsis.toLowerCase().includes(q)) ||
        (p.logline && p.logline.toLowerCase().includes(q)) ||
        (p.path && p.path.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "words") {
        return (b.wordCount || 0) - (a.wordCount || 0);
      }
      return 0;
    });

  const totalAllWords = recentProjects.reduce(
    (acc, p) => acc + (p.wordCount || 0),
    0
  );

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recientemente";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recientemente";
    }
  };

  return (
    <div
      id="novelore-home-dashboard"
      className="flex-1 overflow-y-auto min-h-0 select-none p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6"
    >
      {/* Toast Feedback */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl border backdrop-blur-md ${
              feedbackMsg.type === "error"
                ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            }`}
          >
            <span>{feedbackMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER HERO: Título + Acciones Principales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-novel-display text-[var(--text-main)] flex items-center gap-2.5">
            <Library className="w-7 h-7 text-[var(--accent)]" />
            <span>Taller Literario</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Soberanía Local-First: Tus novelas residen exclusivamente como archivos limpios en tu equipo.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Abrir Carpeta Local (Electron) */}
          <motion.button
            id="btn-open-local-folder"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenLocalFolder}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Seleccionar una carpeta de novela en tu equipo"
          >
            <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
            <span>Abrir Carpeta Local</span>
          </motion.button>

          {/* Nueva Novela */}
          <motion.button
            id="btn-new-novel"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setNewTitle("");
              setNewSubtitle("");
              setNewAuthor(currentProject?.author || "");
              setNewGenre("Fantasía");
              setNewLogline("");
              setNewSynopsis("");
              setNewTargetWords(50000);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-[var(--accent)] text-[var(--accent-contrast)] rounded-xl shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[var(--accent-contrast)]" />
            <span>Nueva Novela</span>
          </motion.button>
        </div>
      </div>

      {/* SECCIÓN: PROYECTOS RECIENTES EN DISCO */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-novel-display text-[var(--text-main)]">
              Novelas Recientes ({recentProjects.length})
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Palabras acumuladas: <strong className="text-[var(--text-main)]">{totalAllWords.toLocaleString()}</strong>
            </p>
          </div>

          {/* Buscador y Ordenador */}
          {recentProjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar por título, autor o ruta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] w-56 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1 border border-[var(--border-color)] rounded-xl p-1 bg-[var(--bg-input)] text-xs">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    sortBy === "recent"
                      ? "bg-[var(--bg-card)] text-[var(--text-main)] font-semibold shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Reciente
                </button>
                <button
                  onClick={() => setSortBy("title")}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    sortBy === "title"
                      ? "bg-[var(--bg-card)] text-[var(--text-main)] font-semibold shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Título
                </button>
                <button
                  onClick={() => setSortBy("words")}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    sortBy === "words"
                      ? "bg-[var(--bg-card)] text-[var(--text-main)] font-semibold shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Palabras
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LISTA O ESTADO VACÍO */}
        {recentProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-12 text-center bg-[var(--bg-card)]/40 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-[var(--text-muted)]">
              <FolderOpen className="w-8 h-8 text-[var(--accent)] opacity-80" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="font-bold text-base text-[var(--text-main)] font-novel-display">
                No hay novelas recientes
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Empieza creando una nueva novela en cualquier carpeta de tu disco duro o abre una carpeta existente que ya contenga tu proyecto.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleOpenLocalFolder}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
              >
                Abrir Carpeta Local
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
              >
                + Crear Nueva Novela
              </button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-color)] p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)]/30">
            No se encontraron novelas que coincidan con la búsqueda «{searchQuery}».
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((p) => {
              const isCurrent = currentProject?.title === p.title;

              return (
                <motion.div
                  key={p.path}
                  whileHover={{ y: -2 }}
                  className={`rounded-2xl border p-4.5 bg-[var(--bg-card)] shadow-xs transition-all relative flex flex-col justify-between group ${
                    isCurrent
                      ? "border-[var(--accent)]/50 ring-1 ring-[var(--accent)]/20"
                      : "border-[var(--border-color)] hover:border-[var(--border-color)]/80"
                  }`}
                >
                  {/* Top card info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-[var(--text-main)] truncate font-serif">
                            {p.title}
                          </h3>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shrink-0">
                              Activa
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] truncate">
                          {p.author || "Autor desconocido"} • {p.genre || "Ficción"}
                        </div>
                      </div>

                      {/* Botones de acción de la tarjeta */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => handleStartEditProject(e, p)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                          title="Editar datos de la novela (título, autor, sinopsis, etc.)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleRemoveRecent(e, p.path)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Quitar del historial reciente (no borra los archivos del disco)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Descripción corta / Sinopsis de la novela */}
                    {(p.synopsis || p.logline || p.subtitle) && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {p.synopsis || p.logline || p.subtitle}
                      </p>
                    )}

                    {/* Ruta física en disco */}
                    <div
                      className="text-[10px] font-mono text-[var(--text-muted)] truncate bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md"
                      title={p.path}
                    >
                      {p.path}
                    </div>
                  </div>

                  {/* Bottom metrics & button */}
                  <div className="pt-4 border-t border-[var(--border-color)] mt-3 flex items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-[var(--text-muted)]">
                      <strong className="text-[var(--text-main)]">
                        {(p.wordCount || 0).toLocaleString()}
                      </strong>{" "}
                      palabras • {formatDate(p.updatedAt)}
                    </div>

                    <button
                      onClick={() => handleOpenRecent(p.path)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Abrir</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: NUEVA NOVELA (CON SELECTOR DE CARPETA NATIVO) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="font-bold text-lg text-[var(--text-main)] font-novel-display">
                  Crear Nueva Novela
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Se creará la estructura local en la carpeta que tú elijas.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Título */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Título de la Obra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Crónica del Viento de Obsidiana"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                    placeholder="Ej: Libro Primero de las Sombras"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                    Nombre del Autor
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre o seudónimo"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
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
                    placeholder="Fantasía, Ciencia Ficción, Thriller..."
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
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
                    value={newTargetWords}
                    onChange={(e) => setNewTargetWords(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-mono text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* Sinopsis */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                  Premisa / Sinopsis Breve
                </label>
                <textarea
                  rows={2}
                  placeholder="¿De qué trata la historia? (puedes cambiarla después)"
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)] resize-none"
                />
              </div>

              {/* Advertencia explícita sobre modificación de la carpeta - Alto Contraste y Totalmente Legible */}
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-[var(--bg-input)] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span className="font-semibold text-xs text-[var(--text-main)]">
                    Aviso: Se modificará la carpeta seleccionada
                  </span>
                </div>
                <p className="text-xs text-[var(--text-main)] leading-relaxed">
                  Novelore <strong>creará y escribirá archivos</strong> dentro del directorio que elijas (inicializando la estructura <code>project.json</code>, capítulos y escenas <code>.md</code> en <code>manuscript/</code>, y subcarpetas en <code>assets/</code>).
                </p>
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  👉 Te recomendamos seleccionar una <strong>carpeta vacía o una carpeta dedicada</strong> exclusivamente para esta novela.
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 shadow-xs transition-opacity cursor-pointer flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4 text-[var(--accent-contrast)]" />
                  <span>Elegir Carpeta y Crear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DATOS DE NOVELA EXISTENTE */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="font-bold text-lg text-[var(--text-main)] font-novel-display flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-[var(--accent)]" />
                  <span>Editar Datos de la Novela</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Modifica los metadatos de tu obra guardados en su archivo project.json.
                </p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="space-y-4">
              {/* Ruta física en disco (solo lectura) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                  Ubicación física en disco
                </label>
                <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-mono text-[var(--text-muted)] truncate select-all">
                  {editingProject.path}
                </div>
              </div>

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
                  onClick={() => setEditingProject(null)}
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
    </div>
  );
};
