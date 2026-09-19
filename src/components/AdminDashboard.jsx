import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8000/api'
  : 'http://localhost:8000/api';

const MOCK_FALLBACK = {
  _isMock: true,
  total_officials: 124,
  avg_readiness_score: 63.4,
  training_completion_rate: 58.2,
  department_breakdown: {
    'NSSO': 38, 'CSO': 27, 'MOSPI HQ': 22,
    'State Directorates': 18, 'NSSTA': 12, 'Unassigned': 7,
  },
  top_skill_gaps: [
    { skill: 'Statistical Sampling Methodology', officials_affected: 71 },
    { skill: 'Python & Data Analysis', officials_affected: 64 },
    { skill: 'Cloud Infrastructure (NIC / Meghraj)', officials_affected: 55 },
    { skill: 'Docker & Kubernetes', officials_affected: 48 },
    { skill: 'SQL & Database Design', officials_affected: 42 },
    { skill: 'Machine Learning Fundamentals', officials_affected: 37 },
    { skill: 'Power BI / Tableau', officials_affected: 31 },
    { skill: 'Digital Governance Frameworks', officials_affected: 26 },
  ],
  domain_distribution: [
    { domain: 'Statistical Competencies', avg_readiness: 58.3, officials_with_gaps: 82 },
    { domain: 'Technical Competencies', avg_readiness: 61.7, officials_with_gaps: 74 },
    { domain: 'Digital Governance', avg_readiness: 54.1, officials_with_gaps: 93 },
    { domain: 'Behavioural & Managerial Competencies', avg_readiness: 79.5, officials_with_gaps: 31 },
  ],
};

