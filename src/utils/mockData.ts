import { Issue, Ticket, LeaderboardEntry, PredictiveInsight } from '../types';

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'issue-1',
    title: 'Major Water Pipe Leakage near Oak Street Junction',
    description: 'Fresh clean water is gushing out of the pavement, flooding the sidewalk and creating a large pool. It has been running for over 12 hours now and is eroding the soil beneath the road.',
    category: 'water_leakage',
    status: 'in_progress',
    urgency: 'high',
    latitude: 45.520,
    longitude: -122.682,
    sector: 'Sector 4 (Northside)',
    upvotes: 42,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@gmail.com',
      points: 240
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    ticketId: 't-101',
    verificationScore: 88,
    verificationStatus: 'verified',
    timeline: [
      {
        status: 'reported',
        title: 'Issue Submitted',
        description: 'Citizen Sarah Jenkins reported the water pipe leak with image attachment.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'validating',
        title: 'Community Verification Active',
        description: 'Community members started upvoting and verifying the issue validity.',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'investigating',
        title: 'Municipal Alert Dispatched',
        description: 'Official ticket t-101 created and assigned to the Water Sanitation Board.',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'in_progress',
        title: 'Repair Crew Dispatched',
        description: 'Utility Service Team C-12 has arrived at Oak Street and shut off the main valve to commence pipe replacement.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-2',
    title: 'Deep, Dangerous Pothole on Broadway Boulevard Center Lane',
    description: 'An extremely deep pothole has formed in the center lane of Broadway Blvd. Multiple cars have had to swerve suddenly, which is incredibly dangerous during rush hour. One driver already got a flat tire.',
    category: 'pothole',
    status: 'investigating',
    urgency: 'high',
    latitude: 45.512,
    longitude: -122.670,
    sector: 'Sector 2 (Civic Center)',
    upvotes: 28,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'Marcus Chen',
      email: 'm.chen@outlook.com',
      points: 150
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    ticketId: 't-102',
    verificationScore: 75,
    verificationStatus: 'verified',
    timeline: [
      {
        status: 'reported',
        title: 'Issue Logged',
        description: 'Citizen Marcus Chen logged a pothole alert using the mobile portal.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'investigating',
        title: 'Urgency Categorized',
        description: 'Automated ticket generator flagged high risk priority due to high traffic volume on Broadway Blvd.',
        timestamp: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-3',
    title: 'Damaged Streetlights - Entire Block in Darkness',
    description: 'Three consecutive streetlights are completely out on Elm Avenue between 5th and 7th St. The street is pitch black at night, making residents feel extremely unsafe walking home from the transit station.',
    category: 'streetlight',
    status: 'reported',
    urgency: 'medium',
    latitude: 45.505,
    longitude: -122.658,
    sector: 'Sector 5 (Southside)',
    upvotes: 15,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'Elena Rostova',
      email: 'elena.ros@gmail.com',
      points: 90
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    ticketId: 't-103',
    verificationScore: 40,
    verificationStatus: 'validating',
    timeline: [
      {
        status: 'reported',
        title: 'Issue Created',
        description: 'Elena reported the dark block on Elm Ave.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-4',
    title: 'Overflowing Waste Bins & Illegal Dumping',
    description: 'Public trash bins in Riverfront Park are overflowing, and people have started dumping large bags of household waste next to them. Stray animals are ripping bags open, spreading litter everywhere.',
    category: 'waste_management',
    status: 'resolved',
    urgency: 'medium',
    latitude: 45.517,
    longitude: -122.664,
    sector: 'Sector 3 (Waterfront)',
    upvotes: 19,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'David Kim',
      email: 'dkim@gmail.com',
      points: 320
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    ticketId: 't-104',
    verificationScore: 95,
    verificationStatus: 'verified',
    timeline: [
      {
        status: 'reported',
        title: 'Report Registered',
        description: 'Littering and overflowing bins reported near the promenade.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'investigating',
        title: 'Sanitation Dept Notified',
        description: 'Automatic email alert dispatched to City Waste Services.',
        timestamp: new Date(Date.now() - 1.9 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'in_progress',
        title: 'Cleanup Crew Dispatched',
        description: 'Sanitation truck S-4 assigned to clear the overflowing dump.',
        timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'resolved',
        title: 'Area Restored & Bin Emptied',
        description: 'Sanitation department cleared all debris and installed a larger high-capacity bin. Photographic proof uploaded.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-5',
    title: 'Cracked Pedestrian Bridge Support Column',
    description: 'There is a noticeable, wide structural crack on the main concrete support column of the pedestrian bridge crossing over the freeway. This could present an active danger to citizens.',
    category: 'infrastructure',
    status: 'investigating',
    urgency: 'critical',
    latitude: 45.525,
    longitude: -122.675,
    sector: 'Sector 1 (Industrial North)',
    upvotes: 56,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'Robert Vance',
      email: 'rvance@vanceair.com',
      points: 410
    },
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    ticketId: 't-105',
    verificationScore: 100,
    verificationStatus: 'verified',
    timeline: [
      {
        status: 'reported',
        title: 'CRITICAL ALERT LOGGED',
        description: 'Citizen Robert Vance uploaded photos of structural concrete cracks.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        status: 'investigating',
        title: 'Immediate Ticket Priority Elevated',
        description: 'Auto-ticketing engine computed high-risk structural hazard. Notification dispatched to Municipal Engineering & Structural Safety Division.',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-6',
    title: 'Blocked Storm Drain Flooding Intersection',
    description: 'Heavy rain has washed leaves, plastic bags, and debris completely blocking the storm drain grate at the corner of 12th & Columbia. It is causing a major pool of water about 6 inches deep, forcing pedestrians to walk into traffic.',
    category: 'water_leakage',
    status: 'reported',
    urgency: 'medium',
    latitude: 45.510,
    longitude: -122.685,
    sector: 'Sector 5 (Southside)',
    upvotes: 11,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'Elena Rostova',
      email: 'elena.ros@gmail.com',
      points: 90
    },
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    ticketId: 't-106',
    verificationScore: 32,
    verificationStatus: 'validating',
    timeline: [
      {
        status: 'reported',
        title: 'Flooding Alert Received',
        description: 'Citizen Elena Rostova reported street flooding due to storm drain clog.',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-7',
    title: 'Overgrown Tree Branches Obscuring Stop Sign',
    description: 'Large, heavy maple tree branches have grown extremely low and completely obscure the critical Stop sign on the corner of Harbor Dr. and Marina Way. Drivers are regularly blowing through the intersection because they cannot see the sign.',
    category: 'infrastructure',
    status: 'in_progress',
    urgency: 'high',
    latitude: 45.515,
    longitude: -122.661,
    sector: 'Sector 3 (Waterfront)',
    upvotes: 24,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'David Kim',
      email: 'dkim@gmail.com',
      points: 320
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    ticketId: 't-107',
    verificationScore: 78,
    verificationStatus: 'verified',
    timeline: [
      {
        status: 'reported',
        title: 'Obscured Sign Reported',
        description: 'Citizen David Kim reported tree obstruction of regulatory signage.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'investigating',
        title: 'Safety Evaluation',
        description: 'Transportation department verified severe visibility issue at crossroad.',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'in_progress',
        title: 'Arborist Unit Dispatched',
        description: 'Arborist Response Unit T-8 scheduled for selective limb pruning.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-8',
    title: 'Vandalized Park Playground Equipment',
    description: 'The children\'s slide in Pioneer Park has been spray-painted with offensive graffiti, and one of the chain links on the main swing set has snapped, leaving it hanging dangerously. This playground is heavily used by local families.',
    category: 'infrastructure',
    status: 'resolved',
    urgency: 'low',
    latitude: 45.513,
    longitude: -122.672,
    sector: 'Sector 2 (Civic Center)',
    upvotes: 8,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@gmail.com',
      points: 240
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    ticketId: 't-108',
    verificationScore: 92,
    verificationStatus: 'verified',
    timeline: [
      {
        status: 'reported',
        title: 'Vandalism Logged',
        description: 'Citizen Sarah Jenkins reported broken swing chains and graffiti.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'investigating',
        title: 'Parks Dept Assignment',
        description: 'Job assigned to Maintenance Team R-3 for playground restoration.',
        timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'in_progress',
        title: 'Onsite Restoration Active',
        description: 'Team R-3 clearing paint coatings and replacing heavy swing brackets.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'resolved',
        title: 'Equipment Fully Restored',
        description: 'Graffiti removed and swing set re-anchored with heavy duty commercial components.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'issue-9',
    title: 'Broken and Uneven Sidewalk Tripping Hazard',
    description: 'An old maple tree\'s root system has buckled and cracked the concrete sidewalk panels on Walnut St, lifting them by nearly 4 inches. Multiple elderly residents have tripped, and it is impossible for wheelchairs to pass.',
    category: 'infrastructure',
    status: 'investigating',
    urgency: 'high',
    latitude: 45.522,
    longitude: -122.680,
    sector: 'Sector 4 (Northside)',
    upvotes: 31,
    upvotedByUserIds: [],
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    reportedBy: {
      name: 'Marcus Chen',
      email: 'm.chen@outlook.com',
      points: 150
    },
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    ticketId: 't-109',
    verificationScore: 82,
    verificationStatus: 'verified',
    timeline: [
      {
        status: 'reported',
        title: 'Hazard Reported',
        description: 'Citizen Marcus Chen uploaded telemetry and images of buckled sidewalk panels.',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        status: 'investigating',
        title: 'Geotechnical & Structural Review',
        description: 'Engineering Division verifying extent of tree root invasion on public right-of-way.',
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 't-101',
    issueId: 'issue-1',
    department: 'Municipal Water & Sanitation Board',
    assignedCrew: 'Hydraulics Response Team C-12',
    priorityScore: 78,
    targetResolutionDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // in 12 hours
    dispatchMemo: `OFFICIAL MUNICIPAL EMERGENCY DISPATCH MEMO
===========================================
DISPATCH ID: HRD-2026-9932
ISSUED BY: Automated Civic Infrastructure Systems
TARGET UNIT: Hydraulics Response Team C-12
PRIORITY LEVEL: HIGH / CRITICAL THREAT

An active, high-volume pipeline rupture has been reported on Oak Street Junction. Citizen reports verify substantial sidewalk erosion and potential minor street flooding. 

DIRECTIVE:
1. Immediately establish traffic diversion cones.
2. Cut off main water supply line on Valve Station #41.
3. Replace ruptured 4-inch ductile iron piping.
4. Coordinate with public communications to log completion.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        message: 'System automatically assigned ticket to Municipal Water Board based on category classification.',
        sender: 'system'
      },
      {
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        message: 'Understood. Hydraulics Unit C-12 is completing an active assignment and will proceed to Oak Street immediately after.',
        sender: 'authority'
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        message: 'Unit C-12 has arrived. Shutting off regional valves to secure the street.',
        sender: 'authority'
      }
    ]
  },
  {
    id: 't-102',
    issueId: 'issue-2',
    department: 'Department of Transportation (Road Maintenance)',
    assignedCrew: 'Asphalt Patch Crew A-4',
    priorityScore: 81,
    targetResolutionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // in 24 hours
    dispatchMemo: `OFFICIAL MUNICIPAL WORK DISPATCH
====================================
DISPATCH ID: RMD-2026-1044
TARGET UNIT: Asphalt Patch Crew A-4
PRIORITY LEVEL: HIGH ACCIDENT RISK

A deep pothole has compromised safety in the center lane of Broadway Blvd. Traffic flow is swerving dramatically.

DIRECTIVE:
1. Deploy safety barrier.
2. Sweep loose debris from cavity.
3. Apply hot-mix asphalt packing.
4. Steamroll and level with surrounding roadway.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(),
        message: 'Ticket successfully initialized and placed in queue for asphalt dispatcher.',
        sender: 'system'
      }
    ]
  },
  {
    id: 't-103',
    issueId: 'issue-3',
    department: 'Municipal Lighting and Grid Services',
    priorityScore: 45,
    targetResolutionDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // in 2 days
    dispatchMemo: `MUNICIPAL WORK ORDER
====================
DISPATCH ID: GRID-2026-0492
TARGET: Streetlight Maintenance Division
PRIORITY LEVEL: MEDIUM (Dark Spot Safety)

Dark section reported on Elm Avenue. Three lights are out. Relays or LED driver units are likely faulty.

DIRECTIVE:
1. Inspect light post transformer linkages.
2. Replace lighting lamps with high-efficiency LEDs.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        message: 'Standard ticket registered. Scheduled into grid sweep backlog.',
        sender: 'system'
      }
    ]
  },
  {
    id: 't-104',
    issueId: 'issue-4',
    department: 'Environmental Services & City Sanitation',
    assignedCrew: 'Sanitation Truck S-4',
    priorityScore: 54,
    targetResolutionDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    dispatchMemo: `CLEANUP & RESTORATION WORK ORDER
==================================
DISPATCH ID: SAN-2026-884
TARGET UNIT: Sanitation Truck S-4
PRIORITY: MEDIUM

Overflowing public bins and illegal dumping cleared successfully at Riverfront Park promenade. Bigger bins placed.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Civic Resolve automatically redirected waste reports to Environmental Services.',
        sender: 'system'
      },
      {
        timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Truck S-4 scheduled. Arriving at waterfront park.',
        sender: 'authority'
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        message: 'Cleanup finished. New heavy-duty high-volume container installed to prevent future overflow.',
        sender: 'authority'
      }
    ]
  },
  {
    id: 't-105',
    issueId: 'issue-5',
    department: 'Municipal Structural Integrity Division',
    assignedCrew: 'Structural Emergency Response Unit S-1',
    priorityScore: 112, // Critical urgency + upvote multipliers
    targetResolutionDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
    dispatchMemo: `EMERGENCY STRUCTURAL ORDER - IMMEDIATE RESPONSE REQUESTED
=========================================================
DISPATCH ID: STRUCT-2026-001
ISSUED BY: EXECUTIVE CIVIC COMMITTEE
TARGET: Structural Emergency Response Unit S-1 & Police Escort
PRIORITY: CRITICAL INFRASTRUCTURE THREAT

A major structural concrete crack has been identified on the main support column of the Freeway Crossing Pedestrian Bridge. Risk of catastrophic collapse requires immediate onsite inspection.

DIRECTIVE:
1. Close pedestrian walkway entry gates immediately.
2. Coordinate with Freeway Police to tape off transit corridor.
3. Deploy laser sensors to monitor crack displacement.
4. Prepare shoring pillars for emergency concrete reinforcement.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        message: 'System elevated incident to highest level. Police Dispatch notified for perimeter closing.',
        sender: 'system'
      }
    ]
  },
  {
    id: 't-106',
    issueId: 'issue-6',
    department: 'Municipal Water & Sanitation Board',
    assignedCrew: 'Drainage & Sewer Team S-2',
    priorityScore: 50,
    targetResolutionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    dispatchMemo: `MUNICIPAL DRAINAGE SERVICE CALL
=============================
DISPATCH ID: DRN-2026-4022
TARGET UNIT: Drainage & Sewer Team S-2
PRIORITY LEVEL: MEDIUM

A citizen reports high pooling of water at the corner of 12th & Columbia due to debris blocking the intake grate.

DIRECTIVE:
1. Clear surface debris from drain screen.
2. Flush the line if backpressure exists.
3. Dispose of leaves and organic waste.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        message: 'Ticket registered. Dispatch queue assigned.',
        sender: 'system'
      }
    ]
  },
  {
    id: 't-107',
    issueId: 'issue-7',
    department: 'Parks & Recreation (Forestry Division)',
    assignedCrew: 'Arborist Response Unit T-8',
    priorityScore: 75,
    targetResolutionDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    dispatchMemo: `EMERGENCY LINE-OF-SIGHT OBSTRUCTION SLIP
=========================================
DISPATCH ID: FOR-2026-7711
TARGET UNIT: Arborist Response Unit T-8
PRIORITY LEVEL: HIGH / TRAFFIC DANGER

Overgrown maple branches are entirely covering a regulatory Stop sign at Harbor & Marina.

DIRECTIVE:
1. Arrive on site and secure the lane.
2. Complete selective high-canopy pruning to clear sign face.
3. Chip the branches on site.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        message: 'Issue received and automatically matched with Forestry division.',
        sender: 'system'
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        message: 'Understood. Work order added to immediate hazard list.',
        sender: 'authority'
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        message: 'Unit T-8 on location. Initiating sign clearance.',
        sender: 'authority'
      }
    ]
  },
  {
    id: 't-108',
    issueId: 'issue-8',
    department: 'Parks & Recreation (Maintenance)',
    assignedCrew: 'Graffiti & Repair Team R-3',
    priorityScore: 25,
    targetResolutionDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    dispatchMemo: `PARK MAINTENANCE & RE-INTEGRATION ORDER
========================================
DISPATCH ID: PRK-2026-0091
TARGET UNIT: Graffiti & Repair Team R-3
PRIORITY LEVEL: LOW

Vandalism reported on the Pioneer Park slide and a broken chain link on the primary swing set.

DIRECTIVE:
1. Pressure wash and paint-strip offensive graffiti.
2. Replace broken swing chain with commercial-grade zinc-plated steel links.
3. Conduct full safety check of playground structure.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'System logged request. Dispatched to Parks Maintenance.',
        sender: 'system'
      },
      {
        timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Work order scheduled for Team R-3.',
        sender: 'authority'
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Work in progress. Scrubbing graffiti and sourcing new swing connectors.',
        sender: 'authority'
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        message: 'Vandalism remediated. Playground equipment certified safe.',
        sender: 'authority'
      }
    ]
  },
  {
    id: 't-109',
    issueId: 'issue-9',
    department: 'Department of Transportation (Sidewalks Division)',
    assignedCrew: 'Concrete Repair Squad C-5',
    priorityScore: 68,
    targetResolutionDate: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    dispatchMemo: `PEDESTRIAN CORRIDOR HAZARD DIRECTIVE
====================================
DISPATCH ID: SDK-2026-1502
TARGET UNIT: Concrete Repair Squad C-5
PRIORITY LEVEL: HIGH ACCIDENT RISK

Old tree root has buckled concrete slabs on Walnut St. panels up to 4 inches. Safe passage is blocked.

DIRECTIVE:
1. Cut back invading roots without destabilizing parent tree structure.
2. Frame and pour replacement concrete panels.
3. Re-grade slope to ensure flat pedestrian access.`,
    responseLog: [
      {
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        message: 'Ticket recorded by DOT dispatcher.',
        sender: 'system'
      },
      {
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        message: 'Structural assessment is complete. Crews scheduled for pouring phase.',
        sender: 'authority'
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Robert Vance', points: 410, reportsSubmitted: 14, verificationsCompleted: 35, badge: 'Infrastructure Inspector', badgeColor: 'bg-red-500/10 text-red-600' },
  { rank: 2, name: 'David Kim', points: 320, reportsSubmitted: 11, verificationsCompleted: 22, badge: 'Eco Warden', badgeColor: 'bg-green-500/10 text-green-600' },
  { rank: 3, name: 'Sarah Jenkins', points: 240, reportsSubmitted: 8, verificationsCompleted: 15, badge: 'Water Watchdog', badgeColor: 'bg-blue-500/10 text-blue-600' },
  { rank: 4, name: 'Marcus Chen', points: 150, reportsSubmitted: 5, verificationsCompleted: 11, badge: 'Asphalt Patrol', badgeColor: 'bg-amber-500/10 text-amber-600' },
  { rank: 5, name: 'Elena Rostova', points: 90, reportsSubmitted: 3, verificationsCompleted: 8, badge: 'Grid Guardian', badgeColor: 'bg-purple-500/10 text-purple-600' }
];

export const INITIAL_PREDICTIVE_INSIGHTS: PredictiveInsight[] = [
  {
    id: 'p-1',
    title: 'High Risk of Main Water Pipe Burst',
    sector: 'Sector 4 (Northside)',
    category: 'water_leakage',
    riskProbability: 84,
    triggerFactors: ['Consecutive ground pressure sensors warning shifts', '3 minor pavement moisture warnings log past week', '64-year-old high-pressure main line section'],
    recommendedAction: 'Schedule acoustic leak-detection sweep and deploy pressure-release valves along northern corridor.',
    severity: 'high'
  },
  {
    id: 'p-2',
    title: 'Predicted Pothole Clustering Area',
    sector: 'Sector 2 (Civic Center)',
    category: 'pothole',
    riskProbability: 71,
    triggerFactors: ['High traffic weight loads (freeway detours)', 'Recent water drainage failures causing sub-base dampness', 'Micro-crack detections via mobile vehicle camera mapping'],
    recommendedAction: 'Apply early micro-seal surface coating to center lanes before winter rainfall.',
    severity: 'medium'
  },
  {
    id: 'p-3',
    title: 'Streetlight Cable Degrade Forecast',
    sector: 'Sector 5 (Southside)',
    category: 'streetlight',
    riskProbability: 58,
    triggerFactors: ['Recurring voltage spikes in substation #12', 'Historical circuit outages on parallel lanes', 'Average post age exceeds 25 years'],
    recommendedAction: 'Proactively replace underground relay connections along Elm Ave corridor.',
    severity: 'low'
  }
];

export const CITY_SECTORS = [
  { id: 'sec-1', name: 'Sector 1 (Industrial North)', color: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.4)', activeIssues: 1, hazardRating: 'High' },
  { id: 'sec-2', name: 'Sector 2 (Civic Center)', color: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.4)', activeIssues: 2, hazardRating: 'Medium' },
  { id: 'sec-3', name: 'Sector 3 (Waterfront)', color: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.4)', activeIssues: 1, hazardRating: 'Low' },
  { id: 'sec-4', name: 'Sector 4 (Northside)', color: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.4)', activeIssues: 2, hazardRating: 'High' },
  { id: 'sec-5', name: 'Sector 5 (Southside)', color: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.4)', activeIssues: 2, hazardRating: 'Medium' }
];
