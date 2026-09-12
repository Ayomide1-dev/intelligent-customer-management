import fs from 'fs';
import path from 'path';
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
  Channel,
  EnquiryStatus,
  EnquiryPriority,
} from '../src/types.js';

interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  customers: Customer[];
  enquiries: Enquiry[];
  conversations: Conversation[];
  messages: Message[];
  follow_ups: FollowUp[];
  notes: Note[];
  notifications: NotificationItem[];
  ai_settings: AISettings;
  notification_settings: NotificationSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'crm_database.json');

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Babatunde Adeleke',
    email: 'admin@apexcommerce.africa',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+234 803 100 0001',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'Folake Coker',
    email: 'manager@apexcommerce.africa',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+234 802 200 0002',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'usr-3',
    name: 'Amara Nnamdi',
    email: 'amara@apexcommerce.africa',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    phone: '+234 812 300 0003',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'usr-4',
    name: 'Kwame Asante',
    email: 'kwame@apexcommerce.africa',
    role: 'staff',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+233 24 400 0004',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const INITIAL_BUSINESS: Business = {
  id: 'biz-1',
  name: 'Apex Supplies & Commercial Solutions',
  email: 'info@apexcommerce.africa',
  phone: '+234 1 234 5678',
  address: 'Plot 14 Victoria Island, Lagos, Nigeria',
  website: 'https://apexcommerce.africa',
  created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
};

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    business_id: 'biz-1',
    name: 'Alhaji Musa Danjuma',
    phone: '+234 803 221 4455',
    email: 'musa.danjuma@kanoenterprises.ng',
    location: 'Ibadan, Oyo State',
    preferred_channel: 'WhatsApp',
    status: 'Customer',
    notes_count: 2,
    enquiries_count: 3,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    business_id: 'biz-1',
    name: 'Mrs. Ngozi Eze',
    phone: '+234 812 998 3321',
    email: 'ngozi.catering@gmail.com',
    location: 'Abuja, FCT',
    preferred_channel: 'Website',
    status: 'Potential Customer',
    notes_count: 1,
    enquiries_count: 1,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'cust-3',
    business_id: 'biz-1',
    name: 'Kofi Boateng',
    phone: '+233 24 551 8890',
    email: 'kofi.b@accradesign.gh',
    location: 'Accra, Ghana',
    preferred_channel: 'Instagram',
    status: 'New',
    notes_count: 0,
    enquiries_count: 1,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'cust-4',
    business_id: 'biz-1',
    name: 'Fatima Bello',
    phone: '+234 809 777 1234',
    email: 'fbello.events@yahoo.com',
    location: 'Lagos (Lekki Phase 1)',
    preferred_channel: 'Facebook',
    status: 'Active',
    notes_count: 3,
    enquiries_count: 4,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'cust-5',
    business_id: 'biz-1',
    name: 'Dr. Amani Waweru',
    phone: '+254 712 345 678',
    email: 'amani.w@nairobilogistics.ke',
    location: 'Nairobi, Kenya',
    preferred_channel: 'WhatsApp',
    status: 'Potential Customer',
    notes_count: 1,
    enquiries_count: 1,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'cust-6',
    business_id: 'biz-1',
    name: 'Tunde Bakare',
    phone: '+234 802 443 2190',
    email: 'tbakare@outlook.com',
    location: 'Ibadan, Oyo State',
    preferred_channel: 'WhatsApp',
    status: 'Customer',
    notes_count: 1,
    enquiries_count: 2,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
];

