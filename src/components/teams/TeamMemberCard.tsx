"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, GraduationCap, Briefcase, Layers, Globe, Award, Code, Check, X, ArrowUpRight, ArrowLeft } from "lucide-react";
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

function getInitials(name: string): string {
  return name
    .replace(/^Prof\.\s*(\(Dr\.\)\s*)?/, "")
    .replace(/^Dr\.\s*/, "")
    .replace(/^Ms\.\s*/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function getCredentialTeaser(member: TeamMember): string | null {
  // Only display credential teasers for academic faculty & leadership (Head and Mentors)
  if (member.role === "team") return null;

  let degree = "";
  if (member.qualifications) {
    if (member.qualifications.includes("PhD")) {
      degree = "PhD";
    } else if (member.qualifications.includes("ME") || member.qualifications.includes("M.Tech")) {
      degree = "ME";
    } else if (member.qualifications.includes("B.E.")) {
      degree = "B.E.";
    } else {
      degree = member.qualifications.split(/[,(]/)[0].trim();
    }
  }

  let exp = "";
  if (member.teachingExperience && member.teachingExperience !== "Nil" && member.teachingExperience.trim()) {
    const match = member.teachingExperience.match(/^([\d.]+)\s*years?/i);
    if (match) {
      exp = `${match[1]}y Exp`;
    }
  } else if (member.industryExperience && member.industryExperience !== "Nil" && member.industryExperience.trim()) {
    const match = member.industryExperience.match(/^([\d.]+)\s*years?/i);
    if (match) {
      exp = `${match[1]}y Industry`;
    }
  }

  if (degree && exp) return `${degree} • ${exp}`;
  if (degree) return degree;
  if (exp) return exp;
  return null;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  prominent = true,
  hasGlow: controlledHasGlow,
  isFlipped: controlledFlipped,
  onFlipChange,
}) => {
  const hasGlow = controlledHasGlow !== undefined ? controlledHasGlow : prominent;
  const credentialTeaser = getCredentialTeaser(member);
  const [imgSrc, setImgSrc] = useState(
    member.image && member.image !== "/" ? member.image : ""
  );
  const [imgError, setImgError] = useState(false);
  const showFallbackAvatar = !imgSrc || imgError;
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
        "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    mentor: {
      label: "Mentor",
      icon: GraduationCap,
      badgeStyle:
        "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    team: {
      label: "Core Team",
      icon: Code,
      badgeStyle:
        "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
  }[member.role] || {
    label: "Core Team",
    icon: Code,
    badgeStyle:
      "bg-blue-500/10 text-blue-400 border-blue-500/30",
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
        style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
      >
        {/* =========================================
            FRONT FACE (DEFAULT COMPACT / SMALL):
            Original small card size. Clean, focused identity.
            NO instructional "click here" text.
           ========================================= */}
        <article
          onClick={toggleFlip}
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className={`${
            !isFlipped ? "relative" : "absolute inset-0"
          } w-full rounded-[1.6rem] border p-5 sm:p-6 sm:px-7 transition-all duration-300 cursor-pointer select-none group [backface-visibility:hidden] flex items-center ${
            prominent
              ? "border-[var(--border-default)] hover:border-[var(--border-hover)] bg-[var(--bg-surface)]/95 shadow-xl shadow-black/10 dark:shadow-black/40 hover:shadow-2xl hover:shadow-black/15 dark:hover:shadow-black/50"
              : "border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 opacity-90 shadow-md shadow-black/5 dark:shadow-black/20 hover:border-[var(--border-default)]"
          } ${isFlipped ? "pointer-events-none" : ""}`}
        >
          <div className="flex w-full items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
              {showFallbackAvatar ? (
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-[var(--border-subtle)] bg-gradient-to-br from-slate-900 via-zinc-900 to-indigo-950 flex items-center justify-center shadow-md select-none shrink-0 transition-transform duration-300 group-hover:scale-105 ring-1 ring-white/10 dark:ring-white/15"
                  aria-hidden="true"
                >
                  <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-slate-100">
                    {getInitials(member.name)}
                  </span>
                </div>
              ) : (
                <img
                  src={imgSrc}
                  alt={member.name}
                  onError={() => setImgError(true)}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] object-cover shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105"
                />
              )}

              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-medium border ${roleInfo.badgeStyle}`}
                  >
                    <RoleIcon size={12} strokeWidth={2} className="shrink-0" />
                    <span>{roleInfo.label}</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-pure)] leading-snug">
                  {member.name}
                </h3>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                      {member.designation}
                    </p>
                    {credentialTeaser && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 font-mono text-[10.5px] font-medium text-[var(--text-secondary)] shadow-2xs">
                        <GraduationCap size={11} className="text-amber-400 shrink-0" />
                        <span>{credentialTeaser}</span>
                      </span>
                    )}
                  </div>
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

                  {/* Social Action Strip & 1-Click Email Copy on Front Face */}
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {links.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          aria-label={item.label}
                          title={item.label}
                          onClick={(e) => e.stopPropagation()}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noreferrer" : undefined}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/90 text-[var(--text-secondary)] hover:text-[var(--text-pure)] hover:border-[var(--border-hover)] hover:scale-105 transition-all shadow-2xs"
                        >
                          <IconComp />
                        </a>
                      );
                    })}

                    {/* 1-Click Email Copy with Instant Micro-Tooltip */}
                    {hasEmail && (
                      <div className="relative group/front-email">
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
                          aria-label={`Copy email for ${member.name}`}
                          title={`Copy ${member.email}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/90 text-[var(--text-secondary)] hover:text-[var(--text-pure)] hover:border-[var(--border-hover)] hover:scale-105 transition-all shadow-2xs cursor-pointer"
                        >
                          {copiedEmail ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <MailIcon />
                          )}
                        </button>

                        <div
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/front-email:flex group-focus-within/front-email:flex flex-col items-center z-30 transition-opacity duration-150"
                        >
                          <div className="whitespace-nowrap rounded-md border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 text-[10.5px] font-mono text-[var(--text-pure)] shadow-lg shadow-black/30 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-sky-400 shrink-0" strokeWidth={2} />
                            <span>{copiedEmail ? "Copied to clipboard!" : member.email}</span>
                          </div>
                          <div className="w-1.5 h-1.5 -mt-0.5 rotate-45 border-r border-b border-[var(--border-default)] bg-[var(--bg-surface-elevated)]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile trigger button / pill with 3D flip affordance */}
            <div className="relative group/flip shrink-0">
              <button
                type="button"
                onClick={toggleFlip}
                aria-label={`View profile for ${member.name}`}
                title="View profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/90 hover:bg-[var(--bg-surface-elevated)] hover:border-[var(--border-default)] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-pure)] transition-all shrink-0 shadow-2xs cursor-pointer group/btn"
              >
                <Layers size={13} className="text-sky-400 group-hover/btn:rotate-180 transition-transform duration-500 shrink-0" />
                <span className="hidden sm:inline">Profile</span>
                <ArrowUpRight size={12} className="text-[var(--text-tertiary)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform shrink-0" />
              </button>
            </div>
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
            WebkitBackfaceVisibility: "hidden",
          }}
          className={`${
            isFlipped ? "relative" : "absolute inset-0"
          } w-full rounded-[2rem] border transition-all duration-300 border-[var(--border-default)] hover:border-[var(--border-hover)] bg-[var(--bg-surface)] p-6 sm:p-8 cursor-pointer select-none [backface-visibility:hidden] flex flex-col justify-between shadow-2xl shadow-black/15 dark:shadow-black/50 ${
            !isFlipped ? "pointer-events-none" : ""
          }`}
        >
          {/* Top Row: Avatar + Name + Badge + Designation + Flip Button */}
          <div className="flex items-center justify-between gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              {showFallbackAvatar ? (
                <div
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-[var(--border-subtle)] bg-gradient-to-br from-slate-900 via-zinc-900 to-indigo-950 flex items-center justify-center shadow-md select-none shrink-0 ring-1 ring-white/10 dark:ring-white/15"
                  aria-hidden="true"
                >
                  <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-slate-100">
                    {getInitials(member.name)}
                  </span>
                </div>
              ) : (
                <img
                  src={imgSrc}
                  alt={member.name}
                  onError={() => setImgError(true)}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] object-cover shadow-sm shrink-0"
                />
              )}

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-pure)] leading-snug">
                    {member.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${roleInfo.badgeStyle}`}
                  >
                    <RoleIcon size={12} strokeWidth={2} className="shrink-0" />
                    <span>{roleInfo.label}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                  {member.designation}
                </p>
              </div>
            </div>

            {/* Top right close button to flip back to compact card */}
            <button
              type="button"
              onClick={toggleFlip}
              title="Close profile"
              aria-label="Close profile"
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-pure)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)] transition-all shrink-0 shadow-sm cursor-pointer group/close"
            >
              <X size={16} strokeWidth={2} className="transition-transform group-hover/close:rotate-90 duration-200" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-[var(--border-subtle)] my-4 sm:my-5 shrink-0" />

          {/* Structured Details: Qualification, Experience, Specialization */}
          <div className="space-y-3 sm:space-y-3.5 my-auto shrink-0">
            {/* Qualification */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <GraduationCap size={18} strokeWidth={2} className="text-[var(--text-secondary)] shrink-0" />
              <span className="w-24 sm:w-28 font-bold text-[var(--text-pure)] shrink-0">
                Qualification
              </span>
              <span className="text-[var(--border-default)] select-none">|</span>
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
              <span className="text-[var(--border-default)] select-none pt-0.5">|</span>
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
              <span className="text-[var(--border-default)] select-none pt-0.5">|</span>
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
            <div className="mt-4 sm:mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/50 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3.5 shrink-0">
              <span className="text-sky-400 font-serif font-black text-2xl leading-none select-none shrink-0">
                &ldquo;&ldquo;
              </span>
              <p className="text-xs sm:text-sm italic text-[var(--text-secondary)] leading-relaxed">
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

            {/* Back to card button */}
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-tertiary)] hover:text-[var(--text-pure)] transition-colors cursor-pointer group/back"
            >
              <ArrowLeft size={13} strokeWidth={2} className="transition-transform group-hover/back:-translate-x-1 duration-200" />
              <span>Back to card</span>
            </button>
          </div>
        </article>
      </motion.div>
    </motion.div>
  );
};
