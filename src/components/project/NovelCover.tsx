import React, { useState, useRef, useId } from "react";
import { Camera, Trash2, Maximize2 } from "lucide-react";
import { resolveAssetUrl, saveLocalImage } from "../../utils/imageUtils";

export interface NovelCoverProps {
  title: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
  projectPath?: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  className?: string;
  onCoverChange?: (newCoverUrl: string) => void;
  onRemoveCover?: () => void;
  onViewLarge?: () => void;
}

const GENRE_GRADIENTS: Record<string, { bg: string; text: string; accent: string }> = {
  Fantasía: { bg: "from-emerald-950 via-teal-900 to-slate-950", text: "text-emerald-100", accent: "text-emerald-400" },
  "Ciencia Ficción": { bg: "from-indigo-950 via-blue-900 to-slate-950", text: "text-blue-100", accent: "text-cyan-400" },
  Terror: { bg: "from-zinc-950 via-red-950 to-black", text: "text-red-100", accent: "text-rose-400" },
  Gótico: { bg: "from-purple-950 via-zinc-900 to-black", text: "text-purple-100", accent: "text-purple-400" },
  Romance: { bg: "from-rose-950 via-pink-900 to-amber-950", text: "text-rose-100", accent: "text-rose-300" },
  Misterio: { bg: "from-slate-950 via-neutral-900 to-zinc-950", text: "text-amber-100", accent: "text-amber-400" },
  Histórica: { bg: "from-amber-950 via-stone-900 to-yellow-950", text: "text-amber-100", accent: "text-amber-500" },
  Default: { bg: "from-neutral-900 via-stone-900 to-zinc-950", text: "text-neutral-100", accent: "text-amber-400" },
};

export const NovelCover: React.FC<NovelCoverProps> = ({
  title,
  author,
  genre,
  coverUrl,
  projectPath,
  size = "md",
  editable = false,
  className = "",
  onCoverChange,
  onRemoveCover,
  onViewLarge,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Reiniciar error de imagen si cambia coverUrl
  React.useEffect(() => {
    setImageError(false);
  }, [coverUrl]);

  const sizeClasses = {
    sm: "w-16 h-24 text-[10px]",
    md: "w-28 h-40 text-xs",
    lg: "w-44 h-64 text-sm",
    xl: "w-64 h-96 sm:w-72 sm:h-[432px] text-base",
  }[size];

  const resolvedUrl = coverUrl ? resolveAssetUrl(coverUrl, projectPath) : "";
  const hasValidImage = Boolean(resolvedUrl && !imageError);

  const matchedTheme = (genre && GENRE_GRADIENTS[genre]) || GENRE_GRADIENTS.Default;
  const initialLetter = title ? title.trim().charAt(0).toUpperCase() : "N";

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCoverChange) return;

    try {
      setIsUploading(true);
      const res = await saveLocalImage(file, "covers", {
        fileName: `cover_${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        projectPath,
      });

      if (res.success && res.relativePath) {
        setImageError(false);
        onCoverChange(res.relativePath);
      }
    } catch (err) {
      console.error("Error al subir portada:", err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div
      onClick={!editable && onViewLarge ? onViewLarge : undefined}
      className={`relative group rounded-xl overflow-hidden shrink-0 select-none shadow-sm transition-all duration-300 ${sizeClasses} ${className} ${
        !editable && onViewLarge ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
    >
      {/* 1. Imagen física real */}
      {hasValidImage ? (
        <img
          src={resolvedUrl}
          alt={`Portada de ${title}`}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        /* 2. Portada tipográfica editorial de respaldo */
        <div
          className={`w-full h-full bg-gradient-to-b ${matchedTheme.bg} p-2 flex flex-col justify-between text-center relative overflow-hidden`}
        >
          {/* Sutil textura y lomo de libro a la izquierda */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-black/25 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-1.5 w-0.5 bg-white/10 pointer-events-none" />

          {/* Letra inicial / Emblema superior */}
          <div className="pt-1 flex justify-center">
            <span
              className={`font-serif font-black tracking-widest opacity-80 ${matchedTheme.accent} ${
                size === "sm" ? "text-base" : size === "md" ? "text-xl" : size === "lg" ? "text-3xl" : "text-4xl"
              }`}
            >
              {initialLetter}
            </span>
          </div>

          {/* Título de la novela */}
          <div className="px-1 py-0.5">
            <h4
              className={`font-serif font-bold ${matchedTheme.text} line-clamp-3 leading-tight ${
                size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : size === "lg" ? "text-sm" : "text-base"
              }`}
            >
              {title || "Sin título"}
            </h4>
          </div>

          {/* Autor en pie de portada */}
          <div className="pb-1 px-0.5">
            <span
              className={`font-sans tracking-wider uppercase truncate block text-white/60 ${
                size === "sm" ? "text-[8px]" : size === "xl" ? "text-[11px]" : "text-[9px]"
              }`}
            >
              {author || "Autor"}
            </span>
          </div>
        </div>
      )}

      {/* Sombra de relieve interior de libro */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-black/10 dark:ring-white/10 rounded-xl" />

      {/* Indicador sutil de ampliación si no es editable */}
      {!editable && onViewLarge && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="p-1.5 rounded-full bg-black/60 text-white shadow-md">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* 3. Acciones de edición (Hover Overlay) */}
      {editable && (
        <>
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
          />

          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-2 transition-opacity ${
              isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isUploading ? (
              <span className="text-[10px] text-white font-medium animate-pulse">Guardando...</span>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-1">
                {onViewLarge && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewLarge();
                    }}
                    className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Ver portada en grande"
                  >
                    <Maximize2 className="w-3 h-3 text-cyan-300" />
                    <span>Ver</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Cambiar imagen de portada"
                >
                  <Camera className="w-3 h-3 text-amber-300" />
                  <span>{hasValidImage ? "Cambiar" : "Subir"}</span>
                </button>

                {hasValidImage && onRemoveCover && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCover();
                    }}
                    className="p-1 rounded-md bg-red-500/20 hover:bg-red-500/40 text-red-200 text-[9px] transition-colors cursor-pointer"
                    title="Quitar portada personalizada"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
