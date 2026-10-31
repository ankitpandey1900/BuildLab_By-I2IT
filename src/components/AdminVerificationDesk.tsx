"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  Search, 
  AlertCircle, 
  UserCheck, 
  Users, 
  RefreshCw,
  ExternalLink,
  MessageSquare
} from "lucide-react";

interface VerificationStudent {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  prnNumber: string | null;
  rollNumber: string | null;
  department: string | null;
  academicYear: string | null;
  verificationStatus: "PENDING_APPROVAL" | "VERIFIED" | "REJECTED";
  rejectionReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminVerificationDeskProps {
  onStatusUpdated?: () => void;
}

export const AdminVerificationDesk: React.FC<AdminVerificationDeskProps> = ({
  onStatusUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "rejected">("pending");
  const [pending, setPending] = useState<VerificationStudent[]>([]);
  const [verified, setVerified] = useState<VerificationStudent[]>([]);
  const [rejected, setRejected] = useState<VerificationStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [rejectingStudentId, setRejectingStudentId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/verifications");
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending || []);
        setVerified(data.verified || []);
        setRejected(data.rejected || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin verifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (studentId: string) => {
    setActionInProgress(studentId);
    try {
      const res = await fetch(`/api/admin/verifications/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (res.ok) {
        const approved = pending.find((s) => s.id === studentId);
        if (approved) {
          setPending((prev) => prev.filter((s) => s.id !== studentId));
          setVerified((prev) => [
            {
              ...approved,
              verificationStatus: "VERIFIED",
              verifiedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
        setFeedbackMessage("Student verified successfully.");
        setTimeout(() => setFeedbackMessage(null), 3000);
        onStatusUpdated?.();
      }
    } catch {
      setFeedbackMessage("Failed to approve verification.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (studentId: string) => {
    if (!rejectionNote.trim()) return;
    setActionInProgress(studentId);
    try {
      const res = await fetch(`/api/admin/verifications/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: rejectionNote.trim() }),
      });

      if (res.ok) {
        const student = pending.find((s) => s.id === studentId) || verified.find((s) => s.id === studentId);
        if (student) {
          setPending((prev) => prev.filter((s) => s.id !== studentId));
          setVerified((prev) => prev.filter((s) => s.id !== studentId));
          setRejected((prev) => [
            {
              ...student,
              verificationStatus: "REJECTED",
              rejectionReason: rejectionNote.trim(),
            },
            ...prev,
          ]);
        }
        setRejectingStudentId(null);
        setRejectionNote("");
        setFeedbackMessage("Verification marked as needing revision.");
        setTimeout(() => setFeedbackMessage(null), 3000);
        onStatusUpdated?.();
      }
    } catch {
      setFeedbackMessage("Failed to reject verification.");
    } finally {
      setActionInProgress(null);
    }
  };

