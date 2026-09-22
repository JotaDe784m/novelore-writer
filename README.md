# Novelore

Novelore es una suite de software integral diseñada para escritores, novelistas y creadores de mundos. Proporciona un entorno unificado que combina redacción de manuscritos, planificación estructural, biblias de worldbuilding (Códice), cronologías multilínea, mapas de relaciones visuales y sincronización en la nube.

---

## Características Principales

Todas las funcionalidades enumeradas están implementadas y operativas en la versión actual:

- **Editor de Manuscrito**:
  - Estructuración jerárquica por Actos, Capítulos y Escenas con reordenación y cálculo de progreso.
  - Edición de texto enriquecido con soporte para formato tipográfico, atajos y visualización personalizable.
  - Modo Zen / pantalla completa y modo máquina de escribir (typewriter scrolling).
  - Formateo de diálogos en español con reglas canónicas de la RAE (raya `—` y verbos *dicendi*).

- **Inspector de Escenas**:
  - Ficha de escena con gestión de objetivos, conflicto principal y resultado.
  - Asignación de personaje con Punto de Vista (POV) y elenco presente en la escena.
  - Vinculación directa con Lore y Eventos Históricos del Códice y de la Línea Temporal.
  - Metas de palabras individuales y seguimiento de estado (Borrador, Revisado, Pulido, Final).

- **Herramientas de Planificación**:
  - **Línea Temporal (Timeline)**: Cronología multilínea con pistas paralelas (Trama Principal, Subtramas, Lore/Pasado), eventos con niveles de importancia, filtrado histórico y enlace a escenas del manuscrito.
  - **Tablón de Corcho (Corkboard)**: Tarjetas de indexación visual por capítulo y acto con sinopsis y badges de estado.
  - **Arcos Narrativos (Story Beats)**: Estructuras clásicas (Tres Actos, Save the Cat!, El Viaje del Héroe) con porcentajes objetivo de avance y vinculación de escenas.
  - **Matriz de Estructura (Outline Grid)**: Vista panorámica tabular de actos, capítulos, objetivos narrativos y personajes participantes.

- **Códice & Worldbuilding**:
  - Enciclopedia categorizada: Personajes, Lugares, Facciones, Objetos, Conceptos y Eventos Históricos.
  - Dossier completo con atributos personalizados dinámicos, resúmenes, galería de imágenes y alias de nombres.
  - Contador de menciones automáticas en el manuscrito para cada entidad y sus alias.
  - Pizarra visual propia por entidad para moodboards de diseño conceptual.

- **Mapa de Relaciones**:
  - Grafo visual e interactivo de nodos y conexiones entre personajes y facciones.
  - Tipos de vínculo (alianza, enemistad, familia, romance, rivalidad, deuda, secreto, etc.), valencia emocional y puntos de control de curvatura manuales.

- **Pizarras Visuales (Moodboards)**:
  - Lienzo infinito con soporte para notas adhesivas, tarjetas de texto enriquecido, formas geométricas, flechas y conectores direccionales.
  - Carga de imágenes locales, enlaces web con reproductores embebidos (Spotify, YouTube) y previsualización de documentos PDF.

- **Exportación**:
  - Exportación a documentos Microsoft Word (`.docx`) con plantillas tipográficas ajustables (Estándar editorial, Manuscrito clásico, personalizadas).
  - Exportación a texto plano (`.txt`), Markdown (`.md`) y vista de impresión/PDF.

- **Persistencia Local**:
  - Almacenamiento primario en `localStorage` con historial de instantáneas y versiones del proyecto para restauración inmediata.

- **Sincronización en la Nube y Autenticación**:
  - Respaldo y sincronización en tiempo real mediante Firebase Firestore y Firebase Authentication (Google Sign-In).
  - Detección de sesiones activas concurrentes, alertas de guardado y panel de resolución de conflictos de 3 vías con diff visual.

---

## Stack Tecnológico

El proyecto está construido sobre las siguientes tecnologías:

