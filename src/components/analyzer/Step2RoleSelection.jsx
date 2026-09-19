import React, { useState, useMemo, useEffect, useRef } from 'react';
import Icon from '../Icon';
import { getRecommendedRolesForDegree, JOB_ROLES_LIST } from '../../utils/constants';

export default function Step2RoleSelection({
  selectedRole, selectedDegree, onSelectRole, roleDemandMap, loadingDemand,
  onBack, onNext,
  isOfficialProfile = false,
  officialQuickRoles = [],
}) {
      const [searchQuery, setSearchQuery] = useState("");
      const [isDropdownOpen, setIsDropdownOpen] = useState(false);
      const [selectedSector, setSelectedSector] = useState("All");
      const dropdownRef = useRef(null);

      // Contextually compute the 4 quick select cards based on selectedDegree
      // When in official track, override with the MoSPI role set passed in.
      const contextualQuickRoles = useMemo(() => {
        if (isOfficialProfile && officialQuickRoles.length > 0) {
          return officialQuickRoles;
        }
        return getRecommendedRolesForDegree(selectedDegree);
      }, [selectedDegree, isOfficialProfile, officialQuickRoles]);

      // Close dropdown on click outside
      useEffect(() => {
        function handleClickOutside(event) {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const sectors = [
        "All", 
        "Public Sector & Governance", 
        "Software Engineering", 
        "Data & AI", 
        "Artificial Intelligence",
        "Cloud & Infrastructure",
        "Cybersecurity", 
        "Product & Management", 
        "Design & UX", 
        "Finance & Banking", 
        "Marketing & Growth", 
        "Human Resources", 
        "Healthcare", 
        "Core Engineering", 
        "Operations & Supply Chain", 
        "Legal & Compliance"
      ];

      const getSectorBadgeColor = (category) => {
        switch (category) {
          case "Public Sector & Governance": return "bg-emerald-50 text-emerald-700 border-emerald-200";
          case "Software Engineering": return "bg-blue-50 text-blue-700 border-blue-200";
          case "Artificial Intelligence":
          case "Data & AI": return "bg-purple-50 text-purple-700 border-purple-200";
          case "Cloud & Infrastructure": return "bg-sky-50 text-sky-700 border-sky-200";
          case "Cybersecurity": return "bg-rose-50 text-rose-700 border-rose-200";
          case "Product & Management": return "bg-indigo-50 text-indigo-700 border-indigo-200";
          case "Design & UX": return "bg-pink-50 text-pink-700 border-pink-200";
          case "Finance & Banking": return "bg-amber-50 text-amber-800 border-amber-200";
          case "Marketing & Growth": return "bg-orange-50 text-orange-700 border-orange-200";
          case "Human Resources": return "bg-teal-50 text-teal-700 border-teal-200";
          case "Healthcare": return "bg-red-50 text-red-700 border-red-200";
          case "Core Engineering": return "bg-slate-100 text-slate-800 border-slate-300";
          case "Operations & Supply Chain": return "bg-yellow-50 text-yellow-800 border-yellow-200";
          case "Legal & Compliance": return "bg-violet-50 text-violet-700 border-violet-200";
          default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
      };

      // Filter roles based on search and sector filter
      const filteredRoles = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const safeRoles = JOB_ROLES_LIST || [];
        if (!JOB_ROLES_LIST) console.error("CRITICAL ERROR: JOB_ROLES_LIST is undefined!");
        return safeRoles.filter(role => {
          const matchesSector = selectedSector === "All" || role.category.toLowerCase() === selectedSector.toLowerCase();
          if (!matchesSector) return false;
          if (!query) return true;
          return role.title.toLowerCase().includes(query) || 
                 role.category.toLowerCase().includes(query) ||
                 (role.requiredSkills && role.requiredSkills.some(skill => skill.toLowerCase().includes(query)));
        });
      }, [searchQuery, selectedSector]);

      // Check if user input has an exact match in the database
      const hasExactMatch = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        const safeRoles = JOB_ROLES_LIST || [];
        return safeRoles.some(role => role.title.toLowerCase() === query);
      }, [searchQuery]);

      const handleSelectRole = (role) => {
        onSelectRole(role);
        setIsDropdownOpen(false);
      };

      // Create and select custom fallback role
      const handleSelectCustomRole = (customTitle) => {
        const customRole = {
          id: `custom_role_${Date.now()}`,
          title: customTitle.trim(),
          category: "Custom Domain",
          demandScore: "92% Emerging Field",
          demandPercentage: 92,
          isCustom: true,
          requiredSkills: [
            "Domain Specialization",
            "Analytical Problem Solving",
            "Tooling & Workflow Management",
            "Industry Best Practices",
            "Professional Communication",
            "Quality Assurance & Compliance"
          ]
        };
        onSelectRole(customRole);
        setIsDropdownOpen(false);
      };

      const isCustomRole = selectedRole && (selectedRole.isCustom || !(JOB_ROLES_LIST || []).some(r => r.id === selectedRole.id));

      return (
        <div className="max-w-3xl mx-auto space-y-7">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                MoSPI Statistical Cadres & Industry Benchmark
              </span>
              <span className="text-[11px] font-semibold text-slate-400">&bull; 500+ National Job Profiles</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900">
              Step 2: Select Your Target Career Role
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pick your goal position to compute precise competency gaps against official MoSPI cadres and high-growth industry benchmarks.
            </p>
          </div>

          {/* Official track badge */}
          {isOfficialProfile && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800">
              <Icon name="shield-check" size={16} className="text-emerald-600 flex-shrink-0" />
              <span>
                <span className="font-bold">Official MoSPI Track Active.</span> Showing MoSPI cadre roles benchmarked against PS-101 competency standards.
              </span>
            </div>
          )}

          {/* PART 1: TOP 4 QUICK SELECT CARDS (CONTEXTUAL PER DEGREE OR OFFICIAL TRACK) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="trending-up" size={14} className={isOfficialProfile ? "text-emerald-600" : "text-emerald-600"} />
                <span>
                  {isOfficialProfile
                    ? "MoSPI Cadre Roles (Official Track)"
                    : selectedDegree
                      ? `Recommended Roles for ${selectedDegree.split('/')[0].split('(')[0].trim()}`
                      : "Top In-Demand Career Roles"
                  }
                </span>
              </label>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                isOfficialProfile
                  ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                  : "text-blue-700 bg-blue-50 border-blue-200"
              }`}>
                {isOfficialProfile ? "PS-101 Benchmark" : selectedDegree ? "Contextual AI Mapping" : "1-Click Shortcut"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contextualQuickRoles.map((role) => {
                const isSelected = selectedRole.id === role.id;
                const dynamicDemand = roleDemandMap[role.id];
                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-900 bg-blue-50/70 shadow-md ring-2 ring-brand-900/10 scale-[1.01]'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80 hover:shadow-card'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${role.badgeColor}`}>
                          {role.category}
                        </span>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <Icon name="check-circle-2" size={18} className="text-brand-900" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-900 transition-colors mb-1.5">
                        {role.title}
                      </h4>

                      {/* Market Demand Stat */}
                      <div className="mb-3.5">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Icon name="trending-up" size={13} />
                          <span>{dynamicDemand?.demand_score || role.demandScore || role.demand}</span>
                        </span>
                        {(dynamicDemand?.trending_skills || role.trending) && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                            <span className="font-bold text-slate-600">Trending:</span>
                            <span className="truncate">{role.trending || (dynamicDemand?.trending_skills && dynamicDemand.trending_skills.slice(0, 3).join(", "))}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Core Required Competencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {(role.requiredSkills || role.skills || []).slice(0, 4).map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200">
                            {s}
                          </span>
                        ))}
                        {(role.requiredSkills || role.skills || []).length > 4 && (
                          <span className="text-[10px] text-slate-400 font-bold self-center">
                            +{(role.requiredSkills || role.skills).length - 4} more
                          </span>
                        )}
                      </div>
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
              or search all 500+ job roles & domains
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* PART 2 & 3: SMART COMBOBOX + SECTOR FILTER + DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Comprehensive Job Catalog / Custom Target Role
              </label>
              {searchQuery && (
                <span className="text-xs text-slate-500">
                  {filteredRoles.length} {filteredRoles.length === 1 ? 'match' : 'matches'} found
                </span>
              )}
            </div>

            {/* Prominent Search Input Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      const safeRoles = JOB_ROLES_LIST || [];
                      const exact = safeRoles.find(r => r.title.toLowerCase() === searchQuery.trim().toLowerCase());
                      if (exact) {
                        handleSelectRole(exact);
                      } else {
                        handleSelectCustomRole(searchQuery.trim());
                      }
                    }
                  } else if (e.key === "Escape") {
                    setIsDropdownOpen(false);
                  }
                }}
                placeholder="Search from 500+ Job Roles or type your own..."
                className="w-full pl-11 pr-24 py-3.5 bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-brand-900 focus:ring-4 focus:ring-brand-900/10 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none shadow-sm"
              />

              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSector("All");
                    }}
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

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Sector Filter Chips */}
                <div className="p-3 bg-slate-50/90 border-b border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Filter by Industry / Domain:
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {sectors.map(sector => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => setSelectedSector(sector)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 whitespace-nowrap ${
                          selectedSector === sector
                            ? 'bg-brand-900 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Entry Fallback: Shown when user typed something that doesn't have an exact match */}
                {searchQuery.trim().length > 0 && !hasExactMatch && (
                  <div
                    onClick={() => handleSelectCustomRole(searchQuery.trim())}
                    className="p-3.5 px-4 bg-gradient-to-r from-amber-500/10 via-brand-50/50 to-white hover:from-amber-500/20 hover:to-blue-50/90 border-b border-slate-100 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                        <Icon name="plus" size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                            Custom Career Pathway
                          </span>
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                            Zero Blockers
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          Add <span className="font-bold text-brand-900 underline decoration-amber-500">"{searchQuery.trim()}"</span> as target role
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs group-hover:bg-brand-900 group-hover:text-white transition-all flex-shrink-0">
                      <span>Select</span>
                      <Icon name="arrow-right" size={12} />
                    </div>
                  </div>
                )}

                {/* Role List Container */}
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => {
                      const isSelected = selectedRole.id === role.id;
                      return (
                        <div
                          key={role.id}
                          onClick={() => handleSelectRole(role)}
                          className={`p-3 px-4 cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50/90 text-brand-900 font-semibold'
                              : 'hover:bg-slate-50/90 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isSelected ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Icon name="briefcase" size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm block font-medium truncate">{role.title}</span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                <span className="truncate">{role.requiredSkills.slice(0, 3).join(", ")}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSectorBadgeColor(role.category)}`}>
                              {role.category}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              {role.demandScore ? role.demandScore.split(" ")[0] : "90%"}
                            </span>
                            {isSelected && (
                              <Icon name="check-circle-2" size={17} className="text-brand-900" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Icon name="briefcase" size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No matching role in database</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use the "Add as target role" option above to proceed with your exact career path.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-4">
                  <span>Showing {filteredRoles.length} benchmarked career roles</span>
                  <span className="text-slate-400">Press Enter or click to select</span>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE SELECTION SUMMARY CARD */}
          <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-white border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Icon name="briefcase" size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Target Career Benchmark
                  </span>
                  {isCustomRole ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Custom Career Pathway
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedRole.category}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedRole.demandScore}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {selectedRole.title || "No career role selected"}
                </p>
              </div>
            </div>

            {selectedRole && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex-shrink-0">
                <Icon name="check" size={14} className="text-emerald-600" />
                <span>{selectedRole.requiredSkills?.length || 6} Competencies Mapped</span>
              </div>
            )}
          </div>

          {/* STEP FOOTER / NAVIGATION */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-all"
            >
              <Icon name="arrow-left" size={15} />
              <span>Back to Step 1</span>
            </button>

            <div className="text-xs text-slate-400 hidden sm:block">
              Step 2 of 3 &bull; Career Target Mapping
            </div>

            <button
              disabled={!selectedRole}
              onClick={onNext}
              className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all ${
                selectedRole
                  ? 'bg-brand-900 hover:bg-brand-800 text-white cursor-pointer shadow-blue-900/20 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Known Skills</span>
              <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>
      );
    }

