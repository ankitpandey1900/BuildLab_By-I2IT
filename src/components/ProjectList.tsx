import React, { useState, useMemo } from 'react';
import { Project, ProjectTrack, ProjectMaturity } from '../types';
import {
  FolderGit2,
  Users,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Check
} from 'lucide-react';
import { BentoGrid, BentoGridItem } from './ui/bento-grid';
import { TechBadge } from './ui/TechBadge';
import { TechIcon } from './ui/TechIcon';
import { getMaturityColor } from '../lib/utils';

interface ProjectListProps {
  projects: Project[];
  searchQuery: string;
  onSelectProject: (project: Project) => void;
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
    <div className="filter-toolbar [--accent-primary:#286b46] dark:[--accent-primary:#78c995]">
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
              className={`status-pill flex items-center gap-1.5 cursor-pointer text-xs font-medium transition-all ${hasBeginnerTasks
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
            className={`status-pill ${selectedSkill === skill ? 'active' : ''}`}
            style={{ fontSize: '11px', padding: '2px 8px' }}
            onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
          >
            <TechIcon name={skill} className="w-3 h-3" />
            <span>{skill}</span>
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
              const maturity = getMaturityColor(project.maturity);
              return (
                <BentoGridItem
                  key={project.id}
                  className="col-span-1 min-h-0"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex flex-col gap-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="inline-flex items-center gap-2 font-medium capitalize text-[var(--text-secondary)]">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${maturity.dot}`} />
                          {project.maturity}
                        </span>
                        <span className="max-w-[55%] truncate text-right text-[var(--text-tertiary)]">
                          {project.owner.branchOrMajor}
                        </span>
                      </div>

                      <div>
                        <h3 className="line-clamp-1 text-base font-semibold leading-snug text-[var(--text-pure)] transition-colors group-hover/bento:text-[var(--accent-primary)] sm:text-lg">
                          {project.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                          {project.summary}
                        </p>
                      </div>

                      <div className="flex h-7 flex-nowrap items-center gap-1.5 overflow-hidden">
                        {project.skills.slice(0, 3).map(skill => (
                          <TechBadge key={skill} name={skill} />
                        ))}
                        {project.skills.length > 3 && (
                          <span className="shrink-0 rounded bg-[var(--bg-surface-elevated)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-tertiary)]">
                            +{project.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Users size={14} aria-hidden="true" />
                        <span>{project.collaboratorsCount} team</span>
                      </span>
                      {project.openRoles.length > 0 ? (
                        <span className="whitespace-nowrap font-mono text-[11px] font-medium text-amber-500">
                          {project.openRoles.length} role{project.openRoles.length === 1 ? '' : 's'} open
                        </span>
                      ) : (
                        <span className="whitespace-nowrap text-[11px] text-[var(--text-tertiary)]">
                          Active team
                        </span>
                      )}
                      <button
                        type="button"
                        className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectProject(project);
                        }}
                      >
                        <span>View</span>
                        <ArrowUpRight size={13} aria-hidden="true" />
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
