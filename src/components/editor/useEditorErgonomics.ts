import { useRef, useCallback, useEffect } from "react";
import { Scene } from "../../types";
import {
  getParagraphBounds,
  calculateTypewriterScrollTop,
  calculateFocusMaskGradient,
} from "../../utils/editorErgonomics";
import { escapeHtml } from "./editorConstants";

export function useEditorErgonomics(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  scene: Scene | null,
  isTypewriterActive: boolean,
  isFocusActive: boolean,
  fontSize?: number,
  lineSpacing?: string | number
) {
  const mirrorRef = useRef<HTMLDivElement>(null);

  const updateErgonomics = useCallback((forceTypewriter = false) => {
    const ta = textareaRef.current;
    const mir = mirrorRef.current;
    if (!ta || !mir || !scene) return;

    if (!isTypewriterActive && !isFocusActive) {
      ta.style.webkitMaskImage = "none";
      ta.style.maskImage = "none";
      return;
    }

    const pos = ta.selectionStart;
    const text = ta.value;
    const { start: pStart, end: pEnd } = getParagraphBounds(text, pos);

    const cs = window.getComputedStyle(ta);
    mir.style.boxSizing = cs.boxSizing;
    mir.style.width = `${ta.clientWidth}px`;
    mir.style.fontFamily = cs.fontFamily;
    mir.style.fontSize = cs.fontSize;
    mir.style.fontWeight = cs.fontWeight;
    mir.style.lineHeight = cs.lineHeight;
    mir.style.letterSpacing = cs.letterSpacing;
    mir.style.textAlign = cs.textAlign;
    mir.style.textIndent = cs.textIndent;
    mir.style.tabSize = cs.tabSize;
    mir.style.paddingLeft = cs.paddingLeft;
    mir.style.paddingRight = cs.paddingRight;
    mir.style.paddingTop = cs.paddingTop;
    mir.style.paddingBottom = cs.paddingBottom;
    mir.style.whiteSpace = cs.whiteSpace;
    mir.style.wordBreak = cs.wordBreak;

    const before = escapeHtml(text.slice(0, pStart));
    const active = escapeHtml(text.slice(pStart, pEnd));
    const after = escapeHtml(text.slice(pEnd));

    mir.innerHTML = `${before}<span id="p-active">${active || "&nbsp;"}</span>${after}`;
    const pSpan = mir.querySelector("#p-active") as HTMLElement | null;

    if (pSpan) {
      const mirRect = mir.getBoundingClientRect();
      const spanRect = pSpan.getBoundingClientRect();
      const pTop = spanRect.top - mirRect.top;
      const pHeight = Math.max(spanRect.height, pSpan.offsetHeight, 24);

      if (isTypewriterActive && (forceTypewriter || document.activeElement === ta)) {
        const targetScroll = calculateTypewriterScrollTop(pTop + pHeight / 2, ta.clientHeight);
        if (Math.abs(ta.scrollTop - targetScroll) > 12) {
          ta.scrollTop = targetScroll;
        }
      }

      if (isFocusActive) {
        const grad = calculateFocusMaskGradient(pTop, pHeight, ta.scrollTop);
        ta.style.webkitMaskImage = grad;
        ta.style.maskImage = grad;
      } else {
        ta.style.webkitMaskImage = "none";
        ta.style.maskImage = "none";
      }
    } else {
      ta.style.webkitMaskImage = "none";
      ta.style.maskImage = "none";
    }
  }, [textareaRef, isTypewriterActive, isFocusActive, scene]);

  useEffect(() => {
    updateErgonomics(false);
  }, [updateErgonomics, fontSize, lineSpacing]);

  return {
    mirrorRef,
    updateErgonomics,
  };
}

