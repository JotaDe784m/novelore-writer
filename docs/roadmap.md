# Novelore — Roadmap Técnico (Local-First Desktop)

Este documento establece la evolución estructurada y modular de **Novelore** como aplicación de escritorio local-first. Cada fase y subfase está diseñada para entregar valor funcional concreto adoptando las directrices del **Sistema de Diseño (docs/design-system.md)** sin generar regresiones en el sistema.

---

## Estado Actual del Proyecto: **FASE 1 (EN PROCESO)**

```text
[FASE 1: NÚCLEO DE ESCRITURA & UI] ──► [FASE 2: CÓDICE] ──► [FASE 3: PLANIFICACIÓN] ──► [FASE 4: PIZARRAS] ──► [FASE 5: MOTOR EDITORIAL]
               ▲
          (EN CURSO)
```

---

## Fase 1: Núcleo de Escritura, Persistencia Local & Sistema de Diseño **[EN CURSO]**
**Objetivo**: Establecer el entorno de escritorio en Electron, implementar el gestor de proyectos en carpetas del sistema de archivos, implantar el nuevo sistema de tokens y temas atmosféricos sin bordes, y habilitar un editor de manuscrito 100% operativo basado en archivos Markdown (`.md`).

### Subfase 1.1: Cascarón de Escritorio Electron & IPC Nativo [COMPLETADA]
- [x] Configurar el proceso principal de Electron (`electron/main.ts`) y el script de precarga segura (`electron/preload.ts`) con `contextBridge`.
- [x] Configurar scripts de ejecución y empaquetado en desarrollo (`npm run dev:electron` / `npm run build:electron`).
- [x] Implementar canales IPC seguros para invocación de diálogos nativos del sistema operativo:
  - `dialog:openFolder`: Seleccionar una carpeta existente en disco.
  - `dialog:createProjectFolder`: Crear una nueva carpeta para una novela en la ruta seleccionada.
  - `project:updateProjectMeta`: Actualizar metadatos del proyecto en disco (`project.json` y `recent-projects.json`).
- [x] Implementar gestor de historial de proyectos recientes en almacenamiento de configuración local (`userData/recent-projects.json`).
- [x] Inicialización de escenas en blanco (`.md`) y soporte para edición de metadatos (título, autor, sinopsis, género, metas) desde el inicio y el editor.

