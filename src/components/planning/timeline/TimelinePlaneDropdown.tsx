import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Hourglass,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { TimelineEvent, TimelineTrack } from "../../../types";
import { TemporalPlaneDefinition } from "../../../stores/planningStoreTypes";
import { usePlanningStore } from "../../../stores/usePlanningStore";
import { TimelinePlaneModal } from "./TimelinePlaneModal";
import { TimelinePlaneDeleteModal } from "./TimelinePlaneDeleteModal";

export interface TimelinePlaneDropdownProps {
  events: TimelineEvent[];
  tracks: TimelineTrack[];
  activePlane: "all" | string;
  onSelectPlane: (planeId: "all" | string) => void;
}

export const TimelinePlaneDropdown: React.FC<TimelinePlaneDropdownProps> = ({
  events,
  tracks,
  activePlane,
  onSelectPlane,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlane, setEditingPlane] = useState<TemporalPlaneDefinition | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planeToDelete, setPlaneToDelete] = useState<TemporalPlaneDefinition | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const temporalPlanes = usePlanningStore((s) => s.temporalPlanes);
  const deleteTemporalPlane = usePlanningStore((s) => s.deleteTemporalPlane);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const countByPlane = (planeId: string) => {
    const planeTracks = new Set(tracks.filter((t) => t.planeId === planeId).map((t) => t.id));
    return events.filter(
      (e) => (e.temporalPlane || "present") === planeId || planeTracks.has(e.trackId)
    ).length;
  };

  const activePlaneObj = temporalPlanes.find((p) => p.id === activePlane);
  const activeLabel = activePlane === "all" ? "Todos" : activePlaneObj?.name || "Plano";

  const handleOpenCreate = () => {
    setEditingPlane(null);
    setModalOpen(true);
    setIsOpen(false);
  };

  const handleOpenEdit = (e: React.MouseEvent, plane: TemporalPlaneDefinition) => {
    e.stopPropagation();
    setEditingPlane(plane);
    setModalOpen(true);
    setIsOpen(false);
  };

  const handleRequestDelete = (e: React.MouseEvent, plane: TemporalPlaneDefinition) => {
    e.stopPropagation();
    setPlaneToDelete(plane);
    setDeleteConfirmOpen(true);
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (planeToDelete) {
      if (activePlane === planeToDelete.id) {
        onSelectPlane("all");
      }
      deleteTemporalPlane(planeToDelete.id);
      setPlaneToDelete(null);
    }
  };

  return (
    <div className="flex items-center gap-3 shrink-0 relative select-none" ref={dropdownRef}>
      {/* 1. Botón Gatillo con Subrayado Activo y Centrado Vertical */}
      <button
        type="button"
        id="timeline-plane-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 py-1.5 border-b-2 border-t-2 border-t-transparent text-xs font-semibold font-sans transition-all cursor-pointer"
        style={{
          borderBottomColor: isOpen || activePlane !== "all" ? "var(--text-main)" : "transparent",
          color: "var(--text-main)",
        }}
        title="Filtrar acontecimientos por plano temporal"
      >
        {activePlane === "all" ? (
          <Hourglass className="w-4 h-4 text-[var(--accent)] shrink-0 transition-colors" />
        ) : (
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs transition-colors"
            style={{ backgroundColor: activePlaneObj?.color || "var(--accent)" }}
          />
        )}
        <span className="truncate max-w-[130px] sm:max-w-[180px]">{activeLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180 opacity-100" : ""
          }`}
        />
      </button>

      {/* 2. Botón + Plano al lado */}
      <button
        type="button"
        id="timeline-add-plane-btn"
        onClick={handleOpenCreate}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shrink-0 font-sans"
        title="Crear nuevo plano temporal"
      >
        <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Plano</span>
      </button>

      {/* 3. Menú Desplegable Flotante que abarca todo el ancho */}
      {isOpen && (
        <div
          id="timeline-plane-menu"
          className="absolute left-0 top-full mt-2 z-50 w-64 sm:w-72 rounded-2xl p-1.5 shadow-2xl border bg-[var(--bg-card)] border-[var(--border-color)]/70 text-[var(--text-main)] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="w-full space-y-0.5 max-h-64 overflow-y-auto custom-scroll">
            {/* Opción 'Todos' con el MISMO diseño y estructura que las demás */}
            <div
              onClick={() => {
                onSelectPlane("all");
                setIsOpen(false);
              }}
              className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                activePlane === "all"
                  ? "bg-[var(--bg-surface-active)] font-semibold text-[var(--text-main)]"
                  : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Hourglass className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105 text-[var(--accent)]" />
                <span className="truncate font-sans text-xs">Todos</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-70 ml-1">
                  ({events.length})
                </span>
              </div>
            </div>

            {/* Lista de Planos Temporales */}
            {temporalPlanes.map((plane) => {
              const isSelected = activePlane === plane.id;
              const count = countByPlane(plane.id);

              return (
                <div
                  key={plane.id}
                  onClick={() => {
                    onSelectPlane(plane.id);
                    setIsOpen(false);
                  }}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--bg-surface-active)] font-semibold text-[var(--text-main)]"
                      : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]"
                  }`}
                >
                  {/* Círculo de color, Nombre y Conteo */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: plane.color }}
                    />
                    <span className="truncate font-sans text-xs">
                      {plane.name}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-70 ml-1">
                      ({count})
                    </span>
                  </div>

                  {/* Acciones en hover: Papelera e Icono de Ajustes */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleRequestDelete(e, plane)}
                      className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                      title={`Eliminar plano "${plane.name}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(e, plane)}
                      className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                      title={`Editar plano "${plane.name}"`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Creación / Edición */}
      <TimelinePlaneModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingPlane={editingPlane}
      />

      {/* Modal de Confirmación de Borrado */}
      <TimelinePlaneDeleteModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        plane={planeToDelete}
        eventCount={planeToDelete ? countByPlane(planeToDelete.id) : 0}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
