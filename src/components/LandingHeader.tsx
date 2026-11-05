"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface LandingHeaderProps {
  isAuthenticated?: boolean;
  userEmail?: string;
}

const navLinkClass =
  "hover:text-[var(--text-pure)] transition-colors cursor-pointer whitespace-nowrap";

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  isAuthenticated = false,
  userEmail,
}) => {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const teamsActive = pathname === "/teams";
  const sectionHref = (hash: string) => (onHome ? hash : `/${hash}`);

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group min-w-0">
          <motion.img
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            src="/icon.webp"
            alt="BuildLab"
            className="w-[36px] h-[36px] rounded-lg object-contain shrink-0 shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold text-[var(--text-pure)] tracking-tight">BuildLab</span>
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] whitespace-nowrap">by I2IT</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] -mt-0.5 font-mono hidden sm:inline">Open-Source Campus Engineering</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs text-[var(--text-secondary)]">
          <a href={sectionHref("#projects")} className={navLinkClass}>Explore Projects</a>
          <a href={sectionHref("#workflow")} className={navLinkClass}>Engineering Workflow</a>
          <a href={sectionHref("#faq")} className={navLinkClass}>Guidelines & FAQ</a>
          <Link
            href="/teams"
            aria-current={teamsActive ? "page" : undefined}
            className={`${navLinkClass} ${teamsActive ? "text-[var(--text-pure)]" : ""}`}
          >
            Teams
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/teams"
            aria-current={teamsActive ? "page" : undefined}
            className={`md:hidden text-xs ${navLinkClass} ${teamsActive ? "text-[var(--text-pure)]" : "text-[var(--text-secondary)]"}`}
          >
            Teams
          </Link>

          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn btn-primary btn-sm text-xs flex items-center gap-1.5 cursor-pointer font-medium"
              title={userEmail ? `Signed in as ${userEmail}` : "Open Workspace"}
            >
              <span>Workspace</span>
              <ArrowRight size={13} />
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="btn btn-primary btn-sm text-xs flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>Join Community</span>
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
