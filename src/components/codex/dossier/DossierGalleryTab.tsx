import React, { useState, useRef } from "react";
import { Upload, Star, ZoomIn, Trash2, Edit3, Image as ImageIcon, Check, ImageOff, Crop } from "lucide-react";
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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length) onAddImages(e.dataTransfer.files);
  };

  const startEditingCaption = (id: string, current = "") => {
    setEditingCaptionId(id); setCaptionDraft(current);
  };
  const saveCaption = (id: string) => {
    onUpdateCaption(id, captionDraft.trim()); setEditingCaptionId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Zona de Arrastrar y Subir Fotografías */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
          isDragging
            ? "border-[var(--accent)] bg-[var(--accent-subtle)]/50 scale-[1.01]"
            : "border-[var(--border-color)]/60 bg-[var(--bg-input)]/40 hover:bg-[var(--bg-input)]/60"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-color)]/50 shrink-0">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-bold font-novel-display text-sm text-[var(--text-main)]">
            Galería Multimedia
          </h4>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) { onAddImages(e.target.files); e.target.value = ""; }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-sans font-bold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Añadir Fotos</span>
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula Editorial en Proporción 3:4 */}
      {gallery.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-[var(--bg-card)]/30 border border-[var(--border-color)]/50 flex flex-col items-center justify-center space-y-2">
          <ImageIcon className="w-8 h-8 text-[var(--text-muted)] opacity-40" />
          <p className="text-xs font-sans text-[var(--text-muted)]">
            Aún no hay imágenes en la galería de esta ficha.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((img, idx) => {
            const isAvatar = (avatarOriginalUrl && avatarOriginalUrl === img.url) || avatarUrl === img.url;
            const isEditing = editingCaptionId === img.id;
            const resolvedSrc = resolveAssetUrl(img.url);
            const hasError = failedIds.has(img.id);

            return (
              <div
                key={img.id || idx}
                className={`group rounded-2xl overflow-hidden bg-[var(--bg-card)] border flex flex-col shadow-2xs transition-all hover:shadow-md ${
                  isAvatar ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30" : "border-[var(--border-color)]/60"
                }`}
              >
                {/* Contenedor de Imagen 3:4 */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  {hasError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-amber-500/10">
                      <ImageOff className="w-6 h-6 text-amber-500/80 mb-1" />
                      <span className="text-[10px] font-sans font-semibold text-amber-600 dark:text-amber-400">
                        No encontrada
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveImage(img.id, img.url)}
                        className="mt-2 text-[10px] font-sans font-medium text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src={resolvedSrc}
                        alt={img.caption || `Foto ${idx + 1}`}
                        onError={() => setFailedIds((prev) => new Set(prev).add(img.id))}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Insignia de Avatar Actual */}
                      {isAvatar && (
                        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[9px] font-sans font-bold shadow-xs flex items-center gap-1 z-10">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Avatar</span>
                        </div>
                      )}

                      {/* Botonera Flotante en Hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 p-2 text-white transition-opacity">
                        <button
                          type="button"
                          onClick={() => onOpenLightbox(idx)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                          title="Ver en grande"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>

                        {onOpenCropForImage && (
                          <button
                            type="button"
                            onClick={() => onOpenCropForImage(img.url)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-amber-300 transition-colors cursor-pointer"
                            title="Ajustar encuadre (3:4)"
                          >
                            <Crop className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSetAsAvatar(img.url)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isAvatar ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-white/20 hover:bg-white/30 text-white"
                          }`}
                          title={isAvatar ? "Avatar actual" : "Establecer como avatar"}
                        >
                          <Star className={`w-4 h-4 ${isAvatar ? "fill-current" : ""}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveImage(img.id, img.url)}
                          className="p-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-100 transition-colors cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Pie de foto editorial en cursiva */}
                <div className="p-2.5 text-xs flex-1 flex flex-col justify-between border-t border-[var(--border-color)]/40 bg-[var(--bg-input)]/20">
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
                        className="w-full px-2 py-0.5 rounded-lg text-[11px] font-novel-serif italic border border-[var(--accent)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => saveCaption(img.id)}
                        className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditingCaption(img.id, img.caption)}
                      className="flex items-center justify-between gap-1 text-[11px] font-novel-serif italic text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer truncate"
                      title="Clic para editar pie de foto"
                    >
                      <span className="truncate">{img.caption || "Sin descripción"}</span>
                      <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-60 shrink-0" />
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
