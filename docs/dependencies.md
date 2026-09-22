# Dependencies

This document provides a categorized inventory of all external packages utilized in **Novelore**, based directly on `package.json`. No dependencies were added, updated, or removed in Phase 0.

---

## Core

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **react** | `^19.0.1` | Declarative UI library powering components, state, and rendering. |
| **react-dom** | `^19.0.1` | DOM renderer for React web components. |
| **typescript** | `~5.8.2` | Static typing system ensuring structural safety across narrative data models. |
| **vite** | `^6.2.3` | Modern frontend build tool, asset bundler, and dev server middleware. |
| **@vitejs/plugin-react** | `^5.0.4` | Vite plugin providing Fast Refresh and JSX compilation for React. |
| **tsx** | `^4.21.0` | TypeScript execution engine running `server.ts` seamlessly in development. |
| **esbuild** | `^0.25.0` | Fast bundler compiling `server.ts` into standalone `dist/server.cjs` for production. |

---

## UI & Styling

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **tailwindcss** | `^4.1.14` | Utility-first CSS framework defining layout, colors, and responsive rules. |
| **@tailwindcss/vite** | `^4.1.14` | Direct Vite integration plugin for Tailwind CSS v4. |
| **autoprefixer** | `^10.4.21` | PostCSS plugin parsing CSS and adding vendor prefixes. |
| **motion** | `^12.23.24` | Production-ready motion library powering modals, accordion transitions, and layout animations. |
| **lucide-react** | `^0.546.0` | Comprehensive icon library for editors, toolbars, and dashboard controls. |

---

## Editor & Markdown

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **react-markdown** | `^10.1.0` | Secure component for parsing and rendering Markdown in notes, boards, and synopses. |

---

## Cloud & Persistence

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **firebase** | `^12.18.0` | Google Cloud SDK supplying Firebase Authentication (Google Sign-In) and Firestore document storage with persistent local cache. |

---

## Export & Documents

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **docx** | `^9.7.1` | Pure JavaScript library for generating formatted Microsoft Word `.docx` documents from manuscript acts and scenes. |
| **pdfjs-dist** | `^6.3.289` | PDF parsing and rendering library used for embedding and previewing research documents on Visual Boards. |

---

## Server

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **express** | `^4.21.2` | Minimalist web framework hosting API routes, health checks, and Vite middleware. |
| **dotenv** | `^17.2.3` | Zero-dependency module loading environment variables from `.env` into `process.env`. |
| **@types/express** | `^4.17.21` | TypeScript type declarations for Express request and response objects. |
| **@types/node** | `^22.14.0` | TypeScript type definitions for Node.js runtime globals and built-in modules (`path`, `process`, `fs`). |

---

## AI (Experimental)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **@google/genai** | `^2.4.0` | Official Google Gen AI SDK for interacting with Gemini models server-side in `server.ts`. |

*Note: The AI integration is experimental and strictly isolated to server-side assistance; it is not modified or expanded in Phase 0.*
