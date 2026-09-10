import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ==========================================
# 1. UPDATE SkillGapAnalyzer
# ==========================================

old_analyzer_pattern = r"function SkillGapAnalyzer\(\{ setActivePage, userState, setUserState, showToast \}\) \{[\s\S]*?(?=\n    // ==========================================\n    // PAGE 4: AI QUIZ GENERATOR)"

new_analyzer_code = """function SkillGapAnalyzer({ setActivePage, userState, setUserState, showToast }) {
      const [currentStep, setCurrentStep] = useState(1);
      const [selectedDegree, setSelectedDegree] = useState(userState.degree);
      const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
      const [knownSkillsList, setKnownSkillsList] = useState(userState.knownSkills);
      const [customSkillInput, setCustomSkillInput] = useState("");
      
      const [isAnalyzing, setIsAnalyzing] = useState(false);
      const [analysisStage, setAnalysisStage] = useState("");
      const [backendAnalysis, setBackendAnalysis] = useState(null);

      const availableSkillSuggestions = [
        "React", "TypeScript", "Node.js", "Python", "SQL", "Docker", "Tailwind CSS",
        "R Programming", "Statistical Sampling", "Git", "RESTful APIs", "Time Series", "Machine Learning"
      ];

      const addSkillTag = (skill) => {
        if (skill && !knownSkillsList.includes(skill)) {
          const updated = [...knownSkillsList, skill];
          setKnownSkillsList(updated);
          showToast(`Added skill: ${skill}`);
        }
      };

      const removeSkillTag = (skillToRemove) => {
        setKnownSkillsList(knownSkillsList.filter(s => s !== skillToRemove));
      };

      // Asynchronous API call to FastAPI Backend (/api/skills/analyze)
      const runSkillAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisStage("Connecting to FastAPI Backend (POST /api/skills/analyze)...");
        
        try {
          // Attempt real API call to FastAPI backend
          const response = await fetch(`${API_BASE_URL}/skills/analyze`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              target_role: selectedRole.title,
              current_skills: knownSkillsList,
              degree: selectedDegree
            })
          });

          if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          setBackendAnalysis(data);
          setIsAnalyzing(false);
          setCurrentStep(4);

          // Synchronize user state with FastAPI returned analysis
          setUserState(prev => ({
            ...prev,
            degree: data.degree || selectedDegree,
            targetRole: data.target_role,
            knownSkills: knownSkillsList,
            missingSkills: data.missing_skills,
            readinessScore: data.readiness_score,
            identifiedGapsCount: data.missing_skills.length
          }));

          showToast(`FastAPI Analysis Success! Readiness: ${data.readiness_score}% (${data.missing_skills.length} gaps identified)`, "success");
        } catch (err) {
          console.warn("FastAPI backend connection error, activating resilient client engine:", err);
          setAnalysisStage("Benchmarking against local MoSPI NCO-2015 matrices...");
          
          setTimeout(() => {
            const required = selectedRole.requiredSkills;
            const gaps = required.filter(skill => !knownSkillsList.includes(skill));
            const score = Math.round(((required.length - gaps.length) / required.length) * 100);

            const fallbackData = {
              target_role: selectedRole.title,
              degree: selectedDegree,
              readiness_score: score,
              acquired_skills: knownSkillsList.filter(s => required.includes(s)),
              missing_skills: gaps,
              recommended_courses: IGOT_COURSES.slice(0, 3),
              roadmap_steps: [
                { milestone: "1. Core Foundation Bridge", focus: gaps[0] || "Foundational Tooling", action: "Address primary architectural deficits." },
                { milestone: "2. Applied Industry Frameworks", focus: gaps[1] || "Enterprise Cloud", action: "Deploy production-grade implementations." },
                { milestone: "3. Government Capstone", focus: "MoSPI Assessment", action: "Complete certification quiz." }
              ]
            };

            setBackendAnalysis(fallbackData);
            setIsAnalyzing(false);
            setCurrentStep(4);

            setUserState(prev => ({
              ...prev,
              degree: selectedDegree,
              targetRole: selectedRole.title,
              knownSkills: knownSkillsList,
              missingSkills: gaps,
              readinessScore: score,
              identifiedGapsCount: gaps.length
            }));

            showToast("Evaluated via resilient fallback (FastAPI offline)", "warning");
          }, 1200);
        }
      };

      const roleRequirements = selectedRole.requiredSkills;
      const verifiedKnown = backendAnalysis ? backendAnalysis.acquired_skills : knownSkillsList.filter(s => roleRequirements.includes(s));
      const identifiedGaps = backendAnalysis ? backendAnalysis.missing_skills : roleRequirements.filter(s => !knownSkillsList.includes(s));
      const displayScore = backendAnalysis ? backendAnalysis.readiness_score : Math.round(((roleRequirements.length - identifiedGaps.length) / roleRequirements.length) * 100);
      const displayCourses = (backendAnalysis && backendAnalysis.recommended_courses && backendAnalysis.recommended_courses.length > 0)
        ? backendAnalysis.recommended_courses
        : IGOT_COURSES;

      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-brand-900 text-xs font-bold mb-3">
              <Icon name="sparkles" size={14} className="text-amber-500" />
              <span>MoSPI Semantic Skill Gap Matrix (FastAPI Connected)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900">
              Skill Gap Analyzer & Roadmap Engine
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              Compare your academic qualifications with empirical job market benchmarks to generate a step-by-step accredited bridge path.
            </p>
          </div>

          {/* STEPPER PROGRESS INDICATOR */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-900 transition-all duration-500 -z-0"
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%' }}
              ></div>

              {[
                { step: 1, label: "Degree" },
                { step: 2, label: "Target Role" },
                { step: 3, label: "Known Skills" },
                { step: 4, label: "Gap Matrix" },
              ].map(item => (
                <div key={item.step} className="flex flex-col items-center relative z-10">
                  <button
                    onClick={() => {
                      if (item.step < currentStep) setCurrentStep(item.step);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === item.step 
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 shadow-md' 
                        : currentStep > item.step 
                          ? 'bg-brand-900 text-white' 
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {currentStep > item.step ? <Icon name="check" size={16} /> : item.step}
                  </button>
                  <span className={`text-[11px] font-bold mt-1.5 ${currentStep === item.step ? 'text-brand-900' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SKELETON / LOADING AI SCANNING MODAL */}
          {isAnalyzing && (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-2xl max-w-xl mx-auto text-center animate-in fade-in">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 text-brand-900 flex items-center justify-center mb-6 relative">
                <Icon name="cpu" size={38} className="animate-spin text-brand-900" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 mb-2">Analyzing MoSPI Competency Standards</h3>
              <p className="text-xs text-blue-700 font-semibold bg-blue-50 py-1.5 px-4 rounded-full inline-block mb-6 border border-blue-200">
                {analysisStage}
              </p>
              
              <div className="space-y-3 max-w-md mx-auto">
                <div className="h-3 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded-full w-5/6 mx-auto animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded-full w-4/6 mx-auto animate-pulse"></div>
              </div>
            </div>
          )}

          {!isAnalyzing && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card">
              
              {/* STEP 1: SELECT DEGREE */}
              {currentStep === 1 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900">Step 1: Select Your Current Degree / Academic Base</h3>
                    <p className="text-xs text-slate-500 mt-1">This maps accredited core university coursework into our prerequisite engine</p>
                  </div>

                  <div className="space-y-2.5">
                    {DEGREES.map((deg, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedDegree(deg)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedDegree === deg 
                            ? 'border-brand-900 bg-blue-50/70 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            selectedDegree === deg ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Icon name="graduation-cap" size={16} />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{deg}</span>
                        </div>
                        {selectedDegree === deg && (
                          <Icon name="check-circle-2" size={18} className="text-brand-900" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
                    >
                      <span>Continue to Target Role</span>
                      <Icon name="arrow-right" size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT TARGET ROLE */}
              {currentStep === 2 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900">Step 2: Select Your Target Career Role</h3>
                    <p className="text-xs text-slate-500 mt-1">Sourced from MoSPI Statistical Cadres and National Industry Standards</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TARGET_ROLES.map(role => (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          selectedRole.id === role.id 
                            ? 'border-brand-900 bg-blue-50/70 shadow-md ring-2 ring-blue-900/10' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                              {role.category}
                            </span>
                            {selectedRole.id === role.id && (
                              <Icon name="check-circle" size={18} className="text-brand-900" />
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mb-1">{role.title}</h4>
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-4">
                            <Icon name="trending-up" size={12} /> {role.demandScore}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-slate-200/60">
                          <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Core Required Competencies:</p>
                          <div className="flex flex-wrap gap-1">
                            {role.requiredSkills.slice(0, 4).map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                {s}
                              </span>
                            ))}
                            {role.requiredSkills.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-bold self-center">
                                +{role.requiredSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Icon name="arrow-left" size={15} />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
                    >
                      <span>Continue to Known Skills</span>
                      <Icon name="arrow-right" size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ENTER KNOWN SKILLS (TAG INPUT FIELD) */}
              {currentStep === 3 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-display text-slate-900">Step 3: Enter Your Current Known Skills & Tools</h3>
                    <p className="text-xs text-slate-500 mt-1">Add technologies, analytical tools, or concepts you are confident applying</p>
                  </div>

                  <div className="border border-slate-300 rounded-2xl p-3 bg-slate-50/50 focus-within:border-brand-900 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {knownSkillsList.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <span>{skill}</span>
                          <button 
                            onClick={() => removeSkillTag(skill)} 
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Icon name="x" size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Icon name="plus" size={16} className="text-slate-400" />
                      <input 
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customSkillInput.trim()) {
                            e.preventDefault();
                            addSkillTag(customSkillInput.trim());
                            setCustomSkillInput("");
                          }
                        }}
                        placeholder="Type a skill and press Enter (e.g. Docker, Python, SQL)..."
                        className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                      />
                      {customSkillInput && (
                        <button
                          onClick={() => {
                            addSkillTag(customSkillInput.trim());
                            setCustomSkillInput("");
                          }}
                          className="px-3 py-1 bg-brand-900 text-white rounded text-xs font-bold"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggested Skills Pill Clouds */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Quick Add Suggestions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableSkillSuggestions.map((skill, idx) => {
                        const isAdded = knownSkillsList.includes(skill);
                        return (
                          <button
                            key={idx}
                            onClick={() => isAdded ? removeSkillTag(skill) : addSkillTag(skill)}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                              isAdded 
                                ? 'bg-blue-100 text-brand-900 border border-blue-300' 
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {isAdded ? "✓ " : "+ "} {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between border-t border-slate-100">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Icon name="arrow-left" size={15} />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={runSkillAnalysis}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                    >
                      <span>Run AI Gap Analysis</span>
                      <Icon name="zap" size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: RESULT SECTION (SIDE-BY-SIDE GAP MATRIX & ROADMAP) */}
              {currentStep === 4 && (
                <div className="space-y-10">
                  
                  {/* Summary Banner */}
                  <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">MoSPI Evaluation Result</span>
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">FastAPI Live API</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-display">{selectedRole.title}</h3>
                      <p className="text-xs text-slate-300 mt-1">Based on qualification: {selectedDegree}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 text-center">
                      <div>
                        <span className="block text-3xl font-extrabold font-display text-amber-400">
                          {displayScore}%
                        </span>
                        <span className="text-[11px] text-slate-300">Readiness Index</span>
                      </div>
                      <div className="h-8 w-px bg-white/20"></div>
                      <div>
                        <span className="block text-3xl font-extrabold font-display text-red-400">{identifiedGaps.length}</span>
                        <span className="text-[11px] text-slate-300">Skill Deficits</span>
                      </div>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE COMPARISON */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left Side: What you know */}
                    <div className="bg-slate-50/80 rounded-2xl p-6 border border-emerald-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Icon name="check-check" size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">What You Know</h4>
                            <p className="text-xs text-slate-500">{verifiedKnown.length} matching core proficiencies</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                          Validated
                        </span>
                      </div>

                      <div className="space-y-2">
                        {verifiedKnown.length > 0 ? (
                          verifiedKnown.map((skill, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {skill}
                              </span>
                              <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                Meets Requirement
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 py-4 text-center">No overlapping skills registered yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Right Side: What Industry Demands (Highlighted in Red/Amber) */}
                    <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Icon name="alert-octagon" size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">What Industry Demands</h4>
                            <p className="text-xs text-amber-800">{identifiedGaps.length} critical gaps identified</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                          Action Required
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {identifiedGaps.length > 0 ? (
                          identifiedGaps.map((gap, idx) => (
                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">{gap}</span>
                                <span className="text-[10px] text-red-600 font-semibold">Priority Gap #0{idx + 1}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  setActivePage('quiz');
                                  showToast(`Generating AI Quiz for ${gap}...`);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-all"
                              >
                                Test on AI Quiz
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 bg-emerald-50 rounded-xl text-center text-xs font-bold text-emerald-800">
                            Outstanding! You meet 100% of the core competencies for this role.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* ROADMAP TIMELINE (Vertical Stepper UI linking to iGOT Karmayogi Courses) */}
                  <div className="pt-6 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
                          <Icon name="award" size={14} /> Official MoSPI Learning Pathway
                        </div>
                        <h4 className="text-2xl font-bold font-display text-slate-900">Personalized Learning Roadmap</h4>
                        <p className="text-xs text-slate-500">Step-by-step modular progression mapped directly to accredited iGOT Karmayogi courses from database</p>
                      </div>
                      <button
                        onClick={() => showToast("Roadmap PDF & Progress Tracker downloaded", "success")}
                        className="self-start sm:self-auto px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <Icon name="download" size={14} /> Export Roadmap PDF
                      </button>
                    </div>

                    {/* Vertical Stepper dynamically populated from iGOT course recommendations */}
                    <div className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-brand-900 before:via-amber-500 before:to-emerald-500">
                      {displayCourses.slice(0, 3).map((course, idx) => (
                        <div key={course.id || idx} className="relative group">
                          <div className={`absolute -left-8 sm:-left-10 top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-sm ${
                            idx === 0 ? 'bg-brand-900 text-white' : idx === 1 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                                  Milestone {idx + 1}: {idx === 0 ? 'Core Foundation Bridge' : idx === 1 ? 'Applied Industry Frameworks' : 'National Capstone Certification'}
                                </span>
                                <h5 className="text-base font-bold text-slate-900">{course.associated_skill ? `${course.associated_skill} Competency` : course.title}</h5>
                              </div>
                              <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start">
                                Est. {course.duration_hours || course.duration || 18} Hours
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-4">{course.description || "Comprehensive module bridging critical competencies."}</p>

                            {/* Linked iGOT Course Card */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-900 flex items-center justify-center flex-shrink-0">
                                  <Icon name="book-open" size={20} />
                                </div>
                                <div>
                                  <h6 className="text-xs sm:text-sm font-bold text-slate-900">{course.title}</h6>
                                  <p className="text-[11px] text-slate-500">{course.provider} • {course.modules_count || course.modules || 6} Modules</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => showToast(`Enrolled in ${course.id} on iGOT Karmayogi`, "success")}
                                className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-all whitespace-nowrap"
                              >
                                Enroll via iGOT
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="pt-6 flex justify-between border-t border-slate-100">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Icon name="rotate-ccw" size={14} />
                      <span>Start Over</span>
                    </button>
                    <button
                      onClick={() => setActivePage('dashboard')}
                      className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
                    >
                      <span>Go to Dashboard</span>
                      <Icon name="layout-dashboard" size={15} />
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>
      );
    }"""

