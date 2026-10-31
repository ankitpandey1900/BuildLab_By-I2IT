import React from "react";
import { cn } from "../../lib/utils";

export const ShimmerButton = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex h-9 overflow-hidden rounded-md p-[1px] focus:outline-none transition-transform active:scale-95 shadow-sm",
        className
      )}
    >
      <span className="absolute inset-[-1000%] animate-[shimmer_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,var(--border-default)_0%,var(--accent-primary)_50%,var(--border-default)_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-[var(--bg-surface)] px-4 py-1 text-xs font-medium text-[var(--text-pure)] backdrop-blur-3xl gap-2 hover:bg-[var(--bg-surface-hover)] transition-colors border border-[var(--border-subtle)]">
        {children}
      </span>
    </button>
  );
};
