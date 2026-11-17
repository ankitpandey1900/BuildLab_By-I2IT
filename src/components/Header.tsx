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
  LogIn,
  Menu,
  X,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { StudentProfile, NotificationItem } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { canVerifyStudents } from '../lib/permissions';

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
  onSignOut,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const isGuest = currentUser.isGuest || !currentUser.id;
  const canAccessAdminDesk = !isGuest && canVerifyStudents(currentUser.role ?? "student");

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

  useEffect(() => {
    if (!showMobileMenu) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileMenu(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMobileMenu]);

  const handleToggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    onMarkNotificationsRead?.();
  };

  const handleMobileNavigate = (tab: HeaderProps['currentTab']) => {
    setCurrentTab(tab);
    setShowMobileMenu(false);
    mobileMenuButtonRef.current?.focus();
  };

  const mobileNavItemClass =
    'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400';

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
            <span className="hidden sm:inline text-[10px] font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] whitespace-nowrap">
              by I2IT
            </span>
          </span>
        </button>

        <nav className="nav-group !hidden lg:!flex">
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
          {canAccessAdminDesk && (
            <button
              className={`nav-link-btn cursor-pointer ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('admin')}
              title="Open the administration workspace"
            >
              <ShieldCheck size={13} /> Admin
            </button>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <label className="search-box hidden xl:block">
            <Search size={13} className="search-icon-svg" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects"
            />
          </label>

          <ThemeToggle />

          {/* Notifications Bell */}
          {!isGuest && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 lg:h-9 lg:w-9"
                onClick={handleToggleNotifications}
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell size={16} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 text-[9.5px] font-bold text-white flex items-center justify-center font-mono ring-2 ring-[var(--bg-surface)]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {showNotifications && (
                <div className="fixed inset-x-3 top-16 z-50 mx-auto w-auto max-w-[24rem] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mx-0 sm:mt-2 sm:w-96 sm:max-w-none">
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

          <button className="btn btn-primary btn-sm !hidden cursor-pointer lg:!inline-flex" onClick={onOpenCreateProject}>
            <Plus size={13} /> New
          </button>

          {isGuest ? (
            <Link
              href="/sign-in"
              className="btn btn-secondary btn-sm !hidden items-center gap-1.5 cursor-pointer lg:!flex"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </Link>
          ) : (
            <>
              <button 
                type="button"
                className="hidden items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all cursor-pointer shrink-0 text-xs lg:flex"
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
                className="btn btn-ghost btn-sm !hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 lg:!inline-flex"
                onClick={onSignOut} 
                title="Sign out of account"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </>
          )}

          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 lg:hidden"
            onClick={() => setShowMobileMenu((open) => !open)}
            aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={showMobileMenu}
            aria-controls="mobile-primary-navigation"
          >
            {showMobileMenu ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-primary-navigation"
        hidden={!showMobileMenu}
        className="border-t border-[var(--border-subtle)] bg-[var(--header-bg)] px-3 py-3 lg:hidden"
      >
          <div className="mx-auto max-w-6xl space-y-3">
            <label className="relative block">
              <span className="sr-only">Search projects</span>
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search projects"
                className="h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] pl-10 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30"
              />
            </label>

            <nav aria-label="Mobile navigation" className="grid gap-1">
              <button
                type="button"
                onClick={() => handleMobileNavigate('catalog')}
                aria-current={currentTab === 'catalog' || currentTab === 'home' ? 'page' : undefined}
                className={`${mobileNavItemClass} ${
                  currentTab === 'catalog' || currentTab === 'home'
                    ? 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)]'
                }`}
              >
                <Home size={17} aria-hidden="true" />
                Projects
              </button>
              {!isGuest && (
                <button
                  type="button"
                  onClick={() => handleMobileNavigate('collab')}
                  aria-current={currentTab === 'collab' ? 'page' : undefined}
                  className={`${mobileNavItemClass} ${
                    currentTab === 'collab'
                      ? 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)]'
                  }`}
                >
                  <GitPullRequest size={17} aria-hidden="true" />
                  Collaborate
                  {pendingRequestsCount > 0 && (
                    <span className="badge-count ml-auto">{pendingRequestsCount}</span>
                  )}
                </button>
              )}
              {canAccessAdminDesk && (
                <button
                  type="button"
                  onClick={() => handleMobileNavigate('admin')}
                  aria-current={currentTab === 'admin' ? 'page' : undefined}
                  className={`${mobileNavItemClass} ${
                    currentTab === 'admin'
                      ? 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)]'
                  }`}
                >
                  <ShieldCheck size={17} aria-hidden="true" />
                  Admin
                </button>
              )}
              {!isGuest && (
                <button
                  type="button"
                  onClick={() => handleMobileNavigate('profile')}
                  aria-current={currentTab === 'profile' ? 'page' : undefined}
                  className={`${mobileNavItemClass} ${
                    currentTab === 'profile'
                      ? 'bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-pure)]'
                  }`}
                >
                  <UserRound size={17} aria-hidden="true" />
                  Profile
                </button>
              )}
            </nav>

            <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  onOpenCreateProject();
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                <Plus size={16} aria-hidden="true" />
                New project
              </button>
              {isGuest ? (
                <Link
                  href="/sign-in"
                  onClick={() => setShowMobileMenu(false)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  <LogIn size={16} aria-hidden="true" />
                  Sign in
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign out
                </button>
              )}
            </div>
          </div>
      </div>
    </header>
  );
};
