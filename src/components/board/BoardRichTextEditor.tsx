import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";

export interface BoardRichTextEditorHandle {
  applyFontFamily: (fontFamilyCss: string, fontId: string) => boolean;
  applyFontSize: (sizePx: number) => boolean;
  applyColor: (colorHex: string) => boolean;
  hasSelection: () => boolean;
  getSelectedFontSize: () => number | null;
}

interface BoardRichTextEditorProps {
  itemId: string;
  initialText?: string;
  initialRichText?: string;
  fontSize: number;
  textColor: string;
  fontFamily: string;
  textAlign?: "left" | "center" | "right";
  isDragging: boolean;
  isSelected: boolean;
  onChange: (plainText: string, richHtml: string) => void;
  onFocus?: () => void;
  onSelect?: () => void;
  onSelectionChange?: (selectedSize: number | null, hasTextSelection: boolean) => void;
}

export const BoardRichTextEditor = forwardRef<
  BoardRichTextEditorHandle,
  BoardRichTextEditorProps
>(
  (
    {
      itemId,
      initialText = "",
      initialRichText,
      fontSize,
      textColor,
      fontFamily,
      textAlign = "left",
      isDragging,
      isSelected,
      onChange,
      onFocus,
      onSelect,
      onSelectionChange,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const lastEmittedHtmlRef = useRef<string>("");

    // Initialize content once or when itemId changes
    useEffect(() => {
      if (editorRef.current) {
        const content = initialRichText || initialText || "";
        // Only set if different to avoid destroying cursor during typing
        if (editorRef.current.innerHTML !== content) {
          editorRef.current.innerHTML = content;
          lastEmittedHtmlRef.current = content;
        }
      }
    }, [itemId]);

    // Inspect the current selection / caret to find its active font size
    const getSelectedFontSize = useCallback((): number | null => {
      const editor = editorRef.current;
      if (!editor) return null;

      const sel = window.getSelection();
      let node: Node | null = null;
      if (
        sel &&
        sel.rangeCount > 0 &&
        editor.contains(sel.anchorNode)
      ) {
        node = sel.anchorNode;
      } else if (
        savedRangeRef.current &&
        editor.contains(savedRangeRef.current.commonAncestorContainer)
      ) {
        node = savedRangeRef.current.commonAncestorContainer;
      }

      if (!node) return null;

      const element: HTMLElement | null =
        node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
      if (!element) return null;

      // Climb up from element up to editor checking for inline font size
      let curr: HTMLElement | null = element;
      while (curr && curr !== editor.parentElement) {
        if (curr.style && curr.style.fontSize) {
          const parsed = parseInt(curr.style.fontSize, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        if (curr === editor) break;
        curr = curr.parentElement;
      }

      // Try computed style if element is inside editor
      try {
        const computed = window.getComputedStyle(element).fontSize;
        const parsed = parseInt(computed, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      } catch {}

      return fontSize || 18;
    }, [fontSize]);

    // Save selection whenever user selects text inside this editor
    const saveCurrentSelection = useCallback(() => {
      const sel = window.getSelection();
      const editor = editorRef.current;
      if (
        sel &&
        sel.rangeCount > 0 &&
        editor &&
        editor.contains(sel.anchorNode)
      ) {
        const hasText = !sel.isCollapsed && (sel.toString().trim().length > 0);
        if (hasText) {
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
        const currentSize = getSelectedFontSize();
        if (onSelectionChange) {
          onSelectionChange(currentSize, hasText);
        }
        if (onSelect) onSelect();
      } else {
        // Only clear if active node is inside this editor
        if (
          sel &&
          editor &&
          sel.anchorNode &&
          editor.contains(sel.anchorNode)
        ) {
          savedRangeRef.current = null;
          if (onSelectionChange) {
            onSelectionChange(null, false);
          }
        }
      }
    }, [onSelect, onSelectionChange, getSelectedFontSize]);

    // Global selectionchange listener when selected
    useEffect(() => {
      if (!isSelected) return;
      const handleDocSelectionChange = () => {
        const sel = window.getSelection();
        const editor = editorRef.current;
        if (
          sel &&
          sel.rangeCount > 0 &&
          editor &&
          editor.contains(sel.anchorNode)
        ) {
          saveCurrentSelection();
        }
      };
      document.addEventListener("selectionchange", handleDocSelectionChange);
      return () => {
        document.removeEventListener("selectionchange", handleDocSelectionChange);
      };
    }, [isSelected, saveCurrentSelection]);

    // Helper to wrap current selection in a styling span without conflict from nested inner styles
    const applyStyleToRange = useCallback(
      (
        styleProperty: "fontFamily" | "fontSize" | "color",
        styleValue: string
      ): boolean => {
        const editor = editorRef.current;
        if (!editor) return false;

        const sel = window.getSelection();
        let range: Range | null = null;

        if (
          sel &&
          sel.rangeCount > 0 &&
          !sel.isCollapsed &&
          editor.contains(sel.anchorNode)
        ) {
          range = sel.getRangeAt(0);
        } else if (
          savedRangeRef.current &&
          editor.contains(savedRangeRef.current.commonAncestorContainer) &&
          !savedRangeRef.current.collapsed
        ) {
          range = savedRangeRef.current;
        }

        if (!range || range.collapsed || range.toString().trim().length === 0) {
          return false;
        }

        const cssProp =
          styleProperty === "fontSize"
            ? "font-size"
            : styleProperty === "fontFamily"
            ? "font-family"
            : "color";

        try {
          // If the common ancestor container itself is a span that contains only the selected text,
          // update its style directly instead of creating unnecessary nested wrappers
          const commonEl: HTMLElement | null =
            range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
              ? (range.commonAncestorContainer as HTMLElement)
              : range.commonAncestorContainer.parentElement;

          if (
            commonEl &&
            commonEl !== editor &&
            commonEl.tagName === "SPAN" &&
            commonEl.textContent?.trim() === range.toString().trim()
          ) {
            commonEl.style[styleProperty] = styleValue;
            // Clean any nested children with conflicting styles
            commonEl.querySelectorAll("*").forEach((child) => {
              if (child instanceof HTMLElement) {
                child.style.removeProperty(cssProp);
              }
            });

            if (sel) {
              sel.removeAllRanges();
              const newRange = document.createRange();
              newRange.selectNodeContents(commonEl);
              sel.addRange(newRange);
              savedRangeRef.current = newRange.cloneRange();
            }

            const html = editor.innerHTML;
            const text = editor.innerText;
            lastEmittedHtmlRef.current = html;
            onChange(text, html);
            if (onSelectionChange) {
              const currentSize = getSelectedFontSize();
              onSelectionChange(currentSize, true);
            }
            return true;
          }

          // Otherwise extract contents and strip nested overriding styles for this property
          const contents = range.extractContents();
          const cleanDescendants = (root: Node) => {
            if (root.nodeType === Node.ELEMENT_NODE) {
              (root as HTMLElement).style.removeProperty(cssProp);
            }
            root.childNodes.forEach(cleanDescendants);
          };
          contents.childNodes.forEach(cleanDescendants);

          const span = document.createElement("span");
          span.style[styleProperty] = styleValue;
          span.appendChild(contents);
          range.insertNode(span);

          // Restore selection to the newly styled span
          if (sel) {
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.addRange(newRange);
            savedRangeRef.current = newRange.cloneRange();
          }

          const html = editor.innerHTML;
          const text = editor.innerText;
          lastEmittedHtmlRef.current = html;
          onChange(text, html);
          if (onSelectionChange) {
            const currentSize = getSelectedFontSize();
            onSelectionChange(currentSize, true);
          }
          return true;
        } catch (err) {
          console.warn("Fallo al aplicar estilo a selección:", err);
          return false;
        }
      },
      [onChange, onSelectionChange, getSelectedFontSize]
    );

    useImperativeHandle(
      ref,
      () => ({
        applyFontFamily: (fontFamilyCss: string) => {
          return applyStyleToRange("fontFamily", fontFamilyCss);
        },
        applyFontSize: (sizePx: number) => {
          return applyStyleToRange("fontSize", `${sizePx}px`);
        },
        applyColor: (colorHex: string) => {
          return applyStyleToRange("color", colorHex);
        },
        hasSelection: () => {
          const sel = window.getSelection();
          if (
            sel &&
            sel.rangeCount > 0 &&
            !sel.isCollapsed &&
            editorRef.current &&
            editorRef.current.contains(sel.anchorNode)
          ) {
            return true;
          }
          return !!(
            savedRangeRef.current &&
            !savedRangeRef.current.collapsed &&
            editorRef.current &&
            editorRef.current.contains(
              savedRangeRef.current.commonAncestorContainer
            )
          );
        },
        getSelectedFontSize: () => {
          return getSelectedFontSize();
        },
      }),
      [applyStyleToRange, getSelectedFontSize]
    );

    const handleInput = () => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        const text = editorRef.current.innerText;
        lastEmittedHtmlRef.current = html;
        onChange(text, html);
      }
    };

    return (
      <div
        ref={editorRef}
        contentEditable={!isDragging}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={saveCurrentSelection}
        onMouseUp={saveCurrentSelection}
        onSelect={saveCurrentSelection}
        onFocus={() => {
          if (onFocus) onFocus();
        }}
        onMouseDown={(e) => {
          // Prevent parent dragging so text selection is natural
          e.stopPropagation();
        }}
        data-placeholder="Escribe texto..."
        className={`w-full min-h-[36px] bg-transparent border-0 focus:outline-none font-bold leading-snug break-words whitespace-pre-wrap ${
          isDragging ? "pointer-events-none select-none" : ""
        } empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--text-muted)] empty:before:opacity-40 empty:before:pointer-events-none`}
        style={{
          fontSize: `${fontSize}px`,
          color: textColor,
          textAlign: textAlign,
          fontFamily: fontFamily,
          cursor: isDragging ? "grabbing" : "text",
        }}
      />
    );
  }
);
