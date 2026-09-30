import React, { useState } from "react";
import { BookOpen, Plus, X, ChevronRight, Hash } from "lucide-react";
import { DossierMentionsTabProps } from "./dossierTypes";

export const DossierMentionsTab: React.FC<DossierMentionsTabProps> = ({
  name,
  aliases,
  onAddAlias,
  onRemoveAlias,
  mentionStats,
  onNavigateToScene,
}) => {
  const [aliasInput, setAliasInput] = useState("");

  const handleAddSubmit = () => {
    if (aliasInput.trim()) {
      onAddAlias(aliasInput.trim());
      setAliasInput("");
    }
  };

  const primaryNameCount =
    mentionStats.byTerm.find((t) => t.term === name.trim())?.count || 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
              Menciones en el Manuscrito y Nombres Alternativos
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs">
            <span>
              {mentionStats.totalCount} {mentionStats.totalCount === 1 ? "mención total" : "menciones totales"}
            </span>
            {mentionStats.scenes.length > 0 && (
              <span className="opacity-80">
                ({mentionStats.scenes.length} {mentionStats.scenes.length === 1 ? "escena" : "escenas"})
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Registra apodos, apellidos, títulos o nombres en clave (ej: <em>«Val»</em>, <em>«Vance»</em>, <em>«La Cartógrafa»</em>).
          Novelore rastrea el texto del manuscrito y contabiliza en qué escenas aparece esta entidad.
        </p>

        {/* Input for adding alias */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={aliasInput}
            onChange={(e) => setAliasInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubmit();
              }
            }}
            placeholder="Añadir apodo o variante de nombre (Enter)..."
            className="flex-1 p-2 rounded-xl bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleAddSubmit}
            disabled={!aliasInput.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Apodo</span>
          </button>
        </div>

        {/* Chips with counts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center gap-2 shadow-2xs">
            <span className="font-semibold">{name || "Nombre principal"}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-mono font-bold">
              {primaryNameCount}
            </span>
          </span>

          {aliases.map((alias) => {
            const count =
              mentionStats.byTerm.find((t) => t.term.toLowerCase() === alias.toLowerCase().trim())?.count || 0;
            return (
              <span
                key={alias}
                className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center gap-2 shadow-2xs"
              >
                <span>{alias}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] font-mono font-bold">
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveAlias(alias)}
                  className="hover:text-red-500 font-bold ml-0.5 cursor-pointer"
                  title="Eliminar apodo"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* 2. Scenes Breakdown List */}
      <div className="space-y-2">
        <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] block">
          Desglose por Escenas ({mentionStats.scenes.length})
        </span>

        {mentionStats.scenes.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[var(--bg-input)]/30 text-[var(--text-muted)] text-xs">
            No se han encontrado menciones en el texto actual del manuscrito.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {mentionStats.scenes.map((s) => (
              <div
                key={s.sceneId}
                onClick={() => onNavigateToScene?.(s.sceneId)}
                className={`p-3 rounded-xl bg-[var(--bg-input)]/40 hover:bg-[var(--bg-surface-hover)] flex items-center justify-between text-xs transition-colors ${
                  onNavigateToScene ? "cursor-pointer group" : ""
                }`}
              >
                <div className="min-w-0 pr-3">
                  <span className="font-semibold text-[var(--text-primary)] block truncate">
                    {s.sceneTitle}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] truncate block">
                    {s.chapterTitle} • {s.actTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-xs text-[var(--accent)] px-2 py-0.5 rounded-lg bg-[var(--accent-subtle)] flex items-center gap-1">
                    <Hash className="w-3 h-3 opacity-60" />
                    <span>{s.count}</span>
                  </span>
                  {onNavigateToScene && (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
