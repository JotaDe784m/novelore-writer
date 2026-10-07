import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Crop, Maximize2 } from "lucide-react";
import { resolveAssetUrl } from "../../../utils/imageUtils";
import { AvatarCropData } from "../../../types";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  entityName?: string;
  initialCrop?: AvatarCropData;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string, cropData: AvatarCropData) => void;
}

const CROP_BOX_W = 240; const CROP_BOX_H = 320; // Proporción fija 3:4

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen, imageUrl, entityName = "Elemento", initialCrop, onClose, onConfirm,
}) => {
  const [zoom, setZoom] = useState(initialCrop?.zoom ?? 1);
  const [pan, setPan] = useState({ x: initialCrop?.x ?? 0, y: initialCrop?.y ?? 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalDim, setNaturalDim] = useState({ w: 0, h: 0 });

  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(initialCrop?.zoom ?? 1);
      setPan({ x: initialCrop?.x ?? 0, y: initialCrop?.y ?? 0 });
      setImgLoaded(false);
    }
  }, [isOpen, initialCrop]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.y),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((prev) => Math.min(5, Math.max(1, +(prev + factor).toFixed(2))));
    };
    el.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => el.removeEventListener("wheel", onNativeWheel);
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    setNaturalDim({ w: el.naturalWidth, h: el.naturalHeight });
    setImgLoaded(true);
  };

  // Escala base para ver la imagen original completa dentro del área de trabajo (460x340)
  const fitScale = useMemo(() => {
    if (!naturalDim.w || !naturalDim.h) return 1;
    return Math.min(460 / naturalDim.w, 340 / naturalDim.h);
  }, [naturalDim]);

  const baseW = Math.round(naturalDim.w * fitScale);
  const baseH = Math.round(naturalDim.h * fitScale);

  const handleReset = () => {
    setZoom(1); setPan({ x: 0, y: 0 });
  };

  const handleFillFrame = () => {
    if (!baseW || !baseH) return;
    const fillScale = Math.max(CROP_BOX_W / baseW, CROP_BOX_H / baseH);
    setZoom(+fillScale.toFixed(2));
    setPan({ x: 0, y: 0 });
  };

  const handleApplyCrop = useCallback(() => {
    const imgEl = imgRef.current;
    const boxEl = cropBoxRef.current;
    if (!imgEl || !boxEl) return;
    const imgRect = imgEl.getBoundingClientRect();
    const boxRect = boxEl.getBoundingClientRect();
    if (!imgRect.width || !boxRect.width) return;

    const targetW = 600; const targetH = 800; // 3:4 fijo nativo
    const canvas = document.createElement("canvas");
    canvas.width = targetW; canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#18181B";
    ctx.fillRect(0, 0, targetW, targetH);
    const scaleRatio = targetW / boxRect.width;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      imgEl,
      (imgRect.left - boxRect.left) * scaleRatio,
      (imgRect.top - boxRect.top) * scaleRatio,
      imgRect.width * scaleRatio,
      imgRect.height * scaleRatio
    );

    const croppedDataUrl = canvas.toDataURL("image/webp", 0.92);
    onConfirm(croppedDataUrl, { x: pan.x, y: pan.y, zoom });
  }, [pan, zoom, onConfirm]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      id="image-crop-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-[90] animate-in fade-in select-none"
    >
      <div
        id="image-crop-modal-container"
        className="w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]"
      >
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-sidebar)]">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-bold font-novel-display">Ajustar Encuadre de Retrato (3:4)</h3>
          </div>
          <button
            type="button" onClick={onClose}
            className="p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative w-full h-[370px] bg-black/95 flex items-center justify-center overflow-hidden touch-none select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <img
            ref={imgRef}
            src={resolveAssetUrl(imageUrl)}
            alt={entityName}
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              width: baseW ? `${baseW}px` : "auto",
              height: baseH ? `${baseH}px` : "auto",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
            className="pointer-events-none select-none max-w-none max-h-none transition-transform duration-75"
          />

          <div
            ref={cropBoxRef}
            className="absolute pointer-events-none rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
            style={{ width: `${CROP_BOX_W}px`, height: `${CROP_BOX_H}px` }}
          >
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
              <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
              <div className="border-r border-white" /><div className="border-r border-white" /><div />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-1 max-w-xs">
            <ZoomOut className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <input
              type="range" min="1" max="5" step="0.05" value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <span className="font-mono text-[11px] text-[var(--text-muted)] w-8 text-right shrink-0">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button" onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] font-medium transition-colors cursor-pointer"
              title="Restaurar a imagen original completa"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Original</span>
            </button>
            <button
              type="button" onClick={handleFillFrame}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] font-medium transition-colors cursor-pointer"
              title="Ajustar zoom para llenar el marco 3:4"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Llenar marco</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
          <span className="text-[11px] text-[var(--text-muted)]">
            Arrastra la imagen para encuadrar. Usa la rueda o el slider para zoom.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button" onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button" disabled={!imgLoaded} onClick={handleApplyCrop}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-95 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Encuadre</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
