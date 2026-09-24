import { useState } from "react";
import { Act, Chapter, NovelProject, Scene } from "../../../types";
import { useManuscriptStore } from "../../../stores/useManuscriptStore";
import { EditingItem } from "./SidebarSceneItem";
import { ConfirmDeleteItem } from "./SidebarDeleteModal";

interface UseSidebarActionsParams {
  acts: Act[];
  propOnSelectScene?: (sceneId: string) => void;
  propOnUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
  setCollapsedActs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setCollapsedChapters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function useSidebarActions({
  acts,
  propOnSelectScene,
  propOnUpdateProject,
  setCollapsedActs,
  setCollapsedChapters,
}: UseSidebarActionsParams) {
  const addSceneStore = useManuscriptStore((s) => s.addScene);
  const deleteSceneStore = useManuscriptStore((s) => s.deleteScene);
  const updateSceneMetaStore = useManuscriptStore((s) => s.updateSceneMeta);
  const addChapterStore = useManuscriptStore((s) => s.addChapter);
  const updateChapterTitleStore = useManuscriptStore((s) => s.updateChapterTitle);
  const deleteChapterStore = useManuscriptStore((s) => s.deleteChapter);
  const addActStore = useManuscriptStore((s) => s.addAct);
  const updateActTitleStore = useManuscriptStore((s) => s.updateActTitle);
  const deleteActStore = useManuscriptStore((s) => s.deleteAct);

  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteItem | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const handleAddAct = () => {
    const actNumber = acts.length + 1;
    const newAct = addActStore(`Acto ${actNumber}`);
    if (newAct && propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }
  };

  const handleAddChapter = (actId: string) => {
    const targetAct = acts.find((a) => a.id === actId);
    const chapterNumber = (targetAct?.chapters?.length || 0) + 1;
    const newChap = addChapterStore(actId, `Capítulo ${chapterNumber}`);
    if (newChap && propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }
    setCollapsedActs((prev) => ({ ...prev, [actId]: false }));
  };

  const handleAddScene = (chapterId: string) => {
    let targetActId = "";
    let sceneNumber = 1;
    for (const act of acts) {
      const found = (act.chapters || []).find((c) => c.id === chapterId);
      if (found) {
        targetActId = act.id;
        sceneNumber = (found.scenes?.length || 0) + 1;
        break;
      }
    }
    const newScene = addSceneStore(chapterId, `Escena ${sceneNumber}`);
    if (newScene) {
      if (propOnSelectScene) propOnSelectScene(newScene.id);
      if (propOnUpdateProject) {
        const currentStoreActs = useManuscriptStore.getState().acts;
        propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
      }
      if (targetActId) setCollapsedActs((prev) => ({ ...prev, [targetActId]: false }));
      setCollapsedChapters((prev) => ({ ...prev, [chapterId]: false }));
    }
  };

  const handleStartRename = (e: React.MouseEvent, type: "act" | "chapter" | "scene", id: string, title: string) => {
    e.stopPropagation();
    setEditingItem({ type, id, title });
  };

  const handleSaveRename = () => {
    if (!editingItem || !editingItem.title.trim()) {
      setEditingItem(null);
      return;
    }
    const { type, id, title } = editingItem;
    const cleanTitle = title.trim();

    if (type === "act") updateActTitleStore(id, cleanTitle);
    else if (type === "chapter") updateChapterTitleStore(id, cleanTitle);
    else if (type === "scene") updateSceneMetaStore(id, { title: cleanTitle });

    if (propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }
    setEditingItem(null);
  };

  const handleDeleteActRequest = (e: React.MouseEvent, act: Act) => {
    e.stopPropagation();
    if (acts.length <= 1) {
      showAlert("El manuscrito debe contener al menos un acto.");
      return;
    }
    setConfirmDelete({ type: "act", id: act.id, title: act.title });
  };

  const handleDeleteChapterRequest = (e: React.MouseEvent, actId: string, chap: Chapter) => {
    e.stopPropagation();
    setConfirmDelete({ type: "chapter", id: chap.id, title: chap.title, actId });
  };

  const handleDeleteSceneRequest = (e: React.MouseEvent, actId: string, chapterId: string, sc: Scene) => {
    e.stopPropagation();
    setConfirmDelete({ type: "scene", id: sc.id, title: sc.title, actId, chapterId });
  };

  const handleExecuteDelete = () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;

    if (type === "act") deleteActStore(id);
    else if (type === "chapter") deleteChapterStore(id);
    else if (type === "scene") deleteSceneStore(id);

    if (propOnUpdateProject) {
      const currentStoreActs = useManuscriptStore.getState().acts;
      propOnUpdateProject((prev) => ({ ...prev, acts: currentStoreActs }));
    }
    setConfirmDelete(null);
  };

  return {
    editingItem,
    setEditingItem,
    confirmDelete,
    setConfirmDelete,
    alertMessage,
    handleAddAct,
    handleAddChapter,
    handleAddScene,
    handleStartRename,
    handleSaveRename,
    handleDeleteActRequest,
    handleDeleteChapterRequest,
    handleDeleteSceneRequest,
    handleExecuteDelete,
  };
}

