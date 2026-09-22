import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  NovelProject,
  ProjectView,
  Scene,
  WorldEntity,
  ConflictInfo,
} from "./types";
import {
  loadActiveProject,
  saveProject,
  createNewProject,
  importProjectFromNovelistOrJson,
  getProjectVersions,
  saveProjectVersion,
  getStorageHealth,
  onStorageHealthChange,
  StorageHealthStatus,
} from "./utils/storage";
import { demoProject } from "./data/demoProject";
import { Navbar } from "./components/Navbar";
import { ManuscriptSidebar } from "./components/editor/ManuscriptSidebar";
import { RichTextEditor } from "./components/editor/RichTextEditor";
import { SceneInspector } from "./components/editor/SceneInspector";
import { PlanningDashboard } from "./components/planning/PlanningDashboard";
import { WorldbuildingHub } from "./components/codex/WorldbuildingHub";
import { RelationshipMapView } from "./components/codex/RelationshipMapView";
import { ExportModal } from "./components/export/ExportModal";
import { ExportPageView } from "./components/export/ExportPageView";
import { EntityModal } from "./components/codex/EntityModal";
import { HomeDashboard } from "./components/home/HomeDashboard";
import { VersionsModal } from "./components/project/VersionsModal";
import { CloudSyncModal } from "./components/CloudSyncModal";
import { WordGoalsModal } from "./components/project/WordGoalsModal";
import { ConflictResolutionModal } from "./components/ConflictResolutionModal";
import { VisualBoardView } from "./components/board/VisualBoardView";
import type { User } from "firebase/auth";
import {
  saveNovelToCloud,
  subscribeToNovel,
  checkRemoteNovelVersion,
  smartMergeProjects,
  getClientSessionId,
  onAuthUserChanged,
  getCurrentUser,
} from "./lib/firebase";

