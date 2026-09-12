import React, { useState } from 'react';
import {
  Building2,
  Users,
  Bot,
  Bell,
  Check,
  Plus,
  Shield,
  Sparkles,
  Save,
} from 'lucide-react';
import { Business, User, AISettings, NotificationSettings } from '../types';
import { api } from '../lib/api';

interface SettingsViewProps {
  business: Business;
  team: User[];
  aiSettings: AISettings;
  notificationSettings: NotificationSettings;
  onRefreshSettings: () => void;
}

export function SettingsView({
  business,
  team,
  aiSettings,
  notificationSettings,
  onRefreshSettings,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'business' | 'team' | 'ai' | 'notifications'>('business');

  // Business form state
  const [bizName, setBizName] = useState(business.name);
  const [bizEmail, setBizEmail] = useState(business.email);
  const [bizPhone, setBizPhone] = useState(business.phone);
  const [bizAddress, setBizAddress] = useState(business.address);
  const [bizWebsite, setBizWebsite] = useState(business.website || '');
  const [isSavingBiz, setIsSavingBiz] = useState(false);
  const [bizSaved, setBizSaved] = useState(false);

  // AI settings state
  const [aiTone, setAiTone] = useState(aiSettings.response_tone);
  const [aiStyle, setAiStyle] = useState(aiSettings.default_response_style);
  const [followUpTiming, setFollowUpTiming] = useState(aiSettings.follow_up_timing_hours);
  const [businessContext, setBusinessContext] = useState(aiSettings.business_info_context);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  // Notifications state
  const [notifState, setNotifState] = useState(notificationSettings);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [notifsSaved, setNotifsSaved] = useState(false);

  // Team modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'manager' | 'staff'>('staff');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBiz(true);
    try {
      await api.updateBusinessSettings({
        name: bizName,
        email: bizEmail,
        phone: bizPhone,
        address: bizAddress,
        website: bizWebsite,
      });
      setBizSaved(true);
      setTimeout(() => setBizSaved(false), 2000);
      onRefreshSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBiz(false);
    }
  };

  const handleSaveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAI(true);
    try {
      await api.updateAISettings({
        response_tone: aiTone,
        default_response_style: aiStyle,
        follow_up_timing_hours: Number(followUpTiming),
        business_info_context: businessContext,
      });
      setAiSaved(true);
      setTimeout(() => setAiSaved(false), 2000);
      onRefreshSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    try {
      await api.updateNotificationSettings(notifState);
      setNotifsSaved(true);
      setTimeout(() => setNotifsSaved(false), 2000);
      onRefreshSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setIsAddingMember(true);
    try {
      await api.addTeamMember({
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        phone: newMemberPhone,
      });
      setShowAddMember(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPhone('');
      onRefreshSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure business details, staff team access, AI tone guidelines, and notifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('business')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'business'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members ({team.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-500" />
          <span>AI Settings & Knowledge Context</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Alerts</span>
        </button>
      </div>

      {/* Tab 1: Business Profile (Section 17) */}
      {activeTab === 'business' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading mb-4">
            African Business Information
          </h2>
          <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Office Address
              </label>
              <input
                type="text"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website URL (Optional)
              </label>
              <input
                type="text"
                value={bizWebsite}
                onChange={(e) => setBizWebsite(e.target.value)}
                placeholder="https://apexcommercial.africa"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              {bizSaved && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved!
                </span>
              )}
              <button
                type="submit"
                disabled={isSavingBiz}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Business Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Team Members (Section 17) */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Staff & User Roles
              </h2>
              <p className="text-xs text-slate-500">
                Manage access roles (Admin, Manager, Staff) for enquiry handling.
              </p>
            </div>

            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {team.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      {u.name}
                    </td>
                    <td className="p-3 text-slate-500">{u.email}</td>
                    <td className="p-3 text-slate-500">{u.phone || '—'}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Team Member Modal */}
          {showAddMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Team Member
                </h3>
                <form onSubmit={handleAddMember} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g. Chinedu Eze"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="chinedu@example.africa"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="+234 800 111 2222"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Role</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      <option value="staff">Staff (Support & Sales Rep)</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="px-4 py-2 text-slate-500 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingMember}
                      className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl"
                    >
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Settings (Section 17) */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <span>AI Tone & Knowledge Guardrails</span>
            </h2>
            <p className="text-xs text-slate-500">
              Configure how the Gemini AI drafts customer responses and understands business reality.
            </p>
          </div>

          <form onSubmit={handleSaveAI} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AI Response Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly & Personable</option>
                  <option value="Direct">Direct & Concise</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Length Style
                </label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="Standard">Standard (Balanced)</option>
                  <option value="Short">Short & Punchy</option>
                  <option value="Comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Automated Follow-up Delay (Hours)
              </label>
              <input
                type="number"
                value={followUpTiming}
                onChange={(e) => setFollowUpTiming(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Rule 2 triggers a follow-up required state if no staff response occurs within this time.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Verified Business Context for AI (Pricing, Delivery & Catalog Facts):
              </label>
              <textarea
                rows={5}
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                placeholder="Enter facts about your products, branches, warranty, or delivery policies..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Strict Guardrail: The AI will strictly reference these facts and will NOT invent prices or fees that do not exist here.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              {aiSaved && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Guardrails Saved!
                </span>
              )}
              <button
                type="submit"
                disabled={isSavingAI}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save AI Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Notifications (Section 17) */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Operational Alerts
          </h2>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Email Alerts on New Enquiries
                </span>
                <span className="text-slate-400 text-[11px]">
                  Send email immediately when an enquiry arrives via any channel.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifState.email_on_new_enquiry}
                onChange={(e) =>
                  setNotifState({ ...notifState, email_on_new_enquiry: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  High Priority Instant Alerts (Rule 5)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Prominently notify when urgent or high-value enquiries are detected.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifState.high_priority_alert}
                onChange={(e) =>
                  setNotifState({ ...notifState, high_priority_alert: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Daily Follow-Up Digest
                </span>
                <span className="text-slate-400 text-[11px]">
                  Morning briefing of follow-ups scheduled for the day.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifState.daily_follow_up_digest}
                onChange={(e) =>
                  setNotifState({ ...notifState, daily_follow_up_digest: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Audio & Bell Notifications
                </span>
                <span className="text-slate-400 text-[11px]">
                  Play gentle chime on incoming messages and task due alerts.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifState.sound_notifications}
                onChange={(e) =>
                  setNotifState({ ...notifState, sound_notifications: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {notifsSaved && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-xs">
                <Check className="w-4 h-4" /> Preferences Saved!
              </span>
            )}
            <button
              onClick={handleSaveNotifications}
              disabled={isSavingNotifs}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
