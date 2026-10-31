"use client";
import React, { useState, useMemo } from 'react';
import { 
  Project, 
  StudentProfile, 
  CollaborationRequest,
  ProjectReadme,
  NotificationItem,
  ProjectIssue
} from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { CollaborationModal } from './components/CollaborationModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { CollaborationInbox } from './components/CollaborationInbox';
import { SupportReviewerWorkspace } from './components/SupportReviewerWorkspace';
import { ProfileView } from './components/ProfileView';
import { StudentVerificationModal } from './components/StudentVerificationModal';
import { AdminVerificationDesk } from './components/AdminVerificationDesk';
import { MentorChatModal } from './components/MentorChatModal';
import { Check } from 'lucide-react';
import { authClient } from './lib/auth-client';

const fallbackUser: StudentProfile = {
  id: '',
  name: 'Community Member',
  username: 'member',
  email: '',
  collegeVerified: false,
  collegeOrgId: '',
  githubConnected: false,
  avatarUrl: 'https://ui-avatars.com/api/?name=User&background=222&color=fff',
  bio: '',
  skills: [],
  interests: [],
  weeklyAvailabilityHours: 0,
  joinedDate: 'Recent',
  verifiedContributions: []
};

interface AppProps { 
  initialUser?: StudentProfile; 
  initialProjects?: Project[]; 
  initialRequests?: CollaborationRequest[];
  initialNotifications?: NotificationItem[];
}

