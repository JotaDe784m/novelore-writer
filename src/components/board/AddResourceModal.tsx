import React, { useState, useRef, useEffect } from "react";
import {
  Link2,
  FileText,
  Music,
  Globe,
  Upload,
  X,
  Play,
  Check,
  Maximize2,
  Square as SquareIcon,
  Sparkles,
} from "lucide-react";
import { BoardItem } from "../../types";
import {
  parseSpotifyUrl,
  parseYouTubeUrl,
  getDomainFromUrl,
  formatFileSize,
  getFileTypeFromName,
} from "./resourceUtils";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<BoardItem>) => void;
  initialItem?: BoardItem | null;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [activeTab, setActiveTab] = useState<"link" | "file">("link");

  // Form State
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [embedMode, setEmbedMode] = useState(true);
  const [format, setFormat] = useState<"rectangle" | "square">("rectangle");

  // File state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: "pdf" | "doc" | "txt" | "other";
    dataUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset when opened or initialItem changes
  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setUrl(initialItem.linkUrl || "");
        setTitle(initialItem.title || "");
        setDescription(initialItem.description || "");
        setEmbedMode(initialItem.embedMode ?? true);
        setFormat(initialItem.linkFormat || "rectangle");
        if (initialItem.fileName) {
          setActiveTab("file");
          setSelectedFile({
            name: initialItem.fileName,
            size: initialItem.fileSize || "",
            type: initialItem.fileType || "pdf",
            dataUrl: initialItem.fileData || "",
          });
        } else {
          setActiveTab("link");
          setSelectedFile(null);
        }
      } else {
        setUrl("");
        setTitle("");
        setDescription("");
        setEmbedMode(true);
        setFormat("rectangle");
        setSelectedFile(null);
        setActiveTab("link");
      }
    }
  }, [isOpen, initialItem]);

  if (!isOpen) return null;

  // Analysis of current URL
  const spotify = parseSpotifyUrl(url);
  const youtube = parseYouTubeUrl(url);
  const domain = getDomainFromUrl(url);
  const isAudioOrVideo = spotify.isSpotify || youtube.isYouTube;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileType = getFileTypeFromName(file.name);
      setSelectedFile({
        name: file.name,
        size: formatFileSize(file.size),
        type: fileType,
        dataUrl,
      });
      if (!title) {
        // Auto-fill title with friendly file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setTitle(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "link") {
      if (!url.trim()) return;

      let linkType: "spotify" | "youtube" | "web" = "web";
      if (spotify.isSpotify) linkType = "spotify";
      else if (youtube.isYouTube) linkType = "youtube";

      const defaultTitle = title.trim() || (spotify.isSpotify ? "Playlist / Canción de Spotify" : youtube.isYouTube ? "Video de YouTube" : domain || "Enlace Web");

      const width = format === "square" ? 280 : 360;
      const height = format === "square" ? (spotify.isSpotify && embedMode ? 352 : 280) : embedMode && (spotify.isSpotify || youtube.isYouTube) ? 190 : 130;

      onSave({
        type: "link",
        linkUrl: url.trim(),
        title: defaultTitle,
        description: description.trim(),
        linkType,
        embedMode: isAudioOrVideo ? embedMode : false,
        linkFormat: format,
        width,
        height,
      });
    } else {
      if (!selectedFile && !initialItem?.fileData) return;

      const width = format === "square" ? 280 : 360;
      const height = format === "square" ? 280 : 130;

      onSave({
        type: "link",
        linkType: "document",
        fileName: selectedFile?.name || initialItem?.fileName || "documento.pdf",
        fileSize: selectedFile?.size || initialItem?.fileSize || "",
        fileType: selectedFile?.type || initialItem?.fileType || "pdf",
        fileData: selectedFile?.dataUrl || initialItem?.fileData || "",
        title: title.trim() || selectedFile?.name || "Documento adjunto",
        description: description.trim(),
        linkFormat: format,
        width,
        height,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {initialItem ? "Editar Recurso" : "Añadir a la Pizarra"}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Música de Spotify, enlaces de investigación o documentos PDF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 m-4 mb-2 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "link"
                ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-sm font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Enlace / Música</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "file"
                ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-sm font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documento / PDF</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-3 flex flex-col gap-3.5">
          {activeTab === "link" ? (
            <>
              {/* URL Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-main)] flex items-center justify-between">
                  <span>URL del enlace o canción</span>
                  {spotify.isSpotify && (
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Music className="w-2.5 h-2.5" /> Spotify Detectado
                    </span>
                  )}
                  {youtube.isYouTube && (
                    <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-red-500" /> YouTube Detectado
                    </span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/... o enlace web"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-xs outline-none transition-all placeholder:text-[var(--text-muted)]/60"
                  />
                </div>
              </div>

              {/* Embed toggle if Spotify or YouTube */}
              {isAudioOrVideo && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Play className="w-3 h-3 fill-current" />
                      Reproductor incrustado
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Reproduce la música directamente dentro de la pizarra
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmbedMode(!embedMode)}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      embedMode ? "bg-emerald-500" : "bg-[var(--border-color)]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        embedMode ? "left-5" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Local File Picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                  selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-[var(--border-color)] hover:border-[var(--accent)] bg-[var(--bg-input)]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                {selectedFile ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-[280px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {selectedFile.type.toUpperCase()} • {selectedFile.size} (Listo para adjuntar)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text-main)]">
                      Selecciona o arrastra un PDF o documento
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Formatos compatibles: PDF, DOCX, TXT, MD
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-main)]">
              Título en la tarjeta
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Banda sonora de batalla, Investigación de armas..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-xs outline-none transition-all placeholder:text-[var(--text-muted)]/60"
            />
          </div>

          {/* Description / Notes Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-main)]">
              Notas o descripción breve <span className="font-normal text-[var(--text-muted)]">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ej. Escuchar durante el asalto al castillo en el capítulo 12..."
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-xs outline-none transition-all resize-none placeholder:text-[var(--text-muted)]/60"
            />
          </div>

          {/* Format Selector: Rectangle vs Square */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-main)]">
              Formato de tarjeta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("rectangle")}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  format === "rectangle"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold"
                    : "border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)]"
                }`}
              >
                <div className="w-6 h-4 rounded border border-current flex items-center justify-center shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs">Rectangular</span>
                  <span className="text-[10px] opacity-70">Banner panorámico</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("square")}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  format === "square"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-bold"
                    : "border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)]"
                }`}
              >
                <SquareIcon className="w-5 h-5 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs">Cuadrado</span>
                  <span className="text-[10px] opacity-70">Ficha cover</span>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-color)] mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--text-muted)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialItem ? "Guardar cambios" : "Añadir a la pizarra"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
