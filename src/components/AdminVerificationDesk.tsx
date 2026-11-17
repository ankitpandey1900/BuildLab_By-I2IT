"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Check, 
  X, 
  Search, 
  AlertCircle, 
  UserCheck, 
  RefreshCw, 
  LayoutGrid, 
  List, 
  CheckSquare, 
  Square, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Eye,
  GitBranch
} from "lucide-react";

interface VerificationStudent {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  bio?: string;
  prnNumber: string | null;
  rollNumber: string | null;
  department: string | null;
  academicYear: string | null;
  verificationStatus: "PENDING_APPROVAL" | "VERIFIED" | "REJECTED";
  rejectionReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: { name: string } | null;
  accounts?: Array<{ accountId: string }>;
}

interface RosterEntry {
  prn: string;
  name?: string;
  rollNumber?: string;
  department?: string;
  academicYear?: string;
}

interface AuditLogEvent {
  id: string;
  actorId: string | null;
  action: string;
  target: string;
  metadata: any;
  createdAt: string;
}

interface AdminVerificationDeskProps {
  onStatusUpdated?: () => void;
}

// Configurable constants
const FEEDBACK_TIMEOUT_MS = 3500;

const DEPARTMENT_FILTER_OPTIONS = [
  { id: "ALL", label: "All" },
  { id: "CE", label: "CE" },
  { id: "IT", label: "IT" },
  { id: "ENTC", label: "E&TC" },
  { id: "FACULTY", label: "Faculty" },
] as const;

const CANNED_REASONS = [
  "PRN not found in official college database",
  "Department/Branch mismatch with registration records",
  "Duplicate PRN submission detected",
  "Academic year does not match enrolled batch",
  "Faculty employee ID not recognized in college directory",
];

const ROSTER_CSV_SAMPLE_TEMPLATE = 
  "PRN,Name,RollNo,Department,AcademicYear\n" +
  "72120001,Aarav Patil,4101,Computer Engineering,BE\n" +
  "72120002,Sneha Deshmukh,4202,Information Technology,TE\n" +
  "72120003,Rohan Shinde,4303,E&TC,SE";

