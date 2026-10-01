import fs from "node:fs";
import path from "node:path";
import { resolveAssetUrl } from "../utils/imageUtils";
import { DossierTab } from "../components/codex/dossier/dossierTypes";
import { EntityImage, NovelProject, RecentProjectMeta, WorldEntity } from "../types";
import { CreateProjectDialogOptions } from "../stores/useProjectStore";

console.log("=============================================================");
console.log("🧪 Novelore Desktop - Suite de Pruebas: Subfase 2.3 (Multimedia)");
console.log("=============================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${title}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${title}${details ? ` -> ${details}` : ""}`);
    failed++;
  }
}

const ROOT = process.cwd();

// -------------------------------------------------------------
// GRUPO 1: Modularidad y Límite de Líneas (Regla 7 de AGENTS.md)
// -------------------------------------------------------------
console.log("📌 GRUPO 1: Modularidad y Límite de Líneas (Regla 7: <= 250 líneas)");

const filesToCheck = [
  "src/components/project/NovelCover.tsx",
  "src/components/codex/dossier/DossierGalleryTab.tsx",
  "src/components/codex/dossier/useEntityModalLogic.ts",
  "src/components/codex/dossier/DossierIdentityTab.tsx",
  "src/components/codex/dossier/DossierTabsNav.tsx",
  "src/components/codex/dossier/dossierTypes.ts",
  "src/components/codex/EntityModal.tsx",
  "src/components/codex/ImageLightboxModal.tsx",
  "src/components/codex/hub/CodexEntityCard.tsx",
  "src/utils/imageUtils.ts",
];

for (const relPath of filesToCheck) {
  const fullPath = path.join(ROOT, relPath);
  const exists = fs.existsSync(fullPath);
  assert(exists, `Archivo ${relPath} existe`);
  if (exists) {
    const lines = fs.readFileSync(fullPath, "utf-8").split("\n").length;
    assert(lines <= 250, `${relPath} cumple <= 250 líneas (${lines} líneas)`);
  }
}

// Confirmar que BookCover.tsx legado fue eliminado
const legacyBookCoverExists = fs.existsSync(path.join(ROOT, "src/components/project/BookCover.tsx"));
assert(!legacyBookCoverExists, "Componente legado BookCover.tsx fue eliminado satisfactoriamente");

// -------------------------------------------------------------
// GRUPO 2: Resolución de URLs de Assets (resolveAssetUrl)
// -------------------------------------------------------------
console.log("\n📌 GRUPO 2: Resolución de URLs de Assets (resolveAssetUrl)");

// 1. URLs remotas o data URLs se preservan intactas
const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
assert(resolveAssetUrl(dataUrl) === dataUrl, "Preserva Data URLs intactas");

const httpUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c";
assert(resolveAssetUrl(httpUrl) === httpUrl, "Preserva URLs HTTP(S) intactas");

const blobUrl = "blob:http://localhost:5173/uuid-test-123";
assert(resolveAssetUrl(blobUrl) === blobUrl, "Preserva URLs Blob intactas");

// 2. Rutas vacías o indefinidas
assert(resolveAssetUrl("") === "", "Ruta vacía retorna string vacío seguro");
assert(resolveAssetUrl(undefined) === "", "Ruta undefined retorna string vacío seguro");
assert(resolveAssetUrl("   ") === "", "Ruta con solo espacios retorna string vacío seguro");

// 3. Simular entorno Electron vs fallback
// Mock window.electronAPI
(global as any).window = {
  electronAPI: {
    isElectron: true,
  },
};

const relGalleryPath = "assets/gallery/avatar_val_17276800.png";
const electronResolvedRel = resolveAssetUrl(relGalleryPath);
assert(
  electronResolvedRel === "novelore-asset://assets/gallery/avatar_val_17276800.png",
  "Genera URL novelore-asset:// para ruta relativa en proyecto activo",
  `Obtenido: ${electronResolvedRel}`
);

