import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, Clock, Globe, Users, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { Issue } from '../types';
import Tooltip from './Tooltip';

interface ShareModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ issue, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [expiryHours, setExpiryHours] = useState('24');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string>('');
  const [includeStatus, setIncludeStatus] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);

  // Generate simulated deep link URL
  const [simulatedUrl, setSimulatedUrl] = useState('');
  const [realUrl, setRealUrl] = useState('');

  useEffect(() => {
    if (issue) {
      const randomToken = `cr_${Math.random().toString(36).substring(2, 9)}`;
      const expireTimestamp = Date.now() + parseInt(expiryHours) * 60 * 60 * 1000;
      
      // Beautiful simulated gov link
      const simulated = `https://civicresolve.gov/share/issue-${issue.id.substring(0, 8)}?t=${randomToken}&exp=${expireTimestamp}`;
      setSimulatedUrl(simulated);

      // Real deep link using application origin
      const real = `${window.location.origin}${window.location.pathname}?issueId=${issue.id}`;
      setRealUrl(real);
    }
  }, [issue, expiryHours]);

  if (!issue || !isOpen) return null;

  const handleCopy = async () => {
    try {
      // In a real environment, we write the real deep link to the clipboard so it's fully functional, 
      // but we display the gorgeous simulated .gov link in the UI.
      await navigator.clipboard.writeText(realUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handlePlatformShare = (platformName: string) => {
    setSelectedPlatform(platformName);
    
    // Simulate deep link packaging & citizen action
    let msg = '';
    switch (platformName) {
      case 'WhatsApp':
        msg = `Dispatched to local WhatsApp group: "⚠️ Alert: ${issue.title} at ${issue.sector}. ${includeStatus ? `Status: ${issue.status}` : ''}"`;
        break;
      case 'Nextdoor':
        msg = `Posted to neighborhood Nextdoor feed. Citizen awareness level boosted!`;
        break;
      case 'X (Twitter)':
        msg = `Drafted tweet: "#CivicResolve alert regarding ${issue.title}. Check details: ${simulatedUrl.substring(0, 30)}..."`;
        break;
      case 'Community Forum':
        msg = `Published to municipal bulletin board. Community response queue notified!`;
        break;
      default:
        msg = `Shared successfully via simulated deep-link!`;
    }

    setShareSuccessMessage(msg);
    setTimeout(() => {
      setShareSuccessMessage('');
      setSelectedPlatform(null);
    }, 5000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-[160]"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Share2 className="h-4.5 w-4.5 text-sky-400" />
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider font-mono">Generate Citizen Share Link</h3>
                <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">Deep-link publishing workflow</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              aria-label="Close share window"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Issue summary preview card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-100 rounded-bl-full flex items-center justify-center translate-x-3 -translate-y-3 opacity-40">
                <ShieldCheck className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  issue.urgency === 'critical' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : issue.urgency === 'high'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}>
                  {issue.urgency}
                </span>
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                  Sect: {issue.sector}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 pr-10">{issue.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {issue.description}
              </p>
            </div>

            {/* Configure Deep-link Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex justify-between items-center">
                  <span>Simulated Link Lifespan</span>
                  <span className="text-sky-600 font-mono flex items-center gap-1 normal-case font-bold">
                    <Clock className="h-3 w-3" /> Expires in {expiryHours}h
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '1 Hour', value: '1' },
                    { label: '24 Hours', value: '24' },
                    { label: '7 Days', value: '168' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setExpiryHours(opt.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-extrabold text-center border transition-all cursor-pointer ${
                        expiryHours === opt.value
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Share customization switches */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col gap-2.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">
                  Payload Settings
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-none">Include status tags</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Appends current resolution status</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeStatus}
                    onChange={(e) => setIncludeStatus(e.target.checked)}
                    className="h-4 w-4 text-sky-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-none">Embed geolocation specs</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Embeds sector maps positioning</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeLocation}
                    onChange={(e) => setIncludeLocation(e.target.checked)}
                    className="h-4 w-4 text-sky-500 border-slate-300 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Generated Deep-Link URL and Copy Button */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Generated Citizen URL
              </label>
              <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                <div className="flex-1 overflow-x-auto whitespace-nowrap text-[10px] font-mono text-slate-600 px-2 select-all scrollbar-none py-1">
                  {simulatedUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[9px] text-slate-400 leading-none mt-1 font-mono">
                * Real, functional deep-link parameter is copied to your physical clipboard.
              </p>
            </div>

            {/* Simulated social share platforms */}
            <div className="space-y-2 pt-2 border-t border-slate-150">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Direct Citizen Dispatch Channels
              </span>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Nextdoor', icon: <Users className="h-4 w-4 text-emerald-600" />, bg: 'hover:bg-emerald-50 hover:border-emerald-200' },
                  { name: 'WhatsApp', icon: <MessageSquare className="h-4 w-4 text-green-600" />, bg: 'hover:bg-green-50 hover:border-green-200' },
                  { name: 'X (Twitter)', icon: <Globe className="h-4 w-4 text-slate-850" />, bg: 'hover:bg-slate-50 hover:border-slate-300' },
                  { name: 'Community Forum', icon: <Share2 className="h-4 w-4 text-indigo-600" />, bg: 'hover:bg-indigo-50 hover:border-indigo-200' },
                ].map(platform => (
                  <button
                    key={platform.name}
                    disabled={!!shareSuccessMessage}
                    onClick={() => handlePlatformShare(platform.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer bg-white ${platform.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-50 mb-1">
                      {platform.icon}
                    </div>
                    <span className="text-[9px] font-bold text-slate-750 text-center leading-none">
                      {platform.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Dynamic feedback dispatch alert message */}
              <AnimatePresence>
                {shareSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-2.5 bg-sky-50 border border-sky-100 text-sky-700 rounded-xl text-[10px] font-bold font-mono flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping shrink-0" />
                    <span>{shareSuccessMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
