"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  UserRoundCog,
  X,
} from "lucide-react";

const PAGE_SIZE = 12;
const ROLE_OPTIONS = ["student", "faculty", "reviewer", "lead", "admin"] as const;

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  prnNumber: string | null;
  verificationStatus: string;
  createdAt: string;
}

interface UserDirectoryResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AdminUserManagementProps {
  currentUserId: string;
}

function isManagedUser(value: unknown): value is ManagedUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string" &&
    (typeof user.department === "string" || user.department === null) &&
    (typeof user.prnNumber === "string" || user.prnNumber === null) &&
    typeof user.verificationStatus === "string" &&
    typeof user.createdAt === "string"
  );
}

function isUserDirectoryResponse(value: unknown): value is UserDirectoryResponse {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  return (
    Array.isArray(response.users) &&
    response.users.every(isManagedUser) &&
    typeof response.total === "number" &&
    typeof response.page === "number" &&
    typeof response.pageSize === "number" &&
    typeof response.totalPages === "number"
  );
}

function getApiMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return undefined;
  }
  return typeof payload.message === "string" ? payload.message : undefined;
}

function verificationLabel(status: string) {
  if (status === "VERIFIED") return "Verified";
  if (status === "PENDING_APPROVAL") return "Pending";
  if (status === "REJECTED") return "Needs revision";
  return "Not verified";
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  currentUserId,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });
        if (query.trim()) params.set("q", query.trim());

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(getApiMessage(payload) ?? `Could not load users (${response.status}).`);
        }
        if (!isUserDirectoryResponse(payload)) {
          throw new Error("The user directory response was incomplete.");
        }
        if (active) {
          setUsers(payload.users);
          setTotal(payload.total);
          setTotalPages(payload.totalPages);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "Could not load the user directory.";
        if (active) setLoadError(message);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 200);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [page, query, reloadVersion]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedUser && !dialog.open) {
      dialog.showModal();
    } else if (!selectedUser && dialog.open) {
      dialog.close();
    }
  }, [selectedUser]);

  const openRoleEditor = (user: ManagedUser) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setReason("");
    setSaveError(null);
  };

  const changeRole = async () => {
    if (!selectedUser || selectedRole === selectedUser.role) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(selectedUser.id)}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: selectedRole,
            ...(reason.trim() ? { reason: reason.trim() } : {}),
          }),
        }
      );
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getApiMessage(payload) ?? `Role update failed (${response.status}).`);
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("updatedRole" in payload) ||
        typeof payload.updatedRole !== "string"
      ) {
        throw new Error("The role update response was incomplete.");
      }

      setNotice(`${selectedUser.name}'s role is now ${payload.updatedRole}.`);
      setSelectedUser(null);
      setReloadVersion((version) => version + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Role update failed.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const studentNeedsVerification =
    selectedUser?.role === "student" &&
    selectedUser.verificationStatus !== "VERIFIED" &&
    selectedRole !== "student";
  const hasUnsupportedCurrentRole =
    selectedUser !== null &&
    !ROLE_OPTIONS.some((role) => role === selectedUser.role);

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold text-[var(--text-pure)]">People & access</h2>
        <span className="text-xs tabular-nums text-[var(--text-secondary)]">
          {new Intl.NumberFormat("en-IN").format(total)} accounts
        </span>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 border-l-2 border-emerald-500 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200"
        >
          <span>{notice} The change is recorded in the admin audit log.</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss role update notice"
            className="rounded p-1 text-emerald-200 hover:bg-emerald-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="border-y border-[var(--border-subtle)]">
        <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-lg">
            <span className="sr-only">Search accounts</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              aria-hidden="true"
            />
            <input
              value={query}
              maxLength={100}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                setNotice(null);
              }}
              placeholder="Search by name, email, PRN, department, or role"
              className="min-h-11 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] pl-10 pr-3 text-sm text-[var(--text-pure)] placeholder:text-[var(--text-tertiary)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>
          <p className="text-xs tabular-nums text-[var(--text-tertiary)]" aria-live="polite">
            {isLoading ? "Updating directory…" : `${users.length} shown on this page`}
          </p>
        </div>

        {loadError && (
          <div
            role="alert"
            className="m-4 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm text-rose-200"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadVersion((version) => version + 1)}
              className="mt-3 min-h-11 rounded-lg border border-rose-500/25 px-3 text-sm font-medium hover:bg-rose-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              Retry
            </button>
          </div>
        )}

        {!loadError && !isLoading && users.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <UsersRoundIcon />
            <h3 className="mt-3 font-medium text-[var(--text-pure)]">No matching accounts</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Try a different name, email, PRN, department, or role.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[29%]" />
                <col className="w-[24%]" />
                <col className="w-[17%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  <th scope="col" className="py-3 pr-4 font-medium">Account</th>
                  <th scope="col" className="px-4 py-3 font-medium">Department / PRN</th>
                  <th scope="col" className="px-4 py-3 font-medium">Campus status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="pl-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  const isVerified = user.verificationStatus === "VERIFIED";
                  return (
                    <tr key={user.id} className="transition-colors hover:bg-[var(--bg-surface-elevated)]/40">
                      <td className="py-3 pr-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-semibold text-[var(--text-secondary)]"
                          >
                            {user.name.trim().charAt(0).toUpperCase() || "?"}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-[var(--text-pure)]">
                              {user.name}
                              {isCurrentUser && (
                                <>
                                  {" "}
                                  <span className="text-[11px] font-normal text-[var(--text-tertiary)]">
                                    You
                                  </span>
                                </>
                              )}
                            </span>
                            <span className="block max-w-[250px] truncate text-xs text-[var(--text-secondary)]">
                              {user.email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        <span className="block">{user.department || "Unassigned"}</span>
                        <span className="mt-0.5 block font-mono text-[var(--text-tertiary)]">
                          {user.prnNumber || "No PRN"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${
                              isVerified
                                ? "bg-emerald-400"
                                : user.verificationStatus === "PENDING_APPROVAL"
                                ? "bg-amber-400"
                                : user.verificationStatus === "REJECTED"
                                ? "bg-rose-400"
                                : "bg-[var(--text-tertiary)]"
                            }`}
                          />
                          {verificationLabel(user.verificationStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={user.role === "admin" ? "text-sm text-amber-300" : "text-sm text-[var(--text-secondary)]"}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="pl-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openRoleEditor(user)}
                          disabled={isCurrentUser}
                          title={isCurrentUser ? "You cannot change your own role" : `Manage ${user.name}'s role`}
                          className="btn btn-secondary btn-sm min-h-10 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <UserRoundCog size={15} aria-hidden="true" />
                          {isCurrentUser ? "Your account" : "Manage role"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-[var(--text-tertiary)]">
            {total === 0
              ? "No accounts"
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || isLoading}
              className="btn btn-secondary btn-sm min-h-10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} aria-hidden="true" />
              Previous
            </button>
            <span className="min-w-16 text-center text-xs text-[var(--text-secondary)]">
              {totalPages === 0 ? "0 / 0" : `${page} / ${totalPages}`}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || isLoading}
              className="btn btn-secondary btn-sm min-h-10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="role-editor-title"
        onCancel={(event) => {
          event.preventDefault();
          setSelectedUser(null);
        }}
        className="fixed m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0 text-[var(--text-pure)] shadow-2xl backdrop:bg-black/70"
      >
        {selectedUser && (
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <UserRoundCog size={19} aria-hidden="true" />
                </div>
                <h2 id="role-editor-title" className="text-lg font-semibold">
                  Change platform role
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {selectedUser.name} <span className="text-[var(--text-tertiary)]">({selectedUser.email})</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close role editor"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="admin-role-select" className="mb-1.5 block text-sm font-medium">
                  New role
                </label>
                <select
                  id="admin-role-select"
                  autoFocus
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  className="min-h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 text-sm text-[var(--text-pure)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                >
                  {hasUnsupportedCurrentRole && (
                    <option value={selectedUser.role} disabled>
                      {selectedUser.role} (existing role)
                    </option>
                  )}
                  {ROLE_OPTIONS.map((role) => (
                    <option
                      key={role}
                      value={role}
                      disabled={
                        selectedUser.role === "student" &&
                        selectedUser.verificationStatus !== "VERIFIED" &&
                        role !== "student"
                      }
                    >
                      {role}
                    </option>
                  ))}
                </select>
                {studentNeedsVerification && (
                  <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
                    This student must complete campus verification before being elevated.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="admin-role-reason" className="mb-1.5 block text-sm font-medium">
                  Reason <span className="font-normal text-[var(--text-tertiary)]">(optional)</span>
                </label>
                <textarea
                  id="admin-role-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Add context for the audit log"
                  className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-2.5 text-sm text-[var(--text-pure)] placeholder:text-[var(--text-tertiary)] focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
                <p className="mt-1 text-right text-xs text-[var(--text-tertiary)]">
                  {reason.length}/500
                </p>
              </div>

              <p className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                The change is added to the audit log and ends the user’s active sessions, so they’ll need to sign in again.
              </p>

              {saveError && (
                <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/5 px-3 py-2.5 text-sm text-rose-200">
                  {saveError}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                disabled={isSaving}
                className="min-h-11 rounded-lg border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-pure)] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={changeRole}
                disabled={isSaving || selectedRole === selectedUser.role || studentNeedsVerification}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                {isSaving ? "Saving…" : "Confirm role change"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
};

const UsersRoundIcon: React.FC = () => (
  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-tertiary)]">
    <Search size={18} aria-hidden="true" />
  </div>
);
