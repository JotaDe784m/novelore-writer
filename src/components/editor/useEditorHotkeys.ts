import { useEffect } from "react";
import { NovelProject } from "../../types";

interface UseEditorHotkeysParams {
  isTypewriterActive: boolean;
  isFocusActive: boolean;
  isZenMode: boolean;
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void;
  setIsZenMode: (val: boolean) => void;
  showToast: (msg: string) => void;
  onInsertDash?: () => void;
}

export function useEditorHotkeys({
  isTypewriterActive,
  isFocusActive,
  isZenMode,
  onUpdateProjectSettings,
  setIsZenMode,
  showToast,
  onInsertDash,
}: UseEditorHotkeysParams) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      const isDashShortcut =
        (isCmdOrCtrl && e.shiftKey && (e.key === "m" || e.key === "M" || e.code === "KeyM")) ||
        (e.altKey && !isCmdOrCtrl && (e.key === "-" || e.key === "—" || e.key === "–" || e.code === "Minus" || e.code === "NumpadSubtract")) ||
        (isCmdOrCtrl && e.altKey && (e.key === "-" || e.code === "Minus" || e.code === "NumpadSubtract")) ||
        (e.altKey && e.shiftKey && (e.key === "_" || e.key === "—" || e.code === "Minus" || e.code === "NumpadSubtract"));

      if (isDashShortcut && onInsertDash) {
        const target = e.target as HTMLElement | null;
        if (target && target.tagName === "INPUT") return;
        e.preventDefault();
        onInsertDash();
        return;
      }
      if (e.altKey && e.code === "KeyT") {
        e.preventDefault();
        onUpdateProjectSettings({ typewriterMode: !isTypewriterActive });
        showToast(!isTypewriterActive ? "Máquina activada" : "Máquina desactivada");
      } else if (e.altKey && e.code === "KeyF") {
        e.preventDefault();
        onUpdateProjectSettings({ focusMode: !isFocusActive });
        showToast(!isFocusActive ? "Foco activado" : "Foco desactivado");
      } else if (e.altKey && e.code === "KeyZ") {
        e.preventDefault();
        setIsZenMode(!isZenMode);
      } else if (e.key === "Escape" && isZenMode) {
        e.preventDefault();
        setIsZenMode(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isTypewriterActive, isFocusActive, isZenMode, onUpdateProjectSettings, setIsZenMode, showToast, onInsertDash]);
}

