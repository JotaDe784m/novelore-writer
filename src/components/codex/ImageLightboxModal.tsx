import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Star, Download, ZoomIn, Calendar } from "lucide-react";
import { EntityImage } from "../../types";

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: EntityImage[];
  currentIndex: number;
  entityName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSetAsAvatar?: (url: string) => void;
  currentAvatarUrl?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  currentIndex,
  entityName,
  onClose,
  onNavigate,
  onSetAsAvatar,
  currentAvatarUrl,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight" && images.length > 1) {
        onNavigate((currentIndex + 1) % images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0 || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];
  const isAvatar = currentAvatarUrl === currentImage.url;

  return (
    <div
      id="image-lightbox-backdrop"
      className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between text-white/90 border-b border-white/10 shrink-0 bg-black/40">
        <div>
          <div className="text-xs font-semibold text-white/60">{entityName}</div>
          <h3 className="text-sm font-bold text-white truncate max-w-md">
            {currentImage.caption || `Imagen ${currentIndex + 1} de ${images.length}`}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onSetAsAvatar && (
            <button
              onClick={() => onSetAsAvatar(currentImage.url)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isAvatar
                  ? "bg-amber-500 text-black"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title="Establecer esta imagen como foto de perfil de la entrada"
            >
              <Star className={`w-3.5 h-3.5 ${isAvatar ? "fill-black" : ""}`} />
              <span>{isAvatar ? "Foto de Perfil Actual" : "Hacer Foto de Perfil"}</span>
            </button>
          )}

          <a
            href={currentImage.url}
            download={`${entityName.toLowerCase().replace(/\s+/g, "_")}_img_${currentIndex + 1}.png`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Descargar imagen"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
            title="Cerrar visor (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Area with Previous/Next Controls */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {images.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-xl transition-transform hover:scale-105"
            title="Imagen anterior (Flecha izquierda)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={currentImage.url}
          alt={currentImage.caption || entityName}
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all"
        />

        {images.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            className="absolute right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-xl transition-transform hover:scale-105"
            title="Siguiente imagen (Flecha derecha)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Information & Thumbnails Strip */}
      <div className="p-3 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs text-white/70 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-white">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.caption && (
            <span className="text-white/80 italic">"{currentImage.caption}"</span>
          )}
        </div>

        {/* Mini thumbnail strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm py-1">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => onNavigate(idx)}
              className={`w-9 h-9 rounded-md overflow-hidden border transition-all shrink-0 ${
                idx === currentIndex
                  ? "ring-2 ring-amber-400 border-amber-400 scale-105"
                  : "border-white/20 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={img.caption || ""}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
