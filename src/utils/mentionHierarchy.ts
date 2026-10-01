import { NovelProject, WorldEntity } from "../types";
import {
  EntityDetailedMentions,
  ActMentionStats,
  ChapterMentionStats,
  SceneMentionOccurrence,
  MentionContextSnippet,
} from "./mentionTypes";
import {
  getAllManuscriptScenes,
  countOccurrencesInText,
  extractContextSnippets,
} from "./mentionCounter";

/**
 * Calculates hierarchical, detailed mentions with Act and Chapter presence breakdowns
 */
export function calculateEntityDetailedMentions(
  entity: WorldEntity,
  project: NovelProject
): EntityDetailedMentions {
  const flatScenes = getAllManuscriptScenes(project);
  const terms: { term: string; isPrimary: boolean }[] = [];
  if (entity.name?.trim()) terms.push({ term: entity.name.trim(), isPrimary: true });
  if (Array.isArray(entity.aliases)) {
    for (const a of entity.aliases) if (a?.trim()) terms.push({ term: a.trim(), isPrimary: false });
  }

  const byTermMap: Record<string, number> = {};
  for (const item of terms) byTermMap[item.term] = 0;

  const matchedScenes: SceneMentionOccurrence[] = [];
  let totalCount = 0;

  for (const item of flatScenes) {
    let sceneTotal = 0;
    const sceneByTerm: Record<string, number> = {};
    const sceneSnippets: MentionContextSnippet[] = [];

    for (const tObj of terms) {
      const c = countOccurrencesInText(item.plainText, tObj.term);
      if (c > 0) {
        byTermMap[tObj.term] = (byTermMap[tObj.term] || 0) + c;
        sceneByTerm[tObj.term] = c;
        sceneTotal += c;
        const snips = extractContextSnippets(item.plainText, tObj.term, 2);
        sceneSnippets.push(...snips);
      }
    }

    if (sceneTotal > 0) {
      totalCount += sceneTotal;
      matchedScenes.push({
        sceneId: item.scene.id,
        sceneTitle: item.scene.title || "Escena sin título",
        sceneOrder: item.scene.order || 1,
        chapterId: item.chapterId || "chap-default",
        chapterTitle: item.chapterTitle || "Capítulo",
        chapterOrder: item.chapterOrder || 1,
        actId: item.actId || "act-default",
        actTitle: item.actTitle || "Acto",
        actOrder: item.actOrder || 1,
        count: sceneTotal,
        byTerm: sceneByTerm,
        snippets: sceneSnippets.slice(0, 3),
      });
    }
  }

  // Agrupar por Actos y Capítulos
  const actMap = new Map<string, { title: string; order: number; chapMap: Map<string, { title: string; order: number; scenes: SceneMentionOccurrence[] }> }>();
  for (const sc of matchedScenes) {
    if (!actMap.has(sc.actId)) {
      actMap.set(sc.actId, { title: sc.actTitle, order: sc.actOrder, chapMap: new Map() });
    }
    const actData = actMap.get(sc.actId)!;
    if (!actData.chapMap.has(sc.chapterId)) {
      actData.chapMap.set(sc.chapterId, { title: sc.chapterTitle, order: sc.chapterOrder, scenes: [] });
    }
    actData.chapMap.get(sc.chapterId)!.scenes.push(sc);
  }

  const acts: ActMentionStats[] = [];
  for (const [actId, actData] of actMap.entries()) {
    const chapters: ChapterMentionStats[] = [];
    let actTotal = 0;

    for (const [chapId, chapData] of actData.chapMap.entries()) {
      const chapTotal = chapData.scenes.reduce((acc, s) => acc + s.count, 0);
      actTotal += chapTotal;
      chapters.push({
        chapterId: chapId,
        chapterTitle: chapData.title,
        chapterOrder: chapData.order,
        actId,
        totalCount: chapTotal,
        sceneCount: chapData.scenes.length,
        scenes: chapData.scenes,
      });
    }

    chapters.sort((a, b) => a.chapterOrder - b.chapterOrder);
    const pct = totalCount > 0 ? Math.round((actTotal / totalCount) * 100) : 0;
    acts.push({
      actId,
      actTitle: actData.title,
      actOrder: actData.order,
      totalCount: actTotal,
      percentage: pct,
      chapterCount: chapters.length,
      chapters,
    });
  }

  acts.sort((a, b) => a.actOrder - b.actOrder);
  const totalScenes = flatScenes.length;
  const presencePct = totalScenes > 0 ? Math.round((matchedScenes.length / totalScenes) * 1000) / 10 : 0;

  return {
    totalCount,
    uniqueScenesCount: matchedScenes.length,
    totalScenesInNovel: totalScenes,
    scenePresencePercentage: presencePct,
    byTerm: terms.map((t) => ({ term: t.term, count: byTermMap[t.term] || 0, isPrimary: t.isPrimary })),
    acts,
    flatScenes: matchedScenes,
  };
}
