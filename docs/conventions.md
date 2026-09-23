# Convenciones de Desarrollo — Novelore Desktop

Este documento establece las convenciones de código, diseño estructural y arquitectura que deben mantenerse en el desarrollo de **Novelore**. Estas reglas aseguran coherencia técnica, legibilidad y facilidad de mantenimiento.

---

## 1. Convenciones de Nomenclatura

- **Componentes React**: Usar `PascalCase` para archivos y funciones de componentes (ej. `ManuscriptSidebar.tsx`, `RichTextEditor.tsx`, `EntityModal.tsx`).
- **Utilidades y Helpers**: Usar `camelCase` para archivos de utilidades y funciones auxiliares (ej. `docxExport.ts`, `formatSpanishDialogue.ts`, `calculateTotalWords`).
- **Interfaces y Tipos**: Usar `PascalCase` para tipos e interfaces en `src/types.ts` o archivos `*.ts` de dominio (ej. `NovelProject`, `WorldEntity`, `TimelineTrack`).
- **Almacenes de Estado (Zustand)**: Usar prefijo `use` y sufijo `Store` en `camelCase` (ej. `useProjectStore`, `useManuscriptStore`, `useCodexStore`).
- **Clases CSS**: Seguir las clases utilitarias de Tailwind CSS directamente en la propiedad `className` de los elementos JSX.

---

## 2. Componentes

- **Responsabilidad Clara**: Los componentes deben tener una única responsabilidad (presentación pura, manejo de formulario o diálogo modal).
- **Evitar Monolitos Gigantes**: Al implementar nueva funcionalidad, extraer subcomponentes cohesivos en lugar de añadir cientos de líneas a vistas existentes.
- **Interfaces de Propiedades Explícitas**: Definir tipos claros con TypeScript para los props (`interface MyComponentProps { ... }`). Evitar el uso de `any`.

---

## 3. Tipos y Modelos de Datos

- **Fuente Única de Verdad**: Todas las entidades del dominio narrativo deben residir o reexportarse desde `src/types.ts`.
- **Sin Duplicación de Modelos**: No declarar variantes locales de `Scene`, `Chapter`, `Act`, `WorldEntity` o `NovelProject` en componentes individuales.
- **Tipado Estricto**: Evitar aserciones ciegas de tipo (`as unknown as ...`). Usar encadenamiento opcional (`?.`) y valores predeterminados seguros.

---

## 4. Gestión del Estado (Zustand)

- **Desacoplamiento por Dominios**: Mantener stores separados para Proyecto, Manuscrito, Códice, Planificación y Pizarras.
- **Mutaciones Inmutables**: Realizar siempre actualizaciones inmutables en los stores.
- **Cálculo Derivado**: Calcular métricas derivadas (palabras totales, porcentajes de avance, menciones de personajes) mediante `useMemo` o selectores de Zustand en lugar de duplicar variables redundantes de estado.

---

## 5. Persistencia y Acceso al Sistema de Archivos

- **Aislamiento de la Persistencia**: La comunicación con el sistema de archivos local se realiza exclusivamente a través de los adaptadores y puentes IPC de Electron expuestos en `window.electronAPI`.
- **Sin Operaciones de Disco en la Vista**: Los componentes de la interfaz de usuario nunca deben realizar operaciones de entrada/salida de archivos directamente; deben invocar acciones de los stores de Zustand, los cuales coordinan el guardado granular.
- **Guardado Atómico y con Debounce**: Las escrituras de texto en disco deben implementar un *debounce* mínimo (ej. 500 ms tras dejar de escribir) para proteger la fluidez del hilo de renderizado.

---

## 6. Estrategia de Refactorización

- **Preservación Estricta de la UX**: Cualquier refactorización de código debe mantener intactos el diseño visual, las paletas temáticas, las fuentes y los atajos de teclado ya existentes.
- **Progreso Modular e Incremental**: Refactorizar un módulo a la vez, comprobando la estabilidad del sistema y la ausencia de errores de tipos (`npm run lint`) en cada iteración.
