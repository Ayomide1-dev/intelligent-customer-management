import React, { useState } from 'react';
import { X, Sparkles, User, Phone, Mail, MapPin, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { Customer, Channel, EnquiryPriority, User as StaffUser, AIAnalysis } from '../types';
import { api } from '../lib/api';

interface AddEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers?: Customer[];
  staffMembers?: StaffUser[];
  team?: StaffUser[];
  onEnquiryCreated?: () => void;
  onEnquiryAdded?: () => void;
}

export function AddEnquiryModal({
  isOpen,
  onClose,
  customers = [],
  staffMembers,
  team,
  onEnquiryCreated,
  onEnquiryAdded,
}: AddEnquiryModalProps) {
  const staffList = staffMembers || team || [];
  const customerList = customers || [];
  const handleSuccess = () => {
    if (onEnquiryCreated) onEnquiryCreated();
    if (onEnquiryAdded) onEnquiryAdded();
  };
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+234 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerLocation, setCustomerLocation] = useState('Lagos');

  const [channel, setChannel] = useState<Channel>('WhatsApp');
  const [message, setMessage] = useState('');
  const [productService, setProductService] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState<EnquiryPriority>('Medium');
  const [assignedTo, setAssignedTo] = useState<string>(staffList[0]?.id || '');
  const [notes, setNotes] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiAnalysis = async () => {
    if (!message.trim()) {
      setError('Please enter the customer enquiry message first');
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeEnquiry(message, customerLocation, channel);
      setAiPreview(result);
      if (result.product_service && result.product_service !== 'Not provided') {
        setProductService(result.product_service);
      }
      if (result.quantity && result.quantity !== 'Not provided') {
        setQuantity(result.quantity);
      }
      if (result.location && result.location !== 'Not provided') {
        setCustomerLocation(result.location);
      }
      if (result.urgency === 'Urgent') {
        setPriority('Urgent');
      }
    } catch (err: any) {
      console.error(err);
      setError('AI analysis failed to respond.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Enquiry message is required.');
      return;
    }
    if (customerMode === 'new' && (!customerName.trim() || !customerPhone.trim())) {
      setError('Please provide customer name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createEnquiry({
        customerId: customerMode === 'existing' ? selectedCustomerId : undefined,
        customerName: customerMode === 'new' ? customerName : undefined,
        customerPhone: customerMode === 'new' ? customerPhone : undefined,
        customerEmail: customerMode === 'new' ? customerEmail : undefined,
        customerLocation: customerMode === 'new' ? customerLocation : undefined,
        channel,
        message,
        productService,
        quantity,
        location: customerLocation,
        priority,
        assignedTo: assignedTo || staffList[0]?.id,
        notes,
      });

      handleSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save enquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
              Add Customer Enquiry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Capture enquiry details and run AI understanding
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Customer Selection Toggle */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Source</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setCustomerMode('new')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    customerMode === 'new'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  New Customer
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    customerMode === 'existing'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Existing Customer
                </button>
              </div>
            </div>

            {customerMode === 'existing' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Existing Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const found = customers.find((c) => c.id === e.target.value);
                    if (found) {
                      setCustomerLocation(found.location);
                      setChannel(found.preferred_channel);
                    }
                  }}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                  required={customerMode === 'existing'}
                >
                  <option value="">-- Choose Customer --</option>
                  {customerList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.location}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Adebayo Ogunlesi"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                      required={customerMode === 'new'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                      required={customerMode === 'new'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="adebayo@example.com"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location / City
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      placeholder="e.g. Lagos, Ibadan, Abuja, Accra"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Channel & Message */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['WhatsApp', 'Website', 'Instagram', 'Facebook', 'Phone', 'Other'] as Channel[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                    channel === c
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enquiry Message *
                </label>
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={isAnalyzing || !message.trim()}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Preview AI Analysis</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste or type customer's exact message (e.g. 'Hello, I want to know the price of 20 chairs and if you deliver to Ibadan.')"
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* AI Analysis Preview Box (Section 7) */}
          {aiPreview && (
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI Analysis Identified:
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
                  Urgency: {aiPreview.urgency}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                <div>Intent: <strong>{aiPreview.intent}</strong></div>
                <div>Product: <strong>{aiPreview.product_service}</strong></div>
                <div>Quantity: <strong>{aiPreview.quantity}</strong></div>
                <div>Location: <strong>{aiPreview.location}</strong></div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Suggested Action: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{aiPreview.suggested_action}</span>
              </div>
            </div>
          )}

          {/* Extracted Details & Assignments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product / Service
              </label>
              <input
                type="text"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                placeholder="e.g. Chairs, Solar Inverter"
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 20 units"
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EnquiryPriority)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign to Staff Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                {staffList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Lead is ready to purchase this week"
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-save-enquiry-modal"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Enquiry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
