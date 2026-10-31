"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  FileText, 
  Hash, 
  Building2,
  Briefcase,
  UserCheck
} from "lucide-react";
import { StudentProfile } from "../types";

interface StudentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onVerificationSubmitted?: (updatedUser: Partial<StudentProfile>) => void;
  actionBlockedReason?: string;
}

// Exactly the 3 departments present at I2IT
const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
] as const;

const ACADEMIC_YEARS = [
  "First Year (FE)",
  "Second Year (SE)",
  "Third Year (TE)",
  "Final Year (BE)",
] as const;

const FACULTY_DESIGNATIONS = [
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Head of Department (HOD)",
  "Visiting / Industry Mentor",
] as const;

export const StudentVerificationModal: React.FC<StudentVerificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onVerificationSubmitted,
  actionBlockedReason = "complete campus verification to proceed",
}) => {
  const currentStatus = currentUser.verificationStatus || (currentUser.collegeVerified ? "VERIFIED" : "UNVERIFIED");

  const [roleType, setRoleType] = useState<"student" | "faculty">(
    currentUser.role === "faculty" ? "faculty" : "student"
  );
  const [fullName, setFullName] = useState(currentUser.name || "");
  const [prnNumber, setPrnNumber] = useState(currentUser.prnNumber || "");
  const [rollNumber, setRollNumber] = useState(currentUser.rollNumber || "");
  const [employeeCode, setEmployeeCode] = useState(currentUser.role === "faculty" ? currentUser.prnNumber || "" : "");
  const [designation, setDesignation] = useState<string>(FACULTY_DESIGNATIONS[0]);
  const [department, setDepartment] = useState<(typeof DEPARTMENTS)[number]>(
    (DEPARTMENTS as readonly string[]).includes(currentUser.department || "")
      ? (currentUser.department as (typeof DEPARTMENTS)[number])
      : DEPARTMENTS[0]
  );
  const [academicYear, setAcademicYear] = useState<(typeof ACADEMIC_YEARS)[number]>(
    (ACADEMIC_YEARS as readonly string[]).includes(currentUser.academicYear || "")
      ? (currentUser.academicYear as (typeof ACADEMIC_YEARS)[number])
      : ACADEMIC_YEARS[2]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      roleType,
      fullName: fullName.trim(),
      department,
      ...(roleType === "faculty"
        ? {
            employeeCode: employeeCode.trim(),
            designation,
          }
        : {
            prnNumber: prnNumber.trim(),
            rollNumber: rollNumber.trim(),
            academicYear,
          }),
    };

    try {
      const res = await fetch("/api/verification/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.message || "Failed to submit verification request.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Verification submitted successfully! An admin will review your details.");
      onVerificationSubmitted?.({
        name: fullName.trim(),
        role: roleType === "faculty" ? "faculty" : "student",
        prnNumber: data.user.prnNumber,
        rollNumber: data.user.rollNumber,
        department: data.user.department,
        academicYear: data.user.academicYear,
        verificationStatus: "PENDING_APPROVAL",
        collegeVerified: false,
      });

      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch {
      setErrorMessage("Network error submitting verification details. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="c-modal-overlay fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="c-modal-card w-full max-w-lg rounded-2xl flex flex-col overflow-hidden my-auto transition-colors animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="c-modal-header px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img 
              src="/icon.webp" 
              alt="BuildLab by I2IT" 
              className="w-8 h-8 rounded-lg object-contain shrink-0 shadow-xs" 
            />
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-[var(--text-pure)] tracking-tight">
                Campus Identity Verification
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                BuildLab by I2IT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="c-modal-body p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Action Context Banner if action blocked */}
          {actionBlockedReason && currentStatus !== "VERIFIED" && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
              <span>
                Please {actionBlockedReason} to proceed with full privileges.
              </span>
            </div>
          )}

          {/* VIEW 1: ALREADY VERIFIED */}
          {currentStatus === "VERIFIED" && (
            <div className="space-y-4 text-center py-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-pure)]">
                  You are Campus Verified
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                  Your campus record is active on BuildLab by I2IT with verified contributor rights.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {currentUser.role === "faculty" ? "Employee Code" : "PRN"}
                  </span>
                  <span className="font-bold text-[var(--text-pure)]">
                    {currentUser.prnNumber || "Verified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Department</span>
                  <span className="text-[var(--text-pure)]">{currentUser.department || "Engineering"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {currentUser.role === "faculty" ? "Role" : "Academic Year"}
                  </span>
                  <span className="text-[var(--text-pure)]">{currentUser.academicYear || "Active Member"}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-sm w-full cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          {/* VIEW 2: PENDING APPROVAL */}
          {currentStatus === "PENDING_APPROVAL" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center animate-pulse">
                <Clock size={26} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10.5px] font-mono font-medium mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Pending Admin Review</span>
                </span>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-pure)] mt-1">
                  Verification Under Review
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto leading-relaxed">
                  Your campus record has been submitted to the BuildLab review desk and is awaiting approval.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Submitted Code</span>
                  <span className="font-bold text-[var(--accent-primary)]">{currentUser.prnNumber || prnNumber || employeeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Department</span>
                  <span className="text-[var(--text-pure)]">{currentUser.department || department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Designation / Year</span>
                  <span className="text-[var(--text-pure)]">{currentUser.academicYear || academicYear}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm w-full cursor-pointer"
              >
                Close & Continue
              </button>
            </div>
          )}

          {/* VIEW 3: UNVERIFIED OR REJECTED (FORM) */}
          {(currentStatus === "UNVERIFIED" || currentStatus === "REJECTED") && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {currentStatus === "REJECTED" && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <AlertCircle size={14} />
                    <span>Revision Requested by Admin</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">
                    {currentUser.rejectionReason || "Details could not be verified against college records. Please review and re-submit."}
                  </p>
                </div>
              )}

              {/* Role Toggle: Student vs Faculty */}
              <div className="grid grid-cols-2 p-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setRoleType("student")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    roleType === "student"
                      ? "bg-[var(--bg-surface)] text-[var(--text-pure)] shadow-xs font-semibold border border-[var(--border-subtle)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <GraduationCap size={14} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleType("faculty")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    roleType === "faculty"
                      ? "bg-[var(--bg-surface)] text-[var(--text-pure)] shadow-xs font-semibold border border-[var(--border-subtle)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <Briefcase size={14} />
                  <span>Faculty / Mentor</span>
                </button>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <FileText size={13} className="text-[var(--accent-primary)]" />
                  <span>Full Name</span>
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="c-modal-input w-full h-9 px-3 rounded-xl text-xs text-[var(--text-pure)] outline-none focus:border-[var(--accent-primary)] transition-all"
                />
              </div>

              {/* Branch / Department: ONLY 3 DEPARTMENTS */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                  <Building2 size={13} className="text-[var(--accent-primary)]" />
                  <span>Department</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as (typeof DEPARTMENTS)[number])}
                  className="c-modal-input w-full h-9 px-3 rounded-xl text-xs text-[var(--text-pure)] outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* STUDENT FIELDS */}
              {roleType === "student" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <Hash size={13} className="text-[var(--accent-primary)]" />
                        <span>PRN Number</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={prnNumber}
                        onChange={(e) => setPrnNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 72234012A"
                        className="c-modal-input w-full h-9 px-3 rounded-xl text-xs text-[var(--text-pure)] font-mono uppercase outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <GraduationCap size={13} className="text-[var(--accent-primary)]" />
                        <span>Roll Number</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. TE-IT-42"
                        className="c-modal-input w-full h-9 px-3 rounded-xl text-xs text-[var(--text-pure)] font-mono outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-[var(--accent-primary)]" />
                      <span>Academic Year</span>
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value as (typeof ACADEMIC_YEARS)[number])}
                      className="c-modal-input w-full h-9 px-3 rounded-xl text-xs text-[var(--text-pure)] outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                    >
                      {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* FACULTY FIELDS */}
              {roleType === "faculty" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <Hash size={13} className="text-[var(--accent-primary)]" />
                        <span>Faculty Employee Code</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                        placeholder="e.g. I2IT-FAC-102"
                        className="c-modal-input w-full h-9 px-3 rounded-xl text-xs text-[var(--text-pure)] font-mono uppercase outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        <Briefcase size={13} className="text-[var(--accent-primary)]" />
                        <span>Designation</span>
                      </label>
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="c-modal-input w-full h-9 px-3 rounded-xl text-xs text-[var(--text-pure)] outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                      >
                        {FACULTY_DESIGNATIONS.map((d) => (
                          <option key={d} value={d} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Error & Success Feedback */}
              {errorMessage && (
                <p role="alert" className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p role="status" className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{successMessage}</span>
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary btn-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (roleType === "student" && (!prnNumber.trim() || !rollNumber.trim())) ||
                    (roleType === "faculty" && !employeeCode.trim())
                  }
                  className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Submitting…" : "Submit Verification"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
