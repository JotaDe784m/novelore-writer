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

  const onScrollOrResizeRef = useRef(onScrollOrResize);
  useEffect(() => {
    onScrollOrResizeRef.current = onScrollOrResize;
  }, [onScrollOrResize]);

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

    const handleScroll = () => {
      checkRibbonScroll();
      onScrollOrResizeRef.current?.();
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

    const handleWindowResize = () => {
      checkRibbonScroll();
      onScrollOrResizeRef.current?.();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("resize", handleWindowResize);

    const ro = new ResizeObserver(() => {
      checkRibbonScroll();
    });
    ro.observe(el);

    checkRibbonScroll();
    const t = setTimeout(checkRibbonScroll, 120);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("resize", handleWindowResize);
      ro.disconnect();
      clearTimeout(t);
    };
  }, [checkRibbonScroll]);

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

