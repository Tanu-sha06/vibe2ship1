import React, { useState } from 'react';
import { PredictiveInsight } from '../types';
import { ShieldAlert, TrendingUp, Sparkles, Zap, MapPin, RefreshCw, Layers, CheckCircle } from 'lucide-react';

interface PredictiveInsightsProps {
  insights: PredictiveInsight[];
  isAccessibilityMode: boolean;
}

export default function PredictiveInsights({ insights, isAccessibilityMode }: PredictiveInsightsProps) {
  const [activeInsights, setActiveInsights] = useState<PredictiveInsight[]>(insights);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate updating forecasting indices
  const handleRunAiAnalysis = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate minor fluctuation
      const updated = activeInsights.map(insight => ({
        ...insight,
        riskProbability: Math.min(99, Math.max(30, insight.riskProbability + Math.floor(Math.random() * 5) - 2))
      }));
      setActiveInsights(updated);
      setIsRefreshing(false);
    }, 1200);
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-sky-600 bg-sky-50 border-sky-200';
    }
  };

  return (
    <div className="flex flex-col gap-6" id="predictive-insights-root">
      {/* Top AI forecast banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">AI Predictive Planning & Infrastructure Forecasting</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
              CivicResolve consolidates historic incident clusters, citizen reports, and ground sensors to forecast structural hazards before they occur, allowing preventive municipal repairs.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAiAnalysis}
          disabled={isRefreshing}
          id="run-predictive-sweep"
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-md self-end md:self-auto"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
              <span>Simulating sensor sweep...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>Refresh Sensor Forecast</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of predictive cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="predictive-cards-grid">
        {activeInsights.map(insight => (
          <div 
            key={insight.id} 
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            id={`predictive-card-${insight.id}`}
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(insight.severity)}`}>
                  {insight.severity} Hazard risk
                </span>
                <span className="text-xs font-bold font-mono text-indigo-600">{insight.riskProbability}% Probability</span>
              </div>

              <h4 className={`font-extrabold text-slate-900 leading-snug ${isAccessibilityMode ? 'text-lg' : 'text-sm'}`}>
                {insight.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {insight.sector}
              </p>

              {/* Grid Trigger factors list */}
              <div className="mt-4 bg-slate-50 border border-slate-150 rounded-lg p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                  Forecasting Trigger Conditions
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  {insight.triggerFactors.map((factor, idx) => (
                    <li key={idx} className="leading-tight font-medium pl-1">{factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Preventative Action recommendations */}
            <div className="mt-5 pt-4 border-t border-slate-100 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
              <p className="text-[10px] font-bold uppercase text-indigo-950 font-mono flex items-center gap-1 mb-1.5">
                <Zap className="h-3.5 w-3.5 text-indigo-600" />
                MUNICIPAL PREVENTATIVE ORDER
              </p>
              <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                {insight.recommendedAction}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Safety planning guidelines description block */}
      <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
          <Layers className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 font-mono">
            Preventative Action Guideline for Planners
          </h4>
          <p className="text-xs text-indigo-900 leading-relaxed mt-1 max-w-3xl">
            By analyzing citizen upvote volumes and categorizing descriptions, the system detects micro-trends. For example, three reports of pavement dampness in water_leakage within the same week dynamically updates the "Water Pipe Burst Forecast" risk coefficient, automatically suggesting preventative acoustic sweeper dispatches. This prevents road sinkholes and saves millions in emergency repair bills.
          </p>
        </div>
      </div>
    </div>
  );
}
