import React, { useState, useEffect } from "react";
import { Camera, Crop, Trash2, Calendar } from "lucide-react";
import { resolveAssetUrl } from "../../../../utils/imageUtils";

interface EventAvatarCardProps {
  avatarUrl: string;
  title: string;
  color: string;
  onUploadAvatarClick: () => void;
  onRemoveAvatar: () => void;
  onOpenCropModal?: () => void;
}

export const EventAvatarCard: React.FC<EventAvatarCardProps> = ({
  avatarUrl,
  title,
  color,
  onUploadAvatarClick,
  onRemoveAvatar,
  onOpenCropModal,
}) => {
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => setAvatarError(false), [avatarUrl]);

  return (
    <div className="relative group shrink-0">
      <div
        className="w-40 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden flex items-center justify-center shadow-xs relative bg-[var(--bg-card)] border-2 transition-all"
        style={{ borderColor: color }}
      >
        {avatarUrl && !avatarError ? (
          <img
            src={resolveAssetUrl(avatarUrl)}
            alt={title || "Acontecimiento"}
            onError={() => setAvatarError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-white p-3 text-center"
            style={{ backgroundColor: color }}
          >
            <Calendar className="w-12 h-12 sm:w-14 sm:h-14 opacity-90 mb-1.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
              {avatarError ? "No hallada" : "Sin foto"}
            </span>
          </div>
        )}

        {avatarUrl && !avatarError ? (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-2 text-white transition-opacity">
            {onOpenCropModal && (
              <button
                type="button"
                onClick={onOpenCropModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors cursor-pointer border-none"
                title="Ajustar encuadre (3:4)"
              >
                <Crop className="w-3.5 h-3.5 text-amber-300" />
                <span>Encuadre</span>
              </button>
            )}
            <button
              type="button"
              onClick={onUploadAvatarClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors cursor-pointer border-none"
              title="Cambiar foto de acontecimiento"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
              <span>Cambiar</span>
            </button>
            <button
              type="button"
              onClick={onRemoveAvatar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-colors cursor-pointer border-none"
              title="Quitar foto de acontecimiento"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onUploadAvatarClick}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white transition-opacity cursor-pointer border-none"
            title="Subir foto de acontecimiento"
          >
            <Camera className="w-6 h-6 text-amber-300" />
            <span className="text-xs font-bold">Subir foto</span>
          </button>
        )}
      </div>
    </div>
  );
};
