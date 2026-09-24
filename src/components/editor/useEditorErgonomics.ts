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
    mir.style.width = `${ta.clientWidth}px`;
    mir.style.fontFamily = cs.fontFamily;
    mir.style.fontSize = cs.fontSize;
    mir.style.lineHeight = cs.lineHeight;
    mir.style.paddingLeft = cs.paddingLeft;
    mir.style.paddingRight = cs.paddingRight;
    mir.style.paddingTop = cs.paddingTop;
    mir.style.whiteSpace = cs.whiteSpace;
    mir.style.wordBreak = cs.wordBreak;

    const before = escapeHtml(text.slice(0, pStart));
    const active = escapeHtml(text.slice(pStart, pEnd));
    const after = escapeHtml(text.slice(pEnd));

    mir.innerHTML = `${before}<span id="p-active">${active || "&nbsp;"}</span>${after}`;
    const pSpan = mir.querySelector("#p-active") as HTMLElement | null;

    if (pSpan) {
      const pTop = pSpan.offsetTop;
      const pHeight = pSpan.offsetHeight;

      if (isTypewriterActive && (forceTypewriter || document.activeElement === ta)) {
        const targetScroll = calculateTypewriterScrollTop(pTop + pHeight / 2, ta.clientHeight);
        if (Math.abs(ta.scrollTop - targetScroll) > 12) {
          ta.scrollTop = targetScroll;
        }
      }

      if (isFocusActive) {
        const topInView = pTop - ta.scrollTop;
        const bottomInView = topInView + pHeight;
        const grad = calculateFocusMaskGradient(topInView, bottomInView, ta.clientHeight);
        ta.style.webkitMaskImage = grad;
        ta.style.maskImage = grad;
      } else {
        ta.style.webkitMaskImage = "none";
        ta.style.maskImage = "none";
      }
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

