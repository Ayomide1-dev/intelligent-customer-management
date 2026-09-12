import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  analyzeCustomerEnquiry,
  generateStaffResponse,
  askStaffAIAssistant,
} from './server/gemini.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'SmartEnquiry CRM', timestamp: new Date().toISOString() });
  });

  // --- AUTHENTICATION ---
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = db.getUserByEmail(email);
    if (!user) {
      // For demo flexibility, if user is not found, return an existing default admin
      const fallbackUser = db.getUsers()[0];
      return res.json({
        user: fallbackUser,
        token: `mock-jwt-token-${fallbackUser.id}`,
        message: 'Logged in successfully',
      });
    }
    res.json({
      user,
      token: `mock-jwt-token-${user.id}`,
      message: 'Logged in successfully',
    });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { fullName, businessName, email, password } = req.body;
    if (!fullName || !email || !businessName) {
      return res.status(400).json({ error: 'Full name, email, and business name are required' });
    }

    if (businessName) {
      db.updateBusiness({ name: businessName, email });
    }

    const newUser = db.createUser({
      name: fullName,
      email,
      role: 'admin',
      phone: '+234 800 000 0000',
    });

    res.status(201).json({
      user: newUser,
      token: `mock-jwt-token-${newUser.id}`,
      message: 'Account created successfully',
    });
  });

  app.get('/api/auth/users', (_req, res) => {
    res.json({ users: db.getUsers() });
  });

  // --- DASHBOARD STATS ---
  app.get('/api/dashboard/stats', (_req, res) => {
    const stats = db.getDashboardStats();
    res.json({ stats });
  });

  // --- ENQUIRIES ---
  app.get('/api/enquiries', (req, res) => {
    const { channel, status, priority, assigned_to, intent, search } = req.query;
    const enquiries = db.getEnquiries({
      channel: channel as string,
      status: status as string,
      priority: priority as string,
      assigned_to: assigned_to as string,
      intent: intent as string,
      search: search as string,
    });
    res.json({ enquiries });
  });

  app.get('/api/enquiries/:id', (req, res) => {
    const enquiry = db.getEnquiry(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    const conversation = db.getConversationByEnquiry(enquiry.id);
    const notes = db.getNotes(enquiry.customer_id, enquiry.id);
    const followUps = db.getFollowUps().filter((f) => f.enquiry_id === enquiry.id);
    res.json({ enquiry, conversation, notes, followUps });
  });

  app.post('/api/enquiries', async (req, res) => {
    try {
      const {
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        customerLocation,
        channel = 'WhatsApp',
        message,
        productService,
        quantity,
        location,
        priority = 'Medium',
        assignedTo,
        notes,
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Enquiry message is required' });
      }

      // Find or create customer
      let resolvedCustomer;
      if (customerId && customerId !== 'new') {
        resolvedCustomer = db.getCustomer(customerId);
      }
      if (!resolvedCustomer) {
        resolvedCustomer = db.findOrCreateCustomer(
          customerName || 'African Customer',
          customerPhone || '+234 800 000 0000',
          customerEmail || '',
          customerLocation || location || 'Not provided',
          channel
        );
      }

      // Run AI Enquiry Analysis automatically (Section 7)
      const aiAnalysis = await analyzeCustomerEnquiry(
        message,
        location || resolvedCustomer.location,
        channel
      );

      // Determine assigned staff (default to first staff member if none provided)
      const allUsers = db.getUsers();
      const staffUser = assignedTo ? allUsers.find((u) => u.id === assignedTo) : allUsers[2] || allUsers[0];

      // Create enquiry
      const newEnquiry = db.createEnquiry({
        business_id: 'biz-1',
        customer_id: resolvedCustomer.id,
        channel,
        message,
        product_service: productService || aiAnalysis.product_service,
        quantity: quantity || aiAnalysis.quantity,
        location: location || aiAnalysis.location,
        intent: aiAnalysis.intent,
        sentiment: aiAnalysis.sentiment,
        urgency: aiAnalysis.urgency,
        priority: priority || (aiAnalysis.urgency === 'Urgent' ? 'Urgent' : 'Medium'),
        status: 'New',
        assigned_to: staffUser?.id || allUsers[0].id,
        notes: notes || '',
        ai_analysis: aiAnalysis,
      });

      if (notes) {
        db.addNote({
          customer_id: resolvedCustomer.id,
          enquiry_id: newEnquiry.id,
          user_id: staffUser?.id || allUsers[0].id,
          note: notes,
        });
      }

      res.status(201).json({
        enquiry: newEnquiry,
        customer: resolvedCustomer,
        message: 'Enquiry created and analyzed successfully',
      });
    } catch (err: any) {
      console.error('Error creating enquiry:', err);
      res.status(500).json({ error: err.message || 'Failed to create enquiry' });
    }
  });

  app.patch('/api/enquiries/:id', (req, res) => {
    const updated = db.updateEnquiry(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json({ enquiry: updated, message: 'Enquiry updated successfully' });
  });

  // --- PUBLIC WEBSITE ENQUIRY FORM (Section 22) ---
  app.post('/api/public/enquiries', async (req, res) => {
    try {
      const { fullName, phone, email, productService, message, location } = req.body;

      if (!fullName || !phone || !message) {
        return res.status(400).json({ error: 'Full name, phone number, and message are required' });
      }

      // Step 1: Create or find the customer
      const customer = db.findOrCreateCustomer(
        fullName,
        phone,
        email || '',
        location || 'Not provided',
        'Website'
      );

      // Step 2 & 4: Run AI analysis
      const aiAnalysis = await analyzeCustomerEnquiry(message, location, 'Website');

      // Step 5 & 6: Set status to New, assign to staff and notify
      const staffList = db.getUsers().filter((u) => u.role === 'staff' || u.role === 'manager');
      const assignedStaff = staffList[Math.floor(Math.random() * staffList.length)] || db.getUsers()[0];

      const enquiry = db.createEnquiry({
        business_id: 'biz-1',
        customer_id: customer.id,
        channel: 'Website',
        message,
        product_service: productService || aiAnalysis.product_service,
        quantity: aiAnalysis.quantity,
        location: location || aiAnalysis.location,
        intent: aiAnalysis.intent,
        sentiment: aiAnalysis.sentiment,
        urgency: aiAnalysis.urgency,
        priority: aiAnalysis.urgency === 'Urgent' ? 'Urgent' : 'Medium',
        status: 'New',
        assigned_to: assignedStaff.id,
        ai_analysis: aiAnalysis,
      });

      // Step 7: Confirmation message
      res.status(201).json({
        confirmation: 'Thank you. Your enquiry has been received. Our team will get back to you shortly.',
        enquiryId: enquiry.id,
      });
    } catch (err: any) {
      console.error('Public enquiry form error:', err);
      res.status(500).json({ error: 'Failed to submit enquiry. Please try again.' });
    }
  });

  // --- AI ANALYSIS & RESPONSE ASSISTANT (Section 7, 9, 15) ---
  app.post('/api/ai/analyze', async (req, res) => {
    const { message, customerLocation, channel } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required for analysis' });
    }
    const analysis = await analyzeCustomerEnquiry(message, customerLocation, channel);
    res.json({ analysis });
  });

  app.post('/api/ai/generate-response', async (req, res) => {
    try {
      const {
        customerName,
        enquiryMessage,
        productService,
        quantity,
        location,
        channel,
        modifier = 'default',
      } = req.body;

      const aiSettings = db.getAISettings();
      const generated = await generateStaffResponse({
        customerName: customerName || 'Customer',
        enquiryMessage: enquiryMessage || '',
        productService,
        quantity,
        location,
        channel,
        modifier,
        aiSettings,
      });

      res.json({ response: generated });
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });

  app.post('/api/ai/assistant-chat', async (req, res) => {
    try {
      const { query, activeEnquiryId, customerId } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const activeEnquiry = activeEnquiryId ? db.getEnquiry(activeEnquiryId) : undefined;
      const customerProfile = customerId ? db.getCustomer(customerId) : undefined;
      const crmOverview = db.getDashboardStats();

      const reply = await askStaffAIAssistant({
        userQuery: query,
        activeEnquiry,
        customerProfile,
        crmOverview,
      });

      res.json({ reply });
    } catch (err: any) {
      console.error('AI assistant chat error:', err);
      res.status(500).json({ error: 'Failed to query AI Assistant' });
    }
  });

  // --- CUSTOMERS ---
  app.get('/api/customers', (req, res) => {
    const { query, status, channel } = req.query;
    const customers = db.getCustomers({
      query: query as string,
      status: status as string,
      channel: channel as string,
    });
    res.json({ customers });
  });

  app.get('/api/customers/:id', (req, res) => {
    const customer = db.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const enquiries = db.getEnquiries().filter((e) => e.customer_id === customer.id);
    const conversations = db.getConversations().filter((c) => c.customer_id === customer.id);
    const followUps = db.getFollowUps().filter((f) => f.customer_id === customer.id);
    const notes = db.getNotes(customer.id);

    res.json({
      customer,
      enquiries,
      conversations,
      followUps,
      notes,
    });
  });

  app.post('/api/customers', (req, res) => {
    const { name, phone, email, location, preferred_channel, status } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Customer name and phone number are required' });
    }
    const created = db.createCustomer({
      business_id: 'biz-1',
      name,
      phone,
      email: email || '',
      location: location || 'Not provided',
      preferred_channel: preferred_channel || 'WhatsApp',
      status: status || 'New',
    });
    res.status(201).json({ customer: created });
  });

  app.patch('/api/customers/:id', (req, res) => {
    const updated = db.updateCustomer(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ customer: updated });
  });

  // --- CONVERSATIONS & MESSAGES ---
  app.get('/api/conversations', (_req, res) => {
    res.json({ conversations: db.getConversations() });
  });

  app.get('/api/conversations/:id', (req, res) => {
    const conversation = db.getConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ conversation });
  });

  app.post('/api/conversations/:id/messages', (req, res) => {
    const { message, senderType = 'staff', senderName } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    const newMsg = db.addMessage(req.params.id, senderType, message, senderName);
    const updatedConv = db.getConversation(req.params.id);
    res.status(201).json({ message: newMsg, conversation: updatedConv });
  });

  // --- FOLLOW-UPS ---
  app.get('/api/follow-ups', (req, res) => {
    const { status, staff } = req.query;
    res.json({ followUps: db.getFollowUps({ status: status as string, staff: staff as string }) });
  });

  app.post('/api/follow-ups', (req, res) => {
    const { customerId, enquiryId, assignedTo, reason, dueDate, dueTime, notes } = req.body;
    if (!customerId || !reason || !dueDate) {
      return res.status(400).json({ error: 'Customer, reason, and due date are required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let status: any = 'Pending';
    if (dueDate === todayStr) status = 'Due Today';
    else if (dueDate < todayStr) status = 'Overdue';

    const newFollowUp = db.createFollowUp({
      business_id: 'biz-1',
      customer_id: customerId,
      enquiry_id: enquiryId || '',
      assigned_to: assignedTo || db.getUsers()[0].id,
      reason,
      due_date: dueDate,
      due_time: dueTime || '12:00',
      status,
      notes: notes || '',
    });

    res.status(201).json({ followUp: newFollowUp, message: 'Follow-up scheduled successfully' });
  });

  app.patch('/api/follow-ups/:id', (req, res) => {
    const updated = db.updateFollowUp(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Follow-up not found' });
    }
    res.json({ followUp: updated, message: 'Follow-up updated successfully' });
  });

  // --- NOTES ---
  app.get('/api/notes', (req, res) => {
    const { customerId, enquiryId } = req.query;
    res.json({ notes: db.getNotes(customerId as string, enquiryId as string) });
  });

  app.post('/api/notes', (req, res) => {
    const { customerId, enquiryId, userId, note } = req.body;
    if (!customerId || !note) {
      return res.status(400).json({ error: 'Customer ID and note text are required' });
    }
    const created = db.addNote({
      customer_id: customerId,
      enquiry_id: enquiryId,
      user_id: userId || db.getUsers()[0].id,
      note,
    });
    res.status(201).json({ note: created, message: 'Note added successfully' });
  });

  // --- NOTIFICATIONS ---
  app.get('/api/notifications', (_req, res) => {
    res.json({ notifications: db.getNotifications() });
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    db.markNotificationAsRead(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/notifications/read-all', (_req, res) => {
    db.markAllNotificationsAsRead();
    res.json({ success: true });
  });

  // --- SETTINGS ---
  app.get('/api/settings', (_req, res) => {
    res.json({
      business: db.getBusiness(),
      team: db.getUsers(),
      ai: db.getAISettings(),
      notifications: db.getNotificationSettings(),
    });
  });

  app.patch('/api/settings/business', (req, res) => {
    const updated = db.updateBusiness(req.body);
    res.json({ business: updated, message: 'Business settings updated' });
  });

  app.patch('/api/settings/ai', (req, res) => {
    const updated = db.updateAISettings(req.body);
    res.json({ ai: updated, message: 'AI settings updated' });
  });

  app.patch('/api/settings/notifications', (req, res) => {
    const updated = db.updateNotificationSettings(req.body);
    res.json({ notifications: updated, message: 'Notification settings updated' });
  });

  app.post('/api/settings/team', (req, res) => {
    const { name, email, role, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const user = db.createUser({
      name,
      email,
      role: role || 'staff',
      phone: phone || '',
    });
    res.status(201).json({ user, message: 'Team member added' });
  });

  // --- SIMULATION / TESTING HOOK (Section 21) ---
  app.post('/api/channels/simulate-incoming', async (req, res) => {
    const { channel = 'WhatsApp', customerName = 'Simulated African Client', phone = '+234 812 000 9999', message, location = 'Lagos' } = req.body;
    const sampleMsg = message || 'Hello, I want to know the price of 20 chairs and if you deliver to Ibadan.';

    const customer = db.findOrCreateCustomer(customerName, phone, `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.africa`, location, channel);
    const aiAnalysis = await analyzeCustomerEnquiry(sampleMsg, location, channel);
    const staff = db.getUsers().find((u) => u.role === 'staff') || db.getUsers()[0];

    const enquiry = db.createEnquiry({
      business_id: 'biz-1',
      customer_id: customer.id,
      channel,
      message: sampleMsg,
      product_service: aiAnalysis.product_service,
      quantity: aiAnalysis.quantity,
      location: aiAnalysis.location,
      intent: aiAnalysis.intent,
      sentiment: aiAnalysis.sentiment,
      urgency: aiAnalysis.urgency,
      priority: aiAnalysis.urgency === 'Urgent' ? 'Urgent' : 'Medium',
      status: 'New',
      assigned_to: staff.id,
      ai_analysis: aiAnalysis,
    });

    res.status(201).json({
      enquiry,
      customer,
      message: `Simulated incoming ${channel} enquiry created and analyzed`,
    });
  });

  // --- VITE MIDDLEWARE (Dev) / STATIC ASSETS (Prod) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartEnquiry CRM Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
