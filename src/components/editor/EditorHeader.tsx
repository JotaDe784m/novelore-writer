import React, { useState } from "react";
import { FileText, Maximize2 } from "lucide-react";
import { Scene } from "../../types";
import { SectionHelpModal } from "../ui/SectionHelpModal";

interface EditorHeaderProps {
  scene: Scene;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onActivateZen: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  scene,
  onUpdateScene,
  onActivateZen,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <header
      id="editor-scene-header"
      className="h-11 px-3 sm:px-5 flex items-center justify-between shrink-0 select-none min-w-0 border-b border-[var(--border-subtle)] relative z-20"
      style={{
        backgroundColor: "var(--bg-sidebar)",
      }}
    >
      {/* Lado Izquierdo: Título Editable de la Escena */}
      <div className="flex-1 min-w-0 flex items-center gap-2 mr-3">
        <FileText className="w-4 h-4 text-[var(--accent)] shrink-0 opacity-70" />
        <input
          type="text"
          id="scene-title-input"
          value={scene.title}
          onChange={(e) => onUpdateScene(scene.id, { title: e.target.value })}
          className="w-full min-w-0 text-sm font-semibold font-novel-display bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none py-0.5 text-[var(--text-primary)] transition-colors placeholder-[var(--text-muted)] truncate focus:truncate-none"
          placeholder="Escribe el nombre de esta escena..."
          title="Haz clic para editar el nombre de la escena"
        />
      </div>

      {/* Lado Derecho: Botón de Guía y Modo Zen Unificados */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Botón de Ayuda Contextual con Placeholder para GIFs */}
        <button
          type="button"
          onClick={() => setIsHelpOpen(true)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border border-[var(--border-color)]/70 shadow-2xs shrink-0"
          title="Guía del Editor de Manuscrito y Atajos"
        >
          ?
        </button>

        {/* Botón Zen / Pantalla Completa */}
        <button
          id="zen-mode-btn"
          type="button"
          onClick={onActivateZen}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shrink-0"
          title="Modo Zen (Sin distracciones - Alt+Z / Esc)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal de Ayuda */}
      <SectionHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Editor de Manuscrito"
        description="Lienzo de redacción tipográfica pura estilo Ulysses e iA Writer con columna centrada de ~720px (65-75 caracteres), scroll de máquina de escribir y modo foco por párrafo."
        shortcuts={[
          { keys: ["Ctrl", "\\"], description: "Mostrar/Ocultar árbol de capítulos" },
          { keys: ["Ctrl", "I"], description: "Mostrar/Ocultar inspector de escena (Ctrl+I)" },
          { keys: ["Alt", "Z"], description: "Modo Zen libre de distracciones" },
          { keys: ["Alt", "-"], description: "Insertar raya de diálogo (—)" },
          { keys: ["Alt", "T"], description: "Scroll de máquina de escribir" },
          { keys: ["Alt", "F"], description: "Modo foco por párrafo" },
        ]}
      />
    </header>
  );
};
