import { NovelProject, WorldEntity, Scene } from "../types";
import { EntityMentionStats, MentionMatch } from "./mentionTypes";

export * from "./mentionTypes";
export { calculateEntityDetailedMentions } from "./mentionHierarchy";

export interface FlatSceneData {
  scene: Scene;
  chapterTitle: string;
  chapterOrder?: number;
  chapterId?: string;
  actTitle: string;
  actOrder?: number;
  actId?: string;
  plainText: string;
}

const sceneTextCache = new Map<string, { len: number; text: string }>();

function cleanPlainText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[#*`_~>[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts and cleans searchable text from all scenes using a length-based cache
 */
export function getAllManuscriptScenes(project: NovelProject): FlatSceneData[] {
  const result: FlatSceneData[] = [];
  if (!project.acts || !Array.isArray(project.acts)) return result;

  for (let aIdx = 0; aIdx < project.acts.length; aIdx++) {
    const act = project.acts[aIdx];
    if (!act.chapters || !Array.isArray(act.chapters)) continue;

    for (let cIdx = 0; cIdx < act.chapters.length; cIdx++) {
      const chapter = act.chapters[cIdx];
      if (!chapter.scenes || !Array.isArray(chapter.scenes)) continue;

      for (let sIdx = 0; sIdx < chapter.scenes.length; sIdx++) {
        const scene = chapter.scenes[sIdx];
        const raw = scene.content || "";
        const cacheKey = `${scene.id}-${raw.length}`;

        let plain = sceneTextCache.get(cacheKey)?.text;
        if (plain === undefined) {
          plain = cleanPlainText(raw);
          sceneTextCache.set(cacheKey, { len: raw.length, text: plain });
        }

        result.push({
          scene,
          chapterTitle: chapter.title || `Capítulo ${cIdx + 1}`,
          chapterOrder: chapter.order || cIdx + 1,
          chapterId: chapter.id,
          actTitle: act.title || `Acto ${aIdx + 1}`,
          actOrder: act.order || aIdx + 1,
          actId: act.id,
          plainText: plain,
        });
      }
    }
  }
  return result;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Counts occurrences of a term in text using unicode-aware boundary matching for Spanish
 */
export function countOccurrencesInText(text: string, term: string): number {
  if (!text || !term || !term.trim()) return 0;
  const cleanTerm = term.trim();

  try {
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegExp(cleanTerm)}($|[^\\p{L}\\p{N}_])`, "gui");
    let count = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      count++;
      if (match.index === regex.lastIndex) regex.lastIndex++;
    }
    return count;
  } catch {
    const regex = new RegExp(`\\b${escapeRegExp(cleanTerm)}\\b`, "gi");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }
}

/**
 * Extracts preview snippets with surrounding text for occurrences of a term
 */
export function extractContextSnippets(
  text: string,
  term: string,
  limit: number = 3
): import("./mentionTypes").MentionContextSnippet[] {
  if (!text || !term || !term.trim()) return [];
  const cleanTerm = term.trim();
  const snippets: import("./mentionTypes").MentionContextSnippet[] = [];

  try {
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapeRegExp(cleanTerm)})($|[^\\p{L}\\p{N}_])`, "gui");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null && snippets.length < limit) {
      const matchIndex = match.index + (match[1] ? match[1].length : 0);
      const start = Math.max(0, matchIndex - 45);
      const end = Math.min(text.length, matchIndex + cleanTerm.length + 45);

      const before = text.substring(start, matchIndex);
      const matchedStr = text.substring(matchIndex, matchIndex + cleanTerm.length);
      const after = text.substring(matchIndex + cleanTerm.length, end);

      let snippetText = text.substring(start, end).trim().replace(/\s+/g, " ");
      if (start > 0) snippetText = `...${snippetText}`;
      if (end < text.length) snippetText = `${snippetText}...`;

      snippets.push({
        text: snippetText,
        matchedTerm: cleanTerm,
        charIndex: matchIndex,
        before,
        match: matchedStr,
        after,
      });

      if (match.index === regex.lastIndex) regex.lastIndex++;
    }
  } catch {
    // Silently fallback on malformed patterns
  }
  return snippets;
}

/**
 * Calculates mention statistics for an entity across manuscript scenes
 */
export function calculateEntityMentions(entity: WorldEntity, scenes: FlatSceneData[]): EntityMentionStats {
  const terms = new Set<string>();
  if (entity.name?.trim()) terms.add(entity.name.trim());
  if (Array.isArray(entity.aliases)) {
    for (const a of entity.aliases) if (a?.trim()) terms.add(a.trim());
  }

  const termList = Array.from(terms);
  const byTermMap: Record<string, number> = {};
  for (const t of termList) byTermMap[t] = 0;

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
 * Calculates mention counts for an array of entities in one pass
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
