import React, { useState, useRef } from "react";
import { Upload, Star, ZoomIn, Trash2, Edit3, Image as ImageIcon, Check, ImageOff } from "lucide-react";
import { DossierGalleryTabProps } from "./dossierTypes";
import { resolveAssetUrl } from "../../../utils/imageUtils";

export const DossierGalleryTab: React.FC<DossierGalleryTabProps> = ({
  gallery,
  avatarUrl,
  avatarOriginalUrl,
  onAddImages,
  onRemoveImage,
  onUpdateCaption,
  onSetAsAvatar,
  onOpenCropForImage,
  onOpenLightbox,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddImages(e.dataTransfer.files);
    }
  };

  const startEditingCaption = (id: string, current: string = "") => {
    setEditingCaptionId(id);
    setCaptionDraft(current);
  };

  const saveCaption = (id: string) => {
    onUpdateCaption(id, captionDraft.trim());
    setEditingCaptionId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Zona de subida */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent-subtle)]/40 scale-[1.01]"
            : "border-[var(--border-subtle)] bg-[var(--bg-input)]/40 hover:bg-[var(--bg-input)]/70"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shadow-2xs shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[var(--text-main)]">
              Galería Multimedia del Elemento
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">
              Arrastra imágenes aquí o sube archivos locales. Se copiarán físicamente en assets/gallery/.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddImages(e.target.files);
                e.target.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-95 shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Añadir Fotos</span>
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula de Galería */}
      {gallery.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-[var(--bg-card)]/30 border border-[var(--border-subtle)] flex flex-col items-center justify-center space-y-2">
          <ImageIcon className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
          <p className="text-xs text-[var(--text-muted)]">
            Aún no hay imágenes añadidas a este dossier.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {gallery.map((img, idx) => {
            const isAvatar = (avatarOriginalUrl && avatarOriginalUrl === img.url) || avatarUrl === img.url;
            const isEditing = editingCaptionId === img.id;
            const resolvedSrc = resolveAssetUrl(img.url);
            const hasError = failedIds.has(img.id);

            return (
              <div
                key={img.id || idx}
                className="group rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col shadow-2xs transition-all hover:shadow-xs"
              >
                {/* Contenedor de Imagen */}
                <div className="relative aspect-4/3 overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  {hasError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-amber-500/5 dark:bg-amber-500/10">
                      <ImageOff className="w-6 h-6 text-amber-500/80 mb-1" />
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 leading-tight">
                        Archivo no encontrado
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] line-clamp-1 mt-0.5 max-w-[140px]">
                        {img.url.replace(/^assets\//, "")}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveImage(img.id, img.url)}
                        className="mt-2 text-[10px] font-medium text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Desvincular</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src={resolvedSrc}
                        alt={img.caption || `Imagen ${idx + 1}`}
                        onError={() => setFailedIds((prev) => new Set(prev).add(img.id))}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Insignia de Avatar Actual */}
                      {isAvatar && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-bold shadow-xs flex items-center gap-1 z-10">
                          <Star className="w-2.5 h-2.5 fill-black" />
                          <span>Perfil</span>
                        </div>
                      )}

                      {/* Overlay de Acciones Rápidas */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onOpenLightbox(idx)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                          title="Ver a pantalla completa"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenCropForImage) onOpenCropForImage(img.url);
                            else onSetAsAvatar(img.url);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isAvatar
                              ? "bg-amber-500 text-black"
                              : "bg-white/20 hover:bg-white/30 text-white"
                          }`}
                          title={isAvatar ? "Encuadrar foto de perfil" : "Establecer como foto de perfil"}
                        >
                          <Star className={`w-4 h-4 ${isAvatar ? "fill-black" : ""}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveImage(img.id, img.url)}
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-colors cursor-pointer"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Pie de foto / Descripción editable */}
                <div className="p-2.5 text-xs flex-1 flex flex-col justify-between">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCaption(img.id);
                          if (e.key === "Escape") setEditingCaptionId(null);
                        }}
                        placeholder="Pie de foto..."
                        autoFocus
                        className="w-full px-2 py-0.5 rounded-md text-[11px] border border-[var(--accent)] bg-[var(--bg-input)] text-[var(--text-main)] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => saveCaption(img.id)}
                        className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditingCaption(img.id, img.caption)}
                      className="flex items-center justify-between gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer truncate"
                      title="Clic para editar pie de foto"
                    >
                      <span className="truncate">{img.caption || "Sin descripción"}</span>
                      <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-70 shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
