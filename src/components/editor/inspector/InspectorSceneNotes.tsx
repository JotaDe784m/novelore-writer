import React, { useState, useMemo } from "react";
import {
  StickyNote,
  Plus,
  ChevronDown,
  ChevronRight,
  Feather,
} from "lucide-react";
import { Scene, SceneNoteCard, SceneNotesTemplate } from "../../../types";
import { InspectorNoteCardItem } from "./InspectorNoteCardItem";
import { SCENE_NOTE_TEMPLATES } from "./sceneNotesTemplates";

interface InspectorSceneNotesProps {
  scene: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

export const InspectorSceneNotes: React.FC<InspectorSceneNotesProps> = ({
  scene,
  onUpdateScene,
}) => {
  const currentTemplate: SceneNotesTemplate = scene.notesTemplate || scene.analysisMode || "dramatic";

  // Resolver las tarjetas activas para la plantilla seleccionada
  const cards: SceneNoteCard[] = useMemo(() => {
    // 1. Si la escena ya tiene notas guardadas explícitamente para esta plantilla:
    if (scene.templateNotes?.[currentTemplate]) {
      return scene.templateNotes[currentTemplate]!;
    }

    // 2. Si la plantilla es "free" o "custom": está vacía por defecto
    if (currentTemplate === "free" || currentTemplate === "custom") {
      return [];
    }

    // 3. Si la plantilla es "dramatic":
    if (currentTemplate === "dramatic") {
      // Si ya hay noteCards previas de la escena
      if (scene.noteCards && scene.noteCards.length > 0) {
        return scene.noteCards;
      }
      // O si tiene datos legados de goal/conflict/outcome
      if (scene.goal?.trim() || scene.conflict?.trim() || scene.outcome?.trim()) {
        return [
          { id: "note-goal", title: "Meta & Intención", content: scene.goal || "" },
          { id: "note-conflict", title: "Conflicto & Obstáculo", content: scene.conflict || "" },
          { id: "note-outcome", title: "Giro & Desenlace", content: scene.outcome || "" },
        ];
      }
    }

    // 4. Para cualquier otra plantilla (worldbuilding, reaction, dramatic vacía):
    // Inicializar con las tarjetas y títulos propios de esa plantilla específica
    const preset = SCENE_NOTE_TEMPLATES[currentTemplate];
    if (!preset || preset.defaultCards.length === 0) {
      return [];
    }

    return preset.defaultCards.map((c, i) => ({
      id: `card-${currentTemplate}-${i}`,
      title: c.title,
      content: "",
    }));
  }, [
    scene.templateNotes,
    scene.noteCards,
    scene.goal,
    scene.conflict,
    scene.outcome,
    currentTemplate,
  ]);

  const hasContent = cards.some((c) => Boolean(c.content?.trim()));
  const [isOpen, setIsOpen] = useState(() => hasContent || currentTemplate !== "free");

  const saveCards = (newCards: SceneNoteCard[], template: SceneNotesTemplate = currentTemplate) => {
    const updatedTemplateNotes = {
      ...(scene.templateNotes || {}),
      [template]: newCards,
    };

    const updates: Partial<Scene> = {
      templateNotes: updatedTemplateNotes,
      noteCards: newCards,
      notesTemplate: template,
    };

    // Sincronizar hacia atrás con goal/conflict/outcome si estamos en dramático
    if (template === "dramatic") {
      if (newCards[0]) updates.goal = newCards[0].content;
      if (newCards[1]) updates.conflict = newCards[1].content;
      if (newCards[2]) updates.outcome = newCards[2].content;
    }

    onUpdateScene(scene.id, updates);
  };

  const handleSelectTemplate = (templateKey: SceneNotesTemplate) => {
    if (templateKey === currentTemplate) return;
    onUpdateScene(scene.id, { notesTemplate: templateKey });
    if (templateKey !== "free" && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, title: newTitle } : c));
    saveCards(updated);
  };

  const handleUpdateContent = (id: string, newContent: string) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, content: newContent } : c));
    saveCards(updated);
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    saveCards(updated);
  };

  const handleAddCard = () => {
    const newCard: SceneNoteCard = {
      id: `card-${currentTemplate}-${Date.now()}`,
      title: `Nota ${cards.length + 1}`,
      content: "",
    };
    const updated = [...cards, newCard];
    saveCards(updated);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div
      className="rounded-xl overflow-hidden transition-colors"
      style={{ backgroundColor: "var(--bg-editor)" }}
    >
      {/* Cabecera del Acordeón "Notas" */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer text-left select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
            <StickyNote className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
            Notas
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-surface-hover)] text-[var(--text-muted)] font-mono shrink-0">
            {cards.length} {cards.length === 1 ? "nota" : "notas"}
          </span>
        </div>

        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
        )}
      </button>

      {/* Cuerpo del Acordeón */}
      {isOpen && (
        <div className="px-3 pb-3.5 pt-1 space-y-3 animate-in fade-in">
          {/* Selector de Plantillas */}
          <div className="p-0.5 rounded-lg flex items-center gap-0.5 bg-[var(--bg-surface-hover)] overflow-x-auto scrollbar-none">
            {(["dramatic", "worldbuilding", "reaction", "free"] as SceneNotesTemplate[]).map((key) => {
              const tmpl = SCENE_NOTE_TEMPLATES[key];
              const isSelected = currentTemplate === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectTemplate(key)}
                  className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap text-center cursor-pointer ${
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tmpl.label}
                </button>
              );
            })}
          </div>

          {/* Lista de Tarjetas de Nota */}
          <div className="space-y-2.5">
            {cards.map((card, idx) => {
              const presetCard = SCENE_NOTE_TEMPLATES[currentTemplate]?.defaultCards[idx];
              return (
                <InspectorNoteCardItem
                  key={card.id}
                  card={card}
                  placeholder={presetCard?.placeholder || "Escribe tus apuntes o notas aquí..."}
                  onUpdateTitle={handleUpdateTitle}
                  onUpdateContent={handleUpdateContent}
                  onDelete={handleDeleteCard}
                  icon={presetCard?.icon || StickyNote}
                  iconColorClass={presetCard?.colorClass || "text-[var(--accent)]"}
                />
              );
            })}

            {/* Estado vacío en modo Libre */}
            {cards.length === 0 && (
              <div className="py-3 px-2 text-center text-[11px] text-[var(--text-muted)] space-y-1">
                <Feather className="w-4 h-4 mx-auto opacity-40 text-[var(--text-muted)]" />
                <p className="italic">No hay notas en esta escena. Pulsa el botón inferior para añadir una.</p>
              </div>
            )}
          </div>

          {/* Botón "+ Añadir Nota" disponible en todas las plantillas */}
          <button
            type="button"
            onClick={handleAddCard}
            className="w-full py-2 px-3 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-dashed border-[var(--text-muted)]/20 hover:border-[var(--accent)]/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Añadir Nota</span>
          </button>
        </div>
      )}
    </div>
  );
};

