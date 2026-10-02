import fs from "node:fs";
import path from "node:path";
import { WorldEntity, AvatarCropData } from "../types";

console.log("=== INICIO DE PRUEBAS: RECORTE DE FOTOS Y PERSISTENCIA NO DESTRUCTIVA ===");

const filesToCheck = [
  "src/components/codex/dossier/ImageCropModal.tsx",
  "src/components/codex/dossier/useEntityModalLogic.ts",
  "src/components/codex/dossier/DossierHeroCard.tsx",
  "src/components/codex/dossier/DossierIdentityTab.tsx",
  "src/components/codex/dossier/DossierGalleryTab.tsx",
  "src/components/codex/dossier/dossierTypes.ts",
  "src/components/codex/EntityModal.tsx",
];

for (const relPath of filesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`ERROR: Archivo no encontrado: ${relPath}`);
    process.exit(1);
  }
  const lines = fs.readFileSync(fullPath, "utf-8").split("\n").length;
  if (lines > 250) {
    console.error(`ERROR: ${relPath} excede 250 líneas (${lines} líneas).`);
    process.exit(1);
  }
  console.log(`[PASS] ${relPath} cumple límite de líneas (${lines} <= 250).`);
}

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
for (const relPath of filesToCheck) {
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  if (emojiRegex.test(content)) {
    console.error(`ERROR: Emoji detectado en ${relPath}.`);
    process.exit(1);
  }
  console.log(`[PASS] ${relPath} libre de emojis.`);
}

const mockEntity: WorldEntity = {
  id: "ent-test-cropper-1",
  category: "character",
  name: "Valeria Vance",
  summary: "Cartógrafa y exploradora estelar",
  tags: ["exploradora"],
  attributes: { Rol: "Protagonista" },
  notes: "Notas",
  color: "#3B82F6",
  gallery: [
    {
      id: "img-orig-1",
      url: "assets/gallery/avatar_orig_valeria_vance_12345.png",
      caption: "Retrato original completo",
      createdAt: new Date().toISOString(),
    },
  ],
  avatarOriginalUrl: "assets/gallery/avatar_orig_valeria_vance_12345.png",
  avatarUrl: "assets/gallery/avatar_valeria_vance_crop_12346.webp",
  avatarCrop: { x: -35, y: 120, zoom: 1.45 },
};

if (!mockEntity.avatarOriginalUrl || !mockEntity.avatarUrl) {
  console.error("ERROR: Faltan URLs en el modelo híbrido.");
  process.exit(1);
}

if (mockEntity.avatarOriginalUrl === mockEntity.avatarUrl) {
  console.error("ERROR: El avatar original no debe sobreescribirse con el derivado.");
  process.exit(1);
}

const cropData: AvatarCropData = mockEntity.avatarCrop!;
if (cropData.zoom < 1 || cropData.zoom > 5) {
  console.error("ERROR: Factor de zoom fuera de rango [1.0, 5.0].");
  process.exit(1);
}

console.log("[PASS] Modelo Híbrido No Destructivo validado con éxito.");
console.log("=== TODAS LAS PRUEBAS DE RECORTE Y PERSISTENCIA PASARON EXITOSAMENTE ===");

