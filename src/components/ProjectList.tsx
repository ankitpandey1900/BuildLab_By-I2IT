import React, { useState, useMemo } from 'react';
import { Project, ProjectTrack, ProjectMaturity } from '../types';
import {
  GitBranch,
  FolderGit2,
  Users,
  Sparkles,
  ArrowUpRight,
  Star,
  Palette,
  Code2,
  Settings,
  Database,
  Shield,
  Smartphone,
  Layers,
  Server,
  Cpu,
  Bug,
  BookOpen,
  RefreshCw,
  Check
} from 'lucide-react';
import { BentoGrid, BentoGridItem } from './ui/bento-grid';
import { TechBadge } from './ui/TechBadge';
import { getMaturityColor } from '../lib/utils';

const getRoleMicroIcon = (categoryOrRole?: string) => {
  const text = (categoryOrRole || '').toLowerCase();
  if (text.includes('design') || text.includes('ui') || text.includes('ux')) {
    return <Palette size={11} className="text-pink-500 shrink-0" />;
  }
  if (text.includes('auth') || text.includes('security') || text.includes('session')) {
    return <Shield size={11} className="text-violet-500 shrink-0" />;
  }
  if (text.includes('data') || text.includes('sql') || text.includes('redis') || text.includes('cache')) {
    return <Database size={11} className="text-rose-500 shrink-0" />;
  }
  if (text.includes('mobile') || text.includes('flutter') || text.includes('ios') || text.includes('android')) {
    return <Smartphone size={11} className="text-cyan-500 shrink-0" />;
  }
  if (text.includes('ai') || text.includes('ml') || text.includes('model') || text.includes('data science')) {
    return <Sparkles size={11} className="text-amber-500 shrink-0" />;
  }
  if (text.includes('devops') || text.includes('cloud') || text.includes('docker')) {
    return <Server size={11} className="text-blue-500 shrink-0" />;
  }
  if (text.includes('fullstack') || text.includes('full stack')) {
    return <Layers size={11} className="text-indigo-500 shrink-0" />;
  }
  if (text.includes('hardware') || text.includes('iot') || text.includes('embedded')) {
    return <Cpu size={11} className="text-amber-600 shrink-0" />;
  }
  if (text.includes('qa') || text.includes('test')) {
    return <Bug size={11} className="text-orange-500 shrink-0" />;
  }
  if (text.includes('doc') || text.includes('writer')) {
    return <BookOpen size={11} className="text-teal-500 shrink-0" />;
  }
  if (text.includes('backend') || text.includes('api')) {
    return <Settings size={11} className="text-emerald-500 shrink-0" />;
  }
  return <Code2 size={11} className="text-sky-500 shrink-0" />;
};

interface ProjectListProps {
  projects: Project[];
  searchQuery: string;
  onSelectProject: (project: Project) => void;
  onRequestCollab: (project: Project) => void;
  onClearSearch?: () => void;
}

