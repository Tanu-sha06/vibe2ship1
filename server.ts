import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_ISSUES, INITIAL_TICKETS, INITIAL_LEADERBOARD, INITIAL_PREDICTIVE_INSIGHTS } from './src/utils/mockData.js';
import { Issue, Ticket, LeaderboardEntry, PredictiveInsight } from './src/types.js';

// Define data file path
const DATA_FILE = path.join(process.cwd(), 'data.json');

// Helper to initialize or read data from data.json
function loadDatabase(): {
  issues: Issue[];
  tickets: Ticket[];
  leaderboard: LeaderboardEntry[];
  predictiveInsights: PredictiveInsight[];
  users: any[];
} {
  const defaultUsers = [
    {
      name: 'Anusha P.',
      email: 'ptanusha2006@gmail.com',
      password: 'password123',
      role: 'citizen',
      points: 120
    },
    {
      name: 'Director J. Miller',
      email: 'officer@city.gov',
      password: 'password123',
      role: 'official',
      points: 350
    }
  ];

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.users) {
        parsed.users = defaultUsers;
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2));
      }
      return parsed;
    } catch (err) {
      console.error('Error reading data.json, falling back to mock data:', err);
    }
  }
  // Initialize with initial mock data
  const initialData = {
    issues: INITIAL_ISSUES,
    tickets: INITIAL_TICKETS,
    leaderboard: INITIAL_LEADERBOARD,
    predictiveInsights: INITIAL_PREDICTIVE_INSIGHTS,
    users: defaultUsers
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  return initialData;
}

// Helper to write to data.json
function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Initialize server-side Gemini AI Client lazy-loaded
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim() !== '') {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
        console.log('Gemini AI Client initialized successfully.');
      } catch (e) {
        console.error('Failed to initialize GoogleGenAI client:', e);
      }
    } else {
      console.log('Gemini API key is not configured or uses placeholder. Falling back to rule-based parser.');
    }
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes

// Get status check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// POST Register user
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
  }

  const db = loadDatabase();
  const lowerEmail = email.toLowerCase().trim();
  const userExists = db.users.some(u => u.email.toLowerCase() === lowerEmail);

  if (userExists) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const initialPoints = role === 'official' ? 350 : 20;

  const newUser = {
    name,
    email: lowerEmail,
    password,
    role,
    points: initialPoints
  };

  db.users.push(newUser);

  // If citizen, add them on the leaderboard
  if (role === 'citizen') {
    const onBoard = db.leaderboard.some(u => u.name.toLowerCase() === name.toLowerCase());
    if (!onBoard) {
      db.leaderboard.push({
        rank: db.leaderboard.length + 1,
        name: name,
        points: initialPoints,
        reportsSubmitted: 0,
        verificationsCompleted: 0,
        badge: 'Community Sentinel',
        badgeColor: 'bg-emerald-500/10 text-emerald-600'
      });
      // Recalculate ranks
      db.leaderboard.sort((a, b) => b.points - a.points);
      db.leaderboard.forEach((u, idx) => { u.rank = idx + 1; });
    }
  }

  saveDatabase(db);
  res.status(201).json({ success: true, user: { name, email: lowerEmail, role, points: initialPoints } });
});

// POST Login user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = loadDatabase();
  const lowerEmail = email.toLowerCase().trim();
  const user = db.users.find(u => u.email.toLowerCase() === lowerEmail);

  if (!user || user.password !== password) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  res.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points
    }
  });
});

// GET all issues
app.get('/api/issues', (req, res) => {
  const db = loadDatabase();
  res.json(db.issues);
});

// GET all tickets
app.get('/api/tickets', (req, res) => {
  const db = loadDatabase();
  res.json(db.tickets);
});

// GET leaderboard
app.get('/api/leaderboard', (req, res) => {
  const db = loadDatabase();
  res.json(db.leaderboard);
});

// GET predictive insights
app.get('/api/predictive-insights', (req, res) => {
  const db = loadDatabase();
  res.json(db.predictiveInsights);
});

