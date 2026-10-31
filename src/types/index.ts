export type ProjectTrack = 'independent' | 'community_supported';
export type ProjectMaturity = 'idea' | 'prototype' | 'active' | 'maintenance' | 'paused' | 'archived';
export type SupportAppStatus = 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'declined' | 'deferred' | 'withdrawn';
export type RoleCategory = 'ui_design' | 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'ai_ml' | 'devops' | 'database' | 'auth' | 'qa_testing' | 'docs_writer' | 'hardware_iot';
export interface ProjectIssue { id: string; title: string; description: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; status?: 'open' | 'claimed' | 'in_progress' | 'resolved'; category?: RoleCategory; linkedRole?: string; issueUrl?: string; tags: string[]; suggestedFiles?: string[]; }
export interface OpenRole { role: string; category?: RoleCategory; count: number; description: string; lookingForSkills?: string[]; problems?: ProjectIssue[]; }
export interface FirstIssue { id: string; title: string; difficulty: 'beginner' | 'intermediate'; issueUrl?: string; tags: string[]; }
export interface SupportApplication { id: string; status: SupportAppStatus; problem: string; targetAudience: string; requestedSupport: string[]; risksAndMitigations: string; nextMilestone: string; submittedAt: string; reviewerNotes?: string; reviewedBy?: string; decisionDate?: string; }
export interface ProjectReadme { rawMarkdown?: string; source?: 'github_auto' | 'file_upload' | 'manual' | 'preset'; lastFetchedAt?: string; fileName?: string; fileSize?: string; extractedSummary?: string; badgeTags?: { label: string; value: string; color?: string }[]; architecture?: { summary: string; diagramAscii?: string; flowSteps?: { step: number; title: string; desc: string }[]; layers: { name: string; tech: string; description: string }[]; }; features?: { title: string; status: 'completed' | 'in_progress' | 'planned'; description: string }[]; fileTree?: { path: string; purpose: string; isDir?: boolean }[]; quickstartCommands?: { step: string; command: string; explanation?: string }[]; contributingRules?: string[]; }
export interface Project { 
  id: string; 
  name: string; 
  slug: string; 
  summary: string; 
  problemStatement: string; 
  track: ProjectTrack; 
  maturity: ProjectMaturity; 
  visibility?: 'college' | 'public' | 'private';
  repoUrl?: string; 
  license?: string; 
  contributionGuide?: string;
  skills: string[]; 
  currentStack?: string[]; 
  openRoles: OpenRole[]; 
  setupGuide?: string; 
  firstIssues: FirstIssue[]; 
  issues?: ProjectIssue[]; 
  tasks?: ProjectIssue[];
  readme?: ProjectReadme; 
  owner: { id: string; name: string; username: string; collegeVerified: boolean; avatarUrl: string; branchOrMajor: string }; 
  collaboratorsCount: number; 
  verifiedCommitsCount: number; 
  starsCount?: number; 
  contributorAvatars?: string[]; 
  lastActivity: string; 
  createdAt: string; 
  supportApplication?: SupportApplication; 
  handoverFlagged?: boolean; 
  members?: { id: string; userId: string; role: string; user?: { id: string; name: string; avatarUrl?: string } }[];
}
export interface CollaborationRequest { id: string; projectId: string; projectName: string; applicant: { id: string; name: string; username: string; avatarUrl: string; skills: string[]; collegeVerified: boolean }; role: string; targetIssueTitle?: string; message: string; status: 'pending' | 'accepted' | 'declined' | 'changes_requested'; submittedAt: string; }
export interface ContributionRecord { id: string; type: 'pr_merged' | 'issue_resolved' | 'commit_pushed' | 'code_review' | 'mentorship_session'; title: string; repo: string; verifiedByGitHub: boolean; externalUrl?: string; date: string; sha?: string; details?: string; }
export type VerificationStatusType = 'UNVERIFIED' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED';
export interface StudentProfile { 
  id: string; 
  name: string; 
  username: string; 
  email: string; 
  collegeVerified: boolean; 
  collegeOrgId: string; 
  githubConnected: boolean; 
  githubUsername?: string; 
  avatarUrl: string; 
  bio: string; 
  skills: string[]; 
  interests: string[]; 
  weeklyAvailabilityHours: number; 
  joinedDate: string; 
  verifiedContributions: ContributionRecord[];
  role?: string;
  verificationStatus?: VerificationStatusType;
  prnNumber?: string;
  rollNumber?: string;
  department?: string;
  academicYear?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  isGuest?: boolean;
}
export interface NotificationItem { id: string; type: string; title: string; body: string; href?: string | null; readAt?: string | null; createdAt: string; }
