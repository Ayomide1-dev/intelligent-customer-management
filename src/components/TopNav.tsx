import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Building2,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ExternalLink,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';
import { NotificationItem, User } from '../types';

export interface TopNavProps {
  onOpenMobileSidebar?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenAddEnquiry?: () => void;
  onNewEnquiryClick?: () => void;
  onOpenSimulator?: () => void;
  onOpenPublicForm?: () => void;
  currentUser?: User;
  onOpenAuthModal?: () => void;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onNotificationClick?: (notif: NotificationItem) => void;
  onSearch?: (term: string) => void;
  businessName?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function TopNav({
  onOpenMobileSidebar,
  onToggleMobileMenu,
  onOpenAddEnquiry,
  onNewEnquiryClick,
  onOpenSimulator,
  onOpenPublicForm,
  currentUser = { id: 'usr-1', name: 'Amara Okafor', email: 'amara@smartcrm.africa', role: 'admin', created_at: '' },
  onOpenAuthModal,
  notifications = [],
  onMarkNotificationRead = () => {},
  onMarkAllNotificationsRead = () => {},
  onNotificationClick,
  onSearch = () => {},
  businessName = 'Apex Commercial Africa',
  isDarkMode = false,
  onToggleDarkMode = () => {},
}: TopNavProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter((n) => !n.read && !n.is_read);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleMobileMenu = () => {
    if (onToggleMobileMenu) onToggleMobileMenu();
    else if (onOpenMobileSidebar) onOpenMobileSidebar();
  };

  const handleAddEnquiry = () => {
    if (onNewEnquiryClick) onNewEnquiryClick();
    else if (onOpenAddEnquiry) onOpenAddEnquiry();
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Left side: Hamburger + Business Badge + Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        <button
          onClick={handleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Business Identifier Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
          <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">{businessName}</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="top-search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search enquiries, customers, phones..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
        </form>
      </div>

      {/* Right side: Quick Actions + Notification Bell + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Public Website Form (Section 22) */}
        {onOpenPublicForm && (
          <button
            onClick={onOpenPublicForm}
            id="btn-top-public-form"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
            title="Open customer-facing website form (Section 22)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
            <span>Website Form (Sec 22)</span>
          </button>
        )}

        {/* Simulator CTA (Section 21) */}
        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            id="btn-top-simulator"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 text-xs font-semibold transition-all"
            title="Inject simulated incoming WhatsApp/IG/Website messages (Section 21)"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Simulator (Sec 21)</span>
          </button>
        )}

        {/* Add Enquiry CTA */}
        <button
          onClick={handleAddEnquiry}
          id="btn-top-add-enquiry"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Enquiry</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            id="btn-notifications-toggle"
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadNotifications.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {unreadNotifications.length} new
                    </span>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => {
                    const isRead = n.read || n.is_read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkNotificationRead(n.id);
                          if (onNotificationClick) onNotificationClick(n);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-colors text-left flex gap-3 items-start ${
                          isRead
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-70'
                            : 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                          {n.type === 'warning' && <Clock className="w-4 h-4 text-amber-500" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-emerald-500" />}
                          {n.type === 'success' && <CheckCircle className="w-4 h-4 text-teal-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {n.title}
                            </p>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {n.description}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill (Section 19: Role Switcher / Auth) */}
        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            id="btn-top-user-profile"
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors border border-slate-200 dark:border-slate-800"
            title="Switch User Role or Sign Up (Section 19)"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden xl:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-500" />
                <span>{currentUser.role}</span>
              </div>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}
