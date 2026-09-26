import React from "react";
import {
  Target,
  Zap,
  Compass,
  Sparkles,
  BookOpen,
  Heart,
  HelpCircle,
  ArrowRightLeft,
} from "lucide-react";
import { SceneNotesTemplate } from "../../../types";

interface TemplateCardPreset {
  title: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export interface TemplatePreset {
  id: SceneNotesTemplate;
  label: string;
  defaultCards: TemplateCardPreset[];
}

export const SCENE_NOTE_TEMPLATES: Record<SceneNotesTemplate, TemplatePreset> = {
  dramatic: {
    id: "dramatic",
    label: "Dramático",
    defaultCards: [
      {
        title: "Meta & Intención",
        placeholder: "¿Qué busca o persigue el personaje en esta escena?",
        icon: Target,
        colorClass: "text-[var(--accent)]",
      },
      {
        title: "Conflicto & Obstáculo",
        placeholder: "¿Qué dilema u oposición se interpone en su camino?",
        icon: Zap,
        colorClass: "text-rose-500",
      },
      {
        title: "Giro & Desenlace",
        placeholder: "¿Cómo concluye o se transforma la situación final?",
        icon: Compass,
        colorClass: "text-emerald-500",
      },
    ],
  },
  worldbuilding: {
    id: "worldbuilding",
    label: "Worldbuilding",
    defaultCards: [
      {
        title: "Atmósfera & Tono",
        placeholder: "Detalles sensoriales, clima, arquitectura y ambientación...",
        icon: Sparkles,
        colorClass: "text-indigo-400",
      },
      {
        title: "Revelación de Lore",
        placeholder: "Misterio histórico, magia, reliquia o dato revelado...",
        icon: BookOpen,
        colorClass: "text-purple-400",
      },
      {
        title: "Trascendencia",
        placeholder: "¿Cómo repercute este lugar o descubrimiento en el mundo?",
        icon: Compass,
        colorClass: "text-cyan-400",
      },
    ],
  },
  reaction: {
    id: "reaction",
    label: "Reacción",
    defaultCards: [
      {
        title: "Emoción & Duelo",
        placeholder: "Impacto anímico o estado psicológico tras los sucesos...",
        icon: Heart,
        colorClass: "text-rose-400",
      },
      {
        title: "Dilema Interno",
        placeholder: "¿Qué contradicción moral o lógica atormenta al personaje?",
        icon: HelpCircle,
        colorClass: "text-amber-400",
      },
      {
        title: "Decisión & Rumbo",
        placeholder: "¿Qué camino elige tomar y cuál es su siguiente paso?",
        icon: ArrowRightLeft,
        colorClass: "text-emerald-400",
      },
    ],
  },
  free: {
    id: "free",
    label: "Libre",
    defaultCards: [],
  },
  custom: {
    id: "custom",
    label: "Personalizado",
    defaultCards: [],
  },
};
