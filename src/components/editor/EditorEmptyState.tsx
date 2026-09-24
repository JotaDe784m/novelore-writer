import React from "react";
import { BookOpen } from "lucide-react";

export const EditorEmptyState: React.FC = () => {
  return (
    <div
      id="editor-empty-state"
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      style={{
        backgroundColor: "var(--bg-editor)",
        color: "var(--text-muted)",
      }}
    >
      <BookOpen className="w-12 h-12 mb-3 opacity-40 text-[var(--accent)]" />
      <h3 className="text-lg font-bold font-novel-display text-[var(--text-primary)] mb-1">
        Ninguna escena seleccionada
      </h3>
      <p className="text-sm max-w-sm">
        Selecciona una escena en el panel izquierdo o crea una nueva para comenzar a escribir.
      </p>
    </div>
  );
};

