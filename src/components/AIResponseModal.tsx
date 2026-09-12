import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Send,
  Loader2,
  RefreshCw,
  Minimize2,
  Briefcase,
  Smile,
  AlertCircle,
} from 'lucide-react';
import { Enquiry, User } from '../types';
import { api } from '../lib/api';
import { ChannelBadge } from './Badges';

interface AIResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: Enquiry | null;
  currentUser?: User;
  onResponseSent?: (enquiryId: string, responseText: string) => void;
}

export function AIResponseModal({
  isOpen,
  onClose,
  enquiry,
  currentUser,
  onResponseSent,
}: AIResponseModalProps) {
  const [draftResponse, setDraftResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeModifier, setActiveModifier] = useState<'default' | 'shorter' | 'professional' | 'friendlier'>('default');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && enquiry) {
      handleGenerate('default');
    }
  }, [isOpen, enquiry?.id]);

  if (!isOpen || !enquiry) return null;

  const handleGenerate = async (modifier: 'default' | 'shorter' | 'professional' | 'friendlier' = 'default') => {
    setIsLoading(true);
    setError(null);
    setActiveModifier(modifier);
    try {
      const generated = await api.generateResponse({
        customerName: enquiry.customer?.name || 'Customer',
        enquiryMessage: enquiry.message,
        productService: enquiry.product_service,
        quantity: enquiry.quantity,
        location: enquiry.location || enquiry.customer?.location,
        channel: enquiry.channel,
        modifier,
      });
      setDraftResponse(generated);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate AI response. You may type directly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!draftResponse.trim()) return;
    setIsSending(true);
    try {
      // Find or load conversation
      const { conversation } = await api.getEnquiry(enquiry.id);
      if (conversation) {
        await api.sendMessage(conversation.id, draftResponse, 'staff', currentUser?.name || 'Staff Member');
      }
      // Also update enquiry status to "In Progress" or "Waiting for Customer"
      await api.updateEnquiry(enquiry.id, {
        status: 'Waiting for Customer',
        last_activity_at: new Date().toISOString(),
      });

      if (onResponseSent) {
        onResponseSent(enquiry.id, draftResponse);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Failed to send response to customer thread.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <span>AI Response Assistant</span>
                <ChannelBadge channel={enquiry.channel} />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate, refine, review, and reply to {enquiry.customer?.name}
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

        <div className="p-5 space-y-4">
          {/* Customer Enquiry Summary Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Customer Message ({enquiry.customer?.name}):
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Location: {enquiry.location || enquiry.customer?.location || 'Not provided'}
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              "{enquiry.message}"
            </p>
            {enquiry.ai_analysis && (
              <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Suggested Action: {enquiry.ai_analysis.suggested_action}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tone Refinement Buttons (Section 9) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Refine AI Response Tone:
              </span>
              {isLoading && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleGenerate('default')}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  activeModifier === 'default'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isLoading && activeModifier === 'default' ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate('shorter')}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  activeModifier === 'shorter'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Minimize2 className="w-3 h-3" />
                <span>Make Shorter</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate('professional')}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  activeModifier === 'professional'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Make More Professional</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate('friendlier')}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  activeModifier === 'friendlier'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smile className="w-3 h-3" />
                <span>Make Friendlier</span>
              </button>
            </div>
          </div>

          {/* Editable Draft Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Draft Customer Response (Editable by Staff):
            </label>
            <div className="relative">
              <textarea
                rows={6}
                value={draftResponse}
                onChange={(e) => setDraftResponse(e.target.value)}
                placeholder="AI response will appear here. You can edit and customize it before sending..."
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: The AI does not invent prices or unverified fees. Verify specifics with your sales desk before sending.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!draftResponse}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to clipboard' : 'Copy Response'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !draftResponse.trim()}
              id="btn-send-ai-response"
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send & Save to Thread</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
