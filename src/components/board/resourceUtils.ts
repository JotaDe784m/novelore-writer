/**
 * Utilities for whiteboard links, media cards, and document attachments
 */

export interface SpotifyInfo {
  isSpotify: boolean;
  type: "track" | "album" | "playlist" | "episode" | null;
  id: string | null;
  embedUrl: string | null;
}

export function parseSpotifyUrl(rawUrl: string): SpotifyInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isSpotify: false, type: null, id: null, embedUrl: null };
  }
  const clean = rawUrl.trim();

  // Pattern: open.spotify.com/(intl-xx/)?(track|album|playlist|episode)/([a-zA-Z0-9]+)
  const webRegex = /open\.spotify\.com\/(?:intl-[a-z]{2,3}(?:-[a-z]{2,3})?\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i;
  const webMatch = clean.match(webRegex);
  if (webMatch) {
    const type = webMatch[1].toLowerCase() as "track" | "album" | "playlist" | "episode";
    const id = webMatch[2];
    return {
      isSpotify: true,
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    };
  }

  // URI Pattern: spotify:(track|album|playlist|episode):([a-zA-Z0-9]+)
  const uriRegex = /spotify:(track|album|playlist|episode):([a-zA-Z0-9]+)/i;
  const uriMatch = clean.match(uriRegex);
  if (uriMatch) {
    const type = uriMatch[1].toLowerCase() as "track" | "album" | "playlist" | "episode";
    const id = uriMatch[2];
    return {
      isSpotify: true,
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    };
  }

  return { isSpotify: false, type: null, id: null, embedUrl: null };
}

export interface YouTubeInfo {
  isYouTube: boolean;
  videoId: string | null;
  embedUrl: string | null;
}

export function parseYouTubeUrl(rawUrl: string): YouTubeInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isYouTube: false, videoId: null, embedUrl: null };
  }
  const clean = rawUrl.trim();

  // Common YouTube URL variations (youtu.be, youtube.com, music.youtube.com)
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i;
  const match = clean.match(regExp);
  if (match && match[1]) {
    const videoId = match[1];
    return {
      isYouTube: true,
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    };
  }

  return { isYouTube: false, videoId: null, embedUrl: null };
}

export function getDomainFromUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    let formatted = rawUrl.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      formatted = "https://" + formatted;
    }
    const u = new URL(formatted);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getFaviconUrl(rawUrl: string): string {
  const domain = getDomainFromUrl(rawUrl);
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileTypeFromName(filename: string): "pdf" | "doc" | "txt" | "other" {
  if (!filename) return "other";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx" || ext === "odt" || ext === "rtf") return "doc";
  if (ext === "txt" || ext === "md") return "txt";
  return "other";
}
