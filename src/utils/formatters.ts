/**
 * Utility functions for text analysis, word counting, and narrative dialogue formatting.
 */

export function countWords(text: string): number {
  if (!text) return 0;
  // Remove markdown/HTML tags if present and trim
  const clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[*#_~`>]/g, " ")
    .replace(/—/g, " ")
    .trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

export function countCharacters(text: string): number {
  if (!text) return 0;
  return text.length;
}

export function calculateReadingTimeMinutes(wordCount: number): number {
  return Math.ceil(wordCount / 220); // Average fiction reading speed ~220 wpm
}

/**
 * Formats dialogue according to Spanish RAE narrative dialogue rules with em-dash (—).
 */
export function formatSpanishDialogue(input: string): string {
  if (!input) return "";

  const lines = input.split("\n");
  const formattedLines = lines.map((line) => {
    let trimmed = line.trim();
    if (!trimmed) return "";

    const isDialogue = /^[-–—"«]/.test(trimmed);
    if (isDialogue) {
      // Standardize opening dialogue dash: em-dash with no space after
      trimmed = trimmed.replace(/^[-–—"«]+\s*/, "—");
      // Remove trailing closing quote if converted from quoted dialogue
      trimmed = trimmed.replace(/["»]$/, "");
    }

    // Standardize interior dashes: space before em-dash
    trimmed = trimmed.replace(/([^\s])\s*—\s*/g, "$1 —");

    // Spanish RAE tag rule: verb of speech in lowercase directly attached to the em-dash
    trimmed = trimmed.replace(/—\s*([a-záéíóúñ])/gi, "—$1");

    // Spanish RAE tag rule: closing tag dash attached to following punctuation
    trimmed = trimmed.replace(/\s*—\s*([,.;:?!])/g, "—$1");

    // Ensure no accidental space at the very start of the turn
    trimmed = trimmed.replace(/^\s*—\s*/, "—");

    return trimmed;
  });

  return formattedLines.join("\n");
}

/**
 * Inserts an em-dash (—) at the current cursor position or transforms selected text into dialogue.
 */
export function insertEmDashAtCursor(
  textarea: HTMLTextAreaElement,
  onUpdate: (newText: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const originalText = textarea.value;

  const isSelection = start !== end;

  if (isSelection) {
    // Wrap or prepend selected text with em-dash
    const selectedText = originalText.substring(start, end);
    const replacement = `—${selectedText.trimStart()}`;
    const newText =
      originalText.substring(0, start) + replacement + originalText.substring(end);
    onUpdate(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  } else {
    // Check if at start of line or space
    const beforeCursor = originalText.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf("\n");
    const isLineStart = start === 0 || lastNewline === start - 1;

    const dashToInsert = isLineStart ? "—" : " —";
    const newText =
      originalText.substring(0, start) + dashToInsert + originalText.substring(end);
    onUpdate(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + dashToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }
}
