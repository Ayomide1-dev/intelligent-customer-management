import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User as UserIcon,
  MessageSquare,
  Clock,
  Send,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarCheck,
  Reply,
  ShieldAlert,
} from 'lucide-react';
import {
  Enquiry,
  Conversation,
  Message,
  Note,
  FollowUp,
  User,
  EnquiryStatus,
  EnquiryPriority,
} from '../types';
import { api } from '../lib/api';
import { ChannelBadge, PriorityBadge, StatusBadge } from './Badges';

interface EnquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryId?: string | null;
  enquiry?: Enquiry | null;
  staffMembers?: User[];
  team?: User[];
  currentUser?: User;
  onOpenAIResponse: (enquiry: Enquiry) => void;
  onOpenScheduleFollowUp?: (enquiry: Enquiry) => void;
  onOpenFollowUpModal?: (enquiry: Enquiry) => void;
  onEnquiryUpdated?: () => void;
}

export function EnquiryDetailModal({
  isOpen,
  onClose,
  enquiryId,
  enquiry: initialEnquiry,
  staffMembers,
  team,
  currentUser = { id: 'usr-1', name: 'Amara Okafor', email: 'amara@smartcrm.africa', role: 'admin', created_at: '' },
  onOpenAIResponse,
  onOpenScheduleFollowUp,
  onOpenFollowUpModal,
  onEnquiryUpdated = () => {},
}: EnquiryDetailModalProps) {
  const effectiveId = enquiryId || initialEnquiry?.id || null;
  const staffList = staffMembers || team || [];
  const handleFollowUp = (enq: Enquiry) => {
    if (onOpenScheduleFollowUp) onOpenScheduleFollowUp(enq);
    else if (onOpenFollowUpModal) onOpenFollowUpModal(enq);
  };
  const [data, setData] = useState<{
    enquiry: Enquiry;
    conversation?: Conversation & { messages: Message[] };
    notes: Note[];
    followUps: FollowUp[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [newReplyMessage, setNewReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'analysis' | 'notes' | 'followups'>('conversation');

  const loadData = async () => {
    if (!effectiveId) return;
    setIsLoading(true);
    try {
      const res = await api.getEnquiry(effectiveId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && effectiveId) {
      loadData();
    }
  }, [isOpen, effectiveId]);

  if (!isOpen || !effectiveId) return null;

  const enquiry = data?.enquiry || initialEnquiry;

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!enquiry) return;
    try {
      await api.updateEnquiry(enquiry.id, { status: newStatus });
      await loadData();
      onEnquiryUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (newPriority: EnquiryPriority) => {
    if (!enquiry) return;
    try {
      await api.updateEnquiry(enquiry.id, { priority: newPriority });
      await loadData();
      onEnquiryUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignStaff = async (newUserId: string) => {
    if (!enquiry) return;
    try {
      await api.updateEnquiry(enquiry.id, { assigned_to: newUserId });
      await loadData();
      onEnquiryUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyMessage.trim() || !data?.conversation) return;
    setIsSendingReply(true);
    try {
      await api.sendMessage(data.conversation.id, newReplyMessage, 'staff', currentUser.name);
      setNewReplyMessage('');
      await loadData();
      onEnquiryUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !enquiry) return;
    setIsAddingNote(true);
    try {
      await api.addNote({
        customerId: enquiry.customer_id,
        enquiryId: enquiry.id,
        userId: currentUser.id,
        note: newNoteText,
      });
      setNewNoteText('');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleResolveEnquiry = async () => {
    if (!enquiry) return;
    try {
      await api.updateEnquiry(enquiry.id, { status: 'Resolved' });
      await loadData();
      onEnquiryUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {enquiry?.customer?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {enquiry?.customer?.name || 'Customer Enquiry'}
                </h2>
                {enquiry && <ChannelBadge channel={enquiry.channel} />}
                {enquiry && <StatusBadge status={enquiry.status} />}
                {enquiry && <PriorityBadge priority={enquiry.priority} />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enquiry #{enquiry?.id} • Created{' '}
                {enquiry ? new Date(enquiry.created_at).toLocaleString() : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {enquiry && enquiry.status !== 'Resolved' && (
              <button
                onClick={handleResolveEnquiry}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-200 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isLoading || !enquiry ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading enquiry details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Left 2 Cols: Main View & Tabs */}
            <div className="lg:col-span-2 flex flex-col h-full">
              {/* Customer's Original Message Card */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Original Customer Enquiry Message
                </span>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs leading-relaxed">
                  "{enquiry.message}"
                </p>

                {/* Quick extracted tags */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                    Product: <strong>{enquiry.product_service}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                    Quantity: <strong>{enquiry.quantity}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                    Location: <strong>{enquiry.location}</strong>
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-slate-900 text-xs font-semibold gap-4">
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'conversation'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Conversation ({data.conversation?.messages?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'analysis'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>AI Analysis</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'notes'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes ({data.notes?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('followups')}
                  className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'followups'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Follow-ups ({data.followUps?.length || 0})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 p-5 overflow-y-auto">
                {/* 1. Conversation Tab */}
                {activeTab === 'conversation' && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex-1 space-y-3 overflow-y-auto min-h-[220px]">
                      {(!data.conversation?.messages || data.conversation.messages.length === 0) ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                          No messages yet. Send a response to start the conversation.
                        </div>
                      ) : (
                        data.conversation.messages.map((m) => {
                          const isStaff = m.sender_type === 'staff';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">
                                  {m.sender_name || (isStaff ? 'Staff' : enquiry.customer?.name)}
                                </span>
                                <span>•</span>
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div
                                className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                                  isStaff
                                    ? 'bg-emerald-600 text-white rounded-br-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                                }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Reply Bar with AI Response trigger */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">Reply to customer:</span>
                        <button
                          type="button"
                          onClick={() => onOpenAIResponse(enquiry)}
                          className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Use AI Response Assistant</span>
                        </button>
                      </div>

                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newReplyMessage}
                          onChange={(e) => setNewReplyMessage(e.target.value)}
                          placeholder="Type customer reply here..."
                          className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          disabled={isSendingReply || !newReplyMessage.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* 2. AI Analysis Tab (Section 7) */}
                {activeTab === 'analysis' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          AI Enquiry Analysis (Gemini Intelligence)
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                          Urgency: {enquiry.ai_analysis?.urgency || enquiry.urgency}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Customer Intent</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {enquiry.ai_analysis?.intent || enquiry.intent}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Product / Service</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {enquiry.ai_analysis?.product_service || enquiry.product_service}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Quantity</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {enquiry.ai_analysis?.quantity || enquiry.quantity}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Location</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {enquiry.ai_analysis?.location || enquiry.location}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Sentiment</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {enquiry.ai_analysis?.sentiment || enquiry.sentiment}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                          <span className="text-[10px] text-slate-400 block font-medium">Channel</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{enquiry.channel}</span>
                        </div>
                      </div>

                      {/* Important Information list */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Key Factual Points:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                          {enquiry.ai_analysis?.important_information?.map((info, idx) => (
                            <li key={idx}>{info}</li>
                          )) || <li>Customer inquiry logged and verified.</li>}
                        </ul>
                      </div>

                      {/* Suggested Action */}
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                          Suggested Next Action:
                        </span>
                        <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                          {enquiry.ai_analysis?.suggested_action || 'Review details and draft official proposal'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4 text-xs">
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        rows={2}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Add private staff note about this enquiry or customer..."
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none text-xs"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isAddingNote || !newNoteText.trim()}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Note</span>
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2.5 pt-2">
                      {data.notes?.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">No notes yet.</div>
                      ) : (
                        data.notes?.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {n.user?.name || 'Staff Member'}
                              </span>
                              <span>{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Follow-ups Tab */}
                {activeTab === 'followups' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Scheduled Follow-ups for this Enquiry:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFollowUp(enquiry)}
                        className="flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule New Follow-up</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {data.followUps?.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          No follow-ups scheduled for this enquiry.
                        </div>
                      ) : (
                        data.followUps?.map((fol) => (
                          <div
                            key={fol.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {fol.reason}
                                </span>
                                <StatusBadge status={fol.status} />
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Due: {fol.due_date} at {fol.due_time} • Assigned to {fol.assigned_user?.name || 'Staff'}
                              </p>
                              {fol.notes && <p className="text-slate-400 text-[11px] mt-0.5 italic">Note: {fol.notes}</p>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Customer & Operational Controls */}
            <div className="p-5 space-y-5 bg-slate-50/30 dark:bg-slate-900/30 text-xs">
              {/* Customer Information Card (Section 8) */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Customer Information
                </h3>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {enquiry.customer?.name}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{enquiry.customer?.phone}</span>
                  </div>
                  {enquiry.customer?.email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{enquiry.customer?.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{enquiry.customer?.location || enquiry.location}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Preferred:</span>
                    <ChannelBadge channel={enquiry.customer?.preferred_channel || enquiry.channel} />
                  </div>
                </div>
              </div>

              {/* Status & Assignment Controls */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Manage Enquiry State
                </h3>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Enquiry Status
                  </label>
                  <select
                    value={enquiry.status}
                    onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Customer">Waiting for Customer</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={enquiry.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as EnquiryPriority)}
                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Assigned Staff Member
                  </label>
                  <select
                    value={enquiry.assigned_to}
                    onChange={(e) => handleAssignStaff(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
                  >
                    {staffList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => onOpenAIResponse(enquiry)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-emerald-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Response Assistant</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFollowUp(enquiry)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold transition-all"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>Schedule Follow-up</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
