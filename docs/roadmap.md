# Novelore — Roadmap Técnico Unificado (Local-First Desktop)

Este documento establece la evolución estructurada, modular y soberana de **Novelore** como aplicación de escritorio local-first. Integra la reestructuración visual del Sistema de Diseño (`docs/design-system.md`) con la ruta técnica de ingeniería del proyecto.

---

### 1. Estado Actual del Proyecto: **FASE 7 EN CURSO (SIGUIENTE)**

```text
[F1: Escritura & Shell] ──► [F2: Códice Local] ──► [F3: Núcleo Visual & Zen] ──► [F4: Códex Hub] ──► [F5: Dossiers Códex]
       (COMPLETADA)               (COMPLETADA)              (COMPLETADA)             (COMPLETADA)           (COMPLETADA)
                                                                                                           │
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
▼
[F6: Líneas de Tiempo] ──► [F7: Esquema de Escenas] ──► [F8: Mapa de Vínculos] ──► [F9: Pizarras]
       (COMPLETADA)                 ▲ (SIGUIENTE)
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
- [x] **Fase 6: Planeación — Línea de Tiempo Integral & Dossier de Eventos**: Desacoplamiento de eventos del Códex, cabecera de ancho completo, jerarquía Planos $\rightarrow$ Líneas $\rightarrow$ Eventos, vista general reducida libre con espaciado relativo y etiquetas de intervalo, vista en primer plano con tarjetas 3:4 compartidas con el Códex, dossier completo de evento con selector híbrido de fechas, notas en lienzo 2D libre redimensionables y pestaña Vínculos con sincronización de escenas.
- [ ] **Fase 7: Planeación — Esquema de Escenas (Tablero de Corcho & Matriz)**: Unificación en 2 vistas de esquema dentro de Planeación, sincronización bidireccional con el manuscrito e inspector, ficha modal de escena con notas por bloque, lore profundo y elementos relacionados.
- [ ] **Fase 8: Mapa de Vínculos (Simplificación & Sincronización)**: Renombrado a Mapa de Vínculos, simplificación a solo categorías, filtros multidimensionales, sincronización bidireccional con la pestaña Vínculos de cada ficha y panel lateral con popover de avatar.
- [ ] **Fase 9: Pizarras Visuales Espaciales**: Lienzo global infinito y pizarras dedicadas por elemento/evento, persistencia en `boards/`, refactorización modular $\le 250$ líneas, tarjetas 3:4 y enlaces multimedia.
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
- [x] Retratos fotográficos universales 3:4 con contorno en color de identidad semántica.
- [x] Tarjetas editoriales consistentes con dimensiones fijas y descripción corta truncada con puntos suspensivos.
- [x] Reordenamiento ágil de elementos mediante arrastre manual (orden persistido por categoría y general).
- [x] Eliminación de vistas fragmentadas (vista compacta eliminada a favor de tarjetas editoriales uniformes).
- [x] CRUD completo de categorías personalizadas de entidades.

### Fase 5: Suite de Dossiers Unificada del Códex [COMPLETADA]
- [x] Pestañas rediseñadas: Detalles con notas y canvas 2D libre, Lore Profundo editorial, Galería 3:4, Menciones con desglose e Identidad con síntesis.
- [x] Cabeceras estándar de ancho completo sin textos explicativos redundantes.
- [x] Aislamiento cromático del color de énfasis (`--accent`) a nivel de tarjeta y modal según la entidad activa.

---

### Fase 6: Planeación — Línea de Tiempo Integral & Dossier de Eventos [COMPLETADA]

1. **Desacoplamiento de Eventos del Códex & Migración**:
   - [x] Desacoplamiento total de eventos respecto al Códex Hub.
   - [x] Migración automática transparente al cargar un proyecto (`event` migrado de `codex.json` a `planning.json`).
2. **Cabecera de Ancho Completo & Jerarquía**:
   - [x] Cabecera unificada apilada cubriendo el ancho total de la ventana: `Planeación` con `[?]`, Modo Zen y `UnderlineTabs` (`Líneas de tiempo` | `Esquema de escenas`).
   - [x] Selector y gestión ágil de Planos Temporales (`Todos`, `Pasado`, `Presente`, `Futuro`, `+ Plano`).
   - [x] Jerarquía de tres niveles: Planos $\rightarrow$ Líneas de Tiempo $\rightarrow$ Eventos.
3. **Vista General Reducida Libre**:
   - [x] Tarjetas reducidas de evento con contorno en color de identidad y dimensiones compactas.
   - [x] Espaciado relativo manual y arrastre horizontal con guardado de posición en píxeles.
   - [x] Etiquetas de intervalo temporal sobre conectores (ej: *«3 años después»*).
4. **Vista en Primer Plano (Zoom a Línea de Tiempo)**:
   - [x] Tarjetas de eventos unificadas con el estándar editorial 3:4 del Códex (aspecto 3:4, fecha sobre el título, descripción truncada, cápsulas de menciones y vínculos).
   - [x] Retorno con botón `← Volver a Líneas de Tiempo` y atajo `Esc`.
5. **Dossier Completo de Evento**:
   - [x] Ficha modal con suite completa de pestañas (Resumen, Detalles, Lore Profundo, Vínculos, Galería, Menciones).
   - [x] Selector híbrido de fechas: Calendario estándar vs Era narrativa / cronología fantástica.
   - [x] Pestaña Vínculos con subsección «Escenas y Capítulos Vinculados».
6. **Lienzo 2D Libre de Notas & Detalles**:
   - [x] Rediseño unificado de notas tanto para Códex como para Eventos: cajas limpias sin marcos pesados, arrastre fluido directo y redimensionamiento libre desde bordes.
   - [x] Edición de título por doble clic, controles flotantes de fijar y eliminar exclusivos al pasar el ratón.
   - [x] Lienzo infinito con autoexpansión y scroll bidireccional; entidades creadas sin notas por defecto.
   - [x] Compatibilidad total con todos los temas visuales del programa y aislamiento de acento cromático.

---

### Fase 7: Planeación — Esquema de Escenas (Tablero de Corcho & Matriz) [SIGUIENTE]
- [ ] Unificar Tablero de Corcho y Matriz de Esquema como dos vistas conmutables dentro de la pestaña `Esquema de escenas`.
- [ ] Tarjetas de escena sincronizadas con el árbol de manuscrito: título, sinopsis, estado y evento vinculado.
- [ ] Ficha Modal de Escena con Resumen, Sinopsis, Estado, Tags, Notas por bloques, Lore Profundo, Elementos Relacionados (POV, Locación, etc.) y Eventos Relacionados.
- [ ] Creación de actos, capítulos y escenas desde el tablero de corcho directamente sincronizada a disco.
- [ ] Ajustes para habilitar/deshabilitar Línea de Tiempo y Esquema de Escenas de forma independiente.

---

### Fase 8: Mapa de Vínculos (Simplificación & Sincronización)
- [ ] Renombrado oficial a **Mapa de Vínculos**.
- [ ] Simplificación a solo categorías de vínculo (sin campos redundantes de etiquetas o detalles).
- [ ] Filtros para ocultar categorías de Códice u ocultar eventos.
- [ ] Sincronización bidireccional total con la pestaña Vínculos de cada ficha.
- [ ] Panel lateral con tarjeta completa y popover de avatar al pasar el cursor sobre nodos.

---

### Fase 9: Pizarras Visuales Espaciales
- [ ] Pizarras individuales por cada elemento del Códice y evento de la Línea de Tiempo.
- [ ] Pizarra global infinita del proyecto (`boards/main.json`).
- [ ] Refactorización modular estricta ($\le 250$ líneas) y persistencia en `boards/entities/[id].json`.
- [ ] Tarjetas de elementos y eventos en 3 variaciones (Completa 3:4, Compacta, Avatar).
- [ ] Buscador modal de inserción filtrable por categoría o línea de tiempo.

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
