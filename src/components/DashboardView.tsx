import React from 'react';
import {
  Inbox,
  Clock,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  HelpCircle,
  ChevronRight,
  Eye,
  Reply,
} from 'lucide-react';
import { DashboardStats, Enquiry, FollowUp, User } from '../types';
import { ChannelBadge, PriorityBadge, StatusBadge } from './Badges';

interface DashboardViewProps {
  currentUser?: User;
  stats: DashboardStats;
  recentEnquiries: Enquiry[];
  todaysFollowUps?: FollowUp[];
  pendingFollowUps?: FollowUp[];
  channelBreakdown?: any;
  onOpenAddEnquiry?: () => void;
  onSelectEnquiry: (enquiry: Enquiry) => void;
  onSelectFollowUp?: (followUp: FollowUp) => void;
  onNavigateToEnquiries: () => void;
  onNavigateToFollowUps: () => void;
  onOpenAIResponse: (enquiry: Enquiry) => void;
  onCompleteFollowUp?: (id: string) => void;
}

export function DashboardView({
  currentUser = { id: 'usr-1', name: 'Amara Okafor', email: 'amara@smartcrm.africa', role: 'admin', created_at: '' },
  stats,
  recentEnquiries,
  todaysFollowUps,
  pendingFollowUps,
  onSelectEnquiry,
  onSelectFollowUp = () => {},
  onNavigateToEnquiries,
  onNavigateToFollowUps,
  onOpenAIResponse,
  onCompleteFollowUp = () => {},
}: DashboardViewProps) {
  const followUpsList = todaysFollowUps || pendingFollowUps || [];
  const maxDayCount = Math.max(...(stats.last_7_days_enquiries?.map((d) => d.count) || [1]), 1);

  const totalChannelCount = Object.values(stats.channel_breakdown).reduce((a, b) => a + b, 0) || 1;

  const channelIcons: Record<string, any> = {
    WhatsApp: MessageCircle,
    Website: Globe,
    Instagram: Instagram,
    Facebook: Facebook,
    Other: HelpCircle,
  };

  const channelColors: Record<string, string> = {
    WhatsApp: 'bg-emerald-500',
    Website: 'bg-teal-500',
    Instagram: 'bg-pink-500',
    Facebook: 'bg-blue-600',
    Other: 'bg-slate-400',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        {/* Background decorative pattern */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Multi-Channel Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Good morning, {currentUser.name}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-2xl">
            Here's what's happening with your customer enquiries today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-1">
          <button
            onClick={onNavigateToEnquiries}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-100 shadow-md transition-all active:scale-95"
          >
            <span>View All Enquiries</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 Summary Cards (Section 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. New Enquiries */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">New Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              {stats.new_enquiries}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting first response</span>
        </div>

        {/* 2. Pending Enquiries */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              {stats.pending_enquiries}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">active</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">In progress or awaiting customer</span>
        </div>

        {/* 3. Follow-ups Today */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-orange-300 dark:hover:border-orange-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Follow-ups Today</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              {stats.follow_ups_today}
            </span>
            {stats.overdue_follow_ups > 0 && (
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                ({stats.overdue_follow_ups} overdue)
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Scheduled for today</span>
        </div>

        {/* 4. Completed Enquiries */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              {stats.completed_enquiries}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">resolved</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Successfully resolved</span>
        </div>

        {/* 5. High Priority Enquiries */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">High Priority</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-heading">
              {stats.high_priority_enquiries}
            </span>
            <span className="text-[11px] font-semibold text-rose-500">Urgent</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Needs immediate attention</span>
        </div>
      </div>

      {/* Mid Section: 7-Day Chart & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Enquiry Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Enquiries Over Last 7 Days
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily incoming traffic across African channels
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
              Avg Response: {stats.avg_response_time_minutes} min
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4 h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {stats.last_7_days_enquiries?.map((day, idx) => {
              const heightPercent = Math.max((day.count / maxDayCount) * 100, 10);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all rounded-t-xl"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Channel Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Enquiry distribution by incoming source
            </p>

            <div className="space-y-3.5">
              {['WhatsApp', 'Website', 'Instagram', 'Facebook', 'Other'].map((channelName) => {
                const count = stats.channel_breakdown[channelName as any] || 0;
                const percentage = Math.round((count / totalChannelCount) * 100);
                const Icon = channelIcons[channelName] || HelpCircle;
                const barColor = channelColors[channelName] || 'bg-slate-400';

                return (
                  <div key={channelName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{channelName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                        <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Unified Multi-Channel Inbox</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Real-time sync</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Enquiries & Today's Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries (Section 4) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Recent Enquiries
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest customer queries received across all channels
              </p>
            </div>
            <button
              onClick={onNavigateToEnquiries}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>See all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Enquiry</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentEnquiries.slice(0, 5).map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectEnquiry(enquiry)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {enquiry.customer?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {enquiry.customer?.location || enquiry.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <ChannelBadge channel={enquiry.channel} />
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {enquiry.product_service && enquiry.product_service !== 'Not provided'
                          ? enquiry.product_service
                          : enquiry.message}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {enquiry.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <PriorityBadge priority={enquiry.priority} />
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={enquiry.status} />
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(enquiry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenAIResponse(enquiry)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40 transition-colors"
                          title="Generate AI Response"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectEnquiry(enquiry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Follow-ups (Section 4) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Today's Follow-ups
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tasks requiring customer follow-up
                </p>
              </div>
              <button
                onClick={onNavigateToFollowUps}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {followUpsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                  No follow-ups due today! You are all caught up.
                </div>
              ) : (
                followUpsList.map((fol) => (
                  <div
                    key={fol.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {fol.customer?.name || 'Customer'}
                      </span>
                      <StatusBadge status={fol.status} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {fol.reason}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Due: {fol.due_time || 'Today'}</span>
                      <div className="flex items-center gap-2">
                        {fol.status !== 'Completed' && (
                          <button
                            onClick={() => onCompleteFollowUp(fol.id)}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => onSelectFollowUp(fol)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Automated Follow-up Engine</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
