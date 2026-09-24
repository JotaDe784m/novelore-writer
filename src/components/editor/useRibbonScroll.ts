import { useState, useRef, useEffect, useCallback } from "react";

export function useRibbonScroll(onScrollOrResize?: () => void) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const [canScrollRibbonLeft, setCanScrollRibbonLeft] = useState(false);
  const [canScrollRibbonRight, setCanScrollRibbonRight] = useState(false);
  const [isRibbonOverflowing, setIsRibbonOverflowing] = useState(false);
  const [isDraggingRibbon, setIsDraggingRibbon] = useState(false);

  const isDraggingRibbonRef = useRef(false);
  const ribbonStartXRef = useRef(0);
  const ribbonScrollLeftRef = useRef(0);
  const ribbonHasMovedRef = useRef(false);

  const checkRibbonScroll = useCallback(() => {
    const el = ribbonRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflowing = scrollWidth > clientWidth + 2;
    setIsRibbonOverflowing(overflowing);
    setCanScrollRibbonLeft(overflowing && scrollLeft > 2);
    setCanScrollRibbonRight(overflowing && scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  const scrollRibbon = (direction: "left" | "right") => {
    const el = ribbonRef.current;
    if (!el) return;
    const amount = direction === "left" ? -180 : 180;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkRibbonScroll, 200);
  };

  const handleRibbonMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("select")) {
      return;
    }
    const el = ribbonRef.current;
    if (!el) return;
    isDraggingRibbonRef.current = true;
    ribbonHasMovedRef.current = false;
    ribbonStartXRef.current = e.pageX;
    ribbonScrollLeftRef.current = el.scrollLeft;
  };

  useEffect(() => {
    const el = ribbonRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && !e.deltaX) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkRibbonScroll();
      }
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRibbonRef.current || !ribbonRef.current) return;
      const delta = e.pageX - ribbonStartXRef.current;
      if (Math.abs(delta) > 3) {
        ribbonHasMovedRef.current = true;
        setIsDraggingRibbon(true);
        ribbonRef.current.scrollLeft = ribbonScrollLeftRef.current - delta;
        checkRibbonScroll();
      }
    };

    const handleWindowMouseUp = () => {
      if (isDraggingRibbonRef.current) {
        if (ribbonHasMovedRef.current) {
          const suppressClick = (clickEvt: MouseEvent) => {
            clickEvt.stopPropagation();
            clickEvt.preventDefault();
            window.removeEventListener("click", suppressClick, true);
          };
          window.addEventListener("click", suppressClick, true);
          setTimeout(() => window.removeEventListener("click", suppressClick, true), 100);
        }
        isDraggingRibbonRef.current = false;
        setIsDraggingRibbon(false);
        ribbonHasMovedRef.current = false;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", checkRibbonScroll, { passive: true });
    if (onScrollOrResize) {
      el.addEventListener("scroll", onScrollOrResize, { passive: true });
    }
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    const ro = new ResizeObserver(() => {
      checkRibbonScroll();
      if (onScrollOrResize) onScrollOrResize();
    });
    ro.observe(el);
    window.addEventListener("resize", checkRibbonScroll);

    checkRibbonScroll();
    const t = setTimeout(checkRibbonScroll, 120);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", checkRibbonScroll);
      if (onScrollOrResize) {
        el.removeEventListener("scroll", onScrollOrResize);
      }
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      ro.disconnect();
      window.removeEventListener("resize", checkRibbonScroll);
      clearTimeout(t);
    };
  }, [checkRibbonScroll, onScrollOrResize]);

  return {
    ribbonRef,
    canScrollRibbonLeft,
    canScrollRibbonRight,
    isRibbonOverflowing,
    isDraggingRibbon,
    handleRibbonMouseDown,
    scrollRibbon,
    checkRibbonScroll,
  };
}

