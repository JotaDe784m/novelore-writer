import React, { useRef, useEffect, useState } from "react";
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Type,
  AlignLeft,
  AlignJustify,
  Indent,
  Outdent,
  BookOpen,
  Clock,
  Wand2,
  Upload,
  Trash2,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Copy,
  CaseSensitive,
  FileText,
  PanelRight,
  Undo2,
  Redo2,
} from "lucide-react";
import { NovelProject, Scene, SceneStatus } from "../../types";
import {
  countCharacters,
  countWords,
  calculateReadingTimeMinutes,
  formatSpanishDialogue,
  insertEmDashAtCursor,
} from "../../utils/formatters";

interface RichTextEditorProps {
  scene: Scene | null;
  project: NovelProject;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onUpdateProjectSettings: (updates: Partial<NovelProject["settings"]>) => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  onOpenInspector: () => void;
  isInspectorOpen: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  scene,
  project,
  onUpdateScene,
  onUpdateProjectSettings,
  isZenMode,
  setIsZenMode,
  onOpenInspector,
  isInspectorOpen,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customFontInputRef = useRef<HTMLInputElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const spacingMenuRef = useRef<HTMLDivElement>(null);

  const [notification, setNotification] = useState<string | null>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Undo / Redo history state
  const [history, setHistory] = useState<string[]>(() => [scene?.content || ""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastRecordedContentRef = useRef(scene?.content || "");
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoActionRef = useRef(false);

  // Sync undo history when switching scenes
  useEffect(() => {
    if (scene) {
      setHistory([scene.content || ""]);
      setHistoryIndex(0);
      lastRecordedContentRef.current = scene.content || "";
    }
  }, [scene?.id]);

  const pushToHistory = (newContent: string) => {
    if (newContent === lastRecordedContentRef.current) return;
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      const updated = [...truncated, newContent];
      if (updated.length > 60) {
        updated.shift();
      }
      return updated;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 59));
    lastRecordedContentRef.current = newContent;
  };

  const handleUndo = () => {
    if (!scene) return;
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    let currentIdx = historyIndex;
    let currentHist = history;

    // If current typing hasn't been committed to history yet, commit it now so we can undo back from it
    if (scene.content !== lastRecordedContentRef.current) {
      currentHist = [...history.slice(0, historyIndex + 1), scene.content || ""];
      currentIdx = currentHist.length - 1;
      setHistory(currentHist);
      setHistoryIndex(currentIdx);
      lastRecordedContentRef.current = scene.content || "";
    }

    if (currentIdx <= 0) return;

    const targetIndex = currentIdx - 1;
    const targetContent = currentHist[targetIndex] ?? "";
    isUndoRedoActionRef.current = true;
    setHistoryIndex(targetIndex);
    lastRecordedContentRef.current = targetContent;
    onUpdateScene(scene.id, {
      content: targetContent,
      wordCount: countWords(targetContent),
    });
    setTimeout(() => {
      isUndoRedoActionRef.current = false;
      textareaRef.current?.focus();
    }, 20);
  };

  const handleRedo = () => {
    if (!scene) return;
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    if (historyIndex >= history.length - 1) return;

    const targetIndex = historyIndex + 1;
    const targetContent = history[targetIndex] ?? "";
    isUndoRedoActionRef.current = true;
    setHistoryIndex(targetIndex);
    lastRecordedContentRef.current = targetContent;
    onUpdateScene(scene.id, {
      content: targetContent,
      wordCount: countWords(targetContent),
    });
    setTimeout(() => {
      isUndoRedoActionRef.current = false;
      textareaRef.current?.focus();
    }, 20);
  };

  const canUndo = historyIndex > 0 || (scene ? scene.content !== lastRecordedContentRef.current : false);
  const canRedo = historyIndex < history.length - 1;

