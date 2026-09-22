# Development Guide

This guide outlines the development environment, execution procedures, project structure, and architectural principles for contributing to **Novelore**.

---

## Requirements

- **Node.js**: Version 18.x or 20.x or higher.
- **Package Manager**: `npm` (v9+ or v10+).
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge with modern ES modules and Canvas support.

---

## Installation

Clone the repository and install all dependencies:

```bash
git clone <repository-url>
cd novelore
npm install
```

---

## Environment Variables

Environment variables are defined in `.env` (refer to `.env.example` for the template):

```env
# Optional: API key for server-side Gemini writing assistant calls
GEMINI_API_KEY="your_api_key_here"

# Optional: Host URL for the app instance
APP_URL="http://localhost:3000"
```

Firebase credentials are provided in `firebase-applet-config.json` for client configuration. Never hardcode or commit secret credentials.

---

## Running Locally

To start the development server:

```bash
npm run dev
```

- This command runs `tsx server.ts`.
- The Express server starts on `http://0.0.0.0:3000`.
- Vite runs as middleware within the Express server, providing live reload and on-demand bundling for all frontend modules.
- Verification and linting:
  ```bash
  npm run lint    # Runs TypeScript type check (tsc --noEmit)
  npm run build   # Produces production bundle and dist/server.cjs
  ```

---

## Project Structure

```
novelore/
├── docs/                 # Project documentation and architectural records
├── server.ts             # Node Express server and API endpoints
├── firestore.rules       # Cloud Firestore security rules
├── firebase-blueprint.json # Firestore document structure blueprint
├── package.json          # Project manifest and scripts
├── src/
│   ├── main.tsx          # React application entry point
│   ├── App.tsx           # Global state orchestrator and active view switcher
│   ├── types.ts          # Core domain models (Project, Scene, Entity, etc.)
│   ├── components/
│   │   ├── editor/       # Manuscript text editor, sidebar, and scene inspector
│   │   ├── planning/     # Timeline, corkboard, story arcs, and outline matrix
│   │   ├── codex/        # Worldbuilding entities, dossiers, and relationship map
│   │   ├── board/        # Visual moodboards, canvas items, and resource modals
│   │   ├── export/       # Export settings and preview views
│   │   ├── home/         # Dashboard for project creation and selection
│   │   └── project/      # Settings, word goals, and version history modals
│   ├── data/             # Demo project template
│   ├── lib/              # Firebase Auth and Firestore adapter
│   └── utils/            # Local storage, word counting, and DOCX generation
```

---

## Development Principles

To ensure software quality, prevent regression bugs, and maintain architectural clarity, all future changes must follow these ten development principles:

1. **Prefer small, focused components**: Break down large visual surfaces into small, single-purpose components whenever introducing new features or refactoring.
2. **Avoid unnecessary abstractions**: Do not invent generic helper frameworks or wrapper layers when a direct, readable solution is sufficient.
3. **Keep domain logic separate from UI when practical**: Extract complex narrative calculations, formatting routines, and validation logic into utility functions or custom hooks.
4. **Do not duplicate data models**: Always import domain interfaces from `src/types.ts`. Never declare parallel or conflicting definitions of `Scene`, `WorldEntity`, or `NovelProject`.
5. **Reuse existing types**: Leverage existing interfaces, optional fields, and union types before adding new properties to core schemas.
6. **Preserve backward compatibility when possible**: When extending storage schemas, ensure existing local projects and saved Firestore documents continue to load seamlessly with safe fallbacks.
7. **Avoid unnecessary dependency additions**: Rely on existing libraries (`motion`, `lucide-react`, `docx`, `pdfjs-dist`, `react-markdown`) before considering new npm packages.
8. **Keep components focused on one responsibility**: Separate presentation logic from storage access, remote synchronization, or modal controls.
9. **Do not mix persistence logic unnecessarily with UI logic**: Isolate direct `localStorage` and Firestore read/write operations behind designated storage adapters.
10. **Test existing behavior after structural changes**: Always verify that existing features (editing, planning, codex, boards, export) continue functioning properly after any modifications.

---

## Code Style

- **Language**: TypeScript with explicit typings for public function signatures and domain entities.
- **Component Pattern**: React functional components with standard React hooks (`useState`, `useEffect`, `useMemo`, `useRef`).
- **Styling**: Tailwind CSS utility classes. Avoid inline style objects except for dynamic mathematical positions (such as canvas pan/zoom coordinates and connector curves).
- **Icons**: Standardized on `lucide-react`.
- **Animations**: Standardized on `motion` (imported from `motion/react`).
- **Consistency**: Maintain existing naming conventions and patterns. Do not introduce alternative UI component libraries or competing CSS-in-JS frameworks.
