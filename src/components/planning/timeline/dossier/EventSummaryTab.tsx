import React from "react";
import { Feather } from "lucide-react";
import { TimelineDatePicker } from "../TimelineDatePicker";
import { DossierTagsSection } from "../../../codex/dossier/DossierTagsSection";
import { EventAvatarCard } from "./EventAvatarCard";

interface EventSummaryTabProps {
  title: string;
  onTitleChange: (val: string) => void;
  subtitle: string;
  onSubtitleChange: (val: string) => void;
  summary: string;
  onSummaryChange: (val: string) => void;
  date: string;
  dateType: "calendar" | "free";
  onDateChange: (d: string, dt: "calendar" | "free") => void;
  color: string;
  onColorChange?: (color: string) => void;
  tags?: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  avatarUrl: string;
  onUploadAvatarClick: () => void;
  onRemoveAvatar: () => void;
  onOpenCropModal?: () => void;
}

export const EventSummaryTab: React.FC<EventSummaryTabProps> = ({
  title,
  onTitleChange,
  subtitle,
  onSubtitleChange,
  summary,
  onSummaryChange,
  date,
  dateType,
  onDateChange,
  color,
  tags = [],
  onAddTag,
  onRemoveTag,
  avatarUrl,
  onUploadAvatarClick,
  onRemoveAvatar,
  onOpenCropModal,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Hero Card del acontecimiento */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 transition-colors relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Retrato estándar 3:4 */}
          <EventAvatarCard
            avatarUrl={avatarUrl}
            title={title}
            color={color}
            onUploadAvatarClick={onUploadAvatarClick}
            onRemoveAvatar={onRemoveAvatar}
            onOpenCropModal={onOpenCropModal}
          />

          {/* Bloque derecho unificado: Título + Subtítulo + Línea + Ubicación + Tags */}
          <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3.5 w-full">
            {/* Fila superior: Título y Punto cromático de la línea */}
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Título del acontecimiento..."
                  className="flex-1 min-w-0 text-2xl sm:text-3xl lg:text-4xl font-bold font-novel-display text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors pb-1 leading-tight"
                />

                {/* Indicador de color heredado de la línea de tiempo */}
                <div
                  className="w-4 h-4 rounded-full shadow-2xs shrink-0 ring-2 ring-white/10"
                  style={{ backgroundColor: color }}
                  title="Color heredado de la línea de tiempo"
                />
              </div>

              {/* Subtítulo editable */}
              <input
                type="text"
                value={subtitle}
                onChange={(e) => onSubtitleChange(e.target.value)}
                placeholder="Subtítulo, rol o epíteto cronológico..."
                className="w-full text-sm sm:text-base text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]/50 bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors font-medium font-novel-serif italic"
              />
            </div>

            {/* Atributos apilados: Pista / Trama + Ubicación Temporal + Tags */}
            <div className="space-y-3 pt-1">

              {/* Ubicación Temporal */}
              <TimelineDatePicker
                date={date}
                dateType={dateType}
                onChange={onDateChange}
              />

              {/* Etiquetas */}
              <DossierTagsSection
                tags={tags}
                onAddTag={onAddTag}
                onRemoveTag={onRemoveTag}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Síntesis Editorial / Descripción corta */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 transition-colors space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] shrink-0">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-bold font-novel-display text-sm text-[var(--text-primary)]">
            Descripción Corta (Síntesis Editorial)
          </h4>
        </div>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Síntesis literaria o resumen del acontecimiento..."
          rows={4}
          className="w-full p-3.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-hidden focus:ring-1 focus:ring-[var(--accent)] border border-transparent leading-relaxed text-sm font-novel-serif custom-scroll resize-y"
        />
      </div>
    </div>
  );
};
