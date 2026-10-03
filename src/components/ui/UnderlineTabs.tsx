import React from "react";
import { motion } from "motion/react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface UnderlineTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  layoutId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const UnderlineTabs: React.FC<UnderlineTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  layoutId = "active-tab-underline",
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "text-xs py-1.5 px-2.5 gap-1.5",
    md: "text-xs sm:text-sm py-2 px-3 gap-2",
    lg: "text-sm sm:text-base py-2.5 px-4 gap-2.5",
  }[size];

  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 overflow-x-auto scrollbar-none select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center font-medium transition-colors shrink-0 cursor-pointer ${sizeClasses} ${
              isActive
                ? "text-[var(--text-main)] font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                  isActive
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold"
                    : "bg-black/5 dark:bg-white/5 text-[var(--text-muted)]"
                }`}
              >
                {tab.count}
              </span>
            )}

            {/* Active Indicator Underline */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute bottom-0 left-1 right-1 h-[2px] bg-[var(--accent)] rounded-full"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
