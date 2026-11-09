"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { getTechIcon, getTechColor } from "./techIconMap";

export interface TechIconProps {
  name: string;
  className?: string;
  showColor?: boolean;
  strokeWidth?: number;
}

export function TechIcon({
  name,
  className = "w-4 h-4",
  showColor = true,
  strokeWidth = 2,
}: TechIconProps) {
  const icon = getTechIcon(name);

  if (!icon) return null;

  const colorClass = showColor ? getTechColor(name) : "";

  return (
    <Icon
      icon={icon}
      className={`${className} ${colorClass} shrink-0 inline-block`}
      strokeWidth={strokeWidth}
      style={{ strokeWidth }}
      aria-hidden="true"
    />
  );
}
