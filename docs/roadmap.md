# Novelore — Roadmap Técnico (Local-First Desktop)

Este documento establece la evolución estructurada y modular de **Novelore** como aplicación de escritorio local-first. Cada fase y subfase está diseñada para entregar valor funcional concreto adoptando las directrices del **Sistema de Diseño (docs/design-system.md)** sin generar regresiones en el sistema.

---

## Estado Actual del Proyecto: **REESTRUCTURACIÓN VISUAL & UX INTEGRAL — EN PROCESO**

```text
[FASE 1: ESCRITURA] ──► [FASE 2: CÓDICE] ──► [FASE 3.1: CRONOLOGÍA] ──► [REESTRUCTURACIÓN VISUAL] ──► [PLANIFICACIÓN 3.2-3.4] ──► [PIZARRAS 4] ──► [EDITORIAL 5]
   (COMPLETADA)            (COMPLETADA)            (COMPLETADA)                    ▲ (ACTUAL)
```

---

## Fase de Reestructuración Visual & UX Integral [EN PROCESO]
**Objetivo**: Transformar toda la experiencia de Novelore Desktop bajo la nueva filosofía de diseño: simpleza, espacio respirable, anti-sobreexposición, erradicación de formularios burocráticos innecesarios, proporción 3:4 universal, modo Zen transversal y respeto al ritmo del escritor.

- [x] **Fase 1: Documentación Maestra (`docs/design-system.md` & `docs/roadmap.md`)**: Blindaje de reglas de diseño, tokens, modos inmersivos, proporciones 3:4, taller literario de inicio y arquitectura modular.
- [ ] **Fase 2: Núcleo Visual Global, Barra Superior & Modo Zen Universal**: `UnderlineTabs`, `SectionHelpModal` (proporción 16:9 con placeholder para GIFs), `TopNavigation` modular ($\le 250$ líneas), `SettingsModal`, y estado/hook global de Modo Zen para todas las vistas.
- [ ] **Fase 3: Rediseño de la Página de Inicio (Taller Literario)**: Hero acogedor con novela activa, botón directo "Continuar Escribiendo", ritmo literario humano, atajos cápsula, retratos 3:4 destacados del Códex y taller local modular ($\le 250$ líneas por submódulo).
- [ ] **Fase 4: Rediseño del Códex Hub**: Tarjetas 3:4, búsqueda maestra multi-criterio, exclusión de eventos del filtro de categorías y CRUD completo de categorías personalizadas.
- [ ] **Fase 5: Suite de Dossiers Unificada**: Sustitución de tablas rígidas por bloques visuales de detalles con CRUD (*Añadir detalle*, *Eliminar bloque*, redacción *inline*) y pestaña "Relacionados" agrupada semánticamente.
- [ ] **Fase 6: Planeación & Línea de Tiempo**: Cabecera con tabs apilados, CRUD de planos temporales, tarjetas de eventos y modal unificado con selector híbrido de fechas.
- [ ] **Fase 7: Manuscrito, Editor & Ergonomía Literaria**: Cabecera del editor con Zen y ayuda `?`, árbol de manuscrito limpio e inspector con tarjetas visuales *inline*.
- [ ] **Fase 8: Pizarra & Maquetación (Armonización Estética Ligera)**: Armonización visual de la Pizarra Global Infinita (cabecera con `?` y Zen, tarjetas 3:4 y barra cápsula, preservando todas las funciones ya implementadas) y Maquetación/Compilación (diseño formuláico técnico limpio y botones cápsula de salida, sin adelantar backends futuros).
- [ ] **Fase 9: Mapa de Relaciones & Verificación Final**: Cabecera unificada, filtros discretos de tipos de nodos, inspector con tarjetas 3:4 y suite de verificación integral (`tsc`, `npm test`, `knip`).

---

## Fase 1: Núcleo de Escritura, Persistencia Local & Sistema de Diseño [COMPLETADA]
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

