import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';
import { api } from '../lib/api';
import { Channel } from '../types';

interface PublicEnquiryViewProps {
  onEnquirySubmitted: () => void;
  onReturnToCRM: () => void;
}

export function PublicEnquiryView({
  onEnquirySubmitted,
  onReturnToCRM,
}: PublicEnquiryViewProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Lagos');
  const [productService, setProductService] = useState('');
  const [channel, setChannel] = useState<Channel>('WhatsApp');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createEnquiry({
        customerName: name,
        phone,
        email,
        location,
        channel: 'Website',
        productService: productService || 'General Commercial Enquiry',
        message,
        preferredChannel: channel,
      });

      setSubmittedId(res.enquiry?.id || 'EQ-NEW');
      setIsSuccess(true);
      onEnquirySubmitted();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('+234 ');
    setEmail('');
    setLocation('Lagos');
    setProductService('');
    setMessage('');
    setIsSuccess(false);
    setSubmittedId(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      {/* Top Banner indicating this is Section 22 */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Public Website Enquiry Form (Section 22)
          </span>
        </div>
        <button
          onClick={onReturnToCRM}
          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
        >
          <span>Return to CRM Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Brand Banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white p-7 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-200 font-heading">
              Apex Commercial Africa
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
            How can we assist your business today?
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-md leading-relaxed">
            Send us your request for solar equipment, diesel power systems, bulk imports, or industrial maintenance. Our team responds within minutes.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  Enquiry Received Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you, <strong>{name}</strong>. Your enquiry ticket <strong>#{submittedId}</strong> has been logged in SmartEnquiry CRM and our AI has notified on-duty staff.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Expect a response via {channel} within 15–30 minutes.</span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Submit Another Enquiry
                </button>
                <button
                  onClick={onReturnToCRM}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  View in CRM Dashboard →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Babatunde Ogunlesi"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="babatunde@company.africa"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Ikeja, Lagos"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product or Service of Interest
                  </label>
                  <input
                    type="text"
                    value={productService}
                    onChange={(e) => setProductService(e.target.value)}
                    placeholder="e.g. 10kVA Solar Inverter Setup"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Response Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as Channel)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Phone">Direct Phone Call</option>
                    <option value="Website">Email / Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enquiry Details & Questions *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your requirement, required delivery timeline, or any specific technical questions..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all text-xs sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Enquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Commercial Enquiry</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by SmartEnquiry AI Routing Engine</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
