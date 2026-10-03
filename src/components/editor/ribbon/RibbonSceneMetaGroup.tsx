import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, PanelRight } from "lucide-react";
import { NovelProject, Scene } from "../../../types";
import { STATUS_OPTIONS } from "../editorConstants";

interface RibbonSceneMetaGroupProps {
  scene: Scene;
  project: NovelProject;
  wordCount: number;
  targetWords: number;
  isInspectorOpen: boolean;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onOpenInspector: () => void;
}

export const RibbonSceneMetaGroup: React.FC<RibbonSceneMetaGroupProps> = ({
  scene,
  project,
  wordCount,
  targetWords,
  isInspectorOpen,
  onUpdateScene,
  onOpenInspector,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const currentStatusObj =
    STATUS_OPTIONS.find((s) => s.value === (scene.status || "draft")) || STATUS_OPTIONS[1];

  useEffect(() => {
    if (!showStatusMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStatusMenu]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Selector de Estado de Escena con Menú Desplegable */}
      <div ref={statusMenuRef} className="relative z-40">
        <button
          type="button"
          id="scene-status-button"
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${currentStatusObj.badgeClass}`}
          title="Cambiar estado de la escena"
        >
          <currentStatusObj.icon className="w-3.5 h-3.5 shrink-0" />
          <span>{currentStatusObj.label}</span>
          <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
        </button>

        {showStatusMenu && (
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-xl shadow-2xl p-1 z-50 border border-[var(--border-subtle)]"
            style={{
              backgroundColor: "var(--bg-editor)",
              color: "var(--text-primary)",
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">
              Estado de Escena
            </div>
            {STATUS_OPTIONS.map((opt) => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onUpdateScene(scene.id, { status: opt.value });
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    scene.status === opt.value
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
                      : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <OptIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        scene.status === opt.value ? "text-current" : opt.iconColor
                      }`}
                    />
                    <span>{opt.label}</span>
                  </div>
                  {scene.status === opt.value && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contador de Palabras */}
      <div
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono shrink-0 bg-[var(--bg-surface-hover)]"
        style={{
          color: "var(--text-muted)",
        }}
        title={
          project.settings.enableWordGoals !== false
            ? `Meta de escena: ${wordCount} de ${targetWords} palabras`
            : `${wordCount} palabras escritas en esta escena`
        }
      >
        <span className="font-semibold text-[var(--text-primary)]">{wordCount}</span>
        {project.settings.enableWordGoals !== false ? (
          <span>/ {targetWords} pal.</span>
        ) : (
          <span>palabras</span>
        )}
      </div>

      {/* Botón de Inspector */}
      <button
        id="inspector-toggle-btn"
        type="button"
        onClick={onOpenInspector}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
          isInspectorOpen
            ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
        }`}
        title="Inspector de Escena (Ctrl+I)"
      >
        <PanelRight className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden xl:inline">Inspector</span>
      </button>
    </div>
  );
};
