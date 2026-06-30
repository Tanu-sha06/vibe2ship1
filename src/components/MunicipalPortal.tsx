import React, { useState } from 'react';
import { Issue, Ticket } from '../types';
import { 
  Shield, 
  Sparkles, 
  Send, 
  CheckCircle, 
  HardHat, 
  FileText, 
  Users, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Check,
  Target,
  Cpu,
  Skull,
  Layers,
  Square,
  CheckSquare,
  RefreshCw,
  Trophy
} from 'lucide-react';

interface MunicipalPortalProps {
  issues: Issue[];
  tickets: Ticket[];
  onUpdateStatus: (id: string, data: {
    status: 'reported' | 'investigating' | 'in_progress' | 'resolved';
    officialNotes?: string;
    updaterName?: string;
    crewName?: string;
  }) => Promise<any>;
  onAddComment: (ticketId: string, message: string, sender: 'authority' | 'citizen') => void;
  isAccessibilityMode: boolean;
  onRephraseMemo?: (ticketId: string, vibe: string) => Promise<any>;
  user: { name: string; email: string; role?: 'citizen' | 'official' } | null;
}

interface ParsedMemo {
  id?: string;
  issuedBy?: string;
  targetUnit?: string;
  priorityLevel?: string;
  situation?: string;
  directives: string[];
}

const parseDispatchMemo = (memo: string): ParsedMemo => {
  if (!memo) return { directives: [] };
  const lines = memo.split('\n');
  const result: ParsedMemo = { directives: [] };
  let readingDirectives = false;
  const situationLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for divider lines
    if (trimmed.startsWith('==') || trimmed.startsWith('--')) {
      continue;
    }

    // Try parsing colon key-value pairs
    if (trimmed.includes(':')) {
      const firstColonIdx = trimmed.indexOf(':');
      const key = trimmed.substring(0, firstColonIdx).trim().toUpperCase();
      const val = trimmed.substring(firstColonIdx + 1).trim();

      if (key.includes('DISPATCH ID') || key.includes('ORDER NUMBER') || key.includes('MISSION CODE') || key.includes('SHIP LOG')) {
        result.id = val;
        continue;
      }
      if (key.includes('ISSUED BY') || key.includes('SENSORS ACTIVE')) {
        result.issuedBy = val;
        continue;
      }
      if (key.includes('TARGET UNIT') || key.includes('TARGET DEPT') || key.includes('SUBNET DISPATCHED') || key.includes('DESPATCHED TO') || key.includes('COMMANDER')) {
        result.targetUnit = val;
        continue;
      }
      if (key.includes('PRIORITY LEVEL') || key.includes('ALERT LEVEL') || key.includes('PRIORITY')) {
        result.priorityLevel = val;
        continue;
      }
    }

    // Check if we entered directives section
    const upperLine = trimmed.toUpperCase();
    if (
      upperLine.startsWith('DIRECTIVE') || 
      upperLine.startsWith('SUB-ROUTINES') || 
      upperLine.startsWith('MANDATED ADMINISTRATIVE DIRECTIVES') || 
      upperLine.startsWith('DECK INSTRUCTIONS')
    ) {
      readingDirectives = true;
      continue;
    }

    // If reading directives, look for numbered items
    if (readingDirectives) {
      const directiveMatch = trimmed.match(/^\d+[\.\)\-]\s*(.*)$/);
      if (directiveMatch) {
        result.directives.push(directiveMatch[1]);
        continue;
      }
    }

    // Otherwise, this is part of situation narrative unless it's the top header
    if (
      !trimmed.includes('OFFICIAL MUNICIPAL') && 
      !trimmed.includes('TACTICAL BRIEFING') && 
      !trimmed.includes('NEO-METROPOLIS') && 
      !trimmed.includes("CAPTAIN'S LOG")
    ) {
      situationLines.push(trimmed);
    }
  }

  // Combine situation lines and clean directives
  result.situation = situationLines.join(' ');
  
  // Clean fallback if no directives parsed
  if (result.directives.length === 0) {
    for (const line of lines) {
      const match = line.trim().match(/^\d+[\.\)\-]\s*(.*)$/);
      if (match) {
        result.directives.push(match[1]);
      }
    }
  }

  return result;
};

