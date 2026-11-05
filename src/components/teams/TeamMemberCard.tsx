"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, RotateCw, GraduationCap, Briefcase, Layers, Globe } from "lucide-react";
import { motion } from "framer-motion";
import type { TeamMember } from "@/data/teamsData";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.05c.53-1 1.84-2.1 3.79-2.1 4.06 0 4.81 2.67 4.81 6.15V24h-4v-7.7c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.06V24h-4V8.5z" />
    </svg>
  );
}

function MailIcon() {
  return <Mail className="h-4 w-4" aria-hidden="true" />;
}

function GlobeIcon() {
  return <Globe className="h-4 w-4" aria-hidden="true" />;
}

interface TeamMemberCardProps {
  member: TeamMember;
  prominent?: boolean;
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
}

interface SocialLink {
  href: string;
  label: string;
  icon: React.FC;
  external: boolean;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  prominent = true,
  isFlipped: controlledFlipped,
  onFlipChange,
}) => {
  const [imgSrc, setImgSrc] = useState(member.image);
  const [internalFlipped, setInternalFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const backArticleRef = useRef<HTMLElement>(null);

  const isControlled = controlledFlipped !== undefined;
  const isFlipped = isControlled ? controlledFlipped : internalFlipped;

  // If this card is no longer the main focus of the screen, automatically flip back to normal
  useEffect(() => {
    if (!prominent) {
      setInternalFlipped(false);
      onFlipChange?.(false);
    }
  }, [prominent, onFlipChange]);

  // When card is clicked and flipped open, smoothly scroll page up or down so the card is centered vertically on screen
  useEffect(() => {
    if (!isFlipped) return;

    const timeoutId = setTimeout(() => {
      const cardEl = cardRef.current;
      if (!cardEl) return;

      const currentScrollY = window.scrollY || window.pageYOffset;
      const rect = cardEl.getBoundingClientRect();
      const cardTopInPage = currentScrollY + rect.top;

      // When flipped, the back face article uses relative positioning and provides the true layout height
      const cardHeight = backArticleRef.current?.offsetHeight || rect.height;
      const viewportHeight = window.innerHeight;

      // Calculate the target top offset so the card is centered vertically in viewport
      const idealTopInViewport =
        cardHeight + 32 > viewportHeight
          ? 16
          : (viewportHeight - cardHeight) / 2;

      const targetScrollY = cardTopInPage - idealTopInViewport;
      const finalScrollY = Math.max(0, targetScrollY);

      if (Math.abs(currentScrollY - finalScrollY) > 4) {
        const prefersReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        window.scrollTo({
          top: finalScrollY,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isFlipped]);

  const toggleFlip = (e?: React.MouseEvent) => {
    // Only allow flipping if the card is the main focus of screen
    if (!prominent) return;

    if (e) {
      e.stopPropagation();
    }

    const nextFlipped = !isFlipped;
    if (!isControlled) {
      setInternalFlipped(nextFlipped);
    }
    onFlipChange?.(nextFlipped);
  };

  const links: SocialLink[] = [
    {
      href: member.github || "https://github.com",
      label: `${member.name} on GitHub`,
      icon: GitHubIcon,
      external: true,
    },
    {
      href: member.linkedin || "https://linkedin.com",
      label: `${member.name} on LinkedIn`,
      icon: LinkedInIcon,
      external: true,
    },
  ];

  if (member.portfolio) {
    const portfolioUrl =
      member.portfolio.startsWith("http://") ||
      member.portfolio.startsWith("https://")
        ? member.portfolio
        : `https://${member.portfolio}`;

    links.push({
      href: portfolioUrl,
      label: `${member.name}'s Portfolio`,
      icon: GlobeIcon,
      external: true,
    });
  }

  links.push({
    href: member.email ? `mailto:${member.email}` : "mailto:team@buildlab.i2it.edu",
    label: `Email ${member.name}`,
    icon: MailIcon,
    external: false,
  });

  const roleLabel =
    member.role === "head" ? "HEAD" : member.role === "mentor" ? "MENTOR" : "TEAM";

  const badgeStyle =
    member.role === "team"
      ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
      : member.role === "mentor"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : "bg-purple-500/15 text-purple-400 border-purple-500/30";

  // Format experience string
  const experienceParts = [
    member.teachingExperience && member.teachingExperience !== "Nil"
      ? `Teaching: ${member.teachingExperience}`
      : null,
    member.industryExperience && member.industryExperience !== "Nil"
      ? `Industry: ${member.industryExperience}`
      : null,
  ].filter(Boolean);

  const experienceText =
    experienceParts.length > 0
      ? experienceParts.join(" • ")
      : member.teachingExperience || "N/A";

  return (
    <motion.div
      ref={cardRef}
      layout
      className="relative w-full [perspective:1400px]"
      transition={{ layout: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } }}
    >
      <motion.div
        layout
        className="relative w-full [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          rotateY: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
          layout: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* =========================================
            FRONT FACE (DEFAULT COMPACT / SMALL):
            Original small card size. Clean, focused identity.
            NO instructional "click here" text.
           ========================================= */}
        <article
          onClick={toggleFlip}
          style={{ backfaceVisibility: "hidden" }}
          className={`${
            !isFlipped ? "relative" : "absolute inset-0"
          } w-full rounded-[1.6rem] border p-5 sm:p-6 sm:px-7 transition-colors duration-300 cursor-pointer select-none group [backface-visibility:hidden] flex items-center ${
            prominent
              ? "border-[var(--border-default)] bg-[var(--bg-surface)]/95 shadow-xl shadow-black/25 hover:border-[var(--border-hover)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 opacity-90 shadow-md hover:border-[var(--border-default)]"
          } ${isFlipped ? "pointer-events-none" : ""}`}
        >
          <div className="flex w-full items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <img
                src={imgSrc}
                alt={member.name}
                onError={() => {
                  setImgSrc(
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=18181b&color=ededed&bold=true`
                  );
                }}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-white/10 dark:border-white/10 bg-[var(--bg-surface-elevated)] object-cover shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105"
              />

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider border ${badgeStyle}`}
                  >
                    {roleLabel}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-pure)] truncate">
                  {member.name}
                </h3>

                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] truncate">
                    {member.designation}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] line-clamp-1 max-w-md">
                    {member.specialization}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle reload/flip icon button */}
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] group-hover:text-[var(--text-pure)] group-hover:border-[var(--border-hover)] transition-all shrink-0 shadow-sm"
            >
              <RotateCw size={14} className="transition-transform duration-300 group-hover:rotate-45" />
            </button>
          </div>
        </article>

        {/* =========================================
            BACK FACE (EXPANDED BIG / SPACIOUS):
            Shown when clicked, matching the user reference design!
           ========================================= */}
        <article
          ref={backArticleRef}
          onClick={toggleFlip}
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
          className={`${
            isFlipped ? "relative" : "absolute inset-0"
          } w-full rounded-[2rem] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl shadow-black/30 cursor-pointer select-none [backface-visibility:hidden] flex flex-col justify-between ${
            !isFlipped ? "pointer-events-none" : ""
          }`}
        >
          {/* Top Row: Avatar + Name + Badge + Designation + Flip Button */}
          <div className="flex items-center justify-between gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <img
                src={imgSrc}
                alt={member.name}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-white/10 dark:border-white/10 bg-[var(--bg-surface-elevated)] object-cover shadow-sm shrink-0"
              />

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-pure)] truncate">
                    {member.name}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider border ${badgeStyle}`}
                  >
                    {roleLabel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] truncate">
                  {member.designation}
                </p>
              </div>
            </div>

            {/* Top right rotate button */}
            <button
              type="button"
              onClick={toggleFlip}
              title="Flip back"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-pure)] hover:border-[var(--border-hover)] transition-all shrink-0 shadow-sm"
            >
              <RotateCw size={15} />
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-white/10 dark:border-white/10 my-4 sm:my-5 shrink-0" />

          {/* Structured Details: Qualification, Experience, Specialization */}
          <div className="space-y-3 sm:space-y-3.5 my-auto shrink-0">
            {/* Qualification */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <GraduationCap size={18} className="text-[var(--text-secondary)] shrink-0" />
              <span className="w-24 sm:w-28 font-bold text-[var(--text-pure)] shrink-0">
                Qualification
              </span>
              <span className="text-white/20 dark:text-white/20 select-none">|</span>
              <span className="text-[var(--text-secondary)] truncate">
                {member.qualifications || "N/A"}
              </span>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Briefcase size={18} className="text-[var(--text-secondary)] shrink-0" />
              <span className="w-24 sm:w-28 font-bold text-[var(--text-pure)] shrink-0">
                Experience
              </span>
              <span className="text-white/20 dark:text-white/20 select-none">|</span>
              <span className="text-[var(--text-secondary)] truncate">
                {experienceText}
              </span>
            </div>

            {/* Specialization */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Layers size={18} className="text-[var(--text-secondary)] shrink-0" />
              <span className="w-24 sm:w-28 font-bold text-[var(--text-pure)] shrink-0">
                Specialization
              </span>
              <span className="text-white/20 dark:text-white/20 select-none">|</span>
              <span className="text-[var(--text-secondary)] truncate">
                {member.specialization}
              </span>
            </div>
          </div>

          {/* Quote Description Box */}
          {member.description && (
            <div className="mt-4 sm:mt-5 rounded-xl border border-white/10 bg-[var(--bg-surface-elevated)]/50 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3.5 shrink-0">
              <span className="text-sky-400 font-serif font-black text-2xl leading-none select-none shrink-0">
                &ldquo;&ldquo;
              </span>
              <p className="text-xs sm:text-sm italic text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                &ldquo;{member.description}&rdquo;
              </p>
            </div>
          )}

          {/* Bottom Row: Socials on left, Flip back on right */}
          <div className="mt-5 sm:mt-6 flex items-center justify-between gap-4 pt-1 shrink-0">
            {/* Social action icons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    title={item.label}
                    onClick={(e) => e.stopPropagation()}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] transition-all hover:scale-105 hover:border-[var(--border-hover)] hover:text-[var(--text-pure)] shadow-sm"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>

            {/* Flip back label */}
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-tertiary)] hover:text-[var(--text-pure)] transition-colors cursor-pointer"
            >
              <RotateCw size={13} />
              <span>Flip back</span>
            </button>
          </div>
        </article>
      </motion.div>
    </motion.div>
  );
};
