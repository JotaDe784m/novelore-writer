import React from "react";
import { FileText, Lock } from "lucide-react";
import { DossierNotesTabProps } from "./dossierTypes";

export const DossierNotesTab: React.FC<DossierNotesTabProps> = ({
  notes,
  onNotesChange,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[var(--bg-input)]/40 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
            Notas Secretas & Trasfondo Profundo (Lore del Autor)
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            Este espacio está reservado para la biblia privada del escritor: secretos inconfesables, revelaciones futuras, árbol genealógico, borradores o detalles no revelados al lector.
          </p>
        </div>
      </div>

      {/* Deep Notes Area */}
      <div>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Escribe libremente el trasfondo, secretos, evolución futura de este elemento en los próximos libros o giros argumentales..."
          rows={14}
          className="w-full p-4 rounded-2xl bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] leading-relaxed text-sm font-sans resize-y min-h-[220px]"
        />
      </div>
    </div>
  );
};
