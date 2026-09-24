import { useEffect } from "react";
import { NovelProject } from "../../types";

interface UseEditorHotkeysParams {
  isTypewriterActive: boolean;
  isFocusActive: boolean;
  isZenMode: boolean;
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void;
  setIsZenMode: (val: boolean) => void;
  showToast: (msg: string) => void;
}

export function useEditorHotkeys({
  isTypewriterActive,
  isFocusActive,
  isZenMode,
  onUpdateProjectSettings,
  setIsZenMode,
  showToast,
}: UseEditorHotkeysParams) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
  }, [isTypewriterActive, isFocusActive, isZenMode, onUpdateProjectSettings, setIsZenMode, showToast]);
}

