import React, { useState, useRef } from 'react';
import { Project, RoleCategory, OpenRole, StudentProfile, ProjectReadme } from '../types';
import { 
  X, 
  Lightbulb, 
  Globe, 
  FileText, 
  PenLine, 
  Code2, 
  Database,
  Palette, 
  Settings, 
  GraduationCap, 
  Star, 
  ChevronRight, 
  ExternalLink, 
  Zap, 
  Info, 
  User, 
  Send,
  Plus, 
  Minus,
  Rocket,
  Check,
  Smartphone,
  Sparkles,
  Layers,
  Server,
  Shield,
  BookOpen,
  Cpu,
  Bug,
  Upload,
  RefreshCw,
  FileCode
} from 'lucide-react';
import { TechBadge, getTechIcon } from './ui/TechBadge';
import { MarkdownRenderer } from './ui/MarkdownRenderer';
import { fetchReadmeFromGithub, readUploadedFileAsText, parseReadmeMarkdown } from '../lib/readmeService';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (newProject: Omit<Project, 'id' | 'createdAt' | 'lastActivity' | 'verifiedCommitsCount' | 'collaboratorsCount'>) => void;
  currentUser: StudentProfile;
}

// Crisp GitHub Octocat SVG
const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);


export type TechCategory = 'all' | 'frontend' | 'backend' | 'database' | 'mobile' | 'ai_systems';

interface TechStackItem {
  id: string;
  label: string;
  category: 'frontend' | 'backend' | 'database' | 'mobile' | 'ai_systems';
}

// Arranged in best logical developer order:
// 1. Frontend & Web -> 2. Backend & APIs -> 3. Databases & Cloud -> 4. Mobile -> 5. AI & Systems
const TECH_STACK_ITEMS: TechStackItem[] = [
  // 1. Frontend & Modern Web
  { id: 'TypeScript', label: 'TypeScript', category: 'frontend' },
  { id: 'React 19', label: 'React 19', category: 'frontend' },
  { id: 'Next.js 15', label: 'Next.js 15', category: 'frontend' },
  { id: 'Tailwind CSS', label: 'Tailwind CSS', category: 'frontend' },
  { id: 'GraphQL', label: 'GraphQL', category: 'frontend' },

  // 2. Backend & APIs
  { id: 'Node.js', label: 'Node.js', category: 'backend' },
  { id: 'Python', label: 'Python', category: 'backend' },
  { id: 'FastAPI', label: 'FastAPI', category: 'backend' },
  { id: 'Django', label: 'Django', category: 'backend' },
  { id: 'Go', label: 'Go', category: 'backend' },
  { id: 'Java', label: 'Java', category: 'backend' },

  // 3. Databases & Cloud
  { id: 'PostgreSQL', label: 'PostgreSQL', category: 'database' },
  { id: 'Redis', label: 'Redis', category: 'database' },
  { id: 'MongoDB', label: 'MongoDB', category: 'database' },
  { id: 'Supabase', label: 'Supabase', category: 'database' },
  { id: 'Prisma', label: 'Prisma', category: 'database' },
  { id: 'Docker', label: 'Docker', category: 'database' },

  // 4. Mobile Apps
  { id: 'React Native', label: 'React Native', category: 'mobile' },
  { id: 'Flutter', label: 'Flutter', category: 'mobile' },
  { id: 'Swift', label: 'Swift', category: 'mobile' },
  { id: 'Kotlin', label: 'Kotlin', category: 'mobile' },

  // 5. AI, Systems & Embedded
  { id: 'PyTorch', label: 'PyTorch', category: 'ai_systems' },
  { id: 'Rust', label: 'Rust', category: 'ai_systems' },
  { id: 'C++', label: 'C++', category: 'ai_systems' },
  { id: 'OpenCV', label: 'OpenCV', category: 'ai_systems' },
  { id: 'WebAssembly', label: 'WebAssembly', category: 'ai_systems' },
  { id: 'HTMX', label: 'HTMX', category: 'ai_systems' }
];

