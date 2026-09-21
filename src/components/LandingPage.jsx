import React, { useState } from 'react';
import Icon from './Icon';
import { TARGET_ROLES, MOSPI_OFFICIAL_ROLES, JOB_ROLES_LIST } from '../utils/constants';
import { DEGREES_LIST } from '../data/degrees';

const QUICK_ROLES = [
  { id: "fullstack", title: "Full Stack Web Developer" },
  { id: "dataanalyst", title: "MoSPI Statistical Data Analyst" },
  { id: "aiml", title: "AI / ML Solutions Engineer" },
  { id: "cloud", title: "Cloud & DevOps Architect" }
];

export default function LandingPage({ setActivePage, showToast, userState, setUserState, isAuthenticated, setAuthModalOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    
    const degrees = (DEGREES_LIST || []).filter(deg => 
      (deg.name && deg.name.toLowerCase().includes(query)) ||
      (deg.code && deg.code.toLowerCase().includes(query)) ||
      (deg.stream && deg.stream.toLowerCase().includes(query))
    ).map(deg => ({ type: 'degree', label: deg.name, subtitle: deg.stream, item: deg }));

    const roles = (JOB_ROLES_LIST || []).filter(role => 
      (role.title && role.title.toLowerCase().includes(query)) ||
      (role.category && role.category.toLowerCase().includes(query)) ||
      (role.requiredSkills && role.requiredSkills.some(s => s.toLowerCase().includes(query)))
    ).map(role => ({ type: 'role', label: role.title, subtitle: role.category, item: role }));

    const mospiRoles = (MOSPI_OFFICIAL_ROLES || []).filter(role => 
      (role.title && role.title.toLowerCase().includes(query)) ||
      (role.category && role.category.toLowerCase().includes(query)) ||
      (role.requiredSkills && role.requiredSkills.some(s => s.toLowerCase().includes(query)))
    ).map(role => ({ type: 'mospi_role', label: role.title, subtitle: role.category, item: role }));

    return [...degrees, ...roles, ...mospiRoles];
  }, [searchQuery]);

  const hasExactMatch = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [...(DEGREES_LIST || []).map(d => d.name), ...(JOB_ROLES_LIST || []).map(r => r.title), ...(MOSPI_OFFICIAL_ROLES || []).map(r => r.title)]
      .some(t => t && t.toLowerCase() === query);
  }, [searchQuery]);

  const handleSelect = (result) => {
    requireAuth(() => {
      if (result.type === 'degree') {
        setUserState(prev => ({ ...prev, degree: result.label, isOfficial: false, forceStep: null }));
        showToast(`Degree set to: ${result.label}`);
      } else if (result.type === 'role') {
        setUserState(prev => ({ 
          ...prev, 
          targetRole: result.label,
          readinessScore: undefined,
          missingSkills: [],
          isOfficial: false,
          forceStep: 2
        }));
        showToast(`Target role set to: ${result.label}`);
      } else if (result.type === 'mospi_role') {
        setUserState(prev => ({ 
          ...prev, 
          targetRole: result.label,
          readinessScore: undefined,
          missingSkills: [],
          isOfficial: true,
          forceStep: 2
        }));
        showToast(`Govt Role set to: ${result.label}`);
      } else if (result.type === 'custom') {
        setUserState(prev => ({ ...prev, degree: result.label, isOfficial: false, forceStep: null }));
        showToast(`Custom entry set to: ${result.label}`);
      }
      setSearchQuery(result.label);
      setIsDropdownOpen(false);
      setActivePage('analyzer');
    });
  };

  // Guard helper: require login before navigating to protected pages
  const requireAuth = (action) => {
    if (!isAuthenticated) {
      showToast('🔒 Please sign in first to access this feature.');
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  const handleQuickSearch = (roleTitle) => {
    requireAuth(() => {
      setUserState(prev => ({ 
        ...prev, 
        targetRole: roleTitle,
        readinessScore: undefined,
        missingSkills: []
      }));
      setActivePage('analyzer');
      showToast(`Target role set to: ${roleTitle}`);
    });
  };

  return (
    <div className="relative">
      {/* HERO SECTION */}
      <section className="hero-pattern border-b border-slate-200/80 pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-gradient-to-r from-blue-400/10 via-amber-300/15 to-blue-600/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.15] mb-6">
            Bridge the Gap Between <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-900 via-blue-600 to-amber-600">
              Education and Industry
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Empowering Indian graduates and professionals with real-time competency mapping, AI syllabus-driven assessments, and certified skilling pathways aligned with <strong className="text-slate-800">MoSPI</strong> & <strong className="text-slate-800">iGOT Karmayogi</strong>.
          </p>

          {/* Dynamic Search & Input Box */}
          <div className="max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-200/90 mb-6 transition-all hover:border-blue-400 relative" ref={dropdownRef}>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2.5 px-3 py-2 flex-1 w-full">
                <Icon name="search" size={20} className="text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (isAuthenticated) setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (!isAuthenticated) {
                      showToast('🔒 Please sign in first to use the analyzer.');
                      setAuthModalOpen(true);
                    } else {
                      setIsDropdownOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsDropdownOpen(false);
                  }}
                  placeholder={isAuthenticated ? "What is your current degree or target role? (e.g. B.Tech, Data Analyst)" : "Sign in to start your skill analysis..."}
                  className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                  readOnly={!isAuthenticated}
                />
              </div>
              <button
                onClick={() => requireAuth(() => {
                  if (searchQuery.trim()) {
                    setUserState(prev => ({ ...prev, degree: searchQuery }));
                  }
                  setActivePage('analyzer');
                })}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Analyze My Skills</span>
                <Icon name="sparkles" size={16} className="text-amber-400" />
              </button>
            </div>

            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                {/* Custom Entry Fallback */}
                {!hasExactMatch && (
                  <div
                    onClick={() => handleSelect({ type: 'custom', label: searchQuery.trim() })}
                    className="p-3.5 px-4 bg-gradient-to-r from-amber-500/10 via-brand-50/50 to-white hover:from-amber-500/20 hover:to-blue-50/90 border-b border-slate-100 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                        <Icon name="plus" size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Custom Entry</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          Continue with <span className="font-bold text-brand-900 underline decoration-amber-500">"{searchQuery.trim()}"</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(result)}
                        className="p-3 px-4 cursor-pointer transition-all flex items-center justify-between hover:bg-slate-50/90 text-slate-800"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            result.type === 'degree' ? 'bg-blue-100 text-blue-600' : 
                            result.type === 'mospi_role' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            <Icon name={result.type === 'degree' ? 'graduation-cap' : result.type === 'mospi_role' ? 'shield-check' : 'briefcase'} size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium truncate block">{result.label}</span>
                            <span className="text-[10px] text-slate-400 block">{result.subtitle}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            result.type === 'degree' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            result.type === 'mospi_role' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {result.type === 'degree' ? 'Degree' : result.type === 'mospi_role' ? 'Govt Role' : 'Industry Role'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Icon name="search" size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No matches found &mdash; you can still continue</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use the "Custom Entry" option above to proceed with your exact degree or role.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Popular Targets:</span>
            {QUICK_ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => handleQuickSearch(role.title)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-brand-900 font-medium transition-all shadow-2xs"
              >
                {role.title}
              </button>
            ))}
          </div>
        </div>

        {/* National Impact Metrics Bar */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-brand-900">540+</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Accredited Curricula Mapped</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-amber-500">94.6%</div>
            <div className="text-xs text-slate-500 font-medium mt-1">NCO-2015 Placement Alignment</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-blue-600">1,280+</div>
            <div className="text-xs text-slate-500 font-medium mt-1">iGOT Karmayogi Courses</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600">3.2 Sec</div>
            <div className="text-xs text-slate-500 font-medium mt-1">AI Syllabus Gap Diagnosis</div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID (3 Modern Cards) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Core Architectural Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 mt-4 mb-4">
            Engineered for National Impact
          </h2>
          <p className="text-slate-600 text-base">
            SkillBank connects tertiary education institutions, government statistical bodies, and private tech enterprise into an automated competency ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: AI-Powered Competency Mapping */}
          <div className="group bg-white rounded-2xl p-7 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 relative flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-900 mb-6 group-hover:scale-110 group-hover:bg-brand-900 group-hover:text-amber-400 transition-all">
                <Icon name="network" size={28} />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Semantic Analysis</span>
              <h3 className="text-xl font-bold font-display text-slate-900 mt-1 mb-3">
                1. AI-Powered Competency Mapping
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Our semantic NLP engine parses university syllabi against live industry vacancies and MoSPI statistical standards, identifying deficits in frameworks, libraries, and analytical rigor.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-900 group-hover:text-blue-600">
              <span
                onClick={() => requireAuth(() => setActivePage('analyzer'))}
                className="cursor-pointer flex items-center gap-1"
              >
                Try Competency Mapper <Icon name="chevron-right" size={14} />
              </span>
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px]">Real-time</span>
            </div>
          </div>

          {/* Feature 2: Auto-Generated PDF Quizzes */}
          <div className="group bg-white rounded-2xl p-7 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 relative flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <Icon name="file-question" size={28} />
              </div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Bloom's Taxonomy Assessment</span>
              <h3 className="text-xl font-bold font-display text-slate-900 mt-1 mb-3">
                2. Auto-Generated PDF Quizzes
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Simply drop any university syllabus, lecture note, or MoSPI handbook PDF. SkillBank formulates instant, context-aware MCQs with explanatory feedback to validate genuine mastery.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
              <span
                onClick={() => requireAuth(() => setActivePage('quiz'))}
                className="cursor-pointer flex items-center gap-1"
              >
                Launch Quiz Generator <Icon name="chevron-right" size={14} />
              </span>
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px]">Instant AI</span>
            </div>
          </div>

          {/* Feature 3: Official iGOT Karmayogi Integration */}
          <div className="group bg-white rounded-2xl p-7 border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300 relative flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Icon name="award" size={28} />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Government Certifications</span>
              <h3 className="text-xl font-bold font-display text-slate-900 mt-1 mb-3">
                3. Official iGOT Karmayogi Integration
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Directly transforms skill gaps into accredited learning journeys on the iGOT Karmayogi platform. Earn recognized government digital certificates backed by MoSPI and DoPT.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
              <span
                onClick={() => requireAuth(() => setActivePage('analyzer'))}
                className="cursor-pointer flex items-center gap-1"
              >
                View iGOT Pathways <Icon name="chevron-right" size={14} />
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px]">Recognized</span>
            </div>
          </div>
        </div>
      </section>

      {/* STEP-BY-STEP WORKFLOW */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold font-display text-slate-900">How SkillBank Operates</h3>
            <p className="text-slate-500 text-sm mt-1">From academic transcript to certified enterprise readiness in three steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="bg-white p-6 rounded-xl border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-brand-900 text-amber-400 font-bold flex items-center justify-center text-xs mb-4">
                01
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Input Degree & Known Skills</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your degree or upload curriculum documents. Tag the tools and programming frameworks you currently master.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs mb-4">
                02
              </div>
              <h4 className="font-bold text-slate-900 mb-2">AI Gap Detection & Benchmarking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The platform cross-references your profile against active MoSPI and industry benchmarks to pinpoint exact deficit tags.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-4">
                03
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Bridge via iGOT & AI Quizzing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enroll in targeted modular courses and validate your newly acquired competency through automated Bloom's taxonomy quizzes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-brand-900 via-blue-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-4 border border-amber-500/30">
              <Icon name="sparkles" size={14} /> Official Hackathon Prototype
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold font-display mb-4">
              Ready to Benchmark Your Industry Readiness?
            </h3>
            <p className="text-blue-200 text-sm sm:text-base mb-8">
              Get your free personalized Skill Gap Matrix and certified iGOT roadmap in less than 60 seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => requireAuth(() => setActivePage('analyzer'))}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Start Gap Analysis Now</span>
                <Icon name="arrow-right" size={16} />
              </button>
              <button
                onClick={() => requireAuth(() => setActivePage('dashboard'))}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm backdrop-blur-sm transition-all flex items-center gap-2 border border-white/20"
              >
                <span>Explore Sample Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
