import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Upload, Trash2 } from "lucide-react";
import { NovelProject } from "../../types";
import { FONT_OPTIONS } from "./editorConstants";

interface EditorFontMenuPortalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  project: NovelProject;
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void;
  customFontInputRef: React.RefObject<HTMLInputElement | null>;
  handleCustomFontUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCustomFont: () => void;
}

export const EditorFontMenuPortal: React.FC<EditorFontMenuPortalProps> = ({
  isOpen,
  onClose,
  position,
  project,
  onUpdateProjectSettings,
  customFontInputRef,
  handleCustomFontUpload,
  handleRemoveCustomFont,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed rounded-xl shadow-2xl p-2 z-[9999] space-y-1 border border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "16rem",
        backgroundColor: "var(--bg-editor)",
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-0.5">
        Tipografías Literarias
      </div>

      {FONT_OPTIONS.map((font) => (
        <button
          key={font.id}
          onClick={() => {
            onUpdateProjectSettings({ fontFamily: font.id as any });
            onClose();
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
            project.settings.fontFamily === font.id
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
              : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
          }`}
        >
          <span className={font.previewClass}>{font.label}</span>
          {project.settings.fontFamily === font.id && (
            <Check className="w-3.5 h-3.5 shrink-0" />
          )}
        </button>
      ))}

      <div className="pt-2 border-t border-[var(--border-subtle)] mt-1">
        <input
          ref={customFontInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleCustomFontUpload}
          className="hidden"
        />

        {project.settings.customFontData && project.settings.customFontName ? (
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--bg-surface-hover)] mb-1">
            <div className="truncate flex-1 pr-1">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {project.settings.customFontName.replace(/^Custom_/, "")}
              </p>
              <span className="text-[10px] text-[var(--accent)] font-medium">
                {project.settings.fontFamily === "custom" ? "✓ En uso" : "Cargada"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {project.settings.fontFamily !== "custom" && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProjectSettings({ fontFamily: "custom" });
                    onClose();
                  }}
                  className="px-2 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-semibold"
                >
                  Usar
                </button>
              )}
              <button
                type="button"
                onClick={handleRemoveCustomFont}
                className="p-1 text-red-500 hover:bg-red-500/15 rounded cursor-pointer"
                title="Eliminar fuente propia"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => customFontInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg border border-dashed border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{project.settings.customFontData ? "Cargar otra fuente (.ttf/.otf)" : "Subir mi propia fuente (.ttf/.otf)"}</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

