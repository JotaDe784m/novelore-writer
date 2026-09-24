import { useRef, useEffect, useCallback } from "react";
import { NovelProject } from "../../types";

export function useCustomFonts(
  project: NovelProject,
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void,
  showToast: (msg: string) => void
) {
  const customFontInputRef = useRef<HTMLInputElement>(null);

  const injectCustomFontFace = useCallback((fontName: string, base64Data: string) => {
    try {
      const existing = document.getElementById("novelore-custom-font-face");
      if (existing) {
        existing.remove();
      }
      const style = document.createElement("style");
      style.id = "novelore-custom-font-face";
      style.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url('${base64Data}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(style);
    } catch (e) {
      console.error("Error al inyectar @font-face de fuente personalizada:", e);
    }
  }, []);

  useEffect(() => {
    if (project.settings.customFontData && project.settings.customFontName) {
      injectCustomFontFace(project.settings.customFontName, project.settings.customFontData);
    }
  }, [project.settings.customFontData, project.settings.customFontName, injectCustomFontFace]);

  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      showToast("Formato de fuente no soportado. Usa .ttf, .otf, .woff o .woff2");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const customFontFamily = `Custom_${cleanName.replace(/[^a-zA-Z0-9]/g, "_")}`;
        injectCustomFontFace(customFontFamily, base64);
        onUpdateProjectSettings({
          fontFamily: "custom",
          customFontName: customFontFamily,
          customFontData: base64,
        });
        showToast(`Fuente "${cleanName}" cargada correctamente`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveCustomFont = () => {
    const existing = document.getElementById("novelore-custom-font-face");
    if (existing) existing.remove();
    onUpdateProjectSettings({
      fontFamily: "serif",
      customFontName: undefined,
      customFontData: undefined,
    });
    showToast("Fuente personalizada eliminada");
  };

  return {
    customFontInputRef,
    handleCustomFontUpload,
    handleRemoveCustomFont,
  };
}

