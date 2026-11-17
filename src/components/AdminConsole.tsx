"use client";

import React, { useEffect, useState } from "react";
import {
  ChartNoAxesCombined,
  ClipboardCheck,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { canChangeUserRole, canVerifyStudents } from "../lib/permissions";
import { AdminMetricsOverview } from "./AdminMetricsOverview";
import { AdminUserManagement } from "./AdminUserManagement";
import { AdminVerificationDesk } from "./AdminVerificationDesk";

type AdminSection = "overview" | "verifications" | "users";

interface AdminConsoleProps {
  currentUserId: string;
  currentUserRole: string;
  onStatusUpdated?: () => void;
}

const sectionLabels: Record<AdminSection, string> = {
  overview: "Overview",
  verifications: "Verifications",
  users: "People & access",
};

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUserId,
  currentUserRole,
  onStatusUpdated,
}) => {
  const canAccessWorkspace = canVerifyStudents(currentUserRole);
  const isPlatformAdmin = canChangeUserRole(currentUserRole);
  const [activeSection, setActiveSection] = useState<AdminSection>(
    isPlatformAdmin ? "overview" : "verifications"
  );
  const availableSections: AdminSection[] = isPlatformAdmin
    ? ["overview", "verifications", "users"]
    : ["verifications"];

  useEffect(() => {
    if (!isPlatformAdmin && activeSection !== "verifications") {
      setActiveSection("verifications");
    }
  }, [activeSection, isPlatformAdmin]);

  if (!canAccessWorkspace) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 text-sm text-[var(--text-secondary)]"
      >
        <h2 className="font-semibold text-[var(--text-pure)]">Admin access required</h2>
        <p className="mt-1">Your account does not have permission to open this workspace.</p>
      </section>
    );
  }

  const roleLabel = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1);

  return (
    <section className="space-y-5 pb-10">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-pure)]">
            Administration
          </h1>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" />
            {roleLabel}
          </span>
        </div>

        <nav
          aria-label="Administration sections"
          role="tablist"
          className="flex gap-5 overflow-x-auto border-b border-[var(--border-subtle)]"
        >
          {availableSections.map((section) => {
            const selected = activeSection === section;
            const Icon =
              section === "overview"
                ? ChartNoAxesCombined
                : section === "verifications"
                ? ClipboardCheck
                : UsersRound;

            return (
              <button
                key={section}
                id={`admin-tab-${section}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="admin-section-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveSection(section)}
                onKeyDown={(event) => {
                  if (availableSections.length < 2) return;
                  const currentIndex = availableSections.indexOf(section);
                  const nextIndex =
                    event.key === "ArrowRight"
                      ? (currentIndex + 1) % availableSections.length
                      : event.key === "ArrowLeft"
                      ? (currentIndex - 1 + availableSections.length) % availableSections.length
                      : -1;
                  if (nextIndex < 0) return;
                  event.preventDefault();
                  const nextSection = availableSections[nextIndex];
                  setActiveSection(nextSection);
                  document.getElementById(`admin-tab-${nextSection}`)?.focus();
                }}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                  selected
                    ? "border-emerald-400 text-[var(--text-pure)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
                }`}
              >
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                {sectionLabels[section]}
              </button>
            );
          })}
        </nav>
      </header>

      <div
        id="admin-section-panel"
        role="tabpanel"
        aria-labelledby={`admin-tab-${activeSection}`}
        tabIndex={0}
        className="min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
      >
        {activeSection === "overview" && isPlatformAdmin && <AdminMetricsOverview />}
        {activeSection === "verifications" && (
          <AdminVerificationDesk onStatusUpdated={onStatusUpdated} />
        )}
        {activeSection === "users" && isPlatformAdmin && (
          <AdminUserManagement currentUserId={currentUserId} />
        )}
      </div>
    </section>
  );
};
