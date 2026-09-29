export const DARK_THEMES = [
  "dark",
  "scifi",
  "noir",
  "gothic",
  "forest",
  "midnight",
  "dream",
];

// Helpers para calcular colores derivados del acento
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h, s, l };
}

export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let temp = t;
      if (temp < 0) temp += 1;
      if (temp > 1) temp -= 1;
      if (temp < 1 / 6) return p + (q - p) * 6 * temp;
      if (temp < 1 / 2) return q;
      if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calcula el color para textos, iconos y bordes de realce cuando se proyectan
 * directamente sobre la superficie base, sin alterar el color de acento elegido por el usuario:
 * - Si el color es oscuro y el tema es oscuro: se aclara alternando entre blanco e intermedios.
 * - Si el color es claro y el tema es claro: se oscurece alternando entre negro e intermedios.
 * - Si el color ya tiene buen contraste relativo con el fondo, se mantiene intacto.
 */
export function getReadableAccent(hex: string, isDark: boolean): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const isMonochrome = s < 0.15;

  if (isDark) {
    if (yiq < 100) {
      if (isMonochrome) {
        if (yiq < 30) return "#FFFFFF";
        if (yiq < 65) return "#F4F4F6";
        return "#E4E4E7";
      } else {
        const boosted = hslToRgb(h, Math.max(s, 0.6), 0.65);
        return rgbToHex(boosted.r, boosted.g, boosted.b);
      }
    }
  } else {
    if (yiq > 160) {
      if (isMonochrome) {
        if (yiq > 230) return "#18181B";
        if (yiq > 195) return "#27272A";
        return "#3F3F46";
      } else {
        const reduced = hslToRgb(h, Math.max(s, 0.7), 0.35);
        return rgbToHex(reduced.r, reduced.g, reduced.b);
      }
    }
  }

  return hex;
}

export const getAdaptedAccent = getReadableAccent;

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#FFFFFF";
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 135 ? "#121214" : "#FFFFFF";
}

export function applyStylesToDOM(
  themeId: string,
  customAccent?: string | null
) {
  if (typeof document === "undefined") return;

  const isDark = DARK_THEMES.includes(themeId);
  const root = document.documentElement;
  const body = document.body;

  if (root) {
    root.setAttribute("data-theme", themeId);
    root.className = `theme-${themeId}${isDark ? " dark" : ""}`;
    root.style.colorScheme = isDark ? "dark" : "light";
  }
  if (body) {
    body.setAttribute("data-theme", themeId);
    body.className = isDark ? "dark" : "";
    body.style.colorScheme = isDark ? "dark" : "light";
  }

  if (customAccent && customAccent.trim()) {
    const trimmedAccent = customAccent.trim();
    const contrastColor = getContrastColor(trimmedAccent);
    const readableAccent = getReadableAccent(trimmedAccent, isDark);

    root.style.setProperty("--custom-accent", trimmedAccent);
    root.style.setProperty("--custom-highlight", trimmedAccent);
    root.style.setProperty("--custom-accent-contrast", contrastColor);
    root.style.setProperty("--custom-accent-readable", readableAccent);

    const rgb = hexToRgb(trimmedAccent);
    const readableRgb = hexToRgb(readableAccent) || rgb;

    if (rgb && readableRgb) {
      const isExtremeInvisible =
        (isDark && (trimmedAccent === "#000000" || trimmedAccent.toLowerCase() === "#18181b")) ||
        (!isDark && (trimmedAccent.toLowerCase() === "#ffffff" || trimmedAccent.toLowerCase() === "#f9f9f7"));

      const subtleSource = isExtremeInvisible ? readableRgb : rgb;

      root.style.setProperty(
        "--custom-accent-subtle",
        `rgba(${subtleSource.r}, ${subtleSource.g}, ${subtleSource.b}, ${isDark ? 0.16 : 0.1})`
      );
      root.style.setProperty(
        "--custom-accent-hover",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.88)`
      );
    }
  } else {
    root.style.removeProperty("--custom-accent");
    root.style.removeProperty("--custom-highlight");
    root.style.removeProperty("--custom-accent-contrast");
    root.style.removeProperty("--custom-accent-readable");
    root.style.removeProperty("--custom-accent-subtle");
    root.style.removeProperty("--custom-accent-hover");
  }
}
