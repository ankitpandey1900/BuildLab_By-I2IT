import React, { useState } from 'react';
import { Project } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Cloud, 
  Cpu, 
  Users, 
  GraduationCap,
  Send,
  Sparkles,
  ExternalLink,
  Plus,
  Star,
  Award,
  Check,
  FolderGit2,
  ChevronRight,
  Clock,
  Globe,
  GitPullRequest,
  Code2,
  BookOpen
} from 'lucide-react';
import { TechBadge } from './ui/TechBadge';

interface SupportReviewerWorkspaceProps {
  projects: Project[];
  currentUsername: string;
  currentUserId?: string;
  onApplySupport: (project: Project) => void;
  onReviewDecision: (projectId: string, decision: 'approved' | 'changes_requested' | 'declined', notes: string) => void;
  onSelectProject?: (project: Project) => void;
  onOpenCreateProject?: () => void;
}

export const SupportReviewerWorkspace: React.FC<SupportReviewerWorkspaceProps> = ({
  projects,
  currentUsername,
  currentUserId,
  onApplySupport,
  onReviewDecision,
  onSelectProject,
  onOpenCreateProject
}) => {
  const [activeMode, setActiveMode] = useState<'student' | 'reviewer'>('student');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.find(p => p.supportApplication)?.id || projects[0]?.id || ''
  );
  const [notes, setNotes] = useState('');
  const [noConflictDeclared, setNoConflictDeclared] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Filter projects owned by current user
  const userProjects = projects.filter(
    p => (currentUserId && p.owner.id === currentUserId) || p.owner.username === currentUsername
  );
  const communitySupportedProjects = projects.filter(p => p.track === 'community_supported');

  const handleDecision = (decision: 'approved' | 'changes_requested' | 'declined') => {
    if (!selectedProject || !noConflictDeclared) return;
    onReviewDecision(selectedProject.id, decision, notes || 'Review completed per standard criteria.');
    setNotes('');
    setNoConflictDeclared(false);
  };

  const handleStudentApply = (p: Project) => {
    onApplySupport(p);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      
      {/* 1. Header & Navigation */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
              <Sparkles size={12} className="text-blue-400" />
              <span>Campus Grant Program · 2026 Cohort</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-pure)]">
              {activeMode === 'student' ? 'Campus Sponsorship & Grants' : 'Community Support Review Desk'}
            </h1>
            
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {activeMode === 'student'
                ? 'Official college backing for student open-source repositories: GitHub Organization transfer, funded cloud deployments, and faculty mentorship.'
                : 'Assess candidate repositories against the campus governance rubric to grant formal college organization backing and resources.'}
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs shrink-0 self-start md:self-center shadow-inner">
            <button
              type="button"
              onClick={() => setActiveMode('student')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'student'
                  ? 'bg-blue-600 text-white shadow-md font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-pure)]'
              }`}
            >
              <GraduationCap size={15} />
              <span>Student Hub</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('reviewer')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'reviewer'
                  ? 'bg-blue-600 text-white shadow-md font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-pure)]'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Review Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: STUDENT VIEW                                           */}
      {/* ============================================================== */}
      {activeMode === 'student' && (
        <div className="space-y-7">
          
          {/* 2. Asymmetrical Resource & Grants Program Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Major Highlight: College Org Admission (3 cols) */}
            <div className="md:col-span-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 flex flex-col justify-between shadow-sm space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                    @college-dev GitHub Org
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-pure)]">
                    Official Institutional Namespace & Provenance
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5">
                    Accepted repositories transfer under the official college GitHub organization. Gain verified campus maintainer attributions, institutional credibility for resumes, and official subdomain routing (<span className="text-blue-400 font-mono">project.isquareit.edu.in</span>).
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center gap-3 flex-wrap text-xs text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[11px]">
                  <Globe size={12} className="text-emerald-400" />
                  <span>College DNS</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[11px]">
                  <Award size={12} className="text-amber-400" />
                  <span>Capstone Credit</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-[11px]">
                  <CheckCircle2 size={12} className="text-blue-400" />
                  <span>Verified Badging</span>
                </span>
              </div>
            </div>

            {/* Minor Highlights: Cloud, Hardware & Advisory (2 cols) */}
            <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
              
              {/* Perk A: Cloud Credits */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud size={16} className="text-emerald-400" />
                    <h4 className="text-xs font-bold text-[var(--text-pure)]">Cloud & Hosting Grants</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                    $500 Value
                  </span>
                </div>
                <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                  Deployment vouchers for Supabase PostgreSQL database pooling, Vercel edge staging, and AWS production hosting.
                </p>
              </div>

              {/* Perk B: Hardware Lab */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-amber-400" />
                    <h4 className="text-xs font-bold text-[var(--text-pure)]">Robotics & IoT Lab Priority</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                    Lab Keys
                  </span>
                </div>
                <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                  Direct workbench access to ESP32 microcontrollers, logic analyzers, sensor testbeds, and 3D printing equipment.
                </p>
              </div>

              {/* Perk C: Advisory */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-400" />
                    <h4 className="text-xs font-bold text-[var(--text-pure)]">Faculty & Alumni Advisory</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold">
                    Bi-Weekly
                  </span>
                </div>
                <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                  Code reviews, system architecture consulting, and direct career guidance from computer engineering faculty and alumni.
                </p>
              </div>

            </div>

          </div>

          {/* 3. Section: Your Repositories & Sponsorship Status */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[var(--text-pure)]">
                    Your Repositories & Sponsorship Status
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    {userProjects.length}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Track backing requests or submit your repository for college community endorsement.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-[var(--text-tertiary)] font-mono hidden sm:inline">
                  @{currentUsername}
                </span>
                {onOpenCreateProject && (
                  <button
                    onClick={onOpenCreateProject}
                    className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>New Project</span>
                  </button>
                )}
              </div>
            </div>

            {userProjects.length > 0 ? (
              <div className="space-y-3">
                {userProjects.map(p => {
                  const hasApp = !!p.supportApplication;
                  const status = p.supportApplication?.status || 'independent';
                  const isApproved = p.track === 'community_supported' || status === 'approved';

                  return (
                    <div 
                      key={p.id}
                      className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <FolderGit2 size={15} className="text-blue-400 shrink-0" />
                            <h4 
                              onClick={() => onSelectProject?.(p)}
                              className="text-sm font-bold text-[var(--text-pure)] hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              {p.name}
                            </h4>
                          </div>

                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                              : hasApp && status === 'submitted'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                              : hasApp && status === 'changes_requested'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                          }`}>
                            {isApproved ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span>College Backed</span>
                              </>
                            ) : hasApp ? (
                              <>
                                <Clock size={11} />
                                <span>Status: {status.replace('_', ' ')}</span>
                              </>
                            ) : (
                              <span>Independent</span>
                            )}
                          </span>

                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
                            {p.maturity}
                          </span>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] line-clamp-1 max-w-2xl">
                          {p.summary || p.problemStatement}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {p.skills.slice(0, 4).map(sk => (
                            <TechBadge key={sk} name={sk} />
                          ))}
                          {p.verifiedCommitsCount > 0 && (
                            <span className="text-[10.5px] font-mono text-cyan-400 flex items-center gap-1 ml-1">
                              <CheckCircle2 size={11} />
                              <span>{p.verifiedCommitsCount} verified commits</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                        {isApproved ? (
                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-end">
                              <Award size={14} />
                              <span>Active Sponsorship</span>
                            </span>
                            <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono block">
                              Assigned to @college-dev Org
                            </span>
                          </div>
                        ) : hasApp ? (
                          <div className="text-right bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg">
                            <span className="text-xs font-semibold text-amber-400 block">
                              Under Review
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)] block">
                              Committee SLA ~48h
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStudentApply(p)}
                            className="btn btn-primary btn-sm text-xs flex items-center gap-1.5 shadow-sm group cursor-pointer"
                          >
                            <Send size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            <span>Apply for Sponsorship</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectProject?.(p)}
                          className="btn btn-secondary btn-sm text-xs p-2 text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
                          title="View project details"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Clean Empty State */
              <div className="rounded-xl border border-dashed border-[var(--border-default)] p-8 text-center space-y-3 bg-[var(--bg-surface)]">
                <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FolderGit2 size={20} />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-sm font-bold text-[var(--text-pure)]">
                    No Published Repositories
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Publish your project to apply for formal college organization sponsorship, cloud hosting credits, and faculty mentorship.
                  </p>
                </div>
                {onOpenCreateProject && (
                  <button
                    onClick={onOpenCreateProject}
                    className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1.5 shadow-sm mt-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Publish Project</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4. Section: Sponsored Showcase OR Committee Evaluation Standards */}
          {communitySupportedProjects.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <h3 className="text-sm font-bold text-[var(--text-pure)] tracking-tight">
                    Sponsored Campus Repositories ({communitySupportedProjects.length})
                  </h3>
                </div>
                <span className="text-xs text-[var(--text-tertiary)] font-mono">
                  Official College Registry
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communitySupportedProjects.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProject?.(p)}
                    className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] space-y-3 shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-pure)] hover:text-blue-400 transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                          {p.summary}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0 flex items-center gap-1">
                        <Check size={10} />
                        <span>Backed</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.skills.slice(0, 4).map(skill => (
                        <TechBadge key={skill} name={skill} />
                      ))}
                    </div>

                    <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                      <span className="font-mono text-[var(--text-secondary)]">@{p.owner.username}</span>
                      <span className="text-blue-400 font-mono text-[11px] flex items-center gap-1">
                        <span>Inspect Project</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Program Evaluation Standard & Eligibility Guide */
            <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-[var(--text-pure)]">
                    Sponsorship Eligibility & Governance Standards
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                  Evaluation Rubric
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-pure)]">
                    <Code2 size={14} className="text-blue-400" />
                    <span>1. Permissive License</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Repository must carry an OSI-approved license (MIT, Apache-2.0, BSD) allowing campus collaboration and educational forkability.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-pure)]">
                    <GitPullRequest size={14} className="text-emerald-400" />
                    <span>2. Active Development</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Minimum 3 cryptographically verifiable GitHub commits and working build scripts or functional prototype demonstrations.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-pure)]">
                    <FileText size={14} className="text-amber-400" />
                    <span>3. Architecture README</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Complete documentation containing problem statement, system design diagram, environment variables, and local setup commands.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-pure)]">
                    <Users size={14} className="text-purple-400" />
                    <span>4. Student Maintenance</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Led by at least one enrolled college engineer committed to mentoring peer contributors and reviewing community pull requests.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: REVIEW COMMITTEE DESK (For Faculty / Reviewers)       */}
      {/* ============================================================== */}
      {activeMode === 'reviewer' && (
        <div className="space-y-6">
          
          {/* Admin Context Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
            <ShieldCheck size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-semibold block text-amber-300">Faculty & Review Board Workspace</strong>
              <span className="text-[11.5px] leading-relaxed text-amber-200/80">
                You are evaluating candidate applications against the official college engineering rubric. Approved repositories receive GitHub Organization admission, domain routing, and cloud infrastructure grants.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Queue (1 col) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                <span>Queue ({projects.length})</span>
                <span className="font-mono text-[10px] text-blue-400">Active</span>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {projects.map(p => {
                  const hasApp = !!p.supportApplication;
                  const status = p.supportApplication?.status || 'independent';
                  const isSelected = p.id === selectedProjectId;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[var(--bg-surface-elevated)] border-blue-500 shadow-sm' 
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-[var(--text-pure)] truncate">
                          {p.name}
                        </span>
                        <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full capitalize shrink-0 ${
                          status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : status === 'submitted'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {hasApp ? status.replace('_', ' ') : 'independent'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)] flex items-center justify-between font-mono">
                        <span>@{p.owner.username}</span>
                        <span>{p.maturity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Review Details (2 cols) */}
            <div className="md:col-span-2">
              {selectedProject ? (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[var(--text-pure)]">
                          {selectedProject.name}
                        </h2>
                        {selectedProject.repoUrl && (
                          <a
                            href={selectedProject.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {selectedProject.summary}
                      </p>
                    </div>

                    <span className="badge-tag shrink-0 capitalize">
                      {selectedProject.track.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Application Content */}
                  {selectedProject.supportApplication ? (
                    <div className="space-y-5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                          <span className="text-[var(--text-tertiary)] block text-[11px] font-mono">Target Audience:</span>
                          <span className="text-[var(--text-pure)] font-semibold">
                            {selectedProject.supportApplication.targetAudience}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                          <span className="text-[var(--text-tertiary)] block text-[11px] font-mono">Next Milestone:</span>
                          <span className="text-[var(--text-pure)] font-semibold">
                            {selectedProject.supportApplication.nextMilestone}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[var(--text-tertiary)] block text-[11px] font-mono">Requested Resources:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {selectedProject.supportApplication.requestedSupport.map((req, i) => (
                            <span key={i} className="badge-tag text-xs py-1 px-2.5">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Standard Assessment Rubric */}
                      <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2.5">
                        <span className="font-bold text-[var(--text-pure)] text-xs block">
                          Standard Committee Evaluation Rubric
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11.5px] text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <Check size={13} />
                            <span>Active campus maintainer</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <Check size={13} />
                            <span>Campus engineering relevance</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <Check size={13} />
                            <span>Concrete deployment path</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <Check size={13} />
                            <span>Verified repository commits</span>
                          </div>
                        </div>
                      </div>

                      {/* Conflict of Interest Declaration */}
                      <div className="pt-3 border-t border-[var(--border-subtle)]">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--text-primary)]">
                          <input 
                            type="checkbox"
                            checked={noConflictDeclared}
                            onChange={(e) => setNoConflictDeclared(e.target.checked)}
                            className="mt-0.5 rounded accent-blue-500"
                          />
                          <span className="leading-snug text-[var(--text-secondary)]">
                            I declare no conflict of interest (I am not a direct maintainer, applicant, or contributor to this repository).
                          </span>
                        </label>
                      </div>

                      {/* Review Notes */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-medium block">
                          Decision Rationale & Feedback:
                        </label>
                        <textarea
                          rows={3}
                          className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl p-3 text-xs text-[var(--text-pure)] outline-none focus:border-blue-500 transition-colors resize-none"
                          placeholder="Provide specific architecture feedback or prerequisites for the student maintainer..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      {/* Decision Action Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          className="btn btn-secondary btn-sm text-xs cursor-pointer"
                          disabled={!noConflictDeclared}
                          onClick={() => handleDecision('changes_requested')}
                        >
                          <AlertCircle size={13} className="text-amber-400" />
                          <span>Request Changes</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-sm text-xs cursor-pointer text-rose-400 hover:text-rose-300"
                          disabled={!noConflictDeclared}
                          onClick={() => handleDecision('declined')}
                        >
                          <XCircle size={13} />
                          <span>Decline</span>
                        </button>

                        <button
                          className="btn btn-primary btn-sm text-xs cursor-pointer shadow-md"
                          disabled={!noConflictDeclared}
                          onClick={() => handleDecision('approved')}
                        >
                          <CheckCircle2 size={13} className="text-white" />
                          <span>Approve Sponsorship</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs text-[var(--text-secondary)] space-y-2">
                      <FileText size={28} className="mx-auto text-[var(--text-tertiary)]" />
                      <p>This project has not submitted a formal Community Sponsorship application yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl">
                  Select a project from the left queue to review.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
