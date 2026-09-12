export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  created_at: string;
}

export type Channel = 'WhatsApp' | 'Website' | 'Instagram' | 'Facebook' | 'Phone' | 'Other';

export type CustomerStatus = 'New' | 'Active' | 'Potential Customer' | 'Customer' | 'Inactive';

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  preferred_channel: Channel;
  status: CustomerStatus;
  notes_count?: number;
  enquiries_count?: number;
  last_interaction_at?: string;
  created_at: string;
  updated_at: string;
}

export type EnquiryStatus =
  | 'New'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Follow-up Required'
  | 'Resolved'
  | 'Closed';

export type EnquiryPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface AIAnalysis {
  intent: string;
  product_service: string;
  quantity: string;
  location: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Enquiring';
  important_information: string[];
  suggested_action: string;
}

export interface Enquiry {
  id: string;
  business_id: string;
  customer_id: string;
  customer?: Customer;
  channel: Channel;
  message: string;
  product_service: string;
  quantity: string;
  location: string;
  intent: string;
  sentiment: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  priority: EnquiryPriority;
  status: EnquiryStatus;
  assigned_to: string; // user id
  assigned_user?: User;
  notes?: string;
  ai_analysis?: AIAnalysis;
  created_at: string;
  updated_at: string;
  last_activity?: string;
  last_activity_at?: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  customer?: Customer;
  enquiry_id?: string;
  channel: Channel;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export type MessageSenderType = 'customer' | 'staff' | 'ai_system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  sender_name?: string;
  message: string;
  created_at: string;
}

export type FollowUpStatus = 'Pending' | 'Due Today' | 'Overdue' | 'Completed' | 'Cancelled';

export interface FollowUp {
  id: string;
  business_id: string;
  customer_id: string;
  customer?: Customer;
  enquiry_id: string;
  enquiry?: Enquiry;
  assigned_to: string;
  assigned_user?: User;
  reason: string;
  due_date: string;
  due_time: string;
  status: FollowUpStatus;
  notes: string;
  created_at: string;
  completed_at?: string | null;
}

export interface Note {
  id: string;
  customer_id: string;
  enquiry_id?: string;
  user_id: string;
  user_name?: string;
  note: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  timestamp: string;
  read: boolean;
  is_read?: boolean;
  link_type?: 'enquiry' | 'followup' | 'customer';
  link_id?: string;
  enquiry_id?: string;
  customer_id?: string;
}

export type Notification = NotificationItem;

export interface AISettings {
  response_tone: 'Professional' | 'Friendly' | 'Direct & Concise' | 'Warm & Welcoming';
  default_response_style: string;
  follow_up_timing_hours: number;
  business_info_context: string;
  auto_analyze_incoming: boolean;
}

export interface NotificationSettings {
  email_on_new_enquiry: boolean;
  email_on_high_priority: boolean;
  daily_follow_up_digest: boolean;
  in_app_sounds: boolean;
}

export interface DashboardStats {
  new_enquiries: number;
  pending_enquiries: number;
  follow_ups_today: number;
  completed_enquiries: number;
  high_priority_enquiries: number;
  overdue_follow_ups: number;
  avg_response_time_minutes: number;
  channel_breakdown: Record<Channel, number>;
  status_breakdown: Record<EnquiryStatus, number>;
  priority_breakdown: Record<EnquiryPriority, number>;
  last_7_days_enquiries: { date: string; count: number; day: string }[];
}
