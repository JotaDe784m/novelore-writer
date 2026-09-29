/**
 * Indentation utilities for literary writing in Novelore.
 * Provides Smart Enter (auto-indenting subsequent paragraphs),
 * multi-line and single-line Tab indenting, and Shift+Tab outdenting.
 */

export interface IndentResult {
  newText: string;
  newStart: number;
  newEnd: number;
}

export interface SmartEnterResult {
  newText: string;
  newCursor: number;
}

/**
 * Checks if a line is a special markdown element that should NOT receive first-line paragraph indentation:
 * - Empty/whitespace line
 * - Markdown heading (#, ##, etc.)
 * - Scene break (* * *, ---, ___)
 * - Blockquote (>)
 * - List item (-, *, +, 1.)
 * - Code block fence (```)
 */
export function isSpecialFormattingLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^#{1,6}\s/.test(trimmed)) return true;
  if (/^([*-_]\s*){3,}$/.test(trimmed)) return true;
  if (/^>/.test(trimmed)) return true;
  if (/^([-*+]\s|\d+[.)]\s)/.test(trimmed)) return true;
  if (/^```/.test(trimmed)) return true;
  return false;
}

/**
 * Applies literary first-line indentation (\t) to all standard narrative paragraphs in the text,
 * including the first paragraph, while preserving headings, scene breaks, and empty lines.
 */
export function formatAllParagraphIndents(text: string): string {
  if (!text) return "";
  const lines = text.split("\n");
  const formatted = lines.map((line) => {
    if (isSpecialFormattingLine(line)) {
      return line.trim() === "" ? "" : line;
    }
    // Already indented with tab
    if (line.startsWith("\t")) {
      return line;
    }
    // Indented with spaces (2 to 4 spaces)
    if (/^ {2,4}/.test(line)) {
      return line.replace(/^ {2,4}/, "\t");
    }
    // Narrative paragraph or dialogue line: prepend tab
    return "\t" + line;
  });
  return formatted.join("\n");
}

/**
 * Removes first-line paragraph indents from all lines in the text.
 */
export function removeAllParagraphIndents(text: string): string {
  if (!text) return "";
  const lines = text.split("\n");
  const formatted = lines.map((line) => {
    if (line.startsWith("\t")) {
      return line.replace(/^\t+/, "");
    }
    return line.replace(/^ {1,4}/, "");
  });
  return formatted.join("\n");
}

/**
 * Handles the Enter key press in the manuscript editor.
 * If autoIndentEnabled is true:
 * - If the current line only consists of a tab/spaces (an empty indented line),
 *   it clears the indentation leaving a clean blank line (to easily create scene breaks or unindented lines).
 * - Otherwise, it creates a new line pre-indented with a tab (\t).
 */
export function handleSmartEnter(
  text: string,
  start: number,
  end: number,
  autoIndentEnabled: boolean = false
): SmartEnterResult {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const nextNewline = text.indexOf("\n", start);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;
  const fullLine = text.substring(lineStart, lineEnd);

  // Case 1: Entire line currently contains only indentation (user pressed Enter on an empty indented line)
  if (/^[\t ]+$/.test(fullLine)) {
    if (lineEnd < text.length && text[lineEnd] === "\n") {
      const newText = text.substring(0, lineStart) + text.substring(lineEnd);
      return {
        newText,
        newCursor: lineStart,
      };
    } else {
      const newText = text.substring(0, lineStart) + "\n";
      return {
        newText,
        newCursor: lineStart + 1,
      };
    }
  }

  // Case 2: Auto-indent enabled -> new paragraph starts indented
  if (autoIndentEnabled) {
    const insertText = "\n\t";
    const newText = text.substring(0, start) + insertText + text.substring(end);
    return {
      newText,
      newCursor: start + insertText.length,
    };
  }

  // Case 3: Standard newline
  const newText = text.substring(0, start) + "\n" + text.substring(end);
  return {
    newText,
    newCursor: start + 1,
  };
}

/**
 * Indents the line or lines currently selected or under the cursor (Tab key).
 */
export function indentLines(
  text: string,
  start: number,
  end: number,
  forceParagraphIndent: boolean = false
): IndentResult {
  // If no selection and not forcing paragraph block indent, and not at start of line
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const isLineStart = start === lineStart;

  if (start === end && !forceParagraphIndent && !isLineStart) {
    // Insert single tab at cursor
    const newText = text.substring(0, start) + "\t" + text.substring(end);
    return {
      newText,
      newStart: start + 1,
      newEnd: start + 1,
    };
  }

  // Multi-line or paragraph-level indent
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetBlock = text.substring(lineStart, lineEnd);
  const lines = targetBlock.split("\n");

  let firstLineShift = 0;
  let totalShift = 0;

  const processedLines = lines.map((line, idx) => {
    if (idx === 0) firstLineShift = 1;
    totalShift += 1;
    return "\t" + line;
  });

  const newBlock = processedLines.join("\n");
  const newText = text.substring(0, lineStart) + newBlock + text.substring(lineEnd);

  return {
    newText,
    newStart: Math.max(lineStart, start + firstLineShift),
    newEnd: Math.max(lineStart + firstLineShift, end + totalShift),
  };
}

/**
 * Outdents the line or lines currently selected or under the cursor (Shift+Tab).
 */
export function outdentLines(
  text: string,
  start: number,
  end: number
): IndentResult {
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const nextNewline = text.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const targetBlock = text.substring(lineStart, lineEnd);
  const lines = targetBlock.split("\n");

  let firstLineShift = 0;
  let totalShift = 0;

  const processedLines = lines.map((line, idx) => {
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
  });

  const newBlock = processedLines.join("\n");
  const newText = text.substring(0, lineStart) + newBlock + text.substring(lineEnd);

  return {
    newText,
    newStart: Math.max(lineStart, start + firstLineShift),
    newEnd: Math.max(lineStart, end + totalShift),
  };
}
