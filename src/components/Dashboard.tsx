import React, { useState } from 'react';
import { Issue, Ticket } from '../types';
import { Search, Filter, ArrowUpDown, ChevronRight, Activity, Clock, Users, Flame, Droplets, Trash2, Lightbulb, HardHat, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare, Share2, Download } from 'lucide-react';
import Tooltip from './Tooltip';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface DashboardProps {
  issues: Issue[];
  tickets: Ticket[];
  onVoteIssue: (id: string) => void;
  onSelectIssue: (issue: Issue) => void;
  onShareIssue: (issue: Issue) => void;
  isAccessibilityMode: boolean;
}

export default function Dashboard({
  issues,
  tickets,
  onVoteIssue,
  onSelectIssue,
  onShareIssue,
  isAccessibilityMode
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'votes'>('priority');

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    const matchesUrgency = selectedUrgency === 'all' || issue.urgency === selectedUrgency;

    return matchesSearch && matchesCategory && matchesStatus && matchesUrgency;
  });

  // Calculate priority score for display if not direct from ticket
  const getPriorityScore = (issue: Issue) => {
    const ticket = tickets.find(t => t.issueId === issue.id);
    if (ticket) return ticket.priorityScore;

    let multiplier = 1;
    if (issue.urgency === 'medium') multiplier = 2;
    if (issue.urgency === 'high') multiplier = 3;
    if (issue.urgency === 'critical') multiplier = 4;
    return (multiplier * 15) + (issue.upvotes * 2);
  };

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'priority') {
      return getPriorityScore(b) - getPriorityScore(a);
    } else if (sortBy === 'votes') {
      return b.upvotes - a.upvotes;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Export current filtered/sorted issues as CSV
  const exportToCSV = () => {
    const headers = [
      'Issue ID',
      'Title',
      'Description',
      'Category',
      'Status',
      'Urgency',
      'Latitude',
      'Longitude',
      'Sector',
      'Upvotes',
      'Reporter Name',
      'Reporter Email',
      'Date Logged'
    ];

    const csvRows = [
      headers.join(','),
      ...sortedIssues.map(issue => {
        const row = [
          issue.id,
          `"${issue.title.replace(/"/g, '""')}"`,
          `"${issue.description.replace(/"/g, '""')}"`,
          issue.category,
          issue.status,
          issue.urgency,
          issue.latitude,
          issue.longitude,
          `"${issue.sector.replace(/"/g, '""')}"`,
          issue.upvotes,
          `"${issue.reportedBy.name.replace(/"/g, '""')}"`,
          issue.reportedBy.email,
          new Date(issue.createdAt).toISOString()
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `civicresolve-reports-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate high level stats
  const totalReports = issues.length;
  const activeRepairs = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const resolutionRate = totalReports ? Math.round((resolvedCount / totalReports) * 100) : 0;
  const criticalCount = issues.filter(i => i.urgency === 'critical' && i.status !== 'resolved').length;

  // Category counts for custom bar charts
  const categories = ['pothole', 'water_leakage', 'streetlight', 'waste_management', 'infrastructure'];
  const categoryLabels = {
    pothole: 'Potholes',
    water_leakage: 'Water Leaks',
    streetlight: 'Streetlights',
    waste_management: 'Waste Dept',
    infrastructure: 'Structure'
  };

  const getCategoryCount = (cat: string) => issues.filter(i => i.category === cat).length;
  const maxCategoryCount = Math.max(...categories.map(c => getCategoryCount(c)), 1);

  const totalIssuesCount = issues.length || 1;
  const chartData = categories.map(cat => {
    const count = getCategoryCount(cat);
    return {
      name: categoryLabels[cat as keyof typeof categoryLabels],
      count,
      percentage: Math.round((count / totalIssuesCount) * 100),
      rawCategory: cat
    };
  });

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investigating': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water_leakage': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'pothole': return <Flame className="h-4 w-4 text-amber-600" />;
      case 'streetlight': return <Lightbulb className="h-4 w-4 text-purple-500" />;
      case 'waste_management': return <Trash2 className="h-4 w-4 text-green-500" />;
      case 'infrastructure': return <HardHat className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6" id="dashboard-root">
      {/* High level stats metrics container */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="metric-cards">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-mono">TOTAL ISSUES</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{totalReports}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-mono">ACTIVE CREWS</p>
            <p className="text-xl sm:text-2xl font-black text-purple-600">{activeRepairs}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-mono">RESOLUTION RATE</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600">{resolutionRate}%</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`border p-4 rounded-xl shadow-sm flex items-center gap-3 transition-colors ${
          criticalCount > 0 
            ? 'bg-red-50 border-red-200 animate-pulse' 
            : 'bg-white border-slate-200'
        }`}>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
            criticalCount > 0 ? 'bg-red-100' : 'bg-slate-100'
          }`}>
            <AlertTriangle className={`h-5 w-5 ${criticalCount > 0 ? 'text-red-600' : 'text-slate-600'}`} />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-mono">CRITICAL SAFETY</p>
            <p className={`text-xl sm:text-2xl font-black ${criticalCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
              {criticalCount} Active
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Impact Visualizations Grid */}
      {!isAccessibilityMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
          {/* Chart 1: Recharts Category Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
                DISTRIBUTION BY CATEGORY
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mb-4 uppercase">CITY-WIDE INCIDENT LOAD COMPARISON</p>
            </div>
            <div className="h-[200px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 9 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg shadow-xl text-xs font-sans">
                            <p className="font-extrabold text-slate-100">{data.name}</p>
                            <p className="text-slate-400 mt-1">
                              Reports: <span className="font-bold text-white">{data.count}</span> ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                    cursor={{ fill: '#f8fafc' }} 
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const catColors: Record<string, string> = {
                        pothole: '#f59e0b',
                        water_leakage: '#3b82f6',
                        streetlight: '#a855f7',
                        waste_management: '#22c55e',
                        infrastructure: '#ef4444'
                      };
                      const color = catColors[entry.rawCategory] || '#64748b';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category load */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono mb-4">
              ACTIVE INCIDENTS BY SERVICE TYPE
            </h3>
            <div className="flex flex-col gap-3.5">
              {categories.map(cat => {
                const count = getCategoryCount(cat);
                const percentage = (count / maxCategoryCount) * 100;
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        {getCategoryIcon(cat)}
                        {categoryLabels[cat as keyof typeof categoryLabels]}
                      </span>
                      <span className="font-bold font-mono text-slate-800">{count} reports</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat === 'water_leakage' ? 'bg-blue-500' :
                          cat === 'pothole' ? 'bg-amber-500' :
                          cat === 'streetlight' ? 'bg-purple-500' :
                          cat === 'waste_management' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 3: Glowing Dial Resolution gauge */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono mb-2">
              COMMUNITY RESTORATION PERFORMANCE
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* Radial gauge SVG */}
              <div className="relative h-28 w-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Active progress */}
                  <path
                    className="text-emerald-500 transition-all duration-700"
                    strokeWidth="3.5"
                    strokeDasharray={`${resolutionRate}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                  <span className="text-xl font-black text-slate-900">{resolutionRate}%</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">RESOLVED</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our system auto-dispatches incident alerts to appropriate municipal sanitation and engineering departments. 
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-emerald-50 border border-emerald-100 rounded p-1.5 px-2.5">
                    <span className="text-[9px] text-emerald-800 uppercase block font-mono font-bold">Resolved</span>
                    <span className="text-sm font-black text-emerald-700">{resolvedCount} cases</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded p-1.5 px-2.5">
                    <span className="text-[9px] text-slate-500 uppercase block font-mono font-bold">In Backlog</span>
                    <span className="text-sm font-black text-slate-700">{totalReports - resolvedCount} open</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Request Database Grid & Automated Prioritization Console */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="ticketing-queue">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-2.5 justify-between items-start md:items-center">
            <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Automated Maintenance Ticketing & Service Request Queue
            </h3>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Export Data Button */}
              <Tooltip content="Download current filtered table list as a CSV file">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer border border-emerald-700"
                  id="export-csv-btn"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </Tooltip>

              {/* Sort by selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-mono">SORT BY:</span>
                <div className="flex bg-white border border-slate-200 rounded-md p-0.5">
                  {[
                    { id: 'priority', label: 'Priority Score' },
                    { id: 'votes', label: 'Upvotes' },
                    { id: 'date', label: 'Date Logged' }
                  ].map(sortOption => (
                    <button
                      key={sortOption.id}
                      onClick={() => setSortBy(sortOption.id as any)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                        sortBy === sortOption.id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {sortOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filtering Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket descriptions..."
                id="search-input"
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-850"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              id="category-filter"
              className="text-xs py-2 px-3 border border-slate-200 bg-white rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Service Categories</option>
              <option value="pothole">Potholes</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="streetlight">Streetlight Outage</option>
              <option value="waste_management">Waste Management</option>
              <option value="infrastructure">Public Infrastructure</option>
              <option value="other">Other Concerns</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              id="urgency-filter"
              className="text-xs py-2 px-3 border border-slate-200 bg-white rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Urgency Levels</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Urgency</option>
              <option value="medium">Medium Urgency</option>
              <option value="low">Low Urgency</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              id="status-filter"
              className="text-xs py-2 px-3 border border-slate-200 bg-white rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Dispatch Statuses</option>
              <option value="reported">Reported</option>
              <option value="investigating">Investigating</option>
              <option value="in_progress">Work In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid View */}
        {sortedIssues.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8 text-slate-300" />
            <div>
              <p className="text-sm font-bold text-slate-700">No Service Requests Match Search</p>
              <p className="text-xs text-slate-400 mt-1">Try modifying your filters or submit a new report.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-150">
            {sortedIssues.map((issue, index) => {
              const priorityScore = getPriorityScore(issue);
              const associatedTicket = tickets.find(t => t.issueId === issue.id);
              const commentCount = associatedTicket ? associatedTicket.responseLog.filter(l => l.sender !== 'system').length : 0;
              
              return (
                <div 
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className={`p-4 transition-all hover:bg-slate-50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 animate-staggered-fade ${
                    isAccessibilityMode ? 'border-b-2 border-slate-300' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 45}ms`
                  }}
                  id={`ticket-row-${issue.id}`}
                >
                  {/* Left Side: Priority score and basic details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Priority score indicator badge */}
                    <div 
                      className={`h-11 w-11 shrink-0 rounded-xl flex flex-col items-center justify-center font-mono border ${
                        priorityScore >= 80 
                          ? 'bg-red-50 border-red-200 text-red-600 font-black' 
                          : priorityScore >= 50 
                            ? 'bg-orange-50 border-orange-200 text-orange-600 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                      title="Urgency Score = (Urgency Level factor * 15) + (Upvotes * 2)"
                    >
                      <span className="text-[9px] leading-none uppercase font-semibold">PRIOR</span>
                      <span className="text-base tracking-tight">{priorityScore}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(issue.status)}`}>
                          {issue.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{issue.sector}</span>
                        <span className="text-[10px] text-slate-400 font-mono">• Reported {new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <h4 className={`font-bold text-slate-900 mt-1 truncate ${isAccessibilityMode ? 'text-lg text-slate-950' : 'text-sm'}`}>
                        {issue.title}
                      </h4>
                      <p className={`text-slate-500 mt-0.5 line-clamp-1 ${isAccessibilityMode ? 'text-sm text-slate-800' : 'text-xs'}`}>
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Quick Action status, category and verification badge */}
                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="flex items-center gap-2">
                      {/* Category Badge */}
                      <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                        {getCategoryIcon(issue.category)}
                        <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                      </span>

                      {/* Verification Badge */}
                      <Tooltip content="Total neighborhood resident verification votes">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${
                          issue.verificationStatus === 'verified'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : issue.verificationStatus === 'validating'
                              ? 'bg-blue-50 border-blue-100 text-blue-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <Users className="h-3.5 w-3.5" />
                          <span>{issue.upvotes} Citizens</span>
                        </span>
                      </Tooltip>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Quick validation vote button */}
                      <Tooltip content={issue.upvotedByUserIds.includes('local-sim') ? 'Withdraw your verification vote' : 'Verify incident authenticity'}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVoteIssue(issue.id);
                          }}
                          id={`verify-btn-dash-${issue.id}`}
                          aria-label={issue.upvotedByUserIds.includes('local-sim') ? 'Withdraw verification vote' : 'Verify incident authenticity'}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                            issue.upvotedByUserIds.includes('local-sim')
                              ? 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300'
                              : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>{issue.upvotedByUserIds.includes('local-sim') ? 'Verified' : 'Verify'}</span>
                        </button>
                      </Tooltip>

                      {/* Comment action icon */}
                      <Tooltip content={`View resident discussion (${commentCount} comments)`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          id={`comment-btn-dash-${issue.id}`}
                          aria-label={`View resident discussion, ${commentCount} comments`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shrink-0 flex items-center gap-1 cursor-pointer bg-white"
                        >
                          <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-[10px] font-bold font-mono">{commentCount}</span>
                        </button>
                      </Tooltip>

                      {/* Share action icon */}
                      <Tooltip content="Share or publish deep-link">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareIssue(issue);
                          }}
                          id={`share-btn-dash-${issue.id}`}
                          aria-label="Share or publish deep-link"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shrink-0 cursor-pointer bg-white flex items-center justify-center"
                        >
                          <Share2 className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </Tooltip>

                      {/* View Details action icon */}
                      <Tooltip content="Open full interactive resolution card">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          id={`details-btn-dash-${issue.id}`}
                          aria-label="Open full interactive resolution card"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shrink-0 cursor-pointer bg-white flex items-center justify-center"
                        >
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
