import { NovelProject, Scene } from "../../types";
import { calculateTotalWords } from "../../utils/storage";

export interface LastWorkedSceneInfo {
  sceneId: string;
  sceneTitle: string;
  chapterTitle: string;
  actTitle: string;
  wordCount: number;
  updatedAt?: string;
}

export function getLastWorkedScene(
  project: NovelProject | null,
  selectedSceneId?: string
): LastWorkedSceneInfo | null {
  if (!project || !project.acts || project.acts.length === 0) return null;

  let chosenScene: Scene | null = null;
  let chosenChapterTitle = "";
  let chosenActTitle = "";

  // 1. If selectedSceneId is provided, try to match it
  if (selectedSceneId) {
    for (const act of project.acts) {
      for (const chapter of act.chapters || []) {
        for (const scene of chapter.scenes || []) {
          if (scene.id === selectedSceneId) {
            chosenScene = scene;
            chosenChapterTitle = chapter.title || "Capítulo sin título";
            chosenActTitle = act.title || "Acto sin título";
            break;
          }
        }
        if (chosenScene) break;
      }
      if (chosenScene) break;
    }
  }

  // 2. If not found by selectedSceneId, find the most recently updated scene
  if (!chosenScene) {
    let latestTime = 0;
    for (const act of project.acts) {
      for (const chapter of act.chapters || []) {
        for (const scene of chapter.scenes || []) {
          const t = scene.updatedAt ? new Date(scene.updatedAt).getTime() : 0;
          if (t > latestTime || !chosenScene) {
            latestTime = t;
            chosenScene = scene;
            chosenChapterTitle = chapter.title || "Capítulo sin título";
            chosenActTitle = act.title || "Acto sin título";
          }
        }
      }
    }
  }

  if (!chosenScene) return null;

  return {
    sceneId: chosenScene.id,
    sceneTitle: chosenScene.title || "Escena sin título",
    chapterTitle: chosenChapterTitle,
    actTitle: chosenActTitle,
    wordCount: chosenScene.wordCount || 0,
    updatedAt: chosenScene.updatedAt,
  };
}

export function calculateProjectStats(project: NovelProject | null) {
  if (!project) {
    return {
      totalWords: 0,
      sceneCount: 0,
      chapterCount: 0,
      actCount: 0,
      targetWords: 50000,
      enableWordGoals: true,
      progressPercent: 0,
      estReadingMinutes: 0,
      estPages: 0,
    };
  }

  const totalWords = calculateTotalWords(project);
  let sceneCount = 0;
  let chapterCount = 0;
  const actCount = project.acts?.length || 0;

  for (const act of project.acts || []) {
    chapterCount += act.chapters?.length || 0;
    for (const ch of act.chapters || []) {
      sceneCount += ch.scenes?.length || 0;
    }
  }

  const targetWords = project.settings?.targetTotalWords || 50000;
  const enableWordGoals = project.settings?.enableWordGoals !== false;
  const progressPercent = Math.min(
    100,
    Math.round((totalWords / Math.max(1, targetWords)) * 100)
  );
  const estReadingMinutes = Math.ceil(totalWords / 220); // ~220 wpm
  const estPages = Math.ceil(totalWords / 250); // ~250 words per standard page

  return {
    totalWords,
    sceneCount,
    chapterCount,
    actCount,
    targetWords,
    enableWordGoals,
    progressPercent,
    estReadingMinutes,
    estPages,
  };
}

export function formatRelativeDate(isoString?: string): string {
  if (!isoString) return "Recientemente";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Recientemente";

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recientemente";
  }
}

export function getTimeGreeting(authorName?: string): string {
  const hour = new Date().getHours();
  let base = "Buenas tardes";
  if (hour >= 6 && hour < 12) {
    base = "Buenos días";
  } else if (hour >= 20 || hour < 6) {
    base = "Buenas noches";
  }

  if (authorName && authorName.trim() && authorName !== "Autor") {
    return `${base}, ${authorName.trim()}`;
  }
  return `${base}, escritor`;
}

const CATEGORY_NAMES: Record<string, string> = {
  character: "Personaje",
  characters: "Personaje",
  personaje: "Personaje",
  personajes: "Personaje",
  location: "Locación",
  locations: "Locación",
  lugar: "Locación",
  lugares: "Locación",
  faction: "Facción",
  factions: "Facción",
  faccion: "Facción",
  facciones: "Facción",
  item: "Objeto",
  items: "Objeto",
  objeto: "Objeto",
  objetos: "Objeto",
  magic: "Magia",
  magia: "Magia",
  lore: "Historia",
  historia: "Historia",
  event: "Acontecimiento",
  events: "Acontecimiento",
  acontecimiento: "Acontecimiento",
  creature: "Criatura",
  concept: "Concepto",
  culture: "Cultura",
};

export function getCategoryLabel(category?: string, customCategories?: { id: string; label: string }[]): string {
  if (!category) return "Elemento";
  if (customCategories) {
    const found = customCategories.find((c) => c.id === category);
    if (found?.label) return found.label;
  }
  const lower = category.toLowerCase().trim();
  if (CATEGORY_NAMES[lower]) return CATEGORY_NAMES[lower];
  if (category.startsWith("cat-") || category.startsWith("rcat-")) {
    return "Elemento";
  }
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function getEntityInitials(name?: string): string {
  if (!name || !name.trim()) return "?";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

const LITERARY_COLORS = [
  "#6366f1", // Indigo
  "#0d9488", // Teal
  "#8b5cf6", // Purple
  "#d97706", // Amber
  "#059669", // Emerald
  "#e11d48", // Rose
  "#2563eb", // Blue
  "#7c3aed", // Violet
  "#475569", // Slate
];

export function getDeterministicColor(str?: string): string {
  if (!str) return LITERARY_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % LITERARY_COLORS.length;
  return LITERARY_COLORS[index];
}
