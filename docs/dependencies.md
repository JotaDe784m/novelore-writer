# Inventario de Dependencias — Novelore Desktop

Este documento detalla el inventario categorizado de paquetes y bibliotecas que conforman **Novelore**. Toda dependencia externa se justifica por su aportación a la experiencia literaria, la solidez del sistema de escritorio o el rendimiento de la interfaz.

---

## 1. Entorno de Escritorio y Compilación

| Paquete | Propósito |
| :--- | :--- |
| **electron** | Entorno de ejecución de escritorio multiplataforma (Linux, Windows, macOS) que proporciona acceso seguro al sistema de archivos local (`node:fs/promises`) e IPC. |
| **vite** | Herramienta de compilación ultrarrápida y servidor de desarrollo con Hot Module Replacement (HMR). |
| **@vitejs/plugin-react** | Plugin oficial de Vite para soporte JSX y Fast Refresh en React. |
| **typescript** | Tipado estático estricto que asegura la coherencia del modelo de datos narrativo y evita errores de ejecución. |

---

## 2. Capa de Presentación e Interfaz de Usuario

| Paquete | Propósito |
| :--- | :--- |
| **react** | Biblioteca declarativa de interfaz de usuario basada en componentes y hooks. |
| **react-dom** | Renderizador DOM para la interfaz de React. |
| **tailwindcss** | Framework de utilidades CSS para diseño responsivo, tipografía y paletas cromáticas personalizadas. |
| **@tailwindcss/vite** | Integración nativa de Tailwind CSS v4 en el pipeline de Vite. |
| **motion** | Motor de animaciones fluidas para transiciones de modales, acordeones y estados visuales. |
| **lucide-react** | Catálogo coherente de iconografía vectorial para herramientas de edición, códex y navegación. |

---

## 3. Estado Local y Manejo de Prosa

| Paquete | Propósito |
| :--- | :--- |
| **zustand** | Gestor de estado reactivo, ligero y modular para desacoplar el estado de la novela y posibilitar el guardado granular por archivo. |
| **react-markdown** | Renderizado seguro de contenido en formato Markdown para notas de escena y sinopsis. |

---

## 4. Documentos, Medios y Maquetación Editorial

| Paquete | Propósito |
| :--- | :--- |
| **docx** | Generación de documentos Microsoft Word (`.docx`) profesionales con encabezados, notas al pie y estilos de párrafo tipográficos. |
| **pdfjs-dist** | Procesamiento y visualización embebida de documentos PDF de investigación en las pizarras visuales. |

---

## 5. Prohibiciones de Dependencias

- **Prohibido**: Paquetes de servidores en la nube propietarios (`firebase`, `@firebase/*`, `supabase`, etc.).
- **Prohibido**: Bases de datos remotas o middleware de autenticación cerrado.
