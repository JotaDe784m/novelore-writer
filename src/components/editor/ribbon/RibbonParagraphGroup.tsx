import React from "react";
import {
  AlignLeft,
  AlignJustify,
  Indent,
  Outdent,
  ChevronDown,
} from "lucide-react";

interface RibbonParagraphGroupProps {
  lineSpacingLabel: string;
  onOpenSpacingMenu: (e: React.MouseEvent) => void;
  textAlign?: string;
  onUpdateTextAlign: (align: "left" | "justify") => void;
  onIndent: () => void;
  onOutdent: () => void;
  paragraphIndent?: boolean;
  onToggleFirstLineIndent: () => void;
}

export const RibbonParagraphGroup: React.FC<RibbonParagraphGroupProps> = ({
  lineSpacingLabel,
  onOpenSpacingMenu,
  textAlign = "left",
  onUpdateTextAlign,
  onIndent,
  onOutdent,
  paragraphIndent,
  onToggleFirstLineIndent,
}) => {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        id="ribbon-line-spacing-btn"
        onClick={onOpenSpacingMenu}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
        title="Ajustar interlineado del manuscrito"
      >
        <span className="font-mono text-xs text-[var(--accent)] font-bold">↕</span>
        <span className="hidden xl:inline">{lineSpacingLabel}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {/* Alignment: Left vs Justify */}
      <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)]">
        <button
          type="button"
          id="align-left-btn"
          onClick={() => onUpdateTextAlign("left")}
          className={`p-1 rounded-md transition-colors cursor-pointer ${
            textAlign === "left"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]"
          }`}
          title="Alinear texto a la izquierda"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          id="align-justify-btn"
          onClick={() => onUpdateTextAlign("justify")}
          className={`p-1 rounded-md transition-colors cursor-pointer ${
            textAlign === "justify"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]"
          }`}
          title="Justificar texto (formato editorial)"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sangría & 1ª Línea Inteligente */}
      <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)]">
        <button
          id="apply-indent-btn"
          type="button"
          onClick={onIndent}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
          title="Añadir sangría al párrafo seleccionado (Tab)"
        >
          <Indent className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden xl:inline">Sangría</span>
        </button>

        <button
          id="outdent-btn"
          type="button"
          onClick={onOutdent}
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
          title="Reducir sangría en el párrafo seleccionado (Shift+Tab)"
        >
          <Outdent className="w-3.5 h-3.5" />
        </button>

        <button
          id="toggle-first-line-indent-btn"
          type="button"
          onClick={onToggleFirstLineIndent}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
            paragraphIndent
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]"
          }`}
          title="Activar sangría de 1.ª línea automática"
        >
          <span className="hidden sm:inline">1.ª Línea</span>
          <span className="sm:hidden">1.ª Lín.</span>
          {paragraphIndent ? " ✓" : ""}
        </button>
      </div>
    </div>
  );
};

