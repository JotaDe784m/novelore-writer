/**
 * Novelore — Firebase Adapter (Legacy Offline Stub)
 * Converted to pure offline stub for Phase 1 (Local-First Desktop).
 * All external network calls, Firestore rules, and cloud dependencies are disabled.
 */

import { NovelProject, CloudSceneDocument, User } from "../types";

export function extractScenesFromProject(
  project: NovelProject,
  updatedAt: string,
  syncVersion?: number
): CloudSceneDocument[] {
  const scenes: CloudSceneDocument[] = [];
  if (Array.isArray(project.acts)) {
    for (const act of project.acts) {
      if (Array.isArray(act.chapters)) {
        for (const chap of act.chapters) {
          if (Array.isArray(chap.scenes)) {
            for (const sc of chap.scenes) {
              scenes.push({
                id: sc.id,
                novelId: project.id,
                chapterId: chap.id,
                actId: act.id,
                content: sc.content || "",
                notes: sc.notes || "",
                wordCount: sc.wordCount || 0,
                updatedAt,
                syncVersion,
              });
            }
          }
        }
      }
    }
  }
  return scenes;
}

export function rehydrateProjectWithScenes(
  rootProject: NovelProject,
  sceneDocs: CloudSceneDocument[]
): NovelProject {
  const sceneMap = new Map<string, CloudSceneDocument>();
  for (const doc of sceneDocs) {
    sceneMap.set(doc.id, doc);
  }

  const acts = (rootProject.acts || []).map((act) => ({
    ...act,
    chapters: (act.chapters || []).map((chap) => ({
      ...chap,
      scenes: (chap.scenes || []).map((sc) => {
        const matching = sceneMap.get(sc.id);
        if (matching) {
          return {
            ...sc,
            content: matching.content || sc.content || "",
            notes: matching.notes !== undefined ? matching.notes : sc.notes || "",
            wordCount: matching.wordCount ?? sc.wordCount ?? 0,
          };
        }
        return sc;
      }),
    })),
  }));

  return { ...rootProject, acts };
}

export function getClientSessionId(): string {
  return "local-desktop-session";
}

export enum OperationType {
  AUTH = "AUTH",
  READ = "READ",
  WRITE = "WRITE",
  DELETE = "DELETE",
}

export interface FirestoreErrorInfo {
  userMessage: string;
  isPermissionDenied: boolean;
  operationType: OperationType;
  requiresReauth: boolean;
}

export function handleFirestoreError(error: any, op: OperationType): FirestoreErrorInfo {
  return {
    userMessage: "Operación de red deshabilitada (modo local-first).",
    isPermissionDenied: false,
    operationType: op,
    requiresReauth: false,
  };
}

export function getFirebaseApp(): any {
  return null;
}

export function getDb(): any {
  return null;
}

export function getFirebaseAuth(): any {
  return null;
}

export function getFirebaseStorageInstance(): any {
  return null;
}

export async function initializeFirebase(): Promise<User | null> {
  return null;
}

export function onAuthUserChanged(callback: (user: User | null) => void): () => void {
  callback(null);
  return () => {};
}

export async function signInWithGoogle(): Promise<User> {
  throw new Error("Sincronización en la nube propietaria deshabilitada. Novelore es local-first.");
}

export async function signOutGoogle(): Promise<void> {}

export function getCurrentUser(): User | null {
  return null;
}

export interface SaveNovelResult {
  success: boolean;
  conflict?: any;
  error?: string;
  updatedAt?: string;
  savedAt?: string;
  syncVersion?: number;
  isOffline?: boolean;
}

export function smartMergeProjects(local: NovelProject, _remote: NovelProject): NovelProject {
  return local;
}

export async function saveNovelToCloud(
  _project: NovelProject,
  _clientSessionId?: any,
  _options?: any
): Promise<SaveNovelResult> {
  return { success: true, savedAt: new Date().toISOString() };
}

export interface RemoteNovelMetadata {
  id: string;
  title: string;
  updatedAt: string;
  wordCount: number;
  syncVersion?: number;
}

export function subscribeToNovel(
  _novelId: string,
  _onUpdateOrUser: any,
  _onConflictOrCb?: any,
  _onError?: any
): () => void {
  return () => {};
}

export async function checkRemoteNovelVersion(
  _novelId: string,
  _user: any
): Promise<RemoteNovelMetadata | null> {
  return null;
}

export async function loadNovelFromCloud(_novelId: string): Promise<NovelProject | null> {
  return null;
}

export interface CloudNovelSummary {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  updatedAt: string;
  wordCount: number;
  isOwnedByCurrentUser?: boolean;
  userEmail?: string;
}

export async function listCloudNovels(): Promise<CloudNovelSummary[]> {
  return [];
}

export async function deleteNovelFromCloud(_novelId: string): Promise<void> {}