### Subfase 1.4: Editor Literario & Ergonomía de Lectura (Estilo Ulysses / iA Writer) [COMPLETADA]
- [x] Rediseñar `RichTextEditor.tsx` bajo la filosofía de diseño sin marcos (`docs/design-system.md`):
  - [x] Columna de lectura centrada con ancho ergonómico óptimo de **~720px (65-75 caracteres por línea)** y márgenes respirables.
  - [x] Desplazamiento suave de máquina de escribir (*typewriter scrolling*), opción desactivable a demanda (`Alt+T` o botón en barra de herramientas).
  - [x] Modo Foco por párrafo (*focus mode*), opción desactivable a demanda (`Alt+F` o botón en barra de herramientas) con atenuación al 40% de párrafos circundantes.
  - [x] Modo Zen a pantalla completa con desvanecimiento de controles flotantes y atajo `Esc` / `Alt+Z`.
- [x] Lectura y guardado de prosa limpia en archivos `.md` con persistencia incremental.
- [x] Formateador tipográfico avanzado para lengua española:
  - [x] Inserción y reemplazo ágil de la raya de diálogo canónica (`—`, atajo `Ctrl+Shift+M` o `Alt+-`).
  - [x] Sistema de sangría literaria inteligente (`Tab`, `Shift+Tab`, auto-sangría con `Enter` y sangría de 1.ª línea).
  - [x] Inserción de comillas latinas (`« »`) y marcas de corte de escena (`* * *`).
- [x] Pila de historial Deshacer / Rehacer (*Undo/Redo*) con atajos estándar (`Ctrl+Z`, `Ctrl+Y`).
- [x] Barra de herramientas (Ribbon) en fila única fluida con arrastre horizontal (drag-to-scroll), centrado responsivo y menús portaleados sin recortes.

### Subfase 1.5: Inspector de Escenas & Sistema de Notas Dinámicas [COMPLETADA]
- [x] Rediseñar `SceneInspector.tsx` con arquitectura modular (componentes $\le 250$ líneas) y colapsable al 100% hacia el borde derecho (`Ctrl+I` / `Cmd+I`), sin marcos de panel:
  - [x] Sistema de Notas flexible con tarjetas dinámicas y editables (título y contenido) y selector de plantillas (*Dramático*, *Worldbuilding*, *Reacción* y *Libre*).
  - [x] Botón `+ Añadir Nota` disponible en todas las plantillas y en modo libre.
  - [x] Sinopsis narrativa sincronizada en tiempo real con las vistas de planeación (Tablero de Corcho y Esquema).
  - [x] Selector de Punto de Vista (POV) con soporte para Narrador Omnisciente, Sin POV / Coral y entidades del Códice con contraste optimizado en tema oscuro.
  - [x] Estado de la escena con chips visuales: Idea, Borrador, Revisión, Pulido, Final.
  - [x] Metas individuales de palabras por escena, barra de progreso y cálculo de tiempo de lectura.

---

## Fase 2: Worldbuilding & Códice Local (Estilo Heptabase) [COMPLETADA]
**Objetivo**: Construir la enciclopedia del universo ficticio integrada con el sistema de archivos local y el texto del manuscrito, con tarjetas fluidas y sin rigidez administrativa.

### Subfase 2.1: Persistencia del Códice (`codex.json`) [COMPLETADA]
- [x] Implementar `useCodexStore` para gestionar las 7 categorías de entidades: Personajes, Lugares, Facciones, Objetos, Conceptos, Eventos Históricos y Libre / General (`other`).
- [x] Serialización estructurada y guardado desacoplado atómico en `codex.json` con canales IPC dedicados (`fs:saveCodex` y `fs:readCodex`).
- [x] Arquitectura modular de componentes ($\le 250$ líneas) dividida en `src/components/codex/hub/` (`CodexHeader`, `CodexFilterBar`, `CodexEntityCard`, `CodexEmptyState`).
- [x] Campos de atributos expandibles verticalmente hacia abajo en tarjetas y modal para lectura completa de textos largos.

