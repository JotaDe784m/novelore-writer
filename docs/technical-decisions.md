# Technical Decisions — Novelore Desktop (Local-First)

Este documento registra las decisiones arquitectónicas y técnicas fundamentales implementadas en **Novelore**, describiendo su justificación técnica, comportamiento en tiempo de ejecución y principios rectores.

---

## 1. Soberanía de Datos y Formato de Proyecto en Disco

- **Decisión**: Cada proyecto de novela es una carpeta física en el sistema de archivos del usuario. La prosa se almacena en archivos Markdown (`.md`) independientes por escena, y los metadatos estructurales y de planificación en archivos JSON (`project.json`, `manuscript.json`, `codex.json`, `planning.json`).
- **Justificación**:
  - Garantiza que las palabras del autor le pertenezcan para siempre en un formato abierto y legible por cualquier editor de texto.
  - Elimina el riesgo de corrupción catastrófica de bases de datos monolíticas.
  - Permite que herramientas de sincronización externas (Google Drive, Dropbox, Syncthing, Git) transfieran solo los pequeños archivos `.md` modificados en milisegundos, evitando conflictos de sincronización.

---

## 2. Entorno de Escritorio Nativo con Electron

- **Decisión**: Se selecciona **Electron** como cascarón de escritorio sobre el pipeline existente de **Vite + React 19 + TypeScript**.
- **Justificación**:
  - Proporciona acceso directo, fiable y seguro al sistema de archivos local (`node:fs/promises`) y a los selectores de carpetas nativos del sistema operativo mediante IPC.
  - Permite reutilizar el 100% de la interfaz de usuario, temas, modales y utilidades tipográficas ya construidas, evitando reescrituras complejas en lenguajes de bajo nivel.
  - Garantiza soporte multiplataforma nativo (Linux, Windows, macOS).

---

## 3. Estado Modular con Zustand y Guardado Granular Desacoplado

- **Decisión**: Se abandona el estado monolítico centralizado en `App.tsx` en favor de almacenes reactivos modulares en **Zustand** (`useProjectStore`, `useManuscriptStore`, `useCodexStore`, `usePlanningStore`, `useBoardStore`), acompañados de una estrategia de **guardado atómico granular con debounce de 500 ms**.
- **Justificación**:
  - Al escribir en el editor de manuscrito, la aplicación escribe en disco únicamente el archivo `.md` de la escena activa.
  - Modificar una ficha del Códice actualiza exclusivamente `codex.json`, sin reescribir ni recalcular el manuscrito.
  - El rendimiento de la interfaz es completamente inmune al tamaño de la novela, garantizando fluidez constante incluso en manuscritos de más de 200.000 palabras.

---

## 4. Gestión Física de Activos y Fuentes en `/assets/`

- **Decisión**: Todo archivo binario (portadas, fotos del códex, fuentes tipográficas `.ttf`/`.otf` y documentos PDF adjuntos) se copia físicamente dentro de la subcarpeta local `/assets/` del proyecto.
- **Justificación**:
  - Elimina por completo las cadenas Base64 en memoria y en archivos de texto, reduciendo drásticamente el consumo de memoria RAM.
  - Asegura que el proyecto sea 100% autónomo y portable: si el autor comprime la carpeta o la mueve de equipo, ningún enlace visual o tipográfico se pierde.

---

## 5. Purga Total de Nubes Propietarias y Backends Remotos

- **Decisión**: Eliminación completa de Firebase Authentication, Cloud Firestore, Firebase Storage y dependencias de servidor centralizado.
- **Justificación**:
  - Cero costes de infraestructura para el autor.
  - Privacidad total: ningún manuscrito pasa por servidores de terceros ni depende de la disponibilidad de un backend remoto.
  - Funcionamiento autónomo garantizado al 100% sin conexión a internet (*offline-first*).

---

## 6. Sincronización Administrada por el Usuario

- **Decisión**: La sincronización entre dispositivos no se realiza a través de servidores propios de Novelore, sino a través de los servicios de almacenamiento en la nube personales del usuario (**Google Drive, Dropbox, OneDrive, Syncthing, Git**).
- **Justificación**:
  - El autor gestiona su privacidad y almacenamiento con los servicios en los que ya confía.
  - La arquitectura de archivos atómicos (`.md`) está optimizada de forma natural para este flujo.
  - En fases posteriores se podrán añadir conectores OAuth de escritorio para facilitar la vinculación directa con cuentas personales.

---

## 7. Sistema de Diseño UI/UX: Libertad Creativa y Espacio Respirable

- **Decisión**: Adopción formal del Sistema de Diseño definido en `docs/design-system.md`:
  - Eliminación sistemática de marcos y líneas duras (`border border-[...]`) en favor de contraste tonal suave entre superficies (`--bg-sidebar` vs `--bg-editor`).
  - Botones fantasma sin contorno (*ghost buttons*) y espacios respirables.
  - Layout de 3 columnas fluidas con capacidad de colapso total hacia los bordes (estilo Obsidian/Scrivener).
  - Editor central ergonómico con columna de lectura óptima fija de **~720px (65-75 caracteres por línea)**, márgenes automáticos generosos y modo máquina de escribir (estilo Ulysses/iA Writer).
  - Redefinición de los temas como **Atmósferas Visuales** con paletas de superficie y acentos personalizables, independientes de la configuración tipográfica del autor.
- **Justificación**:
  - La escritura de novelas requiere sesiones prolongadas de concentración profunda. Las interfaces cargadas de cajas, tablas densas y marcos rígidos fatigan la vista y distraen el flujo narrativo.
