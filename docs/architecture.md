# Architecture — Novelore Desktop (Local-First)

Este documento describe la arquitectura real y estandarizada de **Novelore**, especificando los límites de dominio, el manejo reactivo del estado, el puente de comunicación de escritorio y el modelo de persistencia física en disco.

---

## 1. Visión General de la Arquitectura

Novelore es una aplicación de escritorio **local-first** construida con Electron y React 19, donde el proyecto del autor es una **carpeta física en el sistema de archivos del usuario**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Capa de Presentación (React 19)                      │
│   ├── Editor de Manuscrito (Rich Text, Diálogos RAE, Modo Zen)         │
│   ├── Planificación (Línea de Tiempo, Corcho, Story Beats, Matriz)     │
│   ├── Códice del Mundo (Dossiers, Atributos, Galería, Menciones)       │
│   ├── Grafo de Relaciones (Nodos interactivos y Curvas Bezier)         │
│   ├── Pizarras Visuales (Lienzo Infinito, Notas, Conectores, Embeds)   │
│   └── Motor Editorial (Visor en Pliegos, Plantillas, Exportador DOCX)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Hooks reactivos
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Capa de Estado y Dominio (Zustand Stores)                 │
│   ├── ProjectStore: Metadatos de la novela, ajustes y temas            │
│   ├── ManuscriptStore: Árbol de actos/capítulos y buffer de escena     │
│   ├── CodexStore: Entidades del mundo, atributos y relaciones          │
│   ├── PlanningStore: Pistas cronológicas, eventos temporales y beats   │
│   └── BoardStore: Elementos del lienzo visual y pizarras dedicadas     │
│                                                                        │
│   Estrategia de guardado: Granular Debounce (500 ms tras teclear)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ API expuesta por preload (contextBridge)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Puente de Comunicación IPC (Electron)                    │
│   ├── electronAPI.project: createProject, openProject, loadProject     │
│   ├── electronAPI.fs: readSceneMarkdown, writeSceneMarkdown, saveJson  │
│   ├── electronAPI.assets: copyAssetToProject, resolveAssetPath         │
│   └── electronAPI.dialog: showOpenFolderDialog, showSaveDialog         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Node.js File System (node:fs/promises)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Persistencia en Disco (Carpeta del Proyecto)                │
│                                                                        │
│   MiNovela/                                                            │
│   ├── project.json              # Configuración y metadatos            │
│   ├── manuscript.json           # Estructura jerárquica y fichas       │
│   ├── codex.json                # Entidades y relaciones               │
│   ├── planning.json             # Líneas de tiempo y beats             │
│   ├── boards/                   # Pizarras visuales (JSON)             │
│   ├── manuscript/               # Prosa limpia en archivos .md         │
│   │   └── act-1/chap-1/scene-1.md                                      │
│   └── assets/                   # Medios físicos (imágenes, fuentes)   │
│       ├── covers/, gallery/, fonts/, documents/                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Datos y Ciclo de Vida

1. **Apertura / Creación**:
   - El autor selecciona una carpeta existente o una nueva ubicación mediante el diálogo nativo del sistema operativo gestionado por Electron (`dialog.showOpenDialog`).
   - El proceso principal valida la estructura, inicializa las carpetas ausentes si es un proyecto nuevo y lee los archivos de metadatos (`project.json`, `manuscript.json`, etc.).
   - Los datos se transfieren al renderizador mediante IPC y pueblan los almacenes de **Zustand**.

2. **Edición Activa & Guardado Desacoplado**:
   - Al redactar en el editor de manuscrito, el componente actualiza el texto en memoria en el `ManuscriptStore`.
   - Un temporizador con *debounce* de 500 ms programa la escritura física en disco únicamente para el archivo `.md` de la escena activa.
   - Si se edita una ficha del Códice, solo se serializa y escribe `codex.json`.
   - Esto desacopla completamente el rendimiento de la aplicación del tamaño global de la novela: escribir en un capítulo no reescribe la biblia de personajes ni recalcula las pizarras.

3. **Escritura Segura y Protección contra Corrupción**:
   - Toda escritura en disco se ejecuta de forma atómica: se escribe primero en un archivo temporal (`.tmp`) y se renombra inmediatamente al archivo de destino para garantizar que un corte de energía o cierre abrupto nunca corrompa el texto.

---

## 3. Estructura Física del Proyecto en Disco

La carpeta del proyecto está diseñada para ser completamente legible y portable:

