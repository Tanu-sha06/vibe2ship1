import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Accessibility, 
  Award, 
  Menu, 
  X, 
  LayoutDashboard, 
  Map, 
  PlusCircle, 
  ShieldAlert, 
  Sparkles, 
  Trophy,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Database
} from 'lucide-react';

interface HeaderProps {
  currentUser: { name: string; points: number; badge: string };
  user: { name: string; email: string; picture?: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  isAccessibilityMode: boolean;
  setIsAccessibilityMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  pendingActionsCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

export default function Header({
  currentUser,
  user,
  onLogin,
  onLogout,
  isAccessibilityMode,
  setIsAccessibilityMode,
  activeTab,
  setActiveTab,
  isOnline,
  setIsOnline,
  pendingActionsCount,
  isSyncing,
  onSync
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Community Map', icon: Map },
    { id: 'report', label: 'Report Issue', icon: PlusCircle },
    { id: 'municipal', label: 'Municipal Portal', icon: ShieldAlert },
    { id: 'predictive', label: 'Predictive Insights', icon: Sparkles },
    { id: 'gamification', label: 'Reputation Board', icon: Trophy }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const userInitials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2);

  return (
    <>
      {/* =========================================================
          DESKTOP SIDEBAR VIEW (Always visible on lg screen)
          ========================================================= */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-100 flex-col shrink-0 border-r border-slate-800 h-full select-none" id="sidebar-root">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-500/25 shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-white block leading-none">CivicResolve</span>
            <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mt-1 block">Municipal Engine</span>
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 p-4 py-6 space-y-1.5 overflow-y-auto">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <IconComponent className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Panel - Accessibility, Sync, and User info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3">
          {/* Simulated Offline Toggle */}
          <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Connection Mode</span>
              <button
                onClick={() => setIsOnline(!isOnline)}
                id="toggle-simulated-network"
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                  isOnline 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
                title="Click to toggle simulated offline state"
              >
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 shrink-0" />
                    <span>ONLINE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 shrink-0 animate-pulse" />
                    <span>OFFLINE</span>
                  </>
                )}
              </button>
            </div>

            {/* Sync trigger button */}
            <button
              onClick={onSync}
              disabled={isSyncing || (!isOnline && pendingActionsCount > 0)}
              id="sync-sidebar-btn"
              className={`w-full flex items-center justify-between p-2 rounded text-[11px] font-bold font-mono transition-all border ${
                isSyncing
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-300 cursor-not-allowed'
                  : pendingActionsCount > 0
                    ? isOnline
                      ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className={`h-3 w-3 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Queue'}</span>
              </span>
              <span className={`px-1.5 py-0.2 text-[9px] rounded font-extrabold ${
                pendingActionsCount > 0 
                  ? 'bg-slate-950 text-amber-400' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {pendingActionsCount} pending
              </span>
            </button>
          </div>

          {/* Accessibility easy toggle inside sidebar */}
          <button
            id="accessibility-sidebar-btn"
            onClick={() => setIsAccessibilityMode(!isAccessibilityMode)}
            className={`w-full p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold border ${
              isAccessibilityMode 
                ? 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Accessibility className="h-4 w-4 shrink-0" />
            <span>{isAccessibilityMode ? 'Easy Mode: ON' : 'Easy Mode'}</span>
          </button>

          {/* User profile */}
          {user ? (
            <div className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-lg border border-slate-800/50">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-emerald-500 font-extrabold text-sm text-white shrink-0 shadow-inner">
                  {userInitials}
                </div>
              )}
              <div className="overflow-hidden text-left flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{user.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono font-bold truncate">
                    {currentUser.points} pts
                  </span>
                  <button onClick={onLogout} className="text-[10px] text-red-400 hover:text-red-300 underline font-semibold ml-2 cursor-pointer">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================
          MOBILE HEADER VIEW (Always visible on mobile/tablet)
          ========================================================= */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 h-16 flex items-center justify-between text-white shrink-0 z-30 sticky top-0 w-full" id="mobile-header-root">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-base text-white">CivicResolve</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick status button */}
          <button
            id="accessibility-mobile-btn"
            onClick={() => setIsAccessibilityMode(!isAccessibilityMode)}
            className={`p-2 rounded-lg transition-all ${
              isAccessibilityMode ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Accessibility className="h-4 w-4" />
          </button>

          {/* Hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-menu-toggle-btn"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Slide-out Panel Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Top info */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-white">CivicResolve</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 p-3 py-4 space-y-1">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`mobile-tab-${tab.id}`}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Connection & Sync */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold px-1">
                <span className="text-slate-400">Connection Mode</span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>
              <button
                onClick={() => {
                  onSync();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isSyncing || (!isOnline && pendingActionsCount > 0)}
                className={`w-full flex items-center justify-between p-2 rounded text-[10px] font-mono border ${
                  isSyncing
                    ? 'bg-blue-600/20 border-blue-500/30 text-blue-300'
                    : pendingActionsCount > 0
                      ? isOnline ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1">
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                </span>
                <span>{pendingActionsCount} pending</span>
              </button>
            </div>

            {/* Mobile User Profile */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/20">
              {user ? (
                <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-lg border border-slate-800/50">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-emerald-500 object-cover shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border border-emerald-500 font-extrabold text-xs text-white shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <div className="overflow-hidden text-left flex-1">
                    <p className="text-xs font-bold text-white truncate leading-none">{user.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.points} pts • Sentinel</p>
                      <button onClick={onLogout} className="text-[10px] text-red-400 hover:text-red-300 underline font-semibold ml-2 cursor-pointer">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
