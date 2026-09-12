import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Users,
  MessageSquare,
  CalendarCheck,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  Shield,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { User } from '../types';

export type NavTab =
  | 'dashboard'
  | 'enquiries'
  | 'customers'
  | 'conversations'
  | 'follow-ups'
  | 'followups'
  | 'ai-assistant'
  | 'ai_assistant'
  | 'reports'
  | 'settings'
  | 'public_form';

export type NavView = NavTab;

export interface SidebarProps {
  currentTab?: NavTab;
  currentView?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onSelectView?: (tab: NavTab) => void;
  currentUser?: User;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenSimulator?: () => void;
  onOpenPublicForm?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  unreadCount?: number;
  overdueCount?: number;
  enquiriesCount?: number;
  followUpsCount?: number;
}

export function Sidebar({
  currentTab,
  currentView,
  onSelectTab,
  onSelectView,
  currentUser = { id: 'usr-1', name: 'Amara Okafor', email: 'amara@smartcrm.africa', role: 'admin', created_at: '' },
  onLogout = () => {},
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onOpenSimulator = () => {},
  onOpenPublicForm = () => {},
  isMobileOpen = false,
  onCloseMobile,
  unreadCount = 0,
  overdueCount = 0,
  enquiriesCount = 0,
  followUpsCount = 0,
}: SidebarProps) {
  const activeTab = currentView || currentTab || 'dashboard';
  const handleSelect = (tab: NavTab) => {
    if (onSelectView) onSelectView(tab);
    else if (onSelectTab) onSelectTab(tab);
  };
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'enquiries', label: 'Enquiries', icon: Inbox },
    { id: 'customers', label: 'Customers', icon: Users },
    {
      id: 'conversations',
      label: 'Conversations',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'follow-ups',
      label: 'Follow-ups',
      icon: CalendarCheck,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                SmartEnquiry
              </h1>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                African Business CRM
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
          Capture. Understand. Respond. Follow Up.
        </p>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'follow-ups' && activeTab === 'followups') ||
            (item.id === 'ai-assistant' && activeTab === 'ai_assistant');
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                handleSelect(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Action Shortcuts */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Quick Tools
          </div>
          <button
            onClick={() => {
              onOpenSimulator();
              if (onCloseMobile) onCloseMobile();
            }}
            id="btn-open-channel-simulator"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg hover:bg-emerald-100/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Simulate Incoming Msg
            </span>
            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded font-mono">
              Demo
            </span>
          </button>

          <button
            onClick={() => {
              onOpenPublicForm();
              if (onCloseMobile) onCloseMobile();
            }}
            id="btn-open-public-form"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Customer Website Form
            </span>
            <span className="text-[10px] text-slate-400">Public</span>
          </button>
        </div>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 text-xs flex items-center gap-2"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            id="btn-logout"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-20">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
