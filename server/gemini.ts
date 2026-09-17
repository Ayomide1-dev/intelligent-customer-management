import { GoogleGenAI } from '@google/genai';
import { AIAnalysis, AISettings } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: key.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
      aiClient = null;
    }
  }
  return aiClient;
}

// Fallback heuristic extraction if Gemini is unavailable or rate-limited
function heuristicAnalysis(message: string, customerLocation?: string): AIAnalysis {
  const lower = message.toLowerCase();

  let intent = 'General Enquiry';
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
    intent = 'Price & Quotation Request';
  } else if (lower.includes('order') || lower.includes('buy') || lower.includes('purchase')) {
    intent = 'Order Request';
  } else if (lower.includes('deliver') || lower.includes('shipping') || lower.includes('transit')) {
    intent = 'Delivery & Logistics Enquiry';
  } else if (lower.includes('catalogue') || lower.includes('catalog') || lower.includes('brochure') || lower.includes('list')) {
    intent = 'Product Catalogue Request';
  } else if (lower.includes('service') || lower.includes('catering') || lower.includes('hire') || lower.includes('rent')) {
    intent = 'Service Enquiry';
  }

  // Detect location
  let location = customerLocation && customerLocation !== 'Not provided' ? customerLocation : 'Not provided';
  const africanLocations = ['ibadan', 'lagos', 'abuja', 'accra', 'nairobi', 'port harcourt', 'kano', 'lekki', 'ikeja', 'victoria island', 'kumasi', 'mombasa', 'enugu', 'benin city'];
  for (const loc of africanLocations) {
    if (lower.includes(loc)) {
      location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  // Detect quantity
  let quantity = 'Not provided';
  const qtyMatch = message.match(/\b(\d+)\s*(chairs?|units?|pieces?|tables?|desks?|items?|pcs|packs?|sets?)\b/i) || message.match(/\b(\d+)\b/);
  if (qtyMatch) {
    quantity = qtyMatch[1];
  }

  // Detect product/service
  let product = 'Not provided';
  if (lower.includes('chair')) product = 'Chairs';
  else if (lower.includes('table')) product = 'Tables / Event Seating';
  else if (lower.includes('desk') || lower.includes('furniture')) product = 'Office Desks & Furniture';
  else if (lower.includes('catering')) product = 'Catering & Hospitality Service';
  else if (lower.includes('catalogue') || lower.includes('catalog')) product = 'Product Catalogue';
  else if (lower.includes('logistics') || lower.includes('delivery')) product = 'Delivery Logistics';

  // Urgency
  let urgency: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('emergency') || lower.includes('today')) {
    urgency = 'Urgent';
  } else if (lower.includes('soon') || lower.includes('tomorrow') || lower.includes('express')) {
    urgency = 'High';
  } else if (lower.includes('catalogue') || lower.includes('when you have time')) {
    urgency = 'Low';
  }

  // Sentiment
  let sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Enquiring' = 'Enquiring';
  if (lower.includes('thank') || lower.includes('good') || lower.includes('great') || lower.includes('excellent')) {
    sentiment = 'Positive';
  } else if (lower.includes('disappointed') || lower.includes('bad') || lower.includes('angry') || lower.includes('late')) {
    sentiment = 'Negative';
  }

  const importantInfo: string[] = [];
  if (product !== 'Not provided') importantInfo.push(`Product/Service requested: ${product}`);
  if (quantity !== 'Not provided') importantInfo.push(`Quantity noted: ${quantity}`);
  if (location !== 'Not provided') importantInfo.push(`Delivery/Project Location: ${location}`);
  if (importantInfo.length === 0) importantInfo.push('Customer sent enquiry requiring initial assessment.');

  let suggestedAction = 'Review enquiry and send tailored response';
  if (intent.includes('Price')) {
    suggestedAction = `Provide current official quotation for ${product !== 'Not provided' ? product : 'requested item'}${location !== 'Not provided' ? ' with delivery estimates to ' + location : ''}`;
  } else if (intent.includes('Catalogue')) {
    suggestedAction = 'Dispatch standard product catalogue PDF and follow up on specific item needs';
  } else if (intent.includes('Delivery')) {
    suggestedAction = `Confirm dispatch timetable and courier options for ${location}`;
  } else if (intent.includes('Service')) {
    suggestedAction = 'Schedule phone consultation to confirm event specifications and attendee numbers';
  }

  return {
    intent,
    product_service: product,
    quantity,
    location,
    urgency,
    sentiment,
    important_information: importantInfo,
    suggested_action: suggestedAction,
  };
}

