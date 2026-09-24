import React, { useRef, useEffect, useState, useCallback } from "react";
import { NovelProject, Scene } from "../../types";
import {
  countCharacters,
  countWords,
  calculateReadingTimeMinutes,
} from "../../utils/formatters";
import { getOptimalReadingColumnWidth } from "../../utils/editorErgonomics";
import { FONT_OPTIONS } from "./editorConstants";
import { useEditorHistory } from "./useEditorHistory";
import { useRibbonScroll } from "./useRibbonScroll";
import { useCustomFonts } from "./useCustomFonts";
import { useEditorErgonomics } from "./useEditorErgonomics";
import { useEditorTextActions } from "./useEditorTextActions";
import { useEditorHotkeys } from "./useEditorHotkeys";
import { useFloatingMenus } from "./useFloatingMenus";
import { EditorEmptyState } from "./EditorEmptyState";
import { EditorCanvas } from "./EditorCanvas";
import { EditorHeader } from "./EditorHeader";
import { EditorRibbon } from "./EditorRibbon";
import { EditorFontMenuPortal } from "./EditorFontMenuPortal";
import { EditorSpacingMenuPortal } from "./EditorSpacingMenuPortal";
import { EditorFooter } from "./EditorFooter";

interface RichTextEditorProps {
  scene: Scene | null;
  project: NovelProject;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  onOpenInspector: () => void;
  isInspectorOpen: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  scene,
  project,
  onUpdateScene,
  onUpdateProjectSettings,
  isZenMode,
  setIsZenMode,
  onOpenInspector,
  isInspectorOpen,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const {
    showFontMenu,
    setShowFontMenu,
    showSpacingMenu,
    setShowSpacingMenu,
    fontMenuPos,
    spacingMenuPos,
    closeFloatingMenus,
    handleOpenFontMenu,
    handleOpenSpacingMenu,
  } = useFloatingMenus();

  const { customFontInputRef, handleCustomFontUpload, handleRemoveCustomFont } =
    useCustomFonts(project, onUpdateProjectSettings, showToast);

  const { pushToHistory, undo, redo, canUndo, canRedo, resetHistory, isUndoRedoActionRef } =
    useEditorHistory(scene?.content || "");

  useEffect(() => {
    if (scene) resetHistory(scene.content || "");
  }, [scene?.id, resetHistory]);

  const ribbonScroll = useRibbonScroll(closeFloatingMenus);

  const isTypewriterActive = project.settings.typewriterMode ?? false;
  const isFocusActive = project.settings.focusMode ?? false;

  const { mirrorRef, updateErgonomics } = useEditorErgonomics(
    textareaRef,
    scene,
    isTypewriterActive,
    isFocusActive,
    project.settings.fontSize,
    project.settings.lineSpacing
  );

  const textActions = useEditorTextActions({
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
  });

  useEditorHotkeys({
    isTypewriterActive,
    isFocusActive,
    isZenMode,
    onUpdateProjectSettings,
    setIsZenMode,
    showToast,
  });

  if (!scene) return <EditorEmptyState />;

  const wordCount = scene.wordCount || countWords(scene.content || "");
  const charCount = countCharacters(scene.content || "");
  const readingTime = calculateReadingTimeMinutes(wordCount);
  const targetWords = scene.targetWordCount || 1500;
  const progressPercent = Math.min(100, Math.round((wordCount / targetWords) * 100));
  const columnConfig = getOptimalReadingColumnWidth(isZenMode);

  const currentFontLabel =
    project.settings.fontFamily === "custom"
      ? (project.settings.customFontName?.replace(/^Custom_/, "") || "Fuente Propia")
      : FONT_OPTIONS.find((f) => f.id === project.settings.fontFamily)?.label || "Merriweather (Serif)";

  return (
    <main
      id="rich-text-editor-container"
      className="flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-hidden relative"
      style={{ backgroundColor: "var(--bg-editor)", color: "var(--text-primary)" }}
    >
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--bg-editor)] text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      <div
        ref={mirrorRef}
        id="editor-caret-mirror"
        aria-hidden="true"
        style={{ position: "absolute", top: 0, left: 0, visibility: "hidden", pointerEvents: "none", zIndex: -100 }}
      />

      {!isZenMode && (
        <EditorHeader
          scene={scene}
          project={project}
          wordCount={wordCount}
          targetWords={targetWords}
          isInspectorOpen={isInspectorOpen}
          onUpdateScene={onUpdateScene}
          onOpenInspector={onOpenInspector}
          onActivateZen={() => {
            setIsZenMode(true);
            showToast("Modo Zen activado (Pulsa Esc para salir)");
          }}
        />
      )}

      {!isZenMode && (
        <EditorRibbon
          ribbonScroll={ribbonScroll}
          textActions={textActions}
          canUndo={canUndo}
          canRedo={canRedo}
          currentFontLabel={currentFontLabel}
          onOpenFontMenu={handleOpenFontMenu}
          onOpenSpacingMenu={handleOpenSpacingMenu}
          project={project}
          onUpdateProjectSettings={onUpdateProjectSettings}
          showToast={showToast}
        />
      )}

      <EditorCanvas
        textareaRef={textareaRef}
        scene={scene}
        project={project}
        isZenMode={isZenMode}
        columnConfig={columnConfig}
        isTypewriterActive={isTypewriterActive}
        isFocusActive={isFocusActive}
        onToggleTypewriter={() => {
          onUpdateProjectSettings({ typewriterMode: !isTypewriterActive });
          showToast(!isTypewriterActive ? "Máquina activada" : "Máquina desactivada");
        }}
        onToggleFocus={() => {
          onUpdateProjectSettings({ focusMode: !isFocusActive });
          showToast(!isFocusActive ? "Foco activado" : "Foco desactivado");
        }}
        onExitZen={() => setIsZenMode(false)}
        handleTextChange={textActions.handleTextChange}
        handleKeyDown={textActions.handleKeyDown}
        updateErgonomics={updateErgonomics}
      />

      {!isZenMode && (
        <EditorFooter
          wordCount={wordCount}
          charCount={charCount}
          readingTime={readingTime}
          targetWords={targetWords}
          progressPercent={progressPercent}
          enableWordGoals={project.settings.enableWordGoals !== false}
        />
      )}

      <EditorFontMenuPortal
        isOpen={showFontMenu}
        onClose={() => setShowFontMenu(false)}
        position={fontMenuPos}
        project={project}
        onUpdateProjectSettings={onUpdateProjectSettings}
        customFontInputRef={customFontInputRef}
        handleCustomFontUpload={handleCustomFontUpload}
        handleRemoveCustomFont={handleRemoveCustomFont}
      />

      <EditorSpacingMenuPortal
        isOpen={showSpacingMenu}
        onClose={() => setShowSpacingMenu(false)}
        position={spacingMenuPos}
        project={project}
        onUpdateProjectSettings={onUpdateProjectSettings}
      />
    </main>
  );
};
