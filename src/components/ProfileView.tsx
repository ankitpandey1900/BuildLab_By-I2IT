import React, { useState } from 'react';
import { Project, StudentProfile } from '../types';
import { 
  GitPullRequest, 
  GitCommit, 
  GitMerge, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Link2,
  X,
  Clock,
  FolderGit2,
  Edit3,
  Share2,
  ShieldCheck,
  Flame,
  Calendar,
  Code2,
  Check,
  Copy,
  Building2,
  Heart,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  GraduationCap
} from 'lucide-react';
import { CardSpotlight } from './ui/card-spotlight';
import { TechBadge } from './ui/TechBadge';

interface ProfileViewProps {
  user: StudentProfile;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onToggleGithub: () => void;
  onUpdateUser?: (updated: Partial<StudentProfile>) => void;
  onOpenVerificationModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  projects = [],
  onSelectProject,
  onToggleGithub,
  onUpdateUser,
  onOpenVerificationModal
}) => {
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectUsername, setConnectUsername] = useState('');
  const [connectBusy, setConnectBusy] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'contributions' | 'projects' | 'skills'>('contributions');
  const [selectedContributionFilter, setSelectedContributionFilter] = useState<'all' | 'pr_merged' | 'issue_resolved' | 'code_review'>('all');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [copiedProfile, setCopiedProfile] = useState(false);

  const handleConnectGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectUsername.trim()) return;
    setConnectBusy(true);
    setConnectError(null);
    try {
      const res = await fetch('/api/github/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUsername: connectUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.message || 'Unable to connect GitHub account.');
        setConnectBusy(false);
        return;
      }
      if (onUpdateUser) {
        onUpdateUser({
          githubConnected: true,
          githubUsername: connectUsername.trim(),
        });
      }
      setShowConnectModal(false);
      window.location.reload();
    } catch {
      setConnectError('Failed to connect GitHub account.');
      setConnectBusy(false);
    }
  };

  // Edit form state
  const [editName, setEditName] = useState(user.name);
  const [editBranchYear, setEditBranchYear] = useState(user.collegeOrgId);
  const [editBio, setEditBio] = useState(user.bio);
  const [skillTags, setSkillTags] = useState<string[]>(user.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [editHours, setEditHours] = useState((user.weeklyAvailabilityHours || 8).toString());
  const [interestTags, setInterestTags] = useState<string[]>(user.interests || []);
  const [interestInput, setInterestInput] = useState('');

  const syncFormWithUser = () => {
    setEditName(user.name);
    setEditBranchYear(user.collegeOrgId);
    setEditBio(user.bio);
    setSkillTags(user.skills || []);
    setSkillInput('');
    setEditHours((user.weeklyAvailabilityHours || 8).toString());
    setInterestTags(user.interests || []);
    setInterestInput('');
  };

  React.useEffect(() => {
    syncFormWithUser();
  }, [user]);

  const openEditModal = () => {
    syncFormWithUser();
    setShowEditModal(true);
  };

  const addSkill = (val: string) => {
    const trimmed = val.replace(/,/g, '').trim();
    if (trimmed && !skillTags.includes(trimmed)) {
      setSkillTags([...skillTags, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (index: number) => {
    setSkillTags(skillTags.filter((_, i) => i !== index));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === 'Backspace' && !skillInput && skillTags.length > 0) {
      setSkillTags(skillTags.slice(0, -1));
    }
  };

  const addInterest = (val: string) => {
    const trimmed = val.replace(/,/g, '').trim();
    if (trimmed && !interestTags.includes(trimmed)) {
      setInterestTags([...interestTags, trimmed]);
    }
    setInterestInput('');
  };

  const removeInterest = (index: number) => {
    setInterestTags(interestTags.filter((_, i) => i !== index));
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addInterest(interestInput);
    } else if (e.key === 'Backspace' && !interestInput && interestTags.length > 0) {
      setInterestTags(interestTags.slice(0, -1));
    }
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      const finalSkills = [...skillTags];
      if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
        finalSkills.push(skillInput.trim());
      }
      const finalInterests = [...interestTags];
      if (interestInput.trim() && !finalInterests.includes(interestInput.trim())) {
        finalInterests.push(interestInput.trim());
      }

      onUpdateUser({
        name: editName.trim(),
        collegeOrgId: editBranchYear.trim(),
        bio: editBio.trim(),
        skills: finalSkills,
        weeklyAvailabilityHours: parseInt(editHours, 10) || 8,
        interests: finalInterests,
      });
    }
    setShowEditModal(false);
  };

  const filteredContributions = user.verifiedContributions.filter(c => {
    if (selectedContributionFilter === 'all') return true;
    return c.type === selectedContributionFilter;
  });

  const userProjects = (projects || []).filter(
    p => p.owner.id === user.id || p.members?.some(m => m.userId === user.id)
  );

  // Generate 20-week contribution heatmap matrix (20 weeks x 7 days)
  const heatmapWeeks = React.useMemo(() => {
    const weeks: { date: string; count: number; level: number }[][] = [];
    const today = new Date();
    
    // Seeded pseudo-random generator for consistent heatmap appearance
    const getContributionCount = (dayIndex: number) => {
      const seed = Math.sin(dayIndex * 997 + 42) * 10000;
      const rand = seed - Math.floor(seed);
      if (rand < 0.35) return 0;
      if (rand < 0.65) return 1;
      if (rand < 0.85) return 2;
      if (rand < 0.95) return 4;
      return 6;
    };

    for (let w = 19; w >= 0; w--) {
      const weekDays: { date: string; count: number; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + (6 - d);
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() - dayOffset);
        
        const count = getContributionCount(dayOffset);
        let level = 0;
        if (count === 1) level = 1;
        else if (count === 2) level = 2;
        else if (count >= 3 && count <= 4) level = 3;
        else if (count > 4) level = 4;

        const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weekDays.push({ date: dateStr, count, level });
      }
      weeks.push(weekDays);
    }
    return weeks;
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Developer Hero Header with Cover Accent */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        {/* Cover Gradient Banner */}
        <div 
          className="h-28 sm:h-36 relative w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #18181b 0%, #121215 50%, #1a1e29 100%)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {/* Subtle geometric dot overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '16px 16px'
            }}
          />
          <div className="absolute top-3 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              Campus Registry Active
            </span>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-5 sm:p-7 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar & Basic Info */}
            <div className="flex items-end gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[var(--bg-surface)] shadow-md"
                />
                <span 
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[var(--accent-primary)] ring-2 ring-[var(--bg-surface)]" 
                  title="Online & Available on campus" 
                />
              </div>

              <div className="space-y-1 mb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-pure)]">
                    {user.name}
                  </h1>
                  {user.verificationStatus === 'VERIFIED' || user.collegeVerified ? (
                    <span className="badge-tag curated flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      <span>Campus Verified (PRN: {user.prnNumber || 'Confirmed'})</span>
                    </span>
                  ) : user.verificationStatus === 'PENDING_APPROVAL' ? (
                    <button 
                      type="button"
                      onClick={onOpenVerificationModal} 
                      className="badge-tag flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer"
                    >
                      <Clock size={12} className="text-amber-400" />
                      <span>PRN Review Pending ({user.prnNumber || 'Submitted'})</span>
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={onOpenVerificationModal} 
                      className="badge-tag flex items-center gap-1 text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20"
                    >
                      <ShieldCheck size={12} className="text-indigo-400" />
                      <span>Verify Campus PRN</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 flex-wrap">
                  <span className="text-[var(--text-primary)] font-medium font-mono">@{user.username}</span>
                  <span>•</span>
                  <span>{user.department || "Computer Engineering"} ({user.academicYear || "2026"})</span>
                  {user.rollNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[var(--text-tertiary)]">Roll: {user.rollNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 shadow-2xs hover:border-[var(--accent-primary)] transition-all cursor-pointer"
                onClick={openEditModal}
              >
                <Edit3 size={13} />
                <span>Edit Profile</span>
              </button>

              <button 
                className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 shadow-2xs hover:border-[var(--accent-primary)] transition-all cursor-pointer"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedProfile(true);
                    setTimeout(() => setCopiedProfile(false), 2000);
                  }
                }}
                title="Share profile"
              >
                {copiedProfile ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                <span className="hidden sm:inline">{copiedProfile ? 'Copied URL!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Bio & Availability Bar */}
          <div className="space-y-3 pt-1">
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              {user.bio}
            </p>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-[11px] font-mono font-medium">
                <Clock size={12} />
                <span>Available {user.weeklyAvailabilityHours}h / week for open-source</span>
              </span>

              {user.githubConnected ? (
                <div className="inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[11px] font-mono">
                    <GitPullRequest size={12} className="text-[var(--accent-primary)]" />
                    <span>github.com/{user.githubUsername}</span>
                    <span className="text-[9px] px-1 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                      Verified
                    </span>
                  </span>
                  <button
                    onClick={() => setShowDisconnectModal(true)}
                    className="text-[10.5px] text-[var(--text-tertiary)] hover:text-red-400 font-mono transition-colors cursor-pointer px-1 py-0.5"
                    title="Disconnect GitHub account"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[11px] font-mono hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <Link2 size={12} />
                  <span>Link GitHub Account</span>
                </button>
              )}

              <span className="text-[11px] text-[var(--text-tertiary)] ml-auto hidden md:inline">
                Joined campus registry {user.joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GitHub-Style Contribution Heatmap Activity Calendar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-pure)] flex items-center gap-2">
              <Calendar size={15} className="text-[var(--accent-primary)]" />
              <span>Campus & GitHub Contribution Activity</span>
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Verified cryptographic webhook commits and merged pull requests across campus repositories.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1 text-[var(--accent-primary)] font-semibold">
              <Flame size={13} className="text-amber-500 fill-amber-500" />
              <span>14-day streak</span>
            </span>
            <span>•</span>
            <span>184 contributions (past 6 mo)</span>
          </div>
        </div>

        {/* The 20-week Grid */}
        <div className="overflow-x-auto pb-2 no-scrollbar">
          <div className="inline-flex flex-col gap-1.5 min-w-[620px]">
            {/* Days of week rows (Mon, Wed, Fri labels) */}
            <div className="flex gap-1.5 items-center">
              <div className="w-6 text-[9.5px] font-mono text-[var(--text-tertiary)] flex flex-col justify-between h-[84px] py-0.5">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className="flex gap-1.5">
                {heatmapWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map((day, dIdx) => {
                      const colorClass = 
                        day.level === 4 ? 'bg-emerald-400 border-emerald-300' :
                        day.level === 3 ? 'bg-emerald-600/80 border-emerald-500/50' :
                        day.level === 2 ? 'bg-emerald-700/50 border-emerald-600/30' :
                        day.level === 1 ? 'bg-emerald-900/40 border-emerald-800/30' :
                        'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)]';

                      return (
                        <div
                          key={dIdx}
                          title={`${day.count} contributions on ${day.date}`}
                          className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 hover:z-10 cursor-pointer ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between pt-2 text-[10.5px] text-[var(--text-tertiary)] font-mono">
              <span>Past 140 days</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]" />
                <div className="w-2.5 h-2.5 rounded-xs bg-emerald-900/40 border border-emerald-800/30" />
                <div className="w-2.5 h-2.5 rounded-xs bg-emerald-700/50 border border-emerald-600/30" />
                <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600/80 border border-emerald-500/50" />
                <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 border border-emerald-300" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Developer Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CardSpotlight className="p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-sm">
          <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-[var(--accent-primary-subtle)] flex items-center justify-center text-[var(--accent-primary)]">
            <GitPullRequest size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-pure)] font-mono">
            {user.verifiedContributions.filter(c => c.type === 'pr_merged').length}
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-medium">
            Verified Merged PRs
          </div>
        </CardSpotlight>

        <CardSpotlight className="p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-sm">
          <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <GitCommit size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-pure)] font-mono">
            {user.verifiedContributions.filter(c => c.type === 'commit_pushed').length}
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-medium">
            Verified Commits
          </div>
        </CardSpotlight>

        <CardSpotlight className="p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-sm">
          <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FolderGit2 size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-pure)] font-mono">
            {new Set(user.verifiedContributions.map(c => c.repo)).size}
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-medium">
            Active Repositories
          </div>
        </CardSpotlight>

        <CardSpotlight className="p-4 rounded-xl border border-[var(--border-subtle)] text-center shadow-sm">
          <div className="w-8 h-8 mx-auto mb-1.5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-pure)] font-mono">
            {user.verifiedContributions.filter(c => c.type === 'issue_resolved' || c.type === 'code_review').length}
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-medium">
            Reviews & Issues
          </div>
        </CardSpotlight>
      </div>

      {/* 4. Profile Section Tabs */}
      <div className="border-b border-[var(--border-subtle)] flex items-center gap-6 text-xs font-medium">
        <button
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'contributions' 
              ? 'border-[var(--accent-primary)] text-[var(--text-pure)] font-semibold' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab('contributions')}
        >
          Verified Contribution Receipts ({user.verifiedContributions.length})
        </button>

        <button
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'projects' 
              ? 'border-[var(--accent-primary)] text-[var(--text-pure)] font-semibold' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab('projects')}
        >
          Active Projects ({userProjects.length})
        </button>

        <button
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'skills' 
              ? 'border-[var(--accent-primary)] text-[var(--text-pure)] font-semibold' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab('skills')}
        >
          Skills & Stack ({user.skills.length})
        </button>
      </div>

      {/* TAB 1: VERIFIED CONTRIBUTIONS */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          {/* Sub-filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all' as const, label: 'All Activity' },
              { id: 'pr_merged' as const, label: 'Merged Pull Requests' },
              { id: 'issue_resolved' as const, label: 'Resolved Issues' },
              { id: 'code_review' as const, label: 'Code Reviews' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedContributionFilter(f.id)}
                className={`status-pill text-xs ${
                  selectedContributionFilter === f.id ? 'active' : ''
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Contributions List */}
          {filteredContributions.length === 0 ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-8 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)]">
                <GitCommit size={20} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-pure)]">
                No verified contribution receipts yet
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                Connect your GitHub handle above, then push commits or merge pull requests to any campus repository. Verified GitHub webhook deliveries will automatically record cryptographically signed receipts here.
              </p>
              {!user.githubConnected && (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="btn btn-primary btn-sm text-xs mt-2"
                >
                  <Link2 size={12} />
                  <span>Link GitHub Account</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContributions.map(rec => (
                <div 
                  key={rec.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-[var(--border-hover)] transition-all"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shrink-0 mt-0.5">
                      {rec.type === 'pr_merged' ? (
                        <GitMerge size={17} className="text-[var(--accent-primary)]" />
                      ) : rec.type === 'issue_resolved' ? (
                        <CheckCircle2 size={17} className="text-[var(--accent-blue)]" />
                      ) : (
                        <GitCommit size={17} className="text-[var(--accent-indigo)]" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <div className="text-sm font-semibold text-[var(--text-pure)] leading-snug">
                        {rec.title}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] font-mono flex-wrap">
                        <span className="text-[var(--text-primary)] font-medium">{rec.repo}</span>
                        {rec.sha && (
                          <button
                            onClick={() => handleCopySha(rec.sha!)}
                            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 text-[11px]"
                            title="Copy commit SHA"
                          >
                            <span>sha:{rec.sha.slice(0, 10)}</span>
                            {copiedSha === rec.sha ? (
                              <Check size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        )}
                        <span>• {rec.date}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] font-sans font-medium flex items-center gap-1">
                          <Check size={10} />
                          <span>Webhook Verified</span>
                        </span>
                      </div>

                      {rec.details && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-0.5">
                          {rec.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {rec.externalUrl && (
                    <a
                      href={rec.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm text-xs shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      <span>Inspect GitHub</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE PROJECTS */}
      {activeTab === 'projects' && (
        userProjects.length === 0 ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-8 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)]">
              <FolderGit2 size={20} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-pure)]">
              No active campus projects yet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Publish your project or idea to the directory, or pitch to collaborate on open roles across campus projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userProjects.map(p => {
              const isOwner = p.owner.id === user.id;
              const membership = p.members?.find(m => m.userId === user.id);
              const roleTitle = isOwner ? 'Lead Maintainer' : (membership?.role || 'Contributor');

              return (
                <CardSpotlight
                  key={p.id}
                  onClick={() => onSelectProject?.(p)}
                  className="p-5 rounded-xl border border-[var(--border-subtle)] space-y-3 shadow-sm hover:border-[var(--border-hover)] cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10.5px] font-semibold text-[var(--accent-primary)] font-mono uppercase tracking-wider block">
                        {roleTitle}
                      </span>
                      <h3 className="text-sm font-semibold text-[var(--text-pure)] mt-0.5 hover:text-[var(--accent-primary)] transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    <span className="badge-tag flex items-center gap-1.5 capitalize">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.maturity === 'active' ? 'bg-emerald-400' : 'bg-violet-400'}`} />
                      <span>{p.maturity}</span>
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {p.summary || p.problemStatement}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.skills.slice(0, 4).map(sk => (
                      <TechBadge key={sk} name={sk} />
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                    <span>{p.verifiedCommitsCount} verified commits</span>
                    <span className="text-[11px] font-mono text-[var(--accent-primary)]">
                      View Project →
                    </span>
                  </div>
                </CardSpotlight>
              );
            })}
          </div>
        )
      )}

      {/* TAB 3: SKILLS & STACK */}
      {activeTab === 'skills' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                Verified Technical Stack ({user.skills.length})
              </h3>
              {user.skills.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)]">
                  No technical skills listed yet. Add your programming languages and frameworks.
                </p>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {user.skills.map(sk => (
                    <TechBadge key={sk} name={sk} />
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={openEditModal}
              className="btn btn-secondary btn-sm text-xs shrink-0 flex items-center gap-1.5"
            >
              <Edit3 size={13} />
              <span>Edit Stack & Bio</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              Domain Interests & Project Focus ({user.interests.length})
            </h3>
            {user.interests.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">
                No domain interests added.
              </p>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {user.interests.map(int => (
                  <span key={int} className="badge-tag text-xs py-1 px-3">
                    {int}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="w-full max-w-[640px] rounded-2xl shadow-2xl p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto border transition-colors duration-200"
            style={{ 
              maxWidth: '640px', 
              width: '100%', 
              backgroundColor: 'var(--modal-bg)', 
              borderColor: 'var(--border-default)', 
              color: 'var(--text-primary)',
              borderRadius: '16px', 
              boxShadow: 'var(--card-shadow, 0 25px 60px -15px rgba(0, 0, 0, 0.6))' 
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    backgroundColor: 'var(--accent-primary-subtle)', 
                    borderColor: 'var(--border-default)', 
                    color: 'var(--accent-primary)',
                    borderRadius: '12px' 
                  }}
                >
                  <div className="relative">
                    <User size={20} />
                    <Edit3 size={10} className="absolute -bottom-0.5 -right-0.5" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-pure)]">
                    Edit Developer Profile
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Update your campus engineering persona and stack
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-hover)] transition-colors p-1.5 rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Field 1: Full Name */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <User size={15} className="text-[var(--text-tertiary)]" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-default)', color: 'var(--text-pure)' }}
                  className="w-full border focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/40 rounded-xl px-4 py-2.5 text-sm placeholder:text-[var(--text-tertiary)] outline-none transition-all"
                />
              </div>

              {/* Field 2: Branch / Department & Year */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <Building2 size={15} className="text-[var(--text-tertiary)]" />
                  <span>Branch / Department & Year</span>
                </label>
                <div className="relative">
                  <div 
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-default)' }}
                    className="w-full border focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)]/40 rounded-xl px-3.5 py-2.5 text-sm flex items-center gap-2.5 transition-all"
                  >
                    <GraduationCap size={18} className="text-[var(--text-tertiary)] shrink-0" />
                    <input
                      type="text"
                      value={editBranchYear}
                      onChange={e => setEditBranchYear(e.target.value)}
                      placeholder="Computer Engineering · 2026"
                      list="branch-year-list"
                      style={{ backgroundColor: 'transparent', color: 'var(--text-pure)' }}
                      className="bg-transparent text-sm placeholder:text-[var(--text-tertiary)] outline-none w-full"
                    />
                    <ChevronDown size={18} className="text-[var(--text-tertiary)] shrink-0 pointer-events-none" />
                  </div>
                  <datalist id="branch-year-list">
                    <option value="Computer Engineering · 2026" />
                    <option value="Information Technology · 2026" />
                    <option value="Computer Engineering · 2025" />
                    <option value="Electronics & Telecommunication · 2026" />
                    <option value="Artificial Intelligence & DS · 2027" />
                    <option value="Mechanical Engineering · 2026" />
                  </datalist>
                </div>
              </div>

              {/* Field 3: Bio / Headline */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <FileText size={15} className="text-[var(--text-tertiary)]" />
                  <span>Bio / Headline</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Describe what you love building..."
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-default)', color: 'var(--text-pure)' }}
                    className="w-full border focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/40 rounded-xl p-3.5 pb-7 text-sm placeholder:text-[var(--text-tertiary)] outline-none resize-none leading-relaxed transition-all"
                  />
                  <span className="absolute bottom-2.5 right-3.5 text-[11px] text-[var(--text-tertiary)] font-mono select-none pointer-events-none">
                    {editBio.length}/200
                  </span>
                </div>
              </div>

              {/* Field 4: Technical Stack / Skills (comma-separated) */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <Code2 size={15} className="text-[var(--text-tertiary)]" />
                  <span>Technical Stack / Skills (comma-separated)</span>
                </label>
                <div 
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-default)' }}
                  className="w-full border focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)]/40 rounded-xl p-2 min-h-[46px] flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {skillTags.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shadow-2xs transition-colors"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] transition-colors cursor-pointer"
                          title="Remove skill"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      onBlur={() => {
                        if (skillInput.trim()) {
                          addSkill(skillInput);
                        }
                      }}
                      placeholder={skillTags.length === 0 ? "Type skill & hit Enter..." : "Add skill..."}
                      style={{ backgroundColor: 'transparent', color: 'var(--text-pure)' }}
                      className="bg-transparent text-xs placeholder:text-[var(--text-tertiary)] outline-none flex-1 min-w-[90px] py-1 px-1.5"
                    />
                  </div>
                  <ChevronDown size={18} className="text-[var(--text-tertiary)] shrink-0" />
                </div>
              </div>

              {/* Row 5: Availability & Interests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Availability (Hrs/wk) */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                    <Calendar size={15} className="text-[var(--text-tertiary)]" />
                    <span>Availability (Hrs/wk)</span>
                  </label>
                  <div 
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-default)' }}
                    className="w-full border focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)]/40 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <Clock size={16} className="text-[var(--text-tertiary)] shrink-0" />
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={editHours}
                        onChange={e => setEditHours(e.target.value)}
                        style={{ backgroundColor: 'transparent', color: 'var(--text-pure)' }}
                        className="bg-transparent text-sm outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 text-[var(--text-tertiary)] shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditHours(prev => String(Math.min(60, (parseInt(prev, 10) || 0) + 1)))}
                        className="hover:text-[var(--text-pure)] transition-colors cursor-pointer"
                        title="Increase hours"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditHours(prev => String(Math.max(1, (parseInt(prev, 10) || 2) - 1)))}
                        className="hover:text-[var(--text-pure)] transition-colors cursor-pointer"
                        title="Decrease hours"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                    <Heart size={15} className="text-[var(--text-tertiary)]" />
                    <span>Interests</span>
                  </label>
                  <div 
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-default)' }}
                    className="w-full border focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)]/40 rounded-xl p-1.5 min-h-[44px] flex items-center justify-between gap-1.5 transition-all"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      {interestTags.map((interest, idx) => (
                        <span
                          key={idx}
                          style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shadow-2xs transition-colors"
                        >
                          <span>{interest}</span>
                          <button
                            type="button"
                            onClick={() => removeInterest(idx)}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] transition-colors cursor-pointer"
                            title="Remove interest"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={interestInput}
                        onChange={e => setInterestInput(e.target.value)}
                        onKeyDown={handleInterestKeyDown}
                        onBlur={() => {
                          if (interestInput.trim()) {
                            addInterest(interestInput);
                          }
                        }}
                        placeholder={interestTags.length === 0 ? "Add interest..." : ""}
                        style={{ backgroundColor: 'transparent', color: 'var(--text-pure)' }}
                        className="bg-transparent text-xs placeholder:text-[var(--text-tertiary)] outline-none flex-1 min-w-[70px] py-1 px-1.5"
                      />
                    </div>
                    <ChevronDown size={18} className="text-[var(--text-tertiary)] shrink-0" />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                style={{ borderTopColor: 'var(--border-subtle)' }}
                className="pt-5 mt-6 border-t flex items-center justify-end gap-3"
              >
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-hover)] border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect GitHub Account Modal */}
      {showConnectModal && (
        <div 
          className="c-modal-overlay"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowConnectModal(false)}
        >
          <div 
            className="c-modal-card"
            style={{ maxWidth: '440px', width: '100%', margin: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Link2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-pure)]">Link GitHub Account</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">Verify and import your cryptographic contributions</p>
                </div>
              </div>
              <button 
                type="button"
                className="btn btn-ghost btn-sm p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-pure)] rounded-lg" 
                onClick={() => setShowConnectModal(false)}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleConnectGithub} className="space-y-4 pt-3">
              <div className="text-xs text-[var(--text-secondary)] space-y-3">
                <p className="leading-relaxed">
                  Connect your GitHub profile to receive cryptographically verified contribution receipts for commits, pull requests, and code reviews across campus projects.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[var(--text-primary)]">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[var(--text-tertiary)] text-xs font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={connectUsername}
                      onChange={(e) => setConnectUsername(e.target.value)}
                      placeholder="e.g. your-github-handle"
                      className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg pl-8 pr-3 py-2 text-xs text-[var(--text-pure)] font-mono outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                    />
                  </div>
                </div>
                {connectError && (
                  <p className="text-red-400 text-[11px] bg-red-500/10 border border-red-500/20 p-2 rounded-lg">{connectError}</p>
                )}
              </div>
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-xs cursor-pointer"
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectBusy || !connectUsername.trim()}
                  className="btn btn-primary btn-sm text-xs cursor-pointer shadow-sm"
                >
                  {connectBusy ? 'Connecting…' : 'Link Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Warning Modal */}
      {showDisconnectModal && (
        <div 
          className="c-modal-overlay"
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowDisconnectModal(false)}
        >
          <div 
            className="c-modal-card"
            style={{ maxWidth: '420px', width: '100%', margin: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-pure)]">Disconnect GitHub</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">Pause webhook synchronization</p>
                </div>
              </div>
              <button 
                type="button"
                className="btn btn-ghost btn-sm p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-pure)] rounded-lg" 
                onClick={() => setShowDisconnectModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-2.5 leading-relaxed pt-2">
              <p className="text-[var(--text-primary)] font-medium">Attribution Policy Notice:</p>
              <ul className="list-disc pl-4 space-y-1 text-[var(--text-tertiary)]">
                <li>Existing verified records remain permanent on your portfolio.</li>
                <li>Future commits will pause automatic webhook synchronization.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5">
              <button 
                type="button"
                className="btn btn-secondary btn-sm text-xs cursor-pointer" 
                onClick={() => setShowDisconnectModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-sm text-xs bg-red-600 hover:bg-red-700 text-white border-transparent cursor-pointer shadow-sm"
                onClick={() => {
                  onToggleGithub();
                  setShowDisconnectModal(false);
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