export default function MunicipalPortal({
  issues,
  tickets,
  onUpdateStatus,
  onAddComment,
  isAccessibilityMode,
  onRephraseMemo,
  user
}: MunicipalPortalProps) {
  const isOfficial = user?.role === 'official';
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [statusChange, setStatusChange] = useState<string>('investigating');
  const [officialNotes, setOfficialNotes] = useState('');
  const [assignedCrew, setAssignedCrew] = useState('');
  const [updaterName, setUpdaterName] = useState(user?.role === 'official' ? user.name : 'Resident Citizen');
  
  // Keep updaterName state synced when user changes
  React.useEffect(() => {
    setUpdaterName(user?.role === 'official' ? user.name : 'Resident Citizen');
    // Citizens default to sending messages as citizens
    setMsgSender(user?.role === 'official' ? 'authority' : 'citizen');
  }, [user]);

  // Custom interactive directives checklist states
  const [completedDirectives, setCompletedDirectives] = useState<{[key: string]: boolean}>(() => {
    try {
      const saved = localStorage.getItem('civic_completed_directives');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeVibe, setActiveVibe] = useState<string>('standard');
  const [isRephrasing, setIsRephrasing] = useState<boolean>(false);

  // New conversation input
  const [messageInput, setMessageInput] = useState('');
  const [msgSender, setMsgSender] = useState<'citizen' | 'authority'>('authority');

  const activeTicket = tickets.find(t => t.id === selectedTicketId);
  const activeIssue = activeTicket ? issues.find(i => i.id === activeTicket.issueId) : null;

  const handleVibeChange = async (vibe: string) => {
    if (!onRephraseMemo || isRephrasing || !activeTicket) return;
    setIsRephrasing(true);
    setActiveVibe(vibe);
    try {
      await onRephraseMemo(activeTicket.id, vibe);
    } catch (e) {
      console.error('Rephrasing tone failed:', e);
    } finally {
      setIsRephrasing(false);
    }
  };

  const toggleDirective = (ticketId: string, idx: number) => {
    const key = `${ticketId}-${idx}`;
    setCompletedDirectives(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('civic_completed_directives', JSON.stringify(updated));
      return updated;
    });
  };

  const getVibeStyles = (vibe: string) => {
    switch (vibe) {
      case 'tactical':
        return {
          cardBg: 'bg-slate-950 text-slate-100 font-mono border-2 border-red-500/40 shadow-lg shadow-red-500/5',
          headerBg: 'bg-red-950/40 border-b border-red-500/20 text-red-400',
          title: 'TACTICAL EMERGENCY WORK ORDER',
          badgeStyle: 'bg-red-500/15 border border-red-500/30 text-red-400 font-black text-[10px]',
          checkboxStyle: 'text-red-500 border-red-500 focus:ring-red-500 bg-slate-900',
          icon: <Target className="h-5 w-5 text-red-500 animate-pulse" />,
          listIconStyle: 'text-red-400',
          textColor: 'text-slate-300',
          accentColor: 'text-red-400',
          metaLabel: 'text-red-500/60 font-semibold',
          subCard: 'bg-red-950/10 border border-red-500/20'
        };
      case 'cyberpunk':
        return {
          cardBg: 'bg-slate-900 text-cyan-100 font-mono border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10',
          headerBg: 'bg-cyan-950/40 border-b border-cyan-500/20 text-cyan-400',
          title: 'CYBERNETIC SUB-GRID DISPATCH',
          badgeStyle: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-black text-[10px]',
          checkboxStyle: 'text-cyan-400 border-cyan-400 focus:ring-cyan-500 bg-slate-800',
          icon: <Cpu className="h-5 w-5 text-cyan-400" />,
          listIconStyle: 'text-cyan-400',
          textColor: 'text-cyan-200/80',
          accentColor: 'text-cyan-400',
          metaLabel: 'text-cyan-500/60 font-semibold',
          subCard: 'bg-cyan-950/10 border border-cyan-500/20'
        };
      case 'bureaucratic':
        return {
          cardBg: 'bg-amber-50/40 text-slate-800 font-serif border-2 border-amber-300 shadow-sm',
          headerBg: 'bg-amber-100/40 border-b border-amber-200 text-amber-950',
          title: 'OFFICIAL RECORD & DESPATCH ORDER',
          badgeStyle: 'bg-amber-100 border border-amber-200 text-amber-900 font-serif font-bold text-[10px]',
          checkboxStyle: 'text-amber-800 border-amber-400 focus:ring-amber-800 bg-amber-50/50',
          icon: <Layers className="h-5 w-5 text-amber-800" />,
          listIconStyle: 'text-amber-800',
          textColor: 'text-slate-700 font-serif',
          accentColor: 'text-amber-900',
          metaLabel: 'text-amber-800/60 font-semibold',
          subCard: 'bg-amber-50 border border-amber-200'
        };
      case 'pirate':
        return {
          cardBg: 'bg-yellow-50/35 text-slate-900 font-sans border-2 border-dashed border-yellow-600/40 shadow-md',
          headerBg: 'bg-yellow-100/30 border-b border-yellow-600/25 text-yellow-950 font-extrabold',
          title: "CAP'N MILLER'S SHORE DECK ORDERS",
          badgeStyle: 'bg-yellow-500/10 border border-yellow-600/25 text-yellow-900 font-semibold text-[10px]',
          checkboxStyle: 'text-yellow-800 border-yellow-600 focus:ring-yellow-800 bg-yellow-50',
          icon: <Skull className="h-5 w-5 text-yellow-950" />,
          listIconStyle: 'text-yellow-800',
          textColor: 'text-slate-800 font-semibold',
          accentColor: 'text-yellow-950',
          metaLabel: 'text-yellow-900/60 font-semibold',
          subCard: 'bg-yellow-100/10 border border-yellow-500/15'
        };
      default:
        return {
          cardBg: 'bg-white text-slate-800 font-sans border border-slate-200 shadow-sm',
          headerBg: 'bg-slate-50 border-b border-slate-150 text-slate-700',
          title: 'AI-AUTOMATED DISPATCH WORK ORDER',
          badgeStyle: 'bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px]',
          checkboxStyle: 'text-sky-600 border-slate-300 focus:ring-sky-500 bg-white',
          icon: <FileText className="h-5 w-5 text-sky-600" />,
          listIconStyle: 'text-sky-600',
          textColor: 'text-slate-600',
          accentColor: 'text-slate-900',
          metaLabel: 'text-slate-400 uppercase font-mono',
          subCard: 'bg-slate-50 border border-slate-150'
        };
    }
  };

  // Sort tickets by calculated priority score
  const sortedTickets = [...tickets].sort((a, b) => b.priorityScore - a.priorityScore);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !activeIssue) return;

    try {
      await onUpdateStatus(activeIssue.id, {
        status: statusChange as any,
        officialNotes: officialNotes ? `${updaterName}: ${officialNotes}` : undefined,
        updaterName,
        crewName: assignedCrew || undefined
      });
      setOfficialNotes('');
      setAssignedCrew('');
      alert('Official Dispatch Status and Logs updated successfully.');
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeTicket) return;
    onAddComment(activeTicket.id, messageInput, msgSender);
    setMessageInput('');
  };

  const getPriorityTheme = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="municipal-portal-root">
      {/* Left Column: Tickets Queue list sorted by Urgency Priority score */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-sky-600" />
            Automated Ticketing Priority Queue
          </h3>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Sorted strictly by computed risk score: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px] text-slate-700">Urgency Multiplier * 15 + Upvotes * 2</span>
          </p>

          <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-1">
            {sortedTickets.map(ticket => {
              const issue = issues.find(i => i.id === ticket.issueId);
              const isSelected = ticket.id === selectedTicketId;
              if (!issue) return null;

              return (
                <button
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicketId(ticket.id);
                    setStatusChange(issue.status);
                  }}
                  id={`ticket-queue-btn-${ticket.id}`}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                    isSelected 
                      ? 'bg-slate-900 border-slate-900 text-white shadow' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-[10px] font-mono leading-none ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      TICKET {ticket.id} • {issue.category.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className={`font-bold mt-1.5 truncate ${isAccessibilityMode ? 'text-base' : 'text-xs'}`}>
                      {issue.title}
                    </p>
                    <p className={`text-[10px] mt-1 ${isSelected ? 'text-sky-300' : 'text-slate-500'}`}>
                      Status: {issue.status.toUpperCase()}
                    </p>
                  </div>
                  
                  {/* Priority Badge */}
                  <span className={`text-[10px] font-mono font-black h-8 w-8 shrink-0 rounded flex items-center justify-center border ${
                    isSelected 
                      ? 'bg-slate-800 border-slate-700 text-sky-300' 
                      : getPriorityTheme(ticket.priorityScore)
                  }`}>
                    {ticket.priorityScore}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Active Ticket Official Sheet & Actions */}
      <div className="lg:col-span-8">
        {!isOfficial && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3 shadow-xs">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-amber-800">Resident Citizen Mode (Read-Only Portal Access)</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                You are currently viewing active municipal dispatch schedules with Citizen clearances. To modify repair statuses, reassign crews, or authorize milestones, please sign in with an <strong>Official Municipal</strong> clearance account.
              </p>
            </div>
          </div>
        )}
        {activeTicket && activeIssue ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden flex flex-col" id="official-ticket-sheet">
            {/* Sealed official header banner */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 font-mono">
                  METROPOLITAN INFRASTRUCTURE DISPATCH OFFICE
                </span>
                <h3 className="text-lg font-black tracking-tight mt-0.5">Municipal Service Ticket #{activeTicket.id}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Priority:</span>
                <span className="bg-red-500/15 border border-red-500/30 text-red-400 font-black font-mono text-sm px-2.5 py-0.5 rounded">
                  {activeTicket.priorityScore} (High Alert)
                </span>
              </div>
            </div>

            {/* Tone Selector & Control Bar */}
            <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Dispatch Vibe Tone (AI-Powered)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'standard', name: 'Standard', icon: <FileText className="h-3 w-3" /> },
                  { id: 'tactical', name: 'Tactical Elite', icon: <Target className="h-3 w-3" /> },
                  { id: 'cyberpunk', name: 'Cyberpunk Drone', icon: <Cpu className="h-3 w-3" /> },
                  { id: 'bureaucratic', name: 'Bureaucracy', icon: <Layers className="h-3 w-3" /> },
                  { id: 'pirate', name: 'Pirate Captain', icon: <Skull className="h-3 w-3" /> }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => isOfficial && handleVibeChange(v.id)}
                    disabled={isRephrasing || !isOfficial}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      activeVibe === v.id
                        ? 'bg-slate-950 border-slate-950 text-white shadow-sm font-black scale-105'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    } ${!isOfficial ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isRephrasing && activeVibe === v.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
                    ) : (
                      v.icon
                    )}
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Memo Clipboard */}
            {(() => {
              const styles = getVibeStyles(activeVibe);
              const parsed = parseDispatchMemo(activeTicket.dispatchMemo || '');
              const totalTasks = parsed.directives.length;
              const completedTasksCount = parsed.directives.filter((_, idx) => completedDirectives[`${activeTicket.id}-${idx}`]).length;
              const isAllTasksCompleted = totalTasks > 0 && completedTasksCount === totalTasks;

              return (
                <div className={`p-6 border-b border-slate-200 transition-all duration-300 ${styles.cardBg}`}>
                  {/* Internal Blueprint/Sheet Layout */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                      {styles.icon}
                      <div>
                        <h4 className="font-extrabold tracking-tight text-sm uppercase">
                          {styles.title}
                        </h4>
                        <p className="text-[10px] opacity-70 uppercase font-mono mt-0.5">
                          CivicResolve AI Automated Routing Engine
                        </p>
                      </div>
                    </div>
                    {parsed.id && (
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-black tracking-wider ${styles.badgeStyle}`}>
                        ID: {parsed.id}
                      </span>
                    )}
                  </div>

                  {/* Situation assessment summary */}
                  {parsed.situation && (
                    <div className={`p-4 rounded-lg mb-4 text-xs leading-relaxed ${styles.textColor} border border-black/5 bg-black/5`}>
                      <span className="font-extrabold block text-[10px] uppercase tracking-wider mb-1 opacity-75">
                        Situation Assessment / Briefing:
                      </span>
                      {parsed.situation}
                    </div>
                  )}

                  {/* Interactive checklist of Crew Directives */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2.5 border-b border-black/5 pb-1.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wide opacity-80">
                        Crew Directives & Action Checklist
                      </span>
                      {totalTasks > 0 && (
                        <span className="text-[10px] font-bold font-mono bg-black/5 px-2 py-0.5 rounded-full">
                          Tasks: {completedTasksCount}/{totalTasks} ({Math.round((completedTasksCount / totalTasks) * 100)}%)
                        </span>
                      )}
                    </div>

                    {totalTasks > 0 ? (
                      <div className="space-y-2">
                        {parsed.directives.map((dir, idx) => {
                          const isDone = completedDirectives[`${activeTicket.id}-${idx}`];
                          return (
                            <button
                              key={idx}
                              onClick={() => isOfficial && toggleDirective(activeTicket.id, idx)}
                              disabled={!isOfficial}
                              className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                                isDone 
                                  ? 'bg-emerald-500/10 border-emerald-500/25 line-through text-slate-500' 
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                              } ${!isOfficial ? 'cursor-not-allowed opacity-85' : 'cursor-pointer'}`}
                            >
                              <div className="mt-0.5">
                                {isDone ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400 hover:text-slate-600 shrink-0" />
                                )}
                              </div>
                              <span className={`text-xs ${isDone ? 'text-slate-400 dark:text-slate-500' : styles.textColor}`}>
                                {dir}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-lg text-center text-xs opacity-75">
                        No sub-directives defined. Rely on standard municipal procedures.
                      </div>
                    )}

                    {/* All Checked Out visual effect */}
                    {isAllTasksCompleted && (
                      <div className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse">
                        <div className="flex items-center gap-2.5">
                          <Trophy className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-xs font-black text-emerald-600">MISSION OBJECTIVES SECURED!</p>
                            <p className="text-[10px] text-slate-500">Crews verified all active dispatch directives resolved.</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!isOfficial) return;
                            setStatusChange('resolved');
                            setOfficialNotes('All directives successfully completed on-site by responding units. Resolving order.');
                            await onUpdateStatus(activeIssue.id, {
                              status: 'resolved',
                              officialNotes: 'All dispatched directives successfully completed on-site by responding units. Threat neutralized.',
                              updaterName: updaterName,
                              crewName: activeTicket.assignedCrew
                            });
                          }}
                          disabled={!isOfficial}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                          <Check className="h-3 w-3" />
                          <span>Close Work Order & Claim +20 XP</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Standard metadata fields */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-black/5 text-[11px]">
                    <div>
                      <span className={`block opacity-60 text-[9px] uppercase font-mono ${styles.metaLabel}`}>Target Crew</span>
                      <span className={`font-bold block mt-0.5 ${styles.accentColor}`}>{activeTicket.assignedCrew}</span>
                    </div>
                    <div>
                      <span className={`block opacity-60 text-[9px] uppercase font-mono ${styles.metaLabel}`}>Department</span>
                      <span className={`font-bold block mt-0.5 ${styles.accentColor}`}>{activeTicket.department}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className={`block opacity-60 text-[9px] uppercase font-mono ${styles.metaLabel}`}>Resolution Deadline</span>
                      <span className="font-bold text-slate-700 block mt-0.5">
                        {new Date(activeTicket.targetResolutionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Simulated Authority Actions Portal Panel */}
            <div className="p-6 border-b border-slate-150">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-4">
                <HardHat className="h-4 w-4 text-amber-500" />
                Municipal Authority & Crew Action Panel
              </h4>

              <form onSubmit={handleUpdateStatusSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Update Dispatch Status
                    </label>
                    <select
                      value={statusChange}
                      onChange={(e) => setStatusChange(e.target.value)}
                      disabled={!isOfficial}
                      id="sim-status-select"
                      className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-700 font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="reported">Reported (Assigned)</option>
                      <option value="investigating">Investigating (Auditing onsite)</option>
                      <option value="in_progress">In Progress (Crews active)</option>
                      <option value="resolved">Resolved (Remediation Complete)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Assign Work Crew
                    </label>
                    <input
                      type="text"
                      placeholder={isOfficial ? "e.g. Sanitation S-4, Hydraulics C-12..." : "Read-only"}
                      value={assignedCrew}
                      onChange={(e) => setAssignedCrew(e.target.value)}
                      disabled={!isOfficial}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Authorized Signature
                    </label>
                    <input
                      type="text"
                      value={updaterName}
                      onChange={(e) => setUpdaterName(e.target.value)}
                      disabled={!isOfficial}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                      Official Resolution Notes / Action Logs
                    </label>
                    <textarea
                      placeholder={isOfficial ? "Input concrete actions taken, repair metrics, safety clearances..." : "Read-only"}
                      value={officialNotes}
                      onChange={(e) => setOfficialNotes(e.target.value)}
                      disabled={!isOfficial}
                      rows={2}
                      className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!isOfficial}
                    id="submit-dispatch-update"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2 px-6 rounded-lg shadow-md flex items-center gap-1.5 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    Commit Dispatch Work Order Update
                  </button>
                </div>
              </form>
            </div>

            {/* Seamless Communication Log with citizens */}
            <div className="p-6 bg-slate-50">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-3">
                <Users className="h-4 w-4 text-sky-500" />
                Citizen-Municipal Communication Log
              </h4>

              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
                {activeTicket.responseLog.map((log, idx) => {
                  const isAuthority = log.sender === 'authority';
                  const isSystem = log.sender === 'system';

                  return (
                    <div 
                      key={idx}
                      className={`p-2 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                        isSystem 
                          ? 'bg-slate-100 text-slate-500 font-mono text-[10px] mx-auto text-center' 
                          : isAuthority 
                            ? 'bg-sky-50 border border-sky-100 text-sky-950 ml-auto'
                            : 'bg-emerald-50 border border-emerald-100 text-emerald-950 mr-auto'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 justify-between font-bold text-[10px] mb-0.5">
                        <span className={isAuthority ? 'text-sky-800' : 'text-emerald-800'}>
                          {isSystem ? 'SYSTEM EVENT' : isAuthority ? 'MUNICIPAL OPERATIONS' : 'RESIDENT LOG'}
                        </span>
                        <span className="text-slate-400 font-normal font-mono text-[9px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-medium">{log.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Chat Send */}
              <div className="flex gap-2">
                {/* Simulated Sender Toggle */}
                {isOfficial ? (
                  <select
                    value={msgSender}
                    onChange={(e) => setMsgSender(e.target.value as any)}
                    className="text-xs border border-slate-200 bg-white rounded-lg px-2 text-slate-700 font-semibold cursor-pointer"
                  >
                    <option value="citizen">Send as Citizen</option>
                    <option value="authority">Send as Authority</option>
                  </select>
                ) : (
                  <div className="text-xs border border-slate-200 bg-slate-100 rounded-lg px-3 py-2 text-slate-500 font-bold flex items-center select-none">
                    Send as Citizen
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Post an update or question regarding the work schedule..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  id="chat-input"
                  className="flex-1 text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />

                <button
                  onClick={handleSendMessage}
                  id="send-message-btn"
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold p-2.5 rounded-lg transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm flex flex-col justify-center items-center gap-3">
            <AlertCircle className="h-8 w-8 text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-800">No Tickets Loaded</p>
              <p className="text-xs text-slate-400 mt-1">There are currently no active automated maintenance requests.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
