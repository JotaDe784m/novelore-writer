import React from "react";
import {
  Lightbulb,
  PenLine,
  Search,
  Sparkles,
  Award,
} from "lucide-react";
import { SceneStatus } from "../../types";

export interface FontOption {
  id: string;
  label: string;
  previewClass: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "serif", label: "Merriweather (Serif Clásica)", previewClass: "font-novel-serif" },
  { id: "garamond", label: "EB Garamond (Literaria Clásica)", previewClass: "font-novel-garamond" },
  { id: "lora", label: "Lora (Elegante Editorial)", previewClass: "font-novel-lora" },
  { id: "serif-display", label: "Playfair Display (Titular)", previewClass: "font-novel-display" },
  { id: "sans", label: "Plus Jakarta (Moderna Sans)", previewClass: "font-novel-sans" },
  { id: "mono", label: "JetBrains Mono (Máquina)", previewClass: "font-novel-mono" },
];

export interface StatusOption {
  value: SceneStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  iconColor: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "idea",
    label: "Idea",
    icon: Lightbulb,
    badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25",
    iconColor: "text-purple-500",
  },
  {
    value: "draft",
    label: "Borrador",
    icon: PenLine,
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25",
    iconColor: "text-amber-500",
  },
  {
    value: "revised",
    label: "En Revisión",
    icon: Search,
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25",
    iconColor: "text-blue-500",
  },
  {
    value: "polished",
    label: "Pulido",
    icon: Sparkles,
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25",
    iconColor: "text-emerald-500",
  },
  {
    value: "final",
    label: "Final",
    icon: Award,
    badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25",
    iconColor: "text-teal-500",
  },
];

export interface LineSpacingOption {
  id: string;
  val: string;
  label: string;
}

export const LINE_SPACING_OPTIONS: LineSpacingOption[] = [
  { id: "compact", val: "1.15", label: "1.15 Compacto" },
  { id: "normal", val: "1.5", label: "1.5 Estándar" },
  { id: "relaxed", val: "1.8", label: "1.8 Editorial" },
  { id: "loose", val: "2.0", label: "2.0 Doble Manuscrito" },
];

export function getNumericLineHeight(lineSpacing?: string): number {
  const sp = String(lineSpacing || "normal");
  switch (sp) {
    case "compact":
    case "1.15":
      return 1.35;
    case "loose":
    case "double":
    case "2.0":
      return 2.2;
    case "relaxed":
    case "1.8":
      return 1.85;
    case "normal":
    case "1.5":
    default:
      return 1.6;
  }
}

export function getLineSpacingLabel(lineSpacing?: string): string {
  const sp = String(lineSpacing || "normal");
  switch (sp) {
    case "compact":
    case "1.15":
      return "1.15 Compacto";
    case "loose":
    case "double":
    case "2.0":
      return "2.0 Doble";
    case "relaxed":
    case "1.8":
      return "1.8 Editorial";
    case "normal":
    case "1.5":
    default:
      return "1.5 Estándar";
  }
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