// GET Google OAuth auth URL
app.get('/api/auth/google', (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'GOOGLE_CLIENT_ID environment variable is not configured.' });
    }
    
    // Construct the redirect URL. Prefer APP_URL if set, fallback to request details
    let appUrl = process.env.APP_URL;
    if (appUrl && appUrl.endsWith('/')) {
      appUrl = appUrl.slice(0, -1);
    }
    const redirectUri = appUrl ? `${appUrl}/auth/callback` : `${req.protocol}://${req.get('host')}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url });
  } catch (err: any) {
    console.error('Error in /api/auth/google:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET OAuth Callback handler
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('No authorization code provided in Google redirect.');
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    
    let appUrl = process.env.APP_URL;
    if (appUrl && appUrl.endsWith('/')) {
      appUrl = appUrl.slice(0, -1);
    }
    const redirectUri = appUrl ? `${appUrl}/auth/callback` : `${req.protocol}://${req.get('host')}/auth/callback`;

    console.log('Exchanging Google OAuth code for tokens with redirect_uri:', redirectUri);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange failed:', errText);
      return res.status(500).send(`Google token exchange failed: ${errText}`);
    }

    const tokens = await tokenRes.json();
    const { access_token } = tokens;

    // Fetch user profile from googleapis userinfo endpoint
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error('Google user info request failed:', errText);
      return res.status(500).send(`Google user info request failed: ${errText}`);
    }

    const profile = await userRes.json();
    console.log('Successfully fetched Google profile:', profile);

    // Render callback page to pass data to parent and close popup
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; color: #1e293b; }
            .spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #2563eb; animation: spin 1s linear infinite; display: inline-block; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>Authentication Successful!</h2>
          <p>Connecting you back to CivicResolve...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                profile: ${JSON.stringify(profile)} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('Error during Google callback exchange:', err);
    res.status(500).send(`Authentication error: ${err.message}`);
  }
});