export const App: React.FC = () => {
  const [project, setProject] = useState<NovelProject>(() => {
    const initial = demoProject;
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("novelore_user_theme") : null;
    const savedAccent = typeof window !== "undefined" ? localStorage.getItem("novelore_user_accent") : null;
    const savedNeutralAccent = typeof window !== "undefined" ? localStorage.getItem("novelore_neutral_accent") : null;

    if (savedTheme || savedAccent || savedNeutralAccent) {
      const activeTheme = (savedTheme as any) || initial.settings.theme || "minimal";
      const isNeutral = activeTheme === "minimal" || activeTheme === "dark";
      const targetAccent = isNeutral
        ? (savedNeutralAccent || savedAccent || initial.settings.customAccentColor)
        : (initial.settings.customAccentColor || undefined);

      return {
        ...initial,
        settings: {
          ...initial.settings,
          theme: activeTheme,
          customAccentColor: targetAccent,
        },
      };
    }
    return initial;
  });

  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  // Load the active project asynchronously from IndexedDB
  useEffect(() => {
    let isCancelled = false;
    loadActiveProject().then((loaded) => {
      if (isCancelled) return;
      const savedTheme = typeof window !== "undefined" ? localStorage.getItem("novelore_user_theme") : null;
      const savedAccent = typeof window !== "undefined" ? localStorage.getItem("novelore_user_accent") : null;
      const savedNeutralAccent = typeof window !== "undefined" ? localStorage.getItem("novelore_neutral_accent") : null;

      let finalProject = loaded;
      if (savedTheme || savedAccent || savedNeutralAccent) {
        const activeTheme = (savedTheme as any) || loaded.settings?.theme || "minimal";
        const isNeutral = activeTheme === "minimal" || activeTheme === "dark";
        const targetAccent = isNeutral
          ? (savedNeutralAccent || savedAccent || loaded.settings?.customAccentColor)
          : (loaded.settings?.customAccentColor || undefined);

        finalProject = {
          ...loaded,
          settings: {
            ...loaded.settings,
            theme: activeTheme,
            customAccentColor: targetAccent,
          },
        };
      }

      setProject(finalProject);
      setSelectedSceneId((prev) => {
        if (prev) return prev;
        const firstScene = finalProject.acts[0]?.chapters[0]?.scenes[0];
        return firstScene ? firstScene.id : "";
      });
      setIsInitialLoadDone(true);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const [activeView, setActiveView] = useState<ProjectView>("home");
  const [selectedSceneId, setSelectedSceneId] = useState<string>(() => {
    const firstScene = project.acts[0]?.chapters[0]?.scenes[0];
    return firstScene ? firstScene.id : "";
  });

  // UI state toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isWordGoalsModalOpen, setIsWordGoalsModalOpen] = useState(false);
  const [dossierEntityId, setDossierEntityId] = useState<string | null>(null);
  const [dossierInitialTab, setDossierInitialTab] = useState<"details" | "whiteboard">("details");
  const [isCreatingCharacterFromInspector, setIsCreatingCharacterFromInspector] = useState(false);

  // Cloud Sync state & automatic multi-device synchronization
  const [authUser, setAuthUser] = useState<User | null>(() => getCurrentUser());
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"idle" | "saving" | "saved" | "error" | "offline">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [conflictData, setConflictData] = useState<ConflictInfo | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Local storage persistence health status (Problem A hardening)
  const [storageHealth, setStorageHealth] = useState<StorageHealthStatus>(() => getStorageHealth());

  useEffect(() => {
    const unsub = onStorageHealthChange((status) => {
      setStorageHealth(status);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onAuthUserChanged((u) => {
      setAuthUser(u);
      if (!u) {
        setCloudSyncStatus("idle");
      }
    });
    return () => unsub();
  }, []);

  const isApplyingRemoteSyncRef = useRef(false);
  const isFirstMountRef = useRef(true);
  const latestProjectRef = useRef(project);
  latestProjectRef.current = project;
  const hasPendingCloudSaveRef = useRef(false);
  const retryTimeoutRef = useRef<any>(null);

  // Initialize to 0 so remote snapshots from other devices aren't rejected on startup
  const lastLocalEditTimestampRef = useRef<number>(0);
  const hasLocalUnsavedChangesRef = useRef<boolean>(false);

  const recordLocalEdit = () => {
    lastLocalEditTimestampRef.current = Date.now();
    hasLocalUnsavedChangesRef.current = true;
  };

  // Conflict Resolution Handlers
  const handleResolveMerge = async () => {
    if (!conflictData) return;
    const merged = smartMergeProjects(project, conflictData.remoteProject);
    setProject(merged);
    saveProject(merged);
    hasLocalUnsavedChangesRef.current = false;
    lastLocalEditTimestampRef.current = Date.now();
    setIsConflictModalOpen(false);
    setConflictData(null);
    setCloudSyncStatus("saving");
    try {
      await saveNovelToCloud(merged, getClientSessionId(), { forceOverwrite: true });
      setCloudSyncStatus("saved");
      setLastSyncedAt(new Date());
      setSyncToast({ message: "¡Novela fusionada y sincronizada con éxito!", type: "success" });
      setTimeout(() => setSyncToast(null), 4000);
    } catch (e) {
      setCloudSyncStatus("error");
    }
  };

  const handleResolveRemote = () => {
    if (!conflictData) return;
    setProject(conflictData.remoteProject);
    saveProject(conflictData.remoteProject);
    hasLocalUnsavedChangesRef.current = false;
    lastLocalEditTimestampRef.current = 0;
    setIsConflictModalOpen(false);
    setConflictData(null);
    setCloudSyncStatus("saved");
    setLastSyncedAt(new Date());
    setSyncToast({ message: "Versión de la nube cargada con éxito", type: "info" });
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleResolveForceOverwrite = async () => {
    if (!conflictData) return;
    setIsConflictModalOpen(false);
    setConflictData(null);
    setCloudSyncStatus("saving");
    try {
      await saveNovelToCloud(project, getClientSessionId(), { forceOverwrite: true });
      hasLocalUnsavedChangesRef.current = false;
      lastLocalEditTimestampRef.current = Date.now();
      setCloudSyncStatus("saved");
      setLastSyncedAt(new Date());
      setSyncToast({ message: "Versión local forzada en la nube con éxito", type: "success" });
      setTimeout(() => setSyncToast(null), 4000);
    } catch (e) {
      setCloudSyncStatus("error");
    }
  };

  // Manual save trigger (from modal or quick action)
  const handleTriggerSaveToCloud = async () => {
    if (!authUser) {
      setIsCloudSyncOpen(true);
      setSyncToast({ message: "Inicia sesión con Google para sincronizar en la nube", type: "info" });
      setTimeout(() => setSyncToast(null), 3500);
      return;
    }
    if (project.isDemo || project.id === "proj-sombras-alcaraz") {
      setSyncToast({ message: "La novela de muestra se conserva como copia local", type: "info" });
      setTimeout(() => setSyncToast(null), 3000);
      return;
    }
    setCloudSyncStatus("saving");
    try {
      const result = await saveNovelToCloud(project, getClientSessionId(), { checkConflict: true });
      if (result.conflict) {
        setConflictData(result.conflict);
        setIsConflictModalOpen(true);
        setCloudSyncStatus("idle");
        return;
      }
      if (result.isOffline) {
        setCloudSyncStatus("offline");
        setSyncToast({ message: "Guardado pendiente: sin conexión a internet", type: "info" });
        setTimeout(() => setSyncToast(null), 3500);
        return;
      }
      if (!result.savedAt) {
        throw new Error("No se pudo confirmar el guardado en la nube.");
      }
      if (project.ownerId !== authUser.uid) {
        setProject((p) => ({ ...p, ownerId: authUser.uid }));
      }
      hasLocalUnsavedChangesRef.current = false;
      setCloudSyncStatus("saved");
      setLastSyncedAt(new Date());
      setSyncToast({ message: "Guardado en la nube completado", type: "success" });
      setTimeout(() => setSyncToast(null), 3000);
      setTimeout(() => setCloudSyncStatus("idle"), 4000);
    } catch (err) {
      console.error("Error saving novel to cloud:", err);
      setCloudSyncStatus("error");
      throw err;
    }
  };

  // 1. Auto-save project changes to local IndexedDB once initial load is completed
  useEffect(() => {
    if (!isInitialLoadDone) return;
    saveProject(project);
  }, [project, isInitialLoadDone]);

  // 2. Automatic Debounced Cloud Save: Keeps cloud continuously updated without manual clicks
  useEffect(() => {
    // If this update was received via remote cross-device sync, do not echo back to cloud
    if (isApplyingRemoteSyncRef.current) {
      return;
    }

    // Phase 1 Security: Only auto-save to cloud if user is authenticated and project is not a demo
    if (!authUser || !project?.id || project.isDemo || project.id === "proj-sombras-alcaraz") return;

    // Skip cloud save on immediate initial mount before user edits
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    hasPendingCloudSaveRef.current = true;
    setCloudSyncStatus("saving");

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const debounceTimer = setTimeout(async () => {
      const projToSave = latestProjectRef.current;
      if (!projToSave || projToSave.isDemo || projToSave.id === "proj-sombras-alcaraz") return;

      try {
        const result = await saveNovelToCloud(projToSave, getClientSessionId(), { checkConflict: false });
        if (result.conflict) {
          setConflictData(result.conflict);
          setIsConflictModalOpen(true);
          setCloudSyncStatus("idle");
          return;
        }
        if (result.isOffline) {
          setCloudSyncStatus("offline");
          // Keep pending save flag true so reconnection immediately flushes to cloud
          return;
        }
        if (!result.savedAt) {
          throw new Error("No se confirmó el guardado en la nube.");
        }
        hasPendingCloudSaveRef.current = false;
        hasLocalUnsavedChangesRef.current = false;
        setCloudSyncStatus("saved");
        setLastSyncedAt(new Date());
      } catch (err) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          setCloudSyncStatus("offline");
          return;
        }
        console.warn("Aviso en guardado automático en la nube, iniciando reintento:", err);
        setCloudSyncStatus("error");

        // Resilient background retry after 2.5 seconds
        retryTimeoutRef.current = setTimeout(async () => {
          if (hasPendingCloudSaveRef.current && latestProjectRef.current && !latestProjectRef.current.isDemo) {
            try {
              const retryRes = await saveNovelToCloud(latestProjectRef.current, getClientSessionId(), { forceOverwrite: true });
              if (retryRes.isOffline) {
                setCloudSyncStatus("offline");
                return;
              }
              if (!retryRes.savedAt) {
                throw new Error("No se confirmó el guardado en la nube en reintento.");
              }
              hasPendingCloudSaveRef.current = false;
              hasLocalUnsavedChangesRef.current = false;
              setCloudSyncStatus("saved");
              setLastSyncedAt(new Date());
            } catch (retryErr) {
              console.warn("Reintento en segundo plano pendiente:", retryErr);
              // Second background retry after 6 seconds
              retryTimeoutRef.current = setTimeout(async () => {
                if (hasPendingCloudSaveRef.current && latestProjectRef.current && !latestProjectRef.current.isDemo) {
                  try {
                    const secondRes = await saveNovelToCloud(latestProjectRef.current, getClientSessionId(), { forceOverwrite: true });
                    if (secondRes.isOffline) {
                      setCloudSyncStatus("offline");
                      return;
                    }
                    if (!secondRes.savedAt) {
                      throw new Error("No se confirmó el guardado en la nube en segundo reintento.");
                    }
                    hasPendingCloudSaveRef.current = false;
                    hasLocalUnsavedChangesRef.current = false;
                    setCloudSyncStatus("saved");
                    setLastSyncedAt(new Date());
                  } catch (secondErr) {
                    console.warn("Reintento final no completado:", secondErr);
                  }
                }
              }, 6000);
            }
          }
        }, 2500);
      }
    }, 1800);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [authUser, project]);

  // Flush pending cloud save on tab blur/visibility change or beforeunload
  useEffect(() => {
    const flushSave = () => {
      if (
        authUser &&
        hasPendingCloudSaveRef.current &&
        latestProjectRef.current &&
        !latestProjectRef.current.isDemo &&
        latestProjectRef.current.id !== "proj-sombras-alcaraz"
      ) {
        saveNovelToCloud(latestProjectRef.current, getClientSessionId(), { forceOverwrite: true })
          .then((res) => {
            if (!res.isOffline) {
              hasPendingCloudSaveRef.current = false;
              setCloudSyncStatus("saved");
              setLastSyncedAt(new Date());
            }
          })
          .catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushSave();
      }
    };

    window.addEventListener("beforeunload", flushSave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", flushSave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authUser]);

  // Online and offline connectivity listeners
  useEffect(() => {
    const handleOnline = async () => {
      if (authUser && latestProjectRef.current && !latestProjectRef.current.isDemo && latestProjectRef.current.id !== "proj-sombras-alcaraz") {
        setCloudSyncStatus("saving");
        try {
          const res = await saveNovelToCloud(latestProjectRef.current, getClientSessionId(), { forceOverwrite: true });
          if (!res.isOffline) {
            hasPendingCloudSaveRef.current = false;
            hasLocalUnsavedChangesRef.current = false;
            setCloudSyncStatus("saved");
            setLastSyncedAt(new Date());
            setSyncToast({ message: "Conexión restaurada: cambios sincronizados", type: "success" });
            setTimeout(() => setSyncToast(null), 3000);
          } else {
            setCloudSyncStatus("offline");
          }
        } catch (e) {
          setCloudSyncStatus("error");
        }
      }
    };

    const handleOffline = () => {
      setCloudSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [authUser]);

  // 3. Real-time automatic cross-device synchronization: listens to Firestore updates on this novel
  useEffect(() => {
    if (!authUser || !project?.id || project.isDemo || project.id === "proj-sombras-alcaraz") return;
    const currentSession = getClientSessionId();

    const unsubscribe = subscribeToNovel(
      project.id,
      (remoteProject, meta) => {
        // Discard updates pushed by the current browser tab/session
        if (meta.lastModifiedBySessionId && meta.lastModifiedBySessionId === currentSession) {
          return;
        }

        const remoteTime = meta.updatedAt ? new Date(meta.updatedAt).getTime() : 0;
        const currentLocal = latestProjectRef.current;
        const localTime = currentLocal.updatedAt ? new Date(currentLocal.updatedAt).getTime() : 0;

        // If the user is currently typing / has uncommitted local edits
        const msSinceLastEdit = Date.now() - lastLocalEditTimestampRef.current;
        const hasRecentLocalEdits = hasLocalUnsavedChangesRef.current || (lastLocalEditTimestampRef.current > 0 && msSinceLastEdit < 4000);

        if (hasRecentLocalEdits) {
          // If local has uncommitted edits and remote differs, show conflict resolution modal instead of losing edits
          const isDifferent =
            remoteProject.title !== currentLocal.title ||
            JSON.stringify(remoteProject.acts) !== JSON.stringify(currentLocal.acts);

          if (isDifferent && remoteTime >= localTime) {
            setConflictData({
              remoteTitle: remoteProject.title,
              remoteUpdatedAt: meta.updatedAt,
              remoteWordCount: (remoteProject.acts || []).reduce((acc, a) =>
                acc + (a.chapters || []).reduce((cAcc, c) =>
                  cAcc + (c.scenes || []).reduce((sAcc, s) => sAcc + (s.wordCount || 0), 0), 0), 0),
              localTitle: currentLocal.title,
              localUpdatedAt: currentLocal.updatedAt,
              localWordCount: (currentLocal.acts || []).reduce((acc, a) =>
                acc + (a.chapters || []).reduce((cAcc, c) =>
                  cAcc + (c.scenes || []).reduce((sAcc, s) => sAcc + (s.wordCount || 0), 0), 0), 0),
              remoteProject,
              localProject: currentLocal,
            });
            setIsConflictModalOpen(true);
          }
          return;
        }

        // Automatic Google Docs-style sync:
        // When there are no unsaved local typing changes, apply incoming remote changes immediately
        const isRemoteDifferent =
          remoteProject.updatedAt !== currentLocal.updatedAt ||
          remoteProject.title !== currentLocal.title ||
          JSON.stringify(remoteProject.acts) !== JSON.stringify(currentLocal.acts) ||
          JSON.stringify(remoteProject.entities) !== JSON.stringify(currentLocal.entities) ||
          JSON.stringify(remoteProject.whiteboard) !== JSON.stringify(currentLocal.whiteboard);

        if (isRemoteDifferent) {
          isApplyingRemoteSyncRef.current = true;
          setProject((prev) => ({
            ...remoteProject,
            settings: {
              ...remoteProject.settings,
              theme: prev.settings?.theme || remoteProject.settings?.theme,
              customAccentColor: prev.settings?.customAccentColor || remoteProject.settings?.customAccentColor,
            },
            updatedAt: meta.updatedAt || new Date().toISOString(),
          }));
          saveProject(remoteProject);
          setLastSyncedAt(new Date());
          setCloudSyncStatus("saved");
          setSyncToast({
            message: "Sincronización en vivo: Se recibieron cambios de otro dispositivo",
            type: "info",
          });
          setTimeout(() => setSyncToast(null), 4500);

          setTimeout(() => {
            isApplyingRemoteSyncRef.current = false;
          }, 1000);
        }
      },
      (err) => {
        console.warn("Aviso en escucha de sincronización automática:", err);
      }
    );

    return () => unsubscribe();
  }, [authUser, project.id]);

  // Autoguardado de versiones en segundo plano (mantiene las últimas 3 versiones)
  useEffect(() => {
    if (!project?.id || !isInitialLoadDone) return;

    // Crear punto inicial si este proyecto no tiene ninguna versión previa guardada
    getProjectVersions(project.id).then((existing) => {
      if (existing.length === 0) {
        saveProjectVersion(project, "Versión de inicio", true);
      }
    });

    // Intervalo de autoguardado cada 90 segundos si hay avances
    const interval = setInterval(() => {
      saveProjectVersion(project);
    }, 90000);

    return () => clearInterval(interval);
  }, [project.id, isInitialLoadDone]);

  // Apply theme and customizable accents to document via direct CSS custom properties
  useEffect(() => {
    const themeName = project.settings.theme || "minimal";
    const darkThemes = ["dark", "scifi", "noir", "gothic", "forest", "midnight", "dream"];
    const isDark = darkThemes.includes(themeName);

    document.documentElement.setAttribute("data-theme", themeName);
    document.body.setAttribute("data-theme", themeName);
    document.documentElement.className = `theme-${themeName}${isDark ? " dark" : ""}`;
    document.body.className = isDark ? "dark" : "";

    if (typeof window !== "undefined") {
      localStorage.setItem("novelore_user_theme", themeName);
      if (project.settings.customAccentColor) {
        localStorage.setItem("novelore_user_accent", project.settings.customAccentColor);
        if (themeName === "minimal" || themeName === "dark") {
          localStorage.setItem("novelore_neutral_accent", project.settings.customAccentColor);
        }
      } else {
        localStorage.removeItem("novelore_user_accent");
      }
    }

    // Clean up any previous heavy dynamic style tag to eliminate style invalidation latency
    const existingStyleTag = document.getElementById("novelore-dynamic-accent");
    if (existingStyleTag) {
      existingStyleTag.remove();
    }

    const rootStyle = document.documentElement.style;

    if (project.settings.customAccentColor) {
      const hex = project.settings.customAccentColor;
      const clean = hex.replace("#", "");
      let lum = 0.5;
      if (clean.length === 6) {
        const r = parseInt(clean.substring(0, 2), 16) / 255;
        const g = parseInt(clean.substring(2, 4), 16) / 255;
        const b = parseInt(clean.substring(4, 6), 16) / 255;
        lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      const contrast = lum > 0.45 ? (isDark ? "#121214" : "#18181B") : "#FFFFFF";

      rootStyle.setProperty("--custom-accent", hex);
      rootStyle.setProperty("--custom-highlight", hex);
      rootStyle.setProperty("--custom-accent-hover", hex);
      rootStyle.setProperty("--custom-accent-contrast", contrast);
      rootStyle.setProperty("--custom-accent-subtle", `${hex}25`);
    } else {
      rootStyle.removeProperty("--custom-accent");
      rootStyle.removeProperty("--custom-highlight");
      rootStyle.removeProperty("--custom-accent-hover");
      rootStyle.removeProperty("--custom-accent-contrast");
      rootStyle.removeProperty("--custom-accent-subtle");
    }
  }, [project.settings.theme, project.settings.customAccentColor]);

  // Find active scene object
  const currentScene: Scene | null = React.useMemo(() => {
    for (const act of project.acts) {
      for (const chap of act.chapters) {
        for (const sc of chap.scenes) {
          if (sc.id === selectedSceneId) return sc;
        }
      }
    }
    return project.acts[0]?.chapters[0]?.scenes[0] || null;
  }, [project, selectedSceneId]);

  // Updater helper
  const handleUpdateProject = (updater: (prev: NovelProject) => NovelProject) => {
    recordLocalEdit();
    const nowIso = new Date().toISOString();
    setProject((prev) => {
      const updated = updater(prev);
      return {
        ...updated,
        updatedAt: nowIso,
      };
    });
  };

  // Update specific scene
  const handleUpdateScene = (sceneId: string, updates: Partial<Scene>) => {
    recordLocalEdit();
    const nowIso = new Date().toISOString();
    setProject((prev) => ({
      ...prev,
      updatedAt: nowIso,
      acts: prev.acts.map((act) => ({
        ...act,
        chapters: act.chapters.map((chap) => ({
          ...chap,
          scenes: chap.scenes.map((sc) =>
            sc.id === sceneId ? { ...sc, ...updates } : sc
          ),
        })),
      })),
    }));
  };

  // Update project settings
  const handleUpdateProjectSettings = (
    updates: Partial<NovelProject["settings"]>
  ) => {
    recordLocalEdit();
    const nowIso = new Date().toISOString();
    setProject((prev) => ({
      ...prev,
      updatedAt: nowIso,
      settings: { ...prev.settings, ...updates },
    }));
  };

  // Switch scene and navigate to manuscript editor
  const handleSelectScene = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    setActiveView("manuscript");
  };

  const handleCreateNewProject = () => {
    setActiveView("home");
  };

  const handleResetToDemo = () => {
    if (
      window.confirm(
        "¿Restablecer el proyecto de muestra «El Susurro del Cristal de Sombras» con personajes, trama y mapa de relaciones de ejemplo?"
      )
    ) {
      const activeTheme =
        project.settings.theme ||
        (typeof window !== "undefined" && localStorage.getItem("novelore_user_theme")) ||
        demoProject.settings.theme;
      const activeAccent =
        project.settings.customAccentColor ||
        (typeof window !== "undefined" && localStorage.getItem("novelore_user_accent")) ||
        demoProject.settings.customAccentColor;

      const demoWithTheme: NovelProject = {
        ...demoProject,
        settings: {
          ...demoProject.settings,
          theme: activeTheme as any,
          customAccentColor: activeAccent,
        },
      };
      setProject(demoWithTheme);
      setSelectedSceneId(demoProject.acts[0].chapters[0].scenes[0].id);
      setActiveView("manuscript");
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const result = await importProjectFromNovelistOrJson(content);
      if (result) {
        setProject(result.project);
        const first = result.project.acts[0]?.chapters[0]?.scenes[0];
        if (first) setSelectedSceneId(first.id);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const selectedDossierEntity = dossierEntityId
    ? project.entities.find((e) => e.id === dossierEntityId) || null
    : null;

  return (
    <div
      id="novelore-app-root"
      className={`theme-${project.settings.theme || "minimal"} w-full h-full flex flex-col overflow-hidden select-text font-sans`}
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Top Main Navigation Bar */}
      {!isZenMode && (
        <Navbar
          project={project}
          activeView={activeView}
          setActiveView={setActiveView}
          onUpdateProject={handleUpdateProject}
          onNewProject={handleCreateNewProject}
          onResetDemo={handleResetToDemo}
          onImportJson={handleImportFile}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isZenMode={isZenMode}
          setIsZenMode={setIsZenMode}
          onOpenExport={() => setActiveView("export")}
          onOpenVersions={() => setIsVersionsModalOpen(true)}
          onOpenWordGoals={() => setIsWordGoalsModalOpen(true)}
          syncStatus={cloudSyncStatus}
          lastSyncedAt={lastSyncedAt}
          onOpenCloudSync={() => setIsCloudSyncOpen(true)}
          isStorageDegraded={storageHealth.isDegraded}
        />
      )}

      {/* Main App Workspace with Non-Invasive Smooth Transitions */}
      <div id="novelore-workspace" className="flex-1 flex flex-col overflow-hidden relative min-h-0 w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex-1 flex overflow-hidden w-full min-h-0 min-w-0"
          >
            {/* VIEW 0: HOME & PROJECT MANAGEMENT */}
            {activeView === "home" && (
              <HomeDashboard
                currentProject={project}
                onSelectProject={(newProj) => {
                  const savedTheme = typeof window !== "undefined" ? localStorage.getItem("novelore_user_theme") : null;
                  const savedAccent = typeof window !== "undefined" ? localStorage.getItem("novelore_user_accent") : null;
                  const finalProj: NovelProject = {
                    ...newProj,
                    settings: {
                      ...newProj.settings,
                      theme: (savedTheme as any) || newProj.settings?.theme || project.settings.theme || "minimal",
                      customAccentColor: savedAccent || newProj.settings?.customAccentColor || project.settings.customAccentColor,
                    },
                  };
                  setProject(finalProj);
                  saveProject(finalProj);
                  const first = finalProj.acts[0]?.chapters[0]?.scenes[0];
                  if (first) setSelectedSceneId(first.id);
                }}
                onNavigateView={(v) => setActiveView(v)}
                onOpenCloudSync={() => setIsCloudSyncOpen(true)}
              />
            )}

            {/* VIEW 1: MANUSCRIPT EDITOR */}
            {(activeView === "manuscript" || activeView === "editor") && (
              <>
                {/* Outline Manuscript Sidebar */}
                {isSidebarOpen && !isZenMode && (
                  <ManuscriptSidebar
                    project={project}
                    selectedSceneId={selectedSceneId}
                    onSelectScene={setSelectedSceneId}
                    onUpdateProject={handleUpdateProject}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                )}

                {/* Rich Text Writing Editor */}
                <RichTextEditor
                  scene={currentScene}
                  project={project}
                  onUpdateScene={handleUpdateScene}
                  onUpdateProjectSettings={handleUpdateProjectSettings}
                  isZenMode={isZenMode}
                  setIsZenMode={setIsZenMode}
                  isInspectorOpen={isInspectorOpen}
                  onOpenInspector={() => setIsInspectorOpen(!isInspectorOpen)}
                />

                {/* Scene Lore & AI Muse Inspector */}
                {isInspectorOpen && currentScene && !isZenMode && (
                  <SceneInspector
                    scene={currentScene}
                    project={project}
                    onUpdateScene={handleUpdateScene}
                    onClose={() => setIsInspectorOpen(false)}
                    onOpenEntityDossier={(id) => setDossierEntityId(id)}
                    onCreateCharacter={() => setIsCreatingCharacterFromInspector(true)}
                    onOpenWordGoals={() => setIsWordGoalsModalOpen(true)}
                    onUpdateProject={handleUpdateProject}
                  />
                )}
              </>
            )}

            {/* VIEW 2: PLANNING & OUTLINING */}
            {activeView === "planning" && (
              <PlanningDashboard
                project={project}
                onUpdateProject={handleUpdateProject}
                onSelectScene={handleSelectScene}
                onOpenEntityDossier={(id) => {
                  setDossierEntityId(id);
                  setActiveView("codex");
                }}
              />
            )}

            {/* VIEW 3: WORLDBUILDING & CODEX */}
            {(activeView === "codex" || activeView === "world") && (
              <WorldbuildingHub
                project={project}
                onUpdateProject={handleUpdateProject}
                onOpenRelationshipMap={() => setActiveView("relationships")}
              />
            )}

            {/* VIEW 4: GRAPHICAL RELATIONSHIP MAP */}
            {(activeView === "relationships" || activeView === "relations") && (
              <RelationshipMapView
                project={project}
                onUpdateProject={handleUpdateProject}
                onBackToCodex={() => setActiveView("codex")}
                onOpenBoard={() => setActiveView("gallery")}
                onOpenEntityBoard={(entityId) => {
                  setDossierInitialTab("whiteboard");
                  setDossierEntityId(entityId);
                }}
              />
            )}

            {/* VIEW 5: NOVEL-LEVEL DEDICATED VISUAL WHITEBOARD & MOODBOARD */}
            {activeView === "gallery" && (
              <VisualBoardView
                project={project}
                onUpdateProject={handleUpdateProject}
              />
            )}

            {/* VIEW 6: FULL TYPESETTING & EXPORT PAGE */}
            {activeView === "export" && (
              <ExportPageView
                project={project}
                onUpdateProject={handleUpdateProject}
                onBack={() => setActiveView("manuscript")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        currentProject={project}
        onLoadProject={(loaded) => {
          setProject(loaded);
          const first = loaded.acts[0]?.chapters[0]?.scenes[0];
          if (first) {
            setSelectedSceneId(first.id);
          }
          setIsCloudSyncOpen(false);
        }}
        lastSyncedAt={lastSyncedAt}
        syncStatus={cloudSyncStatus}
        onTriggerSave={handleTriggerSaveToCloud}
      />

      {/* Cloud Version Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={isConflictModalOpen}
        conflict={conflictData}
        onResolveMerge={handleResolveMerge}
        onResolveRemote={handleResolveRemote}
        onResolveForceOverwrite={handleResolveForceOverwrite}
        onClose={() => setIsConflictModalOpen(false)}
      />

      {/* Global Modals */}
      {isExportModalOpen && (
        <ExportModal
          project={project}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Autoguardado de Versiones Modal (3 últimas versiones) */}
      <VersionsModal
        project={project}
        isOpen={isVersionsModalOpen}
        onClose={() => setIsVersionsModalOpen(false)}
        onProjectRestored={(restored) => {
          setProject(restored);
          const firstScene = restored.acts[0]?.chapters[0]?.scenes[0];
          if (firstScene) {
            setSelectedSceneId(firstScene.id);
          }
        }}
      />

      {/* Metas y Objetivos de Palabras (Escenas, Capítulos, Arcos y Global) */}
      <WordGoalsModal
        project={project}
        isOpen={isWordGoalsModalOpen}
        onClose={() => setIsWordGoalsModalOpen(false)}
        onUpdateProject={handleUpdateProject}
      />

      {/* Quick Entity Dossier Modal or Create Character from Inspector */}
      {(dossierEntityId || isCreatingCharacterFromInspector) && (
        <EntityModal
          entity={isCreatingCharacterFromInspector ? null : selectedDossierEntity}
          project={project}
          initialTab={dossierInitialTab}
          onSave={(saved) => {
            handleUpdateProject((p) => {
              const exists = p.entities.some((e) => e.id === saved.id);
              return {
                ...p,
                entities: exists
                  ? p.entities.map((e) => (e.id === saved.id ? saved : e))
                  : [...p.entities, saved],
              };
            });
            // If created from the scene inspector, automatically add this character to current scene!
            if (isCreatingCharacterFromInspector && currentScene) {
              handleUpdateScene(currentScene.id, {
                characterIds: Array.from(new Set([...currentScene.characterIds, saved.id])),
              });
            }
            setDossierEntityId(null);
            setDossierInitialTab("details");
            setIsCreatingCharacterFromInspector(false);
          }}
          onDelete={(id) => {
            handleUpdateProject((p) => ({
              ...p,
              entities: p.entities.filter((e) => e.id !== id),
            }));
            setDossierEntityId(null);
            setDossierInitialTab("details");
            setIsCreatingCharacterFromInspector(false);
          }}
          onClose={() => {
            setDossierEntityId(null);
            setDossierInitialTab("details");
            setIsCreatingCharacterFromInspector(false);
          }}
        />
      )}

      {/* Toast de Sincronización Automática en la Nube */}
      <AnimatePresence>
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full shadow-xl border text-xs font-medium backdrop-blur-md pointer-events-none"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--accent)",
              color: "var(--text-main)",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>{syncToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

