import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  User as UserIcon,
  CheckCheck,
} from 'lucide-react';
import { Conversation, Message, User } from '../types';
import { api } from '../lib/api';
import { ChannelBadge } from './Badges';

interface ConversationsViewProps {
  conversations: Conversation[];
  currentUser: User;
  onRefreshConversations: () => void;
}

export function ConversationsView({
  conversations,
  currentUser,
  onRefreshConversations,
}: ConversationsViewProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [activeConversation, setActiveConversation] = useState<
    (Conversation & { messages: Message[] }) | null
  >(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadActiveConversation = async (id: string) => {
    if (!id) return;
    setIsLoadingMessages(true);
    try {
      const res = await api.getConversation(id);
      setActiveConversation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedConversationId) {
      loadActiveConversation(selectedConversationId);
    } else if (conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
      loadActiveConversation(conversations[0].id);
    }
  }, [selectedConversationId, conversations.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversationId) return;
    setIsSending(true);
    try {
      await api.sendMessage(selectedConversationId, replyText, 'staff', currentUser.name);
      setReplyText('');
      await loadActiveConversation(selectedConversationId);
      onRefreshConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAISuggestion = async () => {
    if (!activeConversation) return;
    setIsGeneratingAI(true);
    try {
      const lastMsg =
        activeConversation.messages[activeConversation.messages.length - 1]?.message ||
        'Customer enquiry';
      const aiReply = await api.generateResponse({
        customerName: activeConversation.customer?.name || 'Customer',
        enquiryMessage: lastMsg,
        location: activeConversation.customer?.location,
        channel: activeConversation.channel,
        modifier: 'default',
      });
      setReplyText(aiReply);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.customer?.name.toLowerCase().includes(q) ||
      c.last_message.toLowerCase().includes(q) ||
      c.channel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
          Unified Conversations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          All your African customer channels in one synchronized messaging stream.
        </p>
      </div>

      {/* Main Inbox Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col md:flex-row h-[720px]">
        {/* Left Side: Conversation List (Section 12) */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No conversations found</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {conv.customer?.name || 'Customer'}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                      {conv.last_message}
                    </p>

                    <div className="flex items-center justify-between">
                      <ChannelBadge channel={conv.channel} />
                      {conv.unread_count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Thread & Reply Box */}
        <div className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/30">
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {activeConversation.customer?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {activeConversation.customer?.name}
                      </h2>
                      <ChannelBadge channel={activeConversation.channel} />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {activeConversation.customer?.phone} • {activeConversation.customer?.location}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Channel Active
                  </span>
                </div>
              </div>

              {/* Message History Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {isLoadingMessages ? (
                  <div className="text-center py-12 text-slate-400 text-xs">Loading messages...</div>
                ) : activeConversation.messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">No messages yet.</div>
                ) : (
                  activeConversation.messages.map((m) => {
                    const isStaff = m.sender_type === 'staff';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {m.sender_name || (isStaff ? 'Staff' : activeConversation.customer?.name)}
                          </span>
                          <span>•</span>
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                            isStaff
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Box with AI Trigger */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Replying via {activeConversation.channel}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickAISuggestion}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAI ? 'Generating...' : 'AI Quick Suggestion'}</span>
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a message to customer..."
                    className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to view messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