  const filterList = (list: VerificationStudent[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.prnNumber && s.prnNumber.toLowerCase().includes(q)) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q))
    );
  };

  const currentList =
    activeTab === "pending"
      ? filterList(pending)
      : activeTab === "verified"
      ? filterList(verified)
      : filterList(rejected);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-pure)]">
                Campus Verification Desk
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Verify university PRNs against college rosters to grant contributor & maintainer rights.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchVerifications}
            disabled={isLoading}
            className="btn btn-secondary btn-sm self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {feedbackMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            {feedbackMessage}
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === "pending"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Pending Review</span>
              <Clock size={15} />
            </div>
            <p className="text-2xl font-bold font-mono mt-1 text-[var(--text-pure)]">
              {pending.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verified")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === "verified"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Verified Students</span>
              <UserCheck size={15} />
            </div>
            <p className="text-2xl font-bold font-mono mt-1 text-[var(--text-pure)]">
              {verified.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTab === "rejected"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Revision Needed</span>
              <AlertCircle size={15} />
            </div>
            <p className="text-2xl font-bold font-mono mt-1 text-[var(--text-pure)]">
              {rejected.length}
            </p>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-3">
        <label className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, PRN, or roll no…"
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-[var(--text-pure)] outline-none focus:border-[var(--accent-primary)]"
          />
        </label>
        <span className="text-xs text-[var(--text-tertiary)] font-mono">
          Showing {currentList.length} student{currentList.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
            Loading verification queue…
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
            {searchQuery
              ? "No students match your search filter."
              : activeTab === "pending"
              ? "No pending student verification requests. All caught up!"
              : activeTab === "verified"
              ? "No verified students in this view."
              : "No rejected requests."}
          </div>
        ) : (
          currentList.map((student) => (
            <div
              key={student.id}
              className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Student Identity */}
              <div className="flex items-start gap-3.5 min-w-0">
                <img
                  src={student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=222&color=fff`}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--border-subtle)]"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[var(--text-pure)] truncate">
                      {student.name}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono">
                      ({student.email})
                    </span>
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                        student.role === "faculty"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {student.role === "faculty" ? "Faculty / Mentor" : "Student"}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                        student.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : student.verificationStatus === "PENDING_APPROVAL"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {student.verificationStatus}
                    </span>
                  </div>

                  {/* PRN / Employee Code & College Record Meta */}
                  <div className="flex items-center gap-3 text-xs flex-wrap text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-[var(--text-tertiary)]">
                        {student.role === "faculty" ? "Emp Code:" : "PRN:"}
                      </span>
                      <strong className="font-mono text-indigo-400 font-semibold tracking-wide">
                        {student.prnNumber || "Not provided"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-[var(--text-tertiary)]">
                        {student.role === "faculty" ? "Designation:" : "Roll:"}
                      </span>
                      <span className="font-mono text-[var(--text-pure)]">
                        {student.rollNumber || "N/A"}
                      </span>
                    </span>
                    <span>•</span>
                    <span>{student.department || "Engineering"}</span>
                    {student.role !== "faculty" && student.academicYear && (
                      <>
                        <span>•</span>
                        <span className="text-[var(--text-tertiary)]">{student.academicYear}</span>
                      </>
                    )}
                  </div>

                  {/* Rejection Note if applicable */}
                  {student.rejectionReason && (
                    <p className="text-[11px] text-rose-400 mt-1">
                      Reason: {student.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons for Pending or Re-review */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {student.verificationStatus === "PENDING_APPROVAL" ? (
                  <>
                    <button
                      type="button"
                      disabled={actionInProgress === student.id}
                      onClick={() => handleApprove(student.id)}
                      className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 border-none text-white disabled:opacity-60"
                    >
                      <Check size={14} />
                      <span>{student.role === "faculty" ? "Approve Faculty" : "Approve Student"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionInProgress === student.id}
                      onClick={() => {
                        setRejectingStudentId(student.id);
                        setRejectionNote("");
                      }}
                      className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-rose-400 hover:text-rose-300 disabled:opacity-60"
                    >
                      <X size={14} />
                      <span>Request Changes</span>
                    </button>
                  </>
                ) : student.verificationStatus === "VERIFIED" ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <UserCheck size={14} />
                    <span>Verified</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={actionInProgress === student.id}
                    onClick={() => handleApprove(student.id)}
                    className="btn btn-secondary btn-sm text-xs cursor-pointer"
                  >
                    Re-approve
                  </button>
                )}
              </div>

              {/* Inline Reject Modal/Drawer */}
              {rejectingStudentId === student.id && (
                <div className="col-span-full w-full p-4 mt-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-rose-300">
                      Specify reason for rejecting PRN {student.prnNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRejectingStudentId(null)}
                      className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    placeholder="e.g. PRN does not match department roll sheet, please re-check."
                    className="w-full h-8 px-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-default)] text-xs text-[var(--text-pure)] outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingStudentId(null)}
                      className="btn btn-secondary btn-sm text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!rejectionNote.trim() || actionInProgress === student.id}
                      onClick={() => handleReject(student.id)}
                      className="btn btn-sm text-xs bg-rose-600 hover:bg-rose-500 text-white cursor-pointer disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

