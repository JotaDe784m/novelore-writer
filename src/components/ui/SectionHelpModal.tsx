import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Film, Keyboard } from "lucide-react";

export interface ShortcutHint {
  keys: string[];
  description: string;
}

interface SectionHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  gifSrc?: string;
  shortcuts?: ShortcutHint[];
}

export const SectionHelpModal: React.FC<SectionHelpModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  gifSrc,
  shortcuts = [],
}) => {
  // Cerrar al pulsar Escape
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

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
          {/* Backdrop con desenfoque suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              color: "var(--text-main)",
            }}
          >
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border-color)]/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-sm sm:text-base font-bold font-novel-display text-[var(--text-main)]">
                  Guía: {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Cerrar guía"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Contenedor 16:9 para GIF demostrado */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[var(--border-color)]/50 flex flex-col items-center justify-center text-center p-4">
                {gifSrc ? (
                  <img
                    src={gifSrc}
                    alt={`Demostración de ${title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-[var(--text-muted)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)]">
                      <Film className="w-5 h-5 opacity-90" />
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-main)]">
                      Demostración visual
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] max-w-xs">
                      Espacio preparado para GIF demostrativo en bucle de esta sección.
                    </span>
                  </div>
                )}

                {/* Insignia de ratio 16:9 discreta */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/40 text-white/90 backdrop-blur-xs select-none">
                  16:9
                </div>
              </div>

              {/* Explicación concisa sin sobreexposición */}
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {description}
              </p>

              {/* Atajos de teclado útiles si existen */}
              {shortcuts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]/50">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Atajos Rápidos</span>
                  </div>
                  <div className="space-y-1.5">
                    {shortcuts.map((sc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[var(--bg-input)]"
                      >
                        <span className="text-[var(--text-muted)]">{sc.description}</span>
                        <div className="flex items-center gap-1">
                          {sc.keys.map((k, ki) => (
                            <kbd
                              key={ki}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] shadow-2xs"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pie de modal con botón cápsula Entendido */}
            <div className="px-5 py-3 border-t border-[var(--border-color)]/60 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
