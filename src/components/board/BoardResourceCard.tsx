import React, { useState } from "react";
import {
  Music,
  FileText,
  Globe,
  ExternalLink,
  Download,
  Eye,
  Maximize2,
  Minimize2,
  Edit3,
  Trash2,
  Layers,
  Square as SquareIcon,
  Play,
  File,
  Check,
} from "lucide-react";
import { BoardItem } from "../../types";
import {
  parseSpotifyUrl,
  parseYouTubeUrl,
  getDomainFromUrl,
  getFaviconUrl,
} from "./resourceUtils";
import { AnchorPosition } from "./VisualBoardView";

interface BoardResourceCardProps {
  item: BoardItem;
  isSelected: boolean;
  zoom: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onUpdate: (updated: Partial<BoardItem>) => void;
  onOpenEditModal: () => void;
  onPreviewPdf?: (fileData: string, fileName: string) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onStartResize: (e: React.MouseEvent, handle: "se" | "e" | "s") => void;
  draggingArrowPoint: unknown;
  activeAnchorSnap: { itemId: string; position: AnchorPosition } | null;
}

const BoardResourceCardComponent: React.FC<BoardResourceCardProps> = ({
  item,
  isSelected,
  zoom,
  onMouseDown,
  onClick,
  onDelete,
  onUpdate,
  onOpenEditModal,
  onPreviewPdf,
  onBringToFront,
  onSendToBack,
  onStartResize,
  draggingArrowPoint,
  activeAnchorSnap,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const isSquare = item.linkFormat === "square";

  // Dimension defaults
  const width = item.width || (isSquare ? 280 : 360);
  const defaultHeight = isSquare ? 280 : item.embedMode ? 190 : 130;
  const height = item.height || defaultHeight;

  // Resource analysis
  const spotifyInfo = parseSpotifyUrl(item.linkUrl || "");
  const youtubeInfo = parseYouTubeUrl(item.linkUrl || "");
  const isSpotify = item.linkType === "spotify" || spotifyInfo.isSpotify;
  const isYouTube = item.linkType === "youtube" || youtubeInfo.isYouTube;
  const isDocument = item.linkType === "document" || !!item.fileName || !!item.fileData;
  const isWeb = !isSpotify && !isYouTube && !isDocument;

  const domain = getDomainFromUrl(item.linkUrl || "");
  const favicon = getFaviconUrl(item.linkUrl || "");

  // Toggle card format: rectangle <-> square
  const handleToggleFormat = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextFormat = isSquare ? "rectangle" : "square";
    const nextW = nextFormat === "square" ? 280 : 360;
    const nextH = nextFormat === "square" ? 280 : item.embedMode ? 190 : 130;
    onUpdate({
      linkFormat: nextFormat,
      width: nextW,
      height: nextH,
    });
  };

  // Toggle inline player
  const handleToggleEmbed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextEmbed = !item.embedMode;
    let nextH = height;
    if (nextEmbed) {
      nextH = isSquare ? (isSpotify ? 352 : 280) : isSpotify ? 190 : 225;
    } else {
      nextH = isSquare ? 280 : 130;
    }
    onUpdate({
      embedMode: nextEmbed,
      height: nextH,
    });
  };

  // Open external URL
  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.linkUrl) {
      window.open(item.linkUrl, "_blank", "noopener,noreferrer");
    } else if (item.fileData && onPreviewPdf) {
      onPreviewPdf(item.fileData, item.fileName || "documento.pdf");
    }
  };

  // Download document
  const handleDownloadDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.fileData && !item.linkUrl) return;
    const a = document.createElement("a");
    a.href = item.fileData || item.linkUrl || "#";
    a.download = item.fileName || "documento";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id={item.id}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`board-item-node group absolute rounded-2xl select-none transition-shadow cursor-grab active:cursor-grabbing border ${
        isSelected
          ? "ring-2 ring-[var(--accent)] ring-offset-2 shadow-2xl z-30"
          : "hover:shadow-lg shadow-md z-10"
      }`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: item.backgroundColor || "var(--bg-card)",
        borderColor: item.borderColor || (isSelected ? "var(--accent)" : "var(--border-color)"),
      }}
    >
      {/* Magnetic Anchor Ports when connecting arrows */}
      {draggingArrowPoint !== null && (
        <>
          {(["top", "right", "bottom", "left"] as AnchorPosition[]).map((pos) => {
            const isSnapped = activeAnchorSnap?.itemId === item.id && activeAnchorSnap?.position === pos;
            const posClasses =
              pos === "top"
                ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : pos === "right"
                ? "top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
                : pos === "bottom"
                ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                : "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2";

            return (
              <div
                key={`anchor-link-${item.id}-${pos}`}
                className={`absolute pointer-events-none rounded-full transition-all duration-150 z-50 ${posClasses} ${
                  isSnapped
                    ? "w-3.5 h-3.5 bg-sky-500 ring-4 ring-sky-300 dark:ring-sky-600 scale-125 shadow-lg animate-pulse"
                    : "w-2.5 h-2.5 bg-sky-400/80 ring-2 ring-white dark:ring-zinc-900 shadow-sm opacity-80"
                }`}
              />
            );
          })}
        </>
      )}

      {/* Floating Action Header (Visible on Hover or when Selected) */}
      <div
        className={`absolute -top-9.5 left-0 right-0 flex items-center justify-between gap-1 px-2 py-1 rounded-xl bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-color)] shadow-md z-40 transition-opacity pointer-events-auto ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Left: Badge & Format Switch */}
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              isSpotify
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : isYouTube
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : isDocument
                ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
            }`}
          >
            {isSpotify ? "Spotify" : isYouTube ? "YouTube" : isDocument ? (item.fileType?.toUpperCase() || "DOC") : "Web"}
          </span>

          <button
            type="button"
            onClick={handleToggleFormat}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title={isSquare ? "Cambiar a formato rectangular" : "Cambiar a formato cuadrado"}
          >
            {isSquare ? <SquareIcon className="w-3.5 h-3.5 text-[var(--accent)]" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Player Toggle for Audio / Video */}
          {(isSpotify || isYouTube) && (
            <button
              type="button"
              onClick={handleToggleEmbed}
              className={`p-1 rounded-md transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] font-medium ${
                item.embedMode
                  ? "bg-[var(--accent)]/15 text-[var(--accent)] font-bold"
                  : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
              title={item.embedMode ? "Alternar a modo tarjeta compacta" : "Activar reproductor incrustado"}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{item.embedMode ? "Ficha" : "Reproducir"}</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5">
          {item.linkUrl && (
            <button
              type="button"
              onClick={handleOpenLink}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {isDocument && item.fileData && (
            <button
              type="button"
              onClick={handleDownloadDocument}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Descargar archivo"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditModal();
            }}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Editar tarjeta"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBringToFront();
            }}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Traer al frente"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded-md hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
            title="Eliminar tarjeta"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="w-full h-full rounded-2xl overflow-hidden flex flex-col border border-[var(--border-color)]">
        {/* CASE 1: EMBED PLAYER (SPOTIFY) */}
        {isSpotify && item.embedMode && spotifyInfo.embedUrl ? (
          <div className="w-full h-full relative bg-[#121212] flex flex-col">
            <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium truncate">
                <Music className="w-3.5 h-3.5 text-[#1DB954]" />
                <span className="truncate">{item.title || "Spotify Music"}</span>
              </div>
              <button
                type="button"
                onClick={handleToggleEmbed}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Minimizar a tarjeta"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
            <iframe
              src={spotifyInfo.embedUrl}
              title={item.title || "Spotify Player"}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="flex-1 w-full h-full"
            />
          </div>
        ) : isYouTube && item.embedMode && youtubeInfo.embedUrl ? (
          /* CASE 2: EMBED PLAYER (YOUTUBE) */
          <div className="w-full h-full relative bg-black flex flex-col">
            <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium truncate">
                <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span className="truncate">{item.title || "YouTube Video"}</span>
              </div>
              <button
                type="button"
                onClick={handleToggleEmbed}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Minimizar a tarjeta"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
            <iframe
              src={youtubeInfo.embedUrl}
              title={item.title || "YouTube Player"}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="flex-1 w-full h-full"
            />
          </div>
        ) : isSpotify ? (
          /* CASE 3: SPOTIFY CARD (RECTANGLE OR SQUARE) */
          <div
            className={`w-full h-full p-4 flex ${
              isSquare ? "flex-col justify-between" : "flex-row items-center gap-4"
            } bg-gradient-to-br from-[#121212] to-[#1e1e1e] text-white relative overflow-hidden`}
          >
            {/* Spotify Green Glow Accent */}
            <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-[#1DB954]/15 blur-2xl pointer-events-none" />

            {/* Left/Top Icon Box */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                <Music className="w-6 h-6 text-[#1DB954]" />
              </div>
              {isSquare && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#1DB954] font-bold">
                    {spotifyInfo.type === "playlist" ? "Playlist de Spotify" : "Pista de Spotify"}
                  </span>
                  <h4 className="font-bold text-sm text-white truncate max-w-[180px]">
                    {item.title || "Música / Canción"}
                  </h4>
                </div>
              )}
            </div>

            {/* Info Body */}
            <div className={`flex-1 min-w-0 ${isSquare ? "my-2" : ""}`}>
              {!isSquare && (
                <>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#1DB954] font-bold">
                      {spotifyInfo.type === "playlist" ? "Playlist de Spotify" : "Pista de Spotify"}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate">
                    {item.title || "Música / Canción"}
                  </h4>
                </>
              )}
              {item.description && (
                <p className="text-xs text-white/70 line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Bottom/Right Play & Open Buttons */}
            <div className={`flex items-center gap-2 shrink-0 ${isSquare ? "w-full justify-between pt-2 border-t border-white/10" : ""}`}>
              <button
                type="button"
                onClick={handleToggleEmbed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                title="Reproducir directamente en la pizarra"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Reproducir</span>
              </button>

              {item.linkUrl && (
                <button
                  type="button"
                  onClick={handleOpenLink}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Abrir en la app de Spotify"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : isYouTube ? (
          /* CASE 4: YOUTUBE CARD */
          <div
            className={`w-full h-full p-4 flex ${
              isSquare ? "flex-col justify-between" : "flex-row items-center gap-4"
            } bg-gradient-to-br from-zinc-950 to-zinc-900 text-white relative overflow-hidden`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0 shadow-lg">
                <Play className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              {isSquare && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                    YouTube Audio/Video
                  </span>
                  <h4 className="font-bold text-sm text-white truncate max-w-[180px]">
                    {item.title || "Video de YouTube"}
                  </h4>
                </div>
              )}
            </div>

            <div className={`flex-1 min-w-0 ${isSquare ? "my-2" : ""}`}>
              {!isSquare && (
                <>
                  <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                    YouTube
                  </span>
                  <h4 className="font-bold text-sm text-white truncate">
                    {item.title || "Video de YouTube"}
                  </h4>
                </>
              )}
              {item.description && (
                <p className="text-xs text-white/70 line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>

            <div className={`flex items-center gap-2 shrink-0 ${isSquare ? "w-full justify-between pt-2 border-t border-white/10" : ""}`}>
              <button
                type="button"
                onClick={handleToggleEmbed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Ver video</span>
              </button>
            </div>
          </div>
        ) : isDocument ? (
          /* CASE 5: DOCUMENT / PDF CARD */
          <div
            className={`w-full h-full p-4 flex ${
              isSquare ? "flex-col justify-between" : "flex-row items-center gap-4"
            } bg-[var(--bg-card)] text-[var(--text-main)] relative overflow-hidden`}
          >
            {/* Left/Top File Icon Box */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  item.fileType === "pdf"
                    ? "bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400"
                    : item.fileType === "doc"
                    ? "bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400"
                    : "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>
              {isSquare && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-500/15 text-red-600 dark:text-red-400">
                      {item.fileType?.toUpperCase() || "PDF"}
                    </span>
                    {item.fileSize && (
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        {item.fileSize}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[var(--text-main)] truncate max-w-[180px] mt-0.5">
                    {item.title || item.fileName || "Documento adjunto"}
                  </h4>
                </div>
              )}
            </div>

            {/* Middle Info */}
            <div className={`flex-1 min-w-0 ${isSquare ? "my-2" : ""}`}>
              {!isSquare && (
                <>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-red-500/15 text-red-600 dark:text-red-400">
                      {item.fileType?.toUpperCase() || "PDF"}
                    </span>
                    {item.fileSize && (
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        {item.fileSize}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[var(--text-main)] truncate">
                    {item.title || item.fileName || "Documento adjunto"}
                  </h4>
                </>
              )}
              {item.description && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.fileName && item.title && (
                <span className="text-[10px] text-[var(--text-muted)]/70 truncate block mt-0.5 font-mono">
                  {item.fileName}
                </span>
              )}
            </div>

            {/* Actions: Ver / Descargar */}
            <div className={`flex items-center gap-2 shrink-0 ${isSquare ? "w-full justify-between pt-2 border-t border-[var(--border-color)]" : ""}`}>
              {item.fileData && onPreviewPdf && (
                <button
                  type="button"
                  onClick={() => onPreviewPdf(item.fileData!, item.fileName || item.title || "documento.pdf")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  title="Abrir visor de documento"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadDocument}
                className="p-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] border border-[var(--border-color)] text-[var(--text-muted)] transition-colors cursor-pointer"
                title="Descargar archivo"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* CASE 6: WEB LINK CARD */
          <div
            className={`w-full h-full p-4 flex ${
              isSquare ? "flex-col justify-between" : "flex-row items-center gap-4"
            } bg-[var(--bg-card)] text-[var(--text-main)] relative overflow-hidden`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {favicon ? (
                  <img
                    src={favicon}
                    alt={domain}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Globe className="w-6 h-6 text-[var(--accent)]" />
                )}
              </div>
              {isSquare && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[var(--accent)] truncate">
                    {domain || "Enlace Web"}
                  </span>
                  <h4 className="font-bold text-sm text-[var(--text-main)] truncate max-w-[180px] mt-0.5">
                    {item.title || domain || "Página web"}
                  </h4>
                </div>
              )}
            </div>

            <div className={`flex-1 min-w-0 ${isSquare ? "my-2" : ""}`}>
              {!isSquare && (
                <>
                  <span className="text-[10px] uppercase font-bold text-[var(--accent)] truncate block">
                    {domain || "Enlace Web"}
                  </span>
                  <h4 className="font-bold text-sm text-[var(--text-main)] truncate">
                    {item.title || domain || "Página web"}
                  </h4>
                </>
              )}
              {item.description && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            <div className={`flex items-center gap-2 shrink-0 ${isSquare ? "w-full justify-end pt-2 border-t border-[var(--border-color)]" : ""}`}>
              <button
                type="button"
                onClick={handleOpenLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] border border-[var(--border-color)] font-semibold text-xs transition-colors cursor-pointer"
                title="Abrir enlace en pestaña nueva"
              >
                <span>Visitar</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Directional Resize Handles matching board shapes and images */}
      {/* Corner Resize Handle (Bottom-Right) */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize(e, "se");
        }}
        className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[var(--accent)] border-2 border-white dark:border-zinc-900 rounded-full shadow-md cursor-nwse-resize hover:scale-125 transition-all z-50 ${
          isSelected ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"
        }`}
        title="Arrastra para redimensionar (esquina)"
      />

      {/* Side Resize Handle (Right edge to widen) */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize(e, "e");
        }}
        className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-7 bg-[var(--accent)]/90 border border-white dark:border-zinc-900 rounded-full shadow-xs cursor-ew-resize hover:scale-125 transition-all z-50 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        title="Arrastra para ensanchar"
      />

      {/* Bottom Resize Handle (Bottom edge to lengthen) */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize(e, "s");
        }}
        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-2 bg-[var(--accent)]/90 border border-white dark:border-zinc-900 rounded-full shadow-xs cursor-ns-resize hover:scale-125 transition-all z-50 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        title="Arrastra para alargar"
      />
    </div>
  );
};

export const BoardResourceCard = React.memo(BoardResourceCardComponent);
