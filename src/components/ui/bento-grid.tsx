import React from "react";
import { cn } from "../../lib/utils";
import { CardSpotlight } from "./card-spotlight";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  children,
  onClick,
}: {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <CardSpotlight
      onClick={onClick}
      className={cn(
        "group/bento transition-all duration-200 p-4 sm:p-5 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-[var(--border-subtle)] hover:border-[var(--border-hover)] flex flex-col justify-between min-h-[17rem]",
        className
      )}
    >
      {children}
    </CardSpotlight>
  );
};