const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-1',
    business_id: 'biz-1',
    customer_id: 'cust-1',
    channel: 'WhatsApp',
    message: 'Hello, I would like to know the price of 20 chairs and if you deliver to Ibadan.',
    product_service: 'Chairs',
    quantity: '20',
    location: 'Ibadan',
    intent: 'Product Enquiry & Delivery',
    sentiment: 'Enquiring',
    urgency: 'Medium',
    priority: 'High',
    status: 'New',
    assigned_to: 'usr-3',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
    ai_analysis: {
      intent: 'Product Enquiry',
      product_service: 'Chairs',
      quantity: '20',
      location: 'Ibadan',
      urgency: 'Medium',
      sentiment: 'Enquiring',
      important_information: ['Customer needs 20 chairs', 'Requires delivery to Ibadan, Oyo State'],
      suggested_action: 'Provide current price per chair and delivery options to Ibadan',
    },
  },
  {
    id: 'enq-2',
    business_id: 'biz-1',
    customer_id: 'cust-6',
    channel: 'Instagram',
    message: 'Do you deliver to Ibadan? Also what are your payment terms for bulk orders?',
    product_service: 'Delivery & Bulk Orders',
    quantity: 'Not provided',
    location: 'Ibadan',
    intent: 'Delivery & Payment Terms',
    sentiment: 'Neutral',
    urgency: 'Medium',
    priority: 'Medium',
    status: 'In Progress',
    assigned_to: 'usr-3',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    ai_analysis: {
      intent: 'Logistics & Terms Enquiry',
      product_service: 'Delivery / Bulk purchase',
      quantity: 'Not provided',
      location: 'Ibadan',
      urgency: 'Medium',
      sentiment: 'Neutral',
      important_information: ['Wants delivery coverage confirmation for Ibadan', 'Inquiring about bulk payment terms'],
      suggested_action: 'Confirm Ibadan dispatch schedule and share standard wholesale payment options',
    },
  },
  {
    id: 'enq-3',
    business_id: 'biz-1',
    customer_id: 'cust-2',
    channel: 'Website',
    message: 'I want to order your catering service and event seating for a corporate retreat next month in Abuja.',
    product_service: 'Catering Service & Event Seating',
    quantity: 'Not provided (corporate retreat)',
    location: 'Abuja',
    intent: 'Service Booking',
    sentiment: 'Positive',
    urgency: 'High',
    priority: 'Urgent',
    status: 'Follow-up Required',
    assigned_to: 'usr-2',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    ai_analysis: {
      intent: 'Service Order Enquiry',
      product_service: 'Catering and Event Seating',
      quantity: 'Not provided',
      location: 'Abuja',
      urgency: 'High',
      sentiment: 'Positive',
      important_information: ['Corporate retreat event next month', 'Location specified as Abuja'],
      suggested_action: 'Schedule discovery call to determine guest headcount and catering menu package',
    },
  },
  {
    id: 'enq-4',
    business_id: 'biz-1',
    customer_id: 'cust-3',
    channel: 'Facebook',
    message: 'Please send me your product catalogue and price sheet for commercial office furniture.',
    product_service: 'Commercial Office Furniture',
    quantity: 'Not provided',
    location: 'Accra',
    intent: 'Catalogue Request',
    sentiment: 'Enquiring',
    urgency: 'Low',
    priority: 'Low',
    status: 'Waiting for Customer',
    assigned_to: 'usr-4',
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    ai_analysis: {
      intent: 'Information Request',
      product_service: 'Commercial Office Furniture Catalogue',
      quantity: 'Not provided',
      location: 'Accra',
      urgency: 'Low',
      sentiment: 'Neutral',
      important_information: ['Customer requested full catalogue and price list for Ghana branch'],
      suggested_action: 'Send current PDF brochure and inquire about their immediate project requirements',
    },
  },
  {
    id: 'enq-5',
    business_id: 'biz-1',
    customer_id: 'cust-5',
    channel: 'WhatsApp',
    message: 'How long does delivery take for East African consignments? We need express dispatch to Nairobi.',
    product_service: 'Express Logistics / Delivery',
    quantity: 'Not provided',
    location: 'Nairobi',
    intent: 'Delivery Timeline Enquiry',
    sentiment: 'Enquiring',
    urgency: 'High',
    priority: 'High',
    status: 'New',
    assigned_to: 'usr-4',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    ai_analysis: {
      intent: 'Delivery Timeline',
      product_service: 'Express Logistics',
      quantity: 'Not provided',
      location: 'Nairobi',
      urgency: 'High',
      sentiment: 'Enquiring',
      important_information: ['Requires express delivery timeline for Nairobi, Kenya consignment'],
      suggested_action: 'Quote standard air-cargo transit window (3-5 business days) and clearing guidelines',
    },
  },
  {
    id: 'enq-6',
    business_id: 'biz-1',
    customer_id: 'cust-4',
    channel: 'WhatsApp',
    message: 'Thanks for the delivery of the 15 banquet tables yesterday. We received all in good condition!',
    product_service: 'Banquet Tables',
    quantity: '15',
    location: 'Lagos (Lekki)',
    intent: 'Order Confirmation & Feedback',
    sentiment: 'Positive',
    urgency: 'Low',
    priority: 'Low',
    status: 'Resolved',
    assigned_to: 'usr-3',
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    ai_analysis: {
      intent: 'Feedback / Acknowledgement',
      product_service: 'Banquet Tables',
      quantity: '15',
      location: 'Lagos',
      urgency: 'Low',
      sentiment: 'Positive',
      important_information: ['Customer confirmed delivery received in good condition in Lekki'],
      suggested_action: 'Thank the customer for business and ask if any further assistance is needed',
    },
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    business_id: 'biz-1',
    customer_id: 'cust-1',
    enquiry_id: 'enq-1',
    channel: 'WhatsApp',
    last_message: 'Hello, I would like to know the price of 20 chairs and if you deliver to Ibadan.',
    last_message_at: new Date(Date.now() - 45 * 60000).toISOString(),
    unread_count: 1,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'conv-2',
    business_id: 'biz-1',
    customer_id: 'cust-2',
    enquiry_id: 'enq-3',
    channel: 'Website',
    last_message: 'Our event director will call you today at 2 PM to confirm your menu preferences.',
    last_message_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    unread_count: 0,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'conv-3',
    business_id: 'biz-1',
    customer_id: 'cust-3',
    enquiry_id: 'enq-4',
    channel: 'Instagram',
    last_message: 'Here is our latest 2026 commercial furniture catalogue. Let us know which models you prefer!',
    last_message_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    unread_count: 0,
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: 'conv-4',
    business_id: 'biz-1',
    customer_id: 'cust-4',
    enquiry_id: 'enq-6',
    channel: 'Facebook',
    last_message: 'You are very welcome Mrs. Bello! We are thrilled everything arrived safely.',
    last_message_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    unread_count: 0,
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    id: 'conv-5',
    business_id: 'biz-1',
    customer_id: 'cust-5',
    enquiry_id: 'enq-5',
    channel: 'WhatsApp',
    last_message: 'How long does delivery take for East African consignments? We need express dispatch to Nairobi.',
    last_message_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    unread_count: 1,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_type: 'customer',
    sender_name: 'Alhaji Musa Danjuma',
    message: 'Hello, I would like to know the price of 20 chairs and if you deliver to Ibadan.',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-2',
    sender_type: 'customer',
    sender_name: 'Mrs. Ngozi Eze',
    message: 'I want to order your catering service and event seating for a corporate retreat next month in Abuja.',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-2',
    sender_type: 'staff',
    sender_name: 'Folake Coker',
    message: 'Hello Mrs. Ngozi, thank you for reaching out! We would be delighted to cater your retreat in Abuja. What date is the event?',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'msg-4',
    conversation_id: 'conv-2',
    sender_type: 'customer',
    sender_name: 'Mrs. Ngozi Eze',
    message: 'It will be from the 15th to 18th of next month for approximately 60 attendees.',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'msg-5',
    conversation_id: 'conv-2',
    sender_type: 'staff',
    sender_name: 'Folake Coker',
    message: 'Our event director will call you today at 2 PM to confirm your menu preferences and venue logistics.',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'msg-6',
    conversation_id: 'conv-3',
    sender_type: 'customer',
    sender_name: 'Kofi Boateng',
    message: 'Please send me your product catalogue and price sheet for commercial office furniture in Accra.',
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: 'msg-7',
    conversation_id: 'conv-3',
    sender_type: 'staff',
    sender_name: 'Kwame Asante',
    message: 'Here is our latest 2026 commercial furniture catalogue. Let us know which models you prefer!',
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: 'msg-8',
    conversation_id: 'conv-5',
    sender_type: 'customer',
    sender_name: 'Dr. Amani Waweru',
    message: 'How long does delivery take for East African consignments? We need express dispatch to Nairobi.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const todayFormatted = new Date().toISOString().split('T')[0];
const yesterdayFormatted = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrowFormatted = new Date(Date.now() + 86400000).toISOString().split('T')[0];

const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fol-1',
    business_id: 'biz-1',
    customer_id: 'cust-1',
    enquiry_id: 'enq-1',
    assigned_to: 'usr-3',
    reason: 'Follow up on chair quotation and confirm Ibadan delivery address details',
    due_date: todayFormatted,
    due_time: '14:00',
    status: 'Due Today',
    notes: 'Alhaji Musa requested immediate confirmation on logistics discount.',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'fol-2',
    business_id: 'biz-1',
    customer_id: 'cust-2',
    enquiry_id: 'enq-3',
    assigned_to: 'usr-2',
    reason: 'Follow up on corporate catering menu proposal and dietary options',
    due_date: todayFormatted,
    due_time: '16:30',
    status: 'Due Today',
    notes: 'Send Abuja venue coordinator contact to logistics head.',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'fol-3',
    business_id: 'biz-1',
    customer_id: 'cust-6',
    enquiry_id: 'enq-2',
    assigned_to: 'usr-3',
    reason: 'Call customer to clarify bulk volume needed for Ibadan depot discount',
    due_date: yesterdayFormatted,
    due_time: '11:00',
    status: 'Overdue',
    notes: 'Customer did not pick up initial call; rule flagged as overdue.',
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
  {
    id: 'fol-4',
    business_id: 'biz-1',
    customer_id: 'cust-5',
    enquiry_id: 'enq-5',
    assigned_to: 'usr-4',
    reason: 'Send Nairobi air freight schedule and custom clearance checklist',
    due_date: tomorrowFormatted,
    due_time: '10:00',
    status: 'Pending',
    notes: 'Coordinate with Ethiopian Airlines cargo partner.',
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'fol-5',
    business_id: 'biz-1',
    customer_id: 'cust-4',
    enquiry_id: 'enq-6',
    assigned_to: 'usr-3',
    reason: 'Post-delivery satisfaction check and warranty registration',
    due_date: yesterdayFormatted,
    due_time: '15:00',
    status: 'Completed',
    notes: 'Mrs. Bello confirmed all 15 banquet tables in pristine condition.',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'not-1',
    customer_id: 'cust-1',
    enquiry_id: 'enq-1',
    user_id: 'usr-3',
    user_name: 'Amara Nnamdi',
    note: 'Customer is opening a branch in Ibadan and wants long-term furniture supply if the initial 20 chairs arrive promptly.',
    created_at: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: 'not-2',
    customer_id: 'cust-2',
    enquiry_id: 'enq-3',
    user_id: 'usr-2',
    user_name: 'Folake Coker',
    note: 'High value corporate event. Requires VIP cutlery and professional service staff in uniform.',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'not-3',
    customer_id: 'cust-4',
    enquiry_id: 'enq-6',
    user_id: 'usr-3',
    user_name: 'Amara Nnamdi',
    note: 'Very reliable repeat client in Lekki Phase 1. Always pays invoices within 24 hours of delivery.',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New WhatsApp Enquiry Received',
    description: 'Alhaji Musa Danjuma sent an enquiry for 20 chairs to Ibadan. Assigned to Amara Nnamdi.',
    type: 'info',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
    link_type: 'enquiry',
    link_id: 'enq-1',
  },
  {
    id: 'notif-2',
    title: 'Overdue Follow-up Alert (Rule 5)',
    description: 'Follow-up for Tunde Bakare regarding bulk purchase terms is overdue!',
    type: 'urgent',
    timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
    read: false,
    link_type: 'followup',
    link_id: 'fol-3',
  },
  {
    id: 'notif-3',
    title: 'Follow-up Scheduled for Today',
    description: '2 follow-ups are scheduled for today (Alhaji Musa & Mrs. Ngozi).',
    type: 'warning',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: true,
    link_type: 'followup',
    link_id: 'fol-1',
  },
];

