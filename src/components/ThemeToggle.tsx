"use client";

import React, { useEffect, useState, useRef } from "react";
import { Moon, Sun, Glasses, Check, ChevronDown } from "lucide-react";

export type ThemeMode = "dark" | "light" | "amber";

interface ThemeOption {
  id: ThemeMode;
  name: string;
  icon: React.ReactNode;
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyThemeToDOM = (newTheme: ThemeMode) => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.classList.remove("dark", "light", "amber");
    document.documentElement.classList.add(newTheme);
    if (newTheme === "amber" || newTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
    try {
      localStorage.setItem("campus_dev_theme", newTheme);
    } catch {
      // Ignore storage errors in private mode
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("campus_dev_theme") as ThemeMode | null;
      if (saved === "light" || saved === "amber") {
        setTheme(saved);
        applyThemeToDOM(saved);
      } else {
        applyThemeToDOM("dark");
      }
    } catch {
      applyThemeToDOM("dark");
    }
  }, []);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const switchTheme = (newTheme: ThemeMode, event?: React.MouseEvent) => {
    if (newTheme === theme) {
      setIsOpen(false);
      return;
    }

    const btn = event?.currentTarget || containerRef.current;
    const rect = btn?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const isDiverge = newTheme === "light" || (theme === "dark" && newTheme === "amber");
    const doc = document as any;

    if (typeof doc.startViewTransition === "function") {
      if (!isDiverge) {
        document.documentElement.classList.add("theme-transition-converge");
      } else {
        document.documentElement.classList.remove("theme-transition-converge");
      }

      const transition = doc.startViewTransition(() => {
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
        setIsOpen(false);
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];

        const anim = document.documentElement.animate(
          {
            clipPath: isDiverge ? clipPath : [...clipPath].reverse()
          },
          {
            duration: 480,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            pseudoElement: isDiverge ? "::view-transition-new(root)" : "::view-transition-old(root)"
          }
        );

        anim.onfinish = () => {
          document.documentElement.classList.remove("theme-transition-converge");
        };
      });
    } else {
      triggerRippleWave(newTheme, x, y, isDiverge, endRadius);
      setIsOpen(false);
    }
  };

  const triggerRippleWave = (
    newTheme: ThemeMode,
    x: number,
    y: number,
    isDiverge: boolean,
    endRadius: number
  ) => {
    const overlay = document.createElement("div");
    const targetBg = newTheme === "light" ? "#fcfcfd" : newTheme === "amber" ? "#201811" : "#09090b";

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.pointerEvents = "none";
    overlay.style.backgroundColor = targetBg;
    overlay.style.transition = "clip-path 420ms cubic-bezier(0.25, 1, 0.5, 1), opacity 150ms ease";

    if (isDiverge) {
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
        setTimeout(() => {
          setTheme(newTheme);
          applyThemeToDOM(newTheme);
          overlay.style.opacity = "0";
          setTimeout(() => overlay.remove(), 150);
        }, 360);
      });
    } else {
      overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        setTimeout(() => overlay.remove(), 420);
      });
    }
  };

  const themeOptions: ThemeOption[] = [
    {
      id: "dark",
      name: "Dark",
      icon: <Moon size={14} className="text-sky-400 shrink-0" />,
    },
    {
      id: "light",
      name: "Light",
      icon: <Sun size={14} className="text-amber-500 shrink-0" />,
    },
    {
      id: "amber",
      name: "Amber",
      icon: <Glasses size={14} className="text-amber-400 shrink-0" />,
    },
  ];

  const currentOption = themeOptions.find((t) => t.id === theme) || themeOptions[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Current theme: ${currentOption.name}. Click to switch`}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] hover:border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-pure)] transition-all cursor-pointer shadow-2xs group"
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-[var(--bg-surface-elevated)] group-hover:scale-105 transition-transform">
          {theme === "dark" && <Moon size={13} className="text-sky-400" />}
          {theme === "light" && <Sun size={13} className="text-amber-500" />}
          {theme === "amber" && <Glasses size={13} className="text-amber-400" />}
        </div>
        <ChevronDown 
          size={12} 
          className={`text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Floating Small & Simple Theme Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-36 rounded-xl border border-[var(--border-default)] shadow-[0_12px_32px_rgba(0,0,0,0.55)] p-1 z-[100] animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: "var(--bg-surface)" }}
        >
          <div className="space-y-0.5">
            {themeOptions.map((opt) => {
              const isSelected = opt.id === theme;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => switchTheme(opt.id, e)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] font-semibold shadow-2xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    <span>{opt.name}</span>
                  </span>
                  {isSelected && (
                    <Check size={13} className="text-emerald-400 shrink-0 animate-in zoom-in-50 duration-150" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
