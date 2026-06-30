import React from 'react';
import { LeaderboardEntry } from '../types';
import { Award, Trophy, Users, Droplets, Leaf, Shield, CheckSquare, Target, Zap } from 'lucide-react';

interface GamificationPanelProps {
  leaderboard: LeaderboardEntry[];
  currentUser: { name: string; points: number; badge: string };
  isAccessibilityMode: boolean;
}

export default function GamificationPanel({
  leaderboard,
  currentUser,
  isAccessibilityMode
}: GamificationPanelProps) {
  return (
    <div className="flex flex-col gap-6" id="gamification-root">
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="community-impact-stats">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Droplets className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-mono">WATER CONSERVED</p>
            <p className="text-lg font-black text-emerald-950">142,500 Gallons</p>
            <p className="text-[10px] text-emerald-600 font-medium">From validated leaks patched early</p>
          </div>
        </div>

        <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
            <Leaf className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-[10px] text-sky-800 uppercase tracking-wider font-mono">CARBON CO2 SAVED</p>
            <p className="text-lg font-black text-sky-950">1,820 Metric Tons</p>
            <p className="text-[10px] text-sky-600 font-medium">Through localized waste cleanup</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-3 border border-slate-800">
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">ACTIVE CITIZENS</p>
            <p className="text-lg font-black text-sky-400">1,480 Residents</p>
            <p className="text-[10px] text-slate-500 font-medium">Reporting, validating & patching</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leaderboard list of top citizens */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="leaderboard-card">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Citizen Reputation Leaderboard
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-4">Rank</th>
                  <th className="p-3">Resident</th>
                  <th className="p-3">Rep Badge</th>
                  <th className="p-3 text-center">Reports</th>
                  <th className="p-3 text-center">Verifications</th>
                  <th className="p-3 text-right pr-4">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {leaderboard.map(user => {
                  const isCurrentUser = user.name === currentUser.name;
                  return (
                    <tr 
                      key={user.rank} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrentUser ? 'bg-amber-50/50 font-semibold' : ''
                      }`}
                      id={`leaderboard-row-rank-${user.rank}`}
                    >
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-1.5">
                          {user.rank <= 3 ? (
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              user.rank === 1 ? 'bg-amber-100 text-amber-700' :
                              user.rank === 2 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {user.rank}
                            </span>
                          ) : (
                            <span className="text-slate-400 pl-1.5">{user.rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {user.name} {isCurrentUser && <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded font-mono ml-1">YOU</span>}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.badgeColor}`}>
                          {user.badge}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">{user.reportsSubmitted}</td>
                      <td className="p-3 text-center font-mono text-slate-600">{user.verificationsCompleted}</td>
                      <td className="p-3 text-right pr-4 font-mono font-black text-slate-900">{user.points} pts</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Engagement guidelines & Quests */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Daily Quests */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-indigo-500" />
              Daily Active Citizen Quests
            </h3>
            
            <div className="flex flex-col gap-2.5 text-xs text-slate-600">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <input type="checkbox" defaultChecked className="mt-0.5 h-3.5 w-3.5 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">Verify a local leak or pothole</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">+5 Points • Daily Task</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">Pinpoint coordinates exactly on Map</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">+10 Points • Precision Bonus</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-800">Review official AI temporary self-help advice</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">+15 Points • Community Action</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification rules explanation */}
          <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Citizen Point Systems
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Your community reputations grow automatically as you participate in collaborative municipal reporting and verification:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 mt-3 font-medium">
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>File new infrastructure alert</span>
                <span className="text-emerald-400 font-bold font-mono">+10 Points</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Upvote/Verify existing ticket accuracy</span>
                <span className="text-sky-400 font-bold font-mono">+5 Points</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Confirm resolution with visual proof</span>
                <span className="text-indigo-400 font-bold font-mono">+20 Points</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