export const App: React.FC<AppProps> = ({ 
  initialUser, 
  initialProjects: persistedProjects, 
  initialRequests: persistedRequests,
  initialNotifications: persistedNotifications
}) => {
  const [projects, setProjects] = useState<Project[]>(persistedProjects ?? []);
  const [currentUser, setCurrentUser] = useState<StudentProfile>(initialUser ?? fallbackUser);
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>(persistedRequests ?? []);
  const [notifications, setNotifications] = useState<NotificationItem[]>(persistedNotifications ?? []);
  
  // Navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'collab' | 'support' | 'profile' | 'admin'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Keep selected project in sync with any project mutations (sponsorship application, handover, etc.)
  const activeSelectedProject = useMemo(() => {
    if (!selectedProject) return null;
    return projects.find(p => p.id === selectedProject.id) || selectedProject;
  }, [projects, selectedProject]);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [collabModalProject, setCollabModalProject] = useState<Project | null>(null);
  const [collabModalRole, setCollabModalRole] = useState<string | undefined>();
  const [collabModalProblem, setCollabModalProblem] = useState<string | undefined>();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationActionReason, setVerificationActionReason] = useState<string>('');
  const [mentorChatProject, setMentorChatProject] = useState<Project | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isUserVerified = currentUser.verificationStatus === 'VERIFIED' || currentUser.collegeVerified;
  const isGuest = currentUser.isGuest || !currentUser.id;

  const checkVerificationOrPrompt = (actionReason: string): boolean => {
    if (isGuest) {
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      return false;
    }
    if (!isUserVerified) {
      setVerificationActionReason(actionReason);
      setIsVerificationModalOpen(true);
      return false;
    }
    return true;
  };

  const handleOpenCollabModal = (project: Project, role?: string, problemTitle?: string) => {
    if (!checkVerificationOrPrompt('verify your college PRN to claim tasks and pitch solutions')) return;
    setCollabModalProject(project);
    setCollabModalRole(role);
    setCollabModalProblem(problemTitle);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Create Project handler
  const handleCreateProject = async (newProjectData: Omit<Project, 'id' | 'createdAt' | 'lastActivity' | 'verifiedCommitsCount' | 'collaboratorsCount'>) => {
    if (!checkVerificationOrPrompt('verify your college PRN to publish a new repository')) return;
    const response = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newProjectData.name, summary: newProjectData.summary, status: newProjectData.maturity, visibility: 'college', repositoryUrl: newProjectData.repoUrl }) });
    if (!response.ok) { const body = await response.json().catch(() => null); showToast(body?.message ?? 'Unable to publish this project.'); return; }
    const saved = await response.json();
    const newProject: Project = {
      ...newProjectData,
      id: saved.id,
      slug: saved.slug,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: 'Just now',
      verifiedCommitsCount: newProjectData.repoUrl ? 1 : 0,
      collaboratorsCount: 1
    };

    setProjects(prev => [newProject, ...prev]);
    showToast(`Published "${newProject.name}" to directory.`);
    setSelectedProject(newProject);
  };

  // Submit Collab Pitch
  const handleSubmitCollab = async (role: string, message: string, targetIssueTitle?: string) => {
    if (!collabModalProject) return;

    const response = await fetch('/api/collaboration-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: collabModalProject.id, role, message }) });
    if (!response.ok) { const body = await response.json().catch(() => null); showToast(body?.message ?? 'Unable to send collaboration request.'); return; }
    const saved = await response.json();

    const newReq: CollaborationRequest = {
      id: saved.id,
      projectId: collabModalProject.id,
      projectName: collabModalProject.name,
      applicant: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        skills: currentUser.skills,
        collegeVerified: currentUser.collegeVerified
      },
      role,
      targetIssueTitle,
      message,
      status: 'pending',
      submittedAt: 'Just now'
    };

    setCollabRequests(prev => [newReq, ...prev]);
    setCollabModalProject(null);
    setCollabModalRole(undefined);
    setCollabModalProblem(undefined);
    showToast(targetIssueTitle ? `Pitched solution for "${targetIssueTitle}".` : `Collaboration request sent for "${role}".`);
  };

  // Update Collab Status
  const handleUpdateCollabStatus = async (requestId: string, newStatus: 'accepted' | 'declined' | 'changes_requested') => {
    const response = await fetch(`/api/collaboration-requests/${requestId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    if (!response.ok) { const body = await response.json().catch(() => null); showToast(body?.message ?? 'Unable to update this request.'); return; }
    setCollabRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: newStatus };
      }
      return r;
    }));

    if (newStatus === 'accepted') {
      showToast('Collaborator accepted to team.');
    } else if (newStatus === 'declined') {
      showToast('Request declined.');
    } else {
      showToast('Requested more information from applicant.');
    }
  };

  // Support Review Decision
  const handleReviewDecision = async (projectId: string, decision: 'approved' | 'changes_requested' | 'declined', notes: string) => {
    try {
      const res = await fetch(`/api/support-applications/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes, reviewedBy: currentUser.name }),
      });
      if (!res.ok) {
        showToast('Unable to record decision.');
        return;
      }
      setProjects(prev => prev.map(p => {
        if (p.id === projectId && p.supportApplication) {
          return {
            ...p,
            track: decision === 'approved' ? 'community_supported' : p.track,
            supportApplication: {
              ...p.supportApplication,
              status: decision,
              reviewerNotes: notes,
              decisionDate: 'Today',
              reviewedBy: currentUser.name || 'Review Committee'
            }
          };
        }
        return p;
      }));

      showToast(`Decision recorded: ${decision.replace('_', ' ')}.`);
    } catch {
      showToast('Network error saving review decision.');
    }
  };

  // Apply to Community Support
  const handleApplySupport = async (project: Project) => {
    if (!checkVerificationOrPrompt('verify your college PRN to apply for community support')) return;
    try {
      const res = await fetch('/api/support-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          problem: project.problemStatement,
          targetAudience: 'Campus Engineering Community',
          requestedSupport: ['College GitHub Org Admission', 'Mentorship', 'Testing Hardware'],
          risksAndMitigations: 'Regular milestone check-ins with college community leads.',
          nextMilestone: 'Deploy live prototype on college staging server.',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        showToast(err?.message || 'Unable to submit support application.');
        return;
      }
      const saved = await res.json();
      setProjects(prev => prev.map(p => {
        if (p.id === project.id) {
          return {
            ...p,
            supportApplication: {
              id: saved.id,
              status: saved.status,
              problem: saved.problem,
              targetAudience: saved.targetAudience,
              requestedSupport: ['College GitHub Org Admission', 'Mentorship', 'Testing Hardware'],
              risksAndMitigations: saved.risksAndMitigations,
              nextMilestone: saved.nextMilestone,
              submittedAt: 'Today'
            }
          };
        }
        return p;
      }));

      showToast(`Support application submitted for "${project.name}".`);
      setCurrentTab('support');
    } catch {
      showToast('Network error submitting application.');
    }
  };

  // Stalled Handover Request
  const handleRequestHandover = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}/handover`, { method: 'POST' });
      if (!res.ok) {
        showToast('Unable to flag project for handover.');
        return;
      }
      setProjects(prev => prev.map(p => {
        if (p.id === project.id) {
          return { ...p, handoverFlagged: true };
        }
        return p;
      }));
      showToast(`Project flagged for handover. Maintainer notified via registered campus email.`);
    } catch {
      showToast('Network error requesting handover.');
    }
  };

  // Update Project README Documentation
  const handleUpdateReadme = async (project: Project, updatedReadme: ProjectReadme) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readme: JSON.stringify(updatedReadme) }),
      });
      if (!res.ok) {
        showToast('Unable to save README updates to server.');
        return;
      }
      setProjects(prev => prev.map(p => {
        if (p.id === project.id) {
          return { ...p, readme: updatedReadme };
        }
        return p;
      }));
      showToast(`README documentation updated for "${project.name}".`);
    } catch {
      showToast('Network error updating README.');
    }
  };

  // Toggle GitHub connection
  const handleToggleGithub = () => {
    if (!currentUser.githubConnected) { authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' }); return; }
    void fetch('/api/github', { method: 'DELETE' }).then(response => {
      if (!response.ok) throw new Error();
      setCurrentUser(user => ({ ...user, githubConnected: false, githubUsername: undefined }));
      showToast('GitHub account disconnected.');
    }).catch(() => showToast('Unable to disconnect GitHub.'));
  };

  // Update profile details
  const handleUpdateUser = async (updated: Partial<StudentProfile>) => {
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: updated.name, bio: updated.bio, branchYear: updated.collegeOrgId, skills: updated.skills, interests: updated.interests, availability: updated.weeklyAvailabilityHours }) });
    if (!response.ok) { showToast('Unable to save profile changes.'); return; }
    setCurrentUser(prev => ({ ...prev, ...updated }));
    showToast('Profile updated successfully.');
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
    } catch {
      // Ignore
    }
  };

  const handleUpdateProject = async (projectId: string, updateData: Partial<Project>) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updateData.name,
        summary: updateData.summary,
        problemStatement: updateData.problemStatement,
        maturity: updateData.maturity,
        visibility: updateData.visibility,
        repositoryUrl: updateData.repoUrl,
        license: updateData.license,
        skills: updateData.skills,
        teamNeeds: updateData.openRoles?.map(r => r.role),
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      showToast(err?.message || 'Failed to update project.');
      return;
    }
    const updated = await response.json();
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          ...updateData,
          name: updated.name ?? p.name,
          summary: updated.summary ?? p.summary,
          problemStatement: updated.problemStatement ?? p.problemStatement,
          maturity: (updated.maturity ?? p.maturity) as Project['maturity'],
          visibility: (updated.visibility ?? p.visibility) as Project['visibility'],
          repoUrl: updated.repositoryUrl ?? p.repoUrl,
          license: updated.license ?? p.license,
          lastActivity: 'Just now',
        };
      }
      return p;
    }));
    showToast('Project updated successfully.');
  };

  const handleArchiveProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (!response.ok) {
      showToast('Unable to archive project.');
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSelectedProject(null);
    showToast('Project archived.');
  };

  const handleCreateTask = async (projectId: string, task: { title: string; description: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; role?: string; suggestedFiles?: string[] }) => {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      showToast('Unable to create task.');
      return;
    }
    const created = await response.json();
    const newTask: ProjectIssue = {
      id: created.id,
      title: created.title,
      description: created.description,
      difficulty: created.difficulty,
      status: created.status,
      linkedRole: created.role ?? undefined,
      suggestedFiles: task.suggestedFiles ?? [],
      tags: [],
    };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedTasks = [newTask, ...(p.tasks || [])];
        const updatedRoles = p.openRoles.map(r => {
          if (!newTask.linkedRole || r.role.toLowerCase() === newTask.linkedRole.toLowerCase()) {
            return { ...r, problems: [newTask, ...(r.problems || [])] };
          }
          return r;
        });
        return { ...p, tasks: updatedTasks, openRoles: updatedRoles };
      }
      return p;
    }));
    showToast(`Task "${newTask.title}" added to project.`);
  };

  const handleUpdateTaskStatus = async (projectId: string, taskId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      showToast('Unable to update task status.');
      return;
    }
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedTasks = (p.tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        const updatedRoles = p.openRoles.map(r => ({
          ...r,
          problems: (r.problems || []).map(prob => prob.id === taskId ? { ...prob, status: newStatus } : prob),
        }));
        return { ...p, tasks: updatedTasks, openRoles: updatedRoles };
      }
      return p;
    }));
    showToast(`Task marked as ${newStatus.replace('_', ' ')}.`);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.assign('/sign-in');
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-clean">
          <Check size={14} color="var(--accent-primary)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedProject(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        pendingRequestsCount={collabRequests.filter(r => r.status === 'pending').length}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onOpenCreateProject={() => {
          if (checkVerificationOrPrompt('verify your college PRN to publish a new repository')) {
            setIsCreateOpen(true);
          }
        }}
        onOpenVerificationModal={() => {
          setVerificationActionReason('');
          setIsVerificationModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Tab: Projects — HeroSection + project list/detail */}
        {(currentTab === 'catalog' || currentTab === 'home') && (
          activeSelectedProject ? (
            <ProjectDetail
              project={activeSelectedProject}
              currentUser={currentUser}
              onBack={() => setSelectedProject(null)}
              onRequestCollab={handleOpenCollabModal}
              onApplySupport={handleApplySupport}
              onRequestHandover={handleRequestHandover}
              onUpdateReadme={handleUpdateReadme}
              onUpdateProject={handleUpdateProject}
              onArchiveProject={handleArchiveProject}
              onCreateTask={handleCreateTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onOpenMentorChat={(p) => setMentorChatProject(p)}
            />
          ) : (
            <>
              <HeroSection
                onExplore={() => {
                  const el = document.querySelector('.filter-toolbar');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onNewProject={() => {
                  if (checkVerificationOrPrompt('verify your college PRN to publish a new repository')) {
                    setIsCreateOpen(true);
                  }
                }}
                projectsCount={projects.length}
                communitySupportedCount={projects.filter(p => p.track === 'community_supported').length}
              />

              <ProjectList
                projects={projects}
                searchQuery={searchQuery}
                onSelectProject={(p) => setSelectedProject(p)}
                onRequestCollab={handleOpenCollabModal}
              />
            </>
          )
        )}

        {/* Tab: Collaboration Desk */}
        {currentTab === 'collab' && (
          <CollaborationInbox
            requests={collabRequests}
            onUpdateStatus={handleUpdateCollabStatus}
          />
        )}

        {/* Tab: Community Support Review Desk */}
        {currentTab === 'support' && (
          <SupportReviewerWorkspace
            projects={projects}
            currentUsername={currentUser.name}
            currentUserId={currentUser.id}
            onApplySupport={handleApplySupport}
            onReviewDecision={handleReviewDecision}
            onSelectProject={(p) => {
              setSelectedProject(p);
              setCurrentTab('catalog');
            }}
            onOpenCreateProject={() => {
              if (checkVerificationOrPrompt('verify your college PRN to publish a new repository')) {
                setIsCreateOpen(true);
              }
            }}
          />
        )}

        {/* Tab: Admin PRN Verification Desk */}
        {currentTab === 'admin' && (
          <AdminVerificationDesk
            onStatusUpdated={() => {
              showToast('Student verification record updated.');
            }}
          />
        )}

        {/* Tab: Student Profile */}
        {currentTab === 'profile' && (
          <ProfileView
            user={currentUser}
            projects={projects}
            onSelectProject={(p) => {
              setSelectedProject(p);
              setCurrentTab('catalog');
            }}
            onToggleGithub={handleToggleGithub}
            onUpdateUser={handleUpdateUser}
            onOpenVerificationModal={() => {
              setVerificationActionReason('');
              setIsVerificationModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Responsive Workspace Footer */}
      <footer className="mt-auto border-t border-[var(--border-subtle)] py-6 text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-mono text-[11px]">
            <img 
              src="/icon.webp" 
              alt="BuildLab" 
              className="w-5 h-5 rounded-sm object-contain" 
            />
            <span className="text-[var(--text-secondary)] font-medium">BuildLab</span>
            <span className="text-[10px] text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-1 rounded-sm">by I2IT</span>
            <span>•</span>
            <span>College Engineering Network</span>
          </div>

          <div className="flex items-center gap-5 text-[11.5px] text-[var(--text-secondary)] flex-wrap justify-center">
            <button 
              onClick={() => setCurrentTab('catalog')} 
              className="hover:text-[var(--text-pure)] transition-colors cursor-pointer"
            >
              Projects
            </button>
            <button 
              onClick={() => setCurrentTab('collab')} 
              className="hover:text-[var(--text-pure)] transition-colors cursor-pointer"
            >
              Collaborate
            </button>
            <button 
              onClick={() => setCurrentTab('profile')} 
              className="hover:text-[var(--text-pure)] transition-colors cursor-pointer"
            >
              Developer Profile
            </button>
          </div>
        </div>
      </footer>

      {/* Collaboration Pitch Modal */}
      {collabModalProject && (
        <CollaborationModal
          project={collabModalProject}
          currentUser={currentUser}
          initialRole={collabModalRole}
          initialProblemTitle={collabModalProblem}
          onClose={() => {
            setCollabModalProject(null);
            setCollabModalRole(undefined);
            setCollabModalProblem(undefined);
          }}
          onSubmit={handleSubmitCollab}
        />
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateProject}
          currentUser={currentUser}
        />
      )}

      {/* Student Campus PRN Verification Modal */}
      <StudentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        currentUser={currentUser}
        actionBlockedReason={verificationActionReason}
        onVerificationSubmitted={(updatedData) => {
          setCurrentUser((prev) => ({ ...prev, ...updatedData }));
          showToast('Campus PRN submitted. Awaiting admin review.');
        }}
      />

      {/* 1:1 Mentor Consultation Chat Modal */}
      {mentorChatProject && (
        <MentorChatModal
          isOpen={Boolean(mentorChatProject)}
          onClose={() => setMentorChatProject(null)}
          project={mentorChatProject}
          currentUser={currentUser}
          onShowVerificationModal={(reason) => {
            setVerificationActionReason(reason);
            setIsVerificationModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
  
