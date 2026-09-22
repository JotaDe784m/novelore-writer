import { NovelProject, WorldEntity, Scene } from "../types";

export interface MentionMatch {
  sceneId: string;
  sceneTitle: string;
  chapterTitle: string;
  actTitle: string;
  count: number;
}

export interface EntityMentionStats {
  totalCount: number;
  byTerm: { term: string; count: number }[];
  scenes: MentionMatch[];
}

export interface FlatSceneData {
  scene: Scene;
  chapterTitle: string;
  actTitle: string;
  plainText: string;
}

/**
 * Extracts all scenes from project acts and chapters, with HTML stripped into searchable text
 */
export function getAllManuscriptScenes(project: NovelProject): FlatSceneData[] {
  const result: FlatSceneData[] = [];
  if (!project.acts || !Array.isArray(project.acts)) return result;

  for (const act of project.acts) {
    if (!act.chapters || !Array.isArray(act.chapters)) continue;
    for (const chapter of act.chapters) {
      if (!chapter.scenes || !Array.isArray(chapter.scenes)) continue;
      for (const scene of chapter.scenes) {
        const rawContent = scene.content || "";
        // Strip HTML tags and entities to get clean searchable text
        const plain = rawContent
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/\s+/g, " ");

        result.push({
          scene,
          chapterTitle: chapter.title || "Capítulo",
          actTitle: act.title || "Acto",
          plainText: plain,
        });
      }
    }
  }
  return result;
}

/**
 * Escapes regex special characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Counts occurrences of a term in text using unicode-aware boundary matching for Spanish and other languages
 */
export function countOccurrencesInText(text: string, term: string): number {
  if (!text || !term || !term.trim()) return 0;
  const cleanTerm = term.trim();

  try {
    // Unicode-aware word boundary: check that character before and after is not a letter or digit
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegExp(cleanTerm)}($|[^\\p{L}\\p{N}_])`, "gui");
    let count = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      count++;
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
    return count;
  } catch {
    // Fallback standard word boundary
    const regex = new RegExp(`\\b${escapeRegExp(cleanTerm)}\\b`, "gi");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }
}

/**
 * Calculate mention statistics for a given entity across the novel manuscript
 */
export function calculateEntityMentions(
  entity: WorldEntity,
  scenes: FlatSceneData[]
): EntityMentionStats {
  const terms = new Set<string>();
  if (entity.name && entity.name.trim()) {
    terms.add(entity.name.trim());
  }
  if (entity.aliases && Array.isArray(entity.aliases)) {
    for (const alias of entity.aliases) {
      if (alias && alias.trim()) {
        terms.add(alias.trim());
      }
    }
  }

  const termList = Array.from(terms);
  const byTermMap: Record<string, number> = {};
  for (const t of termList) {
    byTermMap[t] = 0;
  }

  const scenesResult: MentionMatch[] = [];
  let totalCount = 0;

  for (const item of scenes) {
    let sceneTotal = 0;
    for (const t of termList) {
      const c = countOccurrencesInText(item.plainText, t);
      if (c > 0) {
        byTermMap[t] = (byTermMap[t] || 0) + c;
        sceneTotal += c;
      }
    }

    if (sceneTotal > 0) {
      totalCount += sceneTotal;
      scenesResult.push({
        sceneId: item.scene.id,
        sceneTitle: item.scene.title || "Escena sin título",
        chapterTitle: item.chapterTitle,
        actTitle: item.actTitle,
        count: sceneTotal,
      });
    }
  }

  return {
    totalCount,
    byTerm: termList.map((t) => ({ term: t, count: byTermMap[t] || 0 })),
    scenes: scenesResult,
  };
}

/**
 * Calculates mention counts for an array of entities efficiently in one pass
 */
export function calculateAllEntitiesMentions(
  entities: WorldEntity[],
  project: NovelProject
): Record<string, EntityMentionStats> {
  const scenes = getAllManuscriptScenes(project);
  const result: Record<string, EntityMentionStats> = {};

  for (const entity of entities) {
    result[entity.id] = calculateEntityMentions(entity, scenes);
  }

  return result;
}
