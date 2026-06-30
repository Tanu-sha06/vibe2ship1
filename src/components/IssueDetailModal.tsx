import React, { useState } from 'react';
import { Issue, Ticket } from '../types';
import { X, Calendar, MapPin, Users, CheckCircle2, Clock, ShieldAlert, Sparkles, AlertTriangle, Droplets, Flame, Trash2, Lightbulb, HardHat, MessageSquare, Send, Share2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface IssueDetailModalProps {
  issue: Issue;
  tickets: Ticket[];
  onClose: () => void;
  onVote: (id: string) => void;
  onShare: (issue: Issue) => void;
  onAddComment: (ticketId: string, message: string, sender: 'authority' | 'citizen') => void;
  isAccessibilityMode: boolean;
}

export default function IssueDetailModal({
  issue,
  tickets,
  onClose,
  onVote,
  onShare,
  onAddComment,
  isAccessibilityMode
}: IssueDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const associatedTicket = tickets.find(t => t.issueId === issue.id);

  // Status index helper for timeline visualization
  const statusLevels = ['reported', 'investigating', 'in_progress', 'resolved'];
  const activeIndex = statusLevels.indexOf(issue.status);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water_leakage': return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'pothole': return <Flame className="h-5 w-5 text-amber-600" />;
      case 'streetlight': return <Lightbulb className="h-5 w-5 text-purple-500" />;
      case 'waste_management': return <Trash2 className="h-5 w-5 text-green-500" />;
      case 'infrastructure': return <HardHat className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !associatedTicket) return;
    onAddComment(associatedTicket.id, commentText, 'citizen');
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="detail-modal-root">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-4 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center">
              {getCategoryIcon(issue.category)}
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                COMMUNITY TICKET • {issue.category.replace('_', ' ')}
              </p>
              <h3 className="text-sm sm:text-base font-black truncate max-w-md">{issue.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip content="Share or publish deep-link" position="left">
              <button 
                onClick={() => onShare(issue)}
                aria-label="Share or publish deep-link"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </Tooltip>

            <Tooltip content="Close details modal" position="left">
              <button 
                onClick={onClose}
                id="close-modal-btn"
                aria-label="Close details modal"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* Real-time Progressive Resolution Tracker Status bar */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono mb-3">
              REAL-TIME DISPATCH MILESTONE PROGRESSION
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
              {statusLevels.map((lvl, idx) => {
                const isCompleted = idx <= activeIndex;
                const isActive = idx === activeIndex;
                
                return (
                  <div key={lvl} className="flex flex-col items-center gap-1.5 relative z-10">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border transition-all ${
                      isActive 
                        ? 'bg-sky-500 border-sky-400 text-slate-950 scale-110 shadow-md shadow-sky-500/20' 
                        : isCompleted
                          ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-tight ${
                      isActive ? 'text-sky-600 font-black' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      {lvl.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
              {/* Connecting line backgrounds */}
              <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-slate-100 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${(activeIndex / (statusLevels.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Details & Photo Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description Text & Coords */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  Description of Issue
                </span>
                <p className={`text-slate-700 leading-relaxed mt-1 font-medium ${isAccessibilityMode ? 'text-base' : 'text-xs'}`}>
                  {issue.description}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Report Geolocation Details</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 font-bold mt-1">
                  <div>
                    <span className="text-[9px] text-slate-400 block">LATITUDE</span>
                    <span>{issue.latitude.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">LONGITUDE</span>
                    <span>{issue.longitude.toFixed(5)}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-[9px] text-slate-400 block">MUNICIPAL ZONE</span>
                    <span className="text-emerald-700 font-sans">{issue.sector}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Preview & Quick Verification */}
            <div className="flex flex-col gap-4">
              {issue.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                  <img 
                    src={issue.imageUrl} 
                    alt="Citizen Upload Proof" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 border border-slate-700 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                    EVIDENCE PROOF
                  </div>
                </div>
              )}

              {/* Verification card */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 font-mono">
                    Community Verification Engine
                  </span>
                  <span className="text-xs font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Score: {issue.verificationScore}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Has your neighborhood experienced this problem? Confirm to increase verification scores and push the ticket higher up the municipal priority queue.
                </p>
                
                <Tooltip content={issue.upvotedByUserIds.includes('local-sim') ? 'Withdraw your verification vote' : 'Verify incident authenticity'} position="top">
                  <button
                    onClick={() => onVote(issue.id)}
                    id={`verify-btn-modal-${issue.id}`}
                    aria-label={issue.upvotedByUserIds.includes('local-sim') ? 'Withdraw verification vote' : 'Verify incident authenticity'}
                    className={`w-full py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      issue.upvotedByUserIds.includes('local-sim')
                        ? 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300'
                        : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{issue.upvotedByUserIds.includes('local-sim') ? 'Verified ✓' : 'Verify Incident Credibility'}</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* AI Safety Advice / Self-Help Panel */}
          {issue.timeline.length > 1 && (
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex gap-3">
              <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-sky-100">
                <Sparkles className="h-4 w-4 text-sky-600 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider font-mono">
                  Gemini AI: Resident Safety Self-Help Advice
                </h4>
                <p className="text-xs text-sky-900 leading-relaxed mt-1 font-medium">
                  {issue.timeline.find(t => t.title.includes('Safety Action'))?.description.replace('Resident Alert: ', '') || 
                   'Please avoid parking near or walking close to the hazard until official road signs are positioned.'}
                </p>
              </div>
            </div>
          )}

          {/* Incident Timeline / Audit Log trail */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono mb-3">
              INCIDENT HISTORICAL AUDIT TRAIL
            </p>
            <div className="border-l border-slate-200 ml-2.5 pl-5 space-y-4">
              {issue.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline point bulb */}
                  <span className="absolute -left-[25.5px] top-1.5 h-3 w-3 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-100"></span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900">{item.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                      {item.description}
                    </p>
                    {item.updatedBy && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded mt-1 inline-block">
                        Signed: {item.updatedBy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration chat/communication logs on the ticket */}
          {associatedTicket && (
            <div className="border-t border-slate-100 pt-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono mb-3">
                CITIZEN RESOLUTION FEEDBACK CHAT
              </p>
              
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto mb-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                {associatedTicket.responseLog
                  .filter(l => l.sender !== 'system')
                  .map((log, idx) => {
                    const isAuthority = log.sender === 'authority';
                    return (
                      <div 
                        key={idx}
                        className={`p-2 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                          isAuthority 
                            ? 'bg-sky-50 border border-sky-100 text-sky-950 ml-auto'
                            : 'bg-emerald-50 border border-emerald-100 text-emerald-950 mr-auto'
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-between font-bold text-[9px] mb-0.5">
                          <span className={isAuthority ? 'text-sky-800 font-mono' : 'text-emerald-800'}>
                            {isAuthority ? 'MUNICIPAL OPERATIONS' : 'RESIDENT COLLABORATION'}
                          </span>
                          <span className="text-slate-400 font-normal font-mono text-[8px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="font-medium">{log.message}</p>
                      </div>
                    );
                  })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post coordinate updates, cleanup photos, or general questions..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  id="modal-comment-input"
                  className="flex-1 text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                />
                <Tooltip content="Post your feedback/update comment" position="left">
                  <button
                    onClick={handleSendComment}
                    id="modal-comment-send-btn"
                    aria-label="Post feedback comment"
                    className="bg-slate-900 text-white hover:bg-slate-800 font-bold p-2.5 rounded-lg shrink-0 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