### Subfase 2.2: Dossiers y Atributos Dinámicos [COMPLETADA]
- [x] Adaptar `EntityModal.tsx` con estética limpia de tarjeta de conocimiento (sin líneas de tabla densas).
- [x] Plantillas de atributos dinámicos (Rol, Motivación, Miedos, Clima, etc.) y campos personalizados.
- [x] Gestión de etiquetas sutiles, notas de trasfondo y alias/variantes del nombre con contador de menciones en tiempo real.
- [x] Arquitectura modular de componentes ($\le 250$ líneas) dividida en `src/components/codex/dossier/` (`EntityModalHeader`, `DossierTabsNav`, `DossierIdentityTab`, `DossierAttributesTab`, `DossierMentionsTab`, `DossierEventLoreTab`, `DossierNotesTab`, `DossierColorPicker`).

### Subfase 2.3: Gestión Local de Multimedia (`assets/gallery/` y `assets/covers/`) [COMPLETADA]
- [x] Implementar canales IPC (`assets:saveImage`, `assets:deleteImage`) para copiar físicamente imágenes locales a `assets/gallery/` y `assets/covers/`.
- [x] Protocolo nativo de Electron `novelore-asset://` para streaming seguro y de alto rendimiento de assets en etiquetas `<img>`.
- [x] Almacenamiento de rutas relativas limpias en las entidades y metadatos de proyecto en lugar de Base64.
- [x] Pestaña modular de galería en el dossier del Códice (`DossierGalleryTab.tsx`) con arrastrar y soltar, subida múltiple, edición en línea de pies de foto y asignación de avatar.
- [x] Visor *Lightbox* a pantalla completa (`ImageLightboxModal.tsx`) para las galerías de cada entidad con navegación por teclado.
- [x] Componente moderno de portada de libro (`NovelCover.tsx`) con 8 estilos tipográficos por género y almacenamiento local en `HomeDashboard.tsx` (tarjetas, creación y edición).

### Subfase 2.4: Contador Automático de Menciones en el Manuscrito [COMPLETADA]
- [x] Motor de conteo optimizado (`mentionCounter.ts`, `mentionTypes.ts`, `mentionHierarchy.ts`) con caché por longitud de escena (`sceneTextCache`) y expresiones regulares Unicode compatibles con acentos y límites de palabra en español.
- [x] Desglose cuantitativo y porcentual jerárquico por Actos, Capítulos y Escenas con cálculo de presencia global en la novela.
- [x] Extracción contextual de citas (`snippets`) colapsadas por defecto con botón interactivo de despliegue ("Ver citas" / "Ocultar citas") para una interfaz limpia y respirable.
- [x] Navegación directa en 1 clic desde las tarjetas de mención (`MentionsSceneCard.tsx`) hacia el editor de manuscrito seleccionando la escena automáticamente.
- [x] Visualizador de distribución de ritmo narrativo por actos (`MentionsActBreakdown.tsx`) con barra porcentual tonal y acordeón plegable.
- [x] Criterio de ordenación y filtrado rápido en el Códice para entidades sin menciones aún en el manuscrito (`unmentioned` en `CodexFilterBar.tsx`).

### Subfase 2.5: Grafo Visual de Relaciones [COMPLETADA]
- [x] Persistencia atómica integrada en `codex.json` con canales IPC (`fs:saveCodex`, `fs:readCodex`) para almacenar entidades, relaciones, curvaturas personalizadas (`controlPoint`) y posiciones 2D (`relationshipPositions`).
- [x] Refactorización modular completa de `RelationshipMapView.tsx` (de 1.218 líneas a submódulos de $\le 250$ líneas) dividida en `src/components/codex/relations/`.
- [x] Curvas Bezier cuadráticas fluidas (`graphGeometry.ts`) con separación armónica automática entre múltiples enlaces del mismo par de entidades.
- [x] Nodos circulares orgánicos con avatares, anillos de acento y colores semánticos por categoría (`RelationshipNodesLayer.tsx`).
- [x] Categorización flexible con arquetipos base y creación ilimitada de categorías personalizadas por el autor (`RelationshipCategorySelector.tsx`, `useCodexStore.ts`), permitiendo configurar nombre, color personalizado y estilos de línea de enlace (`solid` / continua, `dashed` / discontinua, `dotted` / punteada) aplicables a cualquier tipo de entidad (personajes, lugares, facciones, magia).
- [x] Insignias interactivas arrastrables para arquear enlaces manualmente y evitar cruces visuales en redes densas (`RelationshipLinksLayer.tsx`).
- [x] Inspector lateral deslizable (`RelationshipDetailSidebar.tsx`) con sumario, atributos, acceso directo a la pizarra visual de la entidad y gestión de conexiones.
- [x] Barra de herramientas con diseño tonal suave, controles de zoom, "Distribuir en Círculo" y "Alinear Curvas" (`RelationshipMapHeader.tsx`).

