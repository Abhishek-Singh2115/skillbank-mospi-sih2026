import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';
import { QUICK_DEGREES, DEGREES_LIST } from '../data/degrees';

// ──────────────────────────────────────────────────────────────────
// STEP 1 — Degree Selection + Government Official Profile Toggle
// Props:
//   selectedDegree, onSelectDegree, onNext  (existing)
//   officialProfile         — { isOfficial, designation, department, workExperienceYears }
//   onOfficialProfileChange — setter for officialProfile (passed in by SkillGapAnalyzer)
// ──────────────────────────────────────────────────────────────────
export default function Step1DegreeSelection({
  selectedDegree,
  onSelectDegree,
  onNext,
  officialProfile = { isOfficial: false, designation: '', department: '', workExperienceYears: '' },
  onOfficialProfileChange,
}) {
  const [searchQuery, setSearchQuery]     = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState('All');
  const dropdownRef = useRef(null);

  // Sync search input with selected degree
  useEffect(() => {
    if (selectedDegree) {
      setSearchQuery(selectedDegree);
    } else {
      setSearchQuery('');
    }
  }, [selectedDegree]);

  // ── Close dropdown on outside click ────────────────────────────
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Stream filter chips ────────────────────────────────────────
  const streams = [
    'All', 'Engineering', 'Science', 'Commerce', 'Management',
    'IT & Apps', 'Arts', 'Medical', 'Law', 'Vocational', 'Doctoral',
  ];

  const getStreamBadgeColor = (stream) => {
    switch (stream) {
      case 'Engineering':   return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Science':       return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Commerce':      return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Management':    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IT & Apps':     return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Arts':          return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medical':       return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Law':           return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Vocational':    return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Doctoral':      return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Design & Arch': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Education':     return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:              return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const filteredDegrees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return DEGREES_LIST.filter(deg => {
      const matchesStream = selectedStream === 'All' || (deg.stream && deg.stream.toLowerCase() === selectedStream.toLowerCase());
      if (!matchesStream) return false;
      if (!query) return true;
      return (deg.name && deg.name.toLowerCase().includes(query)) ||
             (deg.code && deg.code.toLowerCase().includes(query)) ||
             (deg.stream && deg.stream.toLowerCase().includes(query));
    });
  }, [searchQuery, selectedStream]);

  const hasExactMatch = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return DEGREES_LIST.some(deg => deg.name && deg.name.toLowerCase() === query);
  }, [searchQuery]);

  const handleSelect = (degreeName) => {
    setSearchQuery(degreeName);
    onSelectDegree(degreeName);
    setIsDropdownOpen(false);
  };

  const isCustomDegree = selectedDegree && !DEGREES_LIST.some(d => d.name === selectedDegree);

  // ── Official profile helpers ───────────────────────────────────
  const isOfficial = officialProfile?.isOfficial ?? false;

  const setField = (field, value) => {
    if (onOfficialProfileChange) {
      onOfficialProfileChange(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleOfficial = () => {
    if (onOfficialProfileChange) {
      onOfficialProfileChange(prev => ({ ...prev, isOfficial: !prev.isOfficial }));
    }
  };

  // In official mode the degree is optional; in general mode it is required.
  const canProceed = isOfficial
    ? (officialProfile.designation?.trim().length > 0 && officialProfile.department?.trim().length > 0)
    : !!selectedDegree;

  return (
    <div className="max-w-3xl mx-auto space-y-7">

      {/* ── PROFILE TRACK TOGGLE ──────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Tab header */}
        <div className="flex divide-x divide-slate-200">
          <button
            type="button"
            onClick={() => !isOfficial || toggleOfficial()}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-bold transition-all ${
              !isOfficial
                ? 'bg-brand-900 text-white shadow-inner'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon name="graduation-cap" size={16} />
            <span>Student / General Track</span>
          </button>
          <button
            type="button"
            onClick={() => isOfficial || toggleOfficial()}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-bold transition-all ${
              isOfficial
                ? 'bg-emerald-700 text-white shadow-inner'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Icon name="landmark" size={16} />
            <span>Govt. Official (MoSPI / OSS)</span>
            {isOfficial && (
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            )}
          </button>
        </div>

        {/* Official profile fields — visible only when toggle is ON */}
        {isOfficial && (
          <div className="p-5 border-t border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center">
                <Icon name="shield-check" size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Official Statistics System Profile</p>
                <p className="text-[11px] text-emerald-700">
                  Your assessment will be benchmarked against MoSPI PS-101 competency standards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Designation */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Icon name="badge" size={12} className="text-emerald-600" />
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={officialProfile.designation || ''}
                  onChange={e => setField('designation', e.target.value)}
                  placeholder="e.g. Junior Statistical Officer"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Icon name="building-2" size={12} className="text-emerald-600" />
                  Department / Office <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={officialProfile.department || ''}
                  onChange={e => setField('department', e.target.value)}
                  placeholder="e.g. National Sample Survey Office"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Years of experience */}
            <div className="space-y-1 max-w-xs">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Icon name="clock" size={12} className="text-emerald-600" />
                Years of Experience
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={officialProfile.workExperienceYears || ''}
                  onChange={e => setField('workExperienceYears', e.target.value)}
                  placeholder="e.g. 3.5"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  yrs
                </span>
              </div>
            </div>

            {/* Validation hint */}
            {(!officialProfile.designation?.trim() || !officialProfile.department?.trim()) && (
              <p className="text-[11px] text-amber-700 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                <Icon name="alert-circle" size={13} />
                Designation and Department are required to proceed.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── SECTION HEADER ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-brand-900 border border-blue-200">
            National Academic Registry
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            &bull; 100+ Accredited Degree Pathways
          </span>
        </div>
        <h3 className="text-2xl font-bold font-display text-slate-900">
          Step 1: {isOfficial ? 'Academic Background (Optional for Officials)' : 'Select Your Current Degree / Academic Base'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isOfficial
            ? 'Optionally add your academic qualification to refine competency gap recommendations.'
            : 'Select your academic foundation to automatically map accredited university prerequisites into our competency model.'}
        </p>
      </div>

      {/* PART 1: QUICK SELECT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="sparkles" size={14} className="text-amber-500" />
            <span>Quick Select (Most Common)</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">1-Click Shortcut</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {QUICK_DEGREES.map((card) => {
            const isSelected = selectedDegree === card.fullName;
            return (
              <div
                key={card.id}
                onClick={() => handleSelect(card.fullName)}
                className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-900 bg-blue-50/70 shadow-md ring-2 ring-brand-900/10 scale-[1.01]'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80 hover:shadow-card'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-brand-900'
                    }`}>
                      <Icon name={card.icon} size={16} />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-900 transition-colors">
                    {card.shortTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {card.specialization}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">{card.stream}</span>
                  {isSelected ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-900">
                      <Icon name="check-circle-2" size={16} />
                      <span>Selected</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-brand-900 transition-colors flex items-center gap-0.5">
                      <span>Select</span>
                      <Icon name="arrow-right" size={12} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white px-2">
          or search all degrees &amp; streams
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* PART 2: COMBOBOX + STREAM FILTER + DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Comprehensive Degree Catalog / Custom Entry
          </label>
          {searchQuery && (
            <span className="text-xs text-slate-500">
              {filteredDegrees.length} {filteredDegrees.length === 1 ? 'match' : 'matches'} found
            </span>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (searchQuery.trim()) {
                  const exact = DEGREES_LIST.find(d => d.name.toLowerCase() === searchQuery.trim().toLowerCase());
                  handleSelect(exact ? exact.name : searchQuery.trim());
                }
              } else if (e.key === 'Escape') {
                setIsDropdownOpen(false);
              }
            }}
            placeholder="Search from 100+ Degrees or type your own..."
            className="w-full pl-11 pr-24 py-3.5 bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-brand-900 focus:ring-4 focus:ring-brand-900/10 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-sm"
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedStream('All'); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <Icon name="x" size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-transform"
              title="Toggle list"
            >
              <Icon
                name="chevron-down"
                size={18}
                className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-brand-900' : ''}`}
              />
            </button>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3 bg-slate-50/90 border-b border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Filter by Academic Stream:
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {streams.map(stream => (
                  <button
                    key={stream}
                    type="button"
                    onClick={() => setSelectedStream(stream)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 whitespace-nowrap ${
                      selectedStream === stream
                        ? 'bg-brand-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    {stream}
                  </button>
                ))}
              </div>
            </div>

            {searchQuery.trim().length > 0 && !hasExactMatch && (
              <div
                onClick={() => handleSelect(searchQuery.trim())}
                className="p-3.5 px-4 bg-gradient-to-r from-amber-500/10 via-brand-50/50 to-white hover:from-amber-500/20 hover:to-blue-50/90 border-b border-slate-100 cursor-pointer flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                    <Icon name="plus" size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Custom Degree Entry</span>
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">Zero Blockers</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      Add <span className="font-bold text-brand-900 underline decoration-amber-500">"{searchQuery.trim()}"</span> as custom degree
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-brand-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs group-hover:bg-brand-900 group-hover:text-white transition-all flex-shrink-0">
                  <span>Select</span>
                  <Icon name="arrow-right" size={12} />
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {filteredDegrees.length > 0 ? (
                filteredDegrees.map((deg, idx) => {
                  const isSelected = selectedDegree === deg.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(deg.name)}
                      className={`p-3 px-4 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? 'bg-blue-50/90 text-brand-900 font-semibold' : 'hover:bg-slate-50/90 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isSelected ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Icon name="graduation-cap" size={16} />
                        </div>
                        <span className="text-sm truncate">{deg.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStreamBadgeColor(deg.stream)}`}>
                          {deg.stream}
                        </span>
                        {isSelected && <Icon name="check-circle-2" size={17} className="text-brand-900" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Icon name="graduation-cap" size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">No matches found &mdash; you can still type a custom degree</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Use the "Custom Degree Entry" option above to proceed with your exact degree.
                  </p>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-4">
              <span>Showing {filteredDegrees.length} accredited degrees</span>
              <span className="text-slate-400">Press Enter or click to select</span>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE SELECTION SUMMARY CARD */}
      <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-white border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Icon name="graduation-cap" size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Selected Academic Base
              </span>
              {selectedDegree && (isCustomDegree ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Custom Entry
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Accredited MoSPI Standard
                </span>
              ))}
              {!selectedDegree && isOfficial && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                  Optional for Officials
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {selectedDegree || (isOfficial ? 'No degree selected (optional)' : 'No degree selected yet')}
            </p>
          </div>
        </div>

        {selectedDegree && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex-shrink-0">
            <Icon name="check" size={14} className="text-emerald-600" />
            <span>Verified for Analysis</span>
          </div>
        )}
      </div>

      {/* STEP FOOTER */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Step 1 of 3 &bull; {isOfficial ? 'Official Profile Setup' : 'Academic Prerequisite Mapping'}
        </p>
        <button
          disabled={!canProceed}
          onClick={onNext}
          className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all ${
            canProceed
              ? 'bg-brand-900 hover:bg-brand-800 text-white cursor-pointer shadow-blue-900/20 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Continue to Target Role</span>
          <Icon name="arrow-right" size={15} />
        </button>
      </div>
    </div>
  );
}
