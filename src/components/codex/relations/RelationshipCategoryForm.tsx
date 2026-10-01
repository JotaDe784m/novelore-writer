import React, { useState } from "react";
import { Check, Pipette } from "lucide-react";
import { RelationshipCategory, RelationshipLineStyle } from "../../../types";

export interface RelationshipCategoryFormProps {
  initialCategory?: RelationshipCategory | null;
  onSubmit: (data: { label: string; color: string; lineStyle: RelationshipLineStyle }) => void;
  onCancel: () => void;
}

const QUICK_COLORS = [
  "#10B981", "#EF4444", "#EC4899", "#3B82F6", "#8B5CF6",
  "#F59E0B", "#06B6D4", "#14B8A6", "#F97316", "#64748B",
];

const LINE_STYLES: { id: RelationshipLineStyle; label: string; dashArray?: string }[] = [
  { id: "solid", label: "Continua", dashArray: undefined },
  { id: "dashed", label: "Discontinua", dashArray: "5 3" },
  { id: "dotted", label: "Punteada", dashArray: "2 3" },
];

export const RelationshipCategoryForm: React.FC<RelationshipCategoryFormProps> = ({
  initialCategory,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialCategory?.label || initialCategory?.badge || "");
  const [color, setColor] = useState(initialCategory?.color || "#06B6D4");
  const [lineStyle, setLineStyle] = useState<RelationshipLineStyle>(initialCategory?.lineStyle || "solid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ label: trimmed, color, lineStyle });
  };

  return (
    <div className="p-3.5 rounded-2xl bg-[var(--bg-input)]/50 space-y-3 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-[var(--text-primary)]">
          {initialCategory ? "Editar Categoría Personalizada" : "Crear Categoría Personalizada"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      <div>
        <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">
          Nombre de la categoría (ej: Ruta comercial, Influencia mágica, Origen...)
        </label>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la categoría..."
          className="w-full p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      <div>
        <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">
          Color Distintivo
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                color.toLowerCase() === c.toLowerCase()
                  ? "scale-115 ring-2 ring-offset-1 ring-[var(--accent)]"
                  : "hover:scale-105 opacity-85 hover:opacity-100"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label
            title="Color personalizado"
            className="w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-105 flex items-center justify-center shadow-2xs relative ml-1"
            style={{ background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)" }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="opacity-0 w-0 h-0 absolute pointer-events-none"
            />
            <Pipette className="w-2.5 h-2.5 text-white drop-shadow-sm pointer-events-none" />
          </label>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">
          Estilo de Línea en el Grafo
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {LINE_STYLES.map((style) => (
            <button
              type="button"
              key={style.id}
              onClick={() => setLineStyle(style.id)}
              className={`p-1.5 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer text-[10px] ${
                lineStyle === style.id
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                  : "bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
              }`}
            >
              <svg className="w-12 h-2 overflow-visible">
                <line
                  x1="0"
                  y1="4"
                  x2="48"
                  y2="4"
                  stroke={lineStyle === style.id ? "currentColor" : color}
                  strokeWidth="2.5"
                  strokeDasharray={style.dashArray}
                />
              </svg>
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          disabled={!name.trim()}
          onClick={handleSubmit}
          className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          <span>{initialCategory ? "Guardar Cambios" : "Guardar y Usar"}</span>
        </button>
      </div>
    </div>
  );
};
