import React from "react";
import { User, MapPin, ExternalLink } from "lucide-react";
import { Scene, NovelProject } from "../../../types";

interface InspectorEntitiesProps {
  scene: Scene;
  project: NovelProject;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onOpenEntityDossier?: (entityId: string) => void;
}

export const InspectorEntities: React.FC<InspectorEntitiesProps> = ({
  scene,
  project,
  onUpdateScene,
  onOpenEntityDossier,
}) => {
  const characters = project.entities.filter((e) => e.category === "character");
  const locations = project.entities.filter((e) => e.category === "location");

  const isSpecialPov = scene.povCharacterId === "omniscient" || scene.povCharacterId === "coral";
  const povCharacter = !isSpecialPov ? characters.find((c) => c.id === scene.povCharacterId) : undefined;
  const currentLocation = locations.find((l) => l.id === scene.locationId);

  return (
    <div className="space-y-3">
      {/* Personaje Punto de Vista (POV) */}
      <div
        className="p-3 rounded-xl space-y-1.5 transition-colors"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Punto de Vista (POV)
            </label>
          </div>
          {povCharacter && onOpenEntityDossier && (
            <button
              type="button"
              onClick={() => onOpenEntityDossier(povCharacter.id)}
              className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              title="Abrir ficha del personaje"
            >
              <span>Ver ficha</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <select
          value={scene.povCharacterId || ""}
          onChange={(e) => onUpdateScene(scene.id, { povCharacterId: e.target.value || undefined })}
          style={{ backgroundColor: "var(--bg-editor)", color: "var(--text-primary)" }}
          className="w-full p-2 rounded-lg text-xs bg-[var(--bg-editor)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer border border-[var(--border-subtle)]"
        >
          <option value="" className="bg-[var(--bg-editor)] text-[var(--text-primary)]">
            (Sin asignar / Seleccionar perspectiva)
          </option>
          <option value="omniscient" className="bg-[var(--bg-editor)] text-[var(--text-primary)]">
            👁️ Narrador Omnisciente
          </option>
          <option value="coral" className="bg-[var(--bg-editor)] text-[var(--text-primary)]">
            👥 Sin POV / Coral
          </option>
          {characters.length > 0 && (
            <optgroup label="Personajes del Códice" className="bg-[var(--bg-editor)] text-[var(--text-primary)] font-semibold">
              {characters.map((char) => (
                <option key={char.id} value={char.id} className="bg-[var(--bg-editor)] text-[var(--text-primary)]">
                  {char.name} {char.subtitle ? `— ${char.subtitle}` : ""}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Ubicación / Escenario */}
      <div
        className="p-3 rounded-xl space-y-1.5 transition-colors"
        style={{ backgroundColor: "var(--bg-editor)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Escenario / Ubicación
            </label>
          </div>
          {currentLocation && onOpenEntityDossier && (
            <button
              type="button"
              onClick={() => onOpenEntityDossier(currentLocation.id)}
              className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              title="Abrir ficha de la ubicación"
            >
              <span>Ver ficha</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <select
          value={scene.locationId || ""}
          onChange={(e) => onUpdateScene(scene.id, { locationId: e.target.value || undefined })}
          style={{ backgroundColor: "var(--bg-editor)", color: "var(--text-primary)" }}
          className="w-full p-2 rounded-lg text-xs bg-[var(--bg-editor)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer border border-[var(--border-subtle)]"
        >
          <option value="" className="bg-[var(--bg-editor)] text-[var(--text-primary)]">
            (Sin asignar / Escenario indeterminado)
          </option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id} className="bg-[var(--bg-editor)] text-[var(--text-primary)]">
              {loc.name} {loc.subtitle ? `— ${loc.subtitle}` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
