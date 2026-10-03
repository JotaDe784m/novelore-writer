import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { NovelCover } from "./NovelCover";

export interface CoverLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  author?: string;
  genre?: string;
  coverUrl?: string;
  projectPath?: string;
}

export const CoverLightboxModal: React.FC<CoverLightboxModalProps> = ({
  isOpen,
  onClose,
  title,
  author,
  genre,
  coverUrl,
  projectPath,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined" || !document.body) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Portada de ${title}`}
      onClick={onClose}
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm sm:max-w-md w-full flex flex-col items-center gap-4 animate-in zoom-in-95 duration-150"
      >
        {/* Boton Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Cerrar vista de portada"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Portada en gran formato */}
        <div className="relative shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/20">
          <NovelCover
            title={title}
            author={author}
            genre={genre}
            coverUrl={coverUrl}
            projectPath={projectPath}
            size="xl"
          />
        </div>

        {/* Metadatos de la obra en pie */}
        <div className="text-center space-y-1 px-4">
          <h3 className="text-lg sm:text-xl font-bold font-novel-display text-white drop-shadow-sm">
            {title}
          </h3>
          <div className="flex items-center justify-center gap-2 text-xs text-white/70 font-serif">
            {author && <span>{author}</span>}
            {author && genre && <span>•</span>}
            {genre && <span>{genre}</span>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
