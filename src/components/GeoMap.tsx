import React, { useState } from 'react';
import { Issue, PredictiveInsight } from '../types';
import { MapPin, Info, ShieldAlert, CheckCircle2, ChevronRight, Droplets, Flame, Trash2, HelpCircle, HardHat, Lightbulb, TrendingUp, Share2 } from 'lucide-react';
import { CITY_SECTORS } from '../utils/mockData';
import Tooltip from './Tooltip';

interface GeoMapProps {
  issues: Issue[];
  predictiveInsights: PredictiveInsight[];
  onVoteIssue: (id: string) => void;
  onSelectIssue?: (issue: Issue) => void;
  onShareIssue?: (issue: Issue) => void;
  onInitiateReportAtCoords?: (lat: number, lng: number, sector: string) => void;
  isAccessibilityMode: boolean;
}

export default function GeoMap({
  issues,
  predictiveInsights,
  onVoteIssue,
  onSelectIssue,
  onShareIssue,
  onInitiateReportAtCoords,
  isAccessibilityMode
}: GeoMapProps) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [activePin, setActivePin] = useState<Issue | null>(null);
  const [showPredictiveLayer, setShowPredictiveLayer] = useState<boolean>(true);
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // Map limits for coordinate conversion
  const mapLimits = {
    minLat: 45.500,
    maxLat: 45.530,
    minLng: -122.700,
    maxLng: -122.640
  };

  // Convert lat/lng to SVG percentages
  const getCoordsPercentage = (lat: number, lng: number) => {
    const latRange = mapLimits.maxLat - mapLimits.minLat;
    const lngRange = mapLimits.maxLng - mapLimits.minLng;

    const x = ((lng - mapLimits.minLng) / lngRange) * 100;
    // Latitude goes from bottom to top, SVG coordinates go from top to bottom
    const y = 100 - (((lat - mapLimits.minLat) / latRange) * 100);

    return { 
      x: Math.min(Math.max(x, 5), 95), 
      y: Math.min(Math.max(y, 5), 95) 
    };
  };

  // Convert SVG click coordinates back to Lat/Lng
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    const latRange = mapLimits.maxLat - mapLimits.minLat;
    const lngRange = mapLimits.maxLng - mapLimits.minLng;

    const lng = mapLimits.minLng + (percentX / 100) * lngRange;
    const lat = mapLimits.maxLat - (percentY / 100) * latRange;

    // Detect closest sector
    let sector = "Sector 2 (Civic Center)";
    if (percentX < 50 && percentY < 40) sector = "Sector 1 (Industrial North)";
    else if (percentX >= 50 && percentY < 40) sector = "Sector 4 (Northside)";
    else if (percentX < 45 && percentY >= 65) sector = "Sector 5 (Southside)";
    else if (percentX >= 45 && percentY >= 65) sector = "Sector 3 (Waterfront)";

    setClickCoords({ lat, lng });
    setActivePin(null); // close issue detail when placing temporary pin

    if (onInitiateReportAtCoords) {
      onInitiateReportAtCoords(lat, lng, sector);
    }
  };

  // Get category icon color
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'water_leakage': return { color: 'text-blue-500 bg-blue-50 border-blue-200 hover:bg-blue-100', icon: Droplets };
      case 'pothole': return { color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100', icon: Flame };
      case 'streetlight': return { color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100', icon: Lightbulb };
      case 'waste_management': return { color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100', icon: Trash2 };
      case 'infrastructure': return { color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100', icon: HardHat };
      default: return { color: 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100', icon: HelpCircle };
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white animate-pulse';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-amber-500 text-slate-900';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="geo-map-root">
      {/* Sidebar - Quick info / Controls */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Map Control Widget */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm" id="map-controls-card">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sky-500" />
            Interactive Map Controls
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Click anywhere on the map to automatically pin a coordinate and draft a localized service report.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowPredictiveLayer(!showPredictiveLayer)}
              id="toggle-predictive-layer"
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                showPredictiveLayer 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                AI Infrastructure Risk Layer
              </span>
              <span className={`h-2.5 w-2.5 rounded-full ${showPredictiveLayer ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`}></span>
            </button>
          </div>
        </div>

        {/* Selected Pin Details / Coords Display */}
        {activePin ? (
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4 animate-in fade-in" id="active-pin-info">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getUrgencyBadge(activePin.urgency)}`}>
                {activePin.urgency} Urgency
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ID: {activePin.id}</span>
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-100 line-clamp-2">{activePin.title}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">{activePin.description}</p>
            </div>

            {activePin.imageUrl && (
              <img 
                src={activePin.imageUrl} 
                alt="Issue evidence" 
                className="w-full h-32 object-cover rounded-lg border border-slate-800 bg-slate-950"
                referrerPolicy="no-referrer"
              />
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">LATITUDE</span>
                <span className="text-slate-300 font-medium">{activePin.latitude.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">LONGITUDE</span>
                <span className="text-slate-300 font-medium">{activePin.longitude.toFixed(5)}</span>
              </div>
              <div className="col-span-2 mt-1 pt-1 border-t border-slate-800/50">
                <span className="text-slate-500 block text-[9px] uppercase">SECTOR</span>
                <span className="text-emerald-400 font-medium">{activePin.sector}</span>
              </div>
            </div>

            {/* Quick validation */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-300 font-medium">Verify This Concern</span>
                <span className="text-xs text-sky-400 font-mono font-bold">Score: {activePin.verificationScore}</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2.5 leading-relaxed">
                Has your community experienced this? Verify to elevate response speed and authority ticketing ranking.
              </p>
              <div className="flex gap-2">
                <Tooltip content={activePin.upvotedByUserIds.includes('local-sim') ? 'Withdraw your verification vote' : 'Verify incident authenticity'}>
                  <button
                    onClick={() => {
                      onVoteIssue(activePin.id);
                      // update state locally to reflect vote
                      const hasVoted = activePin.upvotedByUserIds.includes('local-sim');
                      const updated = {
                        ...activePin,
                        upvotedByUserIds: hasVoted 
                          ? activePin.upvotedByUserIds.filter(id => id !== 'local-sim')
                          : [...activePin.upvotedByUserIds, 'local-sim'],
                        upvotes: hasVoted ? activePin.upvotes - 1 : activePin.upvotes + 1,
                        verificationScore: hasVoted ? activePin.verificationScore - 10 : activePin.verificationScore + 10
                      };
                      setActivePin(updated);
                    }}
                    id={`verify-btn-map-${activePin.id}`}
                    aria-label={activePin.upvotedByUserIds.includes('local-sim') ? 'Withdraw verification vote' : 'Verify incident authenticity'}
                    className={`py-1.5 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePin.upvotedByUserIds.includes('local-sim')
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{activePin.upvotedByUserIds.includes('local-sim') ? 'Verified' : 'Verify Issue'}</span>
                  </button>
                </Tooltip>

                {onSelectIssue && (
                  <Tooltip content="Open full interactive resolution card">
                    <button
                      onClick={() => onSelectIssue(activePin)}
                      aria-label="Open full interactive resolution card"
                      className="bg-slate-700 text-white hover:bg-slate-600 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer"
                    >
                      Details
                    </button>
                  </Tooltip>
                )}

                {onShareIssue && (
                  <Tooltip content="Share or publish deep-link">
                    <button
                      onClick={() => onShareIssue(activePin)}
                      aria-label="Share or publish deep-link"
                      className="bg-slate-850 hover:bg-slate-800 text-white p-1.5 rounded transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Share2 className="h-4.5 w-4.5" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        ) : clickCoords ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm animate-in fade-in flex flex-col gap-3" id="click-coords-card">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Coordinate Locked!
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              You selected a custom location on the grid. Ready to report an issue here?
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 border border-emerald-100 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[9px]">LATITUDE</span>
                <span className="text-slate-700 font-bold">{clickCoords.lat.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">LONGITUDE</span>
                <span className="text-slate-700 font-bold">{clickCoords.lng.toFixed(5)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onInitiateReportAtCoords) {
                  // Simulate trigger
                  const percentX = ((clickCoords.lng - mapLimits.minLng) / (mapLimits.maxLng - mapLimits.minLng)) * 100;
                  const percentY = 100 - (((clickCoords.lat - mapLimits.minLat) / (mapLimits.maxLat - mapLimits.minLat)) * 100);
                  let sector = "Sector 2 (Civic Center)";
                  if (percentX < 50 && percentY < 40) sector = "Sector 1 (Industrial North)";
                  else if (percentX >= 50 && percentY < 40) sector = "Sector 4 (Northside)";
                  else if (percentX < 45 && percentY >= 65) sector = "Sector 5 (Southside)";
                  else if (percentX >= 45 && percentY >= 65) sector = "Sector 3 (Waterfront)";
                  
                  onInitiateReportAtCoords(clickCoords.lat, clickCoords.lng, sector);
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              Start Report Draft Here
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-sm flex-1 flex flex-col justify-center items-center gap-3">
            <Info className="h-8 w-8 text-slate-400" />
            <div>
              <p className="text-xs font-bold text-slate-800">No Spot Selected</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-[200px]">
                Click on any sector pin or empty street lane on the map to load district infrastructure data.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Canvas Area */}
      <div className="lg:col-span-8 flex flex-col gap-2">
        <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-t-xl border-x border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-xs font-bold tracking-wide uppercase font-mono">METRO RESOLVE GRID v1.4</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {hoveredSector ? hoveredSector : "Hover over districts to analyze hazards"}
          </span>
        </div>

        <div className="relative bg-slate-950 rounded-b-xl border border-slate-800 shadow-inner overflow-hidden aspect-video w-full">
          {/* Grid Background Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.6),rgba(2,6,23,0.95))] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3vw_3vh] opacity-30 pointer-events-none"></div>

          {/* District Borders & Hazard Overlays */}
          <svg 
            viewBox="0 0 100 100" 
            className="absolute inset-0 w-full h-full cursor-crosshair select-none"
            onClick={handleMapClick}
            id="vector-map-svg"
          >
            {/* Sector 1 (Industrial North) - Top Left */}
            <polygon 
              points="5,5 50,5 45,45 5,45"
              fill={showPredictiveLayer ? 'rgba(239,68,68,0.15)' : 'rgba(71,85,105,0.05)'}
              stroke={hoveredSector === "Sector 1 (Industrial North)" ? "#ef4444" : "#334155"}
              strokeWidth="0.4"
              onMouseEnter={() => setHoveredSector("Sector 1 (Industrial North) - Critical Risk: concrete cracks detected")}
              onMouseLeave={() => setHoveredSector(null)}
              className="transition-colors duration-150"
            />
            
            {/* Sector 4 (Northside) - Top Right */}
            <polygon 
              points="50,5 95,5 95,45 45,45"
              fill={showPredictiveLayer ? 'rgba(99,102,241,0.15)' : 'rgba(71,85,105,0.05)'}
              stroke={hoveredSector === "Sector 4 (Northside)" ? "#6366f1" : "#334155"}
              strokeWidth="0.4"
              onMouseEnter={() => setHoveredSector("Sector 4 (Northside) - High Risk: water pipe pressure stress at 84%")}
              onMouseLeave={() => setHoveredSector(null)}
              className="transition-colors duration-150"
            />

            {/* Sector 2 (Civic Center) - Center Block */}
            <polygon 
              points="20,35 80,35 80,65 20,65"
              fill={showPredictiveLayer ? 'rgba(245,158,11,0.1)' : 'rgba(71,85,105,0.05)'}
              stroke={hoveredSector === "Sector 2 (Civic Center)" ? "#f59e0b" : "#334155"}
              strokeWidth="0.4"
              onMouseEnter={() => setHoveredSector("Sector 2 (Civic Center) - Medium Risk: high pothole clustering index")}
              onMouseLeave={() => setHoveredSector(null)}
              className="transition-colors duration-150"
            />

            {/* Sector 5 (Southside) - Bottom Left */}
            <polygon 
              points="5,45 45,45 45,95 5,95"
              fill={showPredictiveLayer ? 'rgba(139,92,246,0.12)' : 'rgba(71,85,105,0.05)'}
              stroke={hoveredSector === "Sector 5 (Southside)" ? "#8b5cf6" : "#334155"}
              strokeWidth="0.4"
              onMouseEnter={() => setHoveredSector("Sector 5 (Southside) - Medium Risk: aging grid cable voltage drops")}
              onMouseLeave={() => setHoveredSector(null)}
              className="transition-colors duration-150"
            />

            {/* Sector 3 (Waterfront Promenade) - Bottom Right */}
            <polygon 
              points="45,45 95,45 95,95 45,95"
              fill={showPredictiveLayer ? 'rgba(16,185,129,0.08)' : 'rgba(71,85,105,0.05)'}
              stroke={hoveredSector === "Sector 3 (Waterfront)" ? "#10b981" : "#334155"}
              strokeWidth="0.4"
              onMouseEnter={() => setHoveredSector("Sector 3 (Waterfront) - Safe Area: low risk indices")}
              onMouseLeave={() => setHoveredSector(null)}
              className="transition-colors duration-150"
            />

            {/* Simulated Grid Road Lines */}
            <line x1="5" y1="35" x2="95" y2="35" stroke="rgba(148,163,184,0.15)" strokeWidth="0.8" strokeDasharray="1,1" />
            <line x1="5" y1="65" x2="95" y2="65" stroke="rgba(148,163,184,0.15)" strokeWidth="0.8" strokeDasharray="1,1" />
            <line x1="45" y1="5" x2="45" y2="95" stroke="rgba(148,163,184,0.15)" strokeWidth="0.8" strokeDasharray="1,1" />

            {/* Draw temporary click-pin if placing issue */}
            {clickCoords && (
              (() => {
                const percentage = getCoordsPercentage(clickCoords.lat, clickCoords.lng);
                return (
                  <g className="animate-bounce">
                    <circle cx={percentage.x} cy={percentage.y} r="2.5" fill="none" stroke="#10b981" strokeWidth="0.8" />
                    <circle cx={percentage.x} cy={percentage.y} r="1.2" fill="#10b981" />
                  </g>
                );
              })()
            )}
          </svg>

          {/* Render Active Issue Pins */}
          {issues.map(issue => {
            const percentage = getCoordsPercentage(issue.latitude, issue.longitude);
            const isSelected = activePin?.id === issue.id;
            const theme = getCategoryTheme(issue.category);
            const CategoryIcon = theme.icon;

            return (
              <button
                key={issue.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePin(issue);
                  setClickCoords(null);
                }}
                style={{ 
                  left: `${percentage.x}%`, 
                  top: `${percentage.y}%` 
                }}
                id={`map-pin-btn-${issue.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 transition-all duration-150 focus:outline-none"
              >
                {/* Visual Glow Effect */}
                <span className={`absolute -inset-2 rounded-full opacity-30 group-hover:scale-125 transition-transform ${
                  issue.urgency === 'critical' 
                    ? 'bg-red-500 animate-ping' 
                    : issue.urgency === 'high' 
                      ? 'bg-orange-500' 
                      : 'bg-sky-500'
                }`}></span>

                {/* Pin Shape */}
                <div className={`h-7 w-7 rounded-full flex items-center justify-center border shadow-md transition-all ${
                  isSelected 
                    ? 'scale-125 bg-slate-100 border-white text-slate-950 ring-2 ring-sky-500' 
                    : 'bg-slate-900 border-slate-700 text-sky-400 group-hover:bg-slate-800'
                }`}>
                  <CategoryIcon className="h-4 w-4 shrink-0" />
                </div>

                {/* Tiny Pin Leg */}
                <div className={`w-0.5 h-1 mx-auto bg-slate-900 ${isSelected ? 'h-1.5' : ''}`}></div>

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity font-medium z-30 shadow-lg">
                  <p className="font-bold font-sans text-slate-200">{issue.title}</p>
                  <p className="text-[8px] text-sky-400 uppercase tracking-wider font-mono mt-0.5">
                    {issue.category.replace('_', ' ')} • Click details
                  </p>
                </div>
              </button>
            );
          })}

          {/* Render Predictive Risk Highlight Indicators */}
          {showPredictiveLayer && predictiveInsights.map(insight => {
            // Place predictive indicator icons at hardcoded strategic central district points
            let posX = 25;
            let posY = 25;
            if (insight.sector.includes('Sector 4')) { posX = 70; posY = 25; }
            else if (insight.sector.includes('Sector 2')) { posX = 50; posY = 50; }
            else if (insight.sector.includes('Sector 5')) { posX = 25; posY = 70; }
            else if (insight.sector.includes('Sector 3')) { posX = 70; posY = 70; }

            return (
              <div
                key={insight.id}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
              >
                <div className="bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 rounded-lg p-2 flex items-center gap-1.5 text-[9px] font-mono shadow-md backdrop-blur-sm animate-pulse max-w-[120px]">
                  <ShieldAlert className="h-3 w-3 text-indigo-400 shrink-0" />
                  <div>
                    <p className="font-bold leading-tight">AI PREDICT</p>
                    <p className="text-slate-400 font-sans leading-none mt-0.5">{insight.riskProbability}% Risk</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Map Overlay Key Legend */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-mono text-slate-400 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>Critical Urgency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              <span>High Urgency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>Medium / Low</span>
            </div>
            {showPredictiveLayer && (
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-indigo-300">AI Predictive Alerts Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
