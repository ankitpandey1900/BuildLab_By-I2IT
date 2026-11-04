"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
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

interface TeamMemberCardProps {
  member: TeamMember;
  prominent?: boolean;
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
}) => {
  const [imgSrc, setImgSrc] = useState(member.image);

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
    {
      href: member.email ? `mailto:${member.email}` : "mailto:team@buildlab.i2it.edu",
      label: `Email ${member.name}`,
      icon: MailIcon,
      external: false,
    },
  ];

  return (
    <article
      className={`relative h-full overflow-hidden rounded-[1.6rem] border p-6 sm:p-7 sm:px-8 transition-all duration-300 ${
        prominent
          ? "border-[var(--border-default)] bg-[var(--bg-surface)]/95 shadow-2xl shadow-black/30"
          : "border-[var(--border-subtle)] bg-[var(--bg-surface)]/75 opacity-90 shadow-md"
      }`}
    >
      <div className="flex h-full flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
        {/* Glowing Circular Avatar */}
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-transparent blur-sm pointer-events-none" />
          <img
            src={imgSrc}
            alt={member.name}
            onError={() => {
              setImgSrc(
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name
                )}&background=18181b&color=f97316&bold=true`
              );
            }}
            className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-orange-500/50 object-cover ring-2 ring-orange-500/20 shadow-[0_0_24px_rgba(245,158,11,0.2)]"
          />
        </div>

        {/* Member Details */}
        <div className="flex min-w-0 flex-1 flex-col justify-center space-y-2 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-[var(--text-pure)] sm:text-2xl">
              {member.name}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[var(--text-secondary)] sm:justify-start">
              <span className="font-semibold text-[var(--text-pure)]">{member.designation}</span>
              <span className="text-[var(--text-tertiary)] select-none">•</span>
              <span>{member.specialization}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] max-w-xl">
            {member.description}
          </p>
        </div>

        {/* Social Action Links - Right-aligned */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0 sm:self-center shrink-0">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] transition-all duration-200 hover:scale-105 hover:border-[var(--border-hover)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-hover)] shadow-sm"
              >
                <Icon />
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
};
