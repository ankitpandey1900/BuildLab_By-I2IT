"use client";

import React, { useState } from "react";
import { 
  X, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Code2,
  Clock
} from "lucide-react";
import { Project, StudentProfile } from "../types";

interface MentorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  currentUser: StudentProfile;
  onShowVerificationModal: (reason: string) => void;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  isMentor: boolean;
  message: string;
  timestamp: string;
}

export const MentorChatModal: React.FC<MentorChatModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUser,
  onShowVerificationModal,
}) => {
  const isVerified = currentUser.verificationStatus === "VERIFIED" || currentUser.collegeVerified;
  const isGuest = currentUser.isGuest || !currentUser.id;

  const mentorName = project.owner.name;
  const mentorAvatar = project.owner.avatarUrl;

  const [selectedTopic, setSelectedTopic] = useState<string>("Issue Implementation Guidance");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderName: mentorName,
      senderAvatar: mentorAvatar,
      isMentor: true,
      message: `Hi! I'm ${mentorName}, lead maintainer for ${project.name}. Let me know what you'd like to work on or discuss about the repository architecture.`,
      timestamp: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  if (!isOpen) return null;

  // Gate check
  if (isGuest) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-base text-[var(--text-pure)]">Sign in with GitHub</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            To message the project mentor and discuss code contributions, please sign in with your GitHub account.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-secondary btn-sm flex-1 cursor-pointer">
              Cancel
            </button>
            <a href="/sign-in" className="btn btn-primary btn-sm flex-1 cursor-pointer">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-base text-[var(--text-pure)]">Campus Verification Required</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            1-on-1 mentor messaging is exclusively available for verified BuildLab campus members to prevent spam and maintain safe academic collaboration.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-secondary btn-sm flex-1 cursor-pointer">
              Dismiss
            </button>
            <button 
              onClick={() => {
                onClose();
                onShowVerificationModal("complete campus verification to chat with project mentors");
              }} 
              className="btn btn-primary btn-sm flex-1 cursor-pointer"
            >
              Verify Identity
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUser.name || "Me",
      senderAvatar: currentUser.avatarUrl,
      isMentor: false,
      message: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Simulate mentor acknowledgment response
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderName: mentorName,
        senderAvatar: mentorAvatar,
        isMentor: true,
        message: `Thanks for reaching out regarding ${selectedTopic}! I've noted your message and will review your pitch/notes. Feel free to check the repo issues in the meantime.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  const topics = [
    "Issue Implementation Guidance",
    "Architecture Walkthrough",
    "Tech Stack Questions",
    "Pull Request Review Request",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl h-[560px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={mentorAvatar}
              alt={mentorName}
              className="w-9 h-9 rounded-full object-cover border border-[var(--border-subtle)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--text-pure)]">{mentorName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium font-mono flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified Mentor
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Project Lead • {project.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-pure)] hover:bg-[var(--bg-surface)] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Topic Selector */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[var(--text-tertiary)] shrink-0 font-medium">Topic:</span>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                selectedTopic === t
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                  : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-pure)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[var(--bg-surface)]/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                msg.isMentor ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-[var(--border-subtle)]"
              />
              <div
                className={`p-3 rounded-2xl text-xs space-y-1 ${
                  msg.isMentor
                    ? "bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-pure)] rounded-tl-none"
                    : "bg-indigo-600 text-white rounded-tr-none"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                  <span className="font-semibold">{msg.senderName}</span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message @${project.owner.username} about ${selectedTopic}…`}
            className="flex-1 h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-default)] text-xs text-[var(--text-pure)] outline-none focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="h-9 px-3.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 cursor-pointer disabled:opacity-50"
          >
            <span>Send</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};

