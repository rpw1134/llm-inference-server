"use client";

import { useState } from "react";
import { InfoIcon } from "../icons/InfoIcon";

type InfoTooltipProps = {
  content: string;
  className?: string;
};

export function InfoTooltip({ content, className = "" }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="flex items-center justify-center text-neutral-500 transition hover:text-orange-400"
        aria-label="More information"
      >
        <InfoIcon className="h-3.5 w-3.5" />
      </button>

      {isVisible && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-xs text-neutral-200 shadow-xl shadow-black/50"
          role="tooltip"
        >
          <div className="absolute -top-1 right-2 h-2 w-2 rotate-45 border-l border-t border-neutral-700 bg-neutral-900" />
          {content}
        </div>
      )}
    </div>
  );
}