const DOMAIN_COLORS = {
  'Statistical Competencies':              { bar: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200',  icon: 'bar-chart-3' },
  'Technical Competencies':               { bar: 'bg-blue-600',   text: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'cpu' },
  'Digital Governance':                   { bar: 'bg-emerald-500',text: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'shield' },
  'Behavioural & Managerial Competencies':{ bar: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'users' },
};

function HBarChart({ data, valueKey, labelKey, maxValue, barColorClass }) {
  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const pct = maxValue > 0 ? Math.round((item[valueKey] / maxValue) * 100) : 0;
        return (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[65%]">{item[labelKey]}</span>
              <span className="text-xs font-bold text-slate-900">{item[valueKey]}</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className={`${barColorClass} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon, label, value, sub, iconBg, iconColor, valueColor, barColor, progress }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon name={icon} size={20} className={iconColor} />
        </div>
      </div>
      <span className={`text-4xl font-extrabold font-display ${valueColor}`}>{value}</span>
      {progress !== undefined && (
        <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
          <div className={`${barColor} h-full rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
        </div>
      )}
      {sub && <p className="text-[11px] text-slate-500 mt-2">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard({ setActivePage, showToast }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setAccessDenied(false);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/admin/overview`, { headers });
        if (res.status === 403) {
          if (mounted) { setAccessDenied(true); setLoading(false); }
          return;
        }
        if (res.status === 401) {
          if (mounted) { setAccessDenied(true); setLoading(false); }
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) { setData(json); setIsMock(false); }
      } catch (err) {
        console.warn('AdminDashboard: backend unavailable, using sample data.', err);
        if (mounted) { setData(MOCK_FALLBACK); setIsMock(true); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const deptEntries = data
    ? Object.entries(data.department_breakdown || {}).map(([dept, count]) => ({ dept, count })).sort((a, b) => b.count - a.count)
    : [];
  const maxDept = deptEntries[0]?.count ?? 1;
  const maxGap  = data?.top_skill_gaps?.[0]?.officials_affected ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ACCESS DENIED */}
      {accessDenied && (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <Icon name="shield-x" size={32} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Access Denied</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Your account does not have <strong>Administrator</strong> privileges.
              Contact your MoSPI system administrator to request access.
            </p>
          </div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Icon name="arrow-left" size={15} /> Back to Dashboard
          </button>
        </div>
      )}

      {!accessDenied && (
        <>
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold font-display text-slate-900">Admin Overview</h1>
                <span className="text-xs font-bold bg-blue-100 text-brand-900 px-2 py-0.5 rounded-full">MoSPI PS-101</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">Organisation-wide workforce competency metrics &amp; training effectiveness</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setData(null); setLoading(true); location.reload(); }}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-all"
              >
                <Icon name="refresh-cw" size={14} /><span>Refresh</span>
              </button>
              <button
                onClick={() => setActivePage('dashboard')}
                className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Icon name="arrow-left" size={14} /><span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* MOCK BANNER */}
          {!loading && isMock && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl px-5 py-4">
              <Icon name="alert-triangle" size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Backend unavailable — showing sample data</p>
                <p className="text-xs mt-0.5 text-amber-800">
                  Could not reach <code className="font-mono bg-amber-100 px-1 rounded">{API_BASE_URL}/admin/overview</code>.
                  Start the FastAPI backend and refresh to see live data.
                </p>
              </div>
            </div>
          )}

          {/* LOADING SKELETON */}
          {loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[0,1,2].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
                    <div className="h-10 bg-slate-100 rounded w-2/3 mb-4" />
                    <div className="h-2 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[0,1].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    {[0,1,2,3,4].map(j => (
                      <div key={j} className="space-y-1.5">
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded w-full" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATA */}
          {!loading && data && (
            <>
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard icon="users"      label="Total Officials"         value={data.total_officials.toLocaleString()} sub="Active profiles in the MoSPI workforce database" iconBg="bg-blue-50"   iconColor="text-brand-900"  valueColor="text-brand-900"  barColor="bg-brand-900"  progress={undefined} />
                <StatCard icon="gauge"      label="Avg. Readiness Score"    value={`${data.avg_readiness_score}%`}        sub="Target benchmark for MoSPI roles: 85%+"          iconBg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-600" barColor="bg-emerald-500" progress={data.avg_readiness_score} />
                <StatCard icon="book-open"  label="Training Completion"     value={`${data.training_completion_rate}%`}   sub="iGOT Karmayogi module completion across all officials"  iconBg="bg-amber-50"  iconColor="text-amber-600"  valueColor="text-amber-500"  barColor="bg-amber-500"  progress={data.training_completion_rate} />
              </div>

              {/* CHART PAIR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-bold text-base font-display text-slate-900">Department Breakdown</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Officials enrolled by department</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon name="building-2" size={16} className="text-brand-900" />
                    </div>
                  </div>
                  {deptEntries.length === 0
                    ? <p className="text-sm text-slate-400 text-center py-8">No department data available</p>
                    : <HBarChart data={deptEntries} labelKey="dept" valueKey="count" maxValue={maxDept} barColorClass="bg-brand-900" />
                  }
                </div>

                {/* Top Skill Gaps */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-bold text-base font-display text-slate-900">Top Skill Gaps</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Most widespread competency deficits across the workforce</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                      <Icon name="alert-triangle" size={16} className="text-red-500" />
                    </div>
                  </div>
                  {(data.top_skill_gaps || []).length === 0
                    ? <p className="text-sm text-slate-400 text-center py-8">No skill gap data available</p>
                    : (
                      <div className="space-y-2.5">
                        {data.top_skill_gaps.map((gap, idx) => {
                          const pct = maxGap > 0 ? Math.round((gap.officials_affected / maxGap) * 100) : 0;
                          const barCls = pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-400';
                          const badgeCls = pct >= 80 ? 'text-red-700 bg-red-50 border-red-200'
                            : pct >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : 'text-slate-600 bg-slate-50 border-slate-200';
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-400 w-4 text-right flex-shrink-0">{idx + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1 gap-2">
                                  <span className="text-xs font-semibold text-slate-800 truncate">{gap.skill}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${badgeCls}`}>
                                    {gap.officials_affected} officials
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className={`${barCls} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  }
                </div>
              </div>

              {/* DOMAIN DISTRIBUTION */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-lg font-display text-slate-900">Domain Distribution</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Average readiness across the 4 PS-101 competency domains</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">4 Core Domains</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {(data.domain_distribution || []).map((domain, idx) => {
                    const colors = DOMAIN_COLORS[domain.domain] || { bar: 'bg-slate-500', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'layers' };
                    const pct = domain.avg_readiness;
                    const readyCls = pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';
                    return (
                      <div key={idx} className={`rounded-2xl p-5 border ${colors.border} ${colors.bg} flex flex-col gap-4`}>
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl bg-white border ${colors.border} flex items-center justify-center shadow-2xs`}>
                            <Icon name={colors.icon} size={16} className={colors.text} />
                          </div>
                          <span className={`text-xs font-bold ${readyCls}`}>{pct}% ready</span>
                        </div>
                        <div>
                          <h3 className={`text-sm font-bold ${colors.text} leading-snug`}>{domain.domain}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">{domain.officials_with_gaps} official{domain.officials_with_gaps !== 1 ? 's' : ''} with gaps</p>
                        </div>
                        <div>
                          <div className="w-full bg-white/70 h-2.5 rounded-full overflow-hidden border border-white/50">
                            <div className={`${colors.bar} h-full rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                            <span>0%</span><span>Target 85%</span><span>100%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
