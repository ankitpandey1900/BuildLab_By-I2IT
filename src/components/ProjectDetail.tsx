import React, { useState, useRef } from 'react';
import { Project, ProjectReadme, StudentProfile } from '../types';
import { 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Users, 
  Terminal, 
  AlertCircle,
  GitBranch,
  Calendar,
  CheckCircle2,
  FileCode2,
  Paintbrush,
  KeyRound,
  Database,
  Code2,
  Star,
  FileText,
  Copy,
  Check,
  BookOpen,
  Upload,
  RefreshCw,
  Edit3,
  Archive,
  Plus,
  X,
  MessageSquare
} from 'lucide-react';
import { TechBadge } from './ui/TechBadge';
import { MarkdownRenderer } from './ui/MarkdownRenderer';
import { getMaturityColor } from '../lib/utils';
import { fetchReadmeFromGithub, readUploadedFileAsText, parseReadmeMarkdown } from '../lib/readmeService';

interface ProjectDetailProps {
  project: Project;
  currentUser?: StudentProfile;
  onBack: () => void;
  onRequestCollab: (project: Project, role?: string, problemTitle?: string) => void;
  onApplySupport: (project: Project) => void;
  onRequestHandover: (project: Project) => void;
  onUpdateReadme?: (project: Project, updatedReadme: ProjectReadme) => void;
  onUpdateProject?: (projectId: string, updateData: Partial<Project>) => Promise<void>;
  onArchiveProject?: (projectId: string) => Promise<void>;
  onCreateTask?: (projectId: string, task: { title: string; description: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; role?: string; suggestedFiles?: string[] }) => Promise<void>;
  onUpdateTaskStatus?: (projectId: string, taskId: string, newStatus: 'open' | 'in_progress' | 'resolved') => Promise<void>;
  onOpenMentorChat?: (project: Project) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  currentUser,
  onBack,
  onRequestCollab,
  onApplySupport,
  onRequestHandover,
  onUpdateReadme,
  onUpdateProject,
  onArchiveProject,
  onCreateTask,
  onUpdateTaskStatus,
  onOpenMentorChat
}) => {
  const isOwner = currentUser?.id === project.owner.id || currentUser?.username === project.owner.username;
  const isMaintainer = isOwner || Boolean(project.members?.some(m => m.userId === currentUser?.id && m.role === 'maintainer'));

  const [activeTab, setActiveTab] = useState<'roles' | 'readme' | 'setup' | 'support'>('roles');
  const [problemDifficultyFilter, setProblemDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate'>('all');
  const [readmeViewMode, setReadmeViewMode] = useState<'preview' | 'raw'>('preview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncingReadme, setIsSyncingReadme] = useState(false);
  const [readmeSyncMessage, setReadmeSyncMessage] = useState<string | null>(null);
  const readmeFileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(project.name);
  const [editSummary, setEditSummary] = useState(project.summary);
  const [editProblem, setEditProblem] = useState(project.problemStatement);
  const [editMaturity, setEditMaturity] = useState(project.maturity);
  const [editVisibility, setEditVisibility] = useState(project.visibility || 'college');
  const [editRepoUrl, setEditRepoUrl] = useState(project.repoUrl || '');
  const [editLicense, setEditLicense] = useState(project.license || 'MIT');
  const [editSkills, setEditSkills] = useState(project.skills.join(', '));
  const [editRoles, setEditRoles] = useState(project.openRoles.map(r => r.role).join(', '));
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDifficulty, setTaskDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [taskRole, setTaskRole] = useState('');
  const [taskFiles, setTaskFiles] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);

  const totalProblemsCount = project.openRoles.reduce((acc, r) => acc + (r.problems?.length || 0), 0);

  const handleSyncGithubReadme = async () => {
    if (!project.repoUrl) return;
    setIsSyncingReadme(true);
    setReadmeSyncMessage(null);
    try {
      const res = await fetchReadmeFromGithub(project.repoUrl);
      const parsed = parseReadmeMarkdown(res.markdown, project.name, 'github_auto', 'README.md', res.fileSize);
      onUpdateReadme?.(project, parsed);
      setReadmeSyncMessage(`Synced from GitHub (${res.fileSize})`);
      setTimeout(() => setReadmeSyncMessage(null), 3500);
    } catch (err: any) {
      setReadmeSyncMessage(err.message || 'Failed to sync README from GitHub');
      setTimeout(() => setReadmeSyncMessage(null), 4000);
    } finally {
      setIsSyncingReadme(false);
    }
  };

  const handleUploadReadmeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await readUploadedFileAsText(file);
      const parsed = parseReadmeMarkdown(res.markdown, project.name, 'file_upload', res.fileName, res.fileSize);
      onUpdateReadme?.(project, parsed);
      setReadmeSyncMessage(`Uploaded "${res.fileName}" (${res.fileSize})`);
      setTimeout(() => setReadmeSyncMessage(null), 3500);
    } catch (err: any) {
      setReadmeSyncMessage(err.message || 'Failed to upload README file');
      setTimeout(() => setReadmeSyncMessage(null), 4000);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const getRoleIcon = (category?: string) => {
    switch (category) {
      case 'ui_design':
        return <Paintbrush size={14} className="text-pink-400" />;
      case 'auth':
        return <KeyRound size={14} className="text-amber-400" />;
      case 'database':
        return <Database size={14} className="text-indigo-400" />;
      default:
        return <Code2 size={14} className="text-sky-400" />;
    }
  };

  // Fallback markdown if project has no customized rawMarkdown
  const defaultRawMarkdown = project.readme?.rawMarkdown || `# ${project.name}

> ${project.summary}

## 🎯 Campus Problem
${project.problemStatement}

## 🛠️ Stack & Architecture
${(project.currentStack || project.skills).map(s => `- ${s}`).join('\n')}

## 🚀 Setup Guide
\`\`\`bash
${project.setupGuide || '# Clone repository\ngit clone ' + (project.repoUrl || 'https://github.com/campus/' + project.slug) + '\npnpm install\npnpm dev'}
\`\`\`
`;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Back Navigation */}
      <div>
        <button 
          className="btn btn-ghost btn-sm text-[var(--text-secondary)] hover:text-[var(--text-pure)] -ml-2 text-xs flex items-center gap-1.5 cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft size={13} />
          <span>Back to directory</span>
        </button>
      </div>

      {/* Project Header Banner */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-pure)]">
                {project.name}
              </h1>
              {project.track === 'community_supported' ? (
                <span className="badge-tag curated flex items-center gap-1.5">
                  <Users size={11} />
                  <span>Community Supported</span>
                </span>
              ) : (
                <span className="badge-tag">
                  Independent
                </span>
              )}
              {(() => {
                const mat = getMaturityColor(project.maturity);
                return (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] capitalize text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${mat.dot}`} />
                    <span>{project.maturity}</span>
                  </span>
                );
              })()}
              {project.visibility && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] font-medium">
                  {project.visibility === 'college' ? 'Campus Only' : project.visibility === 'public' ? 'Public' : 'Private'}
                </span>
              )}
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              {project.summary}
            </p>

            {/* Social Proof Strip */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-subtle)]/60 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                  {(project.contributorAvatars || [
                    project.owner.avatarUrl,
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
                  ]).slice(0, 4).map((avatarUrl, idx) => (
                    <img
                      key={idx}
                      src={avatarUrl}
                      alt="Contributor"
                      className="w-5 h-5 rounded-full ring-2 ring-[var(--bg-surface)] object-cover shrink-0"
                    />
                  ))}
                </div>
                <span className="text-[12px] text-[var(--text-secondary)] font-medium">
                  {project.collaboratorsCount} contributors
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] px-2.5 py-0.5 rounded-md border border-[var(--border-subtle)]">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span>{project.starsCount ?? 76} stars</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-tertiary)] font-mono">
                <GitBranch size={12} />
                <span>{project.verifiedCommitsCount} verified commits</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start flex-wrap">
            {project.repoUrl && (
              <a 
                href={project.repoUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary text-xs"
              >
                <ExternalLink size={13} />
                <span>GitHub repo</span>
              </a>
            )}

            {isMaintainer && (
              <>
                <button 
                  type="button"
                  className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer" 
                  onClick={() => setIsEditOpen(true)}
                  title="Edit project details"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button 
                  type="button"
                  className="btn btn-ghost text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer" 
                  onClick={() => setIsArchiveOpen(true)}
                  title="Archive project"
                >
                  <Archive size={13} />
                  <span>Archive</span>
                </button>
              </>
            )}

            {!isOwner && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer text-indigo-400 hover:text-indigo-300"
                  onClick={() => onOpenMentorChat?.(project)}
                  title="1:1 Mentor Chat with maintainer"
                >
                  <MessageSquare size={13} />
                  <span>1:1 Mentor Chat</span>
                </button>
                <button 
                  className="btn btn-primary text-xs" 
                  onClick={() => onRequestCollab(project)}
                >
                  <Users size={13} />
                  <span>Join team</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* GitHub / Linear Style Tab Navigation: High Contrast, Refined, Zero Clash */}
        <div className="project-tab-nav mt-5 pt-3">
          <button 
            type="button"
            className={`project-tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <span>Role Openings & Tasks</span>
            <span className="project-tab-badge">
              {project.openRoles.length} roles • {totalProblemsCount} tasks
            </span>
          </button>

          <button 
            type="button"
            className={`project-tab-btn ${activeTab === 'readme' ? 'active' : ''}`}
            onClick={() => setActiveTab('readme')}
          >
            <BookOpen size={13} />
            <span>README.md</span>
            <span className="project-tab-badge">
              {project.readme?.source === 'github_auto' ? 'GitHub' : project.readme?.source === 'file_upload' ? 'Uploaded' : 'Doc'}
            </span>
          </button>

          <button 
            type="button"
            className={`project-tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => setActiveTab('setup')}
          >
            <Terminal size={13} />
            <span>Quickstart & Good First Issues</span>
            <span className="project-tab-badge">
              {project.firstIssues.length} beginner issues
            </span>
          </button>

          <button 
            type="button"
            className={`project-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <ShieldCheck size={13} />
            <span>Campus Sponsorship</span>
            {project.supportApplication && (
              <span className="project-tab-badge capitalize text-emerald-500">
                {project.supportApplication.status}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Primary Content (2 cols on tablet/desktop) */}
        <div className="md:col-span-2 space-y-5">
          {/* TAB 1: HELP NEEDED & OPEN ROLES */}
          {activeTab === 'roles' && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-pure)] tracking-tight">
                    Where the Team Needs Help
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Specific student collaborator openings and technical problems listed by maintainer:
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {isMaintainer && (
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm text-[11px] flex items-center gap-1 cursor-pointer"
                      onClick={() => setIsAddTaskOpen(true)}
                    >
                      <Plus size={12} />
                      <span>Add Task</span>
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm text-[11px] cursor-pointer"
                    onClick={() => onRequestCollab(project)}
                  >
                    Pitch a custom role
                  </button>
                </div>
              </div>

              {/* Task Difficulty Sub-filter */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
                <span className="text-[11px] text-[var(--text-tertiary)] font-medium">Filter Tasks:</span>
                {[
                  { id: 'all' as const, label: `All Role Tasks (${totalProblemsCount})` },
                  { id: 'beginner' as const, label: 'Starter Tasks' },
                  { id: 'intermediate' as const, label: 'Intermediate' },
                ].map(df => (
                  <button
                    key={df.id}
                    type="button"
                    className={`status-pill text-[11px] py-0.5 px-2.5 cursor-pointer ${problemDifficultyFilter === df.id ? 'active' : ''}`}
                    onClick={() => setProblemDifficultyFilter(df.id)}
                  >
                    {df.label}
                  </button>
                ))}
              </div>

              {project.openRoles.length === 0 ? (
                <div className="p-6 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] text-center">
                  All formal team positions are currently filled, but open-source pull requests and code reviews are welcome on GitHub.
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {project.openRoles.map((role, idx) => (
                    <div 
                      key={idx}
                      className="p-4 sm:p-5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0">
                              {getRoleIcon(role.category)}
                            </span>
                            <span className="font-semibold text-sm text-[var(--text-pure)]">
                              {role.role}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-medium">
                              {role.count} spot{role.count > 1 ? 's' : ''} open
                            </span>
                          </div>

                          <button 
                            className="btn btn-secondary btn-sm text-xs shrink-0 self-start sm:self-auto cursor-pointer"
                            onClick={() => onRequestCollab(project, role.role)}
                          >
                            Apply for role
                          </button>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {role.description}
                        </p>

                        {/* Looking for specific tech/skills */}
                        {role.lookingForSkills && role.lookingForSkills.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                              Looking for:
                            </span>
                            {role.lookingForSkills.map((sk, sIdx) => (
                              <TechBadge key={sIdx} name={sk} />
                            ))}
                          </div>
                        )}

                        {/* Maintainer's Listed Problems for this Role */}
                        {role.problems && role.problems.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[var(--text-pure)] flex items-center gap-1.5 font-mono">
                                <AlertCircle size={12} className="text-amber-500" />
                                <span>Maintainer's Role Tasks & Deliverables ({role.problems.length})</span>
                              </span>
                              <span className="text-[10.5px] text-[var(--text-tertiary)]">
                                Claim task to pitch solution
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              {role.problems
                                .filter(prob => problemDifficultyFilter === 'all' || prob.difficulty === problemDifficultyFilter)
                                .map((prob) => (
                                  <div 
                                    key={prob.id}
                                    className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all space-y-2 shadow-2xs"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                                      <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-mono text-[10.5px] text-[var(--text-tertiary)] font-semibold">
                                            #{prob.id.replace('prob_', '')}
                                          </span>
                                          <span className="font-semibold text-xs text-[var(--text-pure)] leading-snug">
                                            {prob.title}
                                          </span>
                                          <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-medium ${
                                            prob.difficulty === 'beginner' 
                                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                              : prob.difficulty === 'intermediate'
                                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                                              : 'bg-violet-500/10 text-violet-500 border border-violet-500/25'
                                          }`}>
                                            {prob.difficulty === 'beginner' ? 'Starter Task' : prob.difficulty}
                                          </span>
                                        </div>

                                        <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                                          {prob.description}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                                        {isMaintainer ? (
                                          <select
                                            value={prob.status || 'open'}
                                            onChange={(e) => onUpdateTaskStatus?.(project.id, prob.id, e.target.value as any)}
                                            className="text-[11px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[var(--text-primary)] cursor-pointer"
                                          >
                                            <option value="open">Status: Open</option>
                                            <option value="in_progress">Status: In Progress</option>
                                            <option value="resolved">Status: Resolved</option>
                                          </select>
                                        ) : (
                                          prob.status === 'in_progress' ? (
                                            <span className="text-[10.5px] px-2 py-0.5 rounded font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/25">
                                              In Progress
                                            </span>
                                          ) : prob.status === 'resolved' ? (
                                            <span className="text-[10.5px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                                              Resolved
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              className="btn btn-primary btn-sm text-[11px] px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                                              onClick={() => onRequestCollab(project, role.role, prob.title)}
                                            >
                                              <span>Claim Task</span>
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>

                                    {/* Suggested Files & GitHub link */}
                                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--border-subtle)]/60 text-[10.5px] flex-wrap">
                                      {prob.suggestedFiles && prob.suggestedFiles.length > 0 ? (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[var(--text-tertiary)] font-mono text-[10px]">Target files:</span>
                                          {prob.suggestedFiles.map((file, fIdx) => (
                                            <code key={fIdx} className="px-1.5 py-0.2 rounded bg-[var(--code-bg)] text-[var(--text-primary)] font-mono text-[10px] border border-[var(--border-subtle)]">
                                              {file}
                                            </code>
                                          ))}
                                        </div>
                                      ) : <div />}

                                      {prob.issueUrl && (
                                        <a
                                          href={prob.issueUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 ml-auto font-mono text-[10.5px]"
                                        >
                                          <span>Issue on GitHub</span>
                                          <ExternalLink size={10} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(() => {
                    const standaloneTasks = (project.tasks || []).filter(
                      t => !project.openRoles.some(r => r.role.toLowerCase() === (t.linkedRole || '').toLowerCase())
                    ).filter(t => problemDifficultyFilter === 'all' || t.difficulty === problemDifficultyFilter);
                    if (standaloneTasks.length === 0) return null;
                    return (
                      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[var(--text-pure)]">Platform & Project Tasks ({standaloneTasks.length})</span>
                        </div>
                        <div className="space-y-2.5">
                          {standaloneTasks.map((task) => (
                            <div key={task.id} className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 shadow-2xs">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-xs text-[var(--text-pure)] leading-snug">{task.title}</span>
                                    <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-medium ${
                                      task.difficulty === 'beginner' 
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                        : task.difficulty === 'intermediate'
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                                        : 'bg-violet-500/10 text-violet-500 border border-violet-500/25'
                                    }`}>
                                      {task.difficulty}
                                    </span>
                                  </div>
                                  <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">{task.description}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                                  {isMaintainer ? (
                                    <select
                                      value={task.status || 'open'}
                                      onChange={(e) => onUpdateTaskStatus?.(project.id, task.id, e.target.value as any)}
                                      className="text-[11px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[var(--text-primary)] cursor-pointer"
                                    >
                                      <option value="open">Status: Open</option>
                                      <option value="in_progress">Status: In Progress</option>
                                      <option value="resolved">Status: Resolved</option>
                                    </select>
                                  ) : (
                                    task.status === 'in_progress' ? (
                                      <span className="text-[10.5px] px-2 py-0.5 rounded font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/25">In Progress</span>
                                    ) : task.status === 'resolved' ? (
                                      <span className="text-[10.5px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">Resolved</span>
                                    ) : (
                                      <button
                                        type="button"
                                        className="btn btn-primary btn-sm text-[11px] px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                                        onClick={() => onRequestCollab(project, undefined, task.title)}
                                      >
                                        <span>Claim Task</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GITHUB README.MD & SYSTEM ARCHITECTURE */}
          {activeTab === 'readme' && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-sm overflow-hidden">
              {/* GitHub README Document Bar */}
              <div className="bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <FileText size={14} className="text-[var(--text-secondary)]" />
                  <span className="font-semibold text-[var(--text-pure)]">
                    {project.readme?.fileName || 'README.md'}
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    • {project.readme?.fileSize || `${(new Blob([defaultRawMarkdown]).size / 1024).toFixed(1)} KB`} • {project.readme?.source === 'github_auto' ? 'GitHub Synced' : project.readme?.source === 'file_upload' ? 'Uploaded File' : 'Interactive Overview'}
                  </span>
                </div>

                {/* Hidden input for local file upload */}
                <input 
                  type="file" 
                  ref={readmeFileInputRef} 
                  onChange={handleUploadReadmeFile} 
                  accept=".md,.markdown,.txt" 
                  className="hidden" 
                />

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Toast / Alert if any */}
                  {readmeSyncMessage && (
                    <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {readmeSyncMessage}
                    </span>
                  )}

                  {/* Sync from GitHub Button */}
                  {project.repoUrl && (
                    <button
                      type="button"
                      disabled={isSyncingReadme}
                      onClick={handleSyncGithubReadme}
                      className="btn btn-secondary btn-sm text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Fetch latest README directly from GitHub repository"
                    >
                      <RefreshCw size={11} className={isSyncingReadme ? 'animate-spin text-[var(--accent-primary)]' : ''} />
                      <span>{isSyncingReadme ? 'Syncing...' : 'Sync GitHub'}</span>
                    </button>
                  )}

                  {/* Upload README File Button */}
                  <button
                    type="button"
                    onClick={() => readmeFileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm text-[11px] flex items-center gap-1.5 cursor-pointer"
                    title="Upload local README.md file"
                  >
                    <Upload size={11} />
                    <span>Upload README</span>
                  </button>

                  <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md p-0.5 flex items-center text-xs">
                    <button
                      type="button"
                      className={`px-3 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        readmeViewMode === 'preview' 
                          ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] shadow-2xs font-semibold' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      onClick={() => setReadmeViewMode('preview')}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        readmeViewMode === 'raw' 
                          ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] shadow-2xs font-semibold' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      onClick={() => setReadmeViewMode('raw')}
                    >
                      Raw
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm text-[11px] flex items-center gap-1.5 cursor-pointer"
                    onClick={() => handleCopy(defaultRawMarkdown, 'raw_readme')}
                  >
                    {copiedKey === 'raw_readme' ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy raw</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Content Body: True GitHub-Grade Markdown Document View */}
              {readmeViewMode === 'raw' ? (
                <div className="p-5 sm:p-7 bg-[var(--code-bg)] font-mono text-[12.5px] text-[var(--text-secondary)] overflow-x-auto leading-relaxed">
                  <pre className="whitespace-pre-wrap">{defaultRawMarkdown}</pre>
                </div>
              ) : (
                <div className="p-6 sm:p-10 max-w-4xl">
                  <MarkdownRenderer content={defaultRawMarkdown} />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETUP & FIRST ISSUES */}
          {activeTab === 'setup' && (
            <div className="space-y-5">
              {/* Quickstart Setup */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal size={14} className="text-[var(--text-secondary)]" />
                  <h2 className="text-xs font-semibold text-[var(--text-pure)] uppercase tracking-wider font-mono">
                    Local Development Quickstart
                  </h2>
                </div>
                {project.setupGuide ? (
                  <pre className="code-block-clean">{project.setupGuide}</pre>
                ) : (
                  <p className="text-xs text-[var(--text-tertiary)]">
                    This project is currently in the idea stage. No code setup instructions are required yet.
                  </p>
                )}
              </div>

              {/* Good First Issues */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-semibold text-[var(--text-pure)] uppercase tracking-wider font-mono">
                    Good First Issues on GitHub ({project.firstIssues.length})
                  </h2>
                  <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">
                    Starter PR Tickets
                  </span>
                </div>
                <p className="text-[11.5px] text-[var(--text-secondary)] mb-3.5 leading-relaxed">
                  Bite-sized issues for new contributors to make their first code commit. If you want to take ownership of an engineering role, check the <button type="button" onClick={() => setActiveTab('roles')} className="text-[var(--accent-primary)] hover:underline font-medium cursor-pointer">Role Openings & Tasks</button> tab.
                </p>

                {project.firstIssues.length === 0 ? (
                  <div className="text-xs text-[var(--text-tertiary)] p-4 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-center">
                    No starter issues tagged yet. Submit a collaboration pitch to propose a task.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {project.firstIssues.map(issue => (
                      <div 
                        key={issue.id}
                        className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-medium text-[var(--text-primary)] mb-1">
                            {issue.title}
                          </div>
                          <div className="flex items-center gap-2 text-[10.5px]">
                            <span className="badge-tag py-0.5">{issue.difficulty}</span>
                            {issue.tags.map((t, i) => (
                              <span key={i} className="text-[var(--text-tertiary)] font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {issue.issueUrl && (
                          <a 
                            href={issue.issueUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-secondary btn-sm text-xs shrink-0"
                          >
                            <ExternalLink size={12} />
                            <span>View</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMMUNITY SUPPORT */}
          {activeTab === 'support' && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm">
              {project.supportApplication ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <h2 className="font-semibold text-sm text-[var(--text-pure)]">
                        Campus Sponsorship Application
                      </h2>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        Submitted {project.supportApplication.submittedAt}
                      </span>
                    </div>
                    <span className="badge-tag curated capitalize">
                      {project.supportApplication.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--text-tertiary)] block mb-1">Target Community:</span>
                      <span className="text-[var(--text-primary)] font-medium">{project.supportApplication.targetAudience}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)] block mb-1">Next Milestone:</span>
                      <span className="text-[var(--text-primary)] font-medium">{project.supportApplication.nextMilestone}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-[var(--text-tertiary)] block mb-1.5">Requested Resources:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {project.supportApplication.requestedSupport.map((req, i) => (
                        <span key={i} className="badge-tag">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  {project.supportApplication.reviewerNotes && (
                    <div className="p-3 rounded-lg bg-[var(--code-bg)] border border-[var(--border-subtle)] text-xs">
                      <div className="text-[10px] uppercase font-mono text-[var(--text-tertiary)] mb-1">
                        Reviewer Feedback ({project.supportApplication.reviewedBy}):
                      </div>
                      <div className="text-[var(--text-primary)] leading-relaxed italic">
                        "{project.supportApplication.reviewerNotes}"
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShieldCheck size={28} className="mx-auto text-[var(--accent-primary)] mb-2" />
                  <h3 className="font-semibold text-sm text-[var(--text-pure)] mb-1">
                    Apply for College Community Sponsorship
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-4 leading-relaxed">
                    Sponsorship provides official college GitHub organization placement, infrastructure credits, and advisor matching.
                  </p>
                  <button 
                    className="btn btn-primary text-xs cursor-pointer"
                    onClick={() => onApplySupport(project)}
                  >
                    Submit sponsorship application
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Structured Project Sidebar */}
        <div className="space-y-4">
          {/* Project Maintainer Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 font-mono">
              Maintainer
            </h3>
            <div className="flex items-center gap-3">
              <img 
                src={project.owner.avatarUrl} 
                alt={project.owner.name} 
                className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)] shrink-0" 
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-[var(--text-pure)] truncate">
                    {project.owner.name}
                  </span>
                  {project.owner.collegeVerified && (
                    <span title="Verified student">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] font-mono">
                  @{project.owner.username}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                  {project.owner.branchOrMajor}
                </div>
              </div>
            </div>
          </div>

          {/* Current Tech Stack (What packages are used in repo) */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
                Current Tech Stack & Packages
              </h3>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                {(project.currentStack || project.skills).length} deps
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(project.currentStack || project.skills).map((pkg, idx) => (
                <TechBadge key={idx} name={pkg} />
              ))}
            </div>
          </div>

          {/* Repository Specs */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm space-y-2.5 text-xs">
            <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 font-mono">
              Repository Specs
            </h3>

            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <GitBranch size={12} />
                <span>Verified Commits</span>
              </span>
              <span className="font-mono text-[var(--text-primary)] font-medium">
                {project.verifiedCommitsCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <FileCode2 size={12} />
                <span>License</span>
              </span>
              <span className="text-[var(--text-primary)] font-medium font-mono text-[11px]">
                {project.license || 'MIT'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>Last Activity</span>
              </span>
              <span className="text-[var(--text-primary)]">
                {project.lastActivity}
              </span>
            </div>
          </div>

          {/* Project Team Members */}
          {project.members && project.members.length > 0 && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm text-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
                  Active Team Members
                </h3>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                  {project.members.length} members
                </span>
              </div>
              <div className="space-y-2">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {member.user?.avatarUrl ? (
                        <img src={member.user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-[10px] font-mono shrink-0">
                          {member.user?.name ? member.user.name.charAt(0) : 'U'}
                        </div>
                      )}
                      <span className="text-[11.5px] text-[var(--text-primary)] truncate font-medium">
                        {member.user?.name || 'Contributor'}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono capitalize bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Continuity / Handover */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs shadow-sm">
            <div className="flex items-start gap-2 text-[var(--text-tertiary)] mb-2">
              <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-[var(--text-secondary)] block">Project Continuity</span>
                <span className="text-[11px] leading-relaxed">
                  Is maintainer graduating or stepping down?
                </span>
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm w-full text-xs mt-1 cursor-pointer"
              onClick={() => onRequestHandover(project)}
            >
              Request maintainer handover
            </button>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2 className="text-sm font-bold text-[var(--text-pure)]">Edit Project Details</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-pure)] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingEdit(true);
                try {
                  await onUpdateProject?.(project.id, {
                    name: editName,
                    summary: editSummary,
                    problemStatement: editProblem,
                    maturity: editMaturity as any,
                    visibility: editVisibility as any,
                    repoUrl: editRepoUrl || undefined,
                    license: editLicense,
                    skills: editSkills.split(',').map(s => s.trim()).filter(Boolean),
                    openRoles: editRoles.split(',').map(r => r.trim()).filter(Boolean).map(role => ({
                      role,
                      count: 1,
                      description: `Looking for a ${role}.`
                    })),
                  });
                  setIsEditOpen(false);
                } finally {
                  setIsSavingEdit(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">Project Name</label>
                <input
                  required
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">One-line Summary</label>
                <input
                  required
                  minLength={20}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">Campus Problem Statement</label>
                <textarea
                  rows={3}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none resize-none"
                  value={editProblem}
                  onChange={(e) => setEditProblem(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[var(--text-secondary)] block mb-1">Maturity Stage</label>
                  <select
                    className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                    value={editMaturity}
                    onChange={(e) => setEditMaturity(e.target.value as any)}
                  >
                    <option value="idea">Idea Stage</option>
                    <option value="prototype">Prototype</option>
                    <option value="active">Active Development</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-[var(--text-secondary)] block mb-1">Visibility</label>
                  <select
                    className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value as any)}
                  >
                    <option value="college">Campus Only (I2IT)</option>
                    <option value="public">Public</option>
                    <option value="private">Private Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[var(--text-secondary)] block mb-1">Repository URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                    value={editRepoUrl}
                    onChange={(e) => setEditRepoUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-medium text-[var(--text-secondary)] block mb-1">License</label>
                  <input
                    placeholder="MIT, Apache 2.0, etc."
                    className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                    value={editLicense}
                    onChange={(e) => setEditLicense(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">Tech Stack & Skills (comma-separated)</label>
                <input
                  placeholder="TypeScript, Next.js, PostgreSQL"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">Team Roles Needed (comma-separated)</label>
                <input
                  placeholder="Frontend contributor, Backend developer, UI Designer"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                  value={editRoles}
                  onChange={(e) => setEditRoles(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm cursor-pointer"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="btn btn-primary btn-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Project Modal */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-rose-500">
              <Archive size={18} />
              <h2 className="text-sm font-bold text-[var(--text-pure)]">Archive Project</h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to archive <b>{project.name}</b>? It will no longer appear in the campus project directory.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                className="btn btn-secondary btn-sm cursor-pointer"
                onClick={() => setIsArchiveOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm bg-rose-600 hover:bg-rose-500 text-white border-rose-600 cursor-pointer"
                onClick={async () => {
                  await onArchiveProject?.(project.id);
                  setIsArchiveOpen(false);
                }}
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2 className="text-sm font-bold text-[var(--text-pure)]">Add Project Task</h2>
              <button type="button" onClick={() => setIsAddTaskOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-pure)] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                setIsSavingTask(true);
                try {
                  await onCreateTask?.(project.id, {
                    title: taskTitle.trim(),
                    description: taskDesc.trim(),
                    difficulty: taskDifficulty,
                    role: taskRole.trim() || undefined,
                    suggestedFiles: taskFiles.split(',').map(f => f.trim()).filter(Boolean),
                  });
                  setTaskTitle('');
                  setTaskDesc('');
                  setTaskRole('');
                  setTaskFiles('');
                  setIsAddTaskOpen(false);
                } finally {
                  setIsSavingTask(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">Task Title</label>
                <input
                  required
                  placeholder="e.g. Implement Supabase database migration"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">Task Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what needs to be done, requirements, or acceptance criteria..."
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none resize-none"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[var(--text-secondary)] block mb-1">Difficulty</label>
                  <select
                    className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                    value={taskDifficulty}
                    onChange={(e) => setTaskDifficulty(e.target.value as any)}
                  >
                    <option value="beginner">Starter / Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-[var(--text-secondary)] block mb-1">Target Role (optional)</label>
                  <select
                    className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                    value={taskRole}
                    onChange={(e) => setTaskRole(e.target.value)}
                  >
                    <option value="">General (Any)</option>
                    {project.openRoles.map((r, rIdx) => (
                      <option key={rIdx} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-[var(--text-secondary)] block mb-1">Target Files (comma-separated, optional)</label>
                <input
                  placeholder="src/lib/db.ts, prisma/schema.prisma"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-[var(--text-pure)] outline-none"
                  value={taskFiles}
                  onChange={(e) => setTaskFiles(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm cursor-pointer"
                  onClick={() => setIsAddTaskOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  className="btn btn-primary btn-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingTask ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
