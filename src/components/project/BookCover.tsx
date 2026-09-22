import React, { useState, useRef, useId } from "react";
import { BookOpen, Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface BookCoverProps {
  title: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  onCoverChange?: (newCoverUrl: string) => void;
  allowEdit?: boolean;
  allowUpload?: boolean;
  onUploadCover?: (newCoverUrl: string) => void;
  onRemoveCover?: () => void;
}

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  genre,
  coverUrl,
  size = "md",
  className = "",
  onCoverChange,
  allowEdit = false,
  allowUpload = false,
  onUploadCover,
  onRemoveCover,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const uniqueInputId = useId();
  const canEdit = allowEdit || allowUpload;

  // Reset load error when coverUrl changes
  React.useEffect(() => {
    setImageLoadError(false);
  }, [coverUrl]);

  const emitCoverChange = (url: string) => {
    if (onCoverChange) onCoverChange(url);
    if (onUploadCover) onUploadCover(url);
  };

  /**
   * Resilient image reader and optimizer:
   * 1. Works smoothly across Firefox, Chrome, Safari.
   * 2. Resizes to max 600x900px, keeping output ~40-70KB.
   * 3. Guarantees safety under Firestore 1MB and Firefox localStorage 5MB limits.
   * 4. Includes fallback to original dataUrl if canvas drawing fails.
   */
  const processImageFile = (file: File) => {
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      console.warn("La imagen de portada debe pesar menos de 8MB.");
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();

    reader.onerror = () => {
      setIsProcessing(false);
      console.error("Error al leer el archivo de portada.");
    };

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      // CRITICAL FOR FIREFOX: Never set crossOrigin on data: or blob: URIs!
      // Setting crossOrigin on data URLs throws a security exception in Firefox.
      if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
        img.crossOrigin = "anonymous";
      }

      const fallbackAndEmit = () => {
        setIsProcessing(false);
        emitCoverChange(dataUrl);
      };

      img.onerror = () => {
        fallbackAndEmit();
      };

      img.onload = () => {
        try {
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 900;
          let w = img.naturalWidth || img.width || 400;
          let h = img.naturalHeight || img.height || 600;

          if (w > MAX_WIDTH || h > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h);
            w = Math.max(1, Math.round(w * ratio));
            h = Math.max(1, Math.round(h * ratio));
          }

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          if (!ctx) {
            fallbackAndEmit();
            return;
          }

          // Pre-fill white background for transparent PNGs
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setIsProcessing(false);
          emitCoverChange(compressed);
        } catch (err) {
          console.warn("Fallo de compresión en canvas, aplicando fallback:", err);
          fallbackAndEmit();
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Clear input so re-selecting same file triggers change in Firefox
    e.target.value = "";
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRemoveCover) {
      onRemoveCover();
    } else if (onCoverChange) {
      onCoverChange("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImageFile(file);
    }
  };

  // Dimensions based on size (Aspect ratio 2:3 typical book standard)
  const sizeClasses = {
    sm: "w-14 h-20 aspect-[2/3] text-[9px]",
    md: "w-24 h-36 aspect-[2/3] text-[10px]",
    lg: "w-32 h-48 sm:w-36 sm:h-54 aspect-[2/3] text-xs",
    hero: "w-36 h-54 sm:w-44 sm:h-64 aspect-[2/3] text-xs",
  };

  // Preset genre background shades when no cover is uploaded
  const getGenreColor = (g?: string) => {
    const lower = (g || "").toLowerCase();
    if (lower.includes("fantasía")) return "from-amber-950 via-stone-900 to-amber-900 border-amber-600/40 text-amber-200";
    if (lower.includes("ciencia") || lower.includes("ficción")) return "from-indigo-950 via-slate-900 to-cyan-950 border-indigo-500/40 text-cyan-200";
    if (lower.includes("terror") || lower.includes("horror")) return "from-zinc-950 via-neutral-900 to-red-950 border-red-800/40 text-red-200";
    if (lower.includes("thriller") || lower.includes("negra") || lower.includes("misterio")) return "from-stone-950 via-neutral-900 to-zinc-900 border-zinc-700/40 text-zinc-300";
    if (lower.includes("romance")) return "from-rose-950 via-stone-900 to-pink-950 border-rose-500/40 text-rose-200";
    if (lower.includes("histórica")) return "from-amber-950 via-yellow-950 to-stone-900 border-yellow-700/40 text-amber-300";
    return "from-neutral-900 via-stone-900 to-zinc-900 border-neutral-700/40 text-neutral-300";
  };

  const hasValidCover = Boolean(coverUrl && !imageLoadError);

  return (
    <div
      className={`relative group shrink-0 rounded-lg overflow-hidden select-none transition-all shadow-md hover:shadow-xl ${sizeClasses[size]} ${className} ${
        isDragging ? "ring-2 ring-[var(--accent)] ring-offset-2 scale-105" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Book 3D spine crease on left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10 pointer-events-none" />
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/10 z-10 pointer-events-none" />

      {hasValidCover ? (
        <img
          src={coverUrl}
          alt={`Portada de ${title}`}
          className="w-full h-full object-cover rounded-lg block"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageLoadError(true)}
        />
      ) : (
        /* Fallback: Book Spine Foil Stamped Canvas */
        <div
          className={`w-full h-full p-2.5 flex flex-col justify-between rounded-lg bg-gradient-to-b border ${getGenreColor(
            genre
          )}`}
        >
          {/* Top Genre Badge */}
          <div className="text-[8px] font-bold uppercase tracking-widest opacity-70 truncate">
            {genre || "Novela"}
          </div>

          {/* Center Book Title */}
          <div className="my-auto text-center py-1">
            <BookOpen className="w-4 h-4 mx-auto mb-1 opacity-60" />
            <h4 className="font-novel-display font-bold leading-tight line-clamp-3 px-1 text-white">
              {title || "Sin título"}
            </h4>
          </div>

          {/* Bottom Author */}
          <div className="text-center">
            <div className="w-4 h-px bg-white/30 mx-auto mb-1" />
            <p className="text-[9px] font-serif italic truncate opacity-80">
              {author || "Autor"}
            </p>
          </div>
        </div>
      )}

      {/* Loading overlay when optimizing image */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/75 z-30 flex flex-col items-center justify-center p-2 text-center text-white">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
          <span className="text-[10px] font-medium">Procesando...</span>
        </div>
      )}

      {/* Dragging over indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--accent)]/80 z-30 flex flex-col items-center justify-center p-2 text-center text-white">
          <ImageIcon className="w-5 h-5 mb-1 animate-bounce" />
          <span className="text-[10px] font-bold">Soltar portada</span>
        </div>
      )}

      {/* Hover Actions: Upload / Change / Remove Cover (Firefox & Chrome universal compatibility) */}
      {canEdit && !isProcessing && (onCoverChange || onUploadCover) && (
        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              fileInputRef.current?.click();
            }}
            className="px-2.5 py-1 rounded-md bg-white text-neutral-900 text-[11px] font-semibold flex items-center gap-1 hover:bg-neutral-100 shadow-sm cursor-pointer transition-transform active:scale-95"
            title="Subir portada desde tu equipo o arrastra una imagen aquí"
          >
            <Upload className="w-3 h-3 text-neutral-800 shrink-0" />
            <span>{hasValidCover ? "Cambiar" : "Subir"}</span>
          </button>

          {hasValidCover && (
            <button
              type="button"
              onClick={handleRemoveCover}
              className="px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-medium flex items-center gap-1 hover:bg-red-700 cursor-pointer transition-transform active:scale-95"
              title="Quitar imagen de portada"
            >
              <Trash2 className="w-2.5 h-2.5 shrink-0" />
              <span>Quitar</span>
            </button>
          )}

          {/* Accessible file input */}
          <input
            id={uniqueInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*,image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileSelect}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
};