---

## Fase 3: Planificación Narrativa & Línea Temporal **[EN PROCESO]**
**Objetivo**: Proporcionar herramientas orgánicas para el diseño temporal, estructural y panorámico de la novela, bajo la filosofía de soberanía autoral y libertad creativa (sin imposición de fórmulas dramáticas matemáticas prefabricadas).

### Subfase 3.1: Persistencia de Planificación (`planning.json`), Rediseño Zen y Tarjetas de Entidad [COMPLETADA]
- [x] Persistencia atómica local en `planning.json` coordinada por Electron (`fs:savePlanning`, `fs:readPlanning`).
- [x] Store modular Zustand (`usePlanningStore.ts`, $\le 250$ líneas) con guardado incremental debounced (500 ms) y vaciado preventivo inmediato en salida (`savePlanningImmediately`).
- [x] Modelo enriquecido con planos temporales (`past`, `present`, `future` y planos personalizados ilimitados con soberanía de edición/eliminación total) y vinculación directa con el Códice (`codexEntityId`).
- [x] Supresión total de la sección restrictiva "Estructura Dramática" en `PlanningDashboard.tsx`, conservando la tríada de planificación libre: Línea de Tiempo, Tablero de Corcho y Matriz de Esquema.
- [x] Modularización completa de la Línea de Tiempo (`TimelineView.tsx` descompuesto de 1.346 líneas en submódulos de $\le 250$ líneas en `src/components/planning/timeline/`).
- [x] Cabecera zen de 1 nivel con selector tonal de planos temporales, filtro por pista, buscador y botones de acción limpios.
- [x] Carriles horizontales fluidos (*swimlanes*) y tarjetas de evento respirables sin números artificiales `#1`, sin flechas `< >` y sin emojis.
- [x] Reordenación fluida mediante arrastrar y soltar (*drag & drop*) tanto entre pistas distintas como dentro de la misma pista con detección espacial (`before`/`after`) e indicador visual de inserción.
- [x] Ficha de evento narrativo ampliada (`TimelineEventModal.tsx`, `max-w-4xl`) con gestión de planos, pistas, fechas y consecuencias narrativas.
- [x] Sistema de tarjetas de entidad en el dossier (`DossierEntityCard.tsx` Opción 1 principal, `CompactEntityCard.tsx` Opción 3 compacta, `AvatarEntityCard.tsx` Opción 2 de elenco) con popover interactivo enriquecido (`EntityHoverPopover.tsx`).
- [x] Conmutador de densidad de participantes en la cabecera del dossier con detección inteligente de volumen de elenco.
- [x] Apertura de ficha de entidad y pizarra interactiva como ventana flotante (`z-[70]`) sin navegar forzadamente al Códex, manteniendo la permanencia en planificación.
- [x] Batería de pruebas automatizadas (`src/tests/test-phase-3-1.ts`) validando límites de líneas, persistencia atómica, planos temporales, reordenación espacial y cero emojis.

### Subfase 3.2: Escala Temporal Zoomable y Filtros Avanzados [SIGUIENTE TRAS REESTRUCTURACIÓN]
- Vistas de escala temporal zoomable (vista panorámica de toda la novela vs vista detallada por capítulos).
- Filtros avanzados multidimensionales por personajes participantes, locaciones y consecuencias.

### Subfase 3.3: Tablero de Corcho Literario Avanzado (Corkboard)
- Fichas de cartulina con arrastre libre entre capítulos y actos.
- Personalización de colores temáticos por tarjeta y filtros combinados.

### Subfase 3.4: Matriz de Esquema Panorámica Avanzada
- Edición rápida de sinopsis en celda expandible y ordenación multidimensional por columnas.
- Estadísticas en tiempo real de avance frente a las metas de palabras de cada escena.

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
