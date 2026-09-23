# Guía de Desarrollo — Novelore Desktop

Esta guía describe el entorno de desarrollo, procedimientos de ejecución, estructura del proyecto y principios de trabajo para contribuir en **Novelore**.

---

## 1. Requisitos del Entorno

- **Node.js**: Versión 20.x o superior recomendada (o runtime Bun compatible).
- **Gestor de Paquetes**: `npm` (v10+) o `bun`.
- **Sistema Operativo**: Linux, Windows o macOS.

---

## 2. Instalación y Configuración Inicial

1. Clona el repositorio e ingresa al directorio del proyecto:
   ```bash
   git clone <url-del-repositorio>
   cd novelore
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

---

## 3. Comandos de Ejecución y Desarrollo

- **Modo Desarrollo (Interfaz Web con Vite)**:
  ```bash
  npm run dev
  ```
  Inicia el servidor de desarrollo rápido de Vite con recarga en caliente (*Hot Module Replacement*).

- **Modo Desarrollo de Escritorio (Electron)**:
  ```bash
  npm run dev:electron
  ```
  Inicia la aplicación de escritorio cargando la ventana nativa de Electron conectada al servidor local de desarrollo.

- **Comprobación de Tipos y Calidad de Código**:
  ```bash
  npm run lint
  ```
  Ejecuta la verificación estática de TypeScript (`tsc --noEmit`) para garantizar que no existan errores de tipado en ningún componente o modelo.

- **Compilación de Producción**:
  ```bash
  npm run build
  ```
  Genera el paquete optimizado de la interfaz en la carpeta `dist/`.

---

## 4. Reglas de Contribución

1. **Cumplimiento Estricto de AGENTS.md**: Ningún cambio debe introducir dependencias remotas propietarias ni violar el modelo de persistencia física en disco.
2. **Desarrollo Modular por Fases**: Respeta el roadmap en `docs/roadmap.md`. Solo se trabaja en la fase o subfase activa, verificando su estabilidad antes de avanzar.
3. **Preservación de la Experiencia de Usuario**: Todo cambio debe conservar y respetar los componentes de diseño, paletas cromáticas, temas y herramientas tipográficas ya maquetadas.