// Centralized helpers
const getStudentAvatar = (student: { name: string; image?: string | null }) => {
  return (
    student.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=18181b&color=e4e4e7`
  );
};

const formatDisplayDate = (isoString: string | null) => {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const formatDisplayDateTime = (isoString: string | null) => {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

export const AdminVerificationDesk: React.FC<AdminVerificationDeskProps> = ({
  onStatusUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "rejected">("pending");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [pending, setPending] = useState<VerificationStudent[]>([]);
  const [verified, setVerified] = useState<VerificationStudent[]>([]);
  const [rejected, setRejected] = useState<VerificationStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Single student rejection
  const [rejectingStudentId, setRejectingStudentId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  // Batch actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchRejectModalOpen, setIsBatchRejectModalOpen] = useState(false);
  const [batchRejectNote, setBatchRejectNote] = useState("");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Roster CSV state
  const [rosterMap, setRosterMap] = useState<Map<string, RosterEntry> | null>(null);
  const [rosterFileName, setRosterFileName] = useState<string | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub / Contributor Evidence Popover
  const [inspectingStudent, setInspectingStudent] = useState<VerificationStudent | null>(null);

  // Audit Trail Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditLogEvent[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), FEEDBACK_TIMEOUT_MS);
  };

  useEffect(() => {
    setSelectedIds([]);
    setRejectingStudentId(null);
    setIsBatchRejectModalOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRejectingStudentId(null);
        setIsBatchRejectModalOpen(false);
        setIsRosterModalOpen(false);
        setInspectingStudent(null);
        setIsAuditModalOpen(false);
        if (selectedIds.length > 0) setSelectedIds([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds.length]);

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

  const fetchAuditTrail = async () => {
    setIsLoadingAudit(true);
    setAuditError(null);
    try {
      const res = await fetch("/api/admin/verifications/audit");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Failed to fetch audit events (${res.status}).`);
      }
      if (!data || !Array.isArray(data.events)) {
        throw new Error("The audit log response was incomplete.");
      }
      setAuditEvents(data.events);
    } catch (err) {
      console.error("Failed to fetch audit trail", err);
      setAuditError(err instanceof Error ? err.message : "Failed to fetch audit events.");
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const openAuditModal = () => {
    setIsAuditModalOpen(true);
    fetchAuditTrail();
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
        const approved = pending.find((s) => s.id === studentId) || rejected.find((s) => s.id === studentId);
        if (approved) {
          setPending((prev) => prev.filter((s) => s.id !== studentId));
          setRejected((prev) => prev.filter((s) => s.id !== studentId));
          setVerified((prev) => [
            {
              ...approved,
              verificationStatus: "VERIFIED",
              verifiedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
        setSelectedIds((prev) => prev.filter((id) => id !== studentId));
        showFeedback("Student verified successfully.");
        onStatusUpdated?.();
      }
    } catch {
      showFeedback("Failed to approve verification.");
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
        setSelectedIds((prev) => prev.filter((id) => id !== studentId));
        setRejectingStudentId(null);
        setRejectionNote("");
        showFeedback("Verification marked as needing revision.");
        onStatusUpdated?.();
      }
    } catch {
      showFeedback("Failed to reject verification.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const res = await fetch("/api/admin/verifications/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedIds,
          action: "approve",
        }),
      });

      if (res.ok) {
        const approvedSet = new Set(selectedIds);
        const movingStudents = (activeTab === "pending" ? pending : rejected).filter((s) =>
          approvedSet.has(s.id)
        );

        setPending((prev) => prev.filter((s) => !approvedSet.has(s.id)));
        setRejected((prev) => prev.filter((s) => !approvedSet.has(s.id)));
        setVerified((prev) => [
          ...movingStudents.map((s) => ({
            ...s,
            verificationStatus: "VERIFIED" as const,
            verifiedAt: new Date().toISOString(),
          })),
          ...prev,
        ]);

        showFeedback(`Batch verified ${selectedIds.length} student(s) successfully!`);
        setSelectedIds([]);
        onStatusUpdated?.();
      }
    } catch {
      showFeedback("Failed to process batch approval.");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    if (selectedIds.length === 0 || !batchRejectNote.trim()) return;
    setIsBatchProcessing(true);
    try {
      const res = await fetch("/api/admin/verifications/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedIds,
          action: "reject",
          reason: batchRejectNote.trim(),
        }),
      });

      if (res.ok) {
        const rejectedSet = new Set(selectedIds);
        const movingStudents = (activeTab === "pending" ? pending : verified).filter((s) =>
          rejectedSet.has(s.id)
        );

        setPending((prev) => prev.filter((s) => !rejectedSet.has(s.id)));
        setVerified((prev) => prev.filter((s) => !rejectedSet.has(s.id)));
        setRejected((prev) => [
          ...movingStudents.map((s) => ({
            ...s,
            verificationStatus: "REJECTED" as const,
            rejectionReason: batchRejectNote.trim(),
          })),
          ...prev,
        ]);

        showFeedback(`Batch marked ${selectedIds.length} student(s) for revision.`);
        setSelectedIds([]);
        setIsBatchRejectModalOpen(false);
        setBatchRejectNote("");
        onStatusUpdated?.();
      }
    } catch {
      showFeedback("Failed to process batch revision request.");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleRosterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRosterError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("File is empty.");

        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) throw new Error("CSV must have a header row and at least 1 record.");

        const headerCols = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
        const prnIdx = headerCols.findIndex((h) => h.includes("prn"));
        const nameIdx = headerCols.findIndex((h) => h.includes("name"));
        const rollIdx = headerCols.findIndex((h) => h.includes("roll"));
        const deptIdx = headerCols.findIndex((h) => h.includes("dept") || h.includes("branch"));
        const yearIdx = headerCols.findIndex((h) => h.includes("year"));

        if (prnIdx === -1) {
          throw new Error("CSV must contain a 'PRN' column header.");
        }

        const map = new Map<string, RosterEntry>();
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",").map((cell) => cell.replace(/^"|"$/g, "").trim());
          const prn = row[prnIdx];
          if (prn) {
            const normalizedPrn = prn.toUpperCase();
            map.set(normalizedPrn, {
              prn: normalizedPrn,
              name: nameIdx !== -1 ? row[nameIdx] : undefined,
              rollNumber: rollIdx !== -1 ? row[rollIdx] : undefined,
              department: deptIdx !== -1 ? row[deptIdx] : undefined,
              academicYear: yearIdx !== -1 ? row[yearIdx] : undefined,
            });
          }
        }

        setRosterMap(map);
        setRosterFileName(file.name);
        setIsRosterModalOpen(false);
        showFeedback(`Official roster loaded: ${map.size} students mapped.`);
      } catch (err: any) {
        setRosterError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const getRosterMatch = (student: VerificationStudent) => {
    if (!rosterMap || !student.prnNumber) return null;
    const cleanPRN = student.prnNumber.trim().toUpperCase();
    const entry = rosterMap.get(cleanPRN);
    if (!entry) return { status: "NOT_FOUND" as const };

    if (entry.name && student.name) {
      const sName = student.name.toLowerCase().trim();
      const rName = entry.name.toLowerCase().trim();
      const isSimilar = sName.includes(rName) || rName.includes(sName) ||
        rName.split(" ").some((part) => sName.includes(part));

      if (!isSimilar) {
        return {
          status: "DISCREPANCY" as const,
          rosterName: entry.name,
          rosterDept: entry.department,
        };
      }
    }

    return {
      status: "MATCH" as const,
      rosterName: entry.name || student.name,
      rosterDept: entry.department || student.department,
    };
  };

  const handleSelectAllRosterMatches = () => {
    if (!rosterMap) return;
    const matched = currentList.filter((s) => {
      const match = getRosterMatch(s);
      return match && match.status === "MATCH";
    });
    setSelectedIds(matched.map((s) => s.id));
    showFeedback(`Selected ${matched.length} roster-verified student(s) for quick batch approval.`);
  };

  const handleExportCSV = () => {
    const listToExport = verified.length > 0 ? verified : currentList;
    const headers = [
      "PRN",
      "Full Name",
      "Email",
      "Department",
      "Academic Year",
      "Roll No",
      "Role",
      "Verification Status",
      "Verified Date",
      "Verified By",
    ];

    const rows = listToExport.map((s) => [
      `"${s.prnNumber || ""}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.department || ""}"`,
      `"${s.academicYear || ""}"`,
      `"${s.rollNumber || ""}"`,
      `"${s.role}"`,
      `"${s.verificationStatus}"`,
      `"${s.verifiedAt ? new Date(s.verifiedAt).toISOString() : ""}"`,
      `"${s.verifiedBy?.name || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BuildLab_Verified_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleCSV = () => {
    const blob = new Blob([ROSTER_CSV_SAMPLE_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "BuildLab_Roster_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDepartmentBadge = (dept: string | null, role: string) => {
    return {
      label: dept || (role === "faculty" ? "Faculty / Mentor" : "Unassigned"),
      classes: "border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]",
    };
  };

  const getVerificationStatusTone = (status: VerificationStudent["verificationStatus"]) => {
    if (status === "VERIFIED") {
      return "border-emerald-500/20 text-emerald-300";
    }
    if (status === "PENDING_APPROVAL") {
      return "border-amber-500/25 text-amber-300";
    }
    return "border-rose-500/25 text-rose-300";
  };

  const getVerificationStatusLabel = (status: VerificationStudent["verificationStatus"]) => {
    if (status === "VERIFIED") return "Verified";
    if (status === "PENDING_APPROVAL") return "Awaiting review";
    return "Needs revision";
  };

  const filterList = (list: VerificationStudent[]) => {
    let filtered = list;

    if (deptFilter !== "ALL") {
      if (deptFilter === "FACULTY") {
        filtered = filtered.filter((s) => s.role === "faculty");
      } else {
        filtered = filtered.filter((s) => {
          if (s.role === "faculty") return false;
          const d = (s.department || "").toLowerCase();
          if (deptFilter === "CE") return d.includes("comp") || d.includes("ce");
          if (deptFilter === "IT") return d.includes("it") || d.includes("information");
          if (deptFilter === "ENTC") return d.includes("entc") || d.includes("e&tc") || d.includes("elect");
          return true;
        });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.prnNumber && s.prnNumber.toLowerCase().includes(q)) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
          (s.department && s.department.toLowerCase().includes(q))
      );
    }

    return filtered;
  };

  const currentList =
    activeTab === "pending"
      ? filterList(pending)
      : activeTab === "verified"
      ? filterList(verified)
      : filterList(rejected);

  const isAllSelected = currentList.length > 0 && currentList.every((s) => selectedIds.includes(s.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentList.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative space-y-5 pb-16">
      <header className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-pure)]">Verification register</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Review campus identity records against the official roster.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRosterModalOpen(true)}
            className="btn btn-secondary btn-sm min-h-10"
            title="Upload college roster CSV to match PRNs"
          >
            <FileSpreadsheet size={14} aria-hidden="true" />
            {rosterMap ? "Roster loaded" : "Import roster"}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm min-h-10"
            title="Export verified roster for accreditation"
          >
            <Download size={14} aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            onClick={openAuditModal}
            className="btn btn-secondary btn-sm min-h-10"
            title="View reviewer history"
          >
            <History size={14} aria-hidden="true" />
            Audit
          </button>
          <button
            type="button"
            onClick={fetchVerifications}
            disabled={isLoading}
            aria-label="Refresh verification records"
            className="btn btn-secondary btn-sm min-h-10 px-2.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>
      </header>

      {rosterMap && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-emerald-500 py-2 pl-3 text-sm">
          <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
            <CheckCircle2 size={15} className="text-emerald-400" aria-hidden="true" />
            <strong className="font-medium text-[var(--text-pure)]">{rosterFileName}</strong>
            <span>{rosterMap.size} roster records loaded</span>
          </span>
          <div className="flex items-center gap-4">
            {activeTab === "pending" && (
              <button
                type="button"
                onClick={handleSelectAllRosterMatches}
                className="text-sm font-medium text-emerald-300 underline-offset-4 hover:underline"
              >
                Select exact matches
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setRosterMap(null);
                setRosterFileName(null);
              }}
              className="text-sm text-[var(--text-secondary)] underline-offset-4 hover:text-rose-300 hover:underline"
            >
              Remove roster
            </button>
          </div>
        </div>
      )}

      {feedbackMessage && (
        <p role="status" className="border-l-2 border-emerald-500 py-2 pl-3 text-sm text-emerald-300">
          {feedbackMessage}
        </p>
      )}

      <div
        role="group"
        aria-label="Filter by verification status"
        className="flex gap-5 overflow-x-auto border-b border-[var(--border-subtle)]"
      >
        {([
          ["pending", "Awaiting review", pending.length],
          ["verified", "Verified", verified.length],
          ["rejected", "Needs revision", rejected.length],
        ] as const).map(([status, label, count]) => (
          <button
            key={status}
            type="button"
            aria-pressed={activeTab === status}
            onClick={() => setActiveTab(status)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
              activeTab === status
                ? "border-emerald-400 text-[var(--text-pure)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
            }`}
          >
            {label}
            <span className="tabular-nums text-xs text-[var(--text-tertiary)]">{count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {currentList.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              title={isAllSelected ? "Deselect all" : "Select all in view"}
              className="btn btn-secondary btn-sm min-h-10 self-start"
            >
              {isAllSelected ? (
                <CheckSquare size={14} aria-hidden="true" />
              ) : (
                <Square size={14} aria-hidden="true" />
              )}
              {isAllSelected ? "Clear selection" : "Select all"}
            </button>
          )}
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search verification records</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name or PRN"
              className="min-h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-3 text-sm text-[var(--text-pure)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15"
            />
          </label>
          <span className="text-xs tabular-nums text-[var(--text-tertiary)] sm:ml-auto">
            {currentList.length} record{currentList.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2" role="group" aria-label="Filter by department">
          {DEPARTMENT_FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={deptFilter === option.id}
              onClick={() => setDeptFilter(option.id)}
              className={`min-h-9 border-b text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                deptFilter === option.id
                  ? "border-emerald-400 text-[var(--text-pure)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
              }`}
            >
              {option.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 border-l border-[var(--border-subtle)] pl-3">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              aria-label="Show compact records"
              aria-pressed={viewMode === "cards"}
              className={`flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                viewMode === "cards" ? "text-emerald-300" : "text-[var(--text-tertiary)] hover:text-[var(--text-pure)]"
              }`}
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Show table"
              aria-pressed={viewMode === "table"}
              className={`flex h-9 w-9 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                viewMode === "table" ? "text-emerald-300" : "text-[var(--text-tertiary)] hover:text-[var(--text-pure)]"
              }`}
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Records Container */}
      {isLoading ? (
        <div className="border-y border-[var(--border-subtle)] py-12 text-center text-sm text-[var(--text-secondary)]">
          <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-emerald-400" />
          Loading verification records…
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-16 text-center text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
          {searchQuery || deptFilter !== "ALL"
            ? "No students match your filter criteria."
            : activeTab === "pending"
            ? "No pending student verification requests. All caught up!"
            : activeTab === "verified"
            ? "No verified students in this view."
            : "No revision requests."}
        </div>
      ) : viewMode === "cards" ? (
        /* CARD VIEW */
        <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {currentList.map((student) => {
            const isSelected = selectedIds.includes(student.id);
            const deptInfo = getDepartmentBadge(student.department, student.role);
            const rosterMatch = getRosterMatch(student);

            return (
              <div
                key={student.id}
                className={`flex flex-col justify-between gap-4 px-3 py-4 transition-colors sm:px-4 md:flex-row md:items-center ${
                  isSelected
                    ? "bg-emerald-500/5"
                    : "hover:bg-[var(--bg-surface-elevated)]/40"
                }`}
              >
                {/* Student Selection & Identity */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSelectOne(student.id)}
                    aria-label={`${isSelected ? "Deselect" : "Select"} ${student.name}`}
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-[var(--accent-primary)]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingStudent(student)}
                    className="relative group shrink-0 cursor-pointer"
                    title="Click to inspect GitHub & Contributor profile"
                  >
                    <img
                      src={getStudentAvatar(student)}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)] group-hover:border-emerald-400 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={14} className="text-white" />
                    </div>
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setInspectingStudent(student)}
                        className="font-bold text-sm text-[var(--text-pure)] truncate hover:text-emerald-400 transition-colors text-left cursor-pointer"
                      >
                        {student.name}
                      </button>
                      <span className="text-xs text-[var(--text-secondary)] font-mono">
                        ({student.email})
                      </span>
                      <span
                        className={`text-xs ${deptInfo.classes}`}
                      >
                        {deptInfo.label}
                      </span>
                      <span
                        className={`border-b-2 text-xs ${getVerificationStatusTone(student.verificationStatus)}`}
                      >
                        {getVerificationStatusLabel(student.verificationStatus)}
                      </span>

                      {/* Roster Match Badge */}
                      {rosterMatch && (
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            rosterMatch.status === "MATCH"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : rosterMatch.status === "DISCREPANCY"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                          }`}
                        >
                          {rosterMatch.status === "MATCH" ? (
                            <>
                              <CheckCircle2 size={11} />
                              <span>Roster 100% Match</span>
                            </>
                          ) : rosterMatch.status === "DISCREPANCY" ? (
                            <>
                              <AlertTriangle size={11} />
                              <span>Roster Name: {rosterMatch.rosterName}</span>
                            </>
                          ) : (
                            <span>Not on Roster</span>
                          )}
                        </span>
                      )}

                      {/* GitHub Evidence Button */}
                      <button
                        type="button"
                        onClick={() => setInspectingStudent(student)}
                        className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 cursor-pointer"
                      >
                        <GitBranch size={10} />
                        <span>Evidence</span>
                      </button>
                    </div>

                    {/* PRN & College Record Meta */}
                    <div className="flex items-center gap-3 text-xs flex-wrap text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-[var(--text-tertiary)]">
                          {student.role === "faculty" ? "Emp Code:" : "PRN:"}
                        </span>
                        <strong className="font-mono text-emerald-400 font-semibold tracking-wide">
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
                      {student.academicYear && student.role !== "faculty" && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--text-tertiary)] font-mono">{student.academicYear}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {student.verificationStatus === "VERIFIED"
                          ? `Verified: ${formatDisplayDate(student.verifiedAt)}${student.verifiedBy?.name ? ` by ${student.verifiedBy.name}` : ""}`
                          : `Submitted: ${formatDisplayDate(student.createdAt)}`}
                      </span>
                    </div>

                    {/* Rejection Note */}
                    {student.rejectionReason && (
                      <p className="text-[11px] text-rose-400 mt-1">
                        Reason: {student.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
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

                {/* Inline Reject Drawer */}
                {rejectingStudentId === student.id && (
                  <div className="col-span-full w-full p-4 mt-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-rose-300">
                        Specify reason for requesting revision on PRN {student.prnNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRejectingStudentId(null)}
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {CANNED_REASONS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRejectionNote(preset)}
                          className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer text-left"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      placeholder="Type custom note or select a preset chip above…"
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
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="overflow-x-auto border-y border-[var(--border-subtle)]">
          <table className="w-full min-w-[900px] border-collapse text-left text-[13px]">
            <caption className="sr-only">Campus verification records</caption>
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                <th className="py-3 px-3 w-8">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    title={isAllSelected ? "Deselect all" : "Select all in view"}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-pure)] cursor-pointer"
                  >
                    {isAllSelected ? (
                      <CheckSquare size={14} className="text-[var(--accent-primary)]" />
                    ) : (
                      <Square size={14} />
                    )}
                  </button>
                </th>
                <th scope="col" className="py-3 px-3 font-medium">Student</th>
                <th scope="col" className="py-3 px-3 font-medium">PRN / Emp Code</th>
                <th scope="col" className="py-3 px-3 font-medium">Department</th>
                <th scope="col" className="py-3 px-3 font-medium">Status</th>
                {rosterMap && <th scope="col" className="py-3 px-3 font-medium">Roster match</th>}
                <th scope="col" className="py-3 px-3 font-medium">Date</th>
                <th scope="col" className="py-3 px-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/50">
              {currentList.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                const deptInfo = getDepartmentBadge(student.department, student.role);
                const rosterMatch = getRosterMatch(student);

                return (
                  <React.Fragment key={student.id}>
                    <tr
                      className={`transition-colors ${
                        isSelected
                          ? "bg-emerald-500/5"
                          : "hover:bg-[var(--bg-surface-elevated)]/40"
                      }`}
                    >
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(student.id)}
                          aria-label={`${isSelected ? "Deselect" : "Select"} ${student.name}`}
                          className="flex h-10 w-10 items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                        >
                          {isSelected ? (
                            <CheckSquare size={14} className="text-[var(--accent-primary)]" />
                          ) : (
                            <Square size={14} />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setInspectingStudent(student)}
                            className="relative group shrink-0 cursor-pointer"
                            title="Click to view GitHub evidence"
                          >
                            <img
                              src={getStudentAvatar(student)}
                              alt={student.name}
                              className="w-7 h-7 rounded-full object-cover border border-[var(--border-subtle)] group-hover:border-emerald-400"
                            />
                          </button>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setInspectingStudent(student)}
                              className="font-semibold text-[var(--text-pure)] truncate hover:text-emerald-400 transition-colors text-left cursor-pointer block"
                            >
                              {student.name}
                            </button>
                            <div className="text-[11px] text-[var(--text-tertiary)] truncate font-mono">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-semibold text-emerald-400">
                          {student.prnNumber || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs ${deptInfo.classes}`}>
                          {deptInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`whitespace-nowrap border-b-2 text-xs ${getVerificationStatusTone(student.verificationStatus)}`}
                        >
                          {getVerificationStatusLabel(student.verificationStatus)}
                        </span>
                      </td>
                      {rosterMap && (
                        <td className="py-3 px-3">
                          {rosterMatch ? (
                            <span
                              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                rosterMatch.status === "MATCH"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : rosterMatch.status === "DISCREPANCY"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                              }`}
                            >
                              {rosterMatch.status === "MATCH" ? (
                                <>
                                  <CheckCircle2 size={11} />
                                  <span>100% Match</span>
                                </>
                              ) : rosterMatch.status === "DISCREPANCY" ? (
                                <>
                                  <AlertTriangle size={11} />
                                  <span>Name: {rosterMatch.rosterName}</span>
                                </>
                              ) : (
                                <span>Not Found</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-mono">—</span>
                          )}
                        </td>
                      )}
                      <td className="py-3 px-3 text-[11px] text-[var(--text-tertiary)] font-mono whitespace-nowrap">
                        {student.verificationStatus === "VERIFIED"
                          ? formatDisplayDate(student.verifiedAt)
                          : formatDisplayDate(student.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectingStudent(student)}
                            title="Inspect Contributor Evidence"
                            aria-label={`Inspect ${student.name}'s contributor evidence`}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 cursor-pointer"
                          >
                            <Eye size={13} aria-hidden="true" />
                          </button>

                          {student.verificationStatus === "PENDING_APPROVAL" ? (
                            <>
                              <button
                                type="button"
                                disabled={actionInProgress === student.id}
                                onClick={() => handleApprove(student.id)}
                                title="Approve Verification"
                                aria-label={`Approve ${student.name}`}
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 cursor-pointer disabled:opacity-50"
                              >
                                <Check size={13} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                disabled={actionInProgress === student.id}
                                onClick={() => {
                                  setRejectingStudentId(student.id);
                                  setRejectionNote("");
                                }}
                                title="Request Revision"
                                aria-label={`Request changes from ${student.name}`}
                                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 cursor-pointer disabled:opacity-50"
                              >
                                <X size={13} aria-hidden="true" />
                              </button>
                            </>
                          ) : student.verificationStatus === "VERIFIED" ? (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                              <UserCheck size={12} />
                              <span>Done</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={actionInProgress === student.id}
                              onClick={() => handleApprove(student.id)}
                              className="px-2 py-1 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)] cursor-pointer"
                            >
                              Re-approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Table Inline Rejection Row */}
                    {rejectingStudentId === student.id && (
                      <tr className="bg-rose-500/5">
                        <td colSpan={rosterMap ? 8 : 7} className="p-3 space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {CANNED_REASONS.map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setRejectionNote(preset)}
                                className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer text-left"
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-rose-300 font-medium shrink-0">
                              Reason:
                            </span>
                            <input
                              type="text"
                              value={rejectionNote}
                              onChange={(e) => setRejectionNote(e.target.value)}
                              placeholder="Type reason or select a preset chip above…"
                              className="flex-1 h-7 px-2.5 rounded bg-[var(--input-bg)] border border-[var(--border-default)] text-xs text-[var(--text-pure)] outline-none focus:border-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => setRejectingStudentId(null)}
                              className="btn btn-secondary btn-sm text-[11px] py-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!rejectionNote.trim() || actionInProgress === student.id}
                              onClick={() => handleReject(student.id)}
                              className="btn btn-sm text-[11px] py-1 bg-rose-600 hover:bg-rose-500 text-white cursor-pointer disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FLOATING STICKY BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-3 border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 shadow-xl sm:bottom-6 sm:flex-nowrap sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-sm font-medium tabular-nums text-[var(--text-pure)]">
              {selectedIds.length} selected
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />

          <div className="flex items-center gap-2">
            {(activeTab === "pending" || activeTab === "rejected") && (
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={handleBatchApprove}
                className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white border-none disabled:opacity-50"
              >
                <Check size={13} />
                <span>
                  {isBatchProcessing ? "Approving…" : `Approve (${selectedIds.length})`}
                </span>
              </button>
            )}

            {(activeTab === "pending" || activeTab === "verified") && (
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={() => setIsBatchRejectModalOpen(true)}
                className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-rose-400 hover:text-rose-300 border-rose-500/30 disabled:opacity-50"
              >
                <X size={13} />
                <span>Request Revision ({selectedIds.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* BATCH REJECT MODAL */}
      {isBatchRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-rose-500/30 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertCircle size={20} />
                <h3 className="font-bold text-sm text-[var(--text-pure)]">
                  Request Revision for {selectedIds.length} Students
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchRejectModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Select a reason below or specify custom instructions. All {selectedIds.length} students will receive an immediate in-app revision alert.
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase">
                Preset Reasons (Click to apply):
              </span>
              <div className="flex flex-col gap-1.5">
                {CANNED_REASONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBatchRejectNote(preset)}
                    className={`p-2 rounded-xl text-xs text-left transition-colors border cursor-pointer ${
                      batchRejectNote === preset
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                        : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase">
                Custom Reason / Instructions:
              </label>
              <textarea
                value={batchRejectNote}
                onChange={(e) => setBatchRejectNote(e.target.value)}
                placeholder="e.g. Please verify your PRN from the college ERP portal before resubmitting."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-default)] text-xs text-[var(--text-pure)] outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setIsBatchRejectModalOpen(false)}
                className="btn btn-secondary btn-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!batchRejectNote.trim() || isBatchProcessing}
                onClick={handleBatchReject}
                className="btn btn-sm bg-rose-600 hover:bg-rose-500 text-white cursor-pointer disabled:opacity-50"
              >
                {isBatchProcessing ? "Processing…" : `Confirm for ${selectedIds.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROSTER CSV UPLOAD MODAL */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileSpreadsheet size={20} />
                <h3 className="font-bold text-sm text-[var(--text-pure)]">
                  Import College Roster (.CSV)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Upload the official college enrollment list (.csv) containing columns: <code className="font-mono text-emerald-300">PRN, Name, RollNo, Department, AcademicYear</code>. BuildLab will auto-crosscheck submitted PRNs against this roster.
            </p>

            {rosterError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{rosterError}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-[var(--border-subtle)] hover:border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 bg-[var(--bg-surface-elevated)]/40 transition-colors">
              <Upload size={28} className="mx-auto text-[var(--text-tertiary)]" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--text-pure)]">
                  Click to select roster CSV
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Supports .csv exported from ERP or Excel
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleRosterFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary btn-sm cursor-pointer text-xs"
              >
                Choose File
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1"
              >
                <Download size={12} />
                <span>Download Sample Template</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="btn btn-secondary btn-sm text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GITHUB & CONTRIBUTOR EVIDENCE INSPECTOR MODAL */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={getStudentAvatar(inspectingStudent)}
                  alt={inspectingStudent.name}
                  className="w-12 h-12 rounded-full object-cover border border-[var(--border-subtle)]"
                />
                <div>
                  <h3 className="font-bold text-base text-[var(--text-pure)] flex items-center gap-2">
                    {inspectingStudent.name}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {inspectingStudent.role}
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-mono">
                    {inspectingStudent.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Academic Credentials Box */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="font-mono text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">
                Academic Credential Record
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[var(--text-tertiary)] text-[11px]">PRN / ID:</span>
                  <p className="font-mono font-semibold text-emerald-400 text-sm">
                    {inspectingStudent.prnNumber || "Not Provided"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] text-[11px]">Roll Number:</span>
                  <p className="font-mono text-[var(--text-pure)]">
                    {inspectingStudent.rollNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] text-[11px]">Department:</span>
                  <p className="text-[var(--text-pure)]">
                    {inspectingStudent.department || "General"}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] text-[11px]">Academic Year:</span>
                  <p className="font-mono text-[var(--text-pure)]">
                    {inspectingStudent.academicYear || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* GitHub OAuth & Contribution Identity */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch size={13} />
                  Connected GitHub OAuth Evidence
                </span>
                {inspectingStudent.accounts?.[0]?.accountId && (
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    OAuth Authenticated
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">GitHub User ID:</span>
                  <span className="font-mono text-[var(--text-pure)]">
                    {inspectingStudent.accounts?.[0]?.accountId || "OAuth Account"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Contributor Bio:</span>
                  <span className="text-[var(--text-pure)] italic text-right max-w-xs truncate">
                    {inspectingStudent.bio || "No custom bio provided."}
                  </span>
                </div>
              </div>
            </div>

            {/* Roster Crosscheck Evidence */}
            {rosterMap && (
              <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Roster Verification:</span>
                {(() => {
                  const m = getRosterMatch(inspectingStudent);
                  if (!m) return <span className="font-mono text-zinc-500">Not Checked</span>;
                  if (m.status === "MATCH") {
                    return (
                      <span className="text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 size={13} /> 100% Match ({m.rosterName})
                      </span>
                    );
                  }
                  if (m.status === "DISCREPANCY") {
                    return (
                      <span className="text-amber-400 font-mono flex items-center gap-1">
                        <AlertTriangle size={13} /> Name differs: {m.rosterName}
                      </span>
                    );
                  }
                  return <span className="text-rose-400 font-mono">PRN not on uploaded roster</span>;
                })()}
              </div>
            )}

            {/* Reviewer / Decision Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                Status: {getVerificationStatusLabel(inspectingStudent.verificationStatus)}
              </span>

              <div className="flex items-center gap-2">
                {inspectingStudent.verificationStatus === "PENDING_APPROVAL" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleApprove(inspectingStudent.id);
                        setInspectingStudent(null);
                      }}
                      className="btn btn-primary btn-sm flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer text-xs"
                    >
                      <Check size={13} />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingStudentId(inspectingStudent.id);
                        setRejectionNote("");
                        setInspectingStudent(null);
                      }}
                      className="btn btn-secondary btn-sm flex items-center gap-1 text-rose-400 hover:text-rose-300 border-rose-500/30 cursor-pointer text-xs"
                    >
                      <X size={13} />
                      <span>Request Revision</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setInspectingStudent(null)}
                  className="btn btn-secondary btn-sm text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ACTIVITY LOG */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-pure)]">
                    Admin activity log
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Verification decisions and administrative role changes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAuditTrail}
                  disabled={isLoadingAudit}
                  className="btn btn-secondary btn-sm p-1.5 cursor-pointer"
                  title="Refresh audit events"
                >
                  <RefreshCw size={13} className={isLoadingAudit ? "animate-spin" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Audit Events Stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {isLoadingAudit ? (
                <div className="p-12 text-center text-xs text-[var(--text-tertiary)]">
                  <RefreshCw size={16} className="animate-spin mx-auto mb-2 text-emerald-400" />
                  Loading audit log…
                </div>
              ) : auditError ? (
                <div role="alert" className="p-8 text-center text-sm text-rose-300">
                  {auditError}
                </div>
              ) : auditEvents.length === 0 ? (
                <div className="p-12 text-center text-xs text-[var(--text-tertiary)]">
                  No admin activity recorded yet.
                </div>
              ) : (
                auditEvents.map((evt) => {
                  const isApproved = evt.action.includes("APPROVED");
                  const isRoleChange = evt.action === "ROLE_CHANGED";
                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                              isRoleChange
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : isApproved
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {isRoleChange ? "ROLE CHANGED" : evt.action}
                          </span>
                          <span className="font-semibold text-[var(--text-pure)]">
                            {isRoleChange
                              ? evt.metadata?.targetUserName || "Account role updated"
                              : evt.metadata?.studentName || `${evt.metadata?.studentCount || 1} student(s)`}
                          </span>
                          {isRoleChange ? (
                            <span className="text-[11px] text-[var(--text-secondary)]">
                              {evt.metadata?.previousRole || "unknown"} → {evt.metadata?.newRole || "unknown"}
                            </span>
                          ) : evt.metadata?.prnNumber ? (
                            <span className="font-mono text-emerald-400 text-[11px]">
                              ({evt.metadata.prnNumber})
                            </span>
                          ) : null}
                        </div>

                        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                          {formatDisplayDateTime(evt.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                        <span>
                          {isRoleChange ? "Changed by: " : "Reviewed by: "}
                          <strong className="text-[var(--text-pure)]">
                            {isRoleChange
                              ? evt.metadata?.adminName || "Platform admin"
                              : evt.metadata?.reviewedBy || "Campus Admin"}
                          </strong>
                        </span>
                        {evt.metadata?.reason && (
                          <span className={isRoleChange ? "text-[var(--text-secondary)] italic" : "text-rose-400 italic"}>
                            Reason: {evt.metadata.reason}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                Showing latest {auditEvents.length} events
              </span>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="btn btn-secondary btn-sm cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
