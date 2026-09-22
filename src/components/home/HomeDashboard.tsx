import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Plus,
  Download,
  Upload,
  Trash2,
  Copy,
  Search,
  Calendar,
  Compass,
  Sparkles,
  Clock,
  Target,
  FileText,
  Check,
  Layers,
  ChevronRight,
  FolderPlus,
  ArrowUpRight,
  Library,
  SlidersHorizontal,
  FileUp,
  Cloud,
} from "lucide-react";
import { NovelProject, ProjectMeta, ProjectView } from "../../types";
import {
  listProjectsMeta,
  loadProjectById,
  deleteProjectById,
  duplicateProject,
  createNewProject,
  createBlankProject,
  exportProjectToNovelistFile,
  importProjectFromNovelistOrJson,
  resetToDemoProject,
  updateProjectCover,
  CreateProjectOptions,
} from "../../utils/storage";
import { BookCover } from "../project/BookCover";

interface HomeDashboardProps {
  currentProject: NovelProject;
  onSelectProject: (project: NovelProject) => void;
  onNavigateView: (view: ProjectView) => void;
  onOpenCloudSync?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentProject,
  onSelectProject,
  onNavigateView,
  onOpenCloudSync,
}) => {
  const [projectsList, setProjectsList] = useState<ProjectMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "words">("recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);
  const [confirmDemoReset, setConfirmDemoReset] = useState(false);

  // New project form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newGenre, setNewGenre] = useState("Fantasía");
  const [newLogline, setNewLogline] = useState("");
  const [newSynopsis, setNewSynopsis] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState<string | undefined>(undefined);
  const [newEnableWordGoals, setNewEnableWordGoals] = useState(true);
  const [newTargetWords, setNewTargetWords] = useState(50000);
  const [newActTargetWords, setNewActTargetWords] = useState(15000);
  const [newChapterTargetWords, setNewChapterTargetWords] = useState(4000);
  const [newSceneTargetWords, setNewSceneTargetWords] = useState(1500);
  const [newDialogueStyle, setNewDialogueStyle] = useState<"dash" | "guillemets" | "quotes">("dash");
  const [newTheme, setNewTheme] = useState<"minimal" | "clean" | "sepia" | "dark">("minimal");

  // Refresh project list
  const refreshProjects = async () => {
    const list = await listProjectsMeta();
    setProjectsList(list);
  };

  useEffect(() => {
    refreshProjects();
  }, [currentProject]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // The most recent project is either the first in list or currentProject
  const mostRecentMeta: ProjectMeta | null = projectsList.length > 0 ? projectsList[0] : null;

  // Filtered & sorted projects
  const filteredProjects = projectsList
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.author && p.author.toLowerCase().includes(q)) ||
        (p.genre && p.genre.toLowerCase().includes(q)) ||
        (p.synopsis && p.synopsis.toLowerCase().includes(q))
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

  // Total words across all projects
  const totalAllWords = projectsList.reduce(
    (acc, p) => acc + (p.wordCount || 0),
    0
  );

  // Handlers
  const handleOpenProject = async (id: string, targetView: ProjectView = "manuscript") => {
    if (currentProject.id === id) {
      onNavigateView(targetView);
      return;
    }
    const loaded = await loadProjectById(id);
    if (loaded) {
      onSelectProject(loaded);
      onNavigateView(targetView);
    } else {
      showToast("No se pudo cargar el proyecto seleccionado", "error");
    }
  };

  const handleExportNvl = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let target = currentProject.id === id ? currentProject : await loadProjectById(id);
    if (target) {
      exportProjectToNovelistFile(target);
      showToast(`Proyecto "${target.title}" exportado en archivo propio (.nvl)`);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const duplicated = await duplicateProject(id);
    if (duplicated) {
      await refreshProjects();
      showToast(`Proyecto duplicado como "${duplicated.title}"`);
    } else {
      showToast("Error al duplicar el proyecto", "error");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setProjectToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    const { id, title } = projectToDelete;
    const updatedList = await deleteProjectById(id);
    setProjectsList(updatedList);
    showToast(`Proyecto "${title}" eliminado`);
    if (currentProject.id === id) {
      if (updatedList.length > 0) {
        const next = await loadProjectById(updatedList[0].id);
        if (next) onSelectProject(next);
      } else {
        const blank = createBlankProject();
        onSelectProject(blank);
      }
    }
    setProjectToDelete(null);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const result = await importProjectFromNovelistOrJson(content);
      if (result) {
        onSelectProject(result.project);
        await refreshProjects();
        showToast(
          result.isNovelistFormat
            ? `¡Proyecto "${result.project.title}" importado con éxito desde archivo .nvl!`
            : `¡Proyecto "${result.project.title}" importado con éxito!`
        );
      } else {
        showToast("El archivo seleccionado no tiene un formato de proyecto válido (.nvl o .json)", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetToDemoConfirmed = async () => {
    const demo = await resetToDemoProject();
    onSelectProject(demo);
    await refreshProjects();
    showToast("Novela de muestra cargada con éxito");
    setConfirmDemoReset(false);
  };

  const handleCoverChange = async (projectId: string, url?: string) => {
    const updated = await updateProjectCover(projectId, url);
    if (updated) {
      if (currentProject.id === projectId) {
        onSelectProject(updated);
      }
      await refreshProjects();
      showToast(url ? "Portada de la novela actualizada con éxito" : "Portada eliminada");
    } else {
      showToast("Error al actualizar la portada", "error");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Por favor ingresa un título para la novela", "error");
      return;
    }

    const options: CreateProjectOptions = {
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      author: newAuthor.trim(),
      genre: newGenre.trim(),
      logline: newLogline.trim(),
      synopsis: newSynopsis.trim(),
      targetWords: newTargetWords || 50000,
      dialogueStyle: newDialogueStyle,
      theme: newTheme,
      coverUrl: newCoverUrl,
      enableWordGoals: newEnableWordGoals,
      defaultActTargetWords: newActTargetWords,
      defaultChapterTargetWords: newChapterTargetWords,
      defaultSceneTargetWords: newSceneTargetWords,
    };

    const created = await createNewProject(options);
    onSelectProject(created);
    await refreshProjects();
    setIsCreateModalOpen(false);
    // Reset form
    setNewTitle("");
    setNewSubtitle("");
    setNewAuthor("");
    setNewLogline("");
    setNewSynopsis("");
    setNewCoverUrl(undefined);
    showToast(`¡Novela "${created.title}" creada! Comenzando manuscrito...`);
    onNavigateView("manuscript");
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recientemente";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recientemente";
    }
  };

  return (
    <div
      id="home-dashboard"
      className="flex-1 min-h-0 overflow-y-scroll custom-scroll always-scroll"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
        overflowY: "scroll",
        scrollbarGutter: "stable",
      }}
    >
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-medium transition-all ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs">
                <Library className="w-5 h-5 text-[var(--accent-contrast)]" />
              </span>
              <h1 className="text-2xl font-bold font-novel-display tracking-tight text-[var(--text-main)]">
                Taller de Escritura & Proyectos
              </h1>
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-xl">
              Gestiona tus novelas, continúa escribiendo donde lo dejaste o inicia nuevas narrativas.
            </p>
          </div>

          {/* Actions Section: Prominent New Novel CTA + Organized Secondary Utility Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Secondary Action Toolbar: Grouped seamlessly */}
            <div className="flex items-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-xs divide-x divide-[var(--border-color)]/60 order-2 sm:order-1">
              {/* Import .nvl */}
              <motion.label
                id="btn-import-novelist"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                title="Importar archivo propio .nvl o .json"
              >
                <FileUp className="w-4 h-4 text-[var(--accent)]" />
                <span className="whitespace-nowrap">Importar .nvl</span>
                <input
                  type="file"
                  accept=".nvl,.novelist,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </motion.label>

              {/* Cloud Sync and backups */}
              {onOpenCloudSync && (
                <motion.button
                  id="btn-cloud-sync"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenCloudSync}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                  title="Sincronizar y respaldar en la nube"
                >
                  <Cloud className="w-4 h-4 text-emerald-500" />
                  <span className="whitespace-nowrap">Nube</span>
                </motion.button>
              )}

              {/* Load Demo Project */}
              <motion.button
                id="btn-load-demo"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirmDemoReset(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                title="Restaurar o cargar la novela de fantasía de ejemplo"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="whitespace-nowrap">Ejemplo</span>
              </motion.button>
            </div>

            {/* Primary Hero Button: Nueva Novela (Prominent, High-Contrast, Largest) */}
            <motion.button
              id="btn-new-novel"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setNewTitle("");
                setNewSubtitle("");
                setNewAuthor(currentProject.author || "");
                setNewGenre("Fantasía");
                setNewLogline("");
                setNewSynopsis("");
                setNewTargetWords(50000);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold text-sm hover:opacity-95 shadow-md shadow-[var(--accent)]/20 ring-2 ring-[var(--accent)]/30 transition-all cursor-pointer order-1 sm:order-2"
            >
              <Plus className="w-5 h-5 text-[var(--accent-contrast)] stroke-[2.5]" />
              <span className="tracking-wide whitespace-nowrap">Nueva Novela</span>
            </motion.button>
          </div>
        </div>

        {/* SECTION 1: PROYECTO MÁS RECIENTE (FEATURED HERO CARD) */}
        {mostRecentMeta && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Proyecto Más Reciente • Continuar Escribiendo
                </h2>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Modificado: {formatDate(mostRecentMeta.updatedAt)}
              </span>
            </div>

            <div
              className="relative p-6 rounded-2xl border shadow-xs transition-all hover:shadow-md"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Book Cover with upload/replace capability */}
                <div className="shrink-0 mx-auto sm:mx-0" onClick={(e) => e.stopPropagation()}>
                  <BookCover
                    title={mostRecentMeta.title}
                    author={mostRecentMeta.author}
                    genre={mostRecentMeta.genre}
                    coverUrl={mostRecentMeta.coverUrl}
                    size="lg"
                    allowUpload={true}
                    onUploadCover={(url) => handleCoverChange(mostRecentMeta.id, url)}
                    onRemoveCover={() => handleCoverChange(mostRecentMeta.id, undefined)}
                  />
                </div>

                {/* Left details */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)]">
                      {mostRecentMeta.genre || "Ficción"}
                    </span>
                    {mostRecentMeta.author && (
                      <span className="text-xs text-[var(--text-muted)]">
                        Por <strong className="text-[var(--text-main)]">{mostRecentMeta.author}</strong>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-novel-display text-[var(--text-main)] mb-1">
                      {mostRecentMeta.title}
                    </h3>
                    {mostRecentMeta.subtitle && (
                      <p className="text-xs text-[var(--text-muted)] italic mb-1">
                        {mostRecentMeta.subtitle}
                      </p>
                    )}
                    {mostRecentMeta.logline ? (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        «{mostRecentMeta.logline}»
                      </p>
                    ) : mostRecentMeta.synopsis ? (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {mostRecentMeta.synopsis}
                      </p>
                    ) : null}
                  </div>

                  {/* Word count progress bar or free writing note */}
                  {mostRecentMeta.enableWordGoals !== false ? (
                    <div className="space-y-1.5 pt-1 max-w-lg">
                      <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                        <span>
                          <strong className="text-[var(--text-main)]">
                            {(mostRecentMeta.wordCount || 0).toLocaleString()}
                          </strong>{" "}
                          / {(mostRecentMeta.targetWords || 50000).toLocaleString()} palabras
                        </span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(
                              ((mostRecentMeta.wordCount || 0) /
                                (mostRecentMeta.targetWords || 50000)) *
                                100
                            )
                          )}
                          % completado
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-input)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                ((mostRecentMeta.wordCount || 0) /
                                  (mostRecentMeta.targetWords || 50000)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-[var(--text-muted)] pt-1 flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-main)]">
                        {(mostRecentMeta.wordCount || 0).toLocaleString()}
                      </span>{" "}
                      palabras escritas • <span className="italic opacity-80">Modo escritura libre (sin metas)</span>
                    </div>
                  )}

                  {/* Badges count */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                    <span>
                      <strong className="text-[var(--text-main)]">{mostRecentMeta.actCount || 1}</strong> Actos
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[var(--text-main)]">{mostRecentMeta.chapterCount || 0}</strong> Capítulos
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[var(--text-main)]">{mostRecentMeta.sceneCount || 0}</strong> Escenas
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[var(--text-main)]">{mostRecentMeta.characterCount || 0}</strong> Personajes en Biblia
                    </span>
                  </div>
                </div>

                {/* Right Quick Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-center sm:self-auto">
                  <button
                    onClick={() => handleOpenProject(mostRecentMeta.id, "manuscript")}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 shadow-xs transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[var(--accent-contrast)]" />
                    <span>Abrir Manuscrito</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-80 text-[var(--accent-contrast)]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenProject(mostRecentMeta.id, "planning")}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all cursor-pointer"
                      title="Ver línea de tiempo y escaleta"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>Planeación</span>
                    </button>

                    <button
                      onClick={() => handleOpenProject(mostRecentMeta.id, "codex")}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all cursor-pointer"
                      title="Ver personajes y mundo"
                    >
                      <Compass className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>Biblia</span>
                    </button>

                    <button
                      onClick={(e) => handleExportNvl(e, mostRecentMeta.id)}
                      className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-all cursor-pointer"
                      title="Exportar archivo propio .nvl"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: LISTADO COMPLETO Y GESTIÓN DE NOVELAS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-novel-display text-[var(--text-main)]">
                Todas las Novelas ({projectsList.length})
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Total acumulado en taller: <strong className="text-[var(--text-main)]">{totalAllWords.toLocaleString()} palabras</strong>
              </p>
            </div>

            {/* Filter and Sort controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Buscar novela o autor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] w-48 sm:w-56"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1 border border-[var(--border-color)] rounded-xl p-1 bg-[var(--bg-input)] text-xs">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    sortBy === "recent"
                      ? "bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Recientes
                </button>
                <button
                  onClick={() => setSortBy("title")}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    sortBy === "title"
                      ? "bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  A-Z
                </button>
                <button
                  onClick={() => setSortBy("words")}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    sortBy === "words"
                      ? "bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Palabras
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Projects */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-2xl border-[var(--border-color)] p-8 space-y-3">
              <BookOpen className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
              <p className="text-xs text-[var(--text-muted)]">
                {searchQuery
                  ? "No se encontraron novelas que coincidan con la búsqueda."
                  : "Aún no tienes novelas creadas."}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5 text-[var(--accent-contrast)]" />
                <span>Crear Novela</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => {
                const isCurrent = currentProject.id === p.id;
                const progressPct = Math.min(
                  100,
                  Math.round(
                    ((p.wordCount || 0) / (p.targetWords || 50000)) * 100
                  )
                );

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProject(p.id)}
                    className={`group relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                      isCurrent
                        ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                        : "border-[var(--border-color)] hover:border-[var(--text-muted)]"
                    }`}
                    style={{
                      backgroundColor: "var(--bg-card)",
                    }}
                  >
                    <div className="space-y-3">
                      {/* Top: Book Cover & Main Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                          <BookCover
                            title={p.title}
                            author={p.author}
                            genre={p.genre}
                            coverUrl={p.coverUrl}
                            size="sm"
                            allowUpload={true}
                            onUploadCover={(url) => handleCoverChange(p.id, url)}
                            onRemoveCover={() => handleCoverChange(p.id, undefined)}
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] truncate">
                              {p.genre || "Ficción"}
                            </span>
                            {isCurrent && (
                              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                Activo
                              </span>
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-base font-novel-display text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                              {p.title}
                            </h3>
                            {p.author && (
                              <p className="text-xs text-[var(--text-muted)] truncate">
                                Por {p.author}
                              </p>
                            )}
                          </div>

                          {/* Synopsis excerpt */}
                          {p.synopsis && (
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                              {p.synopsis}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress bar / Free writing status */}
                      {p.enableWordGoals !== false ? (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                            <span>
                              {(p.wordCount || 0).toLocaleString()} / {(p.targetWords || 50000).toLocaleString()} pal.
                            </span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--bg-input)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--accent)]"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-[var(--text-muted)] pt-1 flex items-center justify-between">
                          <span>{(p.wordCount || 0).toLocaleString()} palabras</span>
                          <span className="italic opacity-70 text-[9px]">Escritura libre</span>
                        </div>
                      )}

                      {/* Architecture chips */}
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
                        <span>{p.actCount || 1} actos</span>
                        <span>•</span>
                        <span>{p.sceneCount || 0} escenas</span>
                        <span>•</span>
                        <span>{p.characterCount || 0} pers.</span>
                      </div>
                    </div>

                    {/* Bottom action toolbar */}
                    <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {formatDate(p.updatedAt)}
                      </span>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Export .nvl */}
                        <button
                          onClick={(e) => handleExportNvl(e, p.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                          title="Exportar archivo propio .nvl"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={(e) => handleDuplicate(e, p.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                          title="Duplicar novela"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => handleDeleteClick(e, p.id, p.title)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                          title="Eliminar novela"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Open arrow */}
                        <button
                          onClick={() => handleOpenProject(p.id)}
                          className="p-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors cursor-pointer"
                          title="Abrir en el editor"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREAR NUEVA NOVELA (AMPLIADO Y ESPACIOSO) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in select-none">
          <div
            className="w-full max-w-4xl lg:max-w-5xl rounded-3xl shadow-2xl border p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl font-novel-display">
                    Crear Nueva Novela
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Configura la portada, metadatos, premisa y objetivos de palabras de tu historia.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form in 2 spacious columns */}
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column: Book Cover & Style (4 cols) */}
                <div className="lg:col-span-4 flex flex-col items-center sm:items-start gap-4">
                  <div className="w-full">
                    <label className="font-bold block mb-2 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                      Portada del Libro
                    </label>
                    <div className="flex flex-col items-center p-4 rounded-2xl bg-[var(--bg-input)]/50 border border-[var(--border-color)] space-y-3">
                      <BookCover
                        title={newTitle || "Título de la Novela"}
                        author={newAuthor || "Nombre del Autor"}
                        genre={newGenre}
                        coverUrl={newCoverUrl}
                        size="md"
                        allowUpload={true}
                        onUploadCover={(url) => setNewCoverUrl(url)}
                        onRemoveCover={() => setNewCoverUrl(undefined)}
                      />
                      <p className="text-[11px] text-[var(--text-muted)] text-center leading-tight">
                        Haz clic sobre la portada para subir una imagen propia (PNG/JPG/WebP) o se generará una elegante portada tipográfica automática.
                      </p>
                    </div>
                  </div>

                  <div className="w-full space-y-3 pt-2">
                    <div>
                      <label className="font-bold block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                        Estilo de Puntuación de Diálogos
                      </label>
                      <select
                        value={newDialogueStyle}
                        onChange={(e) => setNewDialogueStyle(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-xs cursor-pointer"
                      >
                        <option value="dash">Raya española estándar (—Hola —dijo él.)</option>
                        <option value="guillemets">Comillas angulares («Hola», dijo.)</option>
                        <option value="quotes">Comillas inglesas (“Hello,” he said.)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Information & Details (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Title & Subtitle */}
                  <div className="space-y-3">
                    <div>
                      <label className="font-bold block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                        Título de la Obra *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: El Susurro del Cristal de Sombras"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-base font-semibold focus:outline-hidden focus:border-[var(--accent)] text-[var(--text-main)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                          Subtítulo o Lema
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Libro Primero de las Crónicas"
                          value={newSubtitle}
                          onChange={(e) => setNewSubtitle(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs focus:outline-hidden focus:border-[var(--accent)] text-[var(--text-main)]"
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                          Autor / Seudónimo
                        </label>
                        <input
                          type="text"
                          placeholder="Tu nombre o seudónimo"
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs focus:outline-hidden focus:border-[var(--accent)] text-[var(--text-main)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                        Género Literario
                      </label>
                      <select
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-xs focus:outline-hidden focus:border-[var(--accent)] cursor-pointer"
                      >
                        <option value="Fantasía Épica">Fantasía Épica</option>
                        <option value="Ciencia Ficción">Ciencia Ficción</option>
                        <option value="Thriller / Novela Negra">Thriller / Novela Negra</option>
                        <option value="Novela Histórica">Novela Histórica</option>
                        <option value="Terror / Horror">Terror / Horror</option>
                        <option value="Romance">Romance</option>
                        <option value="Ficción Contemporánea">Ficción Contemporánea</option>
                        <option value="Distopía">Distopía</option>
                        <option value="Misterio">Misterio</option>
                      </select>
                    </div>
                  </div>

                  {/* Logline / Premise */}
                  <div>
                    <label className="font-bold block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                      Premisa / Logline (Resumen en una frase)
                    </label>
                    <input
                      type="text"
                      placeholder="¿De qué trata el conflicto central en una o dos líneas?"
                      value={newLogline}
                      onChange={(e) => setNewLogline(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs focus:outline-hidden focus:border-[var(--accent)] text-[var(--text-main)]"
                    />
                  </div>

                  {/* Synopsis */}
                  <div>
                    <label className="font-bold block mb-1.5 text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                      Sinopsis Inicial
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detalla el punto de partida, los protagonistas y el detonante de la trama..."
                      value={newSynopsis}
                      onChange={(e) => setNewSynopsis(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs focus:outline-hidden focus:border-[var(--accent)] resize-none text-[var(--text-main)] leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Word Goals Section (Granular and Disablable) */}
              <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)]/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-[var(--accent)]" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[var(--text-main)]">
                        Metas y Objetivos de Palabras
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Configura el ritmo de escritura para la novela completa, arcos, capítulos y escenas.
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-main)]">
                    <input
                      type="checkbox"
                      checked={newEnableWordGoals}
                      onChange={(e) => setNewEnableWordGoals(e.target.checked)}
                      className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                    />
                    <span>Habilitar metas de palabras</span>
                  </label>
                </div>

                {newEnableWordGoals ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                    {/* Meta Total */}
                    <div className="space-y-1.5">
                      <label className="font-bold block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        Meta Total Novela
                      </label>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={newTargetWords}
                        onChange={(e) => setNewTargetWords(parseInt(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono font-bold text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                      />
                      <div className="flex gap-1">
                        {[30000, 50000, 80000, 120000].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setNewTargetWords(num)}
                            className={`flex-1 py-1 rounded text-[9px] font-mono transition-colors cursor-pointer ${
                              newTargetWords === num
                                ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold"
                                : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            }`}
                          >
                            {num / 1000}k
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Meta por Arco / Acto */}
                    <div className="space-y-1.5">
                      <label className="font-bold block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        Meta por Arco / Acto
                      </label>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={newActTargetWords}
                        onChange={(e) => setNewActTargetWords(parseInt(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono font-bold text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                      />
                      <span className="text-[10px] text-[var(--text-muted)] block">
                        Recomendado: 15.000 palabras
                      </span>
                    </div>

                    {/* Meta por Capítulo */}
                    <div className="space-y-1.5">
                      <label className="font-bold block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        Meta por Capítulo
                      </label>
                      <input
                        type="number"
                        min={500}
                        step={250}
                        value={newChapterTargetWords}
                        onChange={(e) => setNewChapterTargetWords(parseInt(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono font-bold text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                      />
                      <span className="text-[10px] text-[var(--text-muted)] block">
                        Recomendado: 3.000 - 5.000 pal.
                      </span>
                    </div>

                    {/* Meta por Escena */}
                    <div className="space-y-1.5">
                      <label className="font-bold block text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        Meta por Escena
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={newSceneTargetWords}
                        onChange={(e) => setNewSceneTargetWords(parseInt(e.target.value) || 0)}
                        className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-mono font-bold text-[var(--text-main)] focus:outline-hidden focus:border-[var(--accent)]"
                      />
                      <span className="text-[10px] text-[var(--text-muted)] block">
                        Recomendado: 1.000 - 2.000 pal.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-muted)] italic bg-[var(--bg-card)]/50 p-3 rounded-xl border border-[var(--border-color)]/60">
                    Modo libre activado: La aplicación no mostrará barras de progreso ni metas pendientes, permitiéndote escribir sin ninguna presión métrica. Podrás activar las metas en cualquier momento desde el menú superior.
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold text-xs hover:opacity-95 shadow-md shadow-[var(--accent)]/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-[var(--accent-contrast)]" />
                  <span>Crear y Empezar a Escribir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Modal: Confirm Delete Project */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">
                  ¿Eliminar novela?
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-main)] leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la novela{" "}
              <strong className="font-bold">«{projectToDelete.title}»</strong>? Todos sus capítulos, escenas y entradas de la biblia de mundo serán borrados del almacenamiento local.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs transition-colors"
              >
                Sí, eliminar novela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Modal: Confirm Demo Reset */}
      {confirmDemoReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">
                  Cargar novela de muestra
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Novela demo «El Susurro del Cristal de Sombras»
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-main)] leading-relaxed">
              ¿Deseas cargar la novela de muestra <strong>«El Susurro del Cristal de Sombras»</strong> con manuscrito, personajes, mapa de relaciones, hitos narrativos y locaciones ya estructuradas?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDemoReset(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetToDemoConfirmed}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 shadow-xs transition-opacity"
              >
                Cargar Novela Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
