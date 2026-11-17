"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { authClient } from "../lib/auth-client";

export type DemoRole = "student" | "mentor" | "admin";

const demoRoleLabels: Record<DemoRole, string> = {
  student: "Student",
  mentor: "Mentor",
  admin: "Admin",
};

const demoRoles: DemoRole[] = ["student", "mentor", "admin"];

const demoRoleIcons = {
  student: GraduationCap,
  mentor: UsersRound,
  admin: ShieldCheck,
} satisfies Record<DemoRole, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>>;

export const SignInForm: React.FC = () => {
  const [signingInRole, setSigningInRole] = useState<DemoRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Sign-in failed. Check your email and password.");
        return;
      }

      window.location.assign("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not reach the sign-in service."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInAsDemo = async (role: DemoRole) => {
    setSigningInRole(role);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(result.error || "Demo sign-in is unavailable.");
        return;
      }

      window.location.assign("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not reach the sign-in service."
      );
    } finally {
      setSigningInRole(null);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-canvas)] p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(88,135,97,0.13),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <section className="relative w-full max-w-[440px] space-y-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="flex items-center gap-3.5">
          <img
            src="/icon.webp"
            alt="BuildLab"
            className="h-12 w-12 shrink-0 rounded-xl object-contain shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[var(--text-pure)]">
                BuildLab
              </span>
              <span className="whitespace-nowrap rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--text-tertiary)]">
                by I2IT
              </span>
            </div>
          </div>
        </div>

        <fieldset className="space-y-2.5">
          <legend className="mb-1 text-sm font-medium text-[var(--text-pure)]">Sign in as</legend>
          <div className="grid grid-cols-3 gap-2">
            {demoRoles.map((role) => {
              const Icon = demoRoleIcons[role];
              return (
                <button
                  key={role}
                  type="button"
                  disabled={signingInRole !== null || isSubmitting}
                  onClick={() => signInAsDemo(role)}
                  aria-label={signingInRole === role ? `Signing in as ${demoRoleLabels[role]}` : `Sign in as ${demoRoleLabels[role]}`}
                  className="flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-emerald-500/35 hover:bg-emerald-500/10 hover:text-emerald-200 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  {signingInRole === role ? (
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon size={16} aria-hidden="true" />
                  )}
                  {signingInRole === role ? "Signing in…" : demoRoleLabels[role]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {errorMessage && (
          <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-3 py-2.5 text-sm text-rose-200">
            {errorMessage}
          </p>
        )}

        <details className="group border-t border-[var(--border-subtle)] pt-4">
          <summary className="cursor-pointer list-none text-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 [&::-webkit-details-marker]:hidden">
            Use email and password
          </summary>
          <form className="mt-4 space-y-4" onSubmit={handleSignIn}>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--text-pure)]">Email</span>
              <span className="relative block">
                <Mail
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="min-h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] pl-10 pr-3 text-sm text-[var(--text-pure)] placeholder:text-[var(--text-tertiary)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[var(--text-pure)]">Password</span>
              <span className="relative block">
                <LockKeyhole
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="min-h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] py-2 pl-10 pr-12 text-sm text-[var(--text-pure)] placeholder:text-[var(--text-tertiary)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || signingInRole !== null}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--text-pure)] px-5 text-sm font-semibold text-[var(--text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Enter workspace"
              )}
            </button>
          </form>
        </details>

        <p className="border-t border-[var(--border-subtle)] pt-4 text-center text-sm text-[var(--text-secondary)]">
          New to BuildLab?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-emerald-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            Create a student account
          </Link>
        </p>
      </section>
    </main>
  );
};
