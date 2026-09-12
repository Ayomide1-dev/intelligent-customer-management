import React, { useState } from 'react';
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
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am your SmartEnquiry CRM Copilot. You can select any customer enquiry above, and I can summarize it, suggest responses, detect unstated customer needs, or help prepare sales proposals. How can I help you today?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedEnquiry = enquiries.find((e) => e.id === selectedEnquiryId);

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
    { label: 'Summarize enquiry', text: 'Please summarize this enquiry and highlight the customer’s key priorities.' },
    { label: 'Identify customer needs', text: 'Identify all explicit and implicit needs mentioned by this customer.' },
    { label: 'Suggest response', text: 'Draft a professional African business response acknowledging this customer’s request.' },
    { label: 'Suggest next action', text: 'What is the optimal next action our sales or support desk should take right now?' },
    { label: 'Create follow-up suggestion', text: 'Suggest an appropriate follow-up schedule and reason for this enquiry.' },
  ];

  return (
    <div className="space-y-4 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2.5">
          <Bot className="w-7 h-7 text-emerald-600" />
          <span>Staff AI Assistant</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Ask questions, draft responses, and receive intelligence about your enquiries and customers.
        </p>
      </div>

      {/* Active Context Bar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Active Enquiry Context:
          </span>
          <select
            value={selectedEnquiryId}
            onChange={(e) => setSelectedEnquiryId(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-medium max-w-sm truncate"
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
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Location: <strong>{selectedEnquiry.location}</strong></span>
            <span>•</span>
            <span>Priority: <strong>{selectedEnquiry.priority}</strong></span>
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
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700 whitespace-pre-wrap'
                }`}
              >
                {m.text}
                <span className="block text-[10px] opacity-70 mt-1 text-right">
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>AI Assistant is analyzing CRM data...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
            Quick Actions:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendPrompt(qp.text)}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 whitespace-nowrap transition-colors"
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
              className="flex-1 p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
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
