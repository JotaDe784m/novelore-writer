import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Settings, X, Palette, Layout, Globe } from "lucide-react";
import { UnderlineTabs } from "../ui/UnderlineTabs";
import { NovelProject } from "../../types";
import { SettingsModulesTab } from "./SettingsModulesTab";
import { SettingsAppearanceTab } from "./SettingsAppearanceTab";
import { SettingsLanguagesTab } from "./SettingsLanguagesTab";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject | null;
  onUpdateProject?: (updater: (prev: NovelProject) => NovelProject) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<string>("appearance");

  // Escuchar tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        {/* Backdrop con desenfoque suave */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Ventana Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh]"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            color: "var(--text-main)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--border-color)]/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-novel-display text-[var(--text-main)]">
                  Ajustes de Novelore
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Atmósferas visuales, módulos de barra e idiomas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Cerrar ajustes"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Underline Tabs */}
          <div className="px-6 border-b border-[var(--border-color)]/50">
            <UnderlineTabs
              tabs={[
                { id: "appearance", label: "Atmósferas & Temas", icon: Palette },
                { id: "modules", label: "Módulos de la Barra", icon: Layout },
                { id: "languages", label: "Idiomas", icon: Globe },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              size="sm"
            />
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto overflow-x-hidden space-y-4 flex-1">
            {activeTab === "appearance" && (
              <SettingsAppearanceTab
                project={project}
                onUpdateProject={onUpdateProject}
              />
            )}

            {activeTab === "modules" && <SettingsModulesTab />}

            {activeTab === "languages" && <SettingsLanguagesTab />}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[var(--border-color)]/60 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
            >
              Listo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
