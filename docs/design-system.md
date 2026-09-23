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