- **Frontend**:
  - [React 19](https://react.dev/) — Biblioteca de interfaces de usuario basada en componentes funcionales y hooks.
  - [TypeScript](https://www.typescriptlang.org/) — Tipado estático para robustez del modelo de datos narrativo.
  - [Vite](https://vitejs.dev/) — Herramienta de compilación rápida y servidor de desarrollo.
  - [Tailwind CSS v4](https://tailwindcss.com/) — Framework de utilidades CSS para diseño responsive y temas visuales.
  - [Motion](https://motion.dev/) — Animaciones fluidas para modales, transiciones y elementos de interfaz.
  - [Lucide React](https://lucide.dev/) — Iconografía coherente en toda la aplicación.
  - [react-markdown](https://github.com/remarkjs/react-markdown) — Renderizado seguro de contenido en Markdown.

- **Documentos y Medios**:
  - [docx](https://docx.js.org/) — Generación y exportación de archivos Word con metadatos y encabezados.
  - [pdfjs-dist](https://mozilla.github.io/pdf.js/) — Procesamiento y previsualización de archivos PDF embebidos.

- **Servidor y Backend**:
  - [Express](https://expressjs.com/) — Servidor HTTP Node.js sirviendo rutas de soporte y middleware de Vite.
  - [tsx](https://github.com/privatenumber/tsx) / [esbuild](https://esbuild.github.io/) — Ejecución directa de TypeScript en desarrollo y empaquetado optimizado para producción.

- **Nube y Persistencia**:
  - [Firebase SDK v12](https://firebase.google.com/) — Autenticación con Google y base de datos Firestore con persistencia local multidispositivo.

- **Inteligencia Artificial (Experimental)**:
  - [@google/genai](https://www.npmjs.com/package/@google/genai) — Asistente de prosa literaria en el backend (conservado en estado experimental; no modificado en esta fase).

---

## Instalación

1. Clona el repositorio o abre el espacio de trabajo:
   ```bash
   git clone <url-del-repositorio>
   cd novelore
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

---

## Desarrollo

Inicia el entorno de desarrollo local:

```bash
npm run dev
```

El servidor Express se iniciará en `http://localhost:3000`, sirviendo simultáneamente las rutas de API y la aplicación web mediante el middleware de Vite.

Para verificar tipos sin compilar:
```bash
npm run lint
```

Para generar la compilación de producción:
```bash
npm run build
```

---

## Configuración

La aplicación puede configurarse mediante variables de entorno en un archivo `.env` en la raíz del proyecto. Consulta `.env.example` para los nombres canónicos:

```env
# Configuración del asistente de IA en el servidor (opcional)
GEMINI_API_KEY="your_api_key_here"

# URL pública de la aplicación
APP_URL="http://localhost:3000"

# Las credenciales de Firebase se encuentran en firebase-applet-config.json
# Ejemplo de configuración cliente si se migra a variables de entorno:
# VITE_FIREBASE_API_KEY="your_firebase_api_key_here"
# VITE_FIREBASE_PROJECT_ID="your_project_id_here"
```

> **Nota de seguridad**: Nunca incluyas claves de API ni credenciales secretas reales en archivos versionados por Git.

---

## Estructura del Proyecto

```
novelore/
├── docs/                     # Documentación técnica, arquitectura, roadmap y convenciones
├── server.ts                 # Servidor Express, endpoints y middleware de Vite
├── firebase-blueprint.json   # Esquema estructural de Firestore
├── firestore.rules           # Reglas de seguridad de Firestore
├── package.json              # Metadatos del proyecto y dependencias
├── src/
│   ├── main.tsx              # Punto de entrada de la aplicación React
│   ├── App.tsx               # Orquestación de estado principal, vistas y sincronización
│   ├── types.ts              # Modelo de datos y tipos principales de Novelore
│   ├── components/
│   │   ├── Navbar.tsx        # Barra de navegación superior
│   │   ├── CloudSyncModal.tsx# Sincronización en la nube y autenticación
│   │   ├── ConflictResolutionModal.tsx # Resolución de conflictos de 3 vías
│   │   ├── ThemeModal.tsx    # Selector de paletas y tipografía
│   │   ├── editor/           # Editor, inspector y panel de manuscrito
│   │   ├── planning/         # Línea temporal, corcho, arcos narrativos y matriz
│   │   ├── codex/            # Códice del mundo, dossiers y mapa de relaciones
│   │   ├── board/            # Pizarra visual infinita y recursos multimedia
│   │   ├── export/           # Vistas y modales de exportación (DOCX, MD, TXT)
│   │   ├── home/             # Selector y creación de proyectos
│   │   └── project/          # Versiones, metas de palabras y ajustes
│   ├── data/                 # Proyecto de demostración inicial
│   ├── lib/                  # Adaptador modular de Firebase (Auth y Firestore)
│   └── utils/                # Persistencia local, exportador DOCX y utilidades
```

---

## Documentación Detallada

- [Arquitectura del Sistema](docs/architecture.md)
- [Guía de Desarrollo y Principios](docs/development.md)
- [Roadmap Técnico](docs/roadmap.md)
- [Inventario de Dependencias](docs/dependencies.md)
- [Decisiones Técnicas](docs/technical-decisions.md)
- [Convenciones de Código](docs/conventions.md)
