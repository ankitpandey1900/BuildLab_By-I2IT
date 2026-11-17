"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { authClient } from "../lib/auth-client";

export const SignUpForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Could not create your account.");
        return;
      }

      window.location.assign("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not reach the account service."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-canvas)] p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(88,135,97,0.13),transparent_60%)]"
      />
      <section className="relative w-full max-w-[440px] space-y-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="flex items-center gap-3">
          <img
            src="/icon.webp"
            alt="BuildLab"
            className="h-11 w-11 rounded-xl object-contain"
          />
          <div>
            <p className="font-semibold text-[var(--text-pure)]">BuildLab by I2IT</p>
            <p className="text-xs text-[var(--text-tertiary)]">Create your account</p>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-pure)] sm:text-2xl">
            Join the community
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            New accounts start with student access. Campus mentors and administrators receive their roles from an authorized platform admin.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSignUp}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--text-pure)]">Full name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              minLength={2}
              maxLength={70}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-sm text-[var(--text-pure)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--text-pure)]">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-sm text-[var(--text-pure)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--text-pure)]">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-sm text-[var(--text-pure)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
            <span className="block text-xs text-[var(--text-tertiary)]">Use at least 12 characters.</span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--text-pure)]">Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-sm text-[var(--text-pure)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>

          {errorMessage && (
            <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-3 py-2.5 text-sm text-rose-200">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--text-pure)] px-5 text-sm font-semibold text-[var(--text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              <>
                Create student account
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <p className="border-t border-[var(--border-subtle)] pt-4 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-emerald-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};
