import React, { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api';
import {
  DashboardStats,
  Enquiry,
  Customer,
  Conversation,
  FollowUp,
  Notification,
  User,
  Business,
  AISettings,
  NotificationSettings,
} from './types';

// Components
import { Sidebar, NavView } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { EnquiriesView } from './components/EnquiriesView';
import { CustomersView } from './components/CustomersView';
import { ConversationsView } from './components/ConversationsView';
import { FollowUpsView } from './components/FollowUpsView';
import { AIAssistantView } from './components/AIAssistantView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PublicEnquiryView } from './components/PublicEnquiryView';

// Modals
import { AddEnquiryModal } from './components/AddEnquiryModal';
import { AIResponseModal } from './components/AIResponseModal';
import { EnquiryDetailModal } from './components/EnquiryDetailModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { ScheduleFollowUpModal } from './components/ScheduleFollowUpModal';
import { AuthModal } from './components/AuthModal';
import { ChannelSimulatorModal } from './components/ChannelSimulatorModal';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);

  // User Session State
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-1',
    name: 'Amara Okafor',
    email: 'amara@smartcrm.africa',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    status: 'active',
  });

  // Modal States
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);
  const [selectedEnquiryForDetail, setSelectedEnquiryForDetail] = useState<Enquiry | null>(null);
  const [selectedEnquiryForAI, setSelectedEnquiryForAI] = useState<Enquiry | null>(null);
  const [selectedCustomerIdForProfile, setSelectedCustomerIdForProfile] = useState<string | null>(null);
  const [isScheduleFollowUpOpen, setIsScheduleFollowUpOpen] = useState(false);
  const [preselectedEnquiryForFollowUp, setPreselectedEnquiryForFollowUp] = useState<Enquiry | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Load all CRM data
  const loadData = useCallback(async () => {
    try {
      const [
        statsRes,
        enquiriesRes,
        customersRes,
        conversationsRes,
        followUpsRes,
        notificationsRes,
        teamRes,
        businessRes,
        aiRes,
        notifSettingsRes,
      ] = await Promise.all([
        api.getStats(),
        api.getEnquiries(),
        api.getCustomers(),
        api.getConversations(),
        api.getFollowUps(),
        api.getNotifications(),
        api.getTeam(),
        api.getBusinessSettings(),
        api.getAISettings(),
        api.getNotificationSettings(),
      ]);

      setStats(statsRes);
      setEnquiries(enquiriesRes);
      setCustomers(customersRes);
      setConversations(conversationsRes);
      setFollowUps(followUpsRes);
      setNotifications(notificationsRes);
      setTeam(teamRes);
      setBusiness(businessRes);
      setAiSettings(aiRes);
      setNotificationSettings(notifSettingsRes);
    } catch (err) {
      console.error('Error fetching CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers for modal interactions
  const handleOpenAIResponse = (enquiry: Enquiry) => {
    setSelectedEnquiryForAI(enquiry);
  };

  const handleOpenEnquiryDetail = (enquiry: Enquiry) => {
    setSelectedEnquiryForDetail(enquiry);
  };

  const handleOpenCustomerProfile = (customer: Customer) => {
    setSelectedCustomerIdForProfile(customer.id);
  };

  const handleOpenCustomerProfileById = (customerId: string) => {
    setSelectedCustomerIdForProfile(customerId);
  };

  const handleScheduleFollowUpFromEnquiry = (enquiry: Enquiry) => {
    setPreselectedEnquiryForFollowUp(enquiry);
    setIsScheduleFollowUpOpen(true);
  };

  const handleResponseSent = () => {
    loadData();
  };

  const handleNotificationClick = (notif: any) => {
    if (notif.link_type === 'followup' || notif.title?.toLowerCase().includes('follow-up')) {
      setCurrentView('followups');
      return;
    }
    const enquiryId = notif.enquiry_id || notif.link_id;
    if (enquiryId) {
      const found = enquiries.find((e) => e.id === enquiryId);
      if (found) {
        setSelectedEnquiryForDetail(found);
      }
    }
  };

  if (isLoading || !stats || !business || !aiSettings || !notificationSettings) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white font-extrabold text-xl font-heading">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-heading">SmartEnquiry CRM</h1>
            <p className="text-xs text-emerald-400">Loading multi-channel workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* If user is viewing the Public Enquiry Form (Section 22) */}
      {currentView === 'public_form' ? (
        <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950">
          <PublicEnquiryView
            onEnquirySubmitted={() => {
              loadData();
            }}
            onReturnToCRM={() => setCurrentView('dashboard')}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden h-screen">
          {/* Sidebar */}
          <Sidebar
            currentView={currentView}
            onSelectView={(view) => {
              let normalized = view;
              if (view === 'follow-ups') normalized = 'followups';
              if (view === 'ai-assistant') normalized = 'ai_assistant';
              setCurrentView(normalized);
              setIsMobileMenuOpen(false);
            }}
            enquiriesCount={enquiries.filter((e) => e.status === 'New').length}
            followUpsCount={followUps.filter((f) => f.status === 'Due Today' || f.status === 'Overdue').length}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenPublicForm={() => setCurrentView('public_form')}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onLogout={() => setIsAuthModalOpen(true)}
          />

          {/* Main App Canvas */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Navigation */}
            <TopNav
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllNotificationsRead={async () => {
                await api.markAllNotificationsRead();
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
              }}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onNewEnquiryClick={() => setIsAddEnquiryOpen(true)}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onOpenPublicForm={() => setCurrentView('public_form')}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              businessName={business?.name || 'Apex Commercial Africa'}
            />

            {/* View Content Area */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="max-w-7xl mx-auto">
                {currentView === 'dashboard' && (
                  <DashboardView
                    stats={stats}
                    recentEnquiries={enquiries.slice(0, 5)}
                    pendingFollowUps={followUps.filter((f) => f.status !== 'Completed').slice(0, 4)}
                    channelBreakdown={stats.channel_breakdown}
                    onOpenAddEnquiry={() => setIsAddEnquiryOpen(true)}
                    onOpenAIResponse={handleOpenAIResponse}
                    onSelectEnquiry={handleOpenEnquiryDetail}
                    onNavigateToEnquiries={() => setCurrentView('enquiries')}
                    onNavigateToFollowUps={() => setCurrentView('followups')}
                  />
                )}

                {currentView === 'enquiries' && (
                  <EnquiriesView
                    enquiries={enquiries}
                    onSelectEnquiry={handleOpenEnquiryDetail}
                    onOpenAddEnquiry={() => setIsAddEnquiryOpen(true)}
                    onOpenAIResponse={handleOpenAIResponse}
                    onScheduleFollowUp={handleScheduleFollowUpFromEnquiry}
                  />
                )}

                {currentView === 'customers' && (
                  <CustomersView
                    customers={customers}
                    onSelectCustomer={handleOpenCustomerProfile}
                    onCustomerAdded={() => loadData()}
                  />
                )}

                {currentView === 'conversations' && (
                  <ConversationsView
                    conversations={conversations}
                    currentUser={currentUser}
                    onRefreshConversations={() => loadData()}
                  />
                )}

                {(currentView === 'followups' || currentView === 'follow-ups') && (
                  <FollowUpsView
                    followUps={followUps}
                    staffMembers={team}
                    onOpenScheduleModal={() => {
                      setPreselectedEnquiryForFollowUp(null);
                      setIsScheduleFollowUpOpen(true);
                    }}
                    onRefreshFollowUps={() => loadData()}
                    onSelectCustomerById={handleOpenCustomerProfileById}
                  />
                )}

                {(currentView === 'ai_assistant' || currentView === 'ai-assistant') && (
                  <AIAssistantView
                    enquiries={enquiries}
                    customers={customers}
                    currentUser={currentUser}
                  />
                )}

                {currentView === 'reports' && (
                  <ReportsView
                    stats={stats}
                    enquiries={enquiries}
                    followUps={followUps}
                  />
                )}

                {currentView === 'settings' && (
                  <SettingsView
                    business={business}
                    team={team}
                    aiSettings={aiSettings}
                    notificationSettings={notificationSettings}
                    onRefreshSettings={() => loadData()}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <AddEnquiryModal
        isOpen={isAddEnquiryOpen}
        onClose={() => setIsAddEnquiryOpen(false)}
        onEnquiryAdded={() => {
          loadData();
          setCurrentView('enquiries');
        }}
      />

      <AIResponseModal
        isOpen={!!selectedEnquiryForAI}
        onClose={() => setSelectedEnquiryForAI(null)}
        enquiry={selectedEnquiryForAI}
        currentUser={currentUser}
        onResponseSent={handleResponseSent}
      />

      <EnquiryDetailModal
        isOpen={!!selectedEnquiryForDetail}
        onClose={() => setSelectedEnquiryForDetail(null)}
        enquiry={selectedEnquiryForDetail}
        currentUser={currentUser}
        team={team}
        onEnquiryUpdated={() => loadData()}
        onOpenAIResponse={(enq) => {
          setSelectedEnquiryForDetail(null);
          setSelectedEnquiryForAI(enq);
        }}
        onOpenScheduleFollowUp={(enq) => {
          setSelectedEnquiryForDetail(null);
          setPreselectedEnquiryForFollowUp(enq);
          setIsScheduleFollowUpOpen(true);
        }}
      />

      <CustomerProfileModal
        isOpen={!!selectedCustomerIdForProfile}
        onClose={() => setSelectedCustomerIdForProfile(null)}
        customerId={selectedCustomerIdForProfile}
        currentUser={currentUser}
        onSelectEnquiry={handleOpenEnquiryDetail}
      />

      <ScheduleFollowUpModal
        isOpen={isScheduleFollowUpOpen}
        onClose={() => {
          setIsScheduleFollowUpOpen(false);
          setPreselectedEnquiryForFollowUp(null);
        }}
        customers={customers}
        enquiries={enquiries}
        staffMembers={team}
        preselectedEnquiry={preselectedEnquiryForFollowUp}
        onFollowUpScheduled={() => loadData()}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={(u) => setCurrentUser(u)}
        team={team}
      />

      <ChannelSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulationComplete={() => {
          loadData();
          setCurrentView('enquiries');
        }}
      />
    </div>
  );
}
