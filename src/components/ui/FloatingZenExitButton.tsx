import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minimize2 } from "lucide-react";
import { useSettingsStore } from "../../stores/useSettingsStore";

export const FloatingZenExitButton: React.FC = () => {
  const isZenMode = useSettingsStore((s) => s.isZenMode);
  const setZenMode = useSettingsStore((s) => s.setZenMode);
  const [isNearTop, setIsNearTop] = useState(false);

  // Escuchar tecla Escape para salir de Zen
  useEffect(() => {
    if (!isZenMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZenMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode, setZenMode]);

  // Mostrar el botón en el centro sólo al acercar el ratón al borde superior
  useEffect(() => {
    if (!isZenMode) {
      setIsNearTop(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 55) {
        setIsNearTop(true);
      } else if (e.clientY > 90) {
        setIsNearTop(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isZenMode]);

  return (
    <AnimatePresence>
      {isZenMode && isNearTop && (
        <motion.div
          initial={{ opacity: 0, y: -24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -24, x: "-50%" }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed top-3 left-1/2 z-[9999] select-none pointer-events-auto"
        >
          <button
            onClick={() => setZenMode(false)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--text-main)] bg-[var(--bg-card)]/90 hover:bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl backdrop-blur-md transition-all cursor-pointer group hover:border-[var(--accent)]"
            title="Salir de Pantalla Completa (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-[var(--accent)] group-hover:scale-110 transition-transform" />
            <span>Salir de Modo Zen (Esc)</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