// POST report a new issue (with automated AI processing)
app.post('/api/issues', async (req, res) => {
  const { title, description, latitude, longitude, sector, imageUrl, videoUrl, reportedBy } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const db = loadDatabase();
  const issueId = 'issue-' + Date.now();
  const ticketId = 't-' + Math.floor(100 + Math.random() * 900);

  // Set up fallback/rule-based processing defaults
  let category: Issue['category'] = 'other';
  let urgency: Issue['urgency'] = 'medium';
  let department = 'Municipal General Public Works';
  let dispatchMemo = '';
  let selfHelpAdvice = 'Please exercise caution in the area while dispatch crews respond.';

  const lowerDesc = (title + ' ' + description).toLowerCase();
  
  // Basic rule-based classification fallback
  if (lowerDesc.includes('leak') || lowerDesc.includes('water') || lowerDesc.includes('pipe') || lowerDesc.includes('burst')) {
    category = 'water_leakage';
    department = 'Municipal Water & Sanitation Board';
    urgency = lowerDesc.includes('flood') || lowerDesc.includes('gush') || lowerDesc.includes('critical') ? 'high' : 'medium';
  } else if (lowerDesc.includes('pothole') || lowerDesc.includes('road') || lowerDesc.includes('street') || lowerDesc.includes('asphalt') || lowerDesc.includes('pavement')) {
    category = 'pothole';
    department = 'Department of Transportation (Road Maintenance)';
    urgency = lowerDesc.includes('accident') || lowerDesc.includes('tire') || lowerDesc.includes('deep') ? 'high' : 'medium';
  } else if (lowerDesc.includes('light') || lowerDesc.includes('dark') || lowerDesc.includes('lamp') || lowerDesc.includes('streetlight')) {
    category = 'streetlight';
    department = 'Municipal Lighting & Grid Services';
    urgency = 'medium';
  } else if (lowerDesc.includes('trash') || lowerDesc.includes('garbage') || lowerDesc.includes('waste') || lowerDesc.includes('dump') || lowerDesc.includes('litter')) {
    category = 'waste_management';
    department = 'Environmental Services & City Sanitation';
    urgency = 'low';
  } else if (lowerDesc.includes('bridge') || lowerDesc.includes('concrete') || lowerDesc.includes('crack') || lowerDesc.includes('hazard') || lowerDesc.includes('structure')) {
    category = 'infrastructure';
    department = 'Municipal Structural Safety & Building Inspector';
    urgency = lowerDesc.includes('collapse') || lowerDesc.includes('fall') || lowerDesc.includes('critical') ? 'critical' : 'medium';
  }

  // If Gemini API is available, we try to run a high-fidelity classification and dispatch memo generation!
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are the CivicResolve AI Infrastructure Engine.
Analyze the following community issue report submitted by a resident:
Title: "${title}"
Description: "${description}"

Determine the category, urgency, responsible municipal department, official dispatch memo, and safety advice for local residents.
Options:
- category: strictly one of 'pothole', 'water_leakage', 'streetlight', 'waste_management', 'infrastructure', 'other'
- urgency: strictly one of 'low', 'medium', 'high', 'critical'

Return a JSON object containing EXACTLY these keys:
{
  "category": "category_value",
  "urgency": "urgency_value",
  "department": "Department Name",
  "dispatchMemo": "A detailed professional dispatch work order memo including dispatch ID, instructions for crews, and safety checks",
  "selfHelpAdvice": "Clear, direct safety instructions or temporary actions for residents in the immediate area"
}

Ensure the output is ONLY raw JSON. Do not include markdown formatting or backticks.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      // Clean up markdown block format if present
      const cleanedText = text.replace(/```json/i, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(cleanedText);

      if (aiData.category && ['pothole', 'water_leakage', 'streetlight', 'waste_management', 'infrastructure', 'other'].includes(aiData.category)) {
        category = aiData.category;
      }
      if (aiData.urgency && ['low', 'medium', 'high', 'critical'].includes(aiData.urgency)) {
        urgency = aiData.urgency;
      }
      if (aiData.department) department = aiData.department;
      if (aiData.dispatchMemo) dispatchMemo = aiData.dispatchMemo;
      if (aiData.selfHelpAdvice) selfHelpAdvice = aiData.selfHelpAdvice;

      console.log('Gemini categorization success:', { category, urgency, department });
    } catch (e) {
      console.error('Gemini content generation failed, using rule fallback:', e);
    }
  }

  // Generate fallback dispatch memo if not filled by AI
  if (!dispatchMemo) {
    dispatchMemo = `OFFICIAL MUNICIPAL WORK DISPATCH
====================================
DISPATCH ID: ALR-${ticketId.toUpperCase()}
TARGET DEPT: ${department}
PRIORITY LEVEL: ${urgency.toUpperCase()}

The CivicResolve automated dispatch engine has flagged a high-priority community concern regarding "${title}".

DIRECTIVE:
1. Schedule a visual site assessment of the reported coordinates (${latitude || 45.520}, ${longitude || -122.682}).
2. Deploy temporary safety signage or protective barriers.
3. Initiate remediation or utility repair protocols based on standard operating procedure.
4. Log all onsite milestones back to the citizen-tracking interface.`;
  }

  // Calculate Priority Score
  let urgencyFactor = 1;
  if (urgency === 'medium') urgencyFactor = 2;
  if (urgency === 'high') urgencyFactor = 3;
  if (urgency === 'critical') urgencyFactor = 4;
  const initialPriorityScore = (urgencyFactor * 15);

  // Assemble new Issue
  const newIssue: Issue = {
    id: issueId,
    title,
    description,
    category,
    status: 'reported',
    urgency,
    latitude: latitude || (45.5 + Math.random() * 0.04),
    longitude: longitude || (-122.7 + Math.random() * 0.06),
    sector: sector || 'Sector 2 (Civic Center)',
    upvotes: 0,
    upvotedByUserIds: [],
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=800&q=80',
    videoUrl,
    reportedBy: {
      name: reportedBy?.name || 'Local Citizen',
      email: reportedBy?.email || 'citizen@civicresolve.org',
      points: reportedBy?.points || 10
    },
    createdAt: new Date().toISOString(),
    ticketId,
    verificationScore: 10,
    verificationStatus: 'unverified',
    timeline: [
      {
        status: 'reported',
        title: 'Report Logged',
        description: `Citizen ${reportedBy?.name || 'Local Citizen'} submitted a report. AI categorized the concern and generated a ticket.`,
        timestamp: new Date().toISOString()
      },
      {
        status: 'reported',
        title: 'Safety Action Steps Generated',
        description: `Resident Alert: ${selfHelpAdvice}`,
        timestamp: new Date().toISOString()
      }
    ]
  };

  // Assemble new Ticket
  const newTicket: Ticket = {
    id: ticketId,
    issueId,
    department,
    priorityScore: initialPriorityScore,
    targetResolutionDate: new Date(Date.now() + (urgency === 'critical' ? 4 : urgency === 'high' ? 24 : 48) * 60 * 60 * 1000).toISOString(),
    dispatchMemo,
    responseLog: [
      {
        timestamp: new Date().toISOString(),
        message: `Automated Ticket created. Assigned to ${department}. Dispatch memo issued.`,
        sender: 'system'
      }
    ]
  };

  // Append data and save
  db.issues.unshift(newIssue);
  db.tickets.push(newTicket);

  // Award gamification points to reporting user
  const reporterEmail = reportedBy?.email || 'citizen@civicresolve.org';
  const leaderboardIdx = db.leaderboard.findIndex(u => u.name.toLowerCase() === (reportedBy?.name || '').toLowerCase());
  if (leaderboardIdx >= 0) {
    db.leaderboard[leaderboardIdx].points += 10;
    db.leaderboard[leaderboardIdx].reportsSubmitted += 1;
  } else {
    // Register new user on leaderboard
    db.leaderboard.push({
      rank: db.leaderboard.length + 1,
      name: reportedBy?.name || 'Local Citizen',
      points: 20,
      reportsSubmitted: 1,
      verificationsCompleted: 0,
      badge: 'Community Sentinel',
      badgeColor: 'bg-emerald-500/10 text-emerald-600'
    });
  }

  // Recalculate leaderboard ranks
  db.leaderboard.sort((a, b) => b.points - a.points);
  db.leaderboard.forEach((user, idx) => {
    user.rank = idx + 1;
  });

  saveDatabase(db);
  res.status(201).json({ issue: newIssue, ticket: newTicket });
});

// POST vote / verify an issue
app.post('/api/issues/:id/vote', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body; // simulated voter details
  
  const db = loadDatabase();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }

  // Check if already voted
  const userHasVoted = issue.upvotedByUserIds.includes(userId);
  if (userHasVoted) {
    // Unvote
    issue.upvotedByUserIds = issue.upvotedByUserIds.filter(uid => uid !== userId);
    issue.upvotes = Math.max(0, issue.upvotes - 1);
    issue.verificationScore = Math.max(10, issue.verificationScore - 5);
  } else {
    // Vote
    issue.upvotedByUserIds.push(userId);
    issue.upvotes += 1;
    issue.verificationScore += 10;
    
    // Add timeline log for verification threshold
    if (issue.upvotes === 5) {
      issue.verificationStatus = 'validating';
      issue.timeline.push({
        status: 'validating',
        title: 'Community Validation Rising',
        description: 'Verified by 5+ local citizens. Credibility score elevated.',
        timestamp: new Date().toISOString()
      });
    } else if (issue.upvotes === 12) {
      issue.verificationStatus = 'verified';
      issue.timeline.push({
        status: 'verified',
        title: 'Community Verified',
        description: 'Verified by 12+ citizens. High trust status unlocked.',
        timestamp: new Date().toISOString()
      });
    }

    // Award points to the simulated voter on the leaderboard
    if (userName) {
      const userIdx = db.leaderboard.findIndex(u => u.name.toLowerCase() === userName.toLowerCase());
      if (userIdx >= 0) {
        db.leaderboard[userIdx].points += 5;
        db.leaderboard[userIdx].verificationsCompleted += 1;
      } else {
        db.leaderboard.push({
          rank: db.leaderboard.length + 1,
          name: userName,
          points: 15,
          reportsSubmitted: 0,
          verificationsCompleted: 1,
          badge: 'Civic Validator',
          badgeColor: 'bg-sky-500/10 text-sky-600'
        });
      }
    }
  }

  // Update associated Ticket priority score
  const ticket = db.tickets.find(t => t.issueId === id);
  if (ticket) {
    let urgencyFactor = 1;
    if (issue.urgency === 'medium') urgencyFactor = 2;
    if (issue.urgency === 'high') urgencyFactor = 3;
    if (issue.urgency === 'critical') urgencyFactor = 4;
    ticket.priorityScore = (urgencyFactor * 15) + (issue.upvotes * 2);
  }

  // Recalculate ranks
  db.leaderboard.sort((a, b) => b.points - a.points);
  db.leaderboard.forEach((user, idx) => {
    user.rank = idx + 1;
  });

  saveDatabase(db);
  res.json({ issue, ticket });
});

// POST update issue status (simulates local authority actions)
app.post('/api/issues/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, officialNotes, updaterName, crewName } = req.body;

  if (!status || !['reported', 'investigating', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required.' });
  }

  const db = loadDatabase();
  const issue = db.issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }

  issue.status = status;
  
  // Create timeline note
  let actionTitle = 'Status Updated';
  let actionDesc = `Municipal authorities updated the status to ${status}.`;

  if (status === 'investigating') {
    actionTitle = 'Investigation Commenced';
    actionDesc = `Engineering inspectors logged investigation status. Dispatch details reviewed.`;
  } else if (status === 'in_progress') {
    actionTitle = 'Work Crews Dispatched';
    actionDesc = crewName 
      ? `Crew "${crewName}" has been dispatched to begin active repairs on site.`
      : 'Active repair schedules initiated on coordinates.';
  } else if (status === 'resolved') {
    actionTitle = 'Resolution Confirmed';
    actionDesc = officialNotes || 'Remediation completed successfully. The site is restored to standards.';
  }

  issue.timeline.push({
    status,
    title: actionTitle,
    description: actionDesc,
    timestamp: new Date().toISOString(),
    updatedBy: updaterName || 'Municipal Operations'
  });

  // Update corresponding Ticket
  const ticket = db.tickets.find(t => t.issueId === id);
  if (ticket) {
    if (officialNotes) {
      ticket.officialNotes = officialNotes;
    }
    if (crewName) {
      ticket.assignedCrew = crewName;
    }
    ticket.responseLog.push({
      timestamp: new Date().toISOString(),
      message: `Status updated to ${status.toUpperCase()} by ${updaterName || 'Municipal Desk'}. Notes: ${officialNotes || 'None'}`,
      sender: 'authority'
    });
  }

  saveDatabase(db);
  res.json({ issue, ticket });
});

// POST dispatch simulated authority notification email (Notification log)
app.post('/api/tickets/:id/notify', (req, res) => {
  const { id } = req.params;
  const { message, sender } = req.body;

  const db = loadDatabase();
  const ticket = db.tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  ticket.responseLog.push({
    timestamp: new Date().toISOString(),
    message: message || 'System auto-update dispatched.',
    sender: sender || 'system'
  });

  saveDatabase(db);
  res.json(ticket);
});

// POST rephrase ticket dispatch memo using Gemini AI
app.post('/api/tickets/:id/rephrase', async (req, res) => {
  const { id } = req.params;
  const { vibe } = req.body; // 'tactical', 'cyberpunk', 'bureaucratic', 'pirate', 'standard'

  const db = loadDatabase();
  const ticket = db.tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const issue = db.issues.find(i => i.id === ticket.issueId);
  const title = issue ? issue.title : 'Municipal Concern';
  const description = issue ? issue.description : 'Infrastructure defect reported.';

  let newMemo = '';

  const vibePrompts: { [key: string]: string } = {
    tactical: "Rewrite the dispatch memo as a highly structured, strict military tactical command or action movie briefing. Use capitalized tactical terms, mission codes, objectives, and extreme urgency.",
    cyberpunk: "Rewrite the dispatch memo as a futuristic, cyberpunk AI drone dispatch. Use high-tech neon slang, terms like grid nodes, sub-sectors, neural overrides, and cybernetic response protocols.",
    bureaucratic: "Rewrite the dispatch memo as an excessively verbose, comedic, old-fashioned, passive-aggressive official bureaucratic letter. Use highly formal language, references to committee findings, forms, and regulatory compliance.",
    pirate: "Rewrite the dispatch memo as a sea shanty or pirate captain's deck orders. Use pirate vocabulary, talk about the high seas, mateys, sailing vessels, anchors, and plundering the repairs.",
    standard: "Rewrite the dispatch memo as a standard, crisp, highly professional municipal engineering work order."
  };

  const selectedVibePrompt = vibePrompts[vibe] || vibePrompts.standard;

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are the CivicResolve AI Infrastructure Engine.
We have an infrastructure ticket with:
Ticket ID: "${ticket.id}"
Issue Title: "${title}"
Issue Description: "${description}"

Original Department: "${ticket.department}"
Assigned Unit: "${ticket.assignedCrew}"

${selectedVibePrompt}

The format MUST start with a bold heading or identifier block (like DISPATCH ID, PRIORITY, etc.) and list specific directive action items numbered 1, 2, 3, 4, etc. Keep the length under 250 words. Do NOT wrap in markdown code blocks like \`\`\`json or \`\`\`markdown, just return the plain formatted text directly.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      newMemo = response.text || '';
    } catch (e) {
      console.error('Gemini rephrasing failed:', e);
    }
  }

  // Fallback if Gemini is not available or failed
  if (!newMemo) {
    const idStr = ticket.id.toUpperCase();
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
  }

  ticket.dispatchMemo = newMemo;
  ticket.responseLog.push({
    timestamp: new Date().toISOString(),
    message: `AI Dispatch Memo rephrased to [${vibe.toUpperCase()}] tone.`,
    sender: 'system'
  });

  saveDatabase(db);
  res.json(ticket);
});

// Vite Middleware for development mode, Static files for production mode
async function startServer() {
  loadDatabase(); // Bootstrap data.json

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production build from dist folder.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicResolve server booting successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
