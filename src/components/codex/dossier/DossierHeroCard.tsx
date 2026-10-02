import React, { useState, useEffect, useRef } from "react";
import { Camera, Palette, User, Crop, Trash2 } from "lucide-react";
import { EntityCategory } from "../../../types";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { DossierColorPicker } from "./DossierColorPicker";
import { DossierCategoryDropdown } from "./DossierCategoryDropdown";
import { DossierTagsSection } from "./DossierTagsSection";

export interface DossierHeroCardProps {
  name: string;
  onNameChange: (val: string) => void;
  subtitle: string;
  onSubtitleChange: (val: string) => void;
  category: EntityCategory;
  onCategoryChange: (val: EntityCategory) => void;
  tags: string[];
  onAddTag: (val: string) => void;
  onRemoveTag: (val: string) => void;
  color: string;
  onColorChange: (color: string, immediate?: boolean) => void;
  avatarUrl: string;
  onRemoveAvatar: () => void;
  onUploadAvatarClick: () => void;
  onOpenCropModal?: () => void;
  onNavigateToGallery?: () => void;
  onOpenWhiteboard?: () => void;
  galleryCount?: number;
  whiteboardItemsCount?: number;
  categoryIcon?: React.ComponentType<{ className?: string }>;
}

export const DossierHeroCard: React.FC<DossierHeroCardProps> = ({
  name,
  onNameChange,
  subtitle,
  onSubtitleChange,
  category,
  onCategoryChange,
  tags,
  onAddTag,
  onRemoveTag,
  color,
  onColorChange,
  avatarUrl,
  onRemoveAvatar,
  onUploadAvatarClick,
  onOpenCropModal,
  categoryIcon: CategoryIcon = User,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setAvatarError(false), [avatarUrl]);

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
    <div
      id="dossier-hero-card"
      className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-input)]/45 transition-colors relative"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
        {/* Retrato 3:4 con borde de color y overlay de acciones */}
        <div className="relative group shrink-0">
          <div
            className="w-36 sm:w-40 md:w-44 aspect-[3/4] rounded-2xl overflow-hidden flex items-center justify-center shadow-xs relative bg-[var(--bg-card)] border-2 transition-all"
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
                className="w-full h-full flex flex-col items-center justify-center text-white p-3 text-center"
                style={{ backgroundColor: color }}
              >
                <CategoryIcon className="w-12 h-12 sm:w-14 sm:h-14 opacity-90 mb-1.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
                  {avatarError ? "No hallada" : "Sin foto"}
                </span>
              </div>
            )}
            {avatarUrl && !avatarError ? (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-2 text-white transition-opacity">
                {onOpenCropModal && (
                  <button
                    type="button"
                    onClick={onOpenCropModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors cursor-pointer border-none"
                    title="Ajustar encuadre (3:4)"
                  >
                    <Crop className="w-3.5 h-3.5 text-amber-300" />
                    <span>Encuadre</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onUploadAvatarClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors cursor-pointer border-none"
                  title="Cambiar foto de perfil"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <span>Cambiar</span>
                </button>
                <button
                  type="button"
                  onClick={onRemoveAvatar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-colors cursor-pointer border-none"
                  title="Quitar foto de perfil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onUploadAvatarClick}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white transition-opacity cursor-pointer border-none"
                title="Subir foto de perfil"
              >
                <Camera className="w-6 h-6 text-amber-300" />
                <span className="text-xs font-bold">Subir foto</span>
              </button>
            )}
          </div>
        </div>

        {/* Bloque derecho unificado: Nombre + Subtítulo + Categoría + Tags */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3.5">
          {/* Fila superior: Nombre y Selector de color */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Nombre del personaje o elemento..."
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
                    <DossierColorPicker color={color} onColorChange={onColorChange} />
                  </div>
                )}
              </div>
            </div>

            {/* Subtítulo editable */}
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onSubtitleChange(e.target.value)}
              placeholder="Subtítulo, rol o epíteto (ej: Cartógrafa de Reliquias & Erudita Proscrita)..."
              className="w-full text-sm sm:text-base text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]/50 bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors font-medium"
            />
          </div>

          {/* Fila central: Categoría y Etiquetas apiladas */}
          <div className="space-y-3 pt-1">
            <DossierCategoryDropdown
              category={category}
              onCategoryChange={onCategoryChange}
            />
            <DossierTagsSection
              tags={tags}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

