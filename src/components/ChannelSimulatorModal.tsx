import React, { useState } from 'react';
import {
  X,
  Sparkles,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Send,
  Loader2,
  CheckCircle2,
  Phone,
  MapPin,
  Bot,
} from 'lucide-react';
import { Channel } from '../types';
import { api } from '../lib/api';

interface ChannelSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationComplete: () => void;
}

const PRESET_ENQUIRIES = [
  {
    channel: 'WhatsApp' as Channel,
    customerName: 'Chinedu Eze',
    phone: '+234 802 345 6789',
    location: 'Lagos',
    message: 'Good day, do you have 10kVA solar inverter systems available in stock? Please I need quotation and delivery timeline to Lekki Phase 1 urgently.',
  },
  {
    channel: 'Instagram' as Channel,
    customerName: 'Amina Bello',
    phone: '+234 814 555 0192',
    location: 'Abuja',
    message: 'Hello! Saw your post on diesel power generator maintenance. How much do you charge for servicing a 50kVA Perkins engine in Wuse 2?',
  },
  {
    channel: 'Website' as Channel,
    customerName: 'Kwame Mensah',
    phone: '+233 24 123 4567',
    location: 'Accra',
    message: 'We are requesting bulk pricing for 50 units of 450W Monocrystalline solar panels delivered to our warehouse in Tema.',
  },
  {
    channel: 'Facebook' as Channel,
    customerName: 'Fatima Sanusi',
    phone: '+234 703 888 2211',
    location: 'Kano',
    message: 'Do you deliver spare parts to Kano State? What is the warranty on your lithium storage batteries?',
  },
];

export function ChannelSimulatorModal({
  isOpen,
  onClose,
  onSimulationComplete,
}: ChannelSimulatorModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('WhatsApp');
  const [customerName, setCustomerName] = useState(PRESET_ENQUIRIES[0].customerName);
  const [phone, setPhone] = useState(PRESET_ENQUIRIES[0].phone);
  const [location, setLocation] = useState(PRESET_ENQUIRIES[0].location);
  const [message, setMessage] = useState(PRESET_ENQUIRIES[0].message);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_ENQUIRIES[0]) => {
    setSelectedChannel(preset.channel);
    setCustomerName(preset.customerName);
    setPhone(preset.phone);
    setLocation(preset.location);
    setMessage(preset.message);
    setSimulationResult(null);
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !message.trim()) return;

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await api.simulateIncoming({
        channel: selectedChannel,
        customerName,
        phone,
        location,
        message,
      });
      setSimulationResult(res);
      onSimulationComplete();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Multi-Channel Simulator (Section 21)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate inbound customer messages without needing live API tokens.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Select Preset African Business Enquiry:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_ENQUIRIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded-xl border text-left text-xs transition-all ${
                  selectedChannel === preset.channel && customerName === preset.customerName
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold text-[11px]">
                  {preset.channel}
                </div>
                <div className="truncate text-[10px] opacity-80">{preset.customerName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulator Form */}
        <form onSubmit={handleRunSimulation} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Inbound Channel *
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as Channel)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website">Website Form</option>
                <option value="Instagram">Instagram DM</option>
                <option value="Facebook">Facebook Messenger</option>
                <option value="Phone">Phone Call Log</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Customer Phone *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              City / Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Incoming Message Body *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              The AI will automatically extract intent, urgency, product, and draft responses.
            </span>
            <button
              type="submit"
              disabled={isSimulating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Inject Simulated Message</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result Preview */}
        {simulationResult && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Simulated Inbound Event Processed Successfully!</span>
            </div>
            <div className="text-[11px] text-slate-700 dark:text-slate-300 grid grid-cols-2 gap-2">
              <div>
                Enquiry Ticket: <strong>#{simulationResult.enquiry?.id}</strong>
              </div>
              <div>
                Channel: <strong>{simulationResult.enquiry?.channel}</strong>
              </div>
              <div>
                AI Urgency: <strong>{simulationResult.enquiry?.urgency}</strong>
              </div>
              <div>
                AI Intent: <strong>{simulationResult.enquiry?.intent}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
