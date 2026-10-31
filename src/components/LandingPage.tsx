"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, 
  ArrowRight, 
  ArrowUpRight, 
  GitBranch, 
  ShieldCheck, 
  Users, 
  Terminal, 
  Sparkles, 
  Code2, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Star,
  Search,
  LogIn,
  GraduationCap,
  Copy,
  Check,
  GitPullRequest,
  GitMerge,
  Flame,
  HelpCircle,
  ChevronDown,
  Lock,
  Zap,
  Quote,
  Clock
} from 'lucide-react';
import { Project } from '@/types';
import { ThemeToggle } from './ThemeToggle';
import { TechBadge } from './ui/TechBadge';
import { Spotlight } from './ui/spotlight';
import { getMaturityColor } from '@/lib/utils';

const GitLogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M2.59 13.41L10.59 21.41C11.37 22.19 12.63 22.19 13.41 21.41L21.41 13.41C22.19 12.63 22.19 11.37 21.41 10.59L13.41 2.59C12.63 1.81 11.37 1.81 10.59 2.59L8.41 4.77L10.74 7.1C11.32 6.91 12 7.04 12.46 7.5C12.92 7.96 13.05 8.64 12.86 9.22L15.34 11.7C15.92 11.51 16.6 11.64 17.06 12.1C17.65 12.69 17.65 13.64 17.06 14.22C16.47 14.81 15.52 14.81 14.94 14.22C14.48 13.76 14.35 13.08 14.54 12.5L12.06 10.02C11.87 10.21 11.65 10.37 11.41 10.49V16.63C11.78 16.85 12.08 17.19 12.24 17.61C12.4 18.03 12.4 18.5 12.24 18.92C12.08 19.34 11.78 19.68 11.41 19.9C10.79 20.26 10 20.26 9.38 19.9C9.01 19.68 8.71 19.34 8.55 18.92C8.39 18.5 8.39 18.03 8.55 17.61C8.71 17.19 9.01 16.85 9.38 16.63V10.49C9.14 10.37 8.92 10.21 8.73 10.02C8.27 9.56 8.14 8.88 8.33 8.3L6.04 6.01L2.59 9.46C1.81 10.24 1.81 11.5 2.59 12.28L2.59 13.41Z" fill="#F05138" />
  </svg>
);

const GitHubLogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ambientCodeSnippets = [
  'import { ESP32, MQTTClient } from "@i2it/embedded-nodes";',
  'const telemetry = new ESP32({ baudRate: 115200 });',
  'await telemetry.connectWiFi("I2IT-Campus-5G");',
  'export async function syncCommitDiff(sha: string) {',
  '  const commit = await github.getCommit({ sha });',
  '  const isValid = crypto.verify(commit.signature);',
  '  if (!isValid) throw new Error("Invalid signature");',
  '  return db.verifiedContribution.create({ data });',
  '}',
  '// Campus Shuttle GPS Loop Frequency: 50Hz',
  'mqtt.on("message", (topic, packet) => {',
  '  const gps = parseNMEAPacket(packet);',
  '  broadcastLocation({ lat: gps.lat, lng: gps.lng });',
  '});',
  'const [maintainers, openTasks] = await Promise.all([',
  '  prisma.projectMember.findMany({ where: { role: "maintainer" } }),',
  '  prisma.projectTask.findMany({ where: { status: "open" } })',
  ']);',
  'git checkout -b feat/cellular-fallback-sim800l',
  'git commit -S -m "feat(telemetry): signed pgp receipt"',
  'git push origin feat/cellular-fallback-sim800l'
];

interface StudentPerspective {
  id: string;
  name: string;
  department: string;
  year: string;
  github: string;
  avatarInitials: string;
  avatarGradient: string;
  proofBadge: string;
  proofType: 'merge' | 'commit' | 'review';
  projectName: string;
  skills: string[];
  quote: string;
}

const row1Perspectives: StudentPerspective[] = [
  {
    id: "aarav",
    name: "Aarav Sharma",
    department: "Computer Engineering",
    year: "2026",
    github: "@aarav-sharma",
    avatarInitials: "AS",
    avatarGradient: "from-blue-500/25 to-cyan-500/25 text-blue-400 border-blue-500/30",
    proofBadge: "PR #14 Merged",
    proofType: "merge",
    projectName: "campus-ride-telemetry",
    skills: ["C++", "ESP32", "MQTT"],
    quote: "Listing our IoT telemetry repo here helped us recruit 2 junior frontend contributors who built the entire responsive dashboard in two weeks.",
  },
  {
    id: "ananya",
    name: "Ananya Kulkarni",
    department: "Information Technology",
    year: "2027",
    github: "@ananya-k",
    avatarInitials: "AK",
    avatarGradient: "from-purple-500/25 to-pink-500/25 text-purple-400 border-purple-500/30",
    proofBadge: "PR #08 Merged",
    proofType: "merge",
    projectName: "hostel-laundry-tracker",
    skills: ["TypeScript", "Next.js", "Tailwind"],
    quote: "As a sophomore, making my first pull request on a real campus repo was intimidating. The structured beginner tags and code reviews made it seamless.",
  },
  {
    id: "rohan",
    name: "Rohan Deshmukh",
    department: "Electronics & Telecom",
    year: "2025",
    github: "@rohan-deshmukh",
    avatarInitials: "RD",
    avatarGradient: "from-emerald-500/25 to-teal-500/25 text-emerald-400 border-emerald-500/30",
    proofBadge: "28 Commits Verified",
    proofType: "commit",
    projectName: "smart-energy-monitor",
    skills: ["FreeRTOS", "CAN Bus", "Python"],
    quote: "The verified receipt feature gave our team verifiable evidence of systems programming and MQTT work that helped us land off-campus internships.",
  },
  {
    id: "sneha",
    name: "Sneha Patil",
    department: "AI & Data Science",
    year: "2026",
    github: "@sneha-patil-ai",
    avatarInitials: "SP",
    avatarGradient: "from-amber-500/25 to-orange-500/25 text-amber-400 border-amber-500/30",
    proofBadge: "PR #31 Merged",
    proofType: "merge",
    projectName: "syllabus-semantic-search",
    skills: ["Python", "FastAPI", "ChromaDB"],
    quote: "Instead of demo ML code sitting idle in a Jupyter notebook on my drive, I connected our campus embeddings search into a live tool used daily.",
  },
];

