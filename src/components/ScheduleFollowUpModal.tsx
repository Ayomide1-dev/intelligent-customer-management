import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, CalendarCheck } from 'lucide-react';
import { Customer, Enquiry, User as StaffUser } from '../types';
import { api } from '../lib/api';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers?: Customer[];
  enquiries?: Enquiry[];
  staffMembers?: StaffUser[];
  team?: StaffUser[];
  preselectedEnquiry?: Enquiry | null;
  onFollowUpScheduled?: () => void;
  onFollowUpAdded?: () => void;
}

export function ScheduleFollowUpModal({
  isOpen,
  onClose,
  customers = [],
  enquiries = [],
  staffMembers,
  team,
  preselectedEnquiry,
  onFollowUpScheduled,
  onFollowUpAdded,
}: ScheduleFollowUpModalProps) {
  const staffList = staffMembers || team || [];
  const handleSuccess = () => {
    if (onFollowUpScheduled) onFollowUpScheduled();
    if (onFollowUpAdded) onFollowUpAdded();
  };
  const [customerId, setCustomerId] = useState<string>(
    preselectedEnquiry?.customer_id || customers[0]?.id || ''
  );
  const [enquiryId, setEnquiryId] = useState<string>(preselectedEnquiry?.id || '');
  const [reason, setReason] = useState('Check if customer received quotation and has questions');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState('11:00');
  const [assignedTo, setAssignedTo] = useState(staffList[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !reason || !dueDate) return;
    setIsSubmitting(true);
    try {
      await api.createFollowUp({
        customerId,
        enquiryId,
        reason,
        dueDate,
        dueTime,
        assignedTo,
        notes,
      });
      handleSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Schedule Follow-up
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Related Enquiry (Optional)
            </label>
            <select
              value={enquiryId}
              onChange={(e) => setEnquiryId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="">-- General Customer Follow-up --</option>
              {enquiries
                .filter((e) => !customerId || e.customer_id === customerId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    #{e.id} - {e.product_service || e.message.slice(0, 30)}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Follow-up Reason *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Confirm quotation delivery, verify item count"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Follow-up Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Follow-up Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Staff
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {staffList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Follow-up Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context or specific points to confirm..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
            >
              Schedule Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