const hasBeginnerTask = (project: Project): boolean => {
  // Check standalone/platform tasks: must strictly be beginner and open
  const hasInTasks = (project.tasks || []).some(
    t => t.difficulty === 'beginner' && t.status === 'open'
  );
  if (hasInTasks) return true;

  // Check role-specific problems in openRoles: must strictly be beginner and open
  const hasInOpenRoles = (project.openRoles || []).some(
    r => (r.problems || []).some(
      p => p.difficulty === 'beginner' && p.status === 'open'
    )
  );
  if (hasInOpenRoles) return true;

  return false;
};

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  searchQuery,
  onSelectProject,
  onRequestCollab,
  onClearSearch
}) => {
  const [selectedTrack, setSelectedTrack] = useState<ProjectTrack | 'all'>('all');
  const [selectedMaturity, setSelectedMaturity] = useState<ProjectMaturity | 'all'>('all');
  const [hasBeginnerTasks, setHasBeginnerTasks] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Extract top skills
  const allSkills = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach(p => p.skills.forEach(s => counts.set(s, (counts.get(s) || 0) + 1)));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }, [projects]);

  // Combined Filtered projects
  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.skills.some(s => s.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (selectedTrack !== 'all' && p.track !== selectedTrack) {
        return false;
      }

      if (selectedMaturity !== 'all' && p.maturity !== selectedMaturity) {
        return false;
      }

      if (hasBeginnerTasks && !hasBeginnerTask(p)) {
        return false;
      }

      if (selectedSkill && !p.skills.includes(selectedSkill)) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedTrack, selectedMaturity, hasBeginnerTasks, selectedSkill]);

  const handleClearFilters = () => {
    setSelectedTrack('all');
    setSelectedMaturity('all');
    setHasBeginnerTasks(false);
    setSelectedSkill(null);
    onClearSearch?.();
    if (typeof document !== 'undefined') {
      const searchInputs = document.querySelectorAll<HTMLInputElement>('input[placeholder*="Search" i]');
      searchInputs.forEach(input => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        nativeSetter?.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  };

  const isAnyFilterActive = selectedTrack !== 'all' || selectedMaturity !== 'all' || hasBeginnerTasks || selectedSkill !== null || searchQuery.trim().length > 0;

  return (
    <div className="filter-toolbar">
      {/* Comprehensive Filter Controls */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Track Filters & Beginner Tasks Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          {/* A. Track Filters: All Projects, Independent, Community Supported */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider font-mono mr-1">
              Track:
            </span>
            <div className="status-pill-list overflow-x-auto no-scrollbar">
              <button
                type="button"
                className={`status-pill cursor-pointer text-xs ${selectedTrack === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('all')}
              >
                All Projects ({projects.length})
              </button>
              <button
                type="button"
                className={`status-pill cursor-pointer text-xs ${selectedTrack === 'independent' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('independent')}
              >
                Independent
              </button>
              <button
                type="button"
                className={`status-pill flex items-center gap-1.5 cursor-pointer text-xs ${selectedTrack === 'community_supported' ? 'active' : ''}`}
                onClick={() => setSelectedTrack('community_supported')}
              >
                <Users size={12} className={selectedTrack === 'community_supported' ? 'text-white' : 'text-indigo-400'} />
                <span>Community Supported</span>
              </button>
            </div>
          </div>

          {/* C. Beginner Task Filter Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setHasBeginnerTasks(!hasBeginnerTasks)}
              className={`status-pill flex items-center gap-1.5 cursor-pointer text-xs font-medium transition-all ${
                hasBeginnerTasks
                  ? 'active !bg-emerald-600 !text-white !border-emerald-500 shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-pure)]'
              }`}
              aria-pressed={hasBeginnerTasks}
              title="Filter projects with open beginner-friendly starter tasks or first issues"
            >
              <Sparkles size={12} className={hasBeginnerTasks ? 'text-amber-300' : 'text-amber-400'} />
              <span>Has Beginner Tasks</span>
              {hasBeginnerTasks && <Check size={11} className="text-white ml-0.5" />}
            </button>

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-ghost btn-sm text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-pure)] cursor-pointer"
                title="Reset all active filters and search"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Row 2: B. Maturity Filters: All Stages, Idea, Prototype, Active, Maintenance */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider font-mono mr-1">
            Stage:
          </span>
          <div className="status-pill-list overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all' as const, label: 'All Stages', dot: null },
                { id: 'idea' as const, label: 'Idea', dot: 'bg-amber-400' },
                { id: 'prototype' as const, label: 'Prototype', dot: 'bg-violet-500' },
                { id: 'active' as const, label: 'Active', dot: 'bg-emerald-500' },
                { id: 'maintenance' as const, label: 'Maintenance', dot: 'bg-sky-400' },
              ] as const
            ).map(mat => (
              <button
                key={mat.id}
                type="button"
                className={`status-pill flex items-center gap-1.5 cursor-pointer text-xs ${selectedMaturity === mat.id ? 'active' : ''}`}
                onClick={() => setSelectedMaturity(mat.id)}
              >
                {mat.dot && <span className={`w-1.5 h-1.5 rounded-full ${mat.dot}`} />}
                <span>{mat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Filter Pills (Top skills only, uncluttered) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
        <span className="text-[var(--text-tertiary)] font-medium text-[11px] mr-1">
          Stack:
        </span>
        {selectedSkill && (
          <button
            className="btn btn-ghost btn-sm text-[11px] py-0.5 px-2 text-[var(--text-primary)] cursor-pointer"
            onClick={() => setSelectedSkill(null)}
          >
            Clear ({selectedSkill}) ✕
          </button>
        )}
        {allSkills.slice(0, 8).map(skill => (
          <button
            key={skill}
            className={`status-pill cursor-pointer ${selectedSkill === skill ? 'active' : ''}`}
            style={{ fontSize: '11px', padding: '2px 8px' }}
            onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Bento Grid: Lean, Uncluttered & Responsive */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-10 text-center text-[var(--text-secondary)] space-y-3">
            <FolderGit2 size={32} className="mx-auto text-[var(--text-tertiary)]" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--text-pure)]">No projects match filters</div>
              <div className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto leading-relaxed">
                No repositories match your active combination of track, stage, beginner task toggle, or search query.
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-secondary btn-sm text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-[var(--accent-primary)] hover:text-[var(--text-pure)] transition-all"
            >
              <RefreshCw size={12} />
              <span>Clear Filters</span>
            </button>
          </div>
        ) : (
          <BentoGrid>
            {filtered.map((project) => {
              return (
                <BentoGridItem
                  key={project.id}
                  className="col-span-1"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      {/* 1. Card Header: Title & Popularity Stars */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-[var(--text-pure)] text-sm sm:text-base tracking-tight group-hover/bento:text-[var(--accent-blue)] transition-colors line-clamp-1 flex-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 font-mono text-[11.5px] text-[var(--text-primary)]">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span>{project.starsCount ?? 76}</span>
                          </span>
                          <ArrowUpRight size={14} className="text-[var(--text-tertiary)] group-hover/bento:text-[var(--text-pure)] group-hover/bento:translate-x-0.5 group-hover/bento:-translate-y-0.5 transition-all" />
                        </div>
                      </div>

                      {/* 2. Track & Vitality Subline: Track Badge, Status Dot, Commit Count */}
                      <div className="flex items-center gap-2 mb-2.5 text-xs flex-wrap">
                        {project.track === 'community_supported' ? (
                          <span className="badge-tag curated flex items-center gap-1.5">
                            <Users size={10} />
                            <span>Community</span>
                          </span>
                        ) : (
                          <span className="badge-tag">
                            Independent
                          </span>
                        )}
                        {(() => {
                          const mat = getMaturityColor(project.maturity);
                          return (
                            <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                              <span className={`w-1.5 h-1.5 rounded-full ${mat.dot}`} />
                              <span className="capitalize">{project.maturity}</span>
                            </span>
                          );
                        })()}
                        <span className="text-[var(--text-tertiary)]">•</span>
                        {project.repoUrl ? (
                          <span className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] font-mono">
                            <GitBranch size={11} />
                            <span>{project.verifiedCommitsCount} commits</span>
                          </span>
                        ) : (
                          <span className="text-amber-500/90 text-[10px] font-sans font-medium">concept</span>
                        )}
                      </div>

                      {/* 3. Summary: Clean, exactly 2 lines with fixed height to avoid vertical shift */}
                      <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-2 mb-3 h-9">
                        {project.summary}
                      </p>

                      {/* 4. Tech Stack: Single row, no multi-line wrapping */}
                      <div className="flex items-center gap-1.5 overflow-hidden flex-nowrap mb-3 h-7">
                        {project.skills.slice(0, 3).map(skill => (
                          <TechBadge key={skill} name={skill} />
                        ))}
                        {project.skills.length > 3 && (
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shrink-0">
                            +{project.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* 5. Seeking Openings: Single-row sleek opportunity strip */}
                      <div className="mb-4 h-7 flex items-center">
                        {project.openRoles.length > 0 ? (
                          <div className="flex items-center gap-1.5 overflow-hidden flex-nowrap w-full">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono font-bold tracking-wider shrink-0 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Seeking
                            </span>
                            <div className="flex items-center gap-1.5 overflow-hidden flex-nowrap">
                              {project.openRoles.slice(0, 2).map((r, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] shrink-0 max-w-[130px]"
                                >
                                  <span className="shrink-0">{getRoleMicroIcon(r.category || r.role)}</span>
                                  <span className="truncate">{r.role}</span>
                                </span>
                              ))}
                              {project.openRoles.length > 2 && (
                                <span className="text-[10px] text-[var(--text-tertiary)] font-mono shrink-0">
                                  +{project.openRoles.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)] font-mono flex items-center gap-1">
                            ✓ Team complete
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 6. Unified Single Footer Row */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)] mt-auto">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Contributor Avatars Cluster */}
                        <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                          {(project.contributorAvatars || [
                            project.owner.avatarUrl,
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          ]).slice(0, 3).map((avatarUrl, idx) => (
                            <img
                              key={idx}
                              src={avatarUrl}
                              alt="Contributor"
                              className="w-5 h-5 rounded-full ring-2 ring-[var(--bg-surface)] object-cover shrink-0"
                            />
                          ))}
                        </div>
                        <span className="text-[11.5px] font-medium text-[var(--text-primary)] truncate">
                          @{project.owner.username}
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)] hidden sm:inline">
                          ({project.collaboratorsCount} dev{project.collaboratorsCount !== 1 ? 's' : ''})
                        </span>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm text-[11px] px-2.5 py-1 font-medium hover:border-[var(--accent-primary)] hover:text-[var(--text-pure)] transition-all shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestCollab(project);
                        }}
                      >
                        Collaborate
                      </button>
                    </div>
                  </div>
                </BentoGridItem>
              );
            })}
          </BentoGrid>
        )}
      </div>
    </div>
  );
};
