import React, { useState, useEffect } from "react";
import {
  Camera, Upload, Layers, User, MapPin, Shield, Gem, Zap, Calendar, Sparkles, X, Plus, Image as ImageIcon,
} from "lucide-react";
import { EntityCategory } from "../../../types";
import { DossierIdentityTabProps } from "./dossierTypes";
import { DossierColorPicker } from "./DossierColorPicker";
import { resolveAssetUrl } from "../../../utils/imageUtils";

const CATEGORIES = [
  { id: "character" as EntityCategory, label: "Personaje", icon: User },
  { id: "location" as EntityCategory, label: "Lugar", icon: MapPin },
  { id: "faction" as EntityCategory, label: "Facción", icon: Shield },
  { id: "item" as EntityCategory, label: "Objeto", icon: Gem },
  { id: "concept" as EntityCategory, label: "Concepto", icon: Zap },
  { id: "event" as EntityCategory, label: "Evento", icon: Calendar },
  { id: "other" as EntityCategory, label: "Libre", icon: Sparkles },
];

export const DossierIdentityTab: React.FC<DossierIdentityTabProps> = ({
  category, onCategoryChange, name, onNameChange, subtitle, onSubtitleChange,
  summary, onSummaryChange, color, onColorChange, tags, onAddTag, onRemoveTag,
  avatarUrl, onRemoveAvatar, onUploadAvatarClick, onOpenWhiteboard, onNavigateToGallery, whiteboardItemsCount, galleryCount,
}) => {
  const [tagInput, setTagInput] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => setAvatarError(false), [avatarUrl]);

  const CurrentIcon = CATEGORIES.find((c) => c.id === category)?.icon || User;

  const handleTagSubmit = () => {
    if (tagInput.trim()) {
      onAddTag(tagInput.trim());
      setTagInput("");
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Avatar & Identity Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        <div className="relative group shrink-0">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm relative bg-[var(--bg-card)] border-2"
            style={{ borderColor: color }}
          >
            {avatarUrl && !avatarError ? (
              <img
                src={resolveAssetUrl(avatarUrl)}
                alt={name || "Perfil"}
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center text-white"
                style={{ backgroundColor: color }}
              >
                <CurrentIcon className="w-8 h-8 opacity-90 mb-0.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                  {avatarError ? "No hallada" : "Sin foto"}
                </span>
              </div>
            )}
            <div
              onClick={onUploadAvatarClick}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity cursor-pointer"
            >
              <Camera className="w-5 h-5 text-amber-300" />
              <span className="text-[11px] font-bold">Cambiar</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Foto de Perfil del Elemento
            </span>
            {avatarUrl && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
              >
                Quitar foto
              </button>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Se muestra en las tarjetas de la Biblia de Mundo, árbol de relaciones e inspector de escena.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onUploadAvatarClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Subir Foto</span>
            </button>
            {onNavigateToGallery && (
              <button
                type="button"
                onClick={onNavigateToGallery}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Galería ({galleryCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenWhiteboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Abrir Pizarra ({whiteboardItemsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Selector */}
      <div>
        <label className="font-bold block mb-2 text-[var(--text-secondary)] uppercase tracking-wider text-xs">
          Categoría
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isSelected = category === c.id;
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => onCategoryChange(c.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs scale-102"
                    : "bg-[var(--bg-input)]/60 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                }`}
              >
                <Icon className="w-4 h-4 mb-1 shrink-0" />
                <span className="text-[11px] font-medium truncate w-full text-center">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Name & Subtitle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-bold text-xs text-[var(--text-secondary)] block mb-1.5">
            Nombre / Título *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ej: Valeria Vance, Fortaleza de Eldoria..."
            className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label className="font-bold text-xs text-[var(--text-secondary)] block mb-1.5">
            Subtítulo / Epíteto / Rol
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="Ej: Cartógrafa Proscrita, Reina del Norte..."
            className="w-full p-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* 4. Color Palette & Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DossierColorPicker color={color} onColorChange={onColorChange} />

        <div>
          <label className="font-bold text-xs text-[var(--text-secondary)] block mb-1.5">
            Etiquetas (Tags)
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTagSubmit();
                }
              }}
              placeholder="Nueva etiqueta (Enter)..."
              className="flex-1 p-2 rounded-xl bg-[var(--bg-input)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleTagSubmit}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center gap-1"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(t)}
                  className="hover:text-red-500 font-bold cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Quick Description / Summary */}
      <div>
        <label className="font-bold text-xs text-[var(--text-secondary)] block mb-1.5">
          Descripción Rápida / Resumen *
        </label>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Descripción sintética accesible para vista rápida en tarjetas y el manuscrito..."
          rows={3}
          className="w-full p-3 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] leading-relaxed text-xs sm:text-sm"
        />
      </div>
    </div>
  );
};
