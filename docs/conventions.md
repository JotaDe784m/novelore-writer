# Development Conventions

This document establishes the code, structural, and architectural conventions for all future phases of **Novelore**. These conventions maintain consistency with the existing codebase without requiring disruptive mass rewrites.

---

## 1. Naming Conventions

- **Components**: Use `PascalCase` for React component files and functions (e.g., `ManuscriptSidebar.tsx`, `RichTextEditor.tsx`, `EntityModal.tsx`).
- **Utilities & Helpers**: Use `camelCase` for module files and helper functions (e.g., `storage.ts`, `docxExport.ts`, `calculateTotalWords`).
- **Interfaces & Types**: Use `PascalCase` for types and interfaces in `src/types.ts` (e.g., `NovelProject`, `WorldEntity`, `TimelineTrack`).
- **Constants**: Use `UPPER_SNAKE_CASE` for global constants or persistent storage keys (e.g., `CURRENT_PROJECT_KEY`, `DEMO_DISMISSED_KEY`).
- **CSS Classes**: Follow standard Tailwind CSS utility naming directly in JSX `className` props.

---

## 2. Components

- **Focused Scope**: Strive for components with a single clear purpose (e.g., presentation, input handling, or modal dialogs).
- **Avoid Giant Monoliths**: When adding new functionality, create specialized sub-components rather than appending hundreds of lines to existing views.
- **De-nesting**: Avoid deeply nested inline JSX structures. Extract repeated row items, cards, or list entries into separate component files.
- **Prop Interface**: Define explicit TypeScript props for every component (`interface MyComponentProps { ... }`). Avoid `any`.

---

## 3. Custom Hooks

- **Purpose**: Extract complex or reusable stateful logic (e.g., keyboard shortcuts, word count metrics, debounced timers, or drag-and-drop mechanics) into dedicated hooks named with the `use` prefix.
- **No Artificial Abstractions**: Do not create hooks that merely forward a single `useState` or wrap trivial one-line logic. Only introduce a custom hook when it encapsulates cohesive domain behavior.

---

## 4. Types & Data Models

- **Single Source of Truth**: All domain entities must be imported from `src/types.ts`.
- **No Duplication**: Never declare duplicate or local variants of `Scene`, `Chapter`, `Act`, `WorldEntity`, or `NovelProject` in individual component files.
- **Strict Typing**: Avoid `any` and type assertions (`as unknown as ...`) whenever possible. Use optional chaining (`?.`) and safe default values.

---

## 5. State Management

- **Single Source of Truth**: Avoid maintaining duplicate pieces of state that represent the same underlying data (e.g., caching a scene's text in multiple disconnected state variables).
- **Immutable Updates**: Always update nested project structures immutably using functional state updaters (`setProject(prev => ({ ...prev, ... }))`).
- **Derivation Over Storage**: Calculate derived metrics (such as total manuscript word counts, scene completion percentages, or character mention counts) using `useMemo` instead of storing them as redundant state variables.

---

## 6. Persistence

- **Separation of Concerns**: Isolate persistence operations within `src/utils/storage.ts` (for `localStorage`) and `src/lib/firebase.ts` (for Firestore).
- **No Direct Storage in Presentation**: UI components should never invoke `localStorage.setItem` or direct Firestore SDK calls inline; they should call established adapter functions or trigger state update handlers passed down from parent controllers.

---

## 7. Refactoring Strategy

- **Never Refactor by Size Alone**: Do not split or rewrite a component merely because it has many lines of code. First understand all its responsibilities, dependencies, event lifecycles, and side effects.
- **Incremental & Tested**: Refactor incrementally, one module at a time, verifying that compilation, type checking, and functional behaviors remain intact after each step.
- **Preserve Existing Behavior**: Any refactoring must strictly maintain current UX, styling, data contracts, and keyboard interactions.

---

## 8. Introducing New Features

Before adding any new feature:
1. **Review the existing data model**: Verify whether `src/types.ts` already supports the required fields or if an existing property can be leveraged.
2. **Review related components**: Check if an existing UI element (e.g., modal, sidebar, inspector tab) is the natural location for the feature before creating a new view.
3. **Reuse existing infrastructure**: Use the existing theme tokens, icon set (`lucide-react`), animation utilities (`motion`), and storage handlers.
4. **Avoid duplicating functionality**: Ensure the feature does not overlap or conflict with existing tools (such as Corkboard vs. Outline Matrix, or Timeline vs. Story Beats).
