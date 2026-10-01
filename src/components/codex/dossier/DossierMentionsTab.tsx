import React, { useState } from "react";
import { BookOpen, Plus, X, Layers, List, Sparkles } from "lucide-react";
import { DossierMentionsTabProps } from "./dossierTypes";
import { MentionsActBreakdown } from "./mentions/MentionsActBreakdown";
import { MentionsSceneCard } from "./mentions/MentionsSceneCard";
import { SceneMentionOccurrence } from "../../../utils/mentionTypes";

export const DossierMentionsTab: React.FC<DossierMentionsTabProps> = ({
  name,
  aliases,
  onAddAlias,
  onRemoveAlias,
  mentionStats,
  detailedMentions,
  onNavigateToScene,
}) => {
  const [aliasInput, setAliasInput] = useState("");
  const [viewMode, setViewMode] = useState<"structure" | "flat">("structure");

  const handleAddSubmit = () => {
    if (aliasInput.trim()) {
      onAddAlias(aliasInput.trim());
      setAliasInput("");
    }
  };

  const totalCount = detailedMentions?.totalCount ?? mentionStats.totalCount;
  const uniqueScenesCount = detailedMentions?.uniqueScenesCount ?? mentionStats.scenes.length;
  const totalScenesInNovel = detailedMentions?.totalScenesInNovel ?? uniqueScenesCount;
  const presencePercentage = detailedMentions?.scenePresencePercentage ?? 0;

  const primaryNameCount =
    (detailedMentions?.byTerm ?? mentionStats.byTerm).find(
      (t) => t.term.toLowerCase() === name.trim().toLowerCase()
    )?.count || 0;

  // Fallback para lista plana si no viene detailedMentions
  const flatScenes: SceneMentionOccurrence[] = detailedMentions?.flatScenes ?? mentionStats.scenes.map((s) => ({
    sceneId: s.sceneId,
    sceneTitle: s.sceneTitle,
    sceneOrder: 1,
    chapterId: "chap-unknown",
    chapterTitle: s.chapterTitle,
    chapterOrder: 1,
    actId: "act-unknown",
    actTitle: s.actTitle,
    actOrder: 1,
    count: s.count,
    byTerm: { [name]: s.count },
    snippets: [],
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Panel de Nombres y Apodos */}
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
              {totalCount} {totalCount === 1 ? "mención total" : "menciones totales"}
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Registra apodos, apellidos, títulos o nombres en clave (ej: <em>«Val»</em>, <em>«Vance»</em>, <em>«La Cartógrafa»</em>).
          Novelore rastrea el texto del manuscrito y contabiliza en qué escenas aparece esta entidad.
        </p>

        {/* Input para añadir apodo */}
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

        {/* Chips de términos con sus contadores */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center gap-2 shadow-2xs">
            <span className="font-semibold">{name || "Nombre principal"}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-mono font-bold">
              {primaryNameCount}
            </span>
          </span>

          {aliases.map((alias) => {
            const termStats = (detailedMentions?.byTerm ?? mentionStats.byTerm).find(
              (t) => t.term.toLowerCase() === alias.toLowerCase().trim()
            );
            const count = termStats?.count || 0;
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

      {/* 2. Métrica de Presencia Global en la Novela */}
      {totalCount > 0 && totalScenesInNovel > 0 && (
        <div className="px-4 py-3 rounded-2xl bg-[var(--bg-input)]/25 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>
              Presente en <strong className="text-[var(--text-primary)]">{uniqueScenesCount}</strong> de{" "}
              <strong className="text-[var(--text-primary)]">{totalScenesInNovel}</strong> escenas (
              <strong className="text-[var(--accent)]">{presencePercentage}%</strong> del manuscrito)
            </span>
          </div>

          {/* Selector de modo de vista */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("structure")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "structure"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Por Actos</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("flat")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "flat"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Plana</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Desglose de Escenas y Citas */}
      {totalCount === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[var(--bg-input)]/30 text-[var(--text-muted)] text-xs space-y-1">
          <p className="font-semibold text-[var(--text-secondary)]">
            Sin menciones en el texto actual del manuscrito
          </p>
          <p className="text-[11px]">
            Añade escenas en el editor o nombra a esta entidad para que sus apariciones se registren aquí.
          </p>
        </div>
      ) : viewMode === "structure" && detailedMentions && detailedMentions.acts.length > 0 ? (
        <MentionsActBreakdown
          acts={detailedMentions.acts}
          totalMentions={detailedMentions.totalCount}
          onNavigateToScene={onNavigateToScene}
        />
      ) : (
        <div className="space-y-2">
          {flatScenes.map((scene) => (
            <MentionsSceneCard
              key={scene.sceneId}
              scene={scene}
              onNavigateToScene={onNavigateToScene}
            />
          ))}
        </div>
      )}
    </div>
  );
};
