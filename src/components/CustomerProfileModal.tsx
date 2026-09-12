import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Plus,
  Inbox,
  User as UserIcon,
} from 'lucide-react';
import { Customer, Enquiry, Conversation, FollowUp, Note, User } from '../types';
import { api } from '../lib/api';
import { ChannelBadge, StatusBadge, PriorityBadge } from './Badges';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  currentUser: User;
  onSelectEnquiry: (enquiry: Enquiry) => void;
}

export function CustomerProfileModal({
  isOpen,
  onClose,
  customerId,
  currentUser,
  onSelectEnquiry,
}: CustomerProfileModalProps) {
  const [data, setData] = useState<{
    customer: Customer;
    enquiries: Enquiry[];
    conversations: Conversation[];
    followUps: FollowUp[];
    notes: Note[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'enquiries' | 'followups' | 'notes'>('enquiries');
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const loadProfile = async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const res = await api.getCustomer(customerId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      loadProfile();
    }
  }, [isOpen, customerId]);

  if (!isOpen || !customerId) return null;

  const customer = data?.customer;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !customer) return;
    setIsSubmittingNote(true);
    try {
      await api.addNote({
        customerId: customer.id,
        userId: currentUser.id,
        note: newNote,
      });
      setNewNote('');
      await loadProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {customer?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {customer?.name}
                </h2>
                {customer && <StatusBadge status={customer.status} />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customer profile & lifetime engagement history
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading || !customer ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading customer profile...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Customer Details & Summary (Section 11) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Contact Details
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Location & Channel
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.location}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Prefers:</span>
                  <ChannelBadge channel={customer.preferred_channel} />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Total Enquiries
                </span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                  {data.enquiries.length}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {data.enquiries.filter((e) => e.status === 'Resolved' || e.status === 'Closed').length} resolved
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Customer Since
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(customer.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Last active: {new Date(customer.last_interaction_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('enquiries')}
                className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'enquiries'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Enquiry History ({data.enquiries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('followups')}
                className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'followups'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Follow-ups ({data.followUps.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Internal Notes ({data.notes.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === 'enquiries' && (
                <div className="space-y-3">
                  {data.enquiries.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">No enquiries recorded.</div>
                  ) : (
                    data.enquiries.map((enquiry) => (
                      <div
                        key={enquiry.id}
                        onClick={() => {
                          onClose();
                          onSelectEnquiry(enquiry);
                        }}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-all flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <ChannelBadge channel={enquiry.channel} />
                            <StatusBadge status={enquiry.status} />
                            <PriorityBadge priority={enquiry.priority} />
                            <span className="text-[10px] text-slate-400">
                              {new Date(enquiry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {enquiry.product_service && enquiry.product_service !== 'Not provided'
                              ? enquiry.product_service
                              : enquiry.message}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">"{enquiry.message}"</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          View details →
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'followups' && (
                <div className="space-y-3">
                  {data.followUps.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">No follow-ups recorded.</div>
                  ) : (
                    data.followUps.map((fol) => (
                      <div
                        key={fol.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {fol.reason}
                            </span>
                            <StatusBadge status={fol.status} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Due: {fol.due_date} at {fol.due_time}
                          </p>
                          {fol.notes && <p className="text-slate-400 text-[11px] mt-0.5 italic">{fol.notes}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an internal note about this customer..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingNote || !newNote.trim()}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1 disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Note</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {data.notes.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">No notes for this customer.</div>
                    ) : (
                      data.notes.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
