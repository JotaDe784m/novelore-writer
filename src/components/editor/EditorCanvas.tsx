import React from "react";
import { NovelProject, Scene } from "../../types";
import { getNumericLineHeight } from "./editorConstants";
import { ZenFloatingBadge } from "./ZenFloatingBadge";

interface EditorCanvasProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  scene: Scene;
  project: NovelProject;
  isZenMode: boolean;
  columnConfig: { sidePaddingCalc: string; maxWidthPx: number };
  isTypewriterActive: boolean;
  isFocusActive: boolean;
  onToggleTypewriter: () => void;
  onToggleFocus: () => void;
  onExitZen: () => void;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  updateErgonomics: (forceTypewriter?: boolean) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  textareaRef,
  scene,
  project,
  isZenMode,
  columnConfig,
  isTypewriterActive,
  isFocusActive,
  onToggleTypewriter,
  onToggleFocus,
  onExitZen,
  handleTextChange,
  handleKeyDown,
  updateErgonomics,
}) => {
  return (
    <div
      id="editor-scroll-container"
      className="flex-1 min-h-0 relative z-10 w-full h-full flex flex-col overflow-hidden"
    >
      {isZenMode && (
        <ZenFloatingBadge
          sceneTitle={scene.title}
          isTypewriterActive={isTypewriterActive}
          isFocusActive={isFocusActive}
          onToggleTypewriter={onToggleTypewriter}
          onToggleFocus={onToggleFocus}
          onExitZen={onExitZen}
        />
      )}

      <textarea
        id="novel-manuscript-textarea"
        ref={textareaRef}
        value={scene.content || ""}
        onChange={handleTextChange}
        onScroll={() => updateErgonomics(false)}
        onClick={() => updateErgonomics(false)}
        onKeyUp={() => updateErgonomics(false)}
        onSelect={() => updateErgonomics(false)}
        onKeyDown={handleKeyDown}
        placeholder="Comienza a escribir tu escena aquí... Usa Tab para sangrar párrafos, y Ctrl+Shift+M para diálogos (—)."
        style={{
          fontSize: `${project.settings.fontSize || 18}px`,
          lineHeight: getNumericLineHeight(project.settings.lineSpacing),
          textAlign: (project.settings.textAlign as any) || "left",
          tabSize: 4,
          MozTabSize: 4,
          whiteSpace: "pre-wrap",
          fontFamily:
            project.settings.fontFamily === "custom" && project.settings.customFontData
              ? `"${project.settings.customFontName}", serif`
              : undefined,
          color: "var(--text-primary)",
          paddingLeft: columnConfig.sidePaddingCalc,
          paddingRight: columnConfig.sidePaddingCalc,
          paddingTop: isZenMode ? "4rem" : "2.5rem",
          paddingBottom: "60vh",
          scrollbarGutter: "stable",
        }}
        className={`w-full h-full flex-1 bg-transparent resize-none focus:outline-none border-none tracking-wide overflow-y-scroll custom-scroll always-scroll ${
          project.settings.fontFamily === "serif-display"
            ? "font-novel-display"
            : project.settings.fontFamily === "garamond"
            ? "font-novel-garamond"
            : project.settings.fontFamily === "lora"
            ? "font-novel-lora"
            : project.settings.fontFamily === "sans"
            ? "font-novel-sans"
            : project.settings.fontFamily === "mono"
            ? "font-novel-mono"
            : project.settings.fontFamily === "custom"
            ? ""
            : "font-novel-serif"
        } text-[var(--text-primary)] placeholder-[var(--text-muted)]/60 selection:bg-[var(--accent-subtle)] transition-[mask-image,-webkit-mask-image] duration-150`}
        spellCheck="true"
      />
    </div>
  );
};

