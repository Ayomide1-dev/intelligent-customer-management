import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FollowUp, FollowUpStatus, User } from '../types';
import { StatusBadge } from './Badges';
import { api } from '../lib/api';

interface FollowUpsViewProps {
  followUps: FollowUp[];
  staffMembers: User[];
  onOpenScheduleModal: () => void;
  onRefreshFollowUps: () => void;
  onSelectCustomerById: (customerId: string) => void;
}

export function FollowUpsView({
  followUps,
  staffMembers,
  onOpenScheduleModal,
  onRefreshFollowUps,
  onSelectCustomerById,
}: FollowUpsViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedStaff, setSelectedStaff] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = followUps.filter((f) => {
    if (selectedStatus !== 'All' && f.status !== selectedStatus) return false;
    if (selectedStaff !== 'All' && f.assigned_to !== selectedStaff) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = f.customer?.name.toLowerCase().includes(q);
      const matchReason = f.reason.toLowerCase().includes(q);
      if (!matchCustomer && !matchReason) return false;
    }
    return true;
  });

  const handleMarkDone = async (id: string) => {
    try {
      await api.updateFollowUp(id, { status: 'Completed' });
      onRefreshFollowUps();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReschedule = async (id: string) => {
    const nextDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    try {
      await api.updateFollowUp(id, { due_date: nextDate, status: 'Pending' });
      onRefreshFollowUps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Follow-up Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automated reminders and scheduled customer touchpoints across all channels.
          </p>
        </div>

        <button
          onClick={onOpenScheduleModal}
          id="btn-schedule-followup-page"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Automated Follow-Up Rules Engine Banner (Section 14) */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-3xl border border-emerald-900 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold tracking-tight font-heading">
            Automated Follow-up Engine Active (5 Business Rules)
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            System Rules 1–5
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-[11px] text-slate-300 pt-2">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block">Rule 1</span>
            New Enquiry Received → Immediate notification dispatched
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block">Rule 2</span>
            No Response in 24h → Auto-flagged "Follow-up Required"
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block">Rule 3</span>
            Quote Awaiting → Set follow-up within 48 hours
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block">Rule 4</span>
            Enquiry Resolved → All scheduled follow-ups auto-complete
          </div>
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-emerald-400 font-bold block">Rule 5</span>
            Urgent Priority → Immediate alert to staff & manager
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search follow-ups by customer or reason..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Due Today">Due Today</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Staff</option>
            {staffMembers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table (Section 13) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Follow-up Reason</th>
                <th className="py-3.5 px-3">Due Date & Time</th>
                <th className="py-3.5 px-3">Assigned Staff</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No follow-ups matching this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((fol) => (
                  <tr
                    key={fol.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => fol.customer_id && onSelectCustomerById(fol.customer_id)}
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 cursor-pointer"
                      >
                        {fol.customer?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {fol.customer?.phone} • {fol.customer?.location}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[280px]">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {fol.reason}
                      </p>
                      {fol.notes && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Note: {fol.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {fol.due_date}
                      </div>
                      <div className="text-[11px] text-slate-400">{fol.due_time}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-700 dark:text-slate-300">
                        {fol.assigned_user?.name || 'Staff Member'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <StatusBadge status={fol.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {fol.status !== 'Completed' && (
                          <>
                            <button
                              onClick={() => handleMarkDone(fol.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs transition-colors"
                            >
                              Mark Done
                            </button>
                            <button
                              onClick={() => handleReschedule(fol.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-xs transition-colors"
                            >
                              +2 Days
                            </button>
                          </>
                        )}
                        {fol.status === 'Completed' && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
