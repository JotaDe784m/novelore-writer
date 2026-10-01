export interface MentionContextSnippet {
  text: string;
  matchedTerm: string;
  charIndex: number;
  before: string;
  match: string;
  after: string;
}

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

export interface SceneMentionOccurrence {
  sceneId: string;
  sceneTitle: string;
  sceneOrder: number;
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  actId: string;
  actTitle: string;
  actOrder: number;
  count: number;
  byTerm: Record<string, number>;
  snippets: MentionContextSnippet[];
}

export interface ChapterMentionStats {
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  actId: string;
  totalCount: number;
  sceneCount: number;
  scenes: SceneMentionOccurrence[];
}

export interface ActMentionStats {
  actId: string;
  actTitle: string;
  actOrder: number;
  totalCount: number;
  percentage: number;
  chapterCount: number;
  chapters: ChapterMentionStats[];
}

export interface EntityDetailedMentions {
  totalCount: number;
  uniqueScenesCount: number;
  totalScenesInNovel: number;
  scenePresencePercentage: number;
  byTerm: { term: string; count: number; isPrimary: boolean }[];
  acts: ActMentionStats[];
  flatScenes: SceneMentionOccurrence[];
}
