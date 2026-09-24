import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { NovelProject } from "../../types";
import { LINE_SPACING_OPTIONS } from "./editorConstants";

interface EditorSpacingMenuPortalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  project: NovelProject;
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void;
}

export const EditorSpacingMenuPortal: React.FC<EditorSpacingMenuPortalProps> = ({
  isOpen,
  onClose,
  position,
  project,
  onUpdateProjectSettings,
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
      className="fixed rounded-xl shadow-2xl p-1 z-[9999] space-y-0.5 border border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "12rem",
        backgroundColor: "var(--bg-editor)",
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">
        Interlineado
      </div>
      {LINE_SPACING_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => {
            onUpdateProjectSettings({ lineSpacing: opt.id as any });
            onClose();
          }}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            project.settings.lineSpacing === opt.id || project.settings.lineSpacing === opt.val
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
              : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
          }`}
        >
          <span>{opt.label}</span>
          {(project.settings.lineSpacing === opt.id || project.settings.lineSpacing === opt.val) && (
            <Check className="w-3.5 h-3.5" />
          )}
        </button>
      ))}
    </div>,
    document.body
  );
};

