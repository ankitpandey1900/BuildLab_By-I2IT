"use client";

import React from 'react';
import { TechIcon } from './TechIcon';

export interface TechBadgeProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const getTechIcon = (tech: string, className = "w-3.5 h-3.5", strokeWidth = 2): React.ReactNode => {
  return <TechIcon name={tech} className={className} strokeWidth={strokeWidth} />;
};

export const TechBadge: React.FC<TechBadgeProps> = ({ name, className = '', size = 'sm' }) => {
  const icon = getTechIcon(name, size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5", 2);
  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2.5 py-0.5' 
    : 'text-xs px-3 py-1';

  return (
    <span 
      className={`tech-badge-container inline-flex items-center gap-1.5 rounded-md font-mono shrink-0 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-colors shadow-2xs ${sizeClasses} ${className}`}
    >
      {icon}
      <span>{name}</span>
    </span>
  );
};
