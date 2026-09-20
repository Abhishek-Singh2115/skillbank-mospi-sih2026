import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import SkillRadarChart from './SkillRadarChart';
import { IGOT_COURSES, ALL_RECOMMENDED_ROLES, JOB_ROLES_LIST } from '../utils/constants';

// ==========================================
// NATIONAL SKILLING COMMAND CENTER — DASHBOARD
// ==========================================
export default function Dashboard({ setActivePage, userState, showToast, onOpenTopicQuiz, setAuthModalOpen }) {
  const { isAuthenticated, user } = useAuth();
  const [sidebarTab, setSidebarTab] = useState('overview');

  // --- DYNAMIC RADAR: axes derived from the user's actual target role skills ---
  const { radarLabels, currentScores, benchmarkScores } = useMemo(() => {
    const known = userState?.knownSkills || [];
    const missing = userState?.missingSkills || [];
    const targetRoleName = userState?.targetRole;

    // Try to find the full requiredSkills list for this role from the registry
    const allRoles = typeof JOB_ROLES_LIST !== 'undefined' ? JOB_ROLES_LIST : ALL_RECOMMENDED_ROLES;
    const roleRecord = allRoles.find(
      r => r.title === targetRoleName || r.title?.toLowerCase() === targetRoleName?.toLowerCase()
    );
    const requiredSkills = roleRecord?.requiredSkills || [];

    // Build the axis skill list: prefer required skills (gaps first, then known), fall back to union of known+missing
    let allRelevantSkills = requiredSkills.length > 0
      ? [
          // Show gap skills first (higher visual impact)
          ...requiredSkills.filter(s => missing.some(m => m.toLowerCase() === s.toLowerCase())),
          ...requiredSkills.filter(s => known.some(k => k.toLowerCase() === s.toLowerCase())),
        ]
      : [...missing, ...known.filter(k => !missing.includes(k))];

    // Deduplicate and cap at 6 axes for readability
    allRelevantSkills = Array.from(new Set(allRelevantSkills)).slice(0, 6);

    // Need at least 3 axes for a valid polygon; if still empty show a placeholder
    if (allRelevantSkills.length < 3) {
      return {
        radarLabels: ["Competency 1", "Competency 2", "Competency 3"],
        currentScores: [40, 40, 40],
        benchmarkScores: [85, 85, 85],
      };
    }

    const knownSet = new Set(known.map(s => s.toLowerCase()));
    const scores = allRelevantSkills.map(skill =>
      knownSet.has(skill.toLowerCase()) ? 85 : 10
    );
    const benchmarks = allRelevantSkills.map(() => 85);

    return {
      radarLabels: allRelevantSkills,
      currentScores: scores,
      benchmarkScores: benchmarks,
    };
  }, [userState?.knownSkills, userState?.missingSkills, userState?.targetRole]);

  // If user is not authenticated AND no userState prop provided, show sign-in prompt.
  // If userState is provided (dev/mock mode via App.jsx MOCK_USER_STATE), render fully.
  const effectiveUser = user || userState;
  if (!effectiveUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-900 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
            <Icon name="lock" size={28} />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Google Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
            Please sign in with your official Google account to sync your MoSPI candidate profile and access your personalized National Skilling Command Center.
          </p>
          <button
            onClick={() => setAuthModalOpen ? setAuthModalOpen(true) : null}
            className="px-6 py-3 bg-brand-900 hover:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <Icon name="log-in" size={16} />
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card sticky top-24">
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
              {userState.picture ? (
                <img 
                  src={userState.picture} 
                  alt={userState.name} 
                  className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200 flex-shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-900 to-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm flex-shrink-0">
                  {userState.name ? userState.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CP'}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-slate-900 truncate">{userState.name || "Candidate Profile"}</h4>
                <p className="text-xs text-slate-500 truncate">{userState.email || "Candidate #101-MoSPI"}</p>
                <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Google Identity
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSidebarTab('overview')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  sidebarTab === 'overview' 
                    ? 'bg-brand-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="layout-dashboard" size={16} />
                  <span>Overview</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${sidebarTab === 'overview' ? 'bg-blue-800 text-amber-400' : 'bg-slate-100 text-slate-500'}`}>Live</span>
              </button>

              <button
                onClick={() => setActivePage('analyzer')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-brand-900 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="sparkles" size={16} className="text-amber-500" />
                  <span>Skill Analyzer</span>
                </div>
                <Icon name="arrow-up-right" size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => setActivePage('quiz')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-brand-900 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="help-circle" size={16} className="text-blue-600" />
                  <span>AI Quiz Generator</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">New</span>
              </button>

              <button
                onClick={() => {
                  setSidebarTab('courses');
                  showToast("Loaded 4 recommended iGOT modules");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  sidebarTab === 'courses' 
                    ? 'bg-brand-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="book-open" size={16} />
                  <span>Recommended Courses</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">4</span>
              </button>

              <button
                onClick={() => {
                  setSidebarTab('profile');
                  showToast("Academic Profile & Transcripts");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  sidebarTab === 'profile' 
                    ? 'bg-brand-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon name="user" size={16} />
                  <span>Officer / Student Profile</span>
                </div>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => setActivePage('admin')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon name="shield" size={16} className="text-violet-600" />
                    <span>Admin Panel</span>
                  </div>
                  <Icon name="arrow-up-right" size={14} className="text-slate-400" />
                </button>
              )}

            </div>

            <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-1">
                <Icon name="award" size={16} />
                <span>iGOT Karmayogi Sync</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed mb-3">
                iGOT integration: demo catalogue
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN COMMAND CENTER CONTENT */}
        <div className="flex-1 space-y-8">

          {/* ================================================ */}
          {/* OVERVIEW TAB */}
          {/* ================================================ */}
          {sidebarTab === 'overview' && (<>

          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold font-display text-slate-900">
                  Welcome back, {userState.name ? userState.name.split(' ')[0] : 'Candidate'}!
                </h2>
                <span className="text-xs font-bold bg-blue-100 text-brand-900 px-2 py-0.5 rounded-full">MoSPI PS-101</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Active Target: <strong className="text-slate-800">{userState.targetRole}</strong> | Academic Baseline: <span className="text-slate-700">{userState.degree}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('analyzer')}
                className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Icon name="refresh-cw" size={14} />
                <span>Re-evaluate Gaps</span>
              </button>
            </div>
          </div>

          {/* TOP 3 SUMMARY METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Card 1: Readiness Score */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Industry Readiness</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-900 flex items-center justify-center">
                  <Icon name="gauge" size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold font-display text-brand-900">{userState.readinessScore}%</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <Icon name="trending-up" size={14} /> +12% MoM
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-brand-900 h-full rounded-full transition-all duration-1000" style={{ width: `${userState.readinessScore}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Target benchmark for MoSPI roles: 85%+</p>
            </div>

            {/* Card 2: Identified Gaps */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Identified Skill Gaps</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Icon name="alert-triangle" size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold font-display text-amber-500">{userState.identifiedGapsCount}</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  High Priority
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {userState.missingSkills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Actionable courses ready on iGOT</p>
            </div>

            {/* Card 3: Modules Completed */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden">
              {(() => {
                const completed = userState.modulesCompleted || 0;
                const total = userState.totalModules || 0;
                const pct = total > 0 ? Math.round((completed / total) * 100) : null;
                const pending = total > 0 ? total - completed : null;
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Modules Completed</span>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Icon name="check-circle-2" size={20} />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold font-display text-emerald-600">{completed}</span>
                      <span className="text-slate-400 text-lg font-bold">/ {total > 0 ? total : 0} modules</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${pct !== null ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                        {pct !== null ? `${pct}% Done` : 'Not started'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: pct !== null ? `${pct}%` : '0%' }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      {pct === null
                        ? 'Complete the Skill Analyzer to track module progress.'
                        : pending === 0
                          ? 'All modules complete — ready for Master Certification!'
                          : `${pending} module${pending !== 1 ? 's' : ''} pending for Master Certification`}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

          {/* RADAR CHART & COMPETENCY BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Radar Chart Component */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg font-display text-slate-900">Skill Competency Radar</h3>
                  <p className="text-xs text-slate-500">Student Profile vs. Industry Standards Benchmark</p>
                </div>
                <button 
                  onClick={() => showToast("Updated radar polygon based on latest evaluation", "info")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Icon name="zoom-in" size={14} /> Full View
                </button>
              </div>
              
              <div className="py-2">
                <SkillRadarChart 
                  labels={radarLabels}
                  currentScores={currentScores}
                  benchmarkScores={benchmarkScores}
                />
              </div>
            </div>

            {/* Right: Key Gaps & Quick Bridges */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base font-display text-slate-900">Critical Skill Gaps</h3>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Immediate Action
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Dynamic: top 3 missing skills from real analysis */}
                  {(userState?.missingSkills?.length > 0 ? userState.missingSkills : ["Docker & Kubernetes", "MoSPI Sampling Methods", "Cloud Infrastructure"])
                    .slice(0, 3)
                    .map((skill, idx) => {
                      const styles = [
                        { border: 'border-red-200', bg: 'bg-red-50/50', textColor: 'text-red-700', icon: 'x-circle', label: 'Deficit' },
                        { border: 'border-amber-200', bg: 'bg-amber-50/50', textColor: 'text-amber-800', icon: 'alert-circle', label: 'Gap' },
                        { border: 'border-orange-200', bg: 'bg-orange-50/50', textColor: 'text-orange-800', icon: 'alert-triangle', label: 'Gap' },
                      ];
                      const s = styles[idx] || styles[2];
                      return (
                        <div key={idx} className={`p-3.5 rounded-xl border ${s.border} ${s.bg}`}>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                            <span className={`flex items-center gap-1.5 ${s.textColor}`}>
                              <Icon name={s.icon} size={14} /> {skill}
                            </span>
                            <span className={s.textColor}>{s.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mb-2">Identified as a key gap for your target role by the MoSPI competency matrix.</p>
                          <button
                            onClick={() => onOpenTopicQuiz ? onOpenTopicQuiz(skill) : setActivePage('quiz')}
                            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                          >
                            Generate AI Quiz on {skill.split(' ')[0]} <Icon name="arrow-right" size={12} />
                          </button>
                        </div>
                      );
                    })
                  }

                  {/* Acquired skills indicator — only shown after a real analysis */}
                  {userState?.knownSkills?.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <Icon name="check-circle-2" size={14} /> {userState.knownSkills.length} Skills Verified
                        </span>
                        <span className="text-emerald-600 font-bold">{userState.readinessScore}% Ready</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {userState.knownSkills.slice(0, 3).join(', ')}{userState.knownSkills.length > 3 ? ` +${userState.knownSkills.length - 3} more` : ''} confirmed by MoSPI competency analysis.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* PS-101 Domain Readiness — 2×2 mini-card grid (shown after real API analysis) */}
              {userState?.domainBreakdown?.length > 0 && (() => {
                const DOMAIN_COLORS = {
                  "Statistical Competencies":           { dot: "bg-purple-500", bar: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50/70",  border: "border-purple-100" },
                  "Technical Competencies":             { dot: "bg-indigo-500", bar: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50/70",  border: "border-indigo-100" },
                  "Digital Governance":                 { dot: "bg-emerald-500", bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50/70", border: "border-emerald-100" },
                  "Behavioural & Managerial Competencies": { dot: "bg-amber-500", bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50/70",   border: "border-amber-100" },
                };
                const SHORT = {
                  "Statistical Competencies": "Statistical",
                  "Technical Competencies": "Technical",
                  "Digital Governance": "Digital Gov.",
                  "Behavioural & Managerial Competencies": "Behavioural",
                };
                return (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-900 inline-block"></span>
                        PS-101 Domain Readiness
                      </span>
                      <span className="text-[10px] text-slate-400">4 official domains</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {userState.domainBreakdown.map((d, i) => {
                        const color = DOMAIN_COLORS[d.domain] || { dot: "bg-slate-400", bar: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" };
                        const shortName = SHORT[d.domain] || d.domain.split(' ')[0];
                        const score = typeof d.readiness_score === 'number' ? Math.round(d.readiness_score) : 0;
                        const acquired = d.acquired?.length ?? 0;
                        const total = acquired + (d.missing?.length ?? 0);
                        return (
                          <div key={i} className={`p-2.5 rounded-xl border ${color.border} ${color.bg}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`}></span>
                              <span className={`text-[10px] font-bold truncate ${color.text}`}>{shortName}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1.5">
                              <span className="text-sm font-extrabold text-slate-800">{score}%</span>
                              <span className="text-[9px] text-slate-400 font-medium">{acquired}/{total}</span>
                            </div>
                            <div className="w-full bg-white/60 h-1 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${color.bar}`} style={{ width: `${score}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={() => setActivePage('analyzer')}
                className="w-full mt-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Detailed Roadmap</span>
                <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </div>

          {/* RECENT ACTIVITY TIMELINE */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg font-display text-slate-900">Recent Platform Activity</h3>
                <p className="text-xs text-slate-500">Live chronological logs of quizzes taken and courses enrolled</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                Last 7 Days
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {userState.recentActivity.map(item => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-brand-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white shadow-2xs ${item.color}`}>
                        <Icon name={item.icon} size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500">{item.status || `Result: ${item.score}`}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 sm:self-center pl-10 sm:pl-0">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          </>)}

          {/* ================================================ */}
          {/* RECOMMENDED COURSES TAB */}
          {/* ================================================ */}
          {sidebarTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
                <div>
                  <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
                    Recommended Courses
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">iGOT Karmayogi</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Courses matched to your identified skill gaps and target role</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Icon name="book-open" size={20} className="text-amber-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {IGOT_COURSES.map((course) => {
                  const levelColors = {
                    'Beginner-Intermediate': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Intermediate': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Advanced': 'bg-red-50 text-red-700 border-red-200',
                  };
                  const badgeColors = {
                    'Govt Certified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Official MoSPI': 'bg-brand-900/10 text-brand-900 border-brand-900/20',
                  };
                  return (
                    <div key={course.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-slate-900 leading-snug">{course.title}</h3>
                          <p className="text-[11px] text-slate-500 mt-1">{course.provider}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${badgeColors[course.badge] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {course.badge}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {course.skillsCovered.map((skill, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">{skill}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Icon name="clock" size={12} /> {course.duration}</span>
                          <span className="flex items-center gap-1"><Icon name="layers" size={12} /> {course.modules} modules</span>
                          <span className="flex items-center gap-1"><Icon name="users" size={12} /> {course.enrolledCount} enrolled</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelColors[course.level] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {course.level}
                        </span>
                      </div>

                      <button
                        onClick={() => showToast(`Enrolled in: ${course.title}`)}
                        className="w-full py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Icon name="play" size={13} />
                        Enroll on iGOT Karmayogi
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================ */}
          {/* PROFILE TAB */}
          {/* ================================================ */}
          {sidebarTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
                <div>
                  <h2 className="text-2xl font-bold font-display text-slate-900">Officer / Student Profile</h2>
                  <p className="text-xs text-slate-500 mt-1">Academic baseline and MoSPI candidate details</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Icon name="user" size={20} className="text-brand-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Identity Card */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col items-center text-center gap-4">
                  {userState.picture ? (
                    <img src={userState.picture} alt={userState.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-900 to-blue-600 text-white font-bold flex items-center justify-center text-2xl shadow-sm">
                      {userState.name ? userState.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CP'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 font-display">{userState.name || 'Candidate'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{userState.email || '—'}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Verified Google Identity
                    </span>
                  </div>
                  <div className="w-full pt-4 border-t border-slate-100 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Icon name="graduation-cap" size={14} className="text-brand-900 flex-shrink-0" />
                      <span className="font-semibold text-slate-800">{userState.degree || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Icon name="target" size={14} className="text-amber-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 leading-snug">{userState.targetRole || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Stats & Progress */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                    <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                      <Icon name="gauge" size={16} className="text-brand-900" /> Performance Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="text-2xl font-extrabold font-display text-brand-900">{userState.readinessScore}%</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">Industry Readiness</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="text-2xl font-extrabold font-display text-amber-500">{userState.identifiedGapsCount}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">Skill Gaps</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="text-2xl font-extrabold font-display text-emerald-600">{userState.modulesCompleted}<span className="text-sm text-slate-400 font-bold">/{userState.totalModules}</span></div>
                        <div className="text-[10px] text-slate-500 mt-1 font-medium">Modules Done</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                    <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                      <Icon name="alert-triangle" size={16} className="text-amber-500" /> Identified Skill Gaps
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(userState.missingSkills || []).map((skill, i) => (
                        <span key={i} className="text-xs font-semibold bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
                          {skill}
                        </span>
                      ))}
                      {(!userState.missingSkills || userState.missingSkills.length === 0) && (
                        <span className="text-xs text-slate-500 italic">No gaps identified yet. Run the Skill Analyzer first.</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                    <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                      <Icon name="shield" size={16} className="text-emerald-600" /> Compliance & Verification
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Google Identity Verified', status: true },
                        { label: 'MoSPI PS-101 Enrolled', status: true },
                        { label: 'iGOT Karmayogi Synced', status: false },
                        { label: 'DigiLocker Transcript Linked', status: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-medium">{item.label}</span>
                          <span className={`font-bold flex items-center gap-1 ${ item.status ? 'text-emerald-600' : 'text-slate-400' }`}>
                            <Icon name={item.status ? 'check-circle-2' : 'circle'} size={14} />
                            {item.status ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
