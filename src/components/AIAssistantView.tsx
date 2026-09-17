import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  FileText,
  UserCheck,
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Enquiry, Customer, User } from '../types';
import { api } from '../lib/api';

interface AIAssistantViewProps {
  enquiries: Enquiry[];
  customers: Customer[];
  currentUser: User;
}

export function AIAssistantView({
  enquiries,
  customers,
  currentUser,
}: AIAssistantViewProps) {
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>(
    enquiries[0]?.id || ''
  );

  useEffect(() => {
    if (!selectedEnquiryId && enquiries.length > 0) {
      setSelectedEnquiryId(enquiries[0].id);
    }
  }, [enquiries, selectedEnquiryId]);

  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; time: string; copied?: boolean }[]
  >([
    {
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am your SmartEnquiry CRM Copilot. You can select any customer enquiry above, and I can summarize it, suggest responses, detect unstated customer needs, or help prepare sales proposals. How can I help you today?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const selectedEnquiry = enquiries.find((e) => e.id === selectedEnquiryId);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSendPrompt = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await api.queryAIAssistant(
        prompt,
        selectedEnquiryId || undefined,
        selectedEnquiry?.customer_id || undefined
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered an issue analyzing this enquiry. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '📋 Summarize enquiry', text: 'Please summarize this enquiry and highlight the customer’s key priorities.' },
    { label: '💬 Suggest response', text: 'Draft a professional African business response acknowledging this customer’s request.' },
    { label: '🔍 Identify customer needs', text: 'Identify all explicit and implicit needs mentioned by this customer.' },
    { label: '⏰ Follow-up recommendation', text: 'Suggest an appropriate follow-up schedule and reason for this enquiry.' },
    { label: '🎯 Next action for staff', text: 'What is the optimal next action our sales or support desk should take right now?' },
    { label: '💰 Pricing & discount guidance', text: 'What is our pricing and wholesale discount recommendation for this order?' },
  ];

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-emerald-600" />
            <span>Staff AI Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ask questions, draft responses, and receive intelligence about your enquiries and customers.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Gemini 3.8 Flash & CRM Copilot Active</span>
        </div>
      </div>

      {/* Active Context Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Active Enquiry Context:
            </span>
            <select
              value={selectedEnquiryId}
              onChange={(e) => setSelectedEnquiryId(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-medium flex-1 max-w-md truncate text-slate-800 dark:text-slate-200"
            >
              <option value="">-- General CRM Overview --</option>
              {enquiries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.customer?.name} ({e.channel}): {e.product_service || e.message.slice(0, 30)}
                </option>
              ))}
            </select>
          </div>

          {selectedEnquiry && (
            <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                {selectedEnquiry.channel}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                {selectedEnquiry.status}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium">
                {selectedEnquiry.priority} Priority
              </span>
            </div>
          )}
        </div>

        {selectedEnquiry && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{selectedEnquiry.customer?.name}</span>
                <span className="text-slate-400 font-normal">({selectedEnquiry.customer?.phone} • {selectedEnquiry.location || selectedEnquiry.customer?.location})</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 truncate mt-0.5">
                "{selectedEnquiry.message}"
              </p>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
              Product: <span className="font-medium text-slate-700 dark:text-slate-200">{selectedEnquiry.product_service}</span> | Qty: <span className="font-medium text-slate-700 dark:text-slate-200">{selectedEnquiry.quantity}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-[560px] flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700 whitespace-pre-wrap font-sans'
                }`}
              >
                {m.text}

                <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-[10px] opacity-70">
                    {m.time}
                  </span>

                  {m.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.text, idx)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 transition-colors opacity-80 hover:opacity-100"
                      title="Copy response to clipboard"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="animate-pulse">SmartEnquiry AI Copilot is analyzing CRM data and formulating recommendation...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
            Quick Actions:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendPrompt(qp.text)}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap transition-colors shadow-xs"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputText);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask the AI Assistant anything about this enquiry or CRM operations..."
              className="flex-1 p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95 shadow-sm shadow-emerald-600/30"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
