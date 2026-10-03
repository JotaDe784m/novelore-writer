import React from "react";
import { Target, Layers, Clock, BookMarked } from "lucide-react";

interface HomeWritingRhythmProps {
  stats: {
    totalWords: number;
    targetWords: number;
    enableWordGoals?: boolean;
    progressPercent: number;
    actCount: number;
    chapterCount: number;
    sceneCount: number;
    estReadingMinutes: number;
    estPages: number;
  };
  projectPath?: string;
  isDemo?: boolean;
  lastSavedAt?: Date | null;
  isSaving?: boolean;
}

export const HomeWritingRhythm: React.FC<HomeWritingRhythmProps> = ({
  stats,
}) => {
  const isGoalsEnabled = stats.enableWordGoals !== false;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-novel-display text-[var(--text-main)]">
            Ritmo de Escritura
          </h2>
          <p className="text-xs text-[var(--text-muted)] font-serif">
            Avance literario y dimensiones narrativas de tu obra
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Meta Global de Palabras o Modo Libre */}
        <div
          className="rounded-2xl p-4.5 transition-all flex flex-col justify-between space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] font-serif">
              {isGoalsEnabled ? "Meta del Manuscrito" : "Modo Libre"}
            </span>
            <div className="p-1.5 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
                {stats.totalWords.toLocaleString()}
              </span>
              {isGoalsEnabled ? (
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  / {stats.targetWords.toLocaleString()}
                </span>
              ) : (
                <span className="text-xs text-[var(--text-muted)] font-serif">
                  palabras
                </span>
              )}
            </div>
            {isGoalsEnabled ? (
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-input)] mt-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.progressPercent}%`,
                    backgroundColor: "var(--accent)",
                  }}
                />
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] mt-2 font-serif truncate">
                Escribe a tu propio ritmo
              </p>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            {isGoalsEnabled ? `${stats.progressPercent}% completado` : "Sin meta activa"}
          </div>
        </div>

        {/* Card 2: Estructura Narrativa */}
        <div
          className="rounded-2xl p-4.5 transition-all flex flex-col justify-between space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] font-serif">Estructura Narrativa</span>
            <div className="p-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-main)]">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
              {stats.sceneCount}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans">
                escenas
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate font-serif">
              {stats.actCount} actos • {stats.chapterCount} capítulos
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-serif">
            Distribución por escenas
          </div>
        </div>

        {/* Card 3: Tiempo Estimado de Lectura */}
        <div
          className="rounded-2xl p-4.5 transition-all flex flex-col justify-between space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] font-serif">Tiempo de Lectura</span>
            <div className="p-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-main)]">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
              ~{stats.estReadingMinutes}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans">
                minutos
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-serif">
              Experiencia del lector
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            ~220 palabras por minuto
          </div>
        </div>

        {/* Card 4: Volumen en Páginas Impresas */}
        <div
          className="rounded-2xl p-4.5 transition-all flex flex-col justify-between space-y-3"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] font-serif">Volumen Editorial</span>
            <div className="p-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-main)]">
              <BookMarked className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-main)]">
              ~{stats.estPages}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5 font-sans">
                páginas
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-serif">
              Estimación de libro físico
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            ~250 palabras por página
          </div>
        </div>
      </div>
    </div>
  );
};
