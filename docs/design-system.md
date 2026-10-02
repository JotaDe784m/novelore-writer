# Sistema de Diseño y UI/UX — Novelore Desktop

Este documento define la **filosofía visual, arquitectura de interfaz, sistema de tokens y ergonomía de lectura** de **Novelore**. Su objetivo es erradicar el aspecto de "panel administrativo / dashboard técnico" y consolidar un espacio creativo, minimalista, espacioso y estéticamente reconocible para largas jornadas de escritura.

---

## 1. Filosofía de Diseño: "Libertad Creativa & Espacio Respirable"

La experiencia de Novelore se inspira directamente en los referentes más refinados del software de autor y gestión de pensamiento:

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
│    (Tarjetas visuales orgánicas, conectores fluidos, sin rigidez)      │
└────────────────────────────────────────────────────────────────────────┘
```

### Reglas Rectoras del Lenguaje Visual:
1. **La Muerte de las "Cajas y Marcos"**: Se prohíbe el exceso de líneas divisorias (`border border-[...]`) en paneles, botones y tarjetas. La jerarquía y separación se logran mediante **cambios sutiles de tono de fondo** (contraste de superficie) y **espaciado respirable** (*padding* y márgenes holgados).
2. **Botones Sin Contorno (*Ghost & Flat Elements*)**: Los botones y herramientas flotan limpios sobre la superficie; reaccionan únicamente con un fondo suave (*hover tint*) y transiciones fluidas de opacidad.
3. **El Texto como Protagonista**: La interfaz se desvanece para que la prosa literaria sea el centro visual de la pantalla.

---

## 2. Arquitectura de Layout y Paneles (3 Columnas Fluidas)

La interfaz se estructura en tres zonas horizontales coordinadas:

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

### Comportamiento de los Paneles:
* **Colapso Total hacia los Bordes**:
  * La barra izquierda (manuscrito) y la derecha (inspector) pueden replegarse completamente mediante atajos de teclado (`Ctrl+\` o `Cmd+\` para el manuscrito; `Ctrl+I` o `Cmd+I` para el inspector) o botones discretos sin marco.
  * Al colapsar los paneles, el editor central permanece perfectamente centrado y amplía sus márgenes laterales de forma natural.
* **Redimensionamiento y Persistencia**:
  * Los anchos de ambos paneles son redimensionables mediante arrastre sutil en su zona divisoria. Las dimensiones elegidas por el autor se persisten en las preferencias locales.
* **Modo Zen / Enfoque Absoluto**:
  * Oculta ambas barras laterales, la barra de estado superior e inferior, dejando exclusivamente el lienzo tipográfico en pantalla completa.

---

## 3. Ergonomía Tipográfica del Editor Central

Diseñado para soportar sesiones de redacción continua de 4 a 8 horas sin fatiga visual:

1. **Columna de Lectura Óptima (~720px)**:
   - El texto nunca se desborda horizontalmente de borde a borde en monitores ultrapanorámicos.
   - Se mantiene estrictamente en el ancho óptimo de lectura ergonómica: **entre 65 y 75 caracteres por línea**.
2. **Scroll de Máquina de Escribir (*Typewriter Scrolling*)**:
   - Mantiene la línea activa de escritura anclada suavemente en el tercio medio de la pantalla, evitando que el autor deba escribir con la mirada en el borde inferior del monitor.
3. **Modo Foco por Párrafo (*Focus Mode*)**:
   - Resalta el párrafo actual que el autor está redactando y atenúa suavemente con una opacidad reducida (40-50%) los párrafos anteriores y posteriores, aumentando la inmersión en la frase actual.
4. **Respiración Vertical**:
   - Altura de línea (*line-height*) generosa y configurable (1.6 a 1.8 en prosa estándar), con separación suave entre párrafos o sangría clásica de primera línea sin líneas en blanco.

---

## 4. Sistema de Tokens de Diseño y Variables CSS

La interfaz utiliza variables CSS semánticas desacopladas de colores fijos:

### Tokens de Color y Superficie:
| Token CSS | Propósito | Comportamiento Visual |
| :--- | :--- | :--- |
| `--bg-app` | Fondo base de la ventana de la aplicación. | Tono neutro más profundo. |
| `--bg-sidebar` | Fondo de las barras laterales de navegación. | Contraste sutil (±2-3% de brillo respecto a `--bg-app`). |
| `--bg-editor` | Fondo del lienzo de escritura central. | Superficie limpia y descansada para la vista. |
| `--bg-surface-hover` | Realce interactivo de botones e ítems de lista. | Fondo traslúcido suave al pasar el cursor (5-10% opacidad). |
| `--bg-surface-active`| Ítem seleccionado o escena activa en el árbol. | Tono ligeramente acentuado o con tinte sutil del acento. |
| `--text-primary` | Prosa del editor y títulos principales. | Máximo contraste legible sin ser negro puro agresivo. |
| `--text-secondary` | Nombres de escenas en árbol, etiquetas y datos. | Contraste medio para información contextual. |
| `--text-muted` | Conteo de palabras, atajos y pistas sutiles. | Atenuado para evitar saturación visual. |
| `--accent` | Color de acento personalizable del autor. | Aplicado con parsimonia (indicadores de estado, cursor activo). |
| `--accent-subtle` | Fondos de etiquetas activas y selecciones. | Variación muy diluida del color de acento. |

> **Regla de Oro**: Ningún panel debe tener `border: 1px solid [...]` visible por defecto. La delimitación entre la barra lateral y el editor se produce exclusivamente por la transición entre `--bg-sidebar` y `--bg-editor`.

### Tokens de Espaciado y Curvatura:
* **Espaciado**: Sistema basado en múltiplos de 4/8px. Márgenes internos de paneles: `16px` a `24px`. Espaciado de editor: `32px` a `64px` de margen superior/inferior.
* **Curvaturas (*Border Radius*)**:
  * Botones y campos de texto: `rounded-lg` (8px).
  * Tarjetas y modales: `rounded-xl` (12px) a `rounded-2xl` (16px).
  * Chips de estado y avatares: `rounded-full`.

---

## 5. El Sistema de Temas de Novelore: "Atmósferas Visuales"

En Novelore, un **Tema** no es simplemente un cambio de color, sino una **atmósfera estética completa** que acompaña el género y el estado de ánimo de la obra.

### Componentes de un Tema:
1. **Paleta Cromática de Superficie**: Fondos adaptados para `--bg-app`, `--bg-sidebar`, `--bg-editor`, `--text-primary` y `--text-muted`.
2. **Color de Acento Personalizable**: El autor puede sustituir el acento sugerido por cualquier tonalidad propia (ej. oro antiguo, azul cobalto, burdeos, esmeralda, amatista).
3. **Independencia Tipográfica**: La fuente tipográfica (Garamond, Lora, Merriweather, JetBrains Mono, etc.) y su tamaño son preferencias ergonómicas del autor y **no se ven forzadas por el tema cromático**.

### Catálogo de Atmósferas Iniciales:
* **Claro Editorial (Minimal)**: Lienzo blanco marfil neutro con texto grafito profundo. Máxima nitidez y luz natural.
* **Carbón Nocturno (Dark)**: Superficie carbón mate profunda sin reflejos agresivos, diseñada para descansar la vista en la noche.
* **Pergamino Fantasía (Sepia)**: Tono cálido de papel añejo y tinta sepia/nogalina, evocando crónicas históricas y fantasía.
* **Bosque Brumoso (Forest)**: Verdes profundos y tonos musgo apagados para ambientaciones de misterio o naturaleza.
* **Medianoche (Midnight)**: Azul marino abisal de baja saturación con acentos cian tenues para ciencia ficción y drama.
* **Noir (Monocromo)**: Escala de grises pura de alto contraste y elegancia cinematográfica.

### Jerarquía de Guardado de Temas:
1. **Preferencia Global de la Aplicación**: El tema general que la aplicación utiliza por defecto al iniciarse.
2. **Preferencia Específica por Novela (`project.settings.theme`)**: Cada proyecto puede guardar su propia atmósfera (por ejemplo, escribir una novela gótica en *Noir* y un ensayo en *Claro Editorial*), aplicándose automáticamente al abrir esa carpeta.

---

## 6. Códice y Pizarras Visuales (Heptabase / Milanote)

* **Tarjetas Orgánicas**: Las fichas de personajes, lugares y notas del lienzo infinito no tienen bordes duros; utilizan elevaciones sutiles y esquinas redondeadas generosas.
* **Conectores Curvos Dinámicos**: Las líneas de relación y flechas no son rígidas; trazan curvas fluidas con puntos de flexión orgánicos.
* **Microinteracciones Suaves**: Arrastre con inercia, transiciones fluidas de zoom y sombras de elevación dinámicas mientras se mueve un elemento.

---

## 7. Sistema Universal de Tarjetas de Entidad (Entity Cards System)

El **Sistema Universal de Tarjetas de Entidad** es el patrón transversal de interacción que conecta los elementos del **Códice** (personajes, lugares, facciones, objetos, acontecimientos históricos) con el resto de módulos de Novelore:
* **Línea de Tiempo**: Dossier de acontecimientos narrativos y listas de participantes/escenarios.
* **Inspector de Escenas**: Personajes presentes en la escena y lugares vinculados en el manuscrito.
* **Mapa de Relaciones**: Fichas contextuales e inspectores de nodos vinculados.
* **Pizarras Visuales y Tablero de Corcho**: Fichas interactivas en lienzo infinito y cartulinas.
* **Notas de Manuscrito y Menciones Rápidas**: Previsualización de personajes mencionados en el texto.

### Principios Fundamentales del Sistema de Tarjetas:
1. **Ausencia de Marcos Rígidos**: Las tarjetas se integran en el fondo mediante contraste tonal suave (`--bg-sidebar`, `--bg-card`), elevaciones ligeras y esquinas redondeadas generosas (`rounded-xl`).
2. **Acceso Directo Sin Fricción**: Cada tarjeta ofrece accesos directos a **"Ficha"** (Códex) y **"Pizarra"** (lienzo interactivo de la entidad).
3. **Permanencia en Contexto (Ventana Flotante `z-[70]`)**: Al abrir una ficha o pizarra desde una tarjeta, esta se despliega como un modal flotante por encima de la vista activa. Nunca se fuerza una navegación de pantalla completa que interrumpa el flujo del autor.
4. **Respeto a la Densidad Visual**: La interfaz ofrece tres modos de visualización para que listas numerosas (ej. una batalla o banquete con más de 8 personajes) no colapsen el espacio respirable.

---

### Las 3 Variaciones de Tarjeta de Entidad

#### Variación 1: Tarjeta Estándar Completa (Opción 1 — Principal por Defecto)
Diseñada para un acceso inmediato en un solo clic, sin esperas ni dependencias de interacción por cursor.

```text
┌─────────────────────────────────────────────────────────────┐
│ ┌───────┐  Nombre del Elemento                  [Desvincular]│
│ │ FOTO  │  Subtítulo / Rol / Arquetipo                      │
│ │   O   │                                                   │
│ │COLOR  │  ┌───────────┐  ┌───────────┐                     │
│ └───────┘  │  Pizarra  │  │   Ficha   │                     │
│            └───────────┘  └───────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

