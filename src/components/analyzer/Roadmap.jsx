import React, { useMemo, useState } from 'react';
import Icon from '../Icon';
import { IGOT_COURSES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import RoadmapPDFTemplate from './RoadmapPDFTemplate';

// PS-101 4-domain visual style map — keyed by the official domain name returned by /api/skills/analyze
const DOMAIN_STYLES = {
  "Statistical Competencies": {
    icon: "bar-chart-3",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    accentBg: "bg-purple-50/40 border-purple-100",
    pillBg: "bg-purple-100/70 text-purple-800",
    btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
    description: "Survey design, sampling methodology, national accounts, and official MoSPI statistical standards.",
  },
  "Technical Competencies": {
    icon: "cpu",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    accentBg: "bg-indigo-50/40 border-indigo-100",
    pillBg: "bg-indigo-100/70 text-indigo-800",
    btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
    description: "Programming languages, data tools, analytical software, and technical platforms for government data work.",
  },
  "Digital Governance": {
    icon: "shield-check",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentBg: "bg-emerald-50/40 border-emerald-100",
    pillBg: "bg-emerald-100/70 text-emerald-800",
    btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    description: "Cybersecurity, data privacy (DPDP), government cloud protocols, and digital compliance frameworks.",
  },
  "Behavioural & Managerial Competencies": {
    icon: "users",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    accentBg: "bg-amber-50/40 border-amber-100",
    pillBg: "bg-amber-100/70 text-amber-900",
    btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
    description: "Leadership, communication, ethical decision-making, and collaborative governance skills.",
  },
};

export default function Roadmap({
      selectedRole,
      selectedDegree,
      verifiedKnown,
      identifiedGaps,
      displayScore,
      displayCourses,
      backendAnalysis,
      onOpenTopicQuiz,
      setActivePage,
      showToast,
      onRestart
    }) {
      const { user } = useAuth();
      const [isExporting, setIsExporting] = useState(false);

      const handleExportPDF = async () => {
        const templateNode = document.getElementById('pdf-export-template');
        if (!templateNode) return;
        
        setIsExporting(true);
        showToast("Generating PDF... Please wait.");
        
        try {
          const canvas = await html2canvas(templateNode, {
            scale: 2,
            useCORS: true,
            logging: false,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${user?.name ? user.name.replace(/\s+/g, '_') : 'Career'}_Roadmap.pdf`);
          showToast("Roadmap PDF exported successfully!", "success");
        } catch (error) {
          console.error("PDF generation failed:", error);
          showToast("Failed to generate PDF. Please try again.", "error");
        } finally {
          setIsExporting(false);
        }
      };

      // 1. Build domain clusters — PRIMARY: real PS-101 domain_breakdown from /api/skills/analyze
      //    FALLBACK: keyword-based clustering using official PS-101 domain names (when backend offline)
      const domainClusters = useMemo(() => {
        // PRIMARY PATH: consume domain_breakdown already computed by the backend
        if (backendAnalysis?.domain_breakdown?.length > 0) {
          return backendAnalysis.domain_breakdown
            .filter(d => d.missing && d.missing.length > 0)
            .map(d => {
              const style = DOMAIN_STYLES[d.domain] || {
                icon: "layers",
                badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
                accentBg: "bg-slate-50/40 border-slate-100",
                pillBg: "bg-slate-100/70 text-slate-800",
                btnColor: "bg-slate-600 hover:bg-slate-700 text-white",
                description: "Domain competencies as defined by the PS-101 framework.",
              };
              return {
                id: d.domain.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                title: d.domain,
                skills: d.missing,
                readinessScore: d.readiness_score ?? null,
                acquiredCount: d.acquired?.length ?? 0,
                ...style,
              };
            });
        }

        // FALLBACK PATH: keyword clustering using official PS-101 domain names (backend offline)
        const clusterDefinitions = [
          {
            id: "statistical",
            title: "Statistical Competencies",
            icon: "bar-chart-3",
            badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
            accentBg: "bg-purple-50/40 border-purple-100",
            pillBg: "bg-purple-100/70 text-purple-800",
            btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
            keywords: ["sql", "pandas", "numpy", "data", "scikit-learn", "machine learning", "pytorch", "tensorflow", "nlp", "tableau", "powerbi", "r programming", "statistical", "inference", "forecasting", "nsso", "sampling", "econometrics", "analytics", "data cleaning", "survey", "national accounts", "price statistics", "sdg", "spss"],
            description: "Survey design, sampling methodology, national accounts, and official MoSPI statistical standards.",
          },
          {
            id: "technical",
            title: "Technical Competencies",
            icon: "cpu",
            badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
            accentBg: "bg-indigo-50/40 border-indigo-100",
            pillBg: "bg-indigo-100/70 text-indigo-800",
            btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
            keywords: ["react", "vue", "angular", "html", "css", "tailwind", "javascript", "typescript", "figma", "next.js", "node", "express", "python", "fastapi", "django", "api", "rest", "graphql", "java", "c++", "c#", "go", "rust", "redis", "postgresql", "mysql", "mongodb", "visualization"],
            description: "Programming languages, data tools, analytical software, and technical platforms for government data work.",
          },
          {
            id: "digital_gov",
            title: "Digital Governance",
            icon: "shield-check",
            badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
            accentBg: "bg-emerald-50/40 border-emerald-100",
            pillBg: "bg-emerald-100/70 text-emerald-800",
            btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
            keywords: ["iso", "audit", "compliance", "dpdp", "gdpr", "policy", "governance", "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "terraform", "cloud", "git", "security", "networking", "cybersecurity", "data privacy", "government cloud"],
            description: "Cybersecurity, data privacy (DPDP), government cloud protocols, and digital compliance frameworks.",
          },
          {
            id: "behavioural",
            title: "Behavioural & Managerial Competencies",
            icon: "users",
            badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
            accentBg: "bg-amber-50/40 border-amber-100",
            pillBg: "bg-amber-100/70 text-amber-900",
            btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
            keywords: ["leadership", "communication", "ethics", "decision", "management", "stakeholder", "collaboration", "report writing", "interpersonal", "negotiation", "project management"],
            description: "Leadership, communication, ethical decision-making, and collaborative governance skills.",
          },
        ];

        const clusterMap = {};
        const unassigned = [];

        identifiedGaps.forEach(gap => {
          const lower = gap.toLowerCase();
          let matched = false;
          for (const def of clusterDefinitions) {
            if (def.keywords.some(k => lower.includes(k))) {
              if (!clusterMap[def.id]) {
                clusterMap[def.id] = { ...def, skills: [], readinessScore: null, acquiredCount: 0 };
              }
              clusterMap[def.id].skills.push(gap);
              matched = true;
              break;
            }
          }
          if (!matched) {
            unassigned.push(gap);
          }
        });

        const grouped = Object.values(clusterMap);
        if (unassigned.length > 0) {
          grouped.push({
            id: "domain_core",
            title: "Domain Specialization & Applied Tools",
            icon: "sparkles",
            badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
            accentBg: "bg-amber-50/40 border-amber-100",
            pillBg: "bg-amber-100/70 text-amber-900",
            btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
            skills: unassigned,
            readinessScore: null,
            acquiredCount: 0,
            description: "Specialized competencies, tooling workflows, and applied domain techniques for this career path.",
          });
        }
        return grouped;
      }, [backendAnalysis, identifiedGaps]);

      // Accordion expanded state for each cluster (all expanded initially)
      const [collapsedClusters, setCollapsedClusters] = useState({});
      const toggleCluster = (id) => {
        setCollapsedClusters(prev => ({ ...prev, [id]: !prev[id] }));
      };

      // Handler for primary cluster assessment button
      const handleClusterAssessment = (cluster) => {
        if (onOpenTopicQuiz) {
          onOpenTopicQuiz(cluster.title);
        } else {
          setActivePage('quiz');
          showToast(`Launching AI Cluster Assessment for ${cluster.title}...`, "info");
        }
      };

      // 2. Simplified Stepping Stone Roadmap (Duolingo Skill Tree Path)
      const careerPhases = useMemo(() => {
        // Collect target skills to learn
        const allSkills = identifiedGaps.length > 0
          ? identifiedGaps
          : (selectedRole?.requiredSkills || ["React", "Tailwind CSS", "Node.js", "PostgreSQL", "Docker", "Cloud CI/CD"]);

        const p1Skills = allSkills.slice(0, 2);
        const p2Skills = allSkills.slice(2, 4).length > 0 ? allSkills.slice(2, 4) : ["Node.js", "PostgreSQL"];
        const p3Skills = allSkills.slice(4, 6).length > 0 ? allSkills.slice(4, 6) : ["Docker", "Cloud CI/CD"];

        const getSimpleTitle = (stepNum, skills) => {
          const s = (skills || []).join(" ").toLowerCase();
          const r = (selectedRole?.title || "").toLowerCase();
          if (stepNum === 1) {
            if (s.includes("react") || s.includes("html") || s.includes("tailwind") || s.includes("css") || r.includes("front") || r.includes("full stack") || r.includes("web")) {
              return "Step 1: Master the Frontend";
            }
            if (s.includes("python") || s.includes("r") || s.includes("data") || r.includes("data") || r.includes("stat")) {
              return "Step 1: Master Data Foundations";
            }
            if (s.includes("linux") || s.includes("docker") || r.includes("cloud") || r.includes("devops")) {
              return "Step 1: Master Linux & Core Tools";
            }
            return "Step 1: Master Core Foundations";
          }
          if (stepNum === 2) {
            if (s.includes("node") || s.includes("api") || s.includes("backend") || s.includes("postgre") || s.includes("sql") || r.includes("web") || r.includes("developer")) {
              return "Step 2: Build Backend & APIs";
            }
            if (s.includes("sampling") || s.includes("model") || s.includes("tableau") || r.includes("data")) {
              return "Step 2: Statistical Modeling & SQL";
            }
            if (s.includes("k8s") || s.includes("kubernetes") || s.includes("ci/cd")) {
              return "Step 2: Kubernetes & CI/CD Pipelines";
            }
            return "Step 2: Build Real-World Systems";
          }
          if (stepNum === 3) {
            if (s.includes("docker") || s.includes("cloud") || s.includes("aws") || r.includes("full stack") || r.includes("engineer")) {
              return "Step 3: Deploy & Cloud Capstone";
            }
            if (r.includes("mospi") || r.includes("stat") || r.includes("data")) {
              return "Step 3: MoSPI Official Capstone";
            }
            return "Step 3: National Capstone Certification";
          }
          return `Step ${stepNum}: Skill Tree Milestone`;
        };

        return [
          {
            stepNumber: 1,
            title: getSimpleTitle(1, p1Skills),
            skills: p1Skills,
            searchKeyword: p1Skills.length > 0 ? p1Skills.join(" ") : "HTML CSS",
            isCurrentTarget: true,
            isLocked: false,
            course: displayCourses[0] || IGOT_COURSES[0],
          },
          {
            stepNumber: 2,
            title: getSimpleTitle(2, p2Skills),
            skills: p2Skills,
            searchKeyword: p2Skills.length > 0 ? p2Skills.join(" ") : "Backend Nodejs",
            isCurrentTarget: false,
            isLocked: true,
            course: displayCourses[1] || IGOT_COURSES[1] || IGOT_COURSES[0],
          },
          {
            stepNumber: 3,
            title: getSimpleTitle(3, p3Skills),
            skills: p3Skills,
            searchKeyword: p3Skills.length > 0 ? p3Skills.join(" ") : "Docker Cloud",
            isCurrentTarget: false,
            isLocked: true,
            course: displayCourses[2] || IGOT_COURSES[2] || IGOT_COURSES[0],
          }
        ];
      }, [identifiedGaps, selectedRole, displayCourses]);

      const getReadinessTone = (score) => {
        if (score >= 75) return { label: "Role Ready • Final Polish", color: "text-emerald-400", message: "You are exceptionally well-aligned with this role! Complete the capstone milestone to finalize your certification." };
        if (score >= 40) return { label: "Strong Trajectory • Accelerating", color: "text-amber-400", message: "Great momentum! You hold key foundational proficiencies and are positioned to close your remaining growth opportunities rapidly." };
        return { label: "Growth Journey Initiated", color: "text-sky-300", message: "Every senior professional started here. Your personalized 3-phase journey bridges these competencies with accredited modules." };
      };

      const tone = getReadinessTone(displayScore);

      // Safe Simulated Integration Handshake for iGOT Karmayogi Portal
      const [redirectingStep, setRedirectingStep] = useState(null);
      const [redirectStage, setRedirectStage] = useState("");

      const handleStartOnIgot = (phase, customKeyword) => {
        if (phase.isLocked) {
          showToast("Please complete Step 1 first to unlock this module", "warning");
          return;
        }

        const skillName = customKeyword || (phase.skills && phase.skills.length > 0 ? phase.skills.join(" & ") : "Frontend Web Development");
        
        // 0s: Step 1 Handshake
        setRedirectingStep(phase.stepNumber);
        setRedirectStage("Authenticating...");
        showToast("Authenticating with MoSPI iGOT Portal...", "info");

        // 1s: Step 2 Querying Accredited Coursework
        setTimeout(() => {
          setRedirectStage("Locating Modules...");
          showToast(`Locating accredited modules for ${skillName}...`, "info");
        }, 1000);

        // 2s: Safe redirect strictly to base platform URL (100% immune to 404 errors)
        setTimeout(() => {
          window.open("https://igotkarmayogi.gov.in/", "_blank", "noopener,noreferrer");
          setRedirectingStep(null);
          setRedirectStage("");
        }, 2000);
      };

      return (
        <div className="space-y-10">
          {/* 1. MENTOR-CENTRIC SUMMARY HERO BANNER */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-900/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    MoSPI Empirical Career Matrix
                  </span>
                  <span className="text-xs text-slate-400">&bull; Qualification: {selectedDegree}</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                  {selectedRole.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {tone.message}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-slate-200">
                  <Icon name="sparkles" size={14} className="text-amber-400" />
                  <span>Status: <strong className={tone.color}>{tone.label}</strong></span>
                </div>
              </div>

              {/* Metrics Pods */}
              <div className="flex items-center gap-3 sm:gap-4 bg-white/5 p-4 sm:p-5 rounded-2xl backdrop-blur-md border border-white/10 text-center self-start lg:self-auto flex-shrink-0">
                <div className="px-3">
                  <span className="block text-3xl sm:text-4xl font-black font-display text-amber-400">
                    {displayScore}%
                  </span>
                  <span className="text-[11px] font-medium text-slate-300">Readiness Index</span>
                </div>
                
                <div className="h-10 w-px bg-white/15"></div>
                
                <div className="px-3">
                  <span className="block text-3xl sm:text-4xl font-black font-display text-emerald-400">
                    {verifiedKnown.length}
                  </span>
                  <span className="text-[11px] font-medium text-slate-300">Validated Strengths</span>
                </div>

                <div className="h-10 w-px bg-white/15"></div>

                <div className="px-3">
                  <span className="block text-3xl sm:text-4xl font-black font-display text-sky-400">
                    {identifiedGaps.length}
                  </span>
                  <span className="text-[11px] font-medium text-slate-300">Growth Opportunities</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. RESTRUCTURED SIDE-BY-SIDE COMPETENCY OVERVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: What You Bring (Validated Strengths) - 5 Cols */}
            <div className="lg:col-span-5 bg-gradient-to-b from-emerald-50/50 via-slate-50/60 to-white rounded-3xl p-6 border border-emerald-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <Icon name="check-check" size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Validated Strengths</h4>
                      <p className="text-[11px] text-slate-500">{verifiedKnown.length} verified foundational skills</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Your Foundation
                  </span>
                </div>

                <div className="space-y-2">
                  {verifiedKnown.length > 0 ? (
                    verifiedKnown.map((skill, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs flex items-center justify-between text-xs font-semibold hover:border-emerald-300 transition-colors">
                        <span className="text-slate-800 flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                          <span className="truncate">{skill}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex-shrink-0">
                          Mastered
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                        <Icon name="compass" size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Fresh Academic Career Starter</p>
                      <p className="text-[11px] text-slate-500 mt-1">Start with Phase 1 below to build your verified competency profile.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <Icon name="shield-check" size={14} className="text-emerald-600 flex-shrink-0" />
                <span>All validated skills are accredited against MoSPI cadre standards.</span>
              </div>
            </div>

            {/* Right Column: Skills to Acquire (Grouped into Industry Clusters) - 7 Cols */}
            <div className="lg:col-span-7 bg-gradient-to-b from-indigo-50/30 via-slate-50/50 to-white rounded-3xl p-6 border border-indigo-200/70 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <Icon name="sparkles" size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Skills to Acquire</h4>
                    <p className="text-[11px] text-slate-500">{identifiedGaps.length} gap{identifiedGaps.length !== 1 ? 's' : ''} across {domainClusters.length} PS-101 competency domain{domainClusters.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Recommended Path
                </span>
              </div>

              {domainClusters.length > 0 ? (
                <div className="space-y-4">
                  {domainClusters.map((cluster) => {
                    const isCollapsed = collapsedClusters[cluster.id];
                    return (
                      <div 
                        key={cluster.id} 
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${cluster.accentBg}`}
                      >
                        {/* Cluster Card Header with Accordion Toggle */}
                        <div 
                          onClick={() => toggleCluster(cluster.id)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/40 transition-colors select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs flex-shrink-0 ${cluster.badgeColor}`}>
                              <Icon name={cluster.icon || "layers"} size={16} />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-sm font-bold text-slate-900 truncate">
                                {cluster.title}
                              </h5>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {cluster.skills.length} target {cluster.skills.length === 1 ? 'skill' : 'skills'} in this domain
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <button
                              type="button"
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                              title={isCollapsed ? "Expand cluster" : "Collapse cluster"}
                            >
                              <Icon 
                                name="chevron-down" 
                                size={17} 
                                className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180 text-indigo-600'}`} 
                              />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Cluster Body */}
                        {!isCollapsed && (
                          <div className="px-4 pb-4 pt-1 bg-white/70 border-t border-slate-100">
                            <p className="text-[11px] text-slate-500 mb-3 font-medium">
                              {cluster.description}
                            </p>

                            {/* PS-101 Domain Readiness Mini-Bar (only when real backend data is present) */}
                            {cluster.readinessScore !== null && (
                              <div className="mb-3 p-2.5 bg-white/80 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1.5">
                                  <span>Domain Readiness</span>
                                  <span className="text-indigo-600">{cluster.readinessScore}% &bull; {cluster.acquiredCount} acquired</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                                    style={{ width: `${cluster.readinessScore}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Skills Tag Pills */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {cluster.skills.map((skill, sIdx) => (
                                <span 
                                  key={sIdx}
                                  className={`text-xs font-semibold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${cluster.pillBg} border-slate-200/80 shadow-2xs`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                  <span>{skill}</span>
                                </span>
                              ))}
                            </div>

                            {/* REDUCED BUTTON FATIGUE: ONE PRIMARY BUTTON PER CLUSTER */}
                            <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2">
                              <span className="text-[11px] text-slate-400">
                                Evaluated against national cadre guidelines
                              </span>
                              <button
                                type="button"
                                onClick={() => handleClusterAssessment(cluster)}
                                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 ${cluster.btnColor}`}
                              >
                                <Icon name="sparkles" size={13} />
                                <span>Validate {cluster.title.split(' ')[0]} Skills</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 bg-emerald-50 rounded-2xl text-center border border-emerald-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Icon name="award" size={24} />
                  </div>
                  <h5 className="text-sm font-bold text-emerald-900">Exceptional Academic & Skill Alignment!</h5>
                  <p className="text-xs text-emerald-700 mt-1">You satisfy 100% of the core competency requirements for {selectedRole.title}.</p>
                </div>
              )}
            </div>

          </div>

          {/* 3. SIMPLIFIED STEPPING STONE / SKILL TREE ROADMAP */}
          <div className="pt-8 border-t border-slate-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2 border border-blue-200">
                  <Icon name="sparkles" size={14} className="text-amber-500" />
                  <span>Stepping Stone Learning Path</span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
                  Your Skill Tree Roadmap
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Dead-simple progression. Complete your current target first to unlock the next level.
                </p>
              </div>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="self-start sm:self-auto px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? <Icon name="loader-2" size={14} className="animate-spin" /> : <Icon name="download" size={14} />}
                <span>{isExporting ? 'Generating PDF...' : 'Export Career Roadmap'}</span>
              </button>
            </div>

            {/* Visual Vertical Timeline Layout */}
            <div className="relative max-w-3xl mx-auto py-2">
              {/* Glowing vertical timeline track */}
              <div 
                className="absolute left-[27px] sm:left-[35px] top-6 bottom-6 w-1 bg-gradient-to-b from-blue-600 via-indigo-400 to-slate-200 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.35)] pointer-events-none"
              ></div>

              <div className="space-y-8 sm:space-y-10 relative">
                {careerPhases.map((phase) => {
                  const isActive = phase.isCurrentTarget;

                  return (
                    <div 
                      key={phase.stepNumber} 
                      className={`relative flex items-start gap-4 sm:gap-6 transition-all duration-300 ${
                        isActive ? 'scale-[1.01]' : 'opacity-65 hover:opacity-85'
                      }`}
                    >
                      {/* Friendly Circular Node on Timeline */}
                      <div className="relative z-10 flex-shrink-0 mt-1.5">
                        {isActive ? (
                          <div className="relative">
                            <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-blue-500/35 ring-4 ring-blue-100 ring-offset-2 ring-offset-white animate-subtle transition-transform hover:scale-105">
                              <span>{phase.stepNumber}</span>
                            </div>
                            {/* Glowing Active Target Ping */}
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-xs"></span>
                            </span>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 font-extrabold text-lg sm:text-xl flex items-center justify-center shadow-xs">
                              <span>{phase.stepNumber}</span>
                            </div>
                            {/* Lock badge indicator */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 shadow-xs">
                              <Icon name="lock" size={12} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Clean Minimal Card */}
                      <div 
                        className={`flex-1 min-w-0 rounded-3xl p-5 sm:p-7 border transition-all duration-300 ${
                          isActive 
                            ? 'bg-white border-2 border-blue-500 shadow-xl shadow-blue-500/10' 
                            : 'bg-slate-50/80 border-slate-200 shadow-xs'
                        }`}
                      >
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              Current Target
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-600 border border-slate-300/80">
                              <Icon name="lock" size={12} />
                              Locked • Complete Step {phase.stepNumber - 1} First
                            </span>
                          )}

                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700 border-blue-100' 
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            Step {phase.stepNumber} of 3
                          </span>
                        </div>

                        {/* Bold, Simple Title */}
                        <h4 className={`text-xl sm:text-2xl font-black tracking-tight font-display ${
                          isActive ? 'text-slate-900' : 'text-slate-600'
                        }`}>
                          {phase.title}
                        </h4>

                        {/* Visually Distinct Skill Pills ONLY */}
                        <div className="flex flex-wrap gap-2 my-4">
                          {phase.skills.map((skill, sIdx) => (
                            <span 
                              key={sIdx}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                                isActive 
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs' 
                                  : 'bg-white text-slate-400 border border-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>

                        {/* Single Prominent Call to Action */}
                        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleStartOnIgot(phase, phase.stepNumber === 1 ? (phase.skills && phase.skills.length > 0 ? phase.skills.join(" & ") : "Frontend Web Development") : "Backend Architecture")}
                              disabled={redirectingStep === phase.stepNumber}
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-95 transition-all cursor-pointer group"
                            >
                              {redirectingStep === phase.stepNumber ? (
                                <>
                                  <Icon name="loader-2" size={16} className="animate-spin text-white" />
                                  <span>{redirectStage || "Connecting to iGOT..."}</span>
                                </>
                              ) : (
                                <>
                                  <span>Start on iGOT</span>
                                  <Icon name="arrow-right" size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartOnIgot(phase, "Backend Architecture")}
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-200/80 hover:bg-slate-300 text-slate-500 font-bold text-sm transition-colors cursor-pointer group/locked"
                              title="Please complete Step 1 first to unlock this module"
                            >
                              <Icon name="lock" size={14} className="text-slate-500 group-hover/locked:scale-110 transition-transform" />
                              <span>Start on iGOT</span>
                            </button>
                          )}

                          {isActive && (
                            <span className="text-xs text-slate-400 font-medium">
                              Free Government Accreditation &bull; iGOT Karmayogi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* 4. BOTTOM ACTION BAR */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={onRestart}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-all"
            >
              <Icon name="rotate-ccw" size={14} />
              <span>Start Over</span>
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95 shadow-blue-900/20"
            >
              <span>Go to Learning Dashboard</span>
              <Icon name="arrow-right" size={15} />
            </button>
          </div>

          <RoadmapPDFTemplate 
            user={user}
            targetRole={selectedRole?.title}
            readinessScore={displayScore}
            verifiedKnown={verifiedKnown}
            domainClusters={domainClusters}
            careerPhases={careerPhases}
          />
        </div>
      );
    }
