"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Users, Award, GraduationCap, Code } from "lucide-react";
import { motion } from "framer-motion";
import { getTeamHead, getTeamMentors, getTeamList } from "@/data/teamsData";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeadProfile } from "./HeadProfile";
import { MentorCarousel } from "./MentorCarousel";

interface TeamsPageProps {
  isAuthenticated?: boolean;
  userEmail?: string;
}

const ambientCodeSnippets = [
  'import { ESP32, MQTTClient } from "@i2it/embedded-nodes";',
  'const telemetry = new ESP32({ baudRate: 115200 });',
  'await telemetry.connectWiFi("I2IT-Campus-5G");',
  'export async function syncCommitDiff(sha: string) {',
  '  const commit = await github.getCommit({ sha });',
  '  const isValid = crypto.verify(commit.signature);',
  '  if (!isValid) throw new Error("Invalid signature");',
  '  return db.verifiedContribution.create({ data });',
  '}',
  '// Campus Shuttle GPS Loop Frequency: 50Hz',
  'mqtt.on("message", (topic, packet) => {',
  '  const gps = parseNMEAPacket(packet);',
  '  broadcastLocation({ lat: gps.lat, lng: gps.lng });',
  '});',
  'const [maintainers, openTasks] = await Promise.all([',
  '  prisma.projectMember.findMany({ where: { role: "maintainer" } }),',
  '  prisma.projectTask.findMany({ where: { status: "open" } })',
  ']);',
  'git checkout -b feat/cellular-fallback-sim800l',
  'git commit -S -m "feat(telemetry): signed pgp receipt"',
  'git push origin feat/cellular-fallback-sim800l',
];