* **Composición**:
  * **Avatar circular** a la izquierda (`w-10 h-10 rounded-full`) con foto de perfil (`avatarUrl`) o iniciales en relieve sobre el color semántico de la entidad.
  * **Jerarquía tipográfica**: Nombre en seminegrita (`text-xs font-semibold`) y subtítulo atenuado (`text-[11px] text-[var(--text-muted)]`).
  * **Botones visibles directos**: Botones planos/ghost "Pizarra" y "Ficha" integrados en la tarjeta, con fondo sutil en hover (`hover:bg-[var(--bg-surface-hover)]`).
* **Casos de uso ideales**:
  * Listas de 1 a 4 participantes por escena o acontecimiento.
  * Escenarios vinculados, eventos del Códice y escenas del manuscrito.
  * Nodos desplegados en la Pizarra Visual y tarjetas principales del Inspector lateral.

---

#### Variación 2: Fila de Avatares / Elenco Compacto (Opción 2 — Modo Facepile)
Diseñada para escenas corales y asambleas masivas donde intervienen muchos personajes y se requiere la máxima economía de espacio vertical (~40px de altura total).

```text
  ┌───────┐   ┌───────┐   ┌───────┐
  │ (Foto)│   │ (Foto)│   │ (Foto)│  ...  +X más
  └───┬───┘   └───────┘   └───────┘
      │
      ▼ (Aparece al pasar el cursor)
  ┌───────────────────────────────────────────┐
  │ Nombre del Elemento             [Quitar]  │
  │ Subtítulo o Rol                           │
  │                                           │
  │ Extracto de lore o descripción corta      │
  │ registrada en el Códice...                │
  │                                           │
  │              ┌───────────┐ ┌───────────┐  │
  │              │  Pizarra  │ │   Ficha   │  │
  │              └───────────┘ └───────────┘  │
  └───────────────────────────────────────────┘
```

