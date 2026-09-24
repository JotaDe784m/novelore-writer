import { useState, useRef, useEffect, useCallback } from "react";

export function useEditorHistory(initialContent: string) {
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastRecordedContentRef = useRef(initialContent);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoActionRef = useRef(false);

  // Reset or initialize history when switching items
  const resetHistory = useCallback((content: string) => {
    setHistory([content]);
    setHistoryIndex(0);
    lastRecordedContentRef.current = content;
    isUndoRedoActionRef.current = false;
  }, []);

  const pushToHistory = useCallback((newText: string) => {
    if (newText === lastRecordedContentRef.current) return;

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(newText);
        if (next.length > 50) next.shift();
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
      lastRecordedContentRef.current = newText;
    }, 400);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback((onApply: (text: string) => void) => {
    if (!canUndo) return;
    const targetIdx = historyIndex - 1;
    const targetContent = history[targetIdx];
    if (targetContent !== undefined) {
      isUndoRedoActionRef.current = true;
      setHistoryIndex(targetIdx);
      lastRecordedContentRef.current = targetContent;
      onApply(targetContent);
      setTimeout(() => {
        isUndoRedoActionRef.current = false;
      }, 50);
    }
  }, [canUndo, history, historyIndex]);

  const redo = useCallback((onApply: (text: string) => void) => {
    if (!canRedo) return;
    const targetIdx = historyIndex + 1;
    const targetContent = history[targetIdx];
    if (targetContent !== undefined) {
      isUndoRedoActionRef.current = true;
      setHistoryIndex(targetIdx);
      lastRecordedContentRef.current = targetContent;
      onApply(targetContent);
      setTimeout(() => {
        isUndoRedoActionRef.current = false;
      }, 50);
    }
  }, [canRedo, history, historyIndex]);

  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, []);

  return {
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    isUndoRedoActionRef,
  };
}