export async function analyzeCustomerEnquiry(
  message: string,
  customerLocation?: string,
  channel?: string
): Promise<AIAnalysis> {
  const fallback = heuristicAnalysis(message, customerLocation);
  const client = getAIClient();

  if (!client) {
    return fallback;
  }

  try {
    const prompt = `You are the core AI intelligence engine for SmartEnquiry CRM, an African business CRM.
Analyze the following customer enquiry message received via ${channel || 'a digital channel'}:

Customer Message: "${message}"
Customer stated location (if known): "${customerLocation || 'Not provided'}"

Strict Instructions:
1. Identify:
- intent (e.g. Product Enquiry, Price Request, Delivery Timeline, Service Booking, Catalogue Request, Feedback, Order Status)
- product_service (exact item/service mentioned, or "Not provided")
- quantity (exact count/units mentioned, or "Not provided")
- location (specific African city, state, or area mentioned like Ibadan, Lagos, Abuja, Accra, Nairobi, or "Not provided")
- urgency ("Low", "Medium", "High", or "Urgent")
- sentiment ("Positive", "Neutral", "Negative", or "Enquiring")
- important_information (an array of 1 to 3 key factual points)
- suggested_action (concise, actionable next step for staff)

CRITICAL RULE:
- Do NOT invent information that was not provided by the customer.
- If information is missing, you MUST mark it as "Not provided".
- Do not assume prices, dates, or specifications not stated.

Respond strictly in valid JSON matching this schema:
{
  "intent": string,
  "product_service": string,
  "quantity": string,
  "location": string,
  "urgency": "Low" | "Medium" | "High" | "Urgent",
  "sentiment": "Positive" | "Neutral" | "Negative" | "Enquiring",
  "important_information": string[],
  "suggested_action": string
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text?.trim();
    if (rawText) {
      const parsed = JSON.parse(rawText) as AIAnalysis;
      return {
        intent: parsed.intent || fallback.intent,
        product_service: parsed.product_service || fallback.product_service,
        quantity: parsed.quantity || fallback.quantity,
        location: parsed.location || fallback.location,
        urgency: parsed.urgency || fallback.urgency,
        sentiment: parsed.sentiment || fallback.sentiment,
        important_information: Array.isArray(parsed.important_information) ? parsed.important_information : fallback.important_information,
        suggested_action: parsed.suggested_action || fallback.suggested_action,
      };
    }
  } catch (err) {
    console.warn('Gemini analysis failed or timed out, using heuristic analysis fallback:', err);
  }

  return fallback;
}

export async function generateStaffResponse(params: {
  customerName: string;
  enquiryMessage: string;
  productService?: string;
  quantity?: string;
  location?: string;
  channel?: string;
  modifier?: 'default' | 'shorter' | 'professional' | 'friendlier';
  aiSettings?: AISettings;
  conversationHistory?: { sender_type: string; message: string }[];
}): Promise<string> {
  const { customerName, enquiryMessage, productService, quantity, location, channel, modifier = 'default', aiSettings } = params;

  const client = getAIClient();

  // Baseline templates if Gemini is not reachable
  const baseGreetings: Record<string, string> = {
    default: `Hello ${customerName}, thank you for contacting us via ${channel || 'SmartEnquiry'}. We have received your enquiry regarding ${
      productService && productService !== 'Not provided' ? productService : 'our products and services'
    }${location && location !== 'Not provided' ? ' and delivery to ' + location : ''}. Our sales and logistics team is confirming the current pricing and schedule, and we will share the full details with you shortly. Please let us know if you have any additional requirements.`,
    shorter: `Hello ${customerName}, thank you for reaching out! We've received your enquiry regarding ${
      productService && productService !== 'Not provided' ? productService : 'your request'
    }${location && location !== 'Not provided' ? ' to ' + location : ''}. Our team will confirm current availability and details for you shortly.`,
    professional: `Dear ${customerName},\n\nThank you for contacting Apex Supplies & Commercial Solutions. We acknowledge receipt of your enquiry regarding ${
      productService && productService !== 'Not provided' ? productService : 'our commercial offerings'
    }${quantity && quantity !== 'Not provided' ? ' (Quantity: ' + quantity + ')' : ''}${location && location !== 'Not provided' ? ' for delivery to ' + location : ''}.\n\nOur team is currently preparing the necessary specifications and dispatch terms. An official quotation will be provided to you shortly.\n\nBest regards,\nCustomer Relations Team`,
    friendlier: `Hi ${customerName}! 👋\n\nThanks so much for reaching out to us today! We'd love to help you with ${
      productService && productService !== 'Not provided' ? productService : 'your enquiry'
    }${location && location !== 'Not provided' ? ' for ' + location : ''}! We're checking the exact details right now and will get back to you with all the information in just a moment. Warm regards!`,
  };

  if (!client) {
    return baseGreetings[modifier] || baseGreetings.default;
  }

  try {
    let modifierPrompt = 'Keep the tone balanced, courteous, respectful and clear.';
    if (modifier === 'shorter') modifierPrompt = 'Make the response concise, punchy, and under 3 sentences.';
    if (modifier === 'professional') modifierPrompt = 'Use formal, corporate African business phrasing with high professionalism and clarity.';
    if (modifier === 'friendlier') modifierPrompt = 'Make the tone warm, welcoming, personable and approachable while remaining business-appropriate.';

    const businessContext = aiSettings?.business_info_context || 'Apex Supplies & Commercial Solutions is a professional African commercial distributor based in Lagos with regional delivery.';

    const prompt = `You are the AI Response Assistant for a business CRM in Africa.
Generate a customer reply to the following enquiry:

Customer Name: ${customerName}
Channel: ${channel || 'WhatsApp'}
Customer Enquiry: "${enquiryMessage}"
Extracted Product/Service: ${productService || 'Not provided'}
Extracted Quantity: ${quantity || 'Not provided'}
Customer Location: ${location || 'Not provided'}
Business Context: "${businessContext}"

Modifier instruction: ${modifierPrompt}

CRITICAL RULES:
1. Do NOT invent prices, delivery fees, discounts, product availability dates, or refund policies unless explicitly stated in the Business Context.
2. If exact prices or dispatch dates are not in the context, politely assure the customer that the team will verify and provide the exact quote and delivery terms shortly.
3. Be respectful and address the customer naturally.
4. Return ONLY the drafted message text without quotation marks or explanations.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) {
      return text;
    }
  } catch (err) {
    console.warn('Gemini response generation error, using baseline template:', err);
  }

  return baseGreetings[modifier] || baseGreetings.default;
}

function generateIntelligentStaffResponse(params: {
  userQuery: string;
  activeEnquiry?: any;
  customerProfile?: any;
  crmOverview?: any;
}): string {
  const { userQuery, activeEnquiry, customerProfile, crmOverview } = params;
  const q = userQuery.toLowerCase();

  const customerName = customerProfile?.name || activeEnquiry?.customer?.name || 'the customer';
  const customerPhone = customerProfile?.phone || activeEnquiry?.customer?.phone || 'Not provided';
  const customerLoc = customerProfile?.location || activeEnquiry?.location || activeEnquiry?.customer?.location || 'Not provided';
  const channel = activeEnquiry?.channel || customerProfile?.preferred_channel || 'WhatsApp';
  const product = activeEnquiry?.product_service && activeEnquiry.product_service !== 'Not provided' ? activeEnquiry.product_service : 'Commercial products/services';
  const quantity = activeEnquiry?.quantity && activeEnquiry.quantity !== 'Not provided' ? activeEnquiry.quantity : 'Standard quantity';
  const enquiryMsg = activeEnquiry?.message || 'General customer inquiry';
  const intent = activeEnquiry?.intent || 'Commercial Enquiry';
  const urgency = activeEnquiry?.urgency || 'Medium';

  // 1. Summarize enquiry
  if (q.includes('summar') || q.includes('overview') || q.includes('brief') || q.includes('priorit')) {
    return `📋 SmartEnquiry Executive Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Customer: ${customerName} (${channel} • ${customerPhone})
• Destination / Location: ${customerLoc}
• Core Intent: ${intent} (Urgency: ${urgency})
• Requested Product: ${product}
• Noted Quantity: ${quantity}
• Customer's Original Message: "${enquiryMsg}"

💡 Key Operational Insight:
The customer is seeking direct confirmation on availability and pricing for ${customerLoc}. Because this is routed via ${channel}, speed of response directly impacts conversion.
👉 Recommended Next Step: Confirm warehouse stock in Lagos, calculate transport/waybill fee for ${customerLoc}, and send an official proforma invoice.`;
  }

  // 2. Draft response / suggest reply
  if (q.includes('draft') || q.includes('suggest response') || q.includes('reply') || q.includes('message') || q.includes('what should i say') || q.includes('write')) {
    return `💬 Suggested Response Draft for ${customerName} (${channel}):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Hello ${customerName}, thank you for reaching out to us via ${channel}! 

We have received your enquiry regarding ${product}${quantity !== 'Standard quantity' ? ' (Quantity: ' + quantity + ')' : ''}${customerLoc !== 'Not provided' ? ' for delivery to ' + customerLoc : ''}. 

Our team is currently verifying current warehouse stock and calculating the quickest dispatch schedule. We will share your official quote and delivery timeline within the next few minutes. 

Please let us know if you have any additional specifications or need a formal proforma invoice."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Staff Tips:
• You can copy and paste this directly or open the 'AI Reply' generator for tone adjustments (Short, Formal, Friendly).
• Remember to set a 24-hour follow-up once this quotation is dispatched.`;
  }

  // 3. Customer needs & unstated requirements
  if (q.includes('need') || q.includes('unstated') || q.includes('implicit') || q.includes('hidden') || q.includes('require')) {
    return `🔍 Customer Needs Analysis (${customerName}):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Explicit Stated Needs:
   • Product: ${product}
   • Volume: ${quantity}
   • Delivery Hub: ${customerLoc}

2. Unstated & Implicit Commercial Needs:
   • Logistics & Waybill Security: Since delivery is to ${customerLoc}, customer will want reassurance about transit time, packaging integrity, and driver tracking.
   • Pricing & Volume Discount: For ${quantity !== 'Standard quantity' ? quantity : 'bulk'} quantities, customer will expect wholesale rate consideration.
   • Proof of Authenticity / Proforma: Corporate/institutional buyers in Nigeria require a stamped proforma invoice and bank transfer details before payment.

3. Potential Friction Points:
   • Unclear dispatch timelines or unexpected shipping fees at point of arrival. Proactively disclose waybill costs to secure trust.`;
  }

  // 4. Follow-up recommendation
  if (q.includes('follow') || q.includes('schedule') || q.includes('reminder') || q.includes('timing')) {
    return `⏰ Recommended Follow-up Schedule (Automated Engine):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Customer: ${customerName}
• Target Due Date: Tomorrow (within 24 hours of quotation)
• Target Due Time: 11:00 AM (optimal business communication window)
• Recommended Reason: "Confirm quotation receipt, answer product questions, and discuss dispatch schedule to ${customerLoc}"
• Business Rule Applied: Rule 3 (Quote Awaiting → Follow-up within 24-48 hours)

Staff Action:
Click 'Schedule Follow-up' on this enquiry or navigate to the Follow-ups tab to log this reminder.`;
  }

  // 5. Pricing, discount, or payment terms
  if (q.includes('price') || q.includes('discount') || q.includes('cost') || q.includes('quote') || q.includes('invoice') || q.includes('pay')) {
    return `💰 Pricing & Commercial Guidance:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Account: ${customerName}
• Inquired Item: ${product} (${quantity})
• Standard Policy: Wholesale bulk discounts are available for orders of 20+ units.
• Regional Dispatch: Deliveries to ${customerLoc} depend on haulage/interstate courier weight.
• Recommendation: Prepare a proforma invoice clearly itemizing:
  1. Base unit price
  2. Bulk tier discount (if quantity ≥ 20)
  3. Insured interstate dispatch fee to ${customerLoc}
  4. Accepted payment methods: Direct corporate bank transfer (Naira) with receipt confirmation.`;
  }

  // 6. Next action / strategy
  if (q.includes('action') || q.includes('next') || q.includes('what should i do') || q.includes('advice')) {
    return `🎯 Recommended Action Plan for Staff:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Check Physical Stock in inventory for ${product} (${quantity}).
Step 2: Send the drafted quotation to ${customerName} on ${channel}.
Step 3: Update enquiry status from '${activeEnquiry?.status || 'New'}' to 'Waiting for Customer'.
Step 4: Log a follow-up scheduled for 24-48 hours from now using the Schedule Follow-up button.
Step 5: Add a quick private note to the customer file noting their location in ${customerLoc}.`;
  }

  // Default intelligent contextual response
  return `🤖 SmartEnquiry Intelligence Briefing:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Regarding ${customerName}'s enquiry on ${channel}:
• Subject: ${product} (${quantity})
• Destination: ${customerLoc}
• Status: ${activeEnquiry?.status || 'In Progress'} (Priority: ${activeEnquiry?.priority || 'Medium'})

Key Advice:
${customerName} reached out asking: "${enquiryMsg}". Ensure prompt communication via ${channel}, provide transparent dispatch terms for ${customerLoc}, and schedule a reminder to prevent losing track of this customer.

How else can I assist? (e.g. Try asking "Draft response", "Summarize enquiry", "Detect unstated needs", or "Recommend follow-up")`;
}

export async function askStaffAIAssistant(params: {
  userQuery: string;
  activeEnquiry?: any;
  customerProfile?: any;
  crmOverview?: any;
}): Promise<string> {
  const { userQuery, activeEnquiry, customerProfile, crmOverview } = params;
  const client = getAIClient();

  if (!client) {
    return generateIntelligentStaffResponse(params);
  }

  try {
    const prompt = `You are the internal Staff AI Assistant for SmartEnquiry CRM, assisting African business sales & support staff.
The staff member asked: "${userQuery}"

Available CRM Context:
${activeEnquiry ? `Active Enquiry:
- Customer: ${activeEnquiry.customer?.name} (${activeEnquiry.customer?.phone}, ${activeEnquiry.customer?.location})
- Message: "${activeEnquiry.message}"
- Channel: ${activeEnquiry.channel}
- Intent: ${activeEnquiry.intent}
- Product/Service: ${activeEnquiry.product_service}
- Quantity: ${activeEnquiry.quantity}
- Urgency: ${activeEnquiry.urgency}
- Status: ${activeEnquiry.status}
` : 'No single enquiry selected.'}

${customerProfile ? `Customer Profile:
- Name: ${customerProfile.name}
- Total Enquiries: ${customerProfile.enquiries_count}
- Location: ${customerProfile.location}
- Preferred Channel: ${customerProfile.preferred_channel}
` : ''}

${crmOverview ? `CRM Overview:
- New Enquiries: ${crmOverview.new_enquiries}
- Pending Follow-ups: ${crmOverview.follow_ups_today}
- High Priority: ${crmOverview.high_priority_enquiries}
` : ''}

Instructions:
1. Provide a direct, highly practical, and actionable answer to help the staff member.
2. Offer helpful suggestions for responses, follow-up scheduling, or customer objection handling in an African commercial context.
3. Be clear, professional, and respectful. Use formatting like bullet points where helpful.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) {
      return text;
    }
    return generateIntelligentStaffResponse(params);
  } catch (err) {
    console.warn('Gemini staff assistant error, using CRM intelligence fallback:', err);
    return generateIntelligentStaffResponse(params);
  }
}