* **Composición**:
  * Círculos de avatar limpios (`w-9 h-9 rounded-full`) alineados en fila horizontal continua con micro-animación de escalado (`scale-105`) al posar el cursor.
  * **Popover Flotante Enriquecido (*Speech Bubble*)**: Al hacer hover sobre cualquier avatar, se despliega un globo flotante con flecha indicadora que contiene el nombre, la descripción/sinopsis corta del Códex y los botones "Pizarra" y "Ficha".
* **Casos de uso ideales**:
  * Escenas con 6 a 15+ participantes (batallas, consejos, cenas solemnes).
  * Nodos tipo "pin" o chincheta de personaje en diagramas extensos de la Pizarra Visual.
  * Barras de presencia rápida en cabeceras de capítulos del manuscrito.

---

#### Variación 3: Tarjeta Compacta con Popover (Opción 3 — Modo Lista Densa)
Diseñada para equilibrar la lectura inmediata del nombre con una huella vertical mínima, permitiendo disponer los participantes en cuadrículas de 2 columnas.

```text
┌──────────────────────────────────────────┐
│ (o) Nombre del Elemento     Subtítulo [x]│
└──┬───────────────────────────────────────┘
   │
   ▼ (Aparece al pasar el cursor)
┌───────────────────────────────────────────┐
│ Nombre del Elemento             [Quitar]  │
│ Subtítulo o Rol                           │
│                                           │
│ Extracto de lore o descripción corta      │
│ registrada en el Códice...                │
│                                           │
│              ┌───────────┐ ┌───────────┐  │
│              │  Pizarra  │ │   Ficha   │  │
│              └───────────┘ └───────────┘  │
└───────────────────────────────────────────┘
```

