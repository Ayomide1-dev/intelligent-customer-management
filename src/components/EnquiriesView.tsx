import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Reply,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  Calendar,
  CalendarCheck,
  User as UserIcon,
} from 'lucide-react';
import { Enquiry, Channel, EnquiryStatus, EnquiryPriority, User } from '../types';
import { ChannelBadge, PriorityBadge, StatusBadge } from './Badges';

interface EnquiriesViewProps {
  enquiries: Enquiry[];
  staffMembers?: User[];
  team?: User[];
  onSelectEnquiry: (enquiry: Enquiry) => void;
  onOpenAddEnquiry: () => void;
  onOpenAIResponse: (enquiry: Enquiry) => void;
  onUpdateStatus?: (enquiryId: string, status: EnquiryStatus) => void;
  onScheduleFollowUp?: (enquiry: Enquiry) => void;
}

export function EnquiriesView({
  enquiries,
  staffMembers,
  team,
  onSelectEnquiry,
  onOpenAddEnquiry,
  onOpenAIResponse,
  onUpdateStatus = () => {},
  onScheduleFollowUp,
}: EnquiriesViewProps) {
  const staffList = staffMembers || team || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStaff, setSelectedStaff] = useState<string>('All');
  const [selectedIntent, setSelectedIntent] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic
  const filteredEnquiries = enquiries.filter((e) => {
    if (selectedChannel !== 'All' && e.channel !== selectedChannel) return false;
    if (selectedStatus !== 'All' && e.status !== selectedStatus) return false;
    if (selectedPriority !== 'All' && e.priority !== selectedPriority) return false;
    if (selectedStaff !== 'All' && e.assigned_to !== selectedStaff) return false;
    if (selectedIntent !== 'All' && !e.intent.toLowerCase().includes(selectedIntent.toLowerCase())) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchCustomer = e.customer?.name.toLowerCase().includes(q) || e.customer?.phone.includes(q);
      const matchMsg = e.message.toLowerCase().includes(q);
      const matchProduct = e.product_service.toLowerCase().includes(q);
      const matchLocation = e.location.toLowerCase().includes(q);
      const matchIntent = e.intent.toLowerCase().includes(q);
      if (!matchCustomer && !matchMsg && !matchProduct && !matchLocation && !matchIntent) {
        return false;
      }
    }
    return true;
  });

  const channels: (Channel | 'All')[] = ['All', 'WhatsApp', 'Website', 'Instagram', 'Facebook', 'Phone', 'Other'];
  const statuses: (EnquiryStatus | 'All')[] = [
    'All',
    'New',
    'In Progress',
    'Waiting for Customer',
    'Follow-up Required',
    'Resolved',
    'Closed',
  ];
  const priorities: (EnquiryPriority | 'All')[] = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Customer Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Capture, track, and manage all multi-channel incoming customer requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            id="btn-toggle-filters"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
              showFilters || selectedChannel !== 'All' || selectedStatus !== 'All' || selectedPriority !== 'All'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(selectedChannel !== 'All' || selectedStatus !== 'All' || selectedPriority !== 'All' || selectedStaff !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={onOpenAddEnquiry}
            id="btn-add-enquiry-page"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="enquiries-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, product, location, or message..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium whitespace-nowrap">
            Total: <strong className="text-slate-900 dark:text-white">{enquiries.length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg font-medium whitespace-nowrap">
            New: <strong>{enquiries.filter((e) => e.status === 'New').length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 rounded-lg font-medium whitespace-nowrap">
            Follow-up: <strong>{enquiries.filter((e) => e.status === 'Follow-up Required').length}</strong>
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg font-medium whitespace-nowrap">
            Resolved: <strong>{enquiries.filter((e) => e.status === 'Resolved').length}</strong>
          </span>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {channels.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Assigned Staff
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="All">All Staff</option>
              {staffList.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedChannel('All');
                setSelectedStatus('All');
                setSelectedPriority('All');
                setSelectedStaff('All');
                setSelectedIntent('All');
                setSearchTerm('');
              }}
              className="w-full py-2 px-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Enquiries Table (Section 5) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-3">Channel</th>
                <th className="py-3.5 px-4">Enquiry Details</th>
                <th className="py-3.5 px-3">AI Intent</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Assigned To</th>
                <th className="py-3.5 px-3">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    No enquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectEnquiry(enquiry)}
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {enquiry.customer?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {enquiry.customer?.phone}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {enquiry.customer?.location || enquiry.location}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-3">
                      <ChannelBadge channel={enquiry.channel} />
                    </td>

                    {/* Enquiry Message */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <p className="font-medium text-slate-900 dark:text-slate-200 truncate">
                        {enquiry.product_service && enquiry.product_service !== 'Not provided'
                          ? enquiry.product_service
                          : enquiry.message}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {enquiry.message}
                      </p>
                      {enquiry.quantity && enquiry.quantity !== 'Not provided' && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                          Qty: {enquiry.quantity}
                        </span>
                      )}
                    </td>

                    {/* Intent */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 max-w-[120px] truncate" title={enquiry.intent}>
                        {enquiry.intent}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3">
                      <PriorityBadge priority={enquiry.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={enquiry.status}
                        onChange={(e) => onUpdateStatus(enquiry.id, e.target.value as EnquiryStatus)}
                        className="text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        {statuses.filter((s) => s !== 'All').map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    {/* Assigned To */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                          {enquiry.assigned_user?.name?.charAt(0) || 'S'}
                        </div>
                        <span className="truncate max-w-[90px]">{enquiry.assigned_user?.name?.split(' ')[0] || 'Staff'}</span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      <div>{new Date(enquiry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(enquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenAIResponse(enquiry)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold transition-colors"
                          title="Generate AI Response"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">AI Reply</span>
                        </button>
                        {onScheduleFollowUp && (
                          <button
                            onClick={() => onScheduleFollowUp(enquiry)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Schedule Follow-up"
                          >
                            <CalendarCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectEnquiry(enquiry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
