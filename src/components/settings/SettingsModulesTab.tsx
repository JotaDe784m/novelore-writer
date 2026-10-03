import React from "react";
import {
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  Compass,
  Share2,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { useSettingsStore, SettingsState } from "../../stores/useSettingsStore";

interface ModuleDef {
  id: keyof SettingsState["visibleModules"];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULES_LIST: ModuleDef[] = [
  {
    id: "manuscript",
    label: "Manuscrito & Editor",
    description: "Árbol de capítulos, escenas y columna de lectura de prosa.",
    icon: BookOpen,
  },
  {
    id: "planning",
    label: "Planeación & Cronología",
    description: "Línea de tiempo narrativa, pistas y planos temporales.",
    icon: Calendar,
  },
  {
    id: "codex",
    label: "Códex",
    description: "Enciclopedia de personajes, lugares, facciones y dossiers.",
    icon: Compass,
  },
  {
    id: "relationships",
    label: "Mapa de Relaciones",
    description: "Grafo visual interactivo de vínculos entre entidades.",
    icon: Share2,
  },
  {
    id: "gallery",
    label: "Pizarra Visual",
    description: "Lienzo infinito espacial con notas y conectores.",
    icon: ImageIcon,
  },
  {
    id: "export",
    label: "Maquetación & Exportar",
    description: "Compilación técnica para imprenta, DOCX y PDF.",
    icon: Download,
  },
];

export const SettingsModulesTab: React.FC = () => {
  const visibleModules = useSettingsStore((s) => s.visibleModules);
  const toggleModuleVisibility = useSettingsStore((s) => s.toggleModuleVisibility);

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        Activa u oculta las secciones de la barra superior. Si tu flujo de trabajo se centra solo en prosa, puedes despejar la interfaz desactivando los módulos que no utilices.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
        {MODULES_LIST.map((m) => {
          const Icon = m.icon;
          const isVisible = visibleModules[m.id];

          return (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-surface-hover)] transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isVisible
                      ? "text-[var(--accent)] bg-[var(--accent-subtle)]"
                      : "text-[var(--text-muted)] bg-black/5 dark:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    {m.label}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {m.description}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleModuleVisibility(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isVisible
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs"
                    : "bg-black/5 dark:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isVisible ? "Visible" : "Oculto"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
