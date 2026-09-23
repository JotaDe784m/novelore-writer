/**
 * Editor ergonomics helper functions for Ulysses / iA Writer literary experience.
 * Powers Typewriter Scrolling, Paragraph Focus Mode, and Reading Column ergonomics.
 */

export interface ParagraphBounds {
  start: number;
  end: number;
  paragraph: string;
}

/**
 * Finds the start index, end index, and content of the paragraph containing the caret.
 * Paragraphs are delimited by newline characters (\n).
 */
export function getParagraphBounds(text: string, caretPos: number): ParagraphBounds {
  if (!text) {
    return { start: 0, end: 0, paragraph: "" };
  }
  const safePos = Math.max(0, Math.min(caretPos, text.length));
  const start = text.lastIndexOf("\n", safePos - 1) + 1;
  const nextNewline = text.indexOf("\n", safePos);
  const end = nextNewline === -1 ? text.length : nextNewline;

  return {
    start,
    end,
    paragraph: text.substring(start, end),
  };
}

/**
 * Calculates the target scrollTop for Typewriter Scrolling mode.
 * Keeps the caret line anchored at focusRatio (default 45%) of the viewport height.
 */
export function calculateTypewriterScrollTop(
  caretTop: number,
  viewportHeight: number,
  focusRatio: number = 0.45
): number {
  if (viewportHeight <= 0) return 0;
  const target = caretTop - viewportHeight * focusRatio;
  return Math.max(0, Math.round(target));
}

/**
 * Generates the CSS linear-gradient mask for Paragraph Focus Mode.
 * Highlights the active paragraph at 100% opacity, fading out previous and following paragraphs to ~40%.
 */
export function calculateFocusMaskGradient(
  paraTop: number,
  paraHeight: number,
  scrollTop: number,
  fadeDistance: number = 24
): string {
  const relTop = paraTop - scrollTop;
  const relBottom = relTop + paraHeight;
  const fadeStart = Math.max(0, relTop - fadeDistance);
  const fadeEnd = relBottom + fadeDistance;

  return `linear-gradient(to bottom, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) ${fadeStart}px, rgba(0,0,0,1) ${relTop}px, rgba(0,0,0,1) ${relBottom}px, rgba(0,0,0,0.4) ${fadeEnd}px, rgba(0,0,0,0.4) 100%)`;
}

/**
 * Returns optimal reading column dimensions (~720px / 65-75 chars per line).
 */
export function getOptimalReadingColumnWidth(isZenMode: boolean = false): {
  maxWidthPx: number;
  optimalCharCount: number;
  sidePaddingCalc: string;
} {
  const maxWidthPx = isZenMode ? 760 : 720;
  return {
    maxWidthPx,
    optimalCharCount: 70,
    sidePaddingCalc: `max(2rem, calc((100% - ${maxWidthPx}px) / 2))`,
  };
}
