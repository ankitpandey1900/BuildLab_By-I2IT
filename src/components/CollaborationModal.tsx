import React, { useState, useMemo } from 'react';
import { Project, StudentProfile } from '../types';
import { X, Send, Target, FileCode, CheckCircle2, RotateCcw } from 'lucide-react';

interface CollaborationModalProps {
  project: Project;
  currentUser: StudentProfile;
  initialRole?: string;
  initialProblemTitle?: string;
  onClose: () => void;
  onSubmit: (role: string, message: string, targetIssueTitle?: string, weeklyHours?: number) => void | Promise<any>;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({
  project,
  currentUser,
  initialRole,
  initialProblemTitle,
  onClose,
  onSubmit
}) => {
  // Extract all listed problems across roles
  const allProjectProblems = useMemo(() => {
    const list: {
      id: string;
      title: string;
      description?: string;
      difficulty?: string;
      suggestedFiles?: string[];
      role: string;
    }[] = [];
    project.openRoles.forEach(r => {
      (r.problems || []).forEach(p => {
        list.push({
          id: p.id,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          suggestedFiles: p.suggestedFiles,
          role: r.role
        });
      });
    });
    return list;
  }, [project]);

  // Find initial problem object if provided
  const initialProblemObj = useMemo(() => {
    if (!initialProblemTitle) return null;
    return allProjectProblems.find(
      p => p.title.toLowerCase() === initialProblemTitle.toLowerCase() || p.title === initialProblemTitle
    ) || null;
  }, [allProjectProblems, initialProblemTitle]);

  const [targetProblem, setTargetProblem] = useState(initialProblemTitle || '');
  const [isChangingTask, setIsChangingTask] = useState(false);

  const [selectedRole, setSelectedRole] = useState(() => {
    if (initialProblemObj) return initialProblemObj.role;
    if (initialRole) return initialRole;
    return project.openRoles[0]?.role || 'General Contributor';
  });

  const [message, setMessage] = useState(() => {
    if (initialProblemTitle) {
      return `Hi @${project.owner.username}, I would like to tackle the task: "${initialProblemTitle}". Here is my proposed technical approach:`;
    }
    if (initialRole) {
      return `Hi @${project.owner.username}, I would like to apply for the "${initialRole}" role on ${project.name}. Here is my background and how I can contribute:`;
    }
    return '';
  });
  const [hoursPerWeek, setHoursPerWeek] = useState(currentUser.weeklyAvailabilityHours.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Current claimed problem details (if one is actively locked in)
  const activeClaimedProblem = useMemo(() => {
    if (!targetProblem) return null;
    return allProjectProblems.find(p => p.title === targetProblem) || null;
  }, [allProjectProblems, targetProblem]);

  // Current matched open role object
  const activeOpenRoleObj = useMemo(() => {
    return project.openRoles.find(r => r.role.toLowerCase() === selectedRole.toLowerCase()) || null;
  }, [project.openRoles, selectedRole]);

  const isLockedTaskMode = Boolean(targetProblem && !isChangingTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = message.trim();
    if (trimmed.length < 20) {
      setFormError('Please provide at least 20 characters in your pitch.');
      return;
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 4) {
      setFormError('Please provide a more descriptive collaboration message (at least 4 words).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(
        selectedRole,
        trimmed,
        targetProblem || undefined,
        Number(hoursPerWeek) || undefined
      );
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProblemChange = (val: string) => {
    setTargetProblem(val);
    const match = allProjectProblems.find(p => p.title === val);
    if (match) {
      setSelectedRole(match.role);
    }
  };

  const handleRevertToOriginal = () => {
    if (initialProblemTitle) {
      setTargetProblem(initialProblemTitle);
      if (initialProblemObj) {
        setSelectedRole(initialProblemObj.role);
      }
      setIsChangingTask(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-clean" onClick={(e) => e.stopPropagation()}>
        <div className="modal-gh-header">
          <div className="flex flex-col">
            <div className="modal-gh-title flex items-center gap-2">
              <span>
                {isLockedTaskMode
                  ? 'Claim Task & Pitch Solution'
                  : initialRole
                  ? `Apply for ${selectedRole} Role`
                  : 'Request to collaborate'}
              </span>
              {isLockedTaskMode ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 font-mono font-medium">
                  Focused Task Claim
                </span>
              ) : initialRole ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-mono font-medium">
                  Role Application
                </span>
              ) : null}
            </div>
            <span className="text-xs text-[var(--text-tertiary)] mt-0.5 font-mono">
              Target project: {project.name}
            </span>
          </div>
          <button 
            type="button" 
            className="btn btn-ghost btn-sm text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer" 
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-gh-body">
            {/* Applicant Identity Card */}
            <div className="bg-[var(--code-bg)] border border-[var(--border-subtle)] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs text-[var(--text-primary)] font-medium">
                  Applying as @{currentUser.username}
                </span>
              </div>
              <span className="badge-tag">Verified student</span>
            </div>

            {/* SCENARIO A: User is claiming a specific task (Clean Focus Card - No Open Select) */}
            {isLockedTaskMode ? (
              <div className="rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-500 font-mono">
                    <Target size={13} className="text-amber-500" />
                    <span>Claiming Role Task</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingTask(true)}
                    className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-pure)] underline cursor-pointer transition-colors"
                  >
                    Switch or clear task
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeClaimedProblem?.id && (
                      <span className="font-mono text-[10px] text-[var(--text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                        #{activeClaimedProblem.id.replace('prob_', '')}
                      </span>
                    )}
                    <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-pure)] leading-snug">
                      {activeClaimedProblem?.title || targetProblem}
                    </h4>
                  </div>
                  {activeClaimedProblem?.description && (
                    <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                      {activeClaimedProblem.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[var(--border-subtle)]/70 text-[11px]">
                  <span className="badge-tag">
                    Role: {selectedRole}
                  </span>
                  {activeClaimedProblem?.difficulty && (
                    <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      activeClaimedProblem.difficulty === 'beginner' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                        : activeClaimedProblem.difficulty === 'intermediate'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                        : 'bg-violet-500/10 text-violet-500 border border-violet-500/25'
                    }`}>
                      {activeClaimedProblem.difficulty === 'beginner' ? 'Starter Task' : activeClaimedProblem.difficulty}
                    </span>
                  )}
                  {activeClaimedProblem?.suggestedFiles && activeClaimedProblem.suggestedFiles.length > 0 && (
                    <div className="flex items-center gap-1 text-[10.5px] text-[var(--text-tertiary)] font-mono">
                      <FileCode size={11} />
                      <span>{activeClaimedProblem.suggestedFiles.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SCENARIO B: General Collaboration or Changing Task */
              <>
                {allProjectProblems.length > 0 && (
                  <div className="form-group-clean">
                    <label className="form-label-clean flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Target size={12} className="text-[var(--accent-primary)]" />
                        <span>Target Problem / Task to Solve</span>
                      </span>
                      {initialProblemTitle && (
                        <button
                          type="button"
                          onClick={handleRevertToOriginal}
                          className="text-[11px] text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw size={10} />
                          <span>Revert to original task</span>
                        </button>
                      )}
                    </label>
                    <select
                      className="select-clean"
                      value={targetProblem}
                      onChange={(e) => handleSelectProblemChange(e.target.value)}
                    >
                      <option value="">General Project Contribution (No specific issue)</option>
                      {allProjectProblems.map((prob) => (
                        <option key={prob.id} value={prob.title}>
                          [{prob.role}] #{prob.id.replace('prob_', '')}: {prob.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group-clean">
                  <label className="form-label-clean">Desired Role</label>
                  <select 
                    className="select-clean"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {project.openRoles.map((r, i) => (
                      <option key={i} value={r.role}>
                        {r.role} ({r.count} open)
                      </option>
                    ))}
                    <option value="General Contributor">General Contributor</option>
                    <option value="Technical Mentor">Technical Mentor</option>
                  </select>
                </div>
                {activeOpenRoleObj && (
                  <div className="rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-3 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-primary)] font-mono">
                        Role Overview
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-medium">
                        {activeOpenRoleObj.count} spot{activeOpenRoleObj.count > 1 ? 's' : ''} open
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {activeOpenRoleObj.description}
                    </p>
                    {activeOpenRoleObj.lookingForSkills && activeOpenRoleObj.lookingForSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--border-subtle)]/70 text-[11px]">
                        <span className="text-[11px] text-[var(--text-tertiary)] font-medium">Looking for:</span>
                        {activeOpenRoleObj.lookingForSkills.map((sk, sIdx) => (
                          <span key={sIdx} className="badge-tag">{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Weekly Availability */}
            <div className="form-group-clean">
              <label className="form-label-clean">Weekly Availability (Hours)</label>
              <input
                type="number"
                className="input-clean"
                min="1"
                max="40"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
              />
            </div>

            {/* Message / Technical Pitch */}
            <div className="form-group-clean">
              <label className="form-label-clean">
                {isLockedTaskMode ? 'Technical Approach & Implementation Plan' : 'Introduction & Relevant Background'}
              </label>
              <textarea
                className="textarea-clean"
                rows={4}
                placeholder={
                  isLockedTaskMode
                    ? "Detail your technical approach, target files to modify, edge cases to consider, and your estimated timeframe..."
                    : "Mention relevant coursework, past projects, or specific components you would like to work on..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] pt-1">
                <span>
                  {message.trim().length < 20
                    ? `${20 - message.trim().length} more characters needed`
                    : message.trim().split(/\s+/).filter(Boolean).length < 4
                    ? 'Please enter at least 4 words'
                    : '✓ Ready to submit'}
                </span>
                <span className="font-mono">{message.length}/2000</span>
              </div>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs">
                {formError}
              </div>
            )}
          </div>

          <div className="modal-gh-footer">
            <button type="button" className="btn btn-secondary btn-sm cursor-pointer" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer" 
              disabled={isSubmitting || message.trim().length < 20}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : isLockedTaskMode ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>Submit Task Pitch</span>
                </>
              ) : initialRole ? (
                <>
                  <Send size={13} />
                  <span>Apply for Role</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Submit request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
