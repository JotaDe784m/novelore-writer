import { useState } from "react";

export function useFloatingMenus() {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);
  const [fontMenuPos, setFontMenuPos] = useState({ top: 0, left: 0 });
  const [spacingMenuPos, setSpacingMenuPos] = useState({ top: 0, left: 0 });

  const closeFloatingMenus = () => {
    setShowFontMenu(false);
    setShowSpacingMenu(false);
  };

  const handleOpenFontMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (showFontMenu) {
      setShowFontMenu(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setFontMenuPos({
      top: rect.bottom + 6,
      left: Math.max(12, Math.min(window.innerWidth - 268, rect.left)),
    });
    setShowFontMenu(true);
    setShowSpacingMenu(false);
  };

  const handleOpenSpacingMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (showSpacingMenu) {
      setShowSpacingMenu(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setSpacingMenuPos({
      top: rect.bottom + 6,
      left: Math.max(12, Math.min(window.innerWidth - 200, rect.left)),
    });
    setShowSpacingMenu(true);
    setShowFontMenu(false);
  };

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

