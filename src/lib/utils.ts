import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMaturityColor(maturity: string) {
  switch (maturity) {
    case 'active':
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-500 dark:text-emerald-400',
        badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };
    case 'prototype':
      return {
        dot: 'bg-violet-500',
        text: 'text-violet-500 dark:text-violet-400',
        badge: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400',
      };
    case 'idea':
      return {
        dot: 'bg-amber-400',
        text: 'text-amber-500 dark:text-amber-400',
        badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      };
    case 'maintenance':
      return {
        dot: 'bg-sky-400',
        text: 'text-sky-500 dark:text-sky-400',
        badge: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400',
      };
    case 'paused':
      return {
        dot: 'bg-orange-500',
        text: 'text-orange-500 dark:text-orange-400',
        badge: 'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400',
      };
    case 'archived':
    default:
      return {
        dot: 'bg-zinc-400',
        text: 'text-zinc-500 dark:text-zinc-400',
        badge: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
      };
  }
}
