import React from 'react';
import { Plus, Compass, GitBranch, ShieldCheck } from 'lucide-react';
import { Spotlight } from './ui/spotlight';
import { ShimmerButton } from './ui/shimmer-button';

interface HeroSectionProps {
  onExplore: () => void;
  onNewProject: () => void;
  projectsCount: number;
  communitySupportedCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onNewProject,
  projectsCount,
  communitySupportedCount
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-8 border-b border-[var(--border-subtle)] mb-6">
      {/* Subtle Spotlight Beam */}
      <Spotlight className="-top-36 left-0 md:left-40 md:-top-20" fill="white" />

      {/* Background Dots Pattern with radial vignette */}
      <div 
        className="absolute inset-0 pointer-events-none bg-dot-[var(--dot-color)] opacity-50"
        style={{
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)"
        }}
      />

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-pure)] mb-3 leading-[1.12]">
          Ship open source on campus.
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xl">
          Discover student repositories, join active project teams, and build a verified engineering contribution portfolio anchored to GitHub.
        </p>

        {/* Lean Action Buttons */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <ShimmerButton onClick={onNewProject}>
            <Plus size={14} />
            <span>Publish project</span>
          </ShimmerButton>

          <button className="btn btn-secondary text-xs sm:text-sm" onClick={onExplore}>
            <Compass size={14} />
            <span>Explore directory</span>
          </button>
        </div>

        {/* Minimal Stats Strip */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-[var(--text-tertiary)] font-mono flex-wrap">
          <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
            <GitBranch size={12} className="text-[var(--accent-primary)]" />
            <span>{projectsCount} projects</span>
          </span>
          <span>•</span>
          <span className="text-[var(--text-primary)]">
            {communitySupportedCount} community-backed
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[var(--text-secondary)]">
            <ShieldCheck size={12} className="text-[var(--accent-primary)]" />
            <span>Verified student credit</span>
          </span>
        </div>
      </div>
    </section>
  );
};
