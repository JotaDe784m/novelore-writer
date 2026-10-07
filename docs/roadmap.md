# Novelore — Roadmap Técnico Unificado (Local-First Desktop)

Este documento establece la evolución estructurada, modular y soberana de **Novelore** como aplicación de escritorio local-first. Integra la reestructuración visual del Sistema de Diseño (`docs/design-system.md`) con la ruta técnica de ingeniería del proyecto.

---

## 1. Estado Actual del Proyecto: **FASE 6 EN CURSO**

```text
[F1: Escritura & Shell] ──► [F2: Códice Local] ──► [F3: Núcleo Visual & Zen] ──► [F4: Códex Hub] ──► [F5: Dossiers Códex]
       (COMPLETADA)               (COMPLETADA)              (COMPLETADA)             (COMPLETADA)           (COMPLETADA)
                                                                                                           │
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
▼
[F6: Línea de Tiempo Integral] ──► [F7: Esquema de Escenas] ──► [F8: Pizarras] ──► [F9: Mapa de Vínculos]
          ▲ (ACTUAL)                      (SIGUIENTE)
│
└─► [F10: Maquetación & Exportación] ──► [F11: Manuscrito & Inspector] ──► [F12: Sincronización Personal]
```

---

## 2. Resumen de Fases del Roadmap Unificado

- [x] **Fase 1: Núcleo de Escritura, Persistencia Local & IPC Nativo**: Shell de Electron, guardado atómico de archivos `.md` por escena, `project.json` y `manuscript.json`.
- [x] **Fase 2: Worldbuilding & Códice Local**: Store modular `codex.json`, galerías locales `/assets/gallery/`, contador de menciones en el manuscrito y grafo inicial de relaciones.
- [x] **Fase 3: Documentación Maestra, Núcleo Visual Global & Modo Zen Universal**: `docs/design-system.md`, `UnifiedSectionHeader`, `UnderlineTabs`, modal de ayuda 16:9 (`SectionHelpModal`), `TopNavigation` y taller literario de inicio (`HomeDashboard`).
- [x] **Fase 4: Rediseño del Códex Hub**: Retratos universales 3:4, vista clásica y vista libre en mosaico con notas dinámicas, contornos con color de identidad de elemento y categorías personalizadas.
- [x] **Fase 5: Suite de Dossiers Unificada del Códex**: Rediseño editorial de pestañas (Detalles, Lore Profundo con contador de palabras, Galería 3:4, Menciones con desglose e Identidad con síntesis), cabeceras homogéneas y aislamiento cromático de tarjeta y modal.
- [ ] **Fase 6: Planeación — Línea de Tiempo Integral & Dossier de Eventos**: Desacoplamiento de eventos del Códex, cabecera limpia apilada, jerarquía Planos $\rightarrow$ Líneas $\rightarrow$ Eventos, vista general reducida libre con espaciado relativo y etiquetas de intervalo, vista en primer plano con zoom clásico/libre, dossier completo de evento con selector híbrido de fechas, y pestaña Vínculos con subsección «Escenas y Capítulos Vinculados».
- [ ] **Fase 7: Planeación — Esquema de Escenas (Tablero de Corcho & Matriz)**: Unificación en 2 vistas de esquema, sincronización bidireccional con el manuscrito e inspector, ficha modal de escena con notas por bloque, lore profundo y elementos relacionados.
- [ ] **Fase 8: Pizarras Visuales Espaciales**: Lienzo global infinito y pizarras dedicadas por elemento/evento, persistencia en `boards/`, refactorización modular $\le 250$ líneas, tarjetas 3:4 y enlaces multimedia.
- [ ] **Fase 9: Mapa de Vínculos (Simplificación & Sincronización)**: Renombrado a Mapa de Vínculos, simplificación a solo categorías, filtros multidimensionales, sincronización bidireccional con la pestaña Vínculos y panel lateral con popover de avatar.
- [ ] **Fase 10: Maquetación, Compilación & Exportación Editorial**: Preservación funcional de plantillas DOCX y pliegos, rediseño visual sin marcos, plantillas de usuario y exportación en crudo en PDF.
- [ ] **Fase 11: Manuscrito & Inspector de Escenas**: Refactor visual del árbol del manuscrito con contraste tonal suave, sincronización de creación/edición con el Tablero de Corcho e inspector de escenas unificado.
- [ ] **Fase 12: Sincronización en la Nube Personal (Local-First)**: Conectores opcionales para Google Drive, Dropbox y OneDrive coordinados por el autor, manteniendo el almacenamiento local atómico.

---

## 3. Especificación Técnica por Fases

