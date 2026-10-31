import React, { useEffect, useState } from "react";
import { Moon, Sun, Glasses } from "lucide-react";

export type ThemeMode = "dark" | "light" | "amber";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>("dark");

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

  const switchTheme = (newTheme: ThemeMode, event: React.MouseEvent<HTMLButtonElement>) => {
    if (newTheme === theme) return;

    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Diverge vs Converge:
    // Diverge: light expanding outward (or amber lighting up)
    // Converge: dark curtain contracting inward or sweeping in
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
            duration: 500,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            pseudoElement: isDiverge ? "::view-transition-new(root)" : "::view-transition-old(root)"
          }
        );

        anim.onfinish = () => {
          document.documentElement.classList.remove("theme-transition-converge");
        };
      });
    } else {
      // Fallback: Animated circular ripple wave overlay
      triggerRippleWave(newTheme, x, y, isDiverge, endRadius);
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
    overlay.style.transition = "clip-path 450ms cubic-bezier(0.25, 1, 0.5, 1), opacity 150ms ease";

    if (isDiverge) {
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
        setTimeout(() => {
          setTheme(newTheme);
          applyThemeToDOM(newTheme);
          overlay.style.opacity = "0";
          setTimeout(() => {
            overlay.remove();
          }, 150);
        }, 380);
      });
    } else {
      // Converge effect
      overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        setTimeout(() => {
          overlay.remove();
        }, 450);
      });
    }
  };

  const handleCycleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : theme === "light" ? "amber" : "dark";
    switchTheme(nextTheme, event);
  };

  const getThemeLabel = () => {
    if (theme === "dark") return "Dark theme (click for Light)";
    if (theme === "light") return "Light theme (click for Amber Eye Care)";
    return "Amber Eye Care (click for Dark)";
  };

  return (
    <button
      type="button"
      onClick={handleCycleTheme}
      title={getThemeLabel()}
      aria-label={getThemeLabel()}
      className="btn btn-ghost btn-sm p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-elevated)] transition-all cursor-pointer shrink-0"
    >
      {theme === "dark" && <Moon size={15} className="text-sky-400 transition-transform hover:rotate-12" />}
      {theme === "light" && <Sun size={15} className="text-amber-500 transition-transform hover:rotate-45" />}
      {theme === "amber" && <Glasses size={15} className="text-amber-400 transition-transform hover:scale-110" />}
    </button>
  );
};
