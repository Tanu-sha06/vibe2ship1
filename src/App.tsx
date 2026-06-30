import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GeoMap from './components/GeoMap';
import ReportIssueForm from './components/ReportIssueForm';
import MunicipalPortal from './components/MunicipalPortal';
import PredictiveInsights from './components/PredictiveInsights';
import GamificationPanel from './components/GamificationPanel';
import IssueDetailModal from './components/IssueDetailModal';
import ShareModal from './components/ShareModal';
import AuthPage from './components/AuthPage';

import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { Issue, Ticket, LeaderboardEntry, PredictiveInsight } from './types';
import { INITIAL_ISSUES, INITIAL_TICKETS, INITIAL_LEADERBOARD, INITIAL_PREDICTIVE_INSIGHTS } from './utils/mockData';
import { Sparkles, Shield, Compass, Activity, Bell, Wifi, WifiOff, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export interface PendingAction {
  id: string;
  type: 'report' | 'vote' | 'status' | 'comment';
  payload: any;
  timestamp: string;
  description: string;
  emulatedIssueId?: string;
  emulatedTicketId?: string;
}

export default function App() {
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>(INITIAL_PREDICTIVE_INSIGHTS);
  
  // Countdown timer & Last Updated tracker for ongoing alert operations
  const [countdown, setCountdown] = useState<number>(534); // 8 minutes 54 seconds initially
  const [lastUpdatedSecs, setLastUpdatedSecs] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 600 : prev - 1));
      setLastUpdatedSecs(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // App navigation and view controllers
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAccessibilityMode, setIsAccessibilityMode] = useState<boolean>(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Share Modal State
  const [shareIssue, setShareIssue] = useState<Issue | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Parse deep-link URL parameter on load/when issues are loaded
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const issueIdParam = params.get('issueId');
    if (issueIdParam && issues.length > 0) {
      const matched = issues.find(i => i.id === issueIdParam);
      if (matched) {
        setSelectedIssue(matched);
        setActiveTab('dashboard'); // ensure we're viewing the dashboard
        // Clean up the URL search parameter without reloading the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [issues]);
  
  // Temporary coordinate buffer passed from Map click to Report Wizard
  const [draftCoords, setDraftCoords] = useState<{ lat: number; lng: number; sector: string } | null>(null);

  // Simulated Offline and Background Synchronization States
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const saved = localStorage.getItem('civic_is_online');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [pendingActions, setPendingActions] = useState<PendingAction[]>(() => {
    const saved = localStorage.getItem('civic_pending_actions');
    return saved !== null ? JSON.parse(saved) : [];
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Authenticated user state via Firebase Auth
  const [user, setUser] = useState<{
    name: string;
    email: string;
    picture?: string;
    role?: 'citizen' | 'official';
    points?: number;
  } | null>(() => {
    const saved = localStorage.getItem('civic_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    const saved = localStorage.getItem('civic_is_guest');
    return saved === 'true';
  });

  const userEmail = user?.email || (isGuest ? "guest@civicresolve.org" : "ptanusha2006@gmail.com");
  const userName = user?.name || (isGuest ? "Guest Citizen" : "Anusha P.");
  
  const [currentUserPoints, setCurrentUserPoints] = useState<number>(() => {
    return user?.points || (isGuest ? 0 : 120);
  });

  // Keep points synced when user or isGuest changes
  useEffect(() => {
    if (user) {
      setCurrentUserPoints(user.points || 120);
    } else {
      setCurrentUserPoints(isGuest ? 0 : 120);
    }
  }, [user, isGuest]);

  const handleAuthSuccess = (loggedUser: { name: string; email: string; role: 'citizen' | 'official'; points: number; picture?: string }) => {
    localStorage.setItem('civic_user', JSON.stringify(loggedUser));
    localStorage.setItem('civic_is_guest', 'false');
    setUser(loggedUser);
    setIsGuest(false);
  };

  const handleContinueAsGuest = () => {
    localStorage.setItem('civic_is_guest', 'true');
    setIsGuest(true);
  };

  const handleLoginTrigger = () => {
    localStorage.removeItem('civic_is_guest');
    setIsGuest(false);
  };

  const handleLoginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Retrieve or create profile document
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const profileData = userDoc.data();
          handleAuthSuccess({
            name: profileData.name || firebaseUser.displayName || 'Google User',
            email: firebaseUser.email || profileData.email || '',
            role: profileData.role || 'citizen',
            points: profileData.points || 120,
            picture: firebaseUser.photoURL || undefined
          });
        } else {
          const newProfile = {
            name: firebaseUser.displayName || 'Google User',
            email: firebaseUser.email || '',
            role: 'citizen' as const,
            points: 120,
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              ...newProfile
            });
          } catch (writeErr: any) {
            console.warn('Google sign-in profile creation in Firestore skipped due to permissions:', writeErr);
            handleFirestoreError(writeErr, OperationType.WRITE, 'users/' + firebaseUser.uid);
          }
          handleAuthSuccess({
            ...newProfile,
            picture: firebaseUser.photoURL || undefined
          });
        }
      } catch (readErr: any) {
        console.warn('Google sign-in profile fetch failed (using fallback session):', readErr);
        handleFirestoreError(readErr, OperationType.GET, 'users/' + firebaseUser.uid);
      }
    } catch (err) {
      console.error('Google login trigger failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase sign out failed:', err);
    }
    localStorage.removeItem('civic_user');
    localStorage.removeItem('civic_is_guest');
    setUser(null);
    setIsGuest(false);
  };

  // Real-time listener for Firebase Auth session state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const profileData = userDoc.data();
              const loggedUser = {
                name: profileData.name || firebaseUser.displayName || 'Resident Citizen',
                email: firebaseUser.email || profileData.email || '',
                role: profileData.role || 'citizen',
                points: profileData.points || 120,
                picture: firebaseUser.photoURL || undefined
              };
              setUser(loggedUser);
              localStorage.setItem('civic_user', JSON.stringify(loggedUser));
              localStorage.setItem('civic_is_guest', 'false');
              setIsGuest(false);
            } else {
              const fallbackProfile = {
                name: firebaseUser.displayName || 'Resident Citizen',
                email: firebaseUser.email || '',
                role: 'citizen' as const,
                points: 120
              };
              try {
                await setDoc(userDocRef, {
                  uid: firebaseUser.uid,
                  ...fallbackProfile,
                  createdAt: new Date().toISOString()
                });
              } catch (writeErr: any) {
                console.warn('Could not write fallback profile to Firestore:', writeErr);
                handleFirestoreError(writeErr, OperationType.WRITE, 'users/' + firebaseUser.uid);
              }
              setUser(fallbackProfile);
              localStorage.setItem('civic_user', JSON.stringify(fallbackProfile));
              localStorage.setItem('civic_is_guest', 'false');
              setIsGuest(false);
            }
          } catch (readErr: any) {
            console.warn('Firestore profile fetch failed in auth listener (using auth details fallback):', readErr);
            handleFirestoreError(readErr, OperationType.GET, 'users/' + firebaseUser.uid);
          }
        } catch (error) {
          console.error('Error in onAuthStateChanged user profile handler:', error);
        }
      } else {
        const savedIsGuest = localStorage.getItem('civic_is_guest') === 'true';
        if (!savedIsGuest) {
          setUser(null);
          localStorage.removeItem('civic_user');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist offline and pending state variables
  useEffect(() => {
    localStorage.setItem('civic_is_online', JSON.stringify(isOnline));
  }, [isOnline]);

  useEffect(() => {
    localStorage.setItem('civic_pending_actions', JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Load database arrays on mount from Express API
  useEffect(() => {
    async function fetchAllData() {
      try {
        const [resIssues, resTickets, resLeader, resPredictive] = await Promise.all([
          fetch('/api/issues'),
          fetch('/api/tickets'),
          fetch('/api/leaderboard'),
          fetch('/api/predictive-insights')
        ]);

        if (resIssues.ok) setIssues(await resIssues.json());
        if (resTickets.ok) setTickets(await resTickets.json());
        if (resLeader.ok) {
          const leaderData = await resLeader.json();
          setLeaderboard(leaderData);
          // Find if current user points exists on the board
          const activeMe = leaderData.find((u: any) => u.name.toLowerCase() === userName.toLowerCase());
          if (activeMe) {
            setCurrentUserPoints(activeMe.points);
          }
        }
        if (resPredictive.ok) setPredictiveInsights(await resPredictive.json());

        console.log('CivicResolve database synchronized with full stack server.');
        setLastUpdatedSecs(0);
      } catch (e) {
        console.warn('Backend server unreachable or booting. Emulating via client local-state pipeline.', e);
      }
    }
    fetchAllData();
  }, []);

  // Update current user points dynamically when the leaderboard updates
  useEffect(() => {
    const activeMe = leaderboard.find(u => u.name.toLowerCase() === userName.toLowerCase());
    if (activeMe) {
      setCurrentUserPoints(activeMe.points);
    }
  }, [leaderboard]);

  // Handle reporting a new issue (dispatched to backend API)
  const handleReportIssue = async (reportData: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    sector: string;
    imageUrl?: string;
    videoUrl?: string;
  }) => {
    try {
      if (!isOnline) {
        throw new Error('Offline mode active - routing to local state queue');
      }

      const payload = {
        ...reportData,
        reportedBy: {
          name: userName,
          email: userEmail,
          points: currentUserPoints
        }
      };

      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state with live server response
        setIssues(prev => [result.issue, ...prev]);
        setTickets(prev => [...prev, result.ticket]);
        
        // Re-fetch leaderboard to sync points
        const leaderboardRes = await fetch('/api/leaderboard');
        if (leaderboardRes.ok) {
          setLeaderboard(await leaderboardRes.json());
        } else {
          // Fallback points update client side
          setCurrentUserPoints(prev => prev + 10);
        }

        // Clear coordinate buffer
        setDraftCoords(null);
        return result;
      } else {
        throw new Error('Server classification returned error.');
      }
    } catch (e) {
      console.warn('Submission routed to client local emulation queue:', e);
      
      // Client-side local emulation fallback
      const mockIssueId = 'issue-em-' + Date.now();
      const mockTicketId = 't-em-' + Math.floor(100 + Math.random() * 900);
      
      const newEmulatedIssue: Issue = {
        id: mockIssueId,
        title: reportData.title,
        description: reportData.description,
        category: 'other',
        status: 'reported',
        urgency: 'medium',
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        sector: reportData.sector,
        upvotes: 0,
        upvotedByUserIds: [],
        imageUrl: reportData.imageUrl || 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=800&q=80',
        reportedBy: {
          name: userName,
          email: userEmail,
          points: currentUserPoints
        },
        createdAt: new Date().toISOString(),
        ticketId: mockTicketId,
        verificationScore: 10,
        verificationStatus: 'unverified',
        timeline: [
          {
            status: 'reported',
            title: 'Report Logged (Offline)',
            description: `Citizen ${userName} submitted a localized report. Queued for synchronization.`,
            timestamp: new Date().toISOString()
          },
          {
            status: 'reported',
            title: 'Safety Action Steps Generated',
            description: 'Resident Alert: Please exercise caution in the zone while dispatch crews schedule visits.',
            timestamp: new Date().toISOString()
          }
        ]
      };

      const newEmulatedTicket: Ticket = {
        id: mockTicketId,
        issueId: mockIssueId,
        department: 'Municipal Public Works',
        priorityScore: 30,
        targetResolutionDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        dispatchMemo: 'AUTOMATED DISPATCH MEMO EMULATOR...',
        responseLog: [
          {
            timestamp: new Date().toISOString(),
            message: 'Local offline fallback dispatch generated.',
            sender: 'system'
          }
        ]
      };

      // Queue the action
      const pendingReportAction: PendingAction = {
        id: 'action-' + Date.now(),
        type: 'report',
        payload: {
          title: reportData.title,
          description: reportData.description,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          sector: reportData.sector,
          imageUrl: reportData.imageUrl,
          videoUrl: reportData.videoUrl,
          reportedBy: {
            name: userName,
            email: userEmail,
            points: currentUserPoints
          }
        },
        timestamp: new Date().toISOString(),
        description: `Submit Issue: "${reportData.title}"`,
        emulatedIssueId: mockIssueId,
        emulatedTicketId: mockTicketId
      };

      setIssues(prev => [newEmulatedIssue, ...prev]);
      setTickets(prev => [...prev, newEmulatedTicket]);
      setCurrentUserPoints(prev => prev + 10);
      setPendingActions(prev => [...prev, pendingReportAction]);
      
      // Update leaderboard locally
      setLeaderboard(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(u => u.name === userName);
        if (idx >= 0) {
          copy[idx].points += 10;
          copy[idx].reportsSubmitted += 1;
        }
        return copy.sort((a,b) => b.points - a.points);
      });

      setDraftCoords(null);
    }
  };

  // Share an issue
  const handleShareIssue = (issue: Issue) => {
    setShareIssue(issue);
    setIsShareModalOpen(true);
  };

  // Upvote / Verify an issue
  const handleVoteIssue = async (id: string) => {
    try {
      if (!isOnline) {
        throw new Error('Offline mode active - queuing verification vote');
      }

      const response = await fetch(`/api/issues/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'anusha-sim-id', userName })
      });

      if (response.ok) {
        const result = await response.json();
        // Update local arrays with validated coordinates
        setIssues(prev => prev.map(issue => issue.id === id ? result.issue : issue));
        setTickets(prev => prev.map(ticket => ticket.issueId === id ? result.ticket : ticket));
        
        const leaderboardRes = await fetch('/api/leaderboard');
        if (leaderboardRes.ok) {
          setLeaderboard(await leaderboardRes.json());
        }
      } else {
        throw new Error('Vote API returned error');
      }
    } catch (e) {
      console.warn('Upvote redirected to local queue:', e);
      
      // Client-side fallback emulation
      setIssues(prev => prev.map(issue => {
        if (issue.id === id) {
          const alreadyVoted = issue.upvotedByUserIds.includes('anusha-sim-id');
          return {
            ...issue,
            upvotes: alreadyVoted ? issue.upvotes - 1 : issue.upvotes + 1,
            upvotedByUserIds: alreadyVoted 
              ? issue.upvotedByUserIds.filter(uid => uid !== 'anusha-sim-id')
              : [...issue.upvotedByUserIds, 'anusha-sim-id'],
            verificationScore: alreadyVoted ? issue.verificationScore - 10 : issue.verificationScore + 10
          };
        }
        return issue;
      }));

      // Queue the action
      const pendingVoteAction: PendingAction = {
        id: 'action-' + Date.now(),
        type: 'vote',
        payload: { id },
        timestamp: new Date().toISOString(),
        description: `Verify: Issue #${id}`
      };
      setPendingActions(prev => [...prev, pendingVoteAction]);

      setCurrentUserPoints(prev => prev + 5);
    }
  };

  // Update Status (dispatched by authorities)
  const handleUpdateStatus = async (issueId: string, statusData: {
    status: 'reported' | 'investigating' | 'in_progress' | 'resolved';
    officialNotes?: string;
    updaterName?: string;
    crewName?: string;
  }) => {
    try {
      if (!isOnline) {
        throw new Error('Offline mode active - queuing status update');
      }

      const response = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData)
      });

      if (response.ok) {
        const result = await response.json();
        setIssues(prev => prev.map(issue => issue.id === issueId ? result.issue : issue));
        setTickets(prev => prev.map(ticket => ticket.issueId === issueId ? result.ticket : ticket));
        
        // Also update active selected issue if open
        if (selectedIssue && selectedIssue.id === issueId) {
          setSelectedIssue(result.issue);
        }
        return result;
      } else {
        throw new Error('Status API returned error');
      }
    } catch (e) {
      console.warn('Status update redirected to local queue:', e);
      
      // Client-side local emulation
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status: statusData.status,
            timeline: [
              ...issue.timeline,
              {
                status: statusData.status,
                title: 'Status Updated (Offline Emulated)',
                description: statusData.officialNotes || `Operational status changed to ${statusData.status}.`,
                timestamp: new Date().toISOString(),
                updatedBy: statusData.updaterName || 'Municipal Authority'
              }
            ]
          };
        }
        return issue;
      }));

      setTickets(prev => prev.map(ticket => {
        if (ticket.issueId === issueId) {
          return {
            ...ticket,
            assignedCrew: statusData.crewName || ticket.assignedCrew,
            officialNotes: statusData.officialNotes || ticket.officialNotes,
            responseLog: [
              ...ticket.responseLog,
              {
                timestamp: new Date().toISOString(),
                message: `Status updated to ${statusData.status.toUpperCase()} by ${statusData.updaterName || 'Municipal Authority'}. Notes: ${statusData.officialNotes || 'None'}`,
                sender: 'authority'
              }
            ]
          };
        }
        return ticket;
      }));

      // Queue the action
      const pendingStatusAction: PendingAction = {
        id: 'action-' + Date.now(),
        type: 'status',
        payload: { issueId, statusData },
        timestamp: new Date().toISOString(),
        description: `Set Status: ${statusData.status} on Issue #${issueId}`
      };
      setPendingActions(prev => [...prev, pendingStatusAction]);
    }
  };

  // Dispatch official message logs comments
  const handleAddComment = async (ticketId: string, message: string, sender: 'authority' | 'citizen') => {
    try {
      if (!isOnline) {
        throw new Error('Offline mode active - queuing message log');
      }

      const response = await fetch(`/api/tickets/${ticketId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender })
      });

      if (response.ok) {
        const result = await response.json();
        setTickets(prev => prev.map(ticket => ticket.id === ticketId ? result : ticket));
      } else {
        throw new Error('Comment API returned error');
      }
    } catch (e) {
      console.warn('Comment registration redirected to local queue:', e);
      
      // Client local emulation
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            responseLog: [
              ...ticket.responseLog,
              {
                timestamp: new Date().toISOString(),
                message,
                sender
              }
            ]
          };
        }
        return ticket;
      }));

      // Queue the action
      const pendingCommentAction: PendingAction = {
        id: 'action-' + Date.now(),
        type: 'comment',
        payload: { ticketId, message, sender },
        timestamp: new Date().toISOString(),
        description: `Comment: Ticket #${ticketId}`
      };
      setPendingActions(prev => [...prev, pendingCommentAction]);
    }
  };

  const handleRephraseMemo = async (ticketId: string, vibe: string) => {
    try {
      if (!isOnline) {
        throw new Error('Offline mode active - routing AI request is blocked');
      }

      const response = await fetch(`/api/tickets/${ticketId}/rephrase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe })
      });

      if (!response.ok) {
        throw new Error('Failed to rephrase dispatch memo.');
      }

      const updatedTicket = await response.json();
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
      return updatedTicket;
    } catch (err: any) {
      console.warn('Rephrase failed, using client offline emulator fallback:', err);
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        const issue = issues.find(i => i.id === ticket.issueId);
        const title = issue ? issue.title : 'Municipal Concern';
        const description = issue ? issue.description : 'Infrastructure defect reported.';
        const idStr = ticketId.toUpperCase();
        let newMemo = '';
        if (vibe === 'tactical') {
          newMemo = `TACTICAL BRIEFING // CLASSIFIED // LEVEL 5
===========================================
MISSION CODE: TAC-${idStr}-DELTA
TARGET OBJECTIVE: REMEDIATE "${title.toUpperCase()}"
ASSIGNED OPERATIVES: ${ticket.assignedCrew.toUpperCase()}

SITUATION ASSESSMENT: Intelligence reports active infrastructure breach: "${description}". Immediate threat multiplier active.

DIRECTIVES:
1. Secure the perimeter with tactical cones and high-vis barriers.
2. Neutralize the primary threat vector immediately.
3. Deploy engineered tactical solution.
4. Log operational completion to Central Command.`;
        } else if (vibe === 'cyberpunk') {
          newMemo = `NEO-METROPOLIS SUB-GRID LOG // SECURE_AI_v4
===========================================
NODE IDENTIFIER: CYBER-${idStr}
SUBNET DISPATCHED: ${ticket.assignedCrew.toUpperCase()}
ALERT LEVEL: HIGH_GRID_FLUIDITY_BREACH

SENSORS ACTIVE: Discrepancy registered in system sub-grid: "${title}". Description: "${description}".

SUB-ROUTINES:
1. Initialize perimeter grid shielding (Level 3 deflector protocols).
2. Override manual utility valve node stations.
3. Refit fractured infrastructure modules with carbon-fiber weave.
4. Broadcast telemetry logs to the Central mainframe.`;
        } else if (vibe === 'bureaucratic') {
          newMemo = `OFFICIAL ORDER OF EXCELLENT RECTIFICATION
=============================================================
ORDER NUMBER: BUR-${idStr}-FDF
ISSUED BY: Subcommittee for Structural Oversight
DESPATCHED TO: Esteemed Colleagues of the ${ticket.assignedCrew}

SITUATION: It has come to the subcommittee's attention, via Form 40-A, that a minor deviation exists regarding: "${title}".

MANDATED ADMINISTRATIVE DIRECTIVES:
1. Conduct an initial preliminary exploratory committee visual survey.
2. File safety hazard report sub-sections with regional traffic bureaus.
3. Conduct physical remediation procedures in accordance with Protocol 99-C.
4. Complete and double-sign final closure logs for public record.`;
        } else if (vibe === 'pirate') {
          newMemo = `CAPTAIN'S LOG & DECK ORDERS // THE REPAIR VOYAGE
===========================================
SHIP LOG: PIR-${idStr}
COMMANDER: Captain J. Miller of the ${ticket.assignedCrew}
PRIORITY: HIGH SEAS EMERGENCY

SITUATION: Blimey! The crew reports a leak and structural distress on our deck: "${title}". Let's plug the breach, ye scallywags!

DECK INSTRUCTIONS:
1. Hoist the warning flags and clear the poop deck!
2. Shut off the main water valve before she sinks the whole island!
3. Secure the timber and nails to repair the hull immediately!
4. Fire a cannon shot to let the town know the seas are safe again!`;
        } else {
          newMemo = `OFFICIAL MUNICIPAL WORK DISPATCH
====================================
DISPATCH ID: ALR-${idStr}
TARGET DEPT: ${ticket.department}
PRIORITY LEVEL: HIGH

The CivicResolve automated dispatch engine has flagged a high-priority community concern regarding "${title}".

DIRECTIVE:
1. Schedule a visual site assessment of the reported coordinates.
2. Deploy temporary safety signage or protective barriers.
3. Initiate remediation or utility repair protocols based on standard operating procedure.
4. Log all onsite milestones back to the citizen-tracking interface.`;
        }

        const fallbackTicket = {
          ...ticket,
          dispatchMemo: newMemo,
          responseLog: [
            ...ticket.responseLog,
            {
              timestamp: new Date().toISOString(),
              message: `AI Dispatch Memo rephrased to [${vibe.toUpperCase()}] locally (Offline fallback).`,
              sender: 'system' as const
            }
          ]
        };
        setTickets(prev => prev.map(t => t.id === ticketId ? fallbackTicket : t));

        if (!isOnline) {
          const pendingRephraseAction: PendingAction = {
            id: 'action-' + Date.now(),
            type: 'comment',
            payload: { ticketId, message: `AI Dispatch Memo rephrased to [${vibe.toUpperCase()}] tone.`, sender: 'system' },
            timestamp: new Date().toISOString(),
            description: `Rephrase Dispatch Memo: "${title}" to ${vibe.toUpperCase()}`
          };
          setPendingActions(prev => [...prev, pendingRephraseAction]);
        }
      }
    }
  };

  // Synchronize local pending actions with database in the background
  const handleSync = async () => {
    if (pendingActions.length === 0 || isSyncing) return;
    setIsSyncing(true);

    const idMap: { [key: string]: string } = {};

    try {
      // Process pending actions sequentially in order they were taken
      for (const action of pendingActions) {
        let payload = { ...action.payload };

        if (action.type === 'report') {
          const response = await fetch('/api/issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error(`Failed to sync report: ${action.description}`);
          const result = await response.json();

          // Capture newly generated server-side IDs to reconcile any subsequent actions
          if (action.emulatedIssueId && result.issue?.id) {
            idMap[action.emulatedIssueId] = result.issue.id;
          }
          if (action.emulatedTicketId && result.ticket?.id) {
            idMap[action.emulatedTicketId] = result.ticket.id;
          }

        } else if (action.type === 'vote') {
          // Reconcile emulated ID to real server ID if applicable
          const issueId = idMap[payload.id] || payload.id;
          const response = await fetch(`/api/issues/${issueId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'anusha-sim-id', userName })
          });

          if (!response.ok) throw new Error(`Failed to sync verification upvote: ${action.description}`);

        } else if (action.type === 'status') {
          // Reconcile emulated ID to real server ID if applicable
          const issueId = idMap[payload.issueId] || payload.issueId;
          const response = await fetch(`/api/issues/${issueId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload.statusData)
          });

          if (!response.ok) throw new Error(`Failed to sync authority status: ${action.description}`);

        } else if (action.type === 'comment') {
          // Reconcile emulated ID to real server ID if applicable
          const ticketId = idMap[payload.ticketId] || payload.ticketId;
          const response = await fetch(`/api/tickets/${ticketId}/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: payload.message, sender: payload.sender })
          });

          if (!response.ok) throw new Error(`Failed to sync dispatch comment: ${action.description}`);
        }
      }

      // Success! Reset pending queue
      setPendingActions([]);
      
      // Perform full re-fetch to completely sync state with real database records
      const [resIssues, resTickets, resLeader, resPredictive] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/tickets'),
        fetch('/api/leaderboard'),
        fetch('/api/predictive-insights')
      ]);

      if (resIssues.ok) setIssues(await resIssues.json());
      if (resTickets.ok) setTickets(await resTickets.json());
      if (resLeader.ok) {
        const leaderData = await resLeader.json();
        setLeaderboard(leaderData);
        const activeMe = leaderData.find((u: any) => u.name.toLowerCase() === userName.toLowerCase());
        if (activeMe) {
          setCurrentUserPoints(activeMe.points);
        }
      }
      if (resPredictive.ok) setPredictiveInsights(await resPredictive.json());

      console.log('CivicResolve background reconciliation synchronized successfully.');
    } catch (err: any) {
      console.error('Database reconciliation synchronization failed:', err);
      // Gentle status update, pending actions are preserved so we can try again later
    } finally {
      setIsSyncing(false);
    }
  };

  // Coordinate-binding coordinator
  const handleMapCoordinateReportInitiate = (lat: number, lng: number, sector: string) => {
    setDraftCoords({ lat, lng, sector });
    setActiveTab('report'); // switch tab to Report Form automatically
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'City Overview: Metropolitan District';
      case 'map': return 'Interactive Community Map';
      case 'report': return 'Report Infrastructure Issue';
      case 'municipal': return 'Municipal Operations Portal';
      case 'predictive': return 'AI Predictive Insights & Forecasts';
      case 'gamification': return 'Citizen Impact & Reputations';
      default: return 'Municipal Planning Board';
    }
  };

  if (!user && !isGuest) {
    return (
      <AuthPage 
        onAuthSuccess={handleAuthSuccess} 
        onContinueAsGuest={handleContinueAsGuest} 
        onLoginWithGoogle={handleLoginWithGoogle}
      />
    );
  }

  return (
    <div className={`min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans ${
      isAccessibilityMode ? 'text-lg leading-relaxed contrast-125' : 'text-sm'
    }`} id="civic-resolve-app">
      {/* Platform Left Sidebar (Responsive) */}
      <Header
        currentUser={{ name: userName, points: currentUserPoints, badge: 'Community Sentinel' }}
        user={user}
        onLogin={handleLoginTrigger}
        onLogout={handleLogout}
        isAccessibilityMode={isAccessibilityMode}
        setIsAccessibilityMode={setIsAccessibilityMode}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Reset coordinate buffer if navigating away from report manually
          if (tab !== 'report') {
            setDraftCoords(null);
          }
        }}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        pendingActionsCount={pendingActions.length}
        isSyncing={isSyncing}
        onSync={handleSync}
      />

      {/* Main Right Area container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Dynamic header inside Main panel */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 select-none" id="civic-main-header">
          <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
            {getTabTitle()}
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Dynamic Connection Indicator with Click Trigger to toggle simulation */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              id="header-network-indicator"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0 border transition-all ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse'
              }`}
              title="Click to toggle offline mode simulation"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></span>
              <span>{isOnline ? 'Network: Online' : 'Network: Offline (Simulated)'}</span>
            </button>

            {/* Sync trigger button */}
            <button
              onClick={handleSync}
              disabled={isSyncing || (!isOnline && pendingActions.length > 0)}
              id="header-sync-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all border shrink-0 ${
                isSyncing
                  ? 'bg-blue-50 border-blue-200 text-blue-600 cursor-not-allowed'
                  : pendingActions.length > 0
                    ? isOnline
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 hover:shadow-sm hover:shadow-amber-500/10'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
              title={pendingActions.length > 0 ? `Sync ${pendingActions.length} pending items` : "Database is fully synced"}
            >
              <RefreshCw className={`h-3 w-3 shrink-0 ${isSyncing ? 'animate-spin text-blue-600' : pendingActions.length > 0 && isOnline ? 'text-slate-950' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : pendingActions.length > 0 ? `Sync (${pendingActions.length})` : 'Synced'}
              </span>
              <span className="sm:hidden">
                {isSyncing ? '...' : pendingActions.length > 0 ? `${pendingActions.length}` : '✓'}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] sm:text-xs font-semibold shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span>12 Active Crews On-site</span>
            </div>
            
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative" id="bell-notifications-trigger" title="View Active Broadcasts">
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Emergency warning marquee/banner */}
        <div className="bg-amber-500 text-slate-950 px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-sm shrink-0 gap-4" id="civic-alert-bar">
          <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
            <Activity className="h-4 w-4 shrink-0 animate-pulse text-slate-950" />
            <span className="truncate">Active Operations: Sector 1 bridge cracks assigned to emergency response Unit S-1. Avoid freeway walkways.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-amber-600/30 border border-amber-600/20 px-2 py-0.5 rounded font-mono text-[10px] text-slate-950">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
              <span>EST. ARRIVAL: {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-slate-800">
              <Clock className="h-3.5 w-3.5" />
              <span>UPDATED: {lastUpdatedSecs < 5 ? 'JUST NOW' : `${lastUpdatedSecs}S AGO`}</span>
            </div>
            <span className="bg-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono shrink-0">
              CRITICAL
            </span>
          </div>
        </div>

        {/* Scrollable Main Content Layout */}
        <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col" id="civic-scroll-content">
          <main className="flex-1 p-6" id="civic-main-content">
            {/* Navigation Router Views */}
            <div className="animate-in fade-in duration-300">
              {activeTab === 'dashboard' && (
                <Dashboard
                  issues={issues}
                  tickets={tickets}
                  onVoteIssue={handleVoteIssue}
                  onSelectIssue={setSelectedIssue}
                  onShareIssue={handleShareIssue}
                  isAccessibilityMode={isAccessibilityMode}
                />
              )}

              {activeTab === 'map' && (
                <GeoMap
                  issues={issues}
                  predictiveInsights={predictiveInsights}
                  onVoteIssue={handleVoteIssue}
                  onSelectIssue={setSelectedIssue}
                  onShareIssue={handleShareIssue}
                  onInitiateReportAtCoords={handleMapCoordinateReportInitiate}
                  isAccessibilityMode={isAccessibilityMode}
                />
              )}

              {activeTab === 'report' && (
                <ReportIssueForm
                  initialCoords={draftCoords}
                  onSubmitReport={handleReportIssue}
                  isAccessibilityMode={isAccessibilityMode}
                />
              )}

              {activeTab === 'municipal' && (
                <MunicipalPortal
                  issues={issues}
                  tickets={tickets}
                  onUpdateStatus={handleUpdateStatus}
                  onAddComment={handleAddComment}
                  isAccessibilityMode={isAccessibilityMode}
                  onRephraseMemo={handleRephraseMemo}
                  user={user}
                />
              )}

              {activeTab === 'predictive' && (
                <PredictiveInsights
                  insights={predictiveInsights}
                  isAccessibilityMode={isAccessibilityMode}
                />
              )}

              {activeTab === 'gamification' && (
                <GamificationPanel
                  leaderboard={leaderboard}
                  currentUser={{ name: userName, points: currentUserPoints, badge: 'Community Sentinel' }}
                  isAccessibilityMode={isAccessibilityMode}
                />
              )}
            </div>
          </main>

          {/* Dynamic persistent bottom citizen bulletin summary bar */}
          <footer className="bg-slate-900 text-white border-t border-slate-800 py-6 shrink-0 mt-auto" id="civic-footer">
            <div className="px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  CIVICRESOLVE CORE METROPOLIS PLATFORM
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Fostering citizen transparency, agency validation, and intelligent municipal planning. Built for extreme accessibility.
                </p>
              </div>
              
              <div className="flex gap-4 text-xs font-semibold text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Secure Public Ledger
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-sky-500" />
                  WGS-84 Coordinates
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Slide drawer details modal overlay */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          tickets={tickets}
          onClose={() => setSelectedIssue(null)}
          onVote={handleVoteIssue}
          onShare={handleShareIssue}
          onAddComment={handleAddComment}
          isAccessibilityMode={isAccessibilityMode}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        issue={shareIssue}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareIssue(null);
        }}
      />
    </div>
  );
}
