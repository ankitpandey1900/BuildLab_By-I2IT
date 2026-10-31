import React from 'react';
import { CollaborationRequest } from '../types';
import { CheckCircle2, XCircle, MessageSquare, Inbox, Target } from 'lucide-react';
import { TechBadge } from './ui/TechBadge';

interface CollaborationInboxProps {
  requests: CollaborationRequest[];
  onUpdateStatus: (requestId: string, newStatus: 'accepted' | 'declined' | 'changes_requested') => void;
}

export const CollaborationInbox: React.FC<CollaborationInboxProps> = ({
  requests,
  onUpdateStatus
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-pure)]">
            Collaboration Requests
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Review incoming student contributor pitches across your active projects.
          </p>
        </div>

        <span className="badge-tag">
          {requests.filter(r => r.status === 'pending').length} pending
        </span>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-10 text-center text-xs text-[var(--text-secondary)]">
            <Inbox size={28} className="mx-auto text-[var(--text-tertiary)] mb-2" />
            No incoming collaboration requests right now.
          </div>
        ) : (
          requests.map(req => (
            <div 
              key={req.id}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm hover:border-[var(--border-hover)] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={req.applicant.avatarUrl} 
                    alt={req.applicant.name} 
                    className="w-9 h-9 rounded-full object-cover border border-[var(--border-subtle)] shrink-0" 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--text-pure)]">
                        {req.applicant.name}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        @{req.applicant.username}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Applied for <strong className="text-[var(--text-primary)]">{req.role}</strong> on <span className="text-[var(--text-primary)] font-medium">{req.projectName}</span>
                    </div>
                    {req.targetIssueTitle && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] text-[11px] font-mono font-medium mt-1">
                        <Target size={11} className="shrink-0" />
                        <span>Task: {req.targetIssueTitle}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <span className={`text-[10.5px] px-2 py-0.5 rounded-full border capitalize ${
                    req.status === 'accepted' 
                      ? 'border-[var(--accent-primary)]/30 bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)]' 
                      : req.status === 'declined' 
                      ? 'border-red-500/30 bg-red-500/10 text-red-400' 
                      : 'border-[var(--border-default)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                    {req.submittedAt}
                  </span>
                </div>
              </div>

              {/* Message Quote */}
              <div className="bg-[var(--code-bg)] border border-[var(--border-subtle)] rounded-lg p-3 text-xs text-[var(--text-primary)] leading-relaxed italic">
                "{req.message}"
              </div>

              {/* Applicant Skills Tags */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-[var(--text-tertiary)]">Skills:</span>
                {req.applicant.skills.map((s, idx) => (
                  <TechBadge key={idx} name={s} />
                ))}
              </div>

              {/* Action Buttons */}
              {req.status === 'pending' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)] flex-wrap">
                  <button 
                    className="btn btn-secondary btn-sm text-xs"
                    onClick={() => onUpdateStatus(req.id, 'changes_requested')}
                  >
                    <MessageSquare size={12} />
                    <span>Ask question</span>
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm text-xs"
                    onClick={() => onUpdateStatus(req.id, 'declined')}
                  >
                    <XCircle size={12} className="text-red-500" />
                    <span>Decline</span>
                  </button>
                  <button 
                    className="btn btn-primary btn-sm text-xs"
                    onClick={() => onUpdateStatus(req.id, 'accepted')}
                  >
                    <CheckCircle2 size={12} className="text-[var(--accent-primary)]" />
                    <span>Accept to team</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
