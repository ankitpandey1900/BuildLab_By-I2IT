"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { motion } from "framer-motion";
import { getTeamHead, getTeamMentors, getTeamList } from "@/data/teamsData";
import { Spotlight } from "@/components/ui/spotlight";
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

  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-blue-500/25 selection:text-[var(--accent-primary)] overflow-x-hidden">
      {/* Background same as landing page: Spotlights, Dot Grid, Glow, and Code Stream */}
      <Spotlight className="-top-40 left-0 md:left-32 md:-top-20" fill="white" side="left" />
      <Spotlight className="-top-40 right-0 md:right-32 md:-top-20" fill="white" side="right" />

      {/* Ambient Dot Grid with Radial Vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-dot-[var(--dot-color)] opacity-40 -z-10"
        style={{
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)",
        }}
      />

      {/* Subtle Radial Ambient Neutral Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 opacity-20 blur-3xl -z-10 bg-gradient-to-b from-white/10 to-transparent" />

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
        <section className="relative mx-auto max-w-6xl px-4 pb-4 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
            {/* Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/90 px-4 py-2 font-mono text-[11px] text-[var(--text-secondary)] shadow-sm backdrop-blur-sm">
              <Users size={14} className="text-amber-500" aria-hidden="true" />
              <span className="font-semibold text-[var(--text-pure)]">Our Team</span>
              <span aria-hidden="true" className="text-[var(--text-tertiary)]">•</span>
              <span>Builders</span>
              <span aria-hidden="true" className="text-[var(--text-tertiary)]">•</span>
              <span>Mentors</span>
              <span aria-hidden="true" className="text-[var(--text-tertiary)]">•</span>
              <span className="text-emerald-400 font-medium">Contributors</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-pure)] sm:text-5xl lg:text-6xl">
              Meet the Team Behind BuildLab
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
              A community of faculty mentors, student leads, and open-source contributors making campus engineering better for everyone.
            </p>
          </div>
        </section>

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
          {head ? (
            <HeadProfile member={head} />
          ) : (
            <p className="text-center text-sm text-[var(--text-secondary)]">
              The team head profile will appear here.
            </p>
          )}
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
          <MentorCarousel members={mentors} id="mentors" />
        </section>

        {/* Team Section */}
        <section
          className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-4 sm:px-6 sm:pb-28"
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
          <MentorCarousel members={team} id="team" />
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