* **Composición**:
  * Tarjeta horizontal estilizada de ~36px de altura con micro-avatar (`w-6 h-6`), nombre truncable y subtítulo inline.
  * **Popover Flotante Enriquecido**: Despliega la sinopsis de trasfondo y los botones de acción al pasar el ratón.
  * Botón de desvinculación discreto (`x`) visible al hacer hover en el extremo derecho.
* **Casos de uso ideales**:
  * Listas de participantes de tamaño medio (4 a 8 personajes) en cuadrícula de 2 columnas.
  * Paneles estrechos como el Inspector lateral de escena (~260px a 300px).
  * Tarjetas compactas de referencias cruzadas en el Códex.

---

### Componentes Base y Conmutador de Densidad

El sistema se estructura en componentes desacoplados dentro del módulo de UI:
* **`DossierEntityCard.tsx`**: Renderizado de la Variación 1 (Tarjeta completa).
* **`AvatarEntityCard.tsx`**: Renderizado de la Variación 2 (Avatar con popover).
* **`CompactEntityCard.tsx`**: Renderizado de la Variación 3 (Tarjeta fina con popover).
* **`EntityHoverPopover.tsx`**: Globo flotante interactivo con tolerancia de puntero (150 ms) y botones de acción.
* **`DossierParticipantsSection.tsx`**: Cabecera con conmutador de 3 estados (*Tarjetas*, *Compacto*, *Avatares*) que adapta la densidad según la preferencia del autor o el tamaño del elenco.