interface RoleConfig {
  id: RoleCategory;
  title: string;
  shortTitle?: string;
  icon: React.ReactNode;
  recommendedSkills: string[];
  fullWidth?: boolean;
}

const ROLE_CONFIGS: RoleConfig[] = [
  { 
    id: 'frontend', 
    title: 'Frontend Engineer', 
    shortTitle: 'Frontend',
    icon: <Code2 size={14} className="text-sky-500 shrink-0" />,
    recommendedSkills: ['React', 'TypeScript', 'Tailwind CSS']
  },
  { 
    id: 'backend', 
    title: 'Backend / API', 
    shortTitle: 'Backend',
    icon: <Settings size={14} className="text-emerald-500 shrink-0" />,
    recommendedSkills: ['Node.js', 'Go', 'FastAPI', 'WebSockets']
  },
  { 
    id: 'fullstack', 
    title: 'Full Stack Engineer', 
    shortTitle: 'Full Stack',
    icon: <Layers size={14} className="text-indigo-500 shrink-0" />,
    recommendedSkills: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma']
  },
  { 
    id: 'ui_design', 
    title: 'UI / UX Design', 
    shortTitle: 'UI / UX',
    icon: <Palette size={14} className="text-pink-500 shrink-0" />,
    recommendedSkills: ['Figma', 'Tailwind CSS', 'Design Systems']
  },
  { 
    id: 'mobile', 
    title: 'Mobile App Developer', 
    shortTitle: 'Mobile',
    icon: <Smartphone size={14} className="text-cyan-500 shrink-0" />,
    recommendedSkills: ['Flutter', 'React Native', 'Swift', 'Kotlin']
  },
  { 
    id: 'ai_ml', 
    title: 'AI / ML & Data', 
    shortTitle: 'AI / ML',
    icon: <Sparkles size={14} className="text-amber-500 shrink-0" />,
    recommendedSkills: ['PyTorch', 'Python', 'LLMs', 'LangChain', 'FastAPI']
  },
  { 
    id: 'devops', 
    title: 'DevOps & Cloud', 
    shortTitle: 'DevOps',
    icon: <Server size={14} className="text-blue-500 shrink-0" />,
    recommendedSkills: ['Docker', 'GitHub Actions', 'AWS', 'Kubernetes']
  },
  { 
    id: 'database', 
    title: 'Database / Cache', 
    shortTitle: 'Database',
    icon: <Database size={14} className="text-rose-500 shrink-0" />,
    recommendedSkills: ['PostgreSQL', 'Redis', 'Supabase', 'SQL Tuning']
  },
  { 
    id: 'auth', 
    title: 'Auth & Security', 
    shortTitle: 'Security',
    icon: <Shield size={14} className="text-violet-500 shrink-0" />,
    recommendedSkills: ['OAuth 2.0', 'JWT', 'Auth.js', 'Pen-testing']
  },
  { 
    id: 'qa_testing', 
    title: 'QA & Test Automation', 
    shortTitle: 'QA / Test',
    icon: <Bug size={14} className="text-orange-500 shrink-0" />,
    recommendedSkills: ['Playwright', 'Jest', 'Cypress', 'Integration Tests']
  },
  { 
    id: 'docs_writer', 
    title: 'Technical Writer & Docs', 
    shortTitle: 'Docs',
    icon: <BookOpen size={14} className="text-teal-500 shrink-0" />,
    recommendedSkills: ['Markdown', 'OpenAPI', 'API Docs', 'Tutorials']
  },
  { 
    id: 'hardware_iot', 
    title: 'Hardware & IoT', 
    shortTitle: 'Hardware',
    icon: <Cpu size={14} className="text-amber-600 shrink-0" />,
    recommendedSkills: ['ESP32', 'Arduino', 'C++', 'Raspberry Pi', 'Firmware']
  }
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onCreate,
  currentUser
}) => {
  // Mode: Existing GitHub Repo vs Early Idea / Concept
  const [isIdeaStage, setIsIdeaStage] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [currentStack, setCurrentStack] = useState<string[]>([
    'TypeScript', 'React 19', 'Tailwind CSS'
  ]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customStackInput, setCustomStackInput] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [selectedTechCategory, setSelectedTechCategory] = useState<TechCategory>('all');

  // Collaborator Openings
  const [selectedRoles, setSelectedRoles] = useState<Record<RoleCategory, boolean>>({
    frontend: true,
    backend: false,
    fullstack: false,
    ui_design: true,
    mobile: false,
    ai_ml: false,
    devops: false,
    database: false,
    auth: false,
    qa_testing: false,
    docs_writer: false,
    hardware_iot: false
  });

  const [roleCounts, setRoleCounts] = useState<Record<RoleCategory, number>>({
    frontend: 1,
    backend: 1,
    fullstack: 1,
    ui_design: 1,
    mobile: 1,
    ai_ml: 1,
    devops: 1,
    database: 1,
    auth: 1,
    qa_testing: 1,
    docs_writer: 1,
    hardware_iot: 1
  });

  // README Documentation State
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [readmeSource, setReadmeSource] = useState<'github_auto' | 'file_upload' | 'manual' | null>(null);
  const [readmeFileName, setReadmeFileName] = useState<string>('README.md');
  const [readmeFileSize, setReadmeFileSize] = useState<string>('');
  const [isFetchingReadme, setIsFetchingReadme] = useState(false);
  const [readmeStatusMsg, setReadmeStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showReadmeEditor, setShowReadmeEditor] = useState(false);
  const [readmePreviewTab, setReadmePreviewTab] = useState<'preview' | 'edit'>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect project name from GitHub repository URL
  const handleRepoUrlChange = (url: string) => {
    setRepoUrl(url);
    if (!name.trim() && url) {
      try {
        const cleaned = url.replace(/\/+$/, '');
        const segments = cleaned.split('/');
        if (segments.length >= 2) {
          const repoSlug = segments[segments.length - 1];
          if (repoSlug && !repoSlug.includes('.')) {
            const formatted = repoSlug
              .replace(/[-_]+/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            setName(formatted);
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }
  };

  const handleFetchGithubReadme = async () => {
    if (!repoUrl.trim()) {
      setReadmeStatusMsg({ text: 'Please enter a GitHub repository URL first.', type: 'error' });
      return;
    }
    setIsFetchingReadme(true);
    setReadmeStatusMsg(null);
    try {
      const result = await fetchReadmeFromGithub(repoUrl.trim());
      setReadmeContent(result.markdown);
      setReadmeSource('github_auto');
      setReadmeFileName('README.md');
      setReadmeFileSize(result.fileSize);
      setReadmeStatusMsg({ 
        text: `README.md synced from GitHub (${result.fileSize})`, 
        type: 'success' 
      });
      setShowReadmeEditor(true);
      setReadmePreviewTab('preview');
      // Auto-populate summary if empty
      if (!summary.trim()) {
        const parsed = parseReadmeMarkdown(result.markdown, name || 'Campus Project', 'github_auto');
        if (parsed.extractedSummary) {
          setSummary(parsed.extractedSummary.slice(0, 140));
        }
      }
    } catch (err: any) {
      setReadmeStatusMsg({ 
        text: err.message || 'Could not fetch README from GitHub. You can upload a file instead.', 
        type: 'error' 
      });
    } finally {
      setIsFetchingReadme(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await readUploadedFileAsText(file);
      setReadmeContent(result.markdown);
      setReadmeSource('file_upload');
      setReadmeFileName(result.fileName);
      setReadmeFileSize(result.fileSize);
      setReadmeStatusMsg({ 
        text: `Uploaded "${result.fileName}" (${result.fileSize})`, 
        type: 'success' 
      });
      setShowReadmeEditor(true);
      setReadmePreviewTab('preview');
      if (!summary.trim()) {
        const parsed = parseReadmeMarkdown(result.markdown, name || 'Campus Project', 'file_upload', result.fileName);
        if (parsed.extractedSummary) {
          setSummary(parsed.extractedSummary.slice(0, 140));
        }
      }
    } catch (err: any) {
      setReadmeStatusMsg({ text: err.message || 'Error reading file.', type: 'error' });
    }
  };

  const handleRemoveReadme = () => {
    setReadmeContent('');
    setReadmeSource(null);
    setReadmeFileSize('');
    setReadmeStatusMsg(null);
    setShowReadmeEditor(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleTech = (tech: string) => {
    if (currentStack.includes(tech)) {
      setCurrentStack(currentStack.filter(s => s !== tech));
    } else {
      setCurrentStack([...currentStack, tech]);
    }
  };

  const handleAddCustomTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && customStackInput.trim()) {
      e.preventDefault();
      const val = customStackInput.trim().replace(/^,|,$/g, '');
      if (val) {
        if (!currentStack.includes(val)) {
          setCurrentStack([...currentStack, val]);
        }
        if (!customTags.includes(val)) {
          setCustomTags([...customTags, val]);
        }
      }
      setCustomStackInput('');
    }
  };

  const handleRemoveCustomTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(t => t !== tagToRemove));
    setCurrentStack(currentStack.filter(s => s !== tagToRemove));
    if (editingTag === tagToRemove) {
      setEditingTag(null);
    }
  };

  const handleStartEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditingTagValue(tag);
  };

  const handleSaveEditTag = (oldTag: string) => {
    const trimmed = editingTagValue.trim();
    if (trimmed && trimmed !== oldTag) {
      setCustomTags(customTags.map(t => t === oldTag ? trimmed : t));
      setCurrentStack(currentStack.map(s => s === oldTag ? trimmed : s));
    }
    setEditingTag(null);
  };

  const toggleRole = (cat: RoleCategory) => {
    setSelectedRoles(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const incrementRole = (cat: RoleCategory) => {
    setRoleCounts(prev => ({
      ...prev,
      [cat]: Math.min(5, (prev[cat] || 1) + 1)
    }));
  };

  const decrementRole = (cat: RoleCategory) => {
    setRoleCounts(prev => ({
      ...prev,
      [cat]: Math.max(1, (prev[cat] || 1) - 1)
    }));
  };

  const activeRolesCount = Object.values(selectedRoles).filter(Boolean).length;

  const filteredTechItems = selectedTechCategory === 'all'
    ? TECH_STACK_ITEMS
    : TECH_STACK_ITEMS.filter(item => item.category === selectedTechCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const openRoles: OpenRole[] = [];
    ROLE_CONFIGS.forEach(roleConf => {
      if (selectedRoles[roleConf.id]) {
        openRoles.push({
          role: roleConf.title,
          category: roleConf.id,
          count: roleCounts[roleConf.id] || 1,
          description: `Collaborator needed for ${roleConf.title.toLowerCase()} on this project.`,
          lookingForSkills: roleConf.recommendedSkills
        });
      }
    });

    const parsedReadme: ProjectReadme | undefined = readmeContent.trim()
      ? parseReadmeMarkdown(readmeContent, name, readmeSource || 'manual', readmeFileName, readmeFileSize)
      : undefined;

    onCreate({
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: summary.trim() || 'Campus developer collaboration project.',
      problemStatement: 'Created to solve campus student workflow and engineering challenges.',
      track: 'independent',
      maturity: isIdeaStage ? 'idea' : 'active',
      repoUrl: isIdeaStage ? undefined : repoUrl.trim() || undefined,
      license: isIdeaStage ? 'Unspecified (Idea stage)' : 'MIT',
      skills: currentStack.length > 0 ? currentStack : ['TypeScript', 'React'],
      currentStack: currentStack.length > 0 ? currentStack : ['TypeScript', 'React 19', 'Tailwind CSS'],
      openRoles: openRoles.length > 0 ? openRoles : [{ role: 'Collaborator', count: 1, description: 'Open to campus help' }],
      setupGuide: isIdeaStage ? undefined : `git clone ${repoUrl || 'https://github.com/campus-dev/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}\nnpm install\nnpm run dev`,
      firstIssues: [],
      readme: parsedReadme,
      owner: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        collegeVerified: currentUser.collegeVerified,
        avatarUrl: currentUser.avatarUrl,
        branchOrMajor: currentUser.bio.split('.')[0] || 'Computer Science'
      },
      starsCount: isIdeaStage ? 0 : 1,
      contributorAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      ]
    });

    onClose();
  };

  return (
    <div 
      className="c-modal-overlay fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="c-modal-card w-full max-w-[960px] max-h-[92vh] rounded-2xl flex flex-col overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="c-modal-header px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="c-modal-surface-elevated w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <Rocket size={16} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-pure)]">
                Publish Project
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                List your repository or concept to recruit student collaborators on campus.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="c-modal-body p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Form Inputs */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Segmented Mode Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl c-modal-surface text-xs">
                <button
                  type="button"
                  onClick={() => setIsIdeaStage(false)}
                  className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !isIdeaStage 
                      ? 'c-modal-surface-elevated text-[var(--text-pure)] shadow-xs font-semibold' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <GithubIcon size={14} className="text-[var(--text-primary)]" />
                  <span>Existing GitHub Repo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsIdeaStage(true)}
                  className={`py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isIdeaStage 
                      ? 'c-modal-surface-elevated text-[var(--text-pure)] shadow-xs font-semibold' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Early Idea / Concept</span>
                </button>
              </div>

              {/* GitHub Repository URL Input */}
              {!isIdeaStage && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[var(--text-primary)]">
                      GitHub Repository URL
                    </label>
                    <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                      <span>Public repos</span>
                      <Globe size={11} className="text-[var(--text-tertiary)]" />
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                      <GithubIcon size={14} />
                    </span>
                    <input
                      type="text"
                      className="c-modal-input w-full text-xs pl-10 pr-3.5 py-2.5 rounded-lg transition-all"
                      placeholder="https://github.com/organization/repository"
                      value={repoUrl}
                      onChange={(e) => handleRepoUrlChange(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Project Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text-primary)]">
                    Project Name <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  {name && (
                    <span className="text-[10.5px] text-[var(--accent-primary)] font-mono">
                      slug: /{name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                    <FileText size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    className="c-modal-input w-full text-xs pl-10 pr-3.5 py-2.5 rounded-lg transition-all"
                    placeholder="e.g. Campus Ride Telemetry, Course Prerequisite DAG"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* One-Line Headline Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text-primary)]">
                    One-Line Headline Summary
                  </label>
                  <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">
                    {summary.length}/100
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                    <PenLine size={14} />
                  </span>
                  <input
                    type="text"
                    maxLength={100}
                    className="c-modal-input w-full text-xs pl-10 pr-3.5 py-2.5 rounded-lg transition-all"
                    placeholder="Sub-second real-time telemetry and arrival prediction for students"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>
              </div>

              {/* Project Documentation (README.md) Auto-Sync & Upload */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[var(--accent-primary)]" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      Project README.md & Overview
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">
                    {readmeContent ? `${(new Blob([readmeContent]).size / 1024).toFixed(1)} KB` : 'Optional'}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Add your README to auto-generate system architecture diagrams, feature checklists, and contributor setup commands.
                </p>

                {/* Hidden file input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".md,.markdown,.txt"
                  className="hidden"
                />

                {/* Action Row */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {!isIdeaStage && (
                    <button
                      type="button"
                      disabled={isFetchingReadme || !repoUrl.trim()}
                      onClick={handleFetchGithubReadme}
                      className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isFetchingReadme ? (
                        <>
                          <RefreshCw size={12} className="animate-spin text-[var(--accent-primary)]" />
                          <span>Fetching README...</span>
                        </>
                      ) : (
                        <>
                          <GithubIcon size={13} />
                          <span>Fetch from GitHub</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>Upload README.md</span>
                  </button>

                  {readmeContent && (
                    <button
                      type="button"
                      onClick={() => setShowReadmeEditor(!showReadmeEditor)}
                      className="text-[11px] text-[var(--accent-primary)] hover:underline ml-auto font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <FileCode size={11} />
                      <span>{showReadmeEditor ? 'Hide Panel' : 'Preview / Edit README'}</span>
                    </button>
                  )}
                </div>

                {/* Status Alert */}
                {readmeStatusMsg && (
                  <div className={`p-2 rounded-lg text-[11px] flex items-center justify-between gap-2 ${
                    readmeStatusMsg.type === 'success' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {readmeStatusMsg.type === 'success' && <Check size={12} />}
                      <span>{readmeStatusMsg.text}</span>
                    </span>
                    {readmeContent && (
                      <button
                        type="button"
                        onClick={handleRemoveReadme}
                        className="text-[10px] text-red-400 hover:text-red-300 underline cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}

                {/* Live Rendered Markdown Preview / Editor */}
                {showReadmeEditor && readmeContent && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 bg-[var(--bg-surface-elevated)] p-0.5 rounded-md border border-[var(--border-subtle)]">
                        <button
                          type="button"
                          className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                            readmePreviewTab === 'preview'
                              ? 'bg-[var(--bg-surface)] text-[var(--text-pure)] shadow-2xs font-semibold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                          onClick={() => setReadmePreviewTab('preview')}
                        >
                          Rendered Preview
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                            readmePreviewTab === 'edit'
                              ? 'bg-[var(--bg-surface)] text-[var(--text-pure)] shadow-2xs font-semibold'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                          onClick={() => setReadmePreviewTab('edit')}
                        >
                          Raw Markdown
                        </button>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                        {readmeContent.length} characters
                      </span>
                    </div>

                    {readmePreviewTab === 'preview' ? (
                      <div className="max-h-56 overflow-y-auto p-3.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                        <MarkdownRenderer content={readmeContent} />
                      </div>
                    ) : (
                      <textarea
                        rows={6}
                        className="c-modal-input w-full text-xs p-2.5 rounded-lg font-mono leading-relaxed"
                        placeholder="# Project Title&#10;&#10;> Project summary goes here...&#10;&#10;## Features&#10;- [x] Feature 1&#10;- [ ] Feature 2"
                        value={readmeContent}
                        onChange={(e) => {
                          setReadmeContent(e.target.value);
                          if (!readmeSource) setReadmeSource('manual');
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Technologies & Stack */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text-primary)]">
                    Technologies & Stack
                  </label>
                  <span className="text-[11px] text-[var(--text-tertiary)]">Click to toggle</span>
                </div>

                {/* Category Filter Tabs for Clean Navigation */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10.5px]">
                  {[
                    { id: 'all', label: 'All (24)' },
                    { id: 'frontend', label: 'Frontend' },
                    { id: 'backend', label: 'Backend' },
                    { id: 'database', label: 'Data & Infra' },
                    { id: 'mobile', label: 'Mobile' },
                    { id: 'ai_systems', label: 'AI & Systems' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedTechCategory(cat.id as TechCategory)}
                      className={`c-modal-pill px-2.5 py-0.5 rounded-md font-medium shrink-0 cursor-pointer ${
                        selectedTechCategory === cat.id ? 'active' : ''
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Stack Pills in Best Grouped Order */}
                <div className="flex items-center gap-1.5 flex-wrap max-h-44 overflow-y-auto pr-1">
                  {filteredTechItems.map(tech => {
                    const isSelected = currentStack.includes(tech.id);
                    return (
                      <button
                        key={tech.id}
                        type="button"
                        onClick={() => toggleTech(tech.id)}
                        className={`c-modal-pill text-[11px] px-2.5 py-1.5 rounded-lg font-mono flex items-center gap-1.5 cursor-pointer ${
                          isSelected ? 'active' : ''
                        }`}
                      >
                        {getTechIcon(tech.id)}
                        <span>{tech.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tech Tag Input with Enter / Comma listener */}
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                    <Code2 size={13} />
                  </span>
                  <input
                    type="text"
                    className="c-modal-input w-full text-xs pl-10 pr-3.5 py-2.5 rounded-lg transition-all"
                    placeholder="Type custom package (e.g. hardware, Redis, WebSockets) and press Enter..."
                    value={customStackInput}
                    onChange={(e) => setCustomStackInput(e.target.value)}
                    onKeyDown={handleAddCustomTech}
                  />
                </div>

                {/* Custom Tags Management Strip: Edit, Remove, & Manage Custom Tags */}
                {customTags.length > 0 && (
                  <div className="c-modal-surface p-2.5 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        <span>Your Custom Tags ({customTags.length})</span>
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        Click name or ✎ to edit • × to remove
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {customTags.map((tag) => {
                        const isEditing = editingTag === tag;
                        return (
                          <div
                            key={tag}
                            className="c-modal-surface-elevated inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-mono shadow-2xs group"
                          >
                            <span className="shrink-0">{getTechIcon(tag)}</span>

                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  autoFocus
                                  className="bg-transparent border-b border-[var(--accent-primary)] text-xs text-[var(--text-pure)] outline-none w-24 py-0 px-0.5 font-mono"
                                  value={editingTagValue}
                                  onChange={(e) => setEditingTagValue(e.target.value)}
                                  onBlur={() => handleSaveEditTag(tag)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEditTag(tag);
                                    if (e.key === 'Escape') setEditingTag(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditTag(tag)}
                                  className="text-emerald-500 hover:text-emerald-400 p-0.5 cursor-pointer"
                                  title="Save rename"
                                >
                                  <Check size={11} />
                                </button>
                              </div>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-[var(--text-pure)] text-[var(--text-primary)] transition-colors"
                                onClick={() => handleStartEditTag(tag)}
                                title="Click to rename"
                              >
                                {tag}
                              </span>
                            )}

                            {!isEditing && (
                              <div className="flex items-center gap-0.5 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditTag(tag)}
                                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-0.5 rounded transition-colors cursor-pointer"
                                  title="Edit tag name"
                                >
                                  <PenLine size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomTag(tag)}
                                  className="text-[var(--text-tertiary)] hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                                  title="Remove tag"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Collaborator Openings */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--text-primary)]">
                    Collaborator Openings
                  </label>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                    {activeRolesCount} role{activeRolesCount !== 1 ? 's' : ''} requested
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {ROLE_CONFIGS.map(role => {
                    const isSelected = selectedRoles[role.id];
                    const count = roleCounts[role.id] || 1;

                    return (
                      <div
                        key={role.id}
                        className={`c-modal-pill p-2.5 rounded-xl flex items-center justify-between gap-2 ${
                          role.fullWidth ? 'sm:col-span-2' : ''
                        } ${isSelected ? 'active' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleRole(role.id)}
                          className="flex items-center gap-2.5 flex-1 text-left min-w-0 cursor-pointer"
                        >
                          <span className="shrink-0">{role.icon}</span>
                          <span className={`text-xs font-medium truncate ${isSelected ? 'text-[var(--text-pure)] font-semibold' : 'text-[var(--text-secondary)]'}`}>
                            {role.title}
                          </span>
                        </button>

                        {isSelected && (
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex items-center c-modal-surface rounded-md overflow-hidden">
                              <button
                                type="button"
                                onClick={() => decrementRole(role.id)}
                                className="px-1.5 py-0.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="px-1.5 text-[11px] font-mono text-[var(--text-pure)] font-medium">
                                {count}
                              </span>
                              <button
                                type="button"
                                onClick={() => incrementRole(role.id)}
                                className="px-1.5 py-0.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Live Directory Preview */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Live Directory Preview</span>
                </div>

                {/* Directory Preview Card */}
                <div className="c-modal-surface p-4 sm:p-5 rounded-2xl shadow-sm space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="c-modal-surface-elevated w-10 h-10 rounded-xl text-[var(--text-pure)] flex items-center justify-center shadow-xs shrink-0">
                      <GraduationCap size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[var(--text-pure)] truncate">
                          {name || 'Untitled Campus Project'}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/50 shrink-0">
                          {isIdeaStage ? 'Idea Stage' : 'Active Repo'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                        {summary || 'Campus developer collaboration project.'}
                      </p>
                    </div>
                  </div>

                  {/* Tech Stack Tags with Authentic Icons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentStack.slice(0, 5).map(s => (
                      <TechBadge key={s} name={s} />
                    ))}
                    {currentStack.length > 5 && (
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                        +{currentStack.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Open Roles Banner */}
                  {activeRolesCount > 0 ? (
                    <div>
                      <div className="inline-flex items-center gap-1.5 flex-wrap p-1 px-2.5 rounded-lg bg-amber-500/[0.06] dark:bg-amber-400/[0.07] border border-amber-500/25 dark:border-amber-400/20 max-w-full shadow-2xs">
                        <div className="flex items-center gap-1.5 shrink-0 pl-0.5 pr-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                            Seeking
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          {Object.entries(selectedRoles)
                            .filter(([_, active]) => active)
                            .map(([cat]) => {
                              const conf = ROLE_CONFIGS.find(r => r.id === cat);
                              const title = conf?.shortTitle || conf?.title || cat;
                              const count = roleCounts[cat as RoleCategory] || 1;
                              return (
                                <span 
                                  key={cat}
                                  className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] border border-amber-500/25 text-[var(--text-primary)] shadow-2xs"
                                >
                                  <span className="shrink-0">{conf?.icon}</span>
                                  <span>{title}</span>
                                  {count > 1 && (
                                    <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">
                                      ×{count}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-tertiary)] italic">
                      No collaborator openings configured yet.
                    </div>
                  )}

                  {/* Contributor Avatar Stack & Star Strip */}
                  <div className="flex items-center justify-between pt-1 pb-1 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                        {[
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
                        ].map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Contributor"
                            className="w-5 h-5 rounded-full ring-2 ring-[var(--bg-surface)] object-cover shrink-0"
                          />
                        ))}
                      </div>
                      <span className="text-[11.5px] text-[var(--text-secondary)] font-medium truncate">
                        1 contributor (You)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-xs text-[var(--text-secondary)]">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="font-mono text-[11.5px] font-medium text-[var(--text-primary)]">1</span>
                      <ChevronRight size={13} className="text-[var(--text-tertiary)]" />
                    </div>
                  </div>

                  {/* Preview Footer */}
                  <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1.5 truncate">
                      <GithubIcon size={13} className="text-[var(--text-tertiary)] shrink-0" />
                      <span className="text-[var(--text-primary)] font-medium text-[11.5px]">@{currentUser.username}</span>
                      <ExternalLink size={10} className="text-[var(--text-tertiary)]" />
                    </div>

                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11.5px] flex items-center gap-1">
                      <span>Instant Launch</span>
                      <Zap size={11} className="fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Broadcast Notification Box */}
              <div className="c-modal-surface p-3.5 rounded-xl flex items-start gap-3">
                <div className="c-modal-surface-elevated w-5 h-5 rounded-full flex items-center justify-center text-[var(--text-primary)] shrink-0 mt-0.5">
                  <Info size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-pure)]">
                    Ready to broadcast to campus developers
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                    Your project card will go live in the directory with zero delays or admin barriers.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="c-modal-footer px-6 py-4 flex items-center justify-between shrink-0">
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <User size={14} className="text-[var(--text-tertiary)]" />
              <span>Maintainer: <strong className="text-[var(--text-primary)] font-medium">@{currentUser.username}</strong></span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                className="c-modal-surface px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-pure)] transition-all cursor-pointer shadow-2xs"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className={`btn btn-primary px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  !name.trim() ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 shadow-sm'
                }`}
              >
                <Send size={12} className="-rotate-12" />
                <span>Publish Project</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
