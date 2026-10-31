import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  GitPullRequest, 
  FolderGit2, 
  Home, 
  LogOut, 
  Bell, 
  CheckCheck, 
  Inbox, 
  CheckCircle2, 
  MessageSquare,
  ShieldCheck,
  Clock,
  LogIn,
  Sliders
} from 'lucide-react';
import Link from 'next/link';
import { StudentProfile, NotificationItem } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentTab: 'home' | 'catalog' | 'collab' | 'support' | 'profile' | 'admin';
  setCurrentTab: (tab: 'home' | 'catalog' | 'collab' | 'support' | 'profile' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: StudentProfile;
  pendingRequestsCount: number;
  notifications?: NotificationItem[];
  onMarkNotificationsRead?: () => void;
  onOpenCreateProject: () => void;
  onOpenVerificationModal?: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  pendingRequestsCount,
  notifications = [],
  onMarkNotificationsRead,
  onOpenCreateProject,
  onOpenVerificationModal,
  onSignOut,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const isGuest = currentUser.isGuest || !currentUser.id;
  // Always enable Admin Desk access during dev mode so features can be tested directly
  const isAdmin = true;
  const isVerified = currentUser.verificationStatus === "VERIFIED" || currentUser.collegeVerified;
  const isPending = currentUser.verificationStatus === "PENDING_APPROVAL";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleToggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    onMarkNotificationsRead?.();
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand-section cursor-pointer flex items-center gap-2.5" onClick={() => setCurrentTab('catalog')}>
          <img 
            src="/icon.webp" 
            alt="BuildLab" 
            className="w-[34px] h-[34px] rounded-lg object-contain shrink-0 shadow-sm" 
          />
          <span className="flex items-center gap-2 whitespace-nowrap">
            <b className="brand-title font-bold text-sm tracking-tight text-[var(--text-pure)]">BuildLab</b>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] whitespace-nowrap">
              by I2IT
            </span>
          </span>
        </button>

        <nav className="nav-group hidden md:flex">
          <button
            className={`nav-link-btn cursor-pointer ${currentTab === 'catalog' || currentTab === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentTab('catalog')}
          >
            <Home size={13} /> Projects
          </button>
          {!isGuest && (
            <button
              className={`nav-link-btn cursor-pointer ${currentTab === 'collab' ? 'active' : ''}`}
              onClick={() => setCurrentTab('collab')}
            >
              <GitPullRequest size={13} /> Collaborate{' '}
              {pendingRequestsCount > 0 && <span className="badge-count">{pendingRequestsCount}</span>}
            </button>
          )}
          {isAdmin && (
            <button
              className={`nav-link-btn cursor-pointer ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('admin')}
              title="Admin PRN Verification Desk"
            >
              <Sliders size={13} /> Admin Desk
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <label className="search-box hidden xl:block">
            <Search size={13} className="search-icon-svg" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects"
            />
          </label>

          <ThemeToggle />

          {/* Verification Status Pill (when logged in) */}
          {!isGuest && (
            <button
              type="button"
              onClick={onOpenVerificationModal}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                isVerified
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                  : isPending
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
              }`}
              title={
                isVerified
                  ? `Campus Verified (PRN: ${currentUser.prnNumber || "Verified"})`
                  : isPending
                  ? "PRN Verification Pending Admin Review"
                  : "Click to submit your College PRN verification"
              }
            >
              {isVerified ? (
                <>
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Campus Verified</span>
                </>
              ) : isPending ? (
                <>
                  <Clock size={12} className="text-amber-400 animate-pulse" />
                  <span>PRN Pending</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={12} className="text-indigo-400" />
                  <span>Verify PRN</span>
                </>
              )}
            </button>
          )}

          {/* Notifications Bell */}
          {!isGuest && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="btn btn-ghost btn-sm relative text-[var(--text-secondary)] hover:text-[var(--text-pure)] cursor-pointer"
                onClick={handleToggleNotifications}
                title="Notifications"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 text-[9.5px] font-bold text-white flex items-center justify-center font-mono ring-2 ring-[var(--bg-surface)]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-elevated)]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[var(--text-pure)]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-mono font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCheck size={12} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]/50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-tertiary)] flex flex-col items-center gap-1">
                        <Inbox size={20} className="text-[var(--text-tertiary)]" />
                        <span>No notifications yet</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                            !n.readAt ? 'bg-indigo-500/5' : 'hover:bg-[var(--bg-surface-elevated)]'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'collaboration_request' ? (
                              <MessageSquare size={13} className="text-amber-500" />
                            ) : n.type === 'collaboration_decision' || n.type === 'verification_update' ? (
                              <CheckCircle2 size={13} className="text-emerald-500" />
                            ) : (
                              <Bell size={13} className="text-indigo-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-[var(--text-pure)] text-[11.5px] truncate">
                                {n.title}
                              </span>
                              {!n.readAt && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                              {n.body}
                            </p>
                            <span className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary btn-sm cursor-pointer" onClick={onOpenCreateProject}>
            <Plus size={13} /> New
          </button>

          {isGuest ? (
            <Link
              href="/sign-in"
              className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </Link>
          ) : (
            <>
              <button 
                type="button"
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all cursor-pointer shrink-0 text-xs" 
                onClick={() => setCurrentTab('profile')}
                title={`View @${currentUser.username}'s profile`}
              >
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-5 h-5 rounded-full object-cover shrink-0" 
                />
                <span className="hidden lg:inline font-mono text-[var(--text-secondary)] max-w-[120px] truncate">
                  @{currentUser.username}
                </span>
              </button>

              <button 
                type="button"
                className="btn btn-ghost btn-sm p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0" 
                onClick={onSignOut} 
                title="Sign out of account"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