export const TeamsPage: React.FC<TeamsPageProps> = () => {
  const head = getTeamHead();
  const mentors = getTeamMentors();
  const team = getTeamList();

  const totalCount = (head ? 1 : 0) + mentors.length + team.length;
  const headCount = head ? 1 : 0;

  const [activeSection, setActiveSection] = useState<"all" | "head" | "mentors" | "team">("all");
  const headRef = useRef<HTMLDivElement>(null);
  const mentorsRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  const handleJump = (target: "all" | "head" | "mentors" | "team") => {
    setActiveSection(target);
    if (target === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const refMap: Record<"head" | "mentors" | "team", HTMLDivElement | null> = {
      head: headRef.current,
      mentors: mentorsRef.current,
      team: teamRef.current,
    };

    const el = refMap[target];
    if (!el) return;

    const yOffset = -90;
    const y = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) + yOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  useEffect(() => {
    let ticking = false;

    const updateActiveSection = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY < 200) {
        setActiveSection("all");
        ticking = false;
        return;
      }

      const viewportCenter = window.innerHeight / 2;

      const sections: { id: "head" | "mentors" | "team"; el: HTMLElement | null }[] = [
        { id: "head", el: headRef.current },
        { id: "mentors", el: mentorsRef.current },
        { id: "team", el: teamRef.current },
      ];

      let closestSection: "head" | "mentors" | "team" = "head";
      let minDistance = Infinity;

      for (const section of sections) {
        if (!section.el) continue;
        const rect = section.el.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestSection = section.id;
        }
      }

      setActiveSection(closestSection);
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-blue-500/25 selection:text-[var(--accent-primary)] overflow-x-hidden">
      {/* Ambient Dot Grid with Radial Vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-dot-[var(--dot-color)] opacity-40 -z-10"
        style={{
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)",
        }}
      />

      {/* Subtle Gradient Mesh Glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-cyan-500/5 rounded-full blur-3xl -z-10" />

      {/* Developer Coding Ambient Stream in Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden opacity-[0.035] dark:opacity-[0.08] flex justify-around text-xs font-mono -z-10"
        style={{
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, transparent 80%)",
        }}
      >
        <motion.div
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="space-y-2 py-4"
        >
          {ambientCodeSnippets.slice(0, 10).map((line, idx) => (
            <div key={idx} className="whitespace-nowrap">
              <span className="mr-3 text-[var(--text-tertiary)] select-none">
                {(idx + 1).toString().padStart(2, "0")}
              </span>
              <span
                className={
                  idx % 3 === 0
                    ? "text-sky-400"
                    : idx % 2 === 0
                    ? "text-emerald-400"
                    : "text-[var(--text-primary)]"
                }
              >
                {line}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div
          animate={{ y: [-30, 10, -30] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="space-y-2 py-4 hidden md:block"
        >
          {ambientCodeSnippets.slice(5, 17).map((line, idx) => (
            <div key={idx} className="whitespace-nowrap">
              <span className="mr-3 text-[var(--text-tertiary)] select-none">
                {(idx + 6).toString().padStart(2, "0")}
              </span>
              <span
                className={
                  idx % 3 === 0
                    ? "text-indigo-400"
                    : idx % 2 === 0
                    ? "text-cyan-400"
                    : "text-[var(--text-primary)]"
                }
              >
                {line}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="space-y-2 py-4 hidden lg:block"
        >
          {ambientCodeSnippets.slice(10, 22).map((line, idx) => (
            <div key={idx} className="whitespace-nowrap">
              <span className="mr-3 text-[var(--text-tertiary)] select-none">
                {(idx + 11).toString().padStart(2, "0")}
              </span>
              <span
                className={idx % 2 === 0 ? "text-emerald-400" : "text-sky-400"}
              >
                {line}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Top action row: minimal back navigation + theme toggle (Navbar completely removed) */}
      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-3.5 py-1.5 font-mono text-xs text-[var(--text-secondary)] shadow-sm backdrop-blur-md transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)]"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Back to BuildLab</span>
        </Link>
        <ThemeToggle />
      </div>

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-6 sm:px-6 sm:pt-10">
          {/* Subtle Ambient Radial Glow directly behind Hero */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] sm:w-[760px] h-[340px] bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl -z-10 opacity-70 dark:opacity-90"
          />

          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            {/* Pill Badge with Active Ping Affordance */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-elevated)]/90 px-4 py-1.5 text-xs font-mono shadow-sm backdrop-blur-md select-none transition-all hover:border-[var(--border-hover)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-[var(--text-pure)]">BuildLab</span>
              <span className="text-[var(--text-tertiary)] select-none">•</span>
              <span className="text-[var(--text-secondary)]">Team &amp; Mentors</span>
            </motion.div>

            {/* Main Headline - Balanced typography with clean line rhythm */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-pure)] leading-[1.16] max-w-2xl mx-auto"
            >
              Meet the team
              <span className="block mt-1 sm:mt-2">
                behind{" "}
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 dark:from-sky-400 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  BuildLab
                </span>
              </span>
            </motion.h1>

            {/* Subtitle - Simple, authentic, zero jargon */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]"
            >
              Students and teachers working together to build open-source projects for our campus.
            </motion.p>
          </div>
        </section>

        {/* Sticky Section Anchor Navigation Pills */}
        <div className="sticky top-4 z-30 mx-auto w-full max-w-fit px-4 mb-8">
          <nav
            aria-label="Team section navigation"
            className="flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/90 p-1.5 font-mono text-xs shadow-lg shadow-black/10 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => handleJump("all")}
              aria-label="View all team members"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "all"
                  ? "text-[var(--text-pure)] font-bold"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Users size={12} className="text-emerald-400 shrink-0" />
              <span>All</span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-normal">({totalCount})</span>
              {activeSection === "all" && (
                <motion.span
                  layoutId="active-team-pill"
                  className="absolute inset-0 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleJump("head")}
              aria-label="Jump to Leadership section"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "head"
                  ? "text-[var(--text-pure)] font-bold"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Award size={12} className="text-purple-400 shrink-0" />
              <span>Leadership</span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-normal">({headCount})</span>
              {activeSection === "head" && (
                <motion.span
                  layoutId="active-team-pill"
                  className="absolute inset-0 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleJump("mentors")}
              aria-label="Jump to Mentors section"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "mentors"
                  ? "text-[var(--text-pure)] font-bold"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <GraduationCap size={12} className="text-amber-400 shrink-0" />
              <span>Mentors</span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-normal">({mentors.length})</span>
              {activeSection === "mentors" && (
                <motion.span
                  layoutId="active-team-pill"
                  className="absolute inset-0 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleJump("team")}
              aria-label="Jump to Core Team section"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "team"
                  ? "text-[var(--text-pure)] font-bold"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Code size={12} className="text-blue-400 shrink-0" />
              <span>Core Team</span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-normal">({team.length})</span>
              {activeSection === "team" && (
                <motion.span
                  layoutId="active-team-pill"
                  className="absolute inset-0 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </nav>
        </div>

        {/* Head Section */}
        <section
          className="relative mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6"
          aria-labelledby="head-heading"
        >
          <div className="mx-auto max-w-4xl mb-4">
            <h2
              id="head-heading"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--text-pure)] sm:text-xl font-mono"
            >
              <span className="text-[var(--text-tertiary)] select-none text-xl font-light">—</span>
              <span>Head</span>
            </h2>
          </div>
          <div ref={headRef}>
            {head ? (
              <HeadProfile member={head} hasGlow={activeSection === "head" || activeSection === "all"} />
            ) : (
              <p className="text-center text-sm text-[var(--text-secondary)]">
                The team head profile will appear here.
              </p>
            )}
          </div>
        </section>

        {/* Mentors Section */}
        <section
          className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16"
          aria-labelledby="mentors-heading"
        >
          <div className="mx-auto max-w-4xl mb-4">
            <h2
              id="mentors-heading"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--text-pure)] sm:text-xl font-mono"
            >
              <span className="text-[var(--text-tertiary)] select-none text-xl font-light">—</span>
              <span>Mentors</span>
            </h2>
          </div>
          <div ref={mentorsRef}>
            <MentorCarousel
              members={mentors}
              id="mentors"
              hasGlow={activeSection === "mentors"}
            />
          </div>
        </section>

        {/* Team Section */}
        <section
          className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pb-36"
          aria-labelledby="team-heading"
        >
          <div className="mx-auto max-w-4xl mb-4">
            <h2
              id="team-heading"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--text-pure)] sm:text-xl font-mono"
            >
              <span className="text-[var(--text-tertiary)] select-none text-xl font-light">—</span>
              <span>Team</span>
            </h2>
          </div>
          <div ref={teamRef}>
            <MentorCarousel
              members={team}
              id="team"
              hasGlow={activeSection === "team"}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-8 text-xs text-[var(--text-tertiary)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center justify-center gap-2.5 font-mono text-[11px] sm:justify-start">
            <img
              src="/icon.webp"
              alt="BuildLab"
              className="h-5 w-5 shrink-0 rounded-sm object-contain"
            />
            <span className="leading-relaxed">
              BuildLab by I2IT • Hope Foundation&apos;s International Institute of Information Technology, Pune
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11.5px] sm:gap-6">
            <Link href="/sign-in" className="transition-colors hover:text-[var(--text-primary)]">
              Sign in
            </Link>
            <Link href="/sign-up" className="transition-colors hover:text-[var(--text-primary)]">
              Register
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-[var(--text-primary)]">
              Workspace
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-[var(--text-primary)]"
            >
              <span>GitHub</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
