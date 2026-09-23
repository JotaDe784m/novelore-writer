import React, { useRef, useEffect, useState, useCallback } from "react";
import {
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
  ScrollText,
  Focus,
} from "lucide-react";
import { NovelProject, Scene, SceneStatus } from "../../types";
import {
  countCharacters,
  countWords,
  calculateReadingTimeMinutes,
  formatSpanishDialogue,
  insertEmDashAtCursor,
} from "../../utils/formatters";
import {
  getParagraphBounds,
  calculateTypewriterScrollTop,
  calculateFocusMaskGradient,
  getOptimalReadingColumnWidth,
} from "../../utils/editorErgonomics";

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  const mirrorRef = useRef<HTMLDivElement>(null);
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

  const handleUndo = useCallback(() => {
    if (!scene) return;
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = null;
    }

    let currentIdx = historyIndex;
    let currentHist = history;

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
  }, [scene, history, historyIndex, onUpdateScene]);

  const handleRedo = useCallback(() => {
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
  }, [scene, history, historyIndex, onUpdateScene]);

  const canUndo = historyIndex > 0 || (scene ? scene.content !== lastRecordedContentRef.current : false);
  const canRedo = historyIndex < history.length - 1;

  // Global keyboard shortcuts (Undo, Redo, Typewriter, Focus, Zen)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isOtherInput = target && target.id !== "novel-manuscript-textarea" && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (isOtherInput) return;

      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo outside textarea
      if (target?.id !== "novel-manuscript-textarea" && isCmdOrCtrl && !e.altKey) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
          return;
        }
        if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
          return;
        }
      }

      // Alt+T: Toggle Typewriter Mode
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const nextVal = !(project.settings.typewriterMode ?? false);
        onUpdateProjectSettings({ typewriterMode: nextVal });
        showToast(nextVal ? "Scroll de máquina de escribir activado" : "Scroll de máquina de escribir desactivado");
        return;
      }

      // Alt+F: Toggle Focus Mode
      if (e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        const nextVal = !(project.settings.focusMode ?? false);
        onUpdateProjectSettings({ focusMode: nextVal });
        showToast(nextVal ? "Modo foco por párrafo activado" : "Modo foco desactivado");
        return;
      }

      // Alt+Z: Toggle Zen Mode
      if (e.altKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setIsZenMode(!isZenMode);
        showToast(!isZenMode ? "Modo Zen activado (Esc para salir)" : "Modo Zen desactivado");
        return;
      }

      // Esc: Exit Zen Mode
      if (e.key === "Escape" && isZenMode) {
        e.preventDefault();
        setIsZenMode(false);
        showToast("Modo Zen desactivado");
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleUndo, handleRedo, isZenMode, setIsZenMode, project.settings.typewriterMode, project.settings.focusMode, onUpdateProjectSettings]);

  // Close menus on pointer down outside
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

  /**
   * Literary Ergonomics: Typewriter Scrolling & Focus Mode Caret Synchronization
   */
  const updateErgonomics = useCallback(
    (isTyping = false) => {
      if (!textareaRef.current || !mirrorRef.current || !scene) return;
      if (typeof window === "undefined" || !window.getComputedStyle) return;

      const textarea = textareaRef.current;
      const mirror = mirrorRef.current;
      const content = textarea.value || "";
      const caretPos = textarea.selectionStart;

      const isTypewriter = project.settings.typewriterMode ?? false;
      const isFocus = project.settings.focusMode ?? false;

      if (!isTypewriter && !isFocus) {
        textarea.style.webkitMaskImage = "none";
        textarea.style.maskImage = "none";
        return;
      }

      const bounds = getParagraphBounds(content, caretPos);

      // Mirror computed typography styles
      const computed = window.getComputedStyle(textarea);
      mirror.style.fontFamily = computed.fontFamily;
      mirror.style.fontSize = computed.fontSize;
      mirror.style.lineHeight = computed.lineHeight;
      mirror.style.letterSpacing = computed.letterSpacing;
      mirror.style.wordSpacing = computed.wordSpacing;
      mirror.style.textAlign = computed.textAlign;
      mirror.style.textIndent = computed.textIndent;
      mirror.style.whiteSpace = "pre-wrap";
      mirror.style.wordBreak = "break-word";
      mirror.style.boxSizing = "border-box";
      mirror.style.width = `${textarea.clientWidth}px`;
      mirror.style.paddingLeft = computed.paddingLeft;
      mirror.style.paddingRight = computed.paddingRight;
      mirror.style.paddingTop = computed.paddingTop;

      const beforePara = escapeHtml(content.substring(0, bounds.start));
      const paraBeforeCaret = escapeHtml(content.substring(bounds.start, caretPos));
      const paraAfterCaret = escapeHtml(content.substring(caretPos, bounds.end));
      const afterPara = escapeHtml(content.substring(bounds.end));

      mirror.innerHTML = `<span>${beforePara}</span><span id="mirror-active-para">${paraBeforeCaret}<span id="mirror-caret-anchor">|</span>${paraAfterCaret}</span><span>${afterPara}</span>`;

      const caretAnchor = mirror.querySelector("#mirror-caret-anchor") as HTMLElement | null;
      const activeParaSpan = mirror.querySelector("#mirror-active-para") as HTMLElement | null;

      // Typewriter scrolling adjustment
      if (isTypewriter && caretAnchor) {
        const caretTop = caretAnchor.offsetTop;
        const targetScroll = calculateTypewriterScrollTop(caretTop, textarea.clientHeight, 0.45);
        if (isTyping) {
          textarea.scrollTop = targetScroll;
        } else if (Math.abs(textarea.scrollTop - targetScroll) > 12) {
          textarea.scrollTo({ top: targetScroll, behavior: "smooth" });
        }
      }

      // Paragraph Focus gradient mask
      if (isFocus && activeParaSpan) {
        const paraTop = activeParaSpan.offsetTop;
        const paraHeight = activeParaSpan.offsetHeight;
        const mask = calculateFocusMaskGradient(paraTop, paraHeight, textarea.scrollTop, 28);
        textarea.style.webkitMaskImage = mask;
        textarea.style.maskImage = mask;
      } else {
        textarea.style.webkitMaskImage = "none";
        textarea.style.maskImage = "none";
      }
    },
    [scene, project.settings.typewriterMode, project.settings.focusMode]
  );

  // Recalculate focus mask on manual scroll
  const handleScroll = () => {
    if (project.settings.focusMode && mirrorRef.current && textareaRef.current) {
      const activeParaSpan = mirrorRef.current.querySelector("#mirror-active-para") as HTMLElement | null;
      if (activeParaSpan) {
        const paraTop = activeParaSpan.offsetTop;
        const paraHeight = activeParaSpan.offsetHeight;
        const mask = calculateFocusMaskGradient(paraTop, paraHeight, textareaRef.current.scrollTop, 28);
        textareaRef.current.style.webkitMaskImage = mask;
        textareaRef.current.style.maskImage = mask;
      }
    }
  };

  // Sync ergonomics when mode toggles change or scene switches
  useEffect(() => {
    updateErgonomics(false);
  }, [updateErgonomics, project.settings.typewriterMode, project.settings.focusMode, scene?.id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!scene) return;
    const newContent = e.target.value;
    const newWordCount = countWords(newContent);
    onUpdateScene(scene.id, {
      content: newContent,
      wordCount: newWordCount,
    });

    updateErgonomics(true);

    if (isUndoRedoActionRef.current) return;

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    const isMajor =
      Math.abs(newContent.length - lastRecordedContentRef.current.length) > 1 ||
      newContent.endsWith(" ") ||
      newContent.endsWith("\n");
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
      setTimeout(() => updateErgonomics(true), 10);
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
    setTimeout(() => updateErgonomics(false), 10);
    showToast("Diálogos formateados según la norma RAE");
  };

  const handleInsertBreak = () => {
    if (!textareaRef.current || !scene) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value;
    const breakText = "\n\n* * *\n\n";

    const newText = originalText.substring(0, start) + breakText + originalText.substring(end);
    onUpdateScene(scene.id, {
      content: newText,
      wordCount: countWords(newText),
    });
    pushToHistory(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + breakText.length, start + breakText.length);
      updateErgonomics(true);
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

    const newText = originalText.substring(0, start) + replacement + originalText.substring(end);
    onUpdateScene(scene.id, {
      content: newText,
      wordCount: countWords(newText),
    });
    pushToHistory(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1 + (selected ? selected.length : 5));
      updateErgonomics(true);
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
      transformed = selected.replace(/\b\w/g, (c) => c.toUpperCase());
    } else {
      transformed = selected.toUpperCase();
    }

    const newText = original.substring(0, start) + transformed + original.substring(end);
    onUpdateScene(scene.id, { content: newText, wordCount: countWords(newText) });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
      updateErgonomics(false);
    }, 0);
    showToast("Formato de mayúsculas/minúsculas alternado");
  };

  const handleCopyContent = () => {
    if (!scene?.content) return;
    navigator.clipboard.writeText(scene.content);
    showToast("Contenido de la escena copiado al portapapeles");
  };

  const handleIndentOrOutdent = (isOutdent: boolean = false, forceParagraph: boolean = false) => {
    if (!textareaRef.current || !scene) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value || "";

    if (start === end && !isOutdent && !forceParagraph) {
      const newText = originalText.substring(0, start) + "\t" + originalText.substring(end);
      onUpdateScene(scene.id, {
        content: newText,
        wordCount: countWords(newText),
      });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
        updateErgonomics(true);
      }, 0);
      return;
    }

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
      updateErgonomics(true);
    }, 0);
  };

  const handleIndentButtonClick = () => {
    if (!textareaRef.current || !scene) return;
    handleIndentOrOutdent(false, true);
    showToast("Sangría añadida al párrafo (Tab)");
  };

  // Keyboard shortcut listener for em-dash (Ctrl+Shift+M or Alt+-)
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

  if (!scene) {
    return (
      <div
        id="editor-empty-state"
        className="flex-1 flex flex-col items-center justify-center p-8 text-center"
        style={{
          backgroundColor: "var(--bg-editor)",
          color: "var(--text-muted)",
        }}
      >
        <BookOpen className="w-12 h-12 mb-3 opacity-40 text-[var(--accent)]" />
        <h3 className="text-lg font-bold font-novel-display text-[var(--text-primary)] mb-1">
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

  const isTypewriterActive = project.settings.typewriterMode ?? false;
  const isFocusActive = project.settings.focusMode ?? false;

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
    { value: "idea", label: "💡 Idea", badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
    { value: "draft", label: "📝 Borrador", badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
    { value: "revised", label: "🔍 En Revisión", badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
    { value: "polished", label: "✨ Pulido", badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    { value: "final", label: "🏆 Final", badgeClass: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
  ];

  const currentStatusObj =
    statusOptions.find((s) => s.value === (scene.status || "draft")) || statusOptions[1];

  const lineSpacingOptions = [
    { id: "compact", val: "1.15", label: "1.15 Compacto" },
    { id: "normal", val: "1.5", label: "1.5 Estándar" },
    { id: "relaxed", val: "1.8", label: "1.8 Editorial" },
    { id: "loose", val: "2.0", label: "2.0 Doble Manuscrito" },
  ];

  const columnConfig = getOptimalReadingColumnWidth(isZenMode);

  return (
    <main
      id="rich-text-editor-container"
      className="flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-hidden relative"
      style={{
        backgroundColor: "var(--bg-editor)",
        color: "var(--text-primary)",
      }}
    >
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--bg-editor)] text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          {notification}
        </div>
      )}

      {/* Hidden Mirror Div for Caret & Paragraph Measurement */}
      <div
        ref={mirrorRef}
        id="editor-caret-mirror"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -100,
        }}
      />

      {/* FILA 1: Barra de Información de la Escena (Scene Header) */}
      {!isZenMode && (
        <header
          id="editor-scene-header"
          className="h-11 px-3 sm:px-5 flex items-center justify-between shrink-0 select-none min-w-0 border-b border-[var(--border-subtle)]"
          style={{
            backgroundColor: "var(--bg-sidebar)",
          }}
        >
          {/* Left: Scene Title Input */}
          <div className="flex-1 min-w-0 flex items-center gap-2 mr-3">
            <FileText className="w-4 h-4 text-[var(--accent)] shrink-0 opacity-70" />
            <input
              type="text"
              id="scene-title-input"
              value={scene.title}
              onChange={(e) => onUpdateScene(scene.id, { title: e.target.value })}
              className="w-full min-w-0 text-sm font-semibold font-novel-display bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none py-0.5 text-[var(--text-primary)] transition-colors placeholder-[var(--text-muted)] truncate focus:truncate-none"
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
                id="scene-status-button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${currentStatusObj.badgeClass}`}
                title="Cambiar estado de la escena"
              >
                <span>{currentStatusObj.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showStatusMenu && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-40 rounded-xl shadow-xl p-1 z-50 border border-[var(--border-subtle)]"
                  style={{
                    backgroundColor: "var(--bg-editor)",
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        scene.status === opt.value
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold"
                          : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
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
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono shrink-0 bg-[var(--bg-surface-hover)]"
              style={{
                color: "var(--text-muted)",
              }}
              title={
                project.settings.enableWordGoals !== false
                  ? `Meta de escena: ${wordCount} de ${targetWords} palabras`
                  : `${wordCount} palabras escritas en esta escena`
              }
            >
              <span className="font-semibold text-[var(--text-primary)]">{wordCount}</span>
              {project.settings.enableWordGoals !== false ? (
                <span>/ {targetWords} pal.</span>
              ) : (
                <span>palabras</span>
              )}
            </div>

            {/* Inspector Toggle */}
            <button
              id="inspector-toggle-btn"
              onClick={onOpenInspector}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                isInspectorOpen
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
              title="Inspector de Escena (Ctrl+I)"
            >
              <PanelRight className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Inspector</span>
            </button>

            {/* Zen Mode Button */}
            <button
              id="zen-mode-btn"
              onClick={() => {
                setIsZenMode(true);
                showToast("Modo Zen activado (Pulsa Esc para salir)");
              }}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shrink-0"
              title="Modo Zen (Sin distracciones - Alt+Z / Esc)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* FILA 2: Cinta de Herramientas Ergonomía y Formato (Toolbar / Ribbon) */}
      {!isZenMode && (
        <div
          ref={ribbonRef}
          id="editor-word-processor-ribbon"
          className="min-h-[42px] px-3 sm:px-5 py-1 flex items-center gap-1 sm:gap-2 shrink-0 relative z-30 select-none flex-wrap border-b border-[var(--border-subtle)]"
          style={{
            backgroundColor: "var(--bg-sidebar)",
          }}
        >
          {/* GRUPO 0: DESHACER & REHACER (UNDO / REDO) */}
          <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)] shrink-0">
            <button
              type="button"
              id="ribbon-undo-btn"
              disabled={!canUndo}
              onClick={handleUndo}
              className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Deshacer última acción (Ctrl+Z / ⌘Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="ribbon-redo-btn"
              disabled={!canRedo}
              onClick={handleRedo}
              className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Rehacer acción deshecha (Ctrl+Y / ⌘Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer max-w-[170px] truncate"
                title="Cambiar tipografía del manuscrito"
              >
                <Type className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">{currentFontLabel}</span>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {showFontMenu && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 w-64 rounded-xl shadow-2xl p-2 z-[100] space-y-1 border border-[var(--border-subtle)]"
                  style={{
                    backgroundColor: "var(--bg-editor)",
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
                          : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
                      }`}
                    >
                      <span className={font.previewClass}>{font.label}</span>
                      {project.settings.fontFamily === font.id && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  ))}

                  <div className="pt-2 border-t border-[var(--border-subtle)] mt-1">
                    <input
                      ref={customFontInputRef}
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={handleCustomFontUpload}
                      className="hidden"
                    />

                    {project.settings.customFontData && project.settings.customFontName ? (
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--bg-surface-hover)] mb-1">
                        <div className="truncate flex-1 pr-1">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">
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
            <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)]">
              <button
                type="button"
                id="font-size-decrease-btn"
                onClick={() =>
                  onUpdateProjectSettings({
                    fontSize: Math.max(10, (project.settings.fontSize || 18) - 1),
                  })
                }
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                title="Reducir tamaño de letra"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span
                className="px-1.5 text-xs font-mono font-bold text-[var(--text-primary)] min-w-[28px] text-center select-none"
                title="Tamaño actual de letra"
              >
                {project.settings.fontSize || 18}
              </span>
              <button
                type="button"
                id="font-size-increase-btn"
                onClick={() =>
                  onUpdateProjectSettings({
                    fontSize: Math.min(36, (project.settings.fontSize || 18) + 1),
                  })
                }
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] cursor-pointer"
                title="Aumentar tamaño de letra"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

          {/* GRUPO 2: PÁRRAFO, INTERLINEADO & ALINEACIÓN */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Line Spacing Dropdown */}
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
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                title="Ajustar interlineado del manuscrito"
              >
                <span className="font-mono text-xs text-[var(--accent)] font-bold">↕</span>
                <span className="hidden sm:inline">{getLineSpacingLabel()}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showSpacingMenu && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-1.5 w-48 rounded-xl shadow-2xl p-1 z-[100] space-y-0.5 border border-[var(--border-subtle)]"
                  style={{
                    backgroundColor: "var(--bg-editor)",
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
                          : "hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
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
            <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)]">
              <button
                type="button"
                id="align-left-btn"
                onClick={() => onUpdateProjectSettings({ textAlign: "left" })}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  (project.settings.textAlign || "left") === "left"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]"
                }`}
                title="Alinear texto a la izquierda"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="align-justify-btn"
                onClick={() => onUpdateProjectSettings({ textAlign: "justify" })}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  project.settings.textAlign === "justify"
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]"
                }`}
                title="Justificar texto (formato editorial)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sangría & 1ª Línea */}
            <div className="flex items-center rounded-lg p-0.5 bg-[var(--bg-surface-hover)]">
              <button
                id="apply-indent-btn"
                type="button"
                onClick={handleIndentButtonClick}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
                title="Añadir sangría al párrafo seleccionado (Tab)"
              >
                <Indent className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="hidden sm:inline">Sangría</span>
              </button>

              <button
                id="outdent-btn"
                type="button"
                onClick={() => {
                  handleIndentOrOutdent(true, true);
                  showToast("Sangría reducida (Shift+Tab)");
                }}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] transition-colors cursor-pointer"
                title="Reducir sangría en el párrafo seleccionado (Shift+Tab)"
              >
                <Outdent className="w-3.5 h-3.5" />
              </button>

              <button
                id="toggle-first-line-indent-btn"
                type="button"
                onClick={() => {
                  const nextState = !project.settings.paragraphIndent;
                  onUpdateProjectSettings({ paragraphIndent: nextState });
                  showToast(
                    nextState
                      ? "Sangría de 1.ª línea (1.5em) activada"
                      : "Sangría de 1.ª línea desactivada"
                  );
                }}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  project.settings.paragraphIndent
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)]"
                }`}
                title="Activar/Desactivar sangría de primera línea automática (1.5em)"
              >
                1.ª Línea {project.settings.paragraphIndent ? "✓" : ""}
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

          {/* GRUPO 3: ELEMENTOS DE NOVELA & DIÁLOGOS */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Guion Largo Dialogo (—) */}
            <button
              id="insert-em-dash-btn"
              type="button"
              onClick={handleInsertDash}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--text-primary)] bg-[var(--accent-subtle)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors cursor-pointer"
              title="Insertar Guion Largo de Diálogo (—) [Ctrl+Shift+M o Alt+-]"
            >
              <span className="text-base leading-none font-bold text-[var(--accent)]">—</span>
              <span className="hidden sm:inline">Guion</span>
            </button>

            {/* Comillas Latinas (« ») */}
            <button
              id="insert-guillemets-btn"
              type="button"
              onClick={handleInsertGuillemets}
              className="px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
              title="Insertar Comillas Latinas (« »)"
            >
              « »
            </button>

            {/* Separador de Escena (* * *) */}
            <button
              id="insert-break-btn"
              type="button"
              onClick={handleInsertBreak}
              className="px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
              title="Insertar Separador de Escena (* * *)"
            >
              * * *
            </button>

            {/* Pulir Diálogos RAE */}
            <button
              id="format-dialogue-btn"
              type="button"
              onClick={handleFormatAllDialogues}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
              title="Escanear y corregir puntuación y rayas de diálogo según la norma RAE"
            >
              <Wand2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden lg:inline">Diálogos RAE</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

          {/* GRUPO 4: ERGONOMÍA LITERARIA (TOGGLEABLE TYPEWRITER & FOCUS MODE) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Typewriter Scroll Toggle */}
            <button
              id="toggle-typewriter-mode-btn"
              type="button"
              onClick={() => {
                const nextVal = !isTypewriterActive;
                onUpdateProjectSettings({ typewriterMode: nextVal });
                showToast(
                  nextVal
                    ? "Scroll de máquina de escribir activado (línea centrada)"
                    : "Scroll de máquina de escribir desactivado"
                );
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isTypewriterActive
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-2xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
              title="Scroll de Máquina de Escribir (Mantiene la línea activa en el centro) [Alt+T]"
            >
              <ScrollText className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Máquina</span>
              {isTypewriterActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
            </button>

            {/* Paragraph Focus Mode Toggle */}
            <button
              id="toggle-focus-mode-btn"
              type="button"
              onClick={() => {
                const nextVal = !isFocusActive;
                onUpdateProjectSettings({ focusMode: nextVal });
                showToast(
                  nextVal
                    ? "Modo foco por párrafo activado (atenúa párrafos adyacentes)"
                    : "Modo foco desactivado"
                );
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isFocusActive
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-2xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
              title="Modo Foco por Párrafo (Atenúa los párrafos circundantes) [Alt+F]"
            >
              <Focus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Foco</span>
              {isFocusActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border-subtle)] shrink-0 mx-0.5" />

          {/* GRUPO 5: UTILIDADES */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="toggle-case-btn"
              onClick={handleToggleCase}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
              title="Alternar MAYÚSCULAS / minúsculas / Título en la selección"
            >
              <CaseSensitive className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="copy-content-btn"
              onClick={handleCopyContent}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
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
        {/* Zen mode floating badge with quick toggles */}
        {isZenMode && (
          <div className="absolute top-4 right-8 z-30 flex items-center gap-3 bg-[var(--bg-sidebar)]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[var(--border-subtle)] shadow-lg text-xs select-none opacity-40 hover:opacity-100 transition-opacity duration-300">
            <span className="font-novel-display font-semibold tracking-wider text-[var(--text-primary)] truncate max-w-[200px]">
              {scene.title}
            </span>

            {/* Quick Typewriter toggle inside Zen */}
            <button
              type="button"
              onClick={() => {
                const nextVal = !isTypewriterActive;
                onUpdateProjectSettings({ typewriterMode: nextVal });
                showToast(nextVal ? "Máquina activada" : "Máquina desactivada");
              }}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isTypewriterActive
                  ? "text-[var(--accent)] font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Alternar Scroll de Máquina de Escribir (Alt+T)"
            >
              <ScrollText className="w-3.5 h-3.5" />
            </button>

            {/* Quick Focus toggle inside Zen */}
            <button
              type="button"
              onClick={() => {
                const nextVal = !isFocusActive;
                onUpdateProjectSettings({ focusMode: nextVal });
                showToast(nextVal ? "Foco activado" : "Foco desactivado");
              }}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isFocusActive
                  ? "text-[var(--accent)] font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Alternar Modo Foco por Párrafo (Alt+F)"
            >
              <Focus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsZenMode(false)}
              className="flex items-center gap-1 hover:text-[var(--accent)] cursor-pointer text-[var(--accent)] font-medium pl-1 border-l border-[var(--border-subtle)]"
              title="Salir de Modo Zen (Esc / Alt+Z)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        )}

        {/* Literary Textarea: Centered Column ~720px, scrollbar at far right edge */}
        <textarea
          id="novel-manuscript-textarea"
          ref={textareaRef}
          value={scene.content || ""}
          onChange={handleTextChange}
          onScroll={handleScroll}
          onClick={() => updateErgonomics(false)}
          onKeyUp={() => updateErgonomics(false)}
          onSelect={() => updateErgonomics(false)}
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
          placeholder="Comienza a escribir tu escena aquí... Usa Tab para sangrar párrafos, y Ctrl+Shift+M para diálogos (—)."
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
            color: "var(--text-primary)",
            paddingLeft: columnConfig.sidePaddingCalc,
            paddingRight: columnConfig.sidePaddingCalc,
            paddingTop: isZenMode ? "4rem" : "2.5rem",
            paddingBottom: "60vh",
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
          } text-[var(--text-primary)] placeholder-[var(--text-muted)]/60 selection:bg-[var(--accent-subtle)] transition-[mask-image,-webkit-mask-image] duration-150`}
          spellCheck="true"
        />
      </div>

      {/* Bottom Status & Word Count Footer */}
      {!isZenMode && (
        <footer
          id="editor-footer"
          className="h-9 px-4 sm:px-6 flex items-center justify-between shrink-0 text-xs text-[var(--text-muted)] select-none font-mono border-t border-[var(--border-subtle)]"
          style={{
            backgroundColor: "var(--bg-sidebar)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[var(--text-primary)]">{wordCount}</span>
              <span>palabras</span>
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
              <span className="hidden sm:inline">Meta:</span>
              <span className="font-semibold text-[var(--text-primary)]">
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
      )}
    </main>
  );
};
