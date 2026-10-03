import React, { useState } from "react";
import { BookOpen, Plus, X, Layers, List, Sparkles, Tag } from "lucide-react";
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
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 border border-[var(--border-color)]/50 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)]">
              Menciones en el Manuscrito y Nombres Alternativos
            </h4>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold bg-[var(--accent)] text-[var(--accent-contrast)] shadow-2xs">
            <span>
              {totalCount} {totalCount === 1 ? "mención total" : "menciones totales"}
            </span>
          </div>
        </div>

        {/* Formulario para añadir apodo */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={aliasInput}
            onChange={(e) => setAliasInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubmit())}
            placeholder="Añadir apodo o variante de nombre (Enter)..."
            className="flex-1 p-2.5 rounded-xl bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 border border-[var(--border-color)]/50 focus:outline-hidden focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={handleAddSubmit}
            disabled={!aliasInput.trim()}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-sans font-bold disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Apodo</span>
          </button>
        </div>

        {/* Chips de términos en cápsulas */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)]/60 flex items-center gap-2 shadow-2xs">
            <span className="font-bold">{name || "Nombre principal"}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 font-mono font-bold text-[var(--text-muted)]">
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
                className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30 flex items-center gap-2 shadow-2xs"
              >
                <Tag className="w-3 h-3 shrink-0" />
                <span>{alias}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] font-mono font-bold">
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
        <div className="px-4 py-3 rounded-2xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-sans text-[var(--text-muted)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>
              Presente en <strong className="text-[var(--text-main)]">{uniqueScenesCount}</strong> de{" "}
              <strong className="text-[var(--text-main)]">{totalScenesInNovel}</strong> escenas (
              <strong className="text-[var(--accent)]">{presencePercentage}%</strong> de la novela)
            </span>
          </div>

          {/* Selector de modo de vista */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] p-0.5 rounded-full border border-[var(--border-color)]/60">
            <button
              type="button"
              onClick={() => setViewMode("structure")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold transition-colors cursor-pointer ${
                viewMode === "structure"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Por Actos</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("flat")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold transition-colors cursor-pointer ${
                viewMode === "flat"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]"
              }`}
            >
              <List className="w-3 h-3" />
              <span>Lista de Escenas</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Desglose de Escenas y Citas */}
      {totalCount === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[var(--bg-input)]/30 border border-[var(--border-color)]/40 text-[var(--text-muted)] text-xs font-sans space-y-1">
          <p className="font-semibold text-[var(--text-main)]">
            Sin menciones en el texto actual del manuscrito
          </p>
          <p className="text-[11px]">
            Escribe escenas en el editor o menciona el nombre de este elemento para que se registren aquí.
          </p>
        </div>
      ) : viewMode === "structure" && detailedMentions && detailedMentions.acts.length > 0 ? (
        <MentionsActBreakdown
          acts={detailedMentions.acts}
          totalMentions={detailedMentions.totalCount}
          onNavigateToScene={onNavigateToScene}
        />
      ) : (
        <div className="space-y-2.5">
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