const row2Perspectives: StudentPerspective[] = [
  {
    id: "tanmay",
    name: "Tanmay Joshi",
    department: "Computer Engineering",
    year: "2025",
    github: "@tanmay-j",
    avatarInitials: "TJ",
    avatarGradient: "from-indigo-500/25 to-blue-500/25 text-indigo-400 border-indigo-500/30",
    proofBadge: "36 Reviews Logged",
    proofType: "review",
    projectName: "campus-auth-gateway",
    skills: ["Go", "Docker", "PostgreSQL"],
    quote: "Reviewing sophomore PRs gave me real senior engineering leadership practice that recruiters constantly asked about during technical rounds.",
  },
  {
    id: "isha",
    name: "Isha Deshpande",
    department: "Information Technology",
    year: "2027",
    github: "@isha-ui",
    avatarInitials: "ID",
    avatarGradient: "from-rose-500/25 to-pink-500/25 text-rose-400 border-rose-500/30",
    proofBadge: "PR #19 Merged",
    proofType: "merge",
    projectName: "alumni-connect-portal",
    skills: ["React", "Framer Motion", "Tailwind"],
    quote: "Found an open task marked 'beginner-friendly' on the alumni portal. The maintainer hopped on a 15-minute call to explain their state machine.",
  },
  {
    id: "kunal",
    name: "Kunal Verma",
    department: "Electronics & Telecom",
    year: "2026",
    github: "@kunal-lora",
    avatarInitials: "KV",
    avatarGradient: "from-cyan-500/25 to-emerald-500/25 text-cyan-400 border-cyan-500/30",
    proofBadge: "PR #06 Merged",
    proofType: "merge",
    projectName: "weather-station-lora",
    skills: ["LoRaWAN", "C++", "PlatformIO"],
    quote: "Deploying our LoRaWAN weather nodes across campus buildings with documented schematics and PR history gave us an unbeatable capstone project.",
  },
  {
    id: "meera",
    name: "Meera Iyer",
    department: "Computer Engineering",
    year: "2026",
    github: "@meera-iyer",
    avatarInitials: "MI",
    avatarGradient: "from-violet-500/25 to-indigo-500/25 text-violet-400 border-violet-500/30",
    proofBadge: "PR #22 Merged",
    proofType: "merge",
    projectName: "exam-schedule-sync",
    skills: ["Next.js 16", "Prisma", "Zod"],
    quote: "Having cryptographic receipts linked to my GitHub account made my resume stand out immediately because hiring teams could inspect the exact diffs.",
  },
];