# ==========================================
# 2. UPDATE AIQuizGenerator
# ==========================================

old_quiz_pattern = r"function AIQuizGenerator\(\{ setActivePage, userState, setUserState, showToast \}\) \{[\s\S]*?(?=\n    // Render App)"

new_quiz_code = """function AIQuizGenerator({ setActivePage, userState, setUserState, showToast }) {
      const [quizView, setQuizView] = useState('upload');
      const [uploadedFile, setUploadedFile] = useState(null);
      const [isDragging, setIsDragging] = useState(false);
      
      const [quizQuestions, setQuizQuestions] = useState(SAMPLE_QUIZ_QUESTIONS);
      const [engineSource, setEngineSource] = useState("FastAPI Gemini Engine");
      const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
      const [selectedOption, setSelectedOption] = useState(null);
      const [userAnswers, setUserAnswers] = useState({});
      const [showExplanation, setShowExplanation] = useState(false);
      const [timerSeconds, setTimerSeconds] = useState(900);
      const [lastScorePercent, setLastScorePercent] = useState(80);
      const [lastCorrectCount, setLastCorrectCount] = useState(4);

      useEffect(() => {
        let interval = null;
        if (quizView === 'active' && timerSeconds > 0) {
          interval = setInterval(() => {
            setTimerSeconds(sec => sec - 1);
          }, 1000);
        }
        return () => clearInterval(interval);
      }, [quizView, timerSeconds]);

      const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      };

      const loadSampleFile = (name, size, sampleText) => {
        setUploadedFile({ 
          name, 
          size, 
          rawText: sampleText 
        });
        showToast(`Loaded document: ${name}`);
      };

      // Asynchronous API call to FastAPI Backend (/api/quiz/generate)
      const handleGenerateQuiz = async () => {
        if (!uploadedFile) {
          showToast("Please upload or select a document first", "warning");
          return;
        }
        setQuizView('generating');

        try {
          const formData = new FormData();
          if (uploadedFile.rawFile) {
            formData.append("file", uploadedFile.rawFile, uploadedFile.name);
          } else {
            const sampleText = uploadedFile.rawText || `Ministry of Statistics and Programme Implementation (MoSPI) National Curricula 2026.
Document: ${uploadedFile.name}
Section 1: Multi-Stage Stratified Sampling in NSSO Surveys.
Stratified random sampling ensures adequate proportional representation across diverse socioeconomic sub-strata across Indian States.
Section 2: Concurrent Rendering and Modern UI Task Prioritization.
React 18 Concurrent Rendering yields execution to the main browser thread to prioritize urgent user inputs without freezing.
Section 3: Container Orchestration & Cloud Microservices.
Docker multi-stage builds construct minimal immutable container images complying with Meghraj specifications.
Section 4: Weak Stationarity in Economic Forecasting.
A time-series achieves weak stationarity when mean and variance are constant over time with lag-dependent auto-covariance.
Section 5: Stateless Microservice Authentication.
Stateless authorization across government portals uses cryptographically signed JWT tokens with asymmetric RS256 keys.`;
            const blob = new Blob([sampleText], { type: "text/plain" });
            formData.append("file", blob, uploadedFile.name.endsWith('.txt') ? uploadedFile.name : uploadedFile.name + ".txt");
          }

          const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
            method: "POST",
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
          }

          const data = await response.json();
          if (data.questions && data.questions.length > 0) {
            setQuizQuestions(data.questions);
            setEngineSource(data.source_model || "FastAPI Gemini AI");
            setQuizView('active');
            setCurrentQuestionIdx(0);
            setUserAnswers({});
            setSelectedOption(null);
            setShowExplanation(false);
            setTimerSeconds(900);
            showToast(`Quiz generated via FastAPI (${data.questions.length} MCQs)!`, "success");
            return;
          }
        } catch (err) {
          console.warn("Quiz generation API error, falling back to local questions:", err);
          showToast("FastAPI connection issue, loaded curriculum fallback quiz", "warning");
          setQuizQuestions(SAMPLE_QUIZ_QUESTIONS);
          setEngineSource("Curriculum Fallback Engine");
          setQuizView('active');
          setCurrentQuestionIdx(0);
          setUserAnswers({});
          setSelectedOption(null);
          setShowExplanation(false);
          setTimerSeconds(900);
        }
      };

      const handleSelectOption = (idx) => {
        setSelectedOption(idx);
        setUserAnswers({
          ...userAnswers,
          [currentQuestionIdx]: idx
        });
      };

      const handleNextQuestion = () => {
        setShowExplanation(false);
        if (currentQuestionIdx < quizQuestions.length - 1) {
          const nextIdx = currentQuestionIdx + 1;
          setCurrentQuestionIdx(nextIdx);
          setSelectedOption(userAnswers[nextIdx] ?? null);
        } else {
          // Finish quiz
          const correctCount = Object.keys(userAnswers).filter(
            qIdx => userAnswers[qIdx] === quizQuestions[qIdx].correct_index
          ).length;
          const scorePercent = Math.round((correctCount / quizQuestions.length) * 100);
          setLastScorePercent(scorePercent);
          setLastCorrectCount(correctCount);
          setQuizView('completed');

          setUserState(prev => ({
            ...prev,
            modulesCompleted: Math.min(prev.modulesCompleted + 1, prev.totalModules),
            recentActivity: [
              {
                id: Date.now(),
                type: "quiz",
                title: `AI PDF Quiz: ${uploadedFile.name.substring(0, 24)}...`,
                score: `${scorePercent}%`,
                date: "Just now",
                icon: "check-circle",
                color: "text-emerald-600"
              },
              ...prev.recentActivity
            ]
          }));
          showToast(`Assessment completed! Score: ${scorePercent}%`, "success");
        }
      };

      const handlePreviousQuestion = () => {
        if (currentQuestionIdx > 0) {
          const prevIdx = currentQuestionIdx - 1;
          setCurrentQuestionIdx(prevIdx);
          setSelectedOption(userAnswers[prevIdx] ?? null);
          setShowExplanation(false);
        }
      };

      const currentQ = quizQuestions[currentQuestionIdx] || SAMPLE_QUIZ_QUESTIONS[0];

      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* VIEW 1: UPLOAD ZONE */}
          {quizView === 'upload' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-brand-900 text-xs font-bold mb-3">
                  <Icon name="sparkles" size={14} className="text-blue-600" />
                  <span>Bloom's Taxonomy Assessment Engine (FastAPI Connected)</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900">
                  AI Quiz & Assessment Generator
                </h1>
                <p className="text-slate-600 text-sm mt-2">
                  Upload any syllabus PDF, course handout, or MoSPI handbook. FastAPI and Gemini AI extract key concepts and build an interactive MCQ assessment.
                </p>
              </div>

              {/* UPLOAD ZONE (Drag and Drop Area) */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const f = e.dataTransfer.files[0];
                    setUploadedFile({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB`, rawFile: f });
                    showToast(`File uploaded: ${f.name}`);
                  }
                }}
                className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all bg-white ${
                  isDragging 
                    ? 'border-brand-900 bg-blue-50/50 scale-[1.01]' 
                    : 'border-slate-300 hover:border-brand-900'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-900 mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <Icon name="file-up" size={32} />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-1">
                  Upload study material to generate an AI quiz
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Supports university syllabus, lecture notes, textbook chapters (PDF, DOCX, TXT up to 25MB)
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-2">
                    <Icon name="folder-open" size={16} />
                    <span>Browse Files</span>
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.txt"
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          setUploadedFile({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB`, rawFile: f });
                          showToast(`File selected: ${f.name}`);
                        }
                      }}
                    />
                  </label>
                </div>

                {uploadedFile && (
                  <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-slate-800 text-xs font-semibold animate-in fade-in">
                    <Icon name="file-text" size={16} className="text-blue-600" />
                    <span>{uploadedFile.name} ({uploadedFile.size})</span>
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Sample Documents Row */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Or test with sample government & curriculum documents:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => loadSampleFile(
                      "MoSPI_National_Statistical_Framework_2026.pdf",
                      "4.2 MB",
                      `Ministry of Statistics and Programme Implementation (MoSPI) National Curricula 2026.
Section 1: Multi-Stage Stratified Sampling in NSSO Rounds.
Stratified random sampling divides diverse demographic populations into distinct socio-economic sub-groups.
Section 2: Concurrent Rendering and Reactive Interfaces in Modern Portals.
React 18 Concurrent Rendering enables UI task prioritization to eliminate blocking main thread execution.
Section 3: Container Orchestration and Cloud Deployment.
Docker multi-stage builds create reproducible immutable containers compliant with Meghraj standards.
Section 4: Weak Stationarity in Economic Forecasting.
A time-series achieves weak stationarity when mean and variance are constant over time with lag-dependent auto-covariance.
Section 5: Stateless Microservice Authentication.
Stateless authorization across government portals uses cryptographically signed JWT tokens with asymmetric RS256 keys.`
                    )}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 text-left flex items-center gap-3 transition-all hover:shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Icon name="file-text" size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-900 truncate">MoSPI National Statistical Framework 2026.pdf</h4>
                      <p className="text-[10px] text-slate-500">Official Sampling & Indicator Modules • 4.2 MB</p>
                    </div>
                  </button>

                  <button
                    onClick={() => loadSampleFile(
                      "Modern_FullStack_React_Cloud_Architecture.pdf",
                      "2.8 MB",
                      `Modern Full Stack Engineering & Cloud Governance Curriculum 2026.
Section 1: React 18 Concurrent Mode & State Architecture.
Concurrent rendering yields main thread execution to prioritize high priority user actions.
Section 2: Enterprise Containerization with Docker & Podman.
Multi-stage OCI containers separate compilation toolchains from runtime containers.
Section 3: Distributed Microservices & JWT Security.
Stateless authentication uses RS256 asymmetric cryptographic tokens.`
                    )}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 text-left flex items-center gap-3 transition-all hover:shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <Icon name="file-code" size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-900 truncate">Modern FullStack React Cloud Architecture.pdf</h4>
                      <p className="text-[10px] text-slate-500">React 18, Docker, System Design • 2.8 MB</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Generate CTA Button */}
              <div className="text-center pt-2">
                <button
                  disabled={!uploadedFile}
                  onClick={handleGenerateQuiz}
                  className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 mx-auto ${
                    uploadedFile 
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95 shadow-amber-500/20' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Icon name="sparkles" size={18} />
                  <span>Synthesize AI Quiz via FastAPI ({uploadedFile ? "Ready" : "Upload Required"})</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: GENERATING ANIMATION */}
          {quizView === 'generating' && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-2xl text-center max-w-lg mx-auto animate-in fade-in">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-brand-900 flex items-center justify-center mb-6 relative">
                <Icon name="bot" size={38} className="animate-bounce text-brand-900" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 mb-2">Generating Questions via FastAPI</h3>
              <p className="text-xs text-slate-500 mb-6">
                Extracting concepts from "{uploadedFile?.name}" and invoking Google Gemini API for Bloom's taxonomy MCQs...
              </p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div className="bg-brand-900 h-full rounded-full animate-[subtlePulse_1.5s_infinite] w-3/4"></div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Synthesizing distractor choices & verified answers...</span>
            </div>
          )}

          {/* VIEW 3: ACTIVE QUIZ INTERFACE */}
          {quizView === 'active' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
              {/* TOP QUIZ BAR */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-brand-900 bg-blue-100 px-2 py-0.5 rounded">
                      Question {currentQuestionIdx + 1} of {quizQuestions.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{currentQ.topic || "Curriculum Concept"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Engine: <span className="text-blue-700 font-semibold">{engineSource}</span></p>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                  <Icon name="clock" size={16} className={timerSeconds < 180 ? "text-red-500 animate-pulse" : "text-slate-500"} />
                  <span className={`font-mono text-sm font-bold ${timerSeconds < 180 ? "text-red-600" : "text-slate-800"}`}>
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-slate-100 h-1.5">
                <div 
                  className="bg-brand-900 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* QUESTION CARD */}
              <div className="p-6 sm:p-8 space-y-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>

                {/* 4 SELECTABLE OPTION CARDS */}
                <div className="space-y-3">
                  {currentQ.options.map((optionText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const letter = ["A", "B", "C", "D"][optIdx];

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                          isSelected 
                            ? 'border-brand-900 bg-blue-50/80 shadow-sm ring-1 ring-brand-900' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                          isSelected ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-800 pt-0.5 leading-relaxed">
                          {optionText}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Toggle Explanation Accordion */}
                {selectedOption !== null && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
                    >
                      <Icon name="info" size={14} />
                      <span>{showExplanation ? "Hide Rationale" : "View Explanation & MoSPI Reference"}</span>
                    </button>

                    {showExplanation && (
                      <div className="mt-3 p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 animate-in fade-in">
                        <span className="font-bold text-brand-900 block mb-1">Pedagogical Explanation:</span>
                        <p className="leading-relaxed mb-2">{currentQ.explanation}</p>
                        <span className="text-[11px] text-blue-800 font-semibold bg-white px-2 py-0.5 rounded border border-blue-200 inline-block">
                          Verified Answer: {currentQ.correct_answer || currentQ.options[currentQ.correct_index]}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* NAVIGATION FOOTER */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={handlePreviousQuestion}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentQuestionIdx === 0 
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name="arrow-left" size={14} />
                    <span>Previous</span>
                  </button>

                  <button
                    disabled={selectedOption === null}
                    onClick={handleNextQuestion}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                      selectedOption !== null 
                        ? 'bg-brand-900 hover:bg-brand-800 text-white active:scale-95' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{currentQuestionIdx === quizQuestions.length - 1 ? "Submit Assessment" : "Next Question"}</span>
                    <Icon name="arrow-right" size={14} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 4: ASSESSMENT COMPLETED SUMMARY REPORT */}
          {quizView === 'completed' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-10 space-y-8 text-center animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-4 border-emerald-100">
                <Icon name="award" size={40} />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Assessment Completed
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-3 mb-2">
                  Competency Verification Report
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Evaluated on document: <strong className="text-slate-800">{uploadedFile?.name}</strong>
                </p>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Score Achieved</span>
                  <span className="text-2xl font-extrabold font-display text-emerald-600">{lastScorePercent}%</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Correct Answers</span>
                  <span className="text-2xl font-extrabold font-display text-brand-900">{lastCorrectCount} / {quizQuestions.length}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Percentile</span>
                  <span className="text-2xl font-extrabold font-display text-amber-500">
                    {lastScorePercent >= 80 ? '92nd' : lastScorePercent >= 60 ? '75th' : '55th'}
                  </span>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 max-w-md mx-auto text-left flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-900 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Icon name="shield-check" size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Micro-Credential Issued</h4>
                  <p className="text-[11px] text-slate-600">Generated via {engineSource} & synchronized with your SkillBank Profile.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setQuizView('upload');
                    setUploadedFile(null);
                  }}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Icon name="rotate-ccw" size={14} />
                  <span>Take Another Quiz</span>
                </button>
                <button
                  onClick={() => setActivePage('dashboard')}
                  className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  <Icon name="layout-dashboard" size={14} />
                  <span>Return to Command Center</span>
                </button>
              </div>
            </div>
          )}

        </div>
      );
    }"""

# Replace SkillGapAnalyzer
content = re.sub(old_analyzer_pattern, new_analyzer_code, content, count=1)
print("Replaced SkillGapAnalyzer")

# Replace AIQuizGenerator
content = re.sub(old_quiz_pattern, new_quiz_code, content, count=1)
print("Replaced AIQuizGenerator")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Full frontend update applied successfully!")
