import { Scene, NovelProject } from "../../types";
import { countWords, insertEmDashAtCursor } from "../../utils/formatters";
import { indentLines, outdentLines, handleSmartEnter } from "../../utils/indentation";

interface UseEditorTextActionsParams {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  scene: Scene | null;
  project: NovelProject;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  pushToHistory: (text: string) => void;
  undo: (apply: (text: string) => void) => void;
  redo: (apply: (text: string) => void) => void;
  isUndoRedoActionRef: React.MutableRefObject<boolean>;
  updateErgonomics: (forceTypewriter?: boolean) => void;
  showToast: (msg: string) => void;
}

export function useEditorTextActions({
  textareaRef,
  scene,
  project,
  onUpdateScene,
  pushToHistory,
  undo,
  redo,
  isUndoRedoActionRef,
  updateErgonomics,
  showToast,
}: UseEditorTextActionsParams) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!scene) return;
    const newContent = e.target.value;
    const words = countWords(newContent);
    onUpdateScene(scene.id, { content: newContent, wordCount: words });
    if (!isUndoRedoActionRef.current) {
      pushToHistory(newContent);
    }
    updateErgonomics(true);
  };

  const handleUndo = () => {
    undo((content) => {
      if (scene) {
        onUpdateScene(scene.id, { content, wordCount: countWords(content) });
        updateErgonomics(true);
      }
    });
  };

  const handleRedo = () => {
    redo((content) => {
      if (scene) {
        onUpdateScene(scene.id, { content, wordCount: countWords(content) });
        updateErgonomics(true);
      }
    });
  };

  const handleInsertDash = () => {
    if (!textareaRef.current || !scene) return;
    insertEmDashAtCursor(textareaRef.current, (newText) => {
      onUpdateScene(scene.id, { content: newText, wordCount: countWords(newText) });
      pushToHistory(newText);
      updateErgonomics(true);
    });
  };

  const handleInsertGuillemets = () => {
    if (!textareaRef.current || !scene) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = scene.content || "";
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + `«${selected}»` + text.slice(end);
    const newCursor = selected ? end + 2 : start + 1;
    onUpdateScene(scene.id, { content: newText, wordCount: countWords(newText) });
    pushToHistory(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
      updateErgonomics(true);
    }, 0);
  };

  const handleInsertBreak = () => {
    if (!textareaRef.current || !scene) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const text = scene.content || "";
    const marker = "\n\n* * *\n\n";
    const newText = text.slice(0, start) + marker + text.slice(start);
    onUpdateScene(scene.id, { content: newText, wordCount: countWords(newText) });
    pushToHistory(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + marker.length, start + marker.length);
      updateErgonomics(true);
    }, 0);
  };

  const handleToggleCase = () => {
    if (!textareaRef.current || !scene) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = scene.content || "";
    if (start === end) return;
    const sel = text.slice(start, end);
    const transformed = sel === sel.toUpperCase() ? sel.toLowerCase() : sel.toUpperCase();
    const newText = text.slice(0, start) + transformed + text.slice(end);
    onUpdateScene(scene.id, { content: newText, wordCount: countWords(newText) });
    pushToHistory(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start, end);
    }, 0);
  };

  const handleCopyContent = () => {
    if (!scene?.content) return;
    navigator.clipboard.writeText(scene.content);
    showToast("Texto de la escena copiado");
  };

  const handleIndent = () => {
    if (!textareaRef.current || !scene) return;
    const res = indentLines(scene.content || "", textareaRef.current.selectionStart, textareaRef.current.selectionEnd);
    onUpdateScene(scene.id, { content: res.newText, wordCount: countWords(res.newText) });
    pushToHistory(res.newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(res.newStart, res.newEnd);
      updateErgonomics(true);
    }, 0);
  };

  const handleOutdent = () => {
    if (!textareaRef.current || !scene) return;
    const res = outdentLines(scene.content || "", textareaRef.current.selectionStart, textareaRef.current.selectionEnd);
    onUpdateScene(scene.id, { content: res.newText, wordCount: countWords(res.newText) });
    pushToHistory(res.newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(res.newStart, res.newEnd);
      updateErgonomics(true);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    if (isCmdOrCtrl && !e.altKey) {
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndo();
        return;
      }
      if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
        return;
      }
    }

    if (e.key === "Enter") {
      if (project.settings.paragraphIndent && textareaRef.current && scene) {
        e.preventDefault();
        const res = handleSmartEnter(
          scene.content || "",
          textareaRef.current.selectionStart,
          textareaRef.current.selectionEnd,
          true
        );
        onUpdateScene(scene.id, {
          content: res.newText,
          wordCount: countWords(res.newText),
        });
        pushToHistory(res.newText);
        setTimeout(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(res.newCursor, res.newCursor);
          updateErgonomics(true);
        }, 0);
        return;
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      if (!textareaRef.current || !scene) return;
      const res = e.shiftKey
        ? outdentLines(scene.content || "", textareaRef.current.selectionStart, textareaRef.current.selectionEnd)
        : indentLines(scene.content || "", textareaRef.current.selectionStart, textareaRef.current.selectionEnd);
      onUpdateScene(scene.id, {
        content: res.newText,
        wordCount: countWords(res.newText),
      });
      pushToHistory(res.newText);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(res.newStart, res.newEnd);
        updateErgonomics(true);
      }, 0);
    }
  };

  return {
    handleTextChange,
    handleUndo,
    handleRedo,
    handleInsertDash,
    handleInsertGuillemets,
    handleInsertBreak,
    handleToggleCase,
    handleCopyContent,
    handleIndent,
    handleOutdent,
    handleKeyDown,
  };
}