  // Global keyboard shortcuts for Undo / Redo (when not inside the manuscript textarea)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // If focused in the editor textarea, its local onKeyDown handles it with stopPropagation
      if (target?.id === "novel-manuscript-textarea") return;
      // If focused in another input (like scene title input or modal), skip
      const isOtherInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (isOtherInput) return;

      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && !e.altKey) {
        // Undo: Ctrl+Z / Cmd+Z (without shift)
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
          return;
        }
        // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
        if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Close ribbon and status menus on pointer down outside
  useEffect(() => {
    if (!showFontMenu && !showSpacingMenu && !showStatusMenu) return;
    const handlePointerDownOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showFontMenu && fontMenuRef.current && !fontMenuRef.current.contains(target)) {
        setShowFontMenu(false);
      }
      if (showSpacingMenu && spacingMenuRef.current && !spacingMenuRef.current.contains(target)) {
        setShowSpacingMenu(false);
      }
      if (showStatusMenu && statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDownOutside);
    return () => document.removeEventListener("mousedown", handlePointerDownOutside);
  }, [showFontMenu, showSpacingMenu, showStatusMenu]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Inject custom font @font-face dynamically if present
  useEffect(() => {
    if (project.settings.customFontData && project.settings.customFontName) {
      const styleId = "novelore-custom-font-face";
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        @font-face {
          font-family: "${project.settings.customFontName}";
          src: url("${project.settings.customFontData}");
          font-display: swap;
        }
      `;
    }
  }, [project.settings.customFontData, project.settings.customFontName]);

  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const safeFontName = `Custom_${rawName.replace(/\s+/g, "_")}`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateProjectSettings({
          fontFamily: "custom",
          customFontName: safeFontName,
          customFontData: dataUrl,
        });
        showToast(`Fuente propia "${rawName}" cargada y aplicada`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setShowFontMenu(false);
  };

  const handleRemoveCustomFont = () => {
    onUpdateProjectSettings({
      fontFamily: "serif",
      customFontName: undefined,
      customFontData: undefined,
    });
    showToast("Fuente propia eliminada. Restaurado a Serif Clásica");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!scene) return;
    const newContent = e.target.value;
    const newWordCount = countWords(newContent);
    onUpdateScene(scene.id, {
      content: newContent,
      wordCount: newWordCount,
    });

    if (isUndoRedoActionRef.current) return;

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    const isMajor = Math.abs(newContent.length - lastRecordedContentRef.current.length) > 1 ||
                    newContent.endsWith(" ") || newContent.endsWith("\n");
    historyTimeoutRef.current = setTimeout(() => {
      pushToHistory(newContent);
    }, isMajor ? 200 : 450);
  };

  const handleInsertDash = () => {
    if (!textareaRef.current || !scene) return;
    insertEmDashAtCursor(textareaRef.current, (newText) => {
      onUpdateScene(scene.id, {
        content: newText,
        wordCount: countWords(newText),
      });
      pushToHistory(newText);
    });
    showToast("Guion largo '—' insertado");
  };

  const handleFormatAllDialogues = () => {
    if (!scene || !scene.content) return;
    const formatted = formatSpanishDialogue(scene.content);
    onUpdateScene(scene.id, {
      content: formatted,
      wordCount: countWords(formatted),
    });
    pushToHistory(formatted);
    showToast("Diálogos formateados según la norma RAE");
  };

  const handleInsertBreak = () => {
    if (!textareaRef.current || !scene) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value;
    const breakText = "\n\n* * *\n\n";

    const newText =
      originalText.substring(0, start) + breakText + originalText.substring(end);
    onUpdateScene(scene.id, {
      content: newText,
      wordCount: countWords(newText),
    });
    pushToHistory(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + breakText.length, start + breakText.length);
    }, 0);
  };

  const handleInsertGuillemets = () => {
    if (!textareaRef.current || !scene) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value;
    const selected = originalText.substring(start, end);
    const replacement = `«${selected || "texto"}»`;

    const newText =
      originalText.substring(0, start) + replacement + originalText.substring(end);
    onUpdateScene(scene.id, {
      content: newText,
      wordCount: countWords(newText),
    });
    pushToHistory(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + 1,
        start + 1 + (selected ? selected.length : 5)
      );
    }, 0);
  };

  const handleToggleCase = () => {
    if (!textareaRef.current || !scene) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const original = textarea.value;
    const selected = original.substring(start, end);

    let transformed = selected;
    if (selected === selected.toUpperCase()) {
      transformed = selected.toLowerCase();
    } else if (selected === selected.toLowerCase()) {
      // Capitalize words
      transformed = selected.replace(/\b\w/g, (c) => c.toUpperCase());
    } else {
      transformed = selected.toUpperCase();
    }

    const newText = original.substring(0, start) + transformed + original.substring(end);
    onUpdateScene(scene.id, { content: newText, wordCount: countWords(newText) });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
    }, 0);
    showToast("Formato de mayúsculas/minúsculas alternado");
  };

  const handleCopyContent = () => {
    if (!scene?.content) return;
    navigator.clipboard.writeText(scene.content);
    showToast("Contenido de la escena copiado al portapapeles");
  };

  /**
   * Enhanced Indentation handler: Supports Tab / Shift+Tab keyboard usage
   * and paragraph indentation via ribbon button.
   */
  const handleIndentOrOutdent = (isOutdent: boolean = false, forceParagraph: boolean = false) => {
    if (!textareaRef.current || !scene) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value || "";

    // If cursor at single position and not forcing paragraph start and not outdenting:
    if (start === end && !isOutdent && !forceParagraph) {
      const newText = originalText.substring(0, start) + "\t" + originalText.substring(end);
      onUpdateScene(scene.id, {
        content: newText,
        wordCount: countWords(newText),
      });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
      return;
    }

    // Paragraph-level indent / outdent (for single paragraph under cursor or multiple selected paragraphs)
    const lineStart = originalText.lastIndexOf("\n", start - 1) + 1;
    const nextNewline = originalText.indexOf("\n", end);
    const lineEnd = nextNewline === -1 ? originalText.length : nextNewline;

    const targetBlock = originalText.substring(lineStart, lineEnd);
    const lines = targetBlock.split("\n");

    let firstLineShift = 0;
    let totalShift = 0;

    const processedLines = lines.map((line, idx) => {
      if (isOutdent) {
        if (line.startsWith("\t")) {
          if (idx === 0) firstLineShift = -1;
          totalShift -= 1;
          return line.substring(1);
        } else if (line.startsWith("    ")) {
          if (idx === 0) firstLineShift = -4;
          totalShift -= 4;
          return line.substring(4);
        } else {
          const match = line.match(/^ +/);
          if (match) {
            const len = Math.min(match[0].length, 4);
            if (idx === 0) firstLineShift = -len;
            totalShift -= len;
            return line.substring(len);
          }
          return line;
        }
      } else {
        if (idx === 0) firstLineShift = 1;
        totalShift += 1;
        return "\t" + line;
      }
    });

    const newBlock = processedLines.join("\n");
    const newText = originalText.substring(0, lineStart) + newBlock + originalText.substring(lineEnd);

    onUpdateScene(scene.id, {
      content: newText,
      wordCount: countWords(newText),
    });

    setTimeout(() => {
      textarea.focus();
      const newStart = Math.max(lineStart, start + firstLineShift);
      const newEnd = Math.max(newStart, end + totalShift);
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const handleIndentButtonClick = () => {
    if (!textareaRef.current || !scene) return;
    handleIndentOrOutdent(false, true);
    showToast("Sangría añadida al párrafo (Tab)");
  };

  // Keyboard shortcut listener: Ctrl+Shift+M or Alt+- for em-dash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") || (e.altKey && e.key === "-")) {
        e.preventDefault();
        handleInsertDash();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scene]);

  // Auto-resize textarea to fit content so the scrollbar is placed at the far right edge of the screen
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(650, scrollHeight + 40)}px`;
    }
  }, [scene?.content, project.settings.fontSize, project.settings.lineSpacing]);

  if (!scene) {
    return (
      <div
        id="editor-empty-state"
        className="flex-1 flex flex-col items-center justify-center p-8 text-center"
        style={{
          backgroundColor: "var(--bg-main)",
          color: "var(--text-muted)",
        }}
      >
        <BookOpen className="w-12 h-12 mb-3 opacity-40 text-[var(--accent)]" />
        <h3 className="text-lg font-bold font-novel-display text-[var(--text-main)] mb-1">
          Ninguna escena seleccionada
        </h3>
        <p className="text-sm max-w-sm">
          Selecciona una escena en el panel izquierdo o crea una nueva para comenzar a escribir.
        </p>
      </div>
    );
  }

  const wordCount = scene.wordCount || countWords(scene.content || "");
  const charCount = countCharacters(scene.content || "");
  const readingTime = calculateReadingTimeMinutes(wordCount);
  const targetWords = scene.targetWordCount || 1500;
  const progressPercent = Math.min(100, Math.round((wordCount / targetWords) * 100));

  // Determine line height numerically for guaranteed inline CSS application
  const getNumericLineHeight = (): number => {
    const sp = String(project.settings.lineSpacing);
    switch (sp) {
      case "compact":
      case "1.15":
        return 1.35;
      case "loose":
      case "double":
      case "2.0":
        return 2.2;
      case "relaxed":
      case "1.8":
        return 1.85;
      case "normal":
      case "1.5":
      default:
        return 1.6;
    }
  };

  const getLineSpacingLabel = (): string => {
    const sp = String(project.settings.lineSpacing);
    switch (sp) {
      case "compact":
      case "1.15":
        return "1.15 Compacto";
      case "loose":
      case "double":
      case "2.0":
        return "2.0 Doble";
      case "relaxed":
      case "1.8":
        return "1.8 Editorial";
      case "normal":
      case "1.5":
      default:
        return "1.5 Estándar";
    }
  };

  const fontOptions = [
    { id: "serif", label: "Merriweather (Serif Clásica)", previewClass: "font-novel-serif" },
    { id: "garamond", label: "EB Garamond (Literaria Clásica)", previewClass: "font-novel-garamond" },
    { id: "lora", label: "Lora (Elegante Editorial)", previewClass: "font-novel-lora" },
    { id: "serif-display", label: "Playfair Display (Titular)", previewClass: "font-novel-display" },
    { id: "sans", label: "Plus Jakarta (Moderna Sans)", previewClass: "font-novel-sans" },
    { id: "mono", label: "JetBrains Mono (Máquina)", previewClass: "font-novel-mono" },
  ];

  const currentFontLabel =
    project.settings.fontFamily === "custom"
      ? (project.settings.customFontName?.replace(/^Custom_/, "") || "Fuente Propia")
      : fontOptions.find((f) => f.id === project.settings.fontFamily)?.label || "Merriweather (Serif)";

  const statusOptions: { value: SceneStatus; label: string; badgeClass: string }[] = [
    { value: "idea", label: "💡 Idea", badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    { value: "draft", label: "📝 Borrador", badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
    { value: "revised", label: "🔍 En Revisión", badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
    { value: "polished", label: "✨ Pulido", badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
    { value: "final", label: "🏆 Final", badgeClass: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" },
  ];

  const currentStatusObj =
    statusOptions.find((s) => s.value === (scene.status || "draft")) || statusOptions[1];

  const lineSpacingOptions = [
    { id: "compact", val: "1.15", label: "1.15 Compacto" },
    { id: "normal", val: "1.5", label: "1.5 Estándar" },
    { id: "relaxed", val: "1.8", label: "1.8 Editorial" },
    { id: "loose", val: "2.0", label: "2.0 Doble Manuscrito" },
  ];

  return (
    <main
      id="rich-text-editor-container"
      className="flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-hidden relative"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      {/* FILA 1: Barra de Información de la Escena (Scene Header) */}
      {!isZenMode && (
        <header
          id="editor-scene-header"
          className="h-11 border-b px-3 sm:px-4 flex items-center justify-between shrink-0 select-none min-w-0"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Left: Scene Title Input - Comfortable width, never covered by tools */}
          <div className="flex-1 min-w-0 flex items-center gap-2 mr-2 sm:mr-3">
            <FileText className="w-4 h-4 text-[var(--accent)] shrink-0 opacity-70" />
            <input
              type="text"
              id="scene-title-input"
              value={scene.title}
              onChange={(e) => onUpdateScene(scene.id, { title: e.target.value })}
              className="w-full min-w-0 text-sm font-semibold font-novel-display bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-[var(--accent)] focus:outline-none py-0.5 text-[var(--text-main)] transition-colors placeholder-[var(--text-muted)] truncate focus:truncate-none"
              placeholder="Escribe el nombre de esta escena..."
              title="Haz clic para editar el nombre de la escena"
            />
          </div>

          {/* Right: Meta Badges, Scene Status Selector, Inspector & Zen */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Status Dropdown */}
            <div ref={statusMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer shrink-0 ${currentStatusObj.badgeClass}`}
                title="Cambiar estado de la escena"
              >
                <span>{currentStatusObj.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showStatusMenu && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-40 rounded-xl shadow-xl border p-1 z-50"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">
                    Estado de Escena
                  </div>
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onUpdateScene(scene.id, { status: opt.value });
                        setShowStatusMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        scene.status === opt.value
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)]"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {scene.status === opt.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Word counter pill */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono border shrink-0"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-color)",
                color: "var(--text-muted)",
              }}
              title={
                project.settings.enableWordGoals !== false
                  ? `Meta de escena: ${wordCount} de ${targetWords} palabras`
                  : `${wordCount} palabras escritas en esta escena`
              }
            >
              <span className="font-semibold text-[var(--text-main)]">{wordCount}</span>
              {project.settings.enableWordGoals !== false ? (
                <span>/ {targetWords} pal.</span>
              ) : (
                <span>palabras</span>
              )}
            </div>

            {/* Inspector Toggle */}
            <button
              onClick={onOpenInspector}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                isInspectorOpen
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] shadow-xs"
                  : "border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title="Inspector de Escena"
            >
              <PanelRight className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Inspector de Escena</span>
              <span className="hidden sm:inline xl:hidden">Inspector</span>
            </button>

            {/* Zen Mode Button */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-1 rounded-md border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
              title="Modo Zen (Sin distracciones - Esc)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* FILA 2: Cinta de Procesador de Textos Tradicional (Ribbon / Toolbar) */}
      {!isZenMode && (
        <div
          ref={ribbonRef}
          id="editor-word-processor-ribbon"
          className="min-h-[40px] border-b px-2.5 sm:px-4 py-1 flex items-center gap-1 sm:gap-2 shrink-0 relative z-30 overflow-visible select-none flex-wrap"
          style={{
            backgroundColor: "var(--bg-main)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* GRUPO 0: DESHACER & REHACER (UNDO / REDO) */}
          <div className="flex items-center border border-[var(--border-color)] rounded-md overflow-hidden bg-[var(--bg-input)] shrink-0 shadow-2xs">
            <button
              type="button"
              id="ribbon-undo-btn"
              disabled={!canUndo}
              onClick={handleUndo}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Deshacer última acción (Ctrl+Z / ⌘Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-[var(--border-color)]" />
            <button
              type="button"
              id="ribbon-redo-btn"
              disabled={!canRedo}
              onClick={handleRedo}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Rehacer acción deshecha (Ctrl+Y / ⌘Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Divisor vertical */}
          <div className="h-5 w-px bg-[var(--border-color)] shrink-0 mx-0.5" />

          {/* GRUPO 1: TIPOGRAFÍA & FUENTE */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Font Family Dropdown */}
            <div ref={fontMenuRef} className="relative z-50">
              <button
                type="button"
                id="ribbon-font-selector"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowFontMenu((prev) => !prev);
                  setShowSpacingMenu(false);
                  setShowStatusMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)] transition-colors cursor-pointer max-w-[170px] truncate"
                title="Cambiar tipografía del manuscrito"
              >
                <Type className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">{currentFontLabel}</span>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {showFontMenu && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 w-64 rounded-xl shadow-2xl border p-2 z-[100] space-y-1"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-0.5">
                    Tipografías Literarias
                  </div>

                  {fontOptions.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        onUpdateProjectSettings({ fontFamily: font.id as any });
                        setShowFontMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        project.settings.fontFamily === font.id
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)]"
                      }`}
                    >
                      <span className={font.previewClass}>{font.label}</span>
                      {project.settings.fontFamily === font.id && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  ))}

                  <div className="pt-2 border-t border-[var(--border-color)] mt-1">
                    <input
                      ref={customFontInputRef}
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={handleCustomFontUpload}
                      className="hidden"
                    />

                    {project.settings.customFontData && project.settings.customFontName ? (
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] mb-1">
                        <div className="truncate flex-1 pr-1">
                          <p className="text-xs font-bold text-[var(--text-main)] truncate">
                            {project.settings.customFontName.replace(/^Custom_/, "")}
                          </p>
                          <span className="text-[10px] text-[var(--accent)] font-medium">
                            {project.settings.fontFamily === "custom" ? "✓ En uso" : "Cargada"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {project.settings.fontFamily !== "custom" && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateProjectSettings({ fontFamily: "custom" });
                                setShowFontMenu(false);
                              }}
                              className="px-2 py-0.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-semibold"
                            >
                              Usar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveCustomFont}
                            className="p-1 text-red-500 hover:bg-red-500/15 rounded cursor-pointer"
                            title="Eliminar fuente propia"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => customFontInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg border border-dashed border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{project.settings.customFontData ? "Cargar otra fuente (.ttf/.otf)" : "Subir mi propia fuente (.ttf/.otf)"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Font Size Step Controls (- / Size / +) */}
            <div className="flex items-center border border-[var(--border-color)] rounded-md overflow-hidden bg-[var(--bg-input)]">
              <button
                type="button"
                onClick={() =>
                  onUpdateProjectSettings({
                    fontSize: Math.max(10, (project.settings.fontSize || 18) - 1),
                  })
                }
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)] cursor-pointer"
                title="Reducir tamaño de letra"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span
                className="px-1.5 text-xs font-mono font-bold text-[var(--text-main)] min-w-[32px] text-center select-none"
                title="Tamaño actual de letra"
              >
                {project.settings.fontSize || 18}
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateProjectSettings({
                    fontSize: Math.min(36, (project.settings.fontSize || 18) + 1),
                  })
                }
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)] cursor-pointer"
                title="Aumentar tamaño de letra"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Divisor vertical */}
          <div className="h-5 w-px bg-[var(--border-color)] shrink-0 mx-0.5" />

          {/* GRUPO 2: PÁRRAFO, INTERLINEADO & ALINEACIÓN */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Line Spacing Dropdown (Interlineado 100% Funcional) */}
            <div ref={spacingMenuRef} className="relative z-50">
              <button
                type="button"
                id="ribbon-line-spacing-btn"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowSpacingMenu((prev) => !prev);
                  setShowFontMenu(false);
                  setShowStatusMenu(false);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)] transition-colors cursor-pointer"
                title="Ajustar interlineado del manuscrito"
              >
                <span className="font-mono text-xs text-[var(--accent)] font-bold">↕</span>
                <span className="hidden sm:inline">{getLineSpacingLabel()}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showSpacingMenu && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 w-48 rounded-xl shadow-2xl border p-1 z-[100] space-y-0.5"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">
                    Interlineado
                  </div>
                  {lineSpacingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onUpdateProjectSettings({ lineSpacing: opt.id as any });
                        setShowSpacingMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        project.settings.lineSpacing === opt.id || project.settings.lineSpacing === opt.val
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
                          : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)]"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {(project.settings.lineSpacing === opt.id || project.settings.lineSpacing === opt.val) && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Alignment: Left vs Justify */}
            <div className="flex items-center border border-[var(--border-color)] rounded-md overflow-hidden bg-[var(--bg-input)]">
              <button
                type="button"
                onClick={() => onUpdateProjectSettings({ textAlign: "left" })}
                className={`p-1.5 transition-colors cursor-pointer ${
                  (project.settings.textAlign || "left") === "left"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title="Alinear texto a la izquierda"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateProjectSettings({ textAlign: "justify" })}
                className={`p-1.5 transition-colors cursor-pointer ${
                  project.settings.textAlign === "justify"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title="Justificar texto (formato editorial)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* GRUPO SANGRÍA & PÁRRAFO */}
            <div className="flex items-center border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-input)]/50">
              {/* Sangrar párrafo seleccionado con Tab */}
              <button
                id="apply-indent-btn"
                type="button"
                onClick={handleIndentButtonClick}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                title="Añadir sangría al párrafo seleccionado (o pulsa la tecla Tab)"
              >
                <Indent className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="hidden sm:inline">Sangría (Tab)</span>
              </button>

              {/* Reducir sangría */}
              <button
                id="outdent-btn"
                type="button"
                onClick={() => {
                  handleIndentOrOutdent(true, true);
                  showToast("Sangría reducida (Shift+Tab)");
                }}
                className="px-1.5 py-1 border-l border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Reducir sangría en el párrafo seleccionado (Shift+Tab)"
              >
                <Outdent className="w-3.5 h-3.5" />
              </button>

              {/* Sangría de 1.ª línea automática (1.5em en todo el manuscrito) */}
              <button
                id="toggle-first-line-indent-btn"
                type="button"
                onClick={() => {
                  const nextState = !project.settings.paragraphIndent;
                  onUpdateProjectSettings({ paragraphIndent: nextState });
                  showToast(
                    nextState
                      ? "Sangría de 1.ª línea (1.5em) activada en manuscrito"
                      : "Sangría de 1.ª línea desactivada"
                  );
                }}
                className={`px-2.5 py-1 border-l border-[var(--border-color)] text-xs font-medium transition-colors cursor-pointer ${
                  project.settings.paragraphIndent
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title="Activar/Desactivar sangría de primera línea automática (1.5em) en el manuscrito"
              >
                1.ª Línea {project.settings.paragraphIndent ? "✓" : ""}
              </button>
            </div>
          </div>

          {/* Divisor vertical */}
          <div className="h-5 w-px bg-[var(--border-color)] shrink-0 mx-0.5" />

          {/* GRUPO 3: ELEMENTOS DE NOVELA & DIÁLOGOS */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Guion Largo Dialogo (—) */}
            <button
              id="insert-em-dash-btn"
              type="button"
              onClick={handleInsertDash}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--accent-subtle)] text-[var(--text-main)] border border-[var(--border-color)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors shadow-xs cursor-pointer"
              title="Insertar Guion Largo de Diálogo (—) [Ctrl+Shift+M o Alt+-]"
            >
              <span className="text-base leading-none font-bold text-[var(--accent)]">—</span>
              <span className="hidden sm:inline">Guion Largo</span>
            </button>

            {/* Comillas Latinas (« ») */}
            <button
              type="button"
              onClick={handleInsertGuillemets}
              className="px-2 py-1 rounded-md text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Insertar Comillas Latinas (« »)"
            >
              « »
            </button>

            {/* Separador de Escena (* * *) */}
            <button
              type="button"
              onClick={handleInsertBreak}
              className="px-2 py-1 rounded-md text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Insertar Separador de Escena (* * *)"
            >
              * * *
            </button>

            {/* Pulir Diálogos RAE */}
            <button
              id="format-dialogue-btn"
              type="button"
              onClick={handleFormatAllDialogues}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Escanear y corregir puntuación y rayas de diálogo según la norma RAE"
            >
              <Wand2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden lg:inline">Diálogos RAE</span>
            </button>
          </div>

          {/* Divisor vertical */}
          <div className="h-5 w-px bg-[var(--border-color)] shrink-0 mx-0.5" />

          {/* GRUPO 4: UTILIDADES RÁPIDAS */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle Case */}
            <button
              type="button"
              onClick={handleToggleCase}
              className="p-1 rounded-md border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Alternar MAYÚSCULAS / minúsculas / Título en la selección"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
            </button>

            {/* Copy Content */}
            <button
              type="button"
              onClick={handleCopyContent}
              className="p-1 rounded-md border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Copiar texto de la escena al portapapeles"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Text Writing Canvas with Native Scrollbar on Far Right Edge */}
      <div
        id="editor-scroll-container"
        className="flex-1 min-h-0 relative w-full h-full flex flex-col overflow-hidden"
      >
        {/* Zen mode exit floating badge */}
        {isZenMode && (
          <div className="absolute top-3 right-8 z-30 flex items-center gap-3 bg-[var(--bg-surface)]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[var(--border-color)] shadow-md text-xs text-[var(--text-muted)] select-none">
            <span className="font-novel-display font-semibold tracking-wider text-[var(--text-main)] truncate max-w-[240px]">
              {scene.title}
            </span>
            <button
              type="button"
              onClick={() => setIsZenMode(false)}
              className="flex items-center gap-1 hover:text-[var(--accent)] cursor-pointer text-[var(--accent)] font-medium"
              title="Salir de Modo Zen (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Salir (Esc)</span>
            </button>
          </div>
        )}

        {/* Native Textarea: Full width & height, text centered via padding, scrollbar at the far right edge */}
        <textarea
          id="novel-manuscript-textarea"
          ref={textareaRef}
          value={scene.content || ""}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
            const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            if (isCmdOrCtrl && !e.altKey) {
              if (e.key.toLowerCase() === "z" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleUndo();
                return;
              }
              if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
                e.preventDefault();
                e.stopPropagation();
                handleRedo();
                return;
              }
            }

            if (e.key === "Tab") {
              e.preventDefault();
              handleIndentOrOutdent(e.shiftKey);
            }
          }}
          placeholder="Comienza a escribir tu escena aquí... Usa Tab o el botón Sangría para sangrar párrafos, y Ctrl+Shift+M para diálogos (—)."
          style={{
            fontSize: `${project.settings.fontSize || 18}px`,
            lineHeight: getNumericLineHeight(),
            textAlign: project.settings.textAlign || "left",
            textIndent: project.settings.paragraphIndent ? "1.5em" : undefined,
            tabSize: 4,
            MozTabSize: 4,
            whiteSpace: "pre-wrap",
            fontFamily:
              project.settings.fontFamily === "custom" && project.settings.customFontData
                ? `"${project.settings.customFontName}", serif`
                : undefined,
            color: "var(--text-main)",
            paddingLeft: isZenMode
              ? "max(1.5rem, calc((100% - 50rem) / 2))"
              : "max(1rem, calc((100% - 44rem) / 2))",
            paddingRight: isZenMode
              ? "max(1.5rem, calc((100% - 50rem) / 2))"
              : "max(1rem, calc((100% - 44rem) / 2))",
            paddingTop: isZenMode ? "3rem" : "2rem",
            paddingBottom: "35vh",
            scrollbarGutter: "stable",
          }}
          className={`w-full h-full flex-1 bg-transparent resize-none focus:outline-none border-none tracking-wide overflow-y-scroll custom-scroll always-scroll ${
            project.settings.fontFamily === "serif-display"
              ? "font-novel-display"
              : project.settings.fontFamily === "garamond"
              ? "font-novel-garamond"
              : project.settings.fontFamily === "lora"
              ? "font-novel-lora"
              : project.settings.fontFamily === "sans"
              ? "font-novel-sans"
              : project.settings.fontFamily === "mono"
              ? "font-novel-mono"
              : project.settings.fontFamily === "custom"
              ? ""
              : "font-novel-serif"
          } text-[var(--text-main)] placeholder-[var(--text-muted)]/70 selection:bg-[var(--accent-subtle)]`}
          spellCheck="true"
        />
      </div>

      {/* Bottom Status & Word Count Footer */}
      <footer
        id="editor-footer"
        className="h-9 border-t px-4 flex items-center justify-between shrink-0 text-xs text-[var(--text-muted)] select-none font-mono"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[var(--text-main)]">{wordCount}</span>
            <span>palabras en escena</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span>{charCount} caracteres</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>~{readingTime} min de lectura</span>
          </div>
        </div>

        {/* Scene goal progress bar */}
        {project.settings.enableWordGoals !== false ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Meta escena:</span>
            <span className="font-semibold text-[var(--text-main)]">
              {wordCount} / {targetWords}
            </span>
            <div className="w-20 sm:w-28 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-[var(--text-muted)] opacity-80">
            Escritura libre (Metas desactivadas)
          </div>
        )}
      </footer>
    </main>
  );
};
