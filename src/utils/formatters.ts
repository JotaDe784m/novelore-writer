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

    // If the line starts with standard hyphens (-, --), en-dash (–), or quotes (", «), convert to em-dash
    trimmed = trimmed.replace(/^[-–—"«\s]+/, "—");

    // Standardize interior dashes: ensure dialogue tags like " —dijo él— " have correct spacing
    // Rule: —Dijo él (verb of speech in lower case attached to dash)
    trimmed = trimmed.replace(/\s*—\s*/g, " —");

    // Fix dialogue tags: space before dash, no space after dash if continuing, space after if closing tag
    // e.g. "—Hola —dijo él—. ¿Cómo estás?"
    trimmed = trimmed.replace(/—\s*([a-záéíóúñ])/gi, "—$1");

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