const INITIAL_AI_SETTINGS: AISettings = {
  response_tone: 'Professional',
  default_response_style: 'Helpful African business consultant tone, courteous, welcoming, transparent about dispatch and quotes.',
  follow_up_timing_hours: 24,
  business_info_context: `Apex Supplies & Commercial Solutions is a leading Nigerian and West African distributor of premium commercial office furniture, event seating, and corporate logistics based in Victoria Island, Lagos. We dispatch nationwide across Nigeria (including Lagos, Ibadan, Abuja, Port Harcourt, Kano) and regional hubs in Accra, Ghana and Nairobi, Kenya. Standard local dispatch is 24-48 hours. Wholesale discounts apply on bulk quantities (20+ items). Staff must verify exact stock before issuing proforma invoices.`,
  auto_analyze_incoming: true,
};

const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  email_on_new_enquiry: true,
  email_on_high_priority: true,
  daily_follow_up_digest: true,
  in_app_sounds: true,
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.runAutomatedFollowUpRules();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.enquiries && parsed.customers) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing sample data...', e);
    }

    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      businesses: [INITIAL_BUSINESS],
      customers: INITIAL_CUSTOMERS,
      enquiries: INITIAL_ENQUIRIES,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      follow_ups: INITIAL_FOLLOW_UPS,
      notes: INITIAL_NOTES,
      notifications: INITIAL_NOTIFICATIONS,
      ai_settings: INITIAL_AI_SETTINGS,
      notification_settings: INITIAL_NOTIFICATION_SETTINGS,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file', err);
    }
  }

  // Automation rules engine matching requirements in Section 14
  public runAutomatedFollowUpRules() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Rule 2: If an enquiry remains unanswered (>12 hours) and status is New, mark as requiring follow-up
    this.data.enquiries.forEach((enq) => {
      const createdTime = new Date(enq.created_at).getTime();
      const hoursOld = (now.getTime() - createdTime) / 3600000;
      if (enq.status === 'New' && hoursOld > 12) {
        enq.status = 'Follow-up Required';
      }
    });

    // Rule 5: If a follow-up becomes overdue, mark as Overdue and emit urgent notification
    this.data.follow_ups.forEach((fol) => {
      if (fol.status !== 'Completed' && fol.status !== 'Cancelled') {
        if (fol.due_date < todayStr) {
          if (fol.status !== 'Overdue') {
            fol.status = 'Overdue';
            const customer = this.getCustomer(fol.customer_id);
            this.addNotification({
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              title: `Overdue Follow-up: ${customer?.name || 'Customer'}`,
              description: `Task "${fol.reason}" was due on ${fol.due_date} and is now overdue.`,
              type: 'urgent',
              timestamp: now.toISOString(),
              read: false,
              link_type: 'followup',
              link_id: fol.id,
            });
          }
        } else if (fol.due_date === todayStr) {
          fol.status = 'Due Today';
        }
      }
    });

    this.saveData();
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUser(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...userData,
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public updateUserRole(id: string, role: User['role']): User | undefined {
    const user = this.getUser(id);
    if (user) {
      user.role = role;
      this.saveData();
    }
    return user;
  }

  // Business
  public getBusiness(): Business {
    return this.data.businesses[0] || INITIAL_BUSINESS;
  }

  public updateBusiness(updates: Partial<Business>): Business {
    this.data.businesses[0] = {
      ...this.getBusiness(),
      ...updates,
    };
    this.saveData();
    return this.data.businesses[0];
  }

  // Customers
  public getCustomers(filters?: { query?: string; status?: string; channel?: string }): Customer[] {
    let result = this.data.customers.map((c) => {
      const cEnquiries = this.data.enquiries.filter((e) => e.customer_id === c.id);
      const cNotes = this.data.notes.filter((n) => n.customer_id === c.id);
      return {
        ...c,
        enquiries_count: cEnquiries.length,
        notes_count: cNotes.length,
      };
    });

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters?.channel && filters.channel !== 'All') {
      result = result.filter((c) => c.preferred_channel === filters.channel);
    }

    return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  public getCustomer(id: string): Customer | undefined {
    const cust = this.data.customers.find((c) => c.id === id);
    if (!cust) return undefined;
    const cEnquiries = this.data.enquiries.filter((e) => e.customer_id === cust.id);
    const cNotes = this.data.notes.filter((n) => n.customer_id === cust.id);
    return {
      ...cust,
      enquiries_count: cEnquiries.length,
      notes_count: cNotes.length,
    };
  }

  public createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Customer {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    this.data.customers.unshift(newCustomer);
    this.saveData();
    return newCustomer;
  }

  public findOrCreateCustomer(name: string, phone: string, email: string, location: string, channel: Channel): Customer {
    let customer = this.data.customers.find(
      (c) => (phone && c.phone === phone) || (email && c.email.toLowerCase() === email.toLowerCase())
    );
    if (!customer) {
      customer = this.createCustomer({
        business_id: 'biz-1',
        name,
        phone,
        email,
        location: location || 'Not provided',
        preferred_channel: channel,
        status: 'New',
      });
    } else {
      customer.updated_at = new Date().toISOString();
      if (location && customer.location === 'Not provided') {
        customer.location = location;
      }
      this.saveData();
    }
    return customer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const index = this.data.customers.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.data.customers[index] = {
      ...this.data.customers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData();
    return this.data.customers[index];
  }

  // Enquiries
  public getEnquiries(filters?: {
    channel?: string;
    status?: string;
    priority?: string;
    assigned_to?: string;
    intent?: string;
    search?: string;
  }): Enquiry[] {
    let result = this.data.enquiries.map((e) => {
      const customer = this.getCustomer(e.customer_id);
      const assigned_user = this.getUser(e.assigned_to);
      return {
        ...e,
        customer,
        assigned_user,
        last_activity: e.updated_at,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          e.product_service.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.intent.toLowerCase().includes(q) ||
          e.customer?.name.toLowerCase().includes(q) ||
          e.customer?.phone.includes(q) ||
          e.customer?.email.toLowerCase().includes(q)
      );
    }
    if (filters?.channel && filters.channel !== 'All') {
      result = result.filter((e) => e.channel === filters.channel);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'All') {
      result = result.filter((e) => e.priority === filters.priority);
    }
    if (filters?.assigned_to && filters.assigned_to !== 'All') {
      result = result.filter((e) => e.assigned_to === filters.assigned_to);
    }
    if (filters?.intent && filters.intent !== 'All') {
      result = result.filter((e) => e.intent.toLowerCase().includes(filters.intent!.toLowerCase()));
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getEnquiry(id: string): Enquiry | undefined {
    const e = this.data.enquiries.find((enq) => enq.id === id);
    if (!e) return undefined;
    return {
      ...e,
      customer: this.getCustomer(e.customer_id),
      assigned_user: this.getUser(e.assigned_to),
      last_activity: e.updated_at,
    };
  }

  public createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>): Enquiry {
    const now = new Date().toISOString();
    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: now,
      updated_at: now,
      ...enquiryData,
    };

    this.data.enquiries.unshift(newEnquiry);

    // Rule 1: When a new enquiry is created, create notification for assigned staff
    const assignedStaff = this.getUser(newEnquiry.assigned_to);
    const customer = this.getCustomer(newEnquiry.customer_id);
    this.addNotification({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `New ${newEnquiry.channel} Enquiry`,
      description: `${customer?.name || 'Customer'} inquired about "${newEnquiry.product_service || newEnquiry.message.slice(0, 40)}...". Assigned to ${assignedStaff?.name || 'Staff'}.`,
      type: newEnquiry.priority === 'Urgent' ? 'urgent' : 'info',
      timestamp: now,
      read: false,
      link_type: 'enquiry',
      link_id: newEnquiry.id,
    });

    // Create or link conversation
    let conv = this.data.conversations.find(
      (c) => c.customer_id === newEnquiry.customer_id && c.channel === newEnquiry.channel
    );
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        business_id: 'biz-1',
        customer_id: newEnquiry.customer_id,
        enquiry_id: newEnquiry.id,
        channel: newEnquiry.channel,
        last_message: newEnquiry.message,
        last_message_at: now,
        unread_count: 1,
        created_at: now,
        updated_at: now,
      };
      this.data.conversations.unshift(conv);
    } else {
      conv.last_message = newEnquiry.message;
      conv.last_message_at = now;
      conv.unread_count = (conv.unread_count || 0) + 1;
      conv.enquiry_id = newEnquiry.id;
      conv.updated_at = now;
    }

    // Add customer initial message
    this.data.messages.push({
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversation_id: conv.id,
      sender_type: 'customer',
      sender_name: customer?.name || 'Customer',
      message: newEnquiry.message,
      created_at: now,
    });

    this.saveData();
    return this.getEnquiry(newEnquiry.id)!;
  }

  public updateEnquiry(id: string, updates: Partial<Enquiry>): Enquiry | undefined {
    const index = this.data.enquiries.findIndex((e) => e.id === id);
    if (index === -1) return undefined;

    const oldStatus = this.data.enquiries[index].status;
    this.data.enquiries[index] = {
      ...this.data.enquiries[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Rule 4: If an enquiry is marked Resolved or Closed, stop future follow-ups (mark pending follow-ups as cancelled/resolved)
    if ((updates.status === 'Resolved' || updates.status === 'Closed') && oldStatus !== updates.status) {
      this.data.follow_ups.forEach((fol) => {
        if (fol.enquiry_id === id && (fol.status === 'Pending' || fol.status === 'Due Today')) {
          fol.status = 'Completed';
          fol.completed_at = new Date().toISOString();
        }
      });
    }

    this.saveData();
    return this.getEnquiry(id);
  }

  // Conversations & Messages
  public getConversations(): Conversation[] {
    return this.data.conversations
      .map((c) => ({
        ...c,
        customer: this.getCustomer(c.customer_id),
      }))
      .sort((a, b) => new Date(b.last_message_at || b.updated_at).getTime() - new Date(a.last_message_at || a.updated_at).getTime());
  }

  public getConversation(id: string): (Conversation & { messages: Message[] }) | undefined {
    const conv = this.data.conversations.find((c) => c.id === id);
    if (!conv) return undefined;
    const messages = this.data.messages
      .filter((m) => m.conversation_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return {
      ...conv,
      customer: this.getCustomer(conv.customer_id),
      messages,
    };
  }

  public getConversationByEnquiry(enquiryId: string): (Conversation & { messages: Message[] }) | undefined {
    const conv = this.data.conversations.find((c) => c.enquiry_id === enquiryId);
    if (!conv) return undefined;
    return this.getConversation(conv.id);
  }

  public addMessage(conversationId: string, senderType: Message['sender_type'], messageText: string, senderName?: string): Message {
    const conv = this.data.conversations.find((c) => c.id === conversationId);
    const now = new Date().toISOString();
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversation_id: conversationId,
      sender_type: senderType,
      sender_name: senderName || (senderType === 'staff' ? 'Staff' : 'Customer'),
      message: messageText,
      created_at: now,
    };

    this.data.messages.push(newMsg);

    if (conv) {
      conv.last_message = messageText;
      conv.last_message_at = now;
      conv.updated_at = now;
      if (senderType === 'staff') {
        conv.unread_count = 0;
        // Also update enquiry status if it was New or Follow-up Required
        if (conv.enquiry_id) {
          const enq = this.data.enquiries.find((e) => e.id === conv.enquiry_id);
          if (enq && (enq.status === 'New' || enq.status === 'Follow-up Required')) {
            enq.status = 'Waiting for Customer';
            enq.updated_at = now;
          }
        }
      }
    }

    this.saveData();
    return newMsg;
  }

  // Follow-ups
  public getFollowUps(filters?: { status?: string; staff?: string }): FollowUp[] {
    let list = this.data.follow_ups.map((f) => ({
      ...f,
      customer: this.getCustomer(f.customer_id),
      enquiry: this.data.enquiries.find((e) => e.id === f.enquiry_id),
      assigned_user: this.getUser(f.assigned_to),
    }));

    if (filters?.status && filters.status !== 'All') {
      list = list.filter((f) => f.status === filters.status);
    }
    if (filters?.staff && filters.staff !== 'All') {
      list = list.filter((f) => f.assigned_to === filters.staff);
    }

    return list.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  public createFollowUp(data: Omit<FollowUp, 'id' | 'created_at'>): FollowUp {
    const newFollowUp: FollowUp = {
      id: `fol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      ...data,
    };
    this.data.follow_ups.unshift(newFollowUp);

    // Update enquiry status to Follow-up Required if currently In Progress or Waiting
    const enq = this.data.enquiries.find((e) => e.id === newFollowUp.enquiry_id);
    if (enq && enq.status !== 'Resolved' && enq.status !== 'Closed') {
      enq.status = 'Follow-up Required';
      enq.updated_at = new Date().toISOString();
    }

    this.saveData();
    return newFollowUp;
  }

  public updateFollowUp(id: string, updates: Partial<FollowUp>): FollowUp | undefined {
    const index = this.data.follow_ups.findIndex((f) => f.id === id);
    if (index === -1) return undefined;
    this.data.follow_ups[index] = {
      ...this.data.follow_ups[index],
      ...updates,
    };
    if (updates.status === 'Completed' && !this.data.follow_ups[index].completed_at) {
      this.data.follow_ups[index].completed_at = new Date().toISOString();
    }
    this.saveData();
    return this.data.follow_ups[index];
  }

  // Notes
  public getNotes(customerId?: string, enquiryId?: string): Note[] {
    let notes = this.data.notes;
    if (customerId) {
      notes = notes.filter((n) => n.customer_id === customerId);
    }
    if (enquiryId) {
      notes = notes.filter((n) => n.enquiry_id === enquiryId);
    }
    return notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNote(data: Omit<Note, 'id' | 'created_at'>): Note {
    const user = this.getUser(data.user_id);
    const newNote: Note = {
      id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      user_name: user?.name || 'Staff Member',
      ...data,
    };
    this.data.notes.unshift(newNote);
    this.saveData();
    return newNote;
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return this.data.notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addNotification(item: NotificationItem) {
    this.data.notifications.unshift(item);
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }
    this.saveData();
  }

  public markNotificationAsRead(id: string) {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.saveData();
    }
  }

  public markAllNotificationsAsRead() {
    this.data.notifications.forEach((n) => (n.read = true));
    this.saveData();
  }

  // Settings
  public getAISettings(): AISettings {
    return this.data.ai_settings || INITIAL_AI_SETTINGS;
  }

  public updateAISettings(updates: Partial<AISettings>): AISettings {
    this.data.ai_settings = {
      ...this.getAISettings(),
      ...updates,
    };
    this.saveData();
    return this.data.ai_settings;
  }

  public getNotificationSettings(): NotificationSettings {
    return this.data.notification_settings || INITIAL_NOTIFICATION_SETTINGS;
  }

  public updateNotificationSettings(updates: Partial<NotificationSettings>): NotificationSettings {
    this.data.notification_settings = {
      ...this.getNotificationSettings(),
      ...updates,
    };
    this.saveData();
    return this.data.notification_settings;
  }

  // Dashboard calculations & stats
  public getDashboardStats(): DashboardStats {
    this.runAutomatedFollowUpRules();
    const todayStr = new Date().toISOString().split('T')[0];

    const newEnquiries = this.data.enquiries.filter((e) => e.status === 'New').length;
    const pendingEnquiries = this.data.enquiries.filter(
      (e) => e.status === 'In Progress' || e.status === 'Waiting for Customer' || e.status === 'Follow-up Required'
    ).length;
    const followUpsToday = this.data.follow_ups.filter(
      (f) => f.due_date === todayStr && f.status !== 'Completed' && f.status !== 'Cancelled'
    ).length;
    const completedEnquiries = this.data.enquiries.filter((e) => e.status === 'Resolved' || e.status === 'Closed').length;
    const highPriorityEnquiries = this.data.enquiries.filter(
      (e) => (e.priority === 'High' || e.priority === 'Urgent') && e.status !== 'Resolved' && e.status !== 'Closed'
    ).length;
    const overdueFollowUps = this.data.follow_ups.filter((f) => f.status === 'Overdue').length;

    const channelBreakdown: Record<Channel, number> = {
      WhatsApp: 0,
      Website: 0,
      Instagram: 0,
      Facebook: 0,
      Phone: 0,
      Other: 0,
    };
    this.data.enquiries.forEach((e) => {
      channelBreakdown[e.channel] = (channelBreakdown[e.channel] || 0) + 1;
    });

    const statusBreakdown: Record<EnquiryStatus, number> = {
      New: 0,
      'In Progress': 0,
      'Waiting for Customer': 0,
      'Follow-up Required': 0,
      Resolved: 0,
      Closed: 0,
    };
    this.data.enquiries.forEach((e) => {
      statusBreakdown[e.status] = (statusBreakdown[e.status] || 0) + 1;
    });

    const priorityBreakdown: Record<EnquiryPriority, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Urgent: 0,
    };
    this.data.enquiries.forEach((e) => {
      priorityBreakdown[e.priority] = (priorityBreakdown[e.priority] || 0) + 1;
    });

    // Last 7 days enquiry activity
    const days: { date: string; count: number; day: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = this.data.enquiries.filter((e) => e.created_at.startsWith(dateStr)).length;
      days.push({
        date: dateStr,
        count: count,
        day: dayNames[d.getDay()],
      });
    }

    return {
      new_enquiries: newEnquiries,
      pending_enquiries: pendingEnquiries,
      follow_ups_today: followUpsToday,
      completed_enquiries: completedEnquiries,
      high_priority_enquiries: highPriorityEnquiries,
      overdue_follow_ups: overdueFollowUps,
      avg_response_time_minutes: 18,
      channel_breakdown: channelBreakdown,
      status_breakdown: statusBreakdown,
      priority_breakdown: priorityBreakdown,
      last_7_days_enquiries: days,
    };
  }
}

export const db = new Database();
