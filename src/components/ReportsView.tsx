import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarCheck,
  AlertTriangle,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, Enquiry, FollowUp } from '../types';

interface ReportsViewProps {
  stats: DashboardStats;
  enquiries: Enquiry[];
  followUps: FollowUp[];
}

export function ReportsView({ stats, enquiries, followUps }: ReportsViewProps) {
  const [timeRange, setTimeRange] = useState('30d');

  const totalEnquiries = enquiries.length || 1;
  const completedCount = enquiries.filter((e) => e.status === 'Resolved' || e.status === 'Closed').length;
  const pendingCount = enquiries.filter((e) => e.status === 'In Progress' || e.status === 'New').length;
  const followUpsCompleted = followUps.filter((f) => f.status === 'Completed').length;
  const overdueFollowUps = followUps.filter((f) => f.status === 'Overdue').length;

  const resolutionRate = Math.round((completedCount / totalEnquiries) * 100);

  const channelData = [
    { name: 'WhatsApp', count: enquiries.filter((e) => e.channel === 'WhatsApp').length, color: 'bg-emerald-500' },
    { name: 'Website', count: enquiries.filter((e) => e.channel === 'Website').length, color: 'bg-teal-500' },
    { name: 'Instagram', count: enquiries.filter((e) => e.channel === 'Instagram').length, color: 'bg-pink-500' },
    { name: 'Facebook', count: enquiries.filter((e) => e.channel === 'Facebook').length, color: 'bg-blue-600' },
    { name: 'Phone', count: enquiries.filter((e) => e.channel === 'Phone').length, color: 'bg-amber-500' },
    { name: 'Other', count: enquiries.filter((e) => e.channel === 'Other').length, color: 'bg-slate-400' },
  ];

  const statusData = [
    { name: 'New', count: enquiries.filter((e) => e.status === 'New').length, color: 'bg-blue-500' },
    { name: 'In Progress', count: enquiries.filter((e) => e.status === 'In Progress').length, color: 'bg-amber-500' },
    { name: 'Waiting for Customer', count: enquiries.filter((e) => e.status === 'Waiting for Customer').length, color: 'bg-purple-500' },
    { name: 'Follow-up Required', count: enquiries.filter((e) => e.status === 'Follow-up Required').length, color: 'bg-orange-500' },
    { name: 'Resolved', count: enquiries.filter((e) => e.status === 'Resolved').length, color: 'bg-emerald-500' },
    { name: 'Closed', count: enquiries.filter((e) => e.status === 'Closed').length, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Business Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Key operational metrics, multi-channel enquiry volumes, and response performance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Quarter' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Key Performance Metric Cards (Section 16) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Total Enquiries</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-heading">
            {enquiries.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14% vs last mo
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Avg Response Time</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-heading">
            {stats.avg_response_time_minutes}m
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">
            Top 5% in sector
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-heading">
            {completedCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {resolutionRate}% resolution rate
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Pending</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-heading">
            {pendingCount}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active pipeline</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Follow-ups Done</span>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 font-heading">
            {followUpsCompleted}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Customer touches</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 block">Overdue Follow-ups</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 font-heading">
            {overdueFollowUps}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
            Needs attention
          </span>
        </div>
      </div>

      {/* Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Enquiries by Channel
            </h2>
            <span className="text-xs text-slate-400">Total: {enquiries.length}</span>
          </div>

          <div className="space-y-4">
            {channelData.map((item) => {
              const pct = Math.round((item.count / totalEnquiries) * 100);
              return (
                <div key={item.name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Enquiries by Status
            </h2>
            <span className="text-xs text-emerald-600 font-semibold">
              Resolution Rate: {resolutionRate}%
            </span>
          </div>

          <div className="space-y-4">
            {statusData.map((item) => {
              const pct = Math.round((item.count / totalEnquiries) * 100);
              return (
                <div key={item.name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
