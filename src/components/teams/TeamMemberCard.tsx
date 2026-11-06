"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, RotateCw, GraduationCap, Briefcase, Layers, Globe, Award, Code, Check } from "lucide-react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import type { TeamMember } from "@/data/teamsData";
import { TechIcon } from "./TechIcon";

function GitHubIcon() {
  return <Icon icon="simple-icons:github" className="h-4 w-4" strokeWidth={2} style={{ strokeWidth: 2 }} aria-hidden="true" />;
}

function LinkedInIcon() {
  return <Icon icon="simple-icons:linkedin" className="h-4 w-4" strokeWidth={2} style={{ strokeWidth: 2 }} aria-hidden="true" />;
}

function MailIcon() {
  return <Mail className="h-4 w-4" strokeWidth={2} aria-hidden="true" />;
}

function GlobeIcon() {
  return <Globe className="h-4 w-4" strokeWidth={2} aria-hidden="true" />;
}

interface TeamMemberCardProps {
  member: TeamMember;
  prominent?: boolean;
  hasGlow?: boolean;
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
  hasGlow: controlledHasGlow,
  isFlipped: controlledFlipped,
  onFlipChange,
}) => {
  const hasGlow = controlledHasGlow !== undefined ? controlledHasGlow : prominent;
  const [imgSrc, setImgSrc] = useState(member.image);
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const backArticleRef = useRef<HTMLElement>(null);

  const hasEmail = Boolean(member.email && member.email.trim().length > 0);

  const specializationSkills = Array.isArray(member.specialization)
    ? member.specialization
    : typeof member.specialization === "string"
    ? (member.specialization as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

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

  const roleInfo = {
    head: {
      label: "Head",
      icon: Award,
      badgeStyle:
        "bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/20",
    },
    mentor: {
      label: "Mentor",
      icon: GraduationCap,
      badgeStyle:
        "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/20",
    },
    team: {
      label: "Team",
      icon: Code,
      badgeStyle:
        "bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/20",
    },
  }[member.role] || {
    label: "Team",
    icon: Code,
    badgeStyle:
      "bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/20",
  };

  const RoleIcon = roleInfo.icon;

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
          } w-full rounded-[1.6rem] border p-5 sm:p-6 sm:px-7 transition-all duration-300 cursor-pointer select-none group [backface-visibility:hidden] flex items-center ${
            prominent
              ? hasGlow
                ? "border-white/35 bg-[var(--bg-surface)]/95 shadow-[0_0_25px_rgba(255,255,255,0.22),0_0_60px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.4)] hover:border-white/50 hover:shadow-[0_0_35px_rgba(255,255,255,0.3),0_0_75px_rgba(255,255,255,0.15),0_16px_40px_rgba(0,0,0,0.5)]"
                : "border-[var(--border-default)] bg-[var(--bg-surface)]/95 shadow-xl shadow-black/25 hover:border-[var(--border-hover)]"
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-medium border ${roleInfo.badgeStyle}`}
                  >
                    <RoleIcon size={12} strokeWidth={2} className="shrink-0" />
                    <span>{roleInfo.label}</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-pure)] truncate">
                  {member.name}
                </h3>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] truncate">
                    {member.designation}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {specializationSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/70 px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]"
                      >
                        <TechIcon name={skill} className="w-3 h-3" strokeWidth={2} />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle reload/flip icon button */}
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] group-hover:text-[var(--text-pure)] group-hover:border-[var(--border-hover)] transition-all shrink-0 shadow-sm"
            >
              <RotateCw size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:rotate-45" />
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
          } w-full rounded-[2rem] border transition-all duration-300 ${
            hasGlow
              ? "border-white/35 shadow-[0_0_30px_rgba(255,255,255,0.22),0_0_70px_rgba(255,255,255,0.1),0_20px_48px_rgba(0,0,0,0.5)]"
              : "border-[var(--border-default)] shadow-2xl shadow-black/30"
          } bg-[var(--bg-surface)] p-6 sm:p-8 cursor-pointer select-none [backface-visibility:hidden] flex flex-col justify-between ${
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${roleInfo.badgeStyle}`}
                  >
                    <RoleIcon size={12} strokeWidth={2} className="shrink-0" />
                    <span>{roleInfo.label}</span>
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
              <RotateCw size={15} strokeWidth={2} />
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-white/10 dark:border-white/10 my-4 sm:my-5 shrink-0" />

          {/* Structured Details: Qualification, Experience, Specialization */}
          <div className="space-y-3 sm:space-y-3.5 my-auto shrink-0">
            {/* Qualification */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <GraduationCap size={18} strokeWidth={2} className="text-[var(--text-secondary)] shrink-0" />
              <span className="w-24 sm:w-28 font-bold text-[var(--text-pure)] shrink-0">
                Qualification
              </span>
              <span className="text-white/20 dark:text-white/20 select-none">|</span>
              <span className="text-[var(--text-secondary)] truncate">
                {member.qualifications || "N/A"}
              </span>
            </div>

            {/* Experience */}
            <div className="flex items-start gap-3 text-xs sm:text-sm">
              <Briefcase size={18} strokeWidth={2} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
              <span className="w-24 sm:w-28 font-bold text-[var(--text-pure)] shrink-0 pt-0.5">
                Experience
              </span>
              <span className="text-white/20 dark:text-white/20 select-none pt-0.5">|</span>
              <div className="text-[var(--text-secondary)] min-w-0 space-y-1 leading-snug">
                {experienceParts.length > 0 ? (
                  experienceParts.map((part, idx) => (
                    <div key={idx} className="break-words">
                      {part}
                    </div>
                  ))
                ) : (
                  <div>{member.teachingExperience || "N/A"}</div>
                )}
              </div>
            </div>

            {/* Specialization */}
            <div className="flex items-start gap-3 text-xs sm:text-sm">
              <Layers size={18} strokeWidth={2} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
              <span className="w-24 sm:w-28 font-bold text-[var(--text-pure)] shrink-0 pt-0.5">
                Specialization
              </span>
              <span className="text-white/20 dark:text-white/20 select-none pt-0.5">|</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5 min-w-0">
                {specializationSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-pure)] hover:border-[var(--border-hover)] transition-all shadow-2xs"
                  >
                    <TechIcon name={skill} className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
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

              {/* Email Button with Hover Tooltip (No redirection to Gmail or mail client) */}
              {hasEmail && (
                <div className="relative group/email">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (member.email) {
                        navigator.clipboard?.writeText(member.email);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }
                    }}
                    aria-label={`Email: ${member.email}`}
                    title={member.email}
                    className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] transition-all hover:scale-105 hover:border-[var(--border-hover)] hover:text-[var(--text-pure)] shadow-sm cursor-pointer"
                  >
                    {copiedEmail ? (
                      <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <MailIcon />
                    )}
                  </button>

                  {/* Tooltip on hover displaying member's email */}
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/email:flex group-focus-within/email:flex flex-col items-center z-30 transition-opacity duration-150"
                  >
                    <div className="whitespace-nowrap rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--text-pure)] shadow-xl shadow-black/40 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" strokeWidth={2} />
                      <span>{copiedEmail ? "Copied to clipboard!" : member.email}</span>
                    </div>
                    <div className="w-2 h-2 -mt-1 rotate-45 border-r border-b border-[var(--border-default)] bg-[var(--bg-surface-elevated)]" />
                  </div>
                </div>
              )}
            </div>

            {/* Flip back label */}
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-tertiary)] hover:text-[var(--text-pure)] transition-colors cursor-pointer"
            >
              <RotateCw size={13} strokeWidth={2} />
              <span>Flip back</span>
            </button>
          </div>
        </article>
      </motion.div>
    </motion.div>
  );
};
