# Sistema de Diseño y UI/UX — Novelore Desktop

Este documento define la **filosofía visual, arquitectura de interfaz, sistema de tokens, componentes universales y ergonomía de lectura** de **Novelore**. Su propósito es erradicar de raíz el aspecto de "panel administrativo / dashboard técnico" y consolidar un espacio creativo, minimalista, espacioso y estéticamente reconocible para largas jornadas de creación literaria y worldbuilding.

---

## 1. Filosofía Rectora: "Libertad Creativa, Espacio Respirable & Cero Redundancia"

La experiencia de Novelore se inspira en los referentes más refinados del software de autor, gestión de pensamiento y tipografía editorial:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   REFERENCIAS VISUALES Y DE UX                         │
├────────────────────────────────────────────────────────────────────────┤
│  • Editor Central:        Ulysses / iA Writer                          │
│    (Enfoque tipográfico puro, márgenes generosos, columna centrada)    │
│                                                                        │
│  • Barras Laterales:      Obsidian / Scrivener                         │
│    (Jerarquía colapsable al 100%, pestañas sutiles, fondos limpios)   │
│                                                                        │
│  • Códice & Pizarras:     Heptabase / Milanote                         │
│    (Tarjetas visuales orgánicas, lienzo infinito, sin rigidez)         │
└────────────────────────────────────────────────────────────────────────┘
```

### Reglas Rectoras del Lenguaje Visual:
1. **La Muerte de las "Cajas y Marcos"**: Se prohíbe el exceso de líneas divisorias (`border border-[...]`) en paneles, botones y tarjetas. La jerarquía y separación se logran mediante **cambios sutiles de tono de fondo** (contraste de superficie) y **espaciado respirable** (*padding* y márgenes holgados).
2. **Anti-Sobreexposición & Anti-Dashboard**: El autor es el dueño de su narrativa y comprende su flujo de trabajo. Quedan prohibidos los textos explicativos estáticos que saturan los encabezados y paneles ("Haz clic aquí para...", "Esta sección sirve para..."). La orientación se concentra exclusivamente **bajo demanda** en un botón contextual `?`.
3. **Botones Limpios y Controles en Cápsula (*Pill Buttons*)**: Las acciones primarias y filtros secundarios adoptan forma de cápsula redondeada (`rounded-full` o `rounded-xl`) sin bordes pesados, reaccionando con elevaciones suaves y tonos traslúcidos (*hover tint*).
4. **Pestañas de Texto con Indicador Animado (`UnderlineTabs`)**: La navegación entre secciones y categorías se realiza mediante texto limpio con una línea indicadora inferior animada suavemente (`motion.div` con `layoutId`), prescindiendo de cajas duras tipo pestaña de navegador antiguo.
5. **Estructuras Visuales antes que Formularios**: Los campos rígidos organizados en tablas o listas de pares clave-valor se sustituyen por bloques o tarjetas temáticas con edición directa *inline*.
6. **Coherencia Fotográfica 3:4 Universal**: La proporción vertical **3:4** es el estándar absoluto para todos los marcos fotográficos de la aplicación: retratos de personajes, postales de lugares, emblemas de facciones, acontecimientos de la línea de tiempo y recursos depositados en la pizarra.
7. **Separación Quirúrgica en Menús Contextuales**:
   - **Clic principal**: Abre directamente la ficha, dossier o editor de la entidad.
   - **Clic derecho**: Despliega un menú contextual rápido de operaciones directas (*Abrir ficha*, *Ver en pizarra*, *Duplicar*, *Eliminar*). **Queda estrictamente prohibido incluir selectores de color en el menú contextual**; la personalización del color de identidad semántica pertenece de manera exclusiva a la cabecera del Dossier.
8. **Cero Emojis**: Queda estrictamente prohibido el uso de emojis en código, componentes, interfaces, botones, mensajes predeterminados y nombres de entidades del sistema. La iconografía se resuelve exclusivamente mediante glifos vectoriales refinados (`lucide-react`).

---

## 2. Arquitectura de Layout, Paneles & Modo Inmersivo Unificado

### 1. Las 3 Columnas Fluidas del Espacio de Trabajo
```text
┌─────────────────┬───────────────────────────────────┬─────────────────┐
│ BARRA IZQUIERDA │          EDITOR CENTRAL           │ BARRA DERECHA   │
│  (Manuscrito)   │       (Columna de Lectura)        │   (Inspector)   │
│                 │                                   │                 │
│  • Árbol Actos  │    ┌─────────────────────────┐    │  • Ficha POV    │
│  • Capítulos    │    │                         │    │  • Objetivo     │
│  • Escenas      │    │    Columna ~720px       │    │  • Conflicto    │
│  • Palabras     │    │  (65-75 caracteres)     │    │  • Resultado    │
│                 │    │                         │    │  • Metas        │
│  Ancho: ~260px  │    └─────────────────────────┘    │  Ancho: ~300px  │
│ [Colapso total] │     Márgenes automáticos libres   │ [Colapso total] │
└─────────────────┴───────────────────────────────────┴─────────────────┘
```

- **Colapso Total hacia los Bordes**: La barra izquierda (`Ctrl+\` o `Cmd+\`) y el inspector derecho (`Ctrl+I` o `Cmd+I`) pueden replegarse completamente hasta el pixel 0. Al colapsar, el editor central amplía sus márgenes de manera armónica.
- **Redimensionamiento Tonal**: Paneles redimensionables sin líneas de borde; la separación se basa en el contraste de superficie (`--bg-sidebar` vs `--bg-editor`).

### 2. Modo Pantalla Completa / Zen Universal
El modo Zen trasciende el editor de manuscrito y se convierte en un **estándar transversal unificado** para todas las secciones principales de Novelore (*Manuscrito*, *Códex*, *Planeación*, *Pizarra*, *Mapa de Relaciones*, *Maquetación*):
- **Botón Unificado en Cabecera**: Cada módulo incluye un botón de maximización (`Maximize2` / `Minimize2`).
- **Comportamiento Inmersivo**:
  - Se oculta por completo la barra superior general de navegación (`TopNavigation`).
  - Se oculta la cabecera principal del módulo activo.
  - **Se conservan visibles las pestañas de navegación contextual (`UnderlineTabs`)** de la sección, permitiendo al autor alternar entre categorías, escenas o vistas sin salir del estado de inmersión.
  - Se dispone un control flotante translúcido y sutil en una esquina de la pantalla para restaurar la interfaz estándar (o mediante la tecla `Escape`).

---

## 3. Ergonomía Tipográfica del Editor Central

Diseñado para sostener jornadas de redacción profunda de 4 a 8 horas sin agotamiento visual:

1. **Columna de Lectura Óptima (~720px)**:
   - Ancho centrado restringido ergonómicamente a **65-75 caracteres por línea**.
2. **Scroll de Máquina de Escribir (*Typewriter Scrolling*)**:
   - Ancla la línea activa de redacción en el tercio medio de la pantalla (`Alt+T` o botón en barra de herramientas).
3. **Modo Foco por Párrafo (*Focus Mode*)**:
   - Resalta el párrafo bajo el cursor y atenúa al 40-50% de opacidad los párrafos precedentes y posteriores (`Alt+F`).
4. **Formateador Tipográfico Literario en Español**:
   - Raya de diálogo canónica (`—`, `Alt+-` o `Ctrl+Shift+M`) pegada al diálogo.
   - Comillas latinas angulares (`« »`).
   - Corte de escena clásico (`* * *`).
   - Sangría literaria inteligente (`Tab`, `Shift+Tab` y sangría automática de primera línea).

---

## 4. Sistema de Tokens de Diseño y Variables CSS

### Tokens de Color y Superficie:
| Token CSS | Propósito | Comportamiento Visual |
| :--- | :--- | :--- |
| `--bg-app` | Fondo base de la ventana de la aplicación. | Tono neutro más profundo. |
| `--bg-sidebar` | Fondo de las barras laterales y paneles. | Contraste sutil (±2-3% respecto a `--bg-app`). |
| `--bg-editor` | Fondo del lienzo de escritura y lectura. | Superficie limpia y descansada para la vista. |
| `--bg-card` | Fondo de tarjetas, bloques de detalle y dossiers. | Elevación tonal suave sin bordes rígidos. |
| `--bg-surface-hover` | Realce interactivo de botones e ítems. | Tinte traslúcido suave al posar el cursor (5-10%). |
| `--bg-surface-active`| Ítem seleccionado o escena activa. | Tono acentuado o con tinte sutil del acento. |
| `--text-primary` | Prosa del editor y títulos principales. | Máximo contraste legible sin ser negro puro estridente. |
| `--text-secondary` | Nombres de escenas en árbol, etiquetas y datos. | Contraste medio para información contextual. |
| `--text-muted` | Conteo de palabras, atajos y pistas sutiles. | Atenuado para evitar saturación visual. |
| `--accent` | Color de acento personalizable del autor. | Aplicado con parsimonia (indicadores, cursor activo). |
| `--accent-subtle` | Fondos de etiquetas activas y selecciones. | Variación muy diluida del color de acento. |

### Tokens de Curvatura y Espaciado:
- **Botones y cápsulas**: `rounded-full` para botones de acción; `rounded-xl` (12px) para botones estándar.
- **Tarjetas y bloques**: `rounded-2xl` (16px) a `rounded-3xl` (24px).
- **Marcos fotográficos**: `aspect-[3/4]` con `rounded-xl` o `rounded-2xl`.
- **Márgenes y paddings**: Cuadrícula modular basada en múltiplos de 4px/8px.

---

## 5. Atmósferas Visuales (Catálogo de Temas Desacoplado)

En Novelore, un tema es una **atmósfera estética completa** desacoplada de la tipografía y del tamaño de fuente:
- **Claro Editorial (Minimal)**: Lienzo blanco marfil neutro con texto grafito profundo.
- **Carbón Nocturno (Dark)**: Superficie carbón mate profunda sin reflejos agresivos.
- **Pergamino Fantasía (Sepia)**: Tono cálido de papel añejo y tinta sepia/nogalina.
- **Bosque Brumoso (Forest)**: Verdes profundos y tonos musgo apagados.
- **Medianoche (Midnight)**: Azul marino abisal de baja saturación con acentos tenues.
- **Noir (Monocromo)**: Escala de grises pura de alto contraste cinematográfico.

---

## 6. Sistema Universal de Ayuda Contextual (`SectionHelpModal`)

En sustitución de manuales densos o textos estáticos:
- **Activación**: Botón discreto `?` ubicado junto al título de cada cabecera unificada.
- **Contenedor Visual en Proporción 16:9 (`aspect-video`)**:
  - Diseñado con gradiente temático sutil y distintivo de demostración visual.
  - Soporta la propiedad `gifSrc?: string`: reproduce en bucle fluido los GIFs demostrativos grabados por el autor cuando estén disponibles; si no, despliega un placeholder estético.
- **Contenido Concreto**:
  - Explicación concisa del propósito creativo del módulo (2 a 3 líneas).
  - Atajos de teclado clave asociados a la sección.
  - Botón de cierre "Entendido" en formato cápsula. No requiere subpáginas complejas de "Saber más" ni dependencias de traducción.

---

## 7. Página de Inicio: "Taller Literario Respirable"

La página de inicio no es un cuadro de mando empresarial; es el **vestíbulo acogedor de la obra**:

### Estado A: Novela Activa en Edición
1. **Hero Acogedor**: Saludo sereno y título de la novela en tipografía display con su género y subtítulo.
2. **Acceso Rápido "Continuar Escribiendo"**: Tarjeta destacada de reanudación inmediata que indica la última escena trabajada (título del capítulo y escena, conteo de palabras y tiempo relativo transcurrido) para volver a la prosa en 1 solo clic.
3. **Ritmo Literario (Métricas Humanas)**: Barra estética de avance hacia la meta total del libro (ej. `42.500 / 80.000 palabras`) y palabras redactadas en la sesión actual, sin gráficas financieras complejas.
4. **Atajos Creativos en Cápsula**: Enlaces directos a *Manuscrito*, *Códex*, *Planeación*, *Pizarra* y *Relaciones*.
5. **Retratos Destacados (3:4)**: Carrusel o cuadrícula de personajes o elementos clave del universo ficticio con marcos 3:4.
6. **Taller de Otras Novelas**: Sección inferior colapsable para abrir carpetas locales o conmutar de proyecto sin abarrotar la vista principal.

### Estado B: Sin Novela Activa (o Taller Despejado)
- Galería central de portadas en formato vertical de libro (2:3 o 3:4).
- Botones cápsula principales: `+ Nueva Novela` y `Abrir Carpeta Local`.
- Buscador ágil por título o autor, sin paneles administrativos redundantes.

---

## 8. Sistema Universal de Tarjetas de Entidad (Proporción 3:4)

El estándar transversal para renderizar entidades en Códex, Cronología, Pizarras, Inspector y Relaciones:

### Variación 1: Tarjeta Estándar Completa (Principal)
```text
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────┐  Nombre del Elemento                [Desvincular]│
│ │         │  Subtítulo / Rol / Arquetipo                     │
│ │ RETRATO │                                                  │
│ │   3:4   │  ┌───────────┐  ┌───────────┐                    │
│ │         │  │  Pizarra  │  │   Ficha   │                    │
│ └─────────┘  └───────────┘  └───────────┘                    │
└─────────────────────────────────────────────────────────────┘
```
- Marco fotográfico vertical en proporción **3:4** con borde en color semántico y micro-animación de zoom.
- Nombre destacado, subtítulo atenuado y botones directos *Pizarra* y *Ficha* en ventana flotante (`z-[70]`).

### Variación 2: Fila de Avatares / Elenco Compacto (Modo Facepile)
- Círculos de avatar limpios (`w-9 h-9 rounded-full`) para escenas corales y asambleas numerosas.
- Popover flotante enriquecido al hacer hover con sinopsis y botones de acción.

### Variación 3: Tarjeta Compacta con Popover (Modo Lista Densa)
- Tarjeta horizontal de ~36px de altura con micro-avatar y nombre truncable para paneles estrechos.

---

## 9. Suite de Dossiers: Tarjetas Visuales y Pestaña "Relacionados"

### 1. Bloques Visuales de Detalles (`DossierAttributesTab.tsx`)
- Se erradican las tablas de pares clave-valor rígidas.
- **Tarjetas Temáticas**: Bloques visuales configurables (*Inicio*, *Conflicto*, *Final*, *Motivación*, *Mayor Miedo*, *Aliados*).
- **CRUD Completo**:
  - Redacción directa *inline* de título y contenido con auto-guardado suave.
  - Botón `+ Añadir detalle` para crear nuevos bloques temáticos.
  - Botón de papelera en cada tarjeta para eliminar el bloque con confirmación sutil.

### 2. Pestaña "Relacionados" (`DossierRelationsTab.tsx`)
- Presente en todas las entidades del Códex y Acontecimientos de la Cronología.
- Agrupación semántica por categorías: `Lugares +`, `Personajes +`, `Facciones +`, `Acontecimientos +`.
- Selector de densidad de visualización (Tarjetas 3:4, Compactas, Avatares).
- Botón directo para desenlazar o eliminar la relación.

---

## 10. Pizarra Global Única e Infinita (`VisualBoardView`)

- **Lienzo Espacial Único**: Una sola pizarra global infinita por proyecto, preservando todas las funcionalidades implementadas (pan/zoom infinito, notas adhesivas, conectores Bézier magnéticos, inserción de imágenes locales).
- **Actualización Estética**: Cabecera unificada `[Layout] Pizarra [?] [Zen]`, barra de herramientas flotante en cápsula y tarjetas de entidades depositadas en formato **3:4**.

---

## 11. Maquetación, Compilación & Exportación (`ExportPageView`)

- **Flexibilidad Formuláica Técnica**: Al tratarse de un área técnica donde se configuran parámetros milimétricos (márgenes, formato de página, títulos, compendio y glifos de corte), se mantiene una estructura formuláica modular limpia.
- **Acabado Visual**: Espaciado respirable, contraste tonal suave, botones cápsula para formatos de salida (`DOCX`, `PDF`, `EPUB`, `Markdown`) y progreso de compilación claro.

---

## 12. Reglas de Ingeniería y Restricciones Inviolables

1. **Modularidad Estricta ($\le 250$ líneas por archivo)**: Ningún componente o submódulo superará las ~250 líneas.
2. **Cero Emojis**: Prohibidos en cualquier nivel de la aplicación o del repositorio.
3. **Persistencia Local-First Absoluta**: Prohibidos servidores o nubes centralizadas; todo se persiste en archivos locales abiertos (`.md`, `.json`, `.png`/`.jpg`).
4. **Verificación Continua**: Cada fase debe superar TypeScript (`tsc --noEmit`), pruebas (`npm test`) y auditoría (`knip`).
5. **Prohibición Estricta de Commits Autónomos**: Solo se ejecuta `git commit` cuando el usuario dé la orden explícita.
