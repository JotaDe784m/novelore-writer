# Novelore — Directrices para Agentes de Desarrollo (AGENTS.md)

Este documento establece las **reglas de ingeniería, restricciones inviolables y directrices arquitectónicas** que todo agente de IA, desarrollador o colaborador debe cumplir al trabajar en el repositorio de **Novelore**.

---

## 1. Principio Fundamental: Soberanía Local Absoluta (Local-First)

Novelore es una **aplicación de escritorio local-first** diseñada para escritores, novelistas y creadores de mundos (*worldbuilders*). 

1. **El usuario es el único dueño de sus datos**: Todo proyecto de novela reside como una carpeta física en el disco duro del usuario, en la ruta que este elija.
2. **Formatos Abiertos y Transparentes**:
   - La prosa del manuscrito se almacena exclusivamente en archivos **Markdown (`.md`) limpios**, organizados por actos y capítulos.
   - La estructura, metadatos del códex, planificación y configuraciones se almacenan en archivos **JSON legibles y estructurados** (`project.json`, `manuscript.json`, `codex.json`, `planning.json`, `boards/`).
   - Los archivos multimedia (imágenes, avatares, fuentes tipográficas `.ttf`/`.otf` y documentos PDF) se copian físicamente en una subcarpeta local `/assets/` dentro del proyecto.
3. **Prohibición de Servidores Propietarios y Nubes Embebidas**:
   - Queda estrictamente prohibida la introducción de servicios en la nube propietarios (Firebase, Firestore, Supabase o cualquier backend centralizado).
   - La aplicación debe ser 100% operativa sin conexión a internet (*offline-first*).

---

## 2. Sincronización en la Nube Administrada por el Usuario

La sincronización entre dispositivos no se realiza mediante servidores de Novelore, sino a través de **servicios externos estándar de almacenamiento personal**:
- El usuario puede guardar su carpeta de proyecto en carpetas sincronizadas por sus propios clientes de escritorio (**Google Drive, Dropbox, OneDrive, Syncthing, etc.**).
- En fases planificadas, la aplicación incorporará integración con APIs de proveedores externos (Google Drive, Dropbox, OneDrive/Outlook) gestionada exclusivamente a través de las cuentas personales y credenciales directas del propio autor.
- La arquitectura de almacenamiento modular de Novelore (un archivo `.md` por escena) está diseñada específicamente para optimizar este modelo: los sincronizadores solo transfieren archivos pequeños modificados, eliminando los riesgos de corrupción o conflictos de bases de datos monolíticas.

---

## 3. Stack Tecnológico Aprobado

* **Entorno de Escritorio**: **Electron** con comunicación por canales IPC seguros (`contextBridge` y `preload`).
* **Frontend**: **React 19 + TypeScript + Vite + Tailwind CSS**.
* **Gestión de Estado**: **Zustand** organizado por dominios modulares.
* **Persistencia en Disco**: Sistema de archivos nativo de Node.js (`node:fs` / `fs/promises`), coordinado por el proceso principal de Electron a través de IPC.
* **Manejo de Guardado**: Estrategia de guardado modular e incremental con *debounce* (500 ms tras dejar de escribir) para no saturar el disco ni bloquear el hilo de renderizado.

---

## 4. Principio de Diseño UI/UX: Libertad Creativa y Espacio Respirable

Todo agente debe cumplir estrictamente las especificaciones del sistema de diseño recogidas en `docs/design-system.md`:

1. **Prohibición de Interfaces Tipo "Dashboard / Panel Administrativo"**:
   - Queda estrictamente prohibido rodear componentes con marcos pesados o líneas divisorias rígidas (`border border-[...]`).
   - La delimitación visual entre paneles y tarjetas debe lograrse mediante **contraste tonal suave de superficies** y **márgenes generosos**.
   - Los botones deben ser limpios y sin contorno (*ghost/flat*), reaccionando con un fondo suave (*hover tint*).
2. **Arquitectura de 3 Columnas Fluidas con Colapso Total**:
   - La barra izquierda (manuscrito) y el inspector derecho deben ser capaces de replegarse al 100% hacia los bordes, dejando el editor en aislamiento absoluto.
3. **Ergonomía Literaria Central (Ulysses / iA Writer)**:
   - El editor debe mantener una columna de lectura óptima centrada de **~720px (65-75 caracteres por línea)** con márgenes laterales respirables.
   - Debe soportar desplazamiento de máquina de escribir (*typewriter scrolling*) y modo de foco por párrafo.
4. **Atmósferas Visuales Desacopladas**:
   - Los temas cromáticos definen paletas de superficie y acentos personalizables, sin imponer ni forzar la tipografía o el tamaño de letra elegido por el autor.

---

## 5. Regla de Trabajo Modular por Fases

El desarrollo debe seguir de forma estricta el **Plan de Desarrollo por Fases** definido en `docs/roadmap.md`.

1. **Una fase a la vez**: Queda prohibido avanzar a una fase posterior sin haber completado, integrado y verificado la fase actual.
2. **Refactorización Limpia y Progresiva**: Cada módulo añadido o refactorizado debe adoptar el sistema de diseño (`docs/design-system.md`) y Zustand, libre de deuda técnica de la versión web anterior.
3. **Verificación Continua**: Al completar cada subfase, se deben verificar la compilación de TypeScript (`npm run lint` / `tsc --noEmit`), el empaquetado y el correcto guardado y lectura de archivos en disco.
