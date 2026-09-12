import {
  User,
  Business,
  Customer,
  Enquiry,
  Conversation,
  Message,
  FollowUp,
  Note,
  NotificationItem,
  AISettings,
  NotificationSettings,
  DashboardStats,
  AIAnalysis,
} from '../types';

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },

  async signup(data: { fullName: string; businessName: string; email: string; password?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to sign up');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/users');
    const data = await res.json();
    return data.users || [];
  },

  async getTeam(): Promise<User[]> {
    return this.getUsers();
  },

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();
    return data.stats;
  },

  async getStats(): Promise<DashboardStats> {
    return this.getDashboardStats();
  },

  // Enquiries
  async getEnquiries(params?: Record<string, string>): Promise<Enquiry[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/enquiries?${query}`);
    const data = await res.json();
    return data.enquiries || [];
  },

  async getEnquiry(id: string): Promise<{
    enquiry: Enquiry;
    conversation?: Conversation & { messages: Message[] };
    notes: Note[];
    followUps: FollowUp[];
  }> {
    const res = await fetch(`/api/enquiries/${id}`);
    if (!res.ok) throw new Error('Failed to fetch enquiry');
    return res.json();
  },

  async createEnquiry(data: any): Promise<{ enquiry: Enquiry; customer: Customer }> {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create enquiry');
    }
    return res.json();
  },

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update enquiry');
    const data = await res.json();
    return data.enquiry;
  },

  // Public website form
  async submitPublicEnquiry(data: {
    fullName: string;
    phone: string;
    email?: string;
    productService?: string;
    message: string;
    location?: string;
  }): Promise<{ confirmation: string; enquiryId: string }> {
    const res = await fetch('/api/public/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit public enquiry');
    }
    return res.json();
  },

  // AI features
  async analyzeEnquiry(message: string, customerLocation?: string, channel?: string): Promise<AIAnalysis> {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, customerLocation, channel }),
    });
    const data = await res.json();
    return data.analysis;
  },

  async generateResponse(params: {
    customerName: string;
    enquiryMessage: string;
    productService?: string;
    quantity?: string;
    location?: string;
    channel?: string;
    modifier?: 'default' | 'shorter' | 'professional' | 'friendlier';
  }): Promise<string> {
    const res = await fetch('/api/ai/generate-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data.response;
  },

  async queryAIAssistant(query: string, activeEnquiryId?: string, customerId?: string): Promise<string> {
    const res = await fetch('/api/ai/assistant-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, activeEnquiryId, customerId }),
    });
    const data = await res.json();
    return data.reply;
  },

  // Customers
  async getCustomers(params?: Record<string, string>): Promise<Customer[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/customers?${query}`);
    const data = await res.json();
    return data.customers || [];
  },

  async getCustomer(id: string): Promise<{
    customer: Customer;
    enquiries: Enquiry[];
    conversations: Conversation[];
    followUps: FollowUp[];
    notes: Note[];
  }> {
    const res = await fetch(`/api/customers/${id}`);
    if (!res.ok) throw new Error('Customer not found');
    return res.json();
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.customer;
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.customer;
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    return data.conversations || [];
  },

  async getConversation(id: string): Promise<Conversation & { messages: Message[] }> {
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    return data.conversation;
  },

  async sendMessage(conversationId: string, message: string, senderType: 'staff' | 'customer' = 'staff', senderName?: string): Promise<Message> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, senderType, senderName }),
    });
    const data = await res.json();
    return data.message;
  },

  // Follow-ups
  async getFollowUps(params?: Record<string, string>): Promise<FollowUp[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/follow-ups?${query}`);
    const data = await res.json();
    return data.followUps || [];
  },

  async createFollowUp(data: any): Promise<FollowUp> {
    const res = await fetch('/api/follow-ups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.followUp;
  },

  async updateFollowUp(id: string, updates: Partial<FollowUp>): Promise<FollowUp> {
    const res = await fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.followUp;
  },

  // Notes
  async getNotes(customerId?: string, enquiryId?: string): Promise<Note[]> {
    const res = await fetch(`/api/notes?customerId=${customerId || ''}&enquiryId=${enquiryId || ''}`);
    const data = await res.json();
    return data.notes || [];
  },

  async addNote(data: { customerId: string; enquiryId?: string; userId: string; note: string }): Promise<Note> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.note;
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    return data.notifications || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/read-all', { method: 'POST' });
  },

  // Settings
  async getSettings(): Promise<{
    business: Business;
    team: User[];
    ai: AISettings;
    notifications: NotificationSettings;
  }> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async getBusinessSettings(): Promise<Business> {
    const s = await this.getSettings();
    return s.business;
  },

  async getAISettings(): Promise<AISettings> {
    const s = await this.getSettings();
    return s.ai;
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    const s = await this.getSettings();
    return s.notifications;
  },

  async updateBusinessSettings(data: Partial<Business>): Promise<Business> {
    const res = await fetch('/api/settings/business', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.business;
  },

  async updateAISettings(data: Partial<AISettings>): Promise<AISettings> {
    const res = await fetch('/api/settings/ai', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.ai;
  },

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const res = await fetch('/api/settings/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.notifications;
  },

  async addTeamMember(data: { name: string; email: string; role: string; phone?: string }): Promise<User> {
    const res = await fetch('/api/settings/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.user;
  },

  // Simulator
  async simulateIncoming(data: {
    channel: string;
    customerName: string;
    phone: string;
    message: string;
    location: string;
  }): Promise<any> {
    const res = await fetch('/api/channels/simulate-incoming', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
