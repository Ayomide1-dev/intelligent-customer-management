import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, CalendarCheck, AlertCircle, Loader2 } from 'lucide-react';
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

  const [customerId, setCustomerId] = useState<string>('');
  const [enquiryId, setEnquiryId] = useState<string>('');
  const [reason, setReason] = useState('Check if customer received quotation and has questions');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('11:00');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const defaultCustomerId = preselectedEnquiry?.customer_id || customers[0]?.id || '';
      setCustomerId(defaultCustomerId);
      setEnquiryId(preselectedEnquiry?.id || '');

      if (preselectedEnquiry) {
        setReason(`Follow up on ${preselectedEnquiry.product_service || 'customer quotation'} and delivery confirmation`);
        setAssignedTo(preselectedEnquiry.assigned_to || staffList[0]?.id || '');
      } else {
        setReason('Check if customer received quotation and has questions');
        setAssignedTo(staffList[0]?.id || '');
      }

      // Default due date: tomorrow (Rule 2/3)
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      setDueDate(tomorrow);
      setDueTime('11:00');
      setNotes('');
      setErrorMessage(null);
    }
  }, [isOpen, preselectedEnquiry, customers, staffList]);

  if (!isOpen) return null;

  const handleEnquiryChange = (selectedId: string) => {
    setEnquiryId(selectedId);
    if (selectedId) {
      const enq = enquiries.find((e) => e.id === selectedId);
      if (enq && enq.customer_id) {
        setCustomerId(enq.customer_id);
      }
    }
  };

  const handleSetDuePreset = (daysAhead: number) => {
    const targetDate = new Date(Date.now() + 86400000 * daysAhead).toISOString().split('T')[0];
    setDueDate(targetDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const effectiveCustomerId = customerId || customers[0]?.id;
    if (!effectiveCustomerId) {
      setErrorMessage('Please select a customer for this follow-up.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Please provide a follow-up reason.');
      return;
    }
    if (!dueDate) {
      setErrorMessage('Please specify a valid due date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createFollowUp({
        customerId: effectiveCustomerId,
        enquiryId: enquiryId || undefined,
        reason: reason.trim(),
        dueDate,
        dueTime: dueTime || '11:00',
        assignedTo: assignedTo || staffList[0]?.id || 'usr-1',
        notes: notes.trim(),
      });
      handleSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to schedule follow-up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickReasons = [
    'Quotation follow-up (24h check)',
    'Confirm warehouse stock & quantities',
    'Verify delivery address & waybill terms',
    'Follow up on invoice & payment confirmation',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Schedule Follow-up
              </h2>
              <p className="text-[11px] text-slate-500">Automated reminder & customer touchpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
              required
            >
              {customers.length === 0 && <option value="">No customers available</option>}
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone} • {c.location})
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
              onChange={(e) => handleEnquiryChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- General Customer Follow-up --</option>
              {enquiries
                .filter((e) => !customerId || e.customer_id === customerId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    #{e.id} - {e.product_service || e.message.slice(0, 35)} ({e.channel})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Follow-up Reason *
              </label>
              <span className="text-[10px] text-slate-400">Quick presets below</span>
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Confirm quotation delivery, verify item count"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
              required
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {quickReasons.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(qr)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
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
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick timing shortcuts */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => handleSetDuePreset(1)}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
              >
                Tomorrow (24h)
              </button>
              <button
                type="button"
                onClick={() => handleSetDuePreset(2)}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                In 2 Days (48h)
              </button>
              <button
                type="button"
                onClick={() => handleSetDuePreset(7)}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              >
                In 1 Week
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Staff
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
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
              placeholder="Provide context or specific points to confirm (e.g. check transport charges to Ibadan)..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/30 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Schedule Follow-up</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