### Fase 1: Núcleo de Escritura, Persistencia Local & IPC Nativo [COMPLETADA]
- [x] Shell Electron con `contextBridge` e IPC seguro (`dialog:openFolder`, `dialog:createProjectFolder`, `project:updateProjectMeta`).
- [x] Tokens semánticos (`--bg-app`, `--bg-sidebar`, `--bg-editor`, `--text-primary`, `--accent`).
- [x] Árbol de manuscrito colapsable al 100% (`Ctrl+\`) con conteo de palabras en tiempo real.
- [x] Editor ergonómico central de ~720px con máquina de escribir, modo foco y atajos literarios españoles (`—`, `« »`, `* * *`).

### Fase 2: Worldbuilding & Códice Local [COMPLETADA]
- [x] Store modular `codex.json` con persistencia atómica `writeAtomic`.
- [x] Dossiers con atributos dinámicos y notas.
- [x] Streaming de assets locales con protocolo `novelore-asset://`.
- [x] Motor de detección de menciones con expresiones regulares Unicode y desglose jerárquico.

### Fase 3: Documentación Maestra & Núcleo Visual Global [COMPLETADA]
- [x] `docs/design-system.md` y `docs/roadmap.md`.
- [x] `UnderlineTabs`, `UnifiedSectionHeader`, `SectionHelpModal` y Modo Zen transversal.
- [x] Taller literario (`HomeDashboard.tsx`) con novela activa, métricas humanas y carrusel 3:4.

### Fase 4: Rediseño del Códex Hub [COMPLETADA]
- [x] Cuadrícula conmutada: Vista Clásica (4 notas fijas) y Vista Libre (mosaico expandible).
- [x] Marcos fotográficos en proporción universal 3:4 con contorno en color de identidad.
- [x] CRUD completo de categorías personalizadas de entidades.

### Fase 5: Suite de Dossiers Unificada del Códex [COMPLETADA]
- [x] Pestañas rediseñadas: Detalles con pines de tarjeta, Lore Profundo editorial, Galería 3:4, Menciones con desglose e Identidad con síntesis.
- [x] Cabeceras estándar sin textos explicativos redundantes.
- [x] Aislamiento cromático del color de énfasis (`--accent`) a nivel de tarjeta y modal.

---

### Fase 6: Planeación — Línea de Tiempo Integral & Dossier de Eventos [EN CURSO]

1. **Desacoplamiento de Eventos del Códex & Migración**:
   - [ ] Eliminar la categoría `event` del Códex Hub, sus filtros y formularios de creación.
   - [ ] Migración automática transparente: al cargar un proyecto, si existen entidades de tipo `event` en `codex.json`, se migran limpiamente a `planning.json` como eventos cronológicos sin pérdida de datos.
2. **Cabecera Apilada Limpia**:
   - [ ] Cabecera de 3 niveles sin saturación de botones:
     - Fila 1: `[Brújula] Planeación [?] [Modo Zen]`.
     - Fila 2: Sub-pestañas: `Línea de tiempo` | `Esquema de escenas` (`UnderlineTabs`).
     - Fila 3: Selector de Planos Temporales (`Todos`, `Pasado`, `Presente`, `Futuro`, `+ Plano`).
3. **Jerarquía Planos $\rightarrow$ Líneas de Tiempo $\rightarrow$ Eventos**:
   - [ ] Los Planos agrupan líneas de tiempo (pistas); cuentan con nombre, color y etiqueta corta editable.
   - [ ] Cada Línea de Tiempo pertenece a un Plano y dispone de su botón directo `+ Evento` (el evento hereda automáticamente plano y línea sin selectores burocráticos).
4. **Vista General de Líneas de Tiempo (Vista Reducida Libre)**:
   - [ ] Tarjeta reducida exclusiva: Fecha/era temporal, título del evento, subtítulo y descripción corta, con contorno en color de identidad.
   - [ ] Lienzo con scroll horizontal y arrastre libre relativo, permitiendo al autor dejar espacios entre eventos para alinear sucesos paralelos entre líneas.
   - [ ] Etiquetas de intervalo temporal sobre la línea conectora (ej: *«3 años después»*).
5. **Vista en Primer Plano (Zoom a una Línea de Tiempo)**:
   - [ ] Al pulsar en una línea de tiempo, se abre en primer plano con botón de retorno `← Volver a Líneas de Tiempo` y atajo `Esc`.
   - [ ] Tarjetas detalladas estilo Códex (3:4 retrato, título, subtítulo, fecha, 4 primeras notas y badge de correspondencia escénica).
   - [ ] Modos Clásico (fijo) y Libre (expandible verticalmente).
6. **Dossier Completo de Evento**:
   - [ ] Ficha modal con el mismo motor del Códex: Resumen, Detalles, Lore Profundo, Vínculos, Galería, Menciones y Pizarra.
   - [ ] **Selector Híbrido de Fechas**: Pestaña de Calendario Estándar (`AAAA-MM-DD`) vs Era Narrativa / Fantasía (campo libre).
7. **Pestaña Vínculos & Subsección «Escenas y Capítulos Vinculados»**:
   - [ ] Vínculos agrupados por categoría semántica, sincronizados con el Mapa de Vínculos.
   - [ ] Subsección exclusiva de eventos: vinculación de Actos completos, Capítulos completos o Escenas individuales.
   - [ ] Tarjetas de escritura dedicadas con botón de salto al manuscrito (vistas completa y compacta).

---

### Fase 7: Planeación — Esquema de Escenas (Tablero de Corcho & Matriz) [SIGUIENTE]
- [ ] Unificar Tablero de Corcho y Matriz de Esquema como dos vistas conmutables dentro de la pestaña `Esquema de escenas`.
- [ ] Tarjetas de escena sincronizadas con el árbol de manuscrito: título, sinopsis, estado y evento vinculado.
- [ ] Ficha Modal de Escena con Resumen, Sinopsis, Estado, Tags, Notas por bloques, Lore Profundo, Elementos Relacionados (POV, Locación, etc.) y Eventos Relacionados.
- [ ] Creación de actos, capítulos y escenas desde el tablero de corcho directamente sincronizada a disco.
- [ ] Ajustes para habilitar/deshabilitar Línea de Tiempo y Esquema de Escenas de forma independiente.

---

### Fase 8: Pizarras Visuales Espaciales
- [ ] Pizarras individuales por cada elemento del Códice y evento de la Línea de Tiempo.
- [ ] Pizarra global infinita del proyecto (`boards/main.json`).
- [ ] Refactorización modular estricta ($\le 250$ líneas) y persistencia en `boards/entities/[id].json`.
- [ ] Tarjetas de elementos y eventos en 3 variaciones (Completa 3:4, Compacta, Avatar).
- [ ] Buscador modal de inserción filtrable por categoría o línea de tiempo.

---

### Fase 9: Mapa de Vínculos (Simplificación & Sincronización)
- [ ] Renombrado oficial a **Mapa de Vínculos**.
- [ ] Simplificación a solo categorías de vínculo (sin campos redundantes de etiquetas o detalles).
- [ ] Filtros para ocultar categorías de Códice u ocultar eventos.
- [ ] Sincronización bidireccional total con la pestaña Vínculos de cada ficha.
- [ ] Panel lateral con tarjeta completa y popover de avatar al pasar el cursor sobre nodos.

---

### Fase 10: Maquetación, Compilación & Exportación Editorial
- [ ] Preservación de toda la lógica de pliegos y exportación DOCX/PDF/EPUB/Markdown.
- [ ] Rediseño visual sin marcos bajo los tokens de diseño.
- [ ] Gestor de plantillas personalizadas y exportación en crudo en PDF sin formato impuesto.

---

### Fase 11: Manuscrito & Inspector de Escenas
- [ ] Árbol de manuscrito rediseñado con contraste tonal suave y botones fantasma.
- [ ] Sincronización bidireccional inmediata con el Tablero de Corcho y la Ficha Modal de Escena.
- [ ] Inspector de escenas unificado con notas dinámicas, POV y elementos relacionados.

---

### Fase 12: Sincronización en la Nube Personal (Local-First)
- [ ] Conectores opcionales para Google Drive, Dropbox y OneDrive mediante credenciales del autor.
- [ ] Sincronización atómica modular archivo por archivo (`.md` por escena).
- [ ] Soberanía local garantizada: funcionamiento 100% offline.

---

## 4. Reglas Inviolables de Desarrollo

1. **Modularidad Estricta ($\le 250$ líneas)**: Ningún archivo puede superar las 250 líneas.
2. **Cero Emojis**: Estrictamente prohibidos en interfaz, etiquetas y código.
3. **Persistencia Local-First**: Todo reside en disco local (`codex.json`, `planning.json`, `manuscript.json`, `.md`, `assets/`).
4. **Prohibición de Commits Autónomos**: Solo se ejecuta `git commit` bajo autorización directa del usuario.
5. **Auditoría Preventiva**: Antes de cada commit, verificar `npm run lint` (`tsc --noEmit`), `npm run build` y `npm run audit`.
