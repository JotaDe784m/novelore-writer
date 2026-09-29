import { useState, useCallback } from "react";

export function useFloatingMenus() {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);
  const [fontMenuPos, setFontMenuPos] = useState({ top: 0, left: 0 });
  const [spacingMenuPos, setSpacingMenuPos] = useState({ top: 0, left: 0 });

  const closeFloatingMenus = useCallback(() => {
    setShowFontMenu(false);
    setShowSpacingMenu(false);
  }, []);

  const handleOpenFontMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const target = (e.currentTarget || e.target) as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const top = rect.bottom + 6;
    const left = Math.max(12, Math.min(window.innerWidth - 268, rect.left));

    setFontMenuPos({ top, left });
    setShowSpacingMenu(false);
    setShowFontMenu((prev) => !prev);
  }, []);

  const handleOpenSpacingMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const target = (e.currentTarget || e.target) as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const top = rect.bottom + 6;
    const left = Math.max(12, Math.min(window.innerWidth - 200, rect.left));

    setSpacingMenuPos({ top, left });
    setShowFontMenu(false);
    setShowSpacingMenu((prev) => !prev);
  }, []);

  return {
    showFontMenu,
    setShowFontMenu,
    showSpacingMenu,
    setShowSpacingMenu,
    fontMenuPos,
    spacingMenuPos,
    closeFloatingMenus,
    handleOpenFontMenu,
    handleOpenSpacingMenu,
  };
}
