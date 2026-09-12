import { GoogleGenAI } from '@google/genai';
import { AIAnalysis, AISettings } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
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

export async function askStaffAIAssistant(params: {
  userQuery: string;
  activeEnquiry?: any;
  customerProfile?: any;
  crmOverview?: any;
}): Promise<string> {
  const { userQuery, activeEnquiry, customerProfile, crmOverview } = params;
  const client = getAIClient();

  if (!client) {
    return `SmartEnquiry AI Assistant (Offline Mode):
Based on the current CRM records:
- Customer: ${customerProfile?.name || activeEnquiry?.customer?.name || 'Selected Customer'}
- Enquiry Intent: ${activeEnquiry?.intent || 'General Enquiry'}
- Key Need: ${activeEnquiry?.product_service || 'Customer requirements'} (${activeEnquiry?.quantity || 'Qty unstated'})
- Status: ${activeEnquiry?.status || 'Active'}
- Suggested staff action: Verify current stock availability and confirm dispatch schedule before sending proforma invoice.`;
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
2. Offer helpful suggestions for responses, follow-up scheduling, or customer objection handling.
3. Be clear, professional, and respectful. Use formatting like bullet points where helpful.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text?.trim() || 'AI Assistant response received.';
  } catch (err) {
    console.warn('Gemini staff assistant error:', err);
    return 'The AI Assistant is currently processing your request. Please review the customer details in the enquiry view.';
  }
}