interface LandingPageProps {
  initialProjects?: Project[];
  isAuthenticated?: boolean;
  userEmail?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  initialProjects = [],
  isAuthenticated = false,
  userEmail
}) => {
  const [filterTrack, setFilterTrack] = useState<'all' | 'beginner' | 'typescript' | 'python' | 'iot'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState<'cli' | 'receipt'>('cli');
  const [claimedWorkflowTask, setClaimedWorkflowTask] = useState(false);
  const [copiedWorkflowSha, setCopiedWorkflowSha] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyCloneCmd = () => {
    navigator.clipboard.writeText("git clone https://github.com/college-dev/i2it-community.git");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const filteredProjects = initialProjects.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesSummary = p.summary.toLowerCase().includes(q);
      const matchesSkills = p.skills.some(s => s.toLowerCase().includes(q));
      if (!matchesName && !matchesSummary && !matchesSkills) return false;
    }
    if (filterTrack === 'beginner') {
      return (p.tasks && p.tasks.some(t => t.difficulty === 'beginner')) || p.openRoles.length > 0;
    }
    if (filterTrack === 'typescript') {
      return p.skills.some(s => s.toLowerCase().includes('typescript') || s.toLowerCase().includes('react'));
    }
    if (filterTrack === 'python') {
      return p.skills.some(s => s.toLowerCase().includes('python') || s.toLowerCase().includes('ai') || s.toLowerCase().includes('fastapi'));
    }
    if (filterTrack === 'iot') {
      return p.skills.some(s => s.toLowerCase().includes('c++') || s.toLowerCase().includes('esp32') || s.toLowerCase().includes('mqtt') || s.toLowerCase().includes('iot'));
    }
    return true;
  });

  const totalTasks = initialProjects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);

  const workflowSteps = [
    {
      step: "01",
      tagline: "IDENTITY",
      title: "GitHub Auth & College PRN Gate",
      subtitle: "Authentic student developer identity",
      description: "Sign in with your GitHub account to explore open campus repositories. To claim tasks, talk to mentors, or post projects, verify your college PRN number for official community approval.",
      footerIcon: Lock,
      footerText: "GitHub & PRN Verification",
      footerTag: "Verified",
      renderMock: () => (
        <div className="rounded-xl bg-[var(--bg-surface-elevated)]/50 p-4 space-y-3 font-sans">
          <div className="flex items-center justify-between text-[11.5px]">
            <div className="flex items-center gap-2">
              <GraduationCap size={15} className="text-[var(--text-secondary)]" />
              <span className="font-semibold text-[var(--text-pure)] tracking-tight">Campus PRN Verification</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-xs font-mono shrink-0">
              AS
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[var(--text-pure)] truncate flex items-center gap-2">
                <span>Aarav Sharma</span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-normal font-mono">CE &apos;26</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
                PRN: 72234012A · Roll: 33104
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between text-[11px] pt-1 text-[var(--text-secondary)] font-mono">
            <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
              <GitBranch size={13} className="text-[var(--text-tertiary)]" />
              <span>@aarav-sharma</span>
            </span>
            <span className="text-[10.5px] text-[var(--text-tertiary)] flex items-center gap-1">
              <Check size={11} className="text-emerald-500" />
              Linked
            </span>
          </div>
        </div>
      )
    },
    {
      step: "02",
      tagline: "CONTRIBUTION",
      title: "Structured Issue Claim & Team Pitch",
      subtitle: "Direct maintainer problem solving",
      description: "Browse curated beginner issues with maintainer guidance, or pitch directly for open engineering positions (Frontend, Embedded, ML) on active campus repositories.",
      footerIcon: Users,
      footerText: "Maintainer Code Review",
      footerTag: "1:1 Mentorship",
      renderMock: () => (
        <div className="rounded-xl bg-[var(--bg-surface-elevated)]/50 p-4 space-y-3 font-sans">
          {/* Header with repo breadcrumb and difficulty pill */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[var(--text-secondary)] text-[11px] font-medium flex items-center gap-1.5 truncate">
              <FolderGit2 size={13} className="text-[var(--text-tertiary)] shrink-0" />
              <span className="truncate">campus-ride-telemetry</span>
            </span>
            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium flex items-center gap-1">
              <Star size={10} className="text-amber-500 fill-amber-500" />
              <span>Starter Issue</span>
            </span>
          </div>

          {/* Issue Details Card */}
          <div className="p-3 rounded-lg bg-[var(--bg-surface)] space-y-2.5">
            <div className="text-xs font-semibold text-[var(--text-pure)] leading-snug flex items-baseline gap-1.5">
              <span className="text-[var(--text-tertiary)] font-mono text-[11px]">#18</span>
              <span>Configure SIM800L cellular fallback</span>
            </div>
            {/* TechBadge components with authentic SVGs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <TechBadge name="C++" size="sm" />
              <TechBadge name="ESP32" size="sm" />
              <TechBadge name="MQTT" size="sm" />
            </div>
          </div>

          {/* Footer with Maintainer and Interactive Claim Button */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="flex items-center gap-1.5 font-mono text-[var(--text-secondary)]">
              <span className="w-5 h-5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-[8.5px]">
                RD
              </span>
              <span>@rohan.deshmukh</span>
            </span>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setClaimedWorkflowTask(prev => !prev)}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                claimedWorkflowTask
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-default)]"
              }`}
            >
              <AnimatePresence mode="wait">
                {claimedWorkflowTask ? (
                  <motion.span 
                    key="claimed"
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    className="flex items-center gap-1 text-emerald-400 font-mono text-[10.5px]"
                  >
                    <Check size={11} />
                    <span>Claimed ✓</span>
                  </motion.span>
                ) : (
                  <motion.span 
                    key="claim"
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    className="flex items-center gap-1"
                  >
                    <span>Claim Task</span>
                    <ArrowRight size={10} className="text-[var(--text-tertiary)]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      )
    },
    {
      step: "03",
      tagline: "ATTRIBUTION",
      title: "Cryptographic Verified Attribution",
      subtitle: "Undeniable proof of engineering capability",
      description: "When your PR merges, automated webhooks generate an immutable contribution receipt with commit SHA, author identity, and department verification stamp.",
      footerIcon: ShieldCheck,
      footerText: "Signed Commit Receipt",
      footerTag: "Immutable",
      renderMock: () => (
        <div className="rounded-xl bg-[var(--bg-surface-elevated)]/50 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[var(--text-secondary)]" />
              <span className="font-semibold text-[var(--text-pure)]">Receipt #i2it-rec-99b2c3</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              PGP Signed
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface)] space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-tertiary)]">Action:</span>
              <span className="text-[var(--text-primary)] font-medium flex items-center gap-1">
                <GitMerge size={11} className="text-emerald-500" />
                pr_merged (PR #12)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-tertiary)]">Commit:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-primary)] font-mono">99b2c3d4e5f6</span>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    navigator.clipboard?.writeText("99b2c3d4e5f60718");
                    setCopiedWorkflowSha(true);
                    setTimeout(() => setCopiedWorkflowSha(false), 2000);
                  }}
                  className="p-1 rounded hover:bg-[var(--bg-surface-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-pure)] transition-colors cursor-pointer"
                  title="Copy Commit SHA"
                >
                  {copiedWorkflowSha ? (
                    <Check size={10} className="text-emerald-500" />
                  ) : (
                    <Copy size={10} />
                  )}
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-tertiary)]">Stamp:</span>
              <span className="text-[var(--text-secondary)] font-sans text-[11px]">Computer Engg &apos;26</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10.5px] pt-1 text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1 text-[var(--text-secondary)] font-sans">
              <Check size={11} className="text-emerald-500" />
              <span>Verified Attribution</span>
            </span>
            {copiedWorkflowSha ? (
              <motion.span 
                initial={{ opacity: 0, x: 4 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-emerald-500 text-[10.5px] font-semibold"
              >
                SHA Copied!
              </motion.span>
            ) : (
              <span className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1 font-sans">
                <span>Proof</span>
                <ExternalLink size={10} />
              </span>
            )}
          </div>
        </div>
      )
    }
  ];

  const faqs = [
    {
      q: "Who can participate and build on BuildLab by I2IT?",
      a: "Any student at International Institute of Information Technology (I2IT), Pune can sign in with GitHub and browse repositories. To claim tasks, talk with mentors, and post projects, complete your college PRN & Roll number verification for community approval."
    },
    {
      q: "I am a First-Year (FE) student with no open-source experience. Where do I start?",
      a: "Every college project has designated 'Good First Issues' (marked beginner) with suggested files and maintainer tips. Senior maintainers provide structured code reviews to help you get your first pull request merged without intimidation."
    },
    {
      q: "How does verified attribution work?",
      a: "When your pull request is merged into an active college repository, platform webhooks verify the git commit signature against your student profile, creating an undeniable, cryptographically backed contribution receipt on your public portfolio."
    },
    {
      q: "Can I list my Final Year Project (BE Project) or hackathon prototype here?",
      a: "Yes! You can publish your repository to recruit student contributors across departments, find specialized teammates (UI/UX, Frontend, Embedded), and maintain clean handover documentation."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent-primary)]/20 selection:text-[var(--accent-primary)]">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src="/icon.webp" 
              alt="BuildLab" 
              className="w-[36px] h-[36px] rounded-lg object-contain shrink-0 shadow-sm" 
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-[var(--text-pure)] tracking-tight">BuildLab</span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] whitespace-nowrap">by I2IT</span>
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)] -mt-0.5 font-mono hidden sm:inline">Open-Source Campus Engineering</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-[var(--text-secondary)]">
            <a href="#projects" className="hover:text-[var(--text-pure)] transition-colors cursor-pointer">Explore Projects</a>
            <a href="#workflow" className="hover:text-[var(--text-pure)] transition-colors cursor-pointer">Engineering Workflow</a>
            <a href="#faq" className="hover:text-[var(--text-pure)] transition-colors cursor-pointer">Guidelines & FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link 
                href="/dashboard"
                className="btn btn-primary btn-sm text-xs flex items-center gap-1.5 cursor-pointer font-medium"
                title={userEmail ? `Signed in as ${userEmail}` : "Open Workspace"}
              >
                <span>Workspace</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link 
                  href="/sign-in"
                  className="btn btn-secondary btn-sm text-xs hidden sm:flex items-center gap-1 cursor-pointer"
                >
                  <LogIn size={13} />
                  <span>Sign in</span>
                </Link>
                <Link 
                  href="/sign-up"
                  className="btn btn-primary btn-sm text-xs flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <span>Join Community</span>
                  <ArrowUpRight size={13} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section with Ambient Developer Workspace & Git Trust Layer */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[var(--border-subtle)]">
        {/* Subtle Spotlight Beam from top */}
        <Spotlight className="-top-40 left-0 md:left-40 md:-top-20" fill="white" />

        {/* Ambient Dot Grid with Radial Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none bg-dot-[var(--dot-color)] opacity-40 -z-10"
          style={{
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, transparent 75%)"
          }}
        />

        {/* Subtle Radial Ambient Neutral Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 pointer-events-none opacity-20 blur-3xl -z-10 bg-gradient-to-b from-white/10 to-transparent" 
        />

        {/* Developer Coding Ambient Stream in Background */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.04] dark:opacity-[0.09] flex justify-around text-xs font-mono -z-10"
          style={{
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, transparent 80%)"
          }}
        >
          {/* Column 1 of floating code */}
          <motion.div 
            animate={{ y: [0, -40, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="space-y-2 py-4"
          >
            {ambientCodeSnippets.slice(0, 10).map((line, idx) => (
              <div key={idx} className="whitespace-nowrap">
                <span className="text-[var(--text-tertiary)] mr-3 select-none">{(idx + 1).toString().padStart(2, '0')}</span>
                <span className={idx % 3 === 0 ? "text-sky-400" : idx % 2 === 0 ? "text-emerald-400" : "text-[var(--text-primary)]"}>
                  {line}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Column 2 of floating code */}
          <motion.div 
            animate={{ y: [-30, 10, -30] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="space-y-2 py-4 hidden md:block"
          >
            {ambientCodeSnippets.slice(5, 17).map((line, idx) => (
              <div key={idx} className="whitespace-nowrap">
                <span className="text-[var(--text-tertiary)] mr-3 select-none">{(idx + 11).toString().padStart(2, '0')}</span>
                <span className={idx % 2 === 0 ? "text-amber-400" : "text-violet-400"}>
                  {line}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Column 3 of floating code */}
          <motion.div 
            animate={{ y: [10, -30, 10] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="space-y-2 py-4 hidden lg:block"
          >
            {ambientCodeSnippets.slice(2, 14).map((line, idx) => (
              <div key={idx} className="whitespace-nowrap">
                <span className="text-[var(--text-tertiary)] mr-3 select-none">{(idx + 21).toString().padStart(2, '0')}</span>
                <span className={idx % 3 === 0 ? "text-cyan-400" : "text-emerald-300"}>
                  {line}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Hero Header Area with Framer Motion Stagger */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center space-y-5 max-w-3xl mx-auto"
          >
            {/* Status Pill with Official Git & GitHub Logos */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] text-[11.5px] text-[var(--text-secondary)] shadow-2xs cursor-default flex-wrap justify-center"
            >
              <span className="flex items-center gap-1.5 text-[var(--text-pure)] font-medium">
                <GitLogo className="w-3.5 h-3.5 shrink-0" />
                <span>Real Campus Repos</span>
              </span>
              <span className="text-[var(--text-tertiary)]">•</span>
              <span className="flex items-center gap-1.5 text-[var(--text-pure)] font-medium">
                <GitHubLogo className="w-3.5 h-3.5 shrink-0" />
                <span>Senior Mentored</span>
              </span>
              <span className="text-[var(--text-tertiary)]">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>I2IT Campus Verified</span>
              </span>
            </motion.div>

            {/* Main Headline - High-Hook Community Angle with Clean Monochrome Typography */}
            <h1 className="text-3xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight text-[var(--text-pure)] leading-[1.14]">
              Stop building clones alone.
              <span className="block mt-1.5 sm:mt-2.5 text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-pure)] via-[var(--text-pure)]/90 to-[var(--text-secondary)]">
                Ship real open source with campus peers.
              </span>
            </h1>

            {/* Reassuring, action-driven community subtitle */}
            <p className="text-xs sm:text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
              Escape tutorial hell. Team up across branches, claim beginner-friendly starter issues with 1-on-1 senior maintainer guidance, and turn your first merged pull request into verified proof recruiters actually respect.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#projects"
                className="px-5 py-2.5 rounded-xl bg-[var(--text-pure)] text-[var(--text-inverse)] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Terminal size={14} />
                <span>Explore Campus Projects ({initialProjects.length})</span>
              </motion.a>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href={isAuthenticated ? "/dashboard" : "/sign-up"}
                  className="px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:text-[var(--text-pure)] text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <GitHubLogo className="w-3.5 h-3.5 shrink-0" />
                  <span>{isAuthenticated ? "Open Workspace" : "Join with College Email"}</span>
                  <ArrowRight size={14} className="text-[var(--text-tertiary)]" />
                </Link>
              </motion.div>
            </div>

            {/* Live Community Developer Faces & Activity Strip */}
            <div className="pt-1 flex items-center justify-center gap-3.5 flex-wrap">
              <div className="flex items-center -space-x-2 shrink-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-400 border-2 border-[var(--bg-surface)] font-bold text-[10px] font-mono flex items-center justify-center shadow-xs" title="Aarav Sharma · CE '26">AS</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-400 border-2 border-[var(--bg-surface)] font-bold text-[10px] font-mono flex items-center justify-center shadow-xs" title="Ananya Kulkarni · IT '27">AK</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-400 border-2 border-[var(--bg-surface)] font-bold text-[10px] font-mono flex items-center justify-center shadow-xs" title="Rohan Deshmukh · ENTC '25">RD</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-amber-400 border-2 border-[var(--bg-surface)] font-bold text-[10px] font-mono flex items-center justify-center shadow-xs" title="Sneha Patil · AI&DS '26">SP</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-500/30 text-indigo-400 border-2 border-[var(--bg-surface)] font-bold text-[10px] font-mono flex items-center justify-center shadow-xs" title="Tanmay Joshi · CE '25">TJ</div>
              </div>

              <div className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5 flex-wrap justify-center">
                <span className="text-[var(--text-pure)] font-bold">140+ campus engineers</span>
                <span className="text-[var(--text-tertiary)]">•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <Flame size={12} className="text-amber-500 fill-amber-500" />
                  <span>24 pull requests merged this week</span>
                </span>
              </div>
            </div>

            {/* Quick Git Clone Snippet */}
            <div className="pt-1 flex justify-center">
              <motion.div 
                whileHover={{ borderColor: "var(--border-hover)" }}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11.5px] font-mono text-[var(--text-secondary)] shadow-2xs"
              >
                <GitLogo className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[190px] sm:max-w-none">git clone https://github.com/college-dev/i2it-community</span>
                <button
                  type="button"
                  onClick={copyCloneCmd}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-pure)] transition-colors ml-1 cursor-pointer"
                  title="Copy command"
                >
                  {copiedCmd ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Interactive Hero Showcase / Code Preview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="mt-12 sm:mt-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl overflow-hidden"
          >
            {/* Terminal Window Header Bar */}
            <div className="px-4 py-3 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs text-[var(--text-tertiary)] font-mono ml-2 hidden sm:inline">
                  i2it-campus-terminal — zsh
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveHeroTab('cli')}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    activeHeroTab === 'cli'
                      ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] shadow-2xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  cli-session.sh
                </button>
                <button
                  type="button"
                  onClick={() => setActiveHeroTab('receipt')}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    activeHeroTab === 'receipt'
                      ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] shadow-2xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  verified-receipt.json
                </button>
              </div>
            </div>

            {/* Terminal Body Content */}
            <div className="p-5 sm:p-6 font-mono text-xs leading-relaxed overflow-x-auto bg-[var(--code-bg, #0b0f19)] min-h-[210px]">
              <AnimatePresence mode="wait">
                {activeHeroTab === 'cli' ? (
                  <motion.div 
                    key="cli"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                      <span className="text-emerald-400 font-bold">student@i2it-macbook</span>
                      <span>~</span>
                      <span className="text-[var(--text-pure)]">$ gh i2it list --active-openings</span>
                    </div>
                    <div className="pl-4 space-y-1 text-[var(--text-secondary)]">
                      <p className="text-[var(--text-pure)] font-semibold">
                        [Found 5 Active Campus Repositories]
                      </p>
                      <p>
                        <span className="text-blue-400 font-medium">1. campus-ride-telemetry</span>
                        <span className="text-[var(--text-tertiary)]"> · Maintainer: @rohan.deshmukh · </span>
                        <span className="text-emerald-400">2 roles open (IoT Lead, Frontend)</span>
                      </p>
                      <p>
                        <span className="text-blue-400 font-medium">2. lab-scheduler-iot</span>
                        <span className="text-[var(--text-tertiary)]"> · Maintainer: @aarav.sharma · </span>
                        <span className="text-amber-400">1 beginner issue claimable</span>
                      </p>
                      <p>
                        <span className="text-blue-400 font-medium">3. campus-attendance-ocr</span>
                        <span className="text-[var(--text-tertiary)]"> · Maintainer: @priya.patel · </span>
                        <span className="text-purple-400">FastAPI backend contributor seeking</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--text-tertiary)] pt-2">
                      <span className="text-emerald-400 font-bold">student@i2it-macbook</span>
                      <span>~</span>
                      <span className="text-[var(--text-pure)]">$ gh i2it claim --issue #12 --project lab-scheduler-iot</span>
                    </div>
                    <div className="pl-4 space-y-1 text-emerald-400">
                      <p>✓ Issue Claimed: &quot;Fix CSRF header mismatch on student reservation API&quot;</p>
                      <p className="text-[var(--text-secondary)]">
                        → Branch created: <span className="text-blue-400">feat/csrf-header-fix</span>
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        → Peer review assigned to Maintainer <span className="text-[var(--text-pure)]">@aarav.sharma</span>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="receipt"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 text-[var(--text-secondary)]"
                  >
                    <div className="text-[var(--text-tertiary)]">// Cryptographically signed student contribution receipt</div>
                    <pre className="text-[11px] leading-snug text-emerald-300">
{`{
  "receiptId": "rec_i2it_2026_commit_99b2c3",
  "project": "college-dev/campus-ride-telemetry",
  "contributor": {
    "name": "Aarav Sharma",
    "handle": "aarav.sharma",
    "department": "Computer Engineering · 2026",
    "collegeVerified": true
  },
  "action": "pr_merged",
  "commitSha": "99b2c3d4e5f6071829aa82736412b1",
  "verifiedBy": "I2IT College Developer Layer [PGP-Key: 0x82A1B4F]",
  "timestamp": "2026-10-29T14:22:10Z"
}`}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Social Proof Stats Strip - Enhanced Engineering Telemetry */}
          <div className="mt-14 pt-8 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="uppercase tracking-wider font-semibold text-[11px] text-[var(--text-secondary)]">Live Campus Network Telemetry</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)] hidden sm:inline">
                Synced with GitHub Webhooks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Card 1: Active Repositories */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative group p-4 sm:p-4.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-elevated)]/60 transition-all text-left shadow-2xs overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <FolderGit2 size={16} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Production
                  </span>
                </div>

                <div className="mt-3.5">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--text-pure)] tracking-tight">
                    {initialProjects.length > 0 ? initialProjects.length : 5}
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-pure)] mt-0.5">
                    Active Repositories
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                    IoT, Web &amp; ML systems open for student PRs
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                  <span>GitHub Sync</span>
                  <span className="text-[var(--text-secondary)]">100% Open Source</span>
                </div>
              </motion.div>

              {/* Card 2: Claimable Tasks */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative group p-4 sm:p-4.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-elevated)]/60 transition-all text-left shadow-2xs overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Flame size={16} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex items-center gap-1">
                    <Star size={9} className="fill-amber-400" />
                    Starter Issues
                  </span>
                </div>

                <div className="mt-3.5">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--text-pure)] tracking-tight">
                    {totalTasks > 0 ? totalTasks : 18}+
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-pure)] mt-0.5">
                    Claimable Issues
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                    Curated starter tasks with step-by-step guidance
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                  <span>Mentorship</span>
                  <span className="text-amber-400 font-medium">1:1 Maintainer Review</span>
                </div>
              </motion.div>

              {/* Card 3: Campus Identity Verified */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative group p-4 sm:p-4.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-elevated)]/60 transition-all text-left shadow-2xs overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    I2IT SSO
                  </span>
                </div>

                <div className="mt-3.5">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                    100%
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-pure)] mt-0.5">
                    Campus Verified
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                    Authentic college PRN & student roster verification
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                  <span>Trust Level</span>
                  <span className="text-emerald-400 font-medium">Zero Ghost Bots</span>
                </div>
              </motion.div>

              {/* Card 4: Peer Review Loop */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative group p-4 sm:p-4.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-elevated)]/60 transition-all text-left shadow-2xs overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <GitPullRequest size={16} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium flex items-center gap-1">
                    <Clock size={9} />
                    Median SLA
                  </span>
                </div>

                <div className="mt-3.5">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-400 tracking-tight">
                    &lt; 24h
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-pure)] mt-0.5">
                    Peer Review Turnaround
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                    Constructive senior feedback before every merge
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                  <span>Attribution</span>
                  <span className="text-indigo-400 font-medium">Signed PR Receipts</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section id="projects" className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--accent-primary)] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                <span>Campus Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-pure)] tracking-tight mt-1">
                Active Student Repositories
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Real college projects actively recruiting student contributors right now.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs overflow-x-auto max-w-full no-scrollbar flex-nowrap sm:flex-wrap self-start sm:self-auto py-1.5 px-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setFilterTrack('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTrack === 'all'
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All Projects
              </button>
              <button
                type="button"
                onClick={() => setFilterTrack('beginner')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTrack === 'beginner'
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Beginner Friendly
              </button>
              <button
                type="button"
                onClick={() => setFilterTrack('typescript')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTrack === 'typescript'
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                TypeScript / Web
              </button>
              <button
                type="button"
                onClick={() => setFilterTrack('python')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTrack === 'python'
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Python / AI
              </button>
              <button
                type="button"
                onClick={() => setFilterTrack('iot')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filterTrack === 'iot'
                    ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-pure)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                IoT & Embedded
              </button>
            </div>
          </div>

          {/* Search Box with Global '/' Shortcut */}
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, tech stack, or topic..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--text-pure)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] shadow-2xs">
                /
              </kbd>
            </div>
          </div>

          {/* Project Cards Grid with Framer Motion Layout */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filteredProjects.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full py-16 text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl"
                >
                  No matching campus projects found for your filter.
                </motion.div>
              ) : (
                filteredProjects.map((project) => {
                  const mat = getMaturityColor(project.maturity);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      whileHover={{ y: -4, transition: { duration: 0.15 } }}
                      key={project.id}
                      className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all shadow-2xs hover:shadow-md cursor-pointer"
                    >
                      <div className="space-y-3.5">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                          <span className="flex items-center gap-1.5 font-medium capitalize text-[var(--text-secondary)]">
                            <span className={`w-1.5 h-1.5 rounded-full ${mat.dot}`} />
                            <span>{project.maturity}</span>
                          </span>

                          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
                            {project.owner.branchOrMajor}
                          </span>
                        </div>

                        {/* Title & Summary */}
                        <div>
                          <h3 className="font-bold text-base text-[var(--text-pure)] group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                            {project.name}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">
                            {project.summary}
                          </p>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {project.skills.slice(0, 3).map((sk, idx) => (
                            <TechBadge key={idx} name={sk} />
                          ))}
                          {project.skills.length > 3 && (
                            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                              +{project.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Metadata & Link */}
                      <div className="pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                        <div className="flex items-center gap-1.5">
                          <Users size={13} />
                          <span>{project.collaboratorsCount} team</span>
                        </div>

                        {project.openRoles.length > 0 ? (
                          <span className="text-[11px] font-mono text-amber-500 font-medium">
                            {project.openRoles.length} role{project.openRoles.length > 1 ? 's' : ''} open
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                            Active team
                          </span>
                        )}

                        <Link 
                          href="/dashboard"
                          className="text-[var(--text-secondary)] hover:text-[var(--text-pure)] inline-flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <span>View</span>
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>

          <div className="text-center pt-4">
            <Link 
              href="/dashboard"
              className="btn btn-secondary text-xs inline-flex items-center gap-2 cursor-pointer font-medium px-5 py-2.5 rounded-xl shadow-2xs"
            >
              <span>View all repositories in student workspace</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Redesigned Bento Workflow Section (Upgraded from Plain 01/02/03 Boxes) */}
      <section id="workflow" className="py-16 sm:py-24 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)]">
              <Zap size={12} className="text-[var(--accent-primary)]" />
              <span className="font-semibold text-[var(--text-pure)]">How It Works</span>
              <span className="text-[var(--text-tertiary)]">• 3-Step Lifecycle</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-pure)] tracking-tight">
              From first clone to verified contribution credit.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              No dead repository links or uncoordinated WhatsApp groups. Every contribution is structured, reviewed, and permanently verifiable.
            </p>
          </div>

          {/* Interactive Bento Grid Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {workflowSteps.map((step, idx) => {
              const FooterIcon = step.footerIcon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.12 }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    {/* Step Header */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[var(--text-pure)] tracking-wider">
                        {step.step}
                      </span>
                      <span className="text-[10.5px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                        {step.tagline}
                      </span>
                    </div>

                    {/* Embedded Rich Live UI Graphic */}
                    <div>
                      {step.renderMock()}
                    </div>

                    {/* Title & Copy */}
                    <div className="space-y-1.5 pt-1">
                      <h3 className="font-bold text-base sm:text-lg text-[var(--text-pure)] tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Clean Technical Metadata Footer */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FooterIcon size={13} className="shrink-0 text-[var(--text-tertiary)]" />
                      <span>{step.footerText}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-tertiary)] font-medium">
                      {step.footerTag}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Student Perspectives & Verified Work Floating Infinite Stream */}
      <section className="py-20 sm:py-28 border-b border-[var(--border-subtle)] relative overflow-hidden bg-[var(--bg-canvas)]">
        {/* Ambient Subtle Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)]">
              <Sparkles size={12} className="text-amber-400" />
              <span className="font-semibold text-[var(--text-pure)]">Student Perspectives</span>
              <span className="text-[var(--text-tertiary)]">• Verified Work</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-pure)] tracking-tight">
              Built by students, for students.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Real college repositories, active beginner issues, and peer reviews. Here is what contributors and maintainers across campus departments say.
            </p>
          </div>

          {/* Floating Infinite Marquee Streams */}
          <div className="relative w-full overflow-hidden perspective-marquee-container space-y-5 py-2">
            {/* Left and Right Smooth Gradient Masks */}
            <div className="pointer-events-none absolute left-0 inset-y-0 w-16 sm:w-44 bg-gradient-to-r from-[var(--bg-canvas)] via-[var(--bg-canvas)]/85 to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 inset-y-0 w-16 sm:w-44 bg-gradient-to-l from-[var(--bg-canvas)] via-[var(--bg-canvas)]/85 to-transparent z-20" />

            {/* Row 1: Sliding Left */}
            <div className="perspective-marquee-track-left flex gap-5">
              {[...row1Perspectives, ...row1Perspectives].map((item, idx) => (
                <div 
                  key={`r1-${item.id}-${idx}`}
                  className="w-[285px] sm:w-[410px] shrink-0 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 group select-none relative"
                >
                  {/* Card Top: Avatar, Name, Department & Proof Stamp */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.avatarGradient} border font-bold text-xs flex items-center justify-center font-mono shrink-0 shadow-2xs relative`}>
                        {item.avatarInitials}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[var(--text-pure)] group-hover:text-[var(--accent-primary)] transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                            {item.github}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] font-medium truncate">
                          {item.department} · {item.year}
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium border bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-emerald-400 shrink-0">
                      <GitMerge size={11} className="shrink-0" />
                      <span>{item.proofBadge}</span>
                    </div>
                  </div>

                  {/* Card Body: Quote with subtle quote icon */}
                  <div className="relative pt-1">
                    <Quote size={16} className="text-[var(--text-tertiary)]/20 absolute -top-1 left-0 pointer-events-none" />
                    <p className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-relaxed pl-4 italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Card Bottom: Repo context & Tech stack badges */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-mono text-[10.5px] truncate max-w-[190px]">
                      <FolderGit2 size={12} className="shrink-0 text-[var(--text-tertiary)]" />
                      <span className="truncate">{item.projectName}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.skills.map((skill, skIdx) => (
                        <span key={skIdx} className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Sliding Right (Reverse) */}
            <div className="perspective-marquee-track-right flex gap-5">
              {[...row2Perspectives, ...row2Perspectives].map((item, idx) => (
                <div 
                  key={`r2-${item.id}-${idx}`}
                  className="w-[285px] sm:w-[410px] shrink-0 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-300 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 group select-none relative"
                >
                  {/* Card Top: Avatar, Name, Department & Proof Stamp */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.avatarGradient} border font-bold text-xs flex items-center justify-center font-mono shrink-0 shadow-2xs relative`}>
                        {item.avatarInitials}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[var(--text-pure)] group-hover:text-[var(--accent-primary)] transition-colors truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                            {item.github}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] font-medium truncate">
                          {item.department} · {item.year}
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium border bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-cyan-400 shrink-0">
                      {item.proofType === 'review' ? (
                        <CheckCircle2 size={11} className="shrink-0" />
                      ) : (
                        <GitMerge size={11} className="shrink-0 text-emerald-400" />
                      )}
                      <span>{item.proofBadge}</span>
                    </div>
                  </div>

                  {/* Card Body: Quote with subtle quote icon */}
                  <div className="relative pt-1">
                    <Quote size={16} className="text-[var(--text-tertiary)]/20 absolute -top-1 left-0 pointer-events-none" />
                    <p className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-relaxed pl-4 italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Card Bottom: Repo context & Tech stack badges */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-mono text-[10.5px] truncate max-w-[190px]">
                      <FolderGit2 size={12} className="shrink-0 text-[var(--text-tertiary)]" />
                      <span className="truncate">{item.projectName}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.skills.map((skill, skIdx) => (
                        <span key={skIdx} className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Footer Indicator */}
          <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-tertiary)] pt-2 flex-wrap">
            <span className="flex items-center gap-1.5 font-mono text-[11px] px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hover any card to pause stream</span>
            </span>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              Over 140+ student pull requests merged across 18 campus repositories
            </span>
          </div>
        </div>
      </section>

      {/* Guidelines & FAQ Section with Framer Motion Accordion */}
      <section id="faq" className="py-16 sm:py-24 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)]">
              <HelpCircle size={12} className="text-[var(--text-tertiary)]" />
              <span className="font-semibold text-[var(--text-pure)]">Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-pure)] tracking-tight">
              Everything you need to know.
            </h2>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[var(--text-pure)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-[var(--text-tertiary)] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]/60 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 sm:py-28 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-pure)] tracking-tight">
            Ready to ship real code this semester?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            Join other I2IT engineers turning hobby projects into open-source repositories and verified contributions.
          </p>

          <div className="pt-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link 
                href={isAuthenticated ? "/dashboard" : "/sign-up"}
                className="px-6 py-3 rounded-xl bg-[var(--text-pure)] text-[var(--text-inverse)] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
              >
                <span>{isAuthenticated ? "Enter Workspace" : "Get Started with College ID"}</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border-subtle)] py-8 text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5 font-mono text-[11px] justify-center sm:justify-start">
            <img 
              src="/icon.webp" 
              alt="BuildLab" 
              className="w-5 h-5 rounded-sm object-contain shrink-0" 
            />
            <span className="leading-relaxed">BuildLab by I2IT • Hope Foundation&apos;s International Institute of Information Technology, Pune</span>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11.5px] flex-wrap">
            <Link href="/sign-in" className="hover:text-[var(--text-primary)] transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-[var(--text-primary)] transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Workspace</Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