### Subfase 1.2: Tokens de Diseño, Temas Atmosféricos & Store Modular (Zustand) [COMPLETADA]
- [x] Implementar el sistema de tokens semánticos en `src/index.css` (`--bg-app`, `--bg-sidebar`, `--bg-editor`, `--bg-surface-hover`, `--bg-surface-active`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--border-subtle`) eliminando bordes duros por defecto.
- [x] Refactorizar el catálogo de temas como **Atmósferas Visuales** (Claro Editorial, Carbón Nocturno, Pergamino Fantasía, Bosque Brumoso, Medianoche, Noir y complementarios) con acento personalizable e independencia tipográfica.
- [x] Implementar `useThemeStore` con soporte para persistencia dual (global en `localStorage` o exclusiva de novela en `project.json`).
- [x] Implementar `useManuscriptStore` en Zustand desacoplando la jerarquía de actos, capítulos, escenas y selección activa.
- [x] Persistencia atómica de archivos Markdown de escenas (`esc-X.md`) con debounce de 500 ms coordinada desde Zustand.

### Subfase 1.3: Árbol del Manuscrito & Navegación (Estilo Obsidian / Scrivener) [COMPLETADA]
- [x] Rediseñar `ManuscriptSidebar.tsx` bajo las reglas de `docs/design-system.md`:
  - [x] Fondo tonal suave (`--bg-sidebar`) sin líneas divisorias rígidas.
  - [x] Botones fantasma (*ghost buttons*) y colapso total hacia el borde izquierdo con atajo `Ctrl+\` / `Cmd+\`.
  - [x] Ancho redimensionable manualmente con persistencia de dimensiones en preferencias (`localStorage`).
- [x] Conectar operaciones de Actos, Capítulos y Escenas directamente con el sistema de archivos (`manuscript/act-X/chap-Y/esc-Z.md`) y canales IPC nativos (`deleteSceneMarkdown`).
- [x] Conteo de palabras en tiempo real por escena, capítulo y acto.

### Subfase 1.4: Editor Literario & Ergonomía de Lectura (Estilo Ulysses / iA Writer)
- Rediseñar `RichTextEditor.tsx`:
  - Columna de lectura centrada con ancho ergonómico óptimo de **~720px (65-75 caracteres por línea)** y márgenes respirables.
  - Desplazamiento suave de máquina de escribir (*typewriter scrolling*).
  - Modo Foco opcional (resaltado del párrafo activo y atenuación suave del resto).
  - Modo Zen a pantalla completa con desvanecimiento de controles.
- Lectura y guardado de prosa limpia en archivos `.md`.
- Formateador tipográfico avanzado para lengua española:
  - Inserción y reemplazo ágil de la raya de diálogo canónica (`—`).
  - Algoritmo de formateo automático de diálogos según reglas RAE.
  - Inserción de comillas latinas (`« »`) y marcas de corte de escena (`* * *`).
- Pila de historial Deshacer / Rehacer (*Undo/Redo*) con atajos estándar (`Ctrl+Z`, `Ctrl+Y`).

### Subfase 1.5: Inspector de Escenas Básico
- Rediseñar `SceneInspector.tsx` con arquitectura colapsable al 100% hacia el borde derecho (`Ctrl+I` / `Cmd+I`), sin marcos de panel:
  - Triunvirato dramático: Objetivo, Conflicto y Resultado de la escena.
  - Estado de la escena: Idea, Borrador, Revisión, Pulido, Final.
  - Metas individuales de palabras por escena y barra de progreso.

---

## Fase 2: Worldbuilding & Códice Local (Estilo Heptabase) **[PLANIFICADA]**
**Objetivo**: Construir la enciclopedia del universo ficticio integrada con el sistema de archivos local y el texto del manuscrito, con tarjetas fluidas y sin rigidez administrativa.

### Subfase 2.1: Persistencia del Códice (`codex.json`)
- Implementar `useCodexStore` para gestionar las 6 categorías de entidades: Personajes, Lugares, Facciones, Objetos, Conceptos y Eventos Históricos.
- Serialización estructurada y guardado desacoplado en `codex.json`.

### Subfase 2.2: Dossiers y Atributos Dinámicos
- Adaptar `EntityModal.tsx` con estética limpia de tarjeta de conocimiento (sin líneas de tabla densas).
- Plantillas de atributos dinámicos (Rol, Motivación, Miedos, Clima, etc.) y campos personalizados.
- Gestión de etiquetas sutiles, notas de trasfondo y alias/variantes del nombre.

### Subfase 2.3: Gestión Local de Multimedia (`assets/gallery/`)
- Implementar canal IPC para copiar físicamente imágenes locales a `assets/gallery/`.
- Almacenamiento de rutas relativas limpias en las entidades en lugar de Base64.
- Visor *Lightbox* a pantalla completa para las galerías de cada entidad.

### Subfase 2.4: Contador Automático de Menciones en el Manuscrito
- Escaneo asíncrono y reactivo de los archivos `.md` del manuscrito para detectar menciones de nombres y alias.
- Desglose cuantitativo de apariciones por escena, capítulo y acto.

### Subfase 2.5: Grafo Visual de Relaciones
- Adaptar `RelationshipMapView.tsx` con curvas Bezier orgánicas, nodos redondos limpios y sentimientos emocionales.

---

## Fase 3: Planificación Narrativa & Línea Temporal **[PLANIFICADA]**
**Objetivo**: Proporcionar herramientas para el diseño dramático, temporal y rítmico de la historia.

### Subfase 3.1: Persistencia de Planificación (`planning.json`)
- Implementar `usePlanningStore` para persistir pistas cronológicas, eventos temporales y arcos narrativos.

### Subfase 3.2: Línea Temporal Multilínea (Timeline)
- Pistas paralelas configurables (Trama principal, subtramas de personajes, historia previa/lore) con diseño horizontal espaciado.
- Clasificación de eventos por importancia dramática: Menor, Clave, Punto de Giro, Clímax.
- Vinculación bidireccional entre eventos cronológicos y escenas del manuscrito con navegación en 1 clic.

### Subfase 3.3: Tablón de Corcho (Corkboard)
- Visualización de tarjetas de escena organizadas por columnas de actos y capítulos (estilo Scrivener) con elevaciones suaves y sin bordes toscos.
- Edición ágil de sinopsis y reordenación de escenas mediante tarjetas indexables.

### Subfase 3.4: Arcos Narrativos (Story Beats) & Matriz de Esquema
- Plantillas dramáticas clásicas integradas (Estructura en Tres Actos, Save the Cat!, El Viaje del Héroe).
- Guía de porcentajes objetivo en el manuscrito y asignación de escenas para supervisión del ritmo.
- Matriz tabular panorámica tipo hoja de cálculo (`OutlineGridView.tsx`).

---

## Fase 4: Pizarras Visuales & Recursos Locales (Estilo Milanote) **[PLANIFICADA]**
**Objetivo**: Habilitar espacios de diseño espacial infinito para notas, mapas conceptuales e inspiración multimedia.

### Subfase 4.1: Persistencia del Lienzo Infinito (`boards/`)
- Implementar `useBoardStore` para persistir el tablero general en `boards/main.json` y tableros dedicados en `boards/entities/`.
- Motor de zoom, paneo, centrado y ajuste magnético suave a rejilla.

### Subfase 4.2: Herramientas de Dibujo y Composición
- Notas adhesivas con paletas cromáticas tonales sutiles.
- Bloques de texto enriquecido con selección de 10 fuentes literarias.
- Formas geométricas y conectores/flechas direccionales con anclajes magnéticos y curvas fluidas.

### Subfase 4.3: Recursos Multimedia y Documentos Locales
- Reproductores integrados de Spotify y YouTube para ambientación musical y visual.
- Copia física de archivos PDF adjuntos a `assets/documents/`.
- Lector modal integrado de documentos PDF mediante `pdfjs-dist`.

---

## Fase 5: Motor Editorial, Exportación & Sincronización Personal **[PLANIFICADA]**
**Objetivo**: Generar libros maquetados para imprenta, exportar a formatos universales y conectar opcionalmente con almacenamiento en la nube personal del usuario.

### Subfase 5.1: Visor de Libro Impreso (Pliegos)
- Previsualizador en doble página (*spread*) y página simple simulando el libro impreso físico.
- Cálculo de páginas, márgenes interiores/exteriores y encabezados corrientes de pliego.

### Subfase 5.2: Motor de Exportación Editorial DOCX
- Compilación de los archivos `.md` en documentos Microsoft Word (`.docx`) profesionales con estilos nativos.
- Plantillas predefinidas: Manuscrito Estándar Editorial (Shunn), Novela Clásica de Bolsillo (Garamond A5), Literaria con Letra Capitular (*Drop Cap*), Moderno Minimalista.

### Subfase 5.3: Exportación a Formatos Abiertos
- Compilación a archivo Markdown único (`.md`) y texto plano (`.txt`).
- Vista de impresión directa / PDF.

### Subfase 5.4: Conectores Opcionales para Nube Personal
- Implementación de conectores opcionales para enlazar la carpeta del proyecto a cuentas personales del usuario (Google Drive, Dropbox, OneDrive/Outlook) mediante autenticación OAuth local de escritorio.