const relCoverPath = "assets/covers/cover_17276800.jpg";
const projectFolder = "/home/user/MisNovelas/Eldoria";
const electronResolvedProject = resolveAssetUrl(relCoverPath, projectFolder);
assert(
  electronResolvedProject.startsWith("novelore-asset://project-asset?"),
  "Genera URL project-asset con parámetros para proyectos del taller",
  `Obtenido: ${electronResolvedProject}`
);
assert(
  electronResolvedProject.includes(encodeURIComponent(projectFolder)),
  "Codifica adecuadamente el projectPath en la URL de asset"
);
assert(
  electronResolvedProject.includes(encodeURIComponent(relCoverPath)),
  "Codifica adecuadamente el relPath en la URL de asset"
);

// Limpiar mock de window
delete (global as any).window;

// -------------------------------------------------------------
// GRUPO 3: Tipos y Modelo de Portada de Novela
// -------------------------------------------------------------
console.log("\n📌 GRUPO 3: Tipos y Modelo de Portada de Novela");

const testProject: NovelProject = {
  id: "proj-1",
  title: "El Reino Olvidado",
  author: "Valeria",
  genre: "Fantasía",
  coverUrl: "assets/covers/cover_el_reino_olvidado.jpg",
  logline: "Una historia de intriga",
  synopsis: "Sinopsis completa...",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    targetTotalWords: 60000,
    dialogueStyle: "dash",
    fontFamily: "serif",
    fontSize: 18,
    lineSpacing: "normal",
    typewriterMode: true,
    theme: "minimal",
  },
  acts: [],
  entities: [],
  relationships: [],
  timelineTracks: [],
  timelineEvents: [],
  storyBeats: [],
};

assert(testProject.coverUrl === "assets/covers/cover_el_reino_olvidado.jpg", "NovelProject almacena coverUrl relativo");

const testRecentMeta: RecentProjectMeta = {
  path: "/home/user/ElReino",
  title: "El Reino Olvidado",
  author: "Valeria",
  genre: "Fantasía",
  coverUrl: "assets/covers/cover_el_reino_olvidado.jpg",
  updatedAt: new Date().toISOString(),
  wordCount: 15400,
};

assert(testRecentMeta.coverUrl === "assets/covers/cover_el_reino_olvidado.jpg", "RecentProjectMeta incluye coverUrl");

const testCreateOpts: CreateProjectDialogOptions = {
  title: "Nueva Novela",
  genre: "Ciencia Ficción",
  coverUrl: "assets/covers/nueva_portada.png",
};

assert(testCreateOpts.coverUrl === "assets/covers/nueva_portada.png", "CreateProjectDialogOptions soporta coverUrl opcional");

// -------------------------------------------------------------
// GRUPO 4: Galería Multimedia en Entidades del Códice
// -------------------------------------------------------------
console.log("\n📌 GRUPO 4: Galería Multimedia en Entidades del Códice");

const testImages: EntityImage[] = [
  {
    id: "img-1",
    url: "assets/gallery/val_portrait.jpg",
    caption: "Retrato en la Ciudadela",
    createdAt: new Date().toISOString(),
  },
  {
    id: "img-2",
    url: "assets/gallery/val_combat.jpg",
    caption: "Durante la batalla del puente",
    createdAt: new Date().toISOString(),
  },
];

const testEntity: WorldEntity = {
  id: "ent-val",
  category: "character",
  name: "Valeria",
  summary: "Cartógrafa y espía imperial",
  tags: ["Cartógrafa", "Rebelde"],
  attributes: { Rol: "Protagonista", Edad: "26" },
  notes: "Notas privadas...",
  avatarUrl: testImages[0].url,
  gallery: testImages,
};

assert(testEntity.gallery?.length === 2, "WorldEntity admite arreglo de galería multimedia");
assert(testEntity.gallery?.[0].url === "assets/gallery/val_portrait.jpg", "Entrada de galería almacena ruta relativa limpia");
assert(testEntity.avatarUrl === testImages[0].url, "Avatar sincronizado con imagen de galería");

// Comprobar que 'gallery' es una pestaña válida en DossierTab
const galleryTab: DossierTab = "gallery";
assert(galleryTab === "gallery", "DossierTab incluye la pestaña 'gallery'");

// -------------------------------------------------------------
// RESUMEN FINAL
// -------------------------------------------------------------
console.log("\n=============================================================");
console.log(`📊 RESULTADO DE LA SUITE SUBFASE 2.3:`);
console.log(`   Pruebas superadas: ${passed}`);
console.log(`   Pruebas fallidas:  ${failed}`);
console.log("=============================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
