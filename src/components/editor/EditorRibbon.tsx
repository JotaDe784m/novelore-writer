import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NovelProject, Scene } from "../../types";
import { useRibbonScroll } from "./useRibbonScroll";
import { useEditorTextActions } from "./useEditorTextActions";
import { getLineSpacingLabel } from "./editorConstants";
import { RibbonHistoryGroup } from "./ribbon/RibbonHistoryGroup";
import { RibbonTypographyGroup } from "./ribbon/RibbonTypographyGroup";
import { RibbonParagraphGroup } from "./ribbon/RibbonParagraphGroup";
import { RibbonDialogueGroup } from "./ribbon/RibbonDialogueGroup";
import { RibbonErgonomicsGroup } from "./ribbon/RibbonErgonomicsGroup";
import { RibbonSceneMetaGroup } from "./ribbon/RibbonSceneMetaGroup";

interface EditorRibbonProps {
  ribbonScroll: ReturnType<typeof useRibbonScroll>;
  textActions: ReturnType<typeof useEditorTextActions>;
  canUndo: boolean;
  canRedo: boolean;
  currentFontLabel: string;
  onOpenFontMenu: (e: React.MouseEvent) => void;
  onOpenSpacingMenu: (e: React.MouseEvent) => void;
  project: NovelProject;
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void;
  showToast: (msg: string) => void;
  scene: Scene;
  wordCount: number;
  targetWords: number;
  isInspectorOpen: boolean;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onOpenInspector: () => void;
}

export const EditorRibbon: React.FC<EditorRibbonProps> = ({
  ribbonScroll,
  textActions,
  canUndo,
  canRedo,
  currentFontLabel,
  onOpenFontMenu,
  onOpenSpacingMenu,
  project,
  onUpdateProjectSettings,
  showToast,
  scene,
  wordCount,
  targetWords,
  isInspectorOpen,
  onUpdateScene,
  onOpenInspector,
}) => {
  const {
    ribbonRef,
    isRibbonOverflowing,
    isDraggingRibbon,
    canScrollRibbonLeft,
    canScrollRibbonRight,
    scrollRibbon,
    handleRibbonMouseDown,
  } = ribbonScroll;

  const isTypewriterActive = project.settings.typewriterMode ?? false;
  const isFocusActive = project.settings.focusMode ?? false;

  return (
    <div className="relative shrink-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex items-center justify-between px-2 sm:px-4">
      {/* Zona izquierda/central: herramientas tipográficas desplazables */}
      <div className="flex-1 min-w-0 relative flex items-center overflow-hidden">
        {canScrollRibbonLeft && (
          <button
            type="button"
            onClick={() => scrollRibbon("left")}
            className="absolute left-0 top-0 bottom-0 z-40 px-1 bg-gradient-to-r from-[var(--bg-sidebar)] via-[var(--bg-sidebar)] to-transparent flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Desplazar herramientas a la izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={ribbonRef}
          id="editor-word-processor-ribbon"
          onMouseDown={handleRibbonMouseDown}
          className={`min-h-[44px] px-2 sm:px-4 py-1.5 flex items-center overflow-x-auto no-scrollbar select-none ${
            isRibbonOverflowing ? (isDraggingRibbon ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          style={{
            justifyContent: isRibbonOverflowing ? "flex-start" : "center",
          }}
        >
          <div
            className={`flex items-center gap-1 sm:gap-1.5 flex-nowrap shrink-0 min-w-max ${
              isRibbonOverflowing ? "" : "mx-auto"
            } ${isDraggingRibbon ? "pointer-events-none" : ""}`}
          >
            <RibbonHistoryGroup
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={textActions.handleUndo}
              onRedo={textActions.handleRedo}
            />

            <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

            <RibbonTypographyGroup
              currentFontLabel={currentFontLabel}
              onOpenFontMenu={onOpenFontMenu}
              fontSize={project.settings.fontSize || 18}
              onUpdateFontSize={(fontSize) => onUpdateProjectSettings({ fontSize })}
            />

            <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

            <RibbonParagraphGroup
              lineSpacingLabel={getLineSpacingLabel(project.settings.lineSpacing)}
              onOpenSpacingMenu={onOpenSpacingMenu}
              textAlign={project.settings.textAlign}
              onUpdateTextAlign={(textAlign) => onUpdateProjectSettings({ textAlign })}
              onIndent={textActions.handleIndent}
              onOutdent={textActions.handleOutdent}
              paragraphIndent={project.settings.paragraphIndent}
              onToggleFirstLineIndent={textActions.handleToggleFirstLineIndent}
            />

            <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

            <RibbonDialogueGroup
              onInsertEmDash={textActions.handleInsertDash}
              onInsertGuillemets={textActions.handleInsertGuillemets}
              onInsertBreak={textActions.handleInsertBreak}
            />

            <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

            <RibbonErgonomicsGroup
              isTypewriterActive={isTypewriterActive}
              onToggleTypewriter={() => {
                onUpdateProjectSettings({ typewriterMode: !isTypewriterActive });
                showToast(!isTypewriterActive ? "Máquina activada" : "Máquina desactivada");
              }}
              isFocusActive={isFocusActive}
              onToggleFocus={() => {
                onUpdateProjectSettings({ focusMode: !isFocusActive });
                showToast(!isFocusActive ? "Foco activado" : "Foco desactivado");
              }}
              onToggleCase={textActions.handleToggleCase}
              onCopyContent={textActions.handleCopyContent}
            />
          </div>
        </div>

        {canScrollRibbonRight && (
          <button
            type="button"
            onClick={() => scrollRibbon("right")}
            className="absolute right-0 top-0 bottom-0 z-40 px-1 bg-gradient-to-l from-[var(--bg-sidebar)] via-[var(--bg-sidebar)] to-transparent flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Desplazar herramientas a la derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Zona derecha: Metadatos y herramientas de escena (debajo de la cabecera) */}
      <div className="pl-2 sm:pl-3 border-l border-[var(--border-subtle)] shrink-0 py-1">
        <RibbonSceneMetaGroup
          scene={scene}
          project={project}
          wordCount={wordCount}
          targetWords={targetWords}
          isInspectorOpen={isInspectorOpen}
          onUpdateScene={onUpdateScene}
          onOpenInspector={onOpenInspector}
        />
      </div>
    </div>
  );
};