```text
MiNovela/
├── project.json
│   Metadatos generales: título, subtítulo, autor, género, logline, sinopsis,
│   metas globales de palabras, tema visual, configuración de tipografía.
│
├── manuscript.json
│   Estructura jerárquica de Actos y Capítulos, orden de escenas y metadatos
│   narrativos del Inspector (POV, objetivo dramático, conflicto, resultado,
│   palabras objetivo y estado: idea, borrador, revisión, pulido, final).
│
├── codex.json
│   Lista de WorldEntity (personajes, lugares, facciones, objetos, conceptos, eventos),
│   sus atributos personalizados, etiquetas, alias y el catálogo de relaciones.
│
├── planning.json
│   Pistas de la línea de tiempo (tracks), eventos cronológicos con niveles de
│   importancia y plantillas de Story Beats con sus porcentajes y asignaciones.
│
├── boards/
│   ├── main.json             # Lienzo visual general de la novela.
│   └── entities/             # Pizarras conceptuales dedicadas por entidad.
│
├── manuscript/
│   Archivos de texto plano Markdown (.md) puros que contienen exclusivamente
│   la prosa redactada por el autor, ordenados en subcarpetas por acto y capítulo:
│   └── act-1/
│       ├── chapter-1/
│       │   ├── esc-01-el-despertar.md
│       │   └── esc-02-la-emboscada.md
│       └── chapter-2/
│           └── esc-01-la-revelacion.md
│
└── assets/
    Subdirectorios para recursos multimedia físicos copiados automáticamente:
    ├── covers/               # Portadas del libro
    ├── gallery/              # Fotos de perfil y galerías del Códice
    ├── fonts/                # Fuentes personalizadas (.ttf, .otf, .woff)
    └── documents/            # Archivos PDF y documentos adjuntos
```

---

## 4. Sincronización en la Nube con Cuentas Personales

Novelore no opera servidores en la nube centralizados. La sincronización se articula en dos niveles:

1. **Sincronización a Nivel de Sistema de Archivos (Pasiva)**:
   - Dado que el proyecto es una carpeta estándar con archivos `.md` atómicos, el usuario puede situar su proyecto dentro de una carpeta gestionada por sus propios clientes de escritorio: **Google Drive, Dropbox, Microsoft OneDrive, Syncthing o Git**.
   - Los clientes de nube sincronizan automáticamente cada archivo modificado en segundo plano en cuestión de milisegundos.

2. **Integración con Servicios Externos (Activa / En el Programa)**:
   - En fases posteriores del roadmap se incorporarán conectores directos dentro de la aplicación para enlazar proyectos con APIs de almacenamiento (Google Drive, Dropbox, OneDrive/Outlook) administradas directamente por el usuario con sus credenciales personales (OAuth de escritorio).

---

## 5. Módulos del Sistema y Capa de Presentación

* **`src/components/editor/`**:
  - `RichTextEditor.tsx`: Redacción sin distracciones, tipografía personalizable, typewriter scrolling, inserción de guion largo `—`, comillas latinas `« »` y formateador de diálogos según reglas RAE.
  - `ManuscriptSidebar.tsx`: Árbol jerárquico de actos, capítulos y escenas con reordenación y contadores.
  - `SceneInspector.tsx`: Ficha dramática (Objetivo, Conflicto, Resultado), asignación de POV, personajes presentes, vinculación con el Códice y metas individuales de palabras.

* **`src/components/codex/`**:
  - `WorldbuildingHub.tsx`: Directorio categorizado (Personajes, Lugares, Facciones, Objetos, Conceptos, Eventos) con filtrado y búsqueda.
  - `EntityModal.tsx`: Dossier completo con atributos dinámicos, galería visual local, alias de nombres y contador de menciones en los `.md` del manuscrito.
  - `RelationshipMapView.tsx`: Grafo visual interactivo con nodos arrastrables y curvas Bezier con puntos de control manuales.

* **`src/components/planning/`**:
  - `TimelineView.tsx`: Cronología multilínea con pistas paralelas, filtros temporales (presente vs. lore histórico) y vinculación directa con escenas.
  - `CorkboardView.tsx`: Tablero de corcho con tarjetas de escena estilo Scrivener.
  - `StoryArcView.tsx`: Plantillas dramáticas clásicas (Tres Actos, Save the Cat!, Viaje del Héroe).
  - `OutlineGridView.tsx`: Matriz tabular de resumen del manuscrito.

* **`src/components/board/`**:
  - `VisualBoardView.tsx`: Pizarra infinita con notas adhesivas, bloques de texto con tipografías literarias, formas geométricas, flechas y conectores direccionales, reproductores de Spotify/YouTube y lector de PDFs local.

* **`src/components/export/`**:
  - `ExportPageView.tsx`: Previsualizador de libro impreso en pliegos de dos páginas (*spreads*), plantillas editoriales (Manuscrito Shunn, Novela Clásica de Bolsillo en Garamond, Letra Capitular) y motor de exportación a Word (`.docx`), Markdown (`.md`) y texto plano (`.txt`).
