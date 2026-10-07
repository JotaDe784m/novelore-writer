import React, { useState, useEffect, useRef } from "react";
import { Palette, Feather } from "lucide-react";
import { TimelineDatePicker } from "../TimelineDatePicker";
import { DossierColorPicker } from "../../../codex/dossier/DossierColorPicker";
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
  onColorChange: (color: string) => void;
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
  onColorChange,
  tags = [],
  onAddTag,
  onRemoveTag,
  avatarUrl,
  onUploadAvatarClick,
  onRemoveAvatar,
  onOpenCropModal,
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false);
      }
    };
    if (colorPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [colorPickerOpen]);

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

          {/* Bloque derecho unificado: Título + Subtítulo + Pista + Ubicación + Tags */}
          <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3.5 w-full">
            {/* Fila superior: Título y Selector de color circular */}
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

                {/* Botón de color (círculo) con popover flotante */}
                <div className="relative shrink-0" ref={colorPickerRef}>
                  <button
                    type="button"
                    onClick={() => setColorPickerOpen((prev) => !prev)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-xs cursor-pointer ring-2 ring-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color }}
                    title="Cambiar color de identidad"
                  >
                    <Palette className="w-4 h-4 text-white drop-shadow-md opacity-0 hover:opacity-100 transition-opacity" />
                  </button>

                  {colorPickerOpen && (
                    <div className="absolute right-0 top-11 z-30 p-3 rounded-2xl bg-[var(--bg-card)] shadow-2xl border border-[var(--border-subtle)] w-64 animate-in fade-in zoom-in-95 duration-150">
                      <DossierColorPicker
                        color={color}
                        onColorChange={(c) => {
                          onColorChange(c);
                        }}
                      />
                    </div>
                  )}
                </div>
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
