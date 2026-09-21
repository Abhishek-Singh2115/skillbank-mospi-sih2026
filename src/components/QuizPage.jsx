import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import Icon from "./Icon";
import TopicQuizModal from "./TopicQuizModal";

// ==========================================
// AI QUIZ GENERATOR — FULL PAGE
// ==========================================

const QUIZ_TOPICS = [
  {
    id: "docker",
    name: "Docker & Containers",
    description: "Container architecture, Dockerfile, image layers, and orchestration fundamentals.",
    icon: "box",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "Cloud & DevOps",
    badgeColor: "bg-blue-100 text-blue-700",
    difficulty: "Intermediate",
  },
  {
    id: "python",
    name: "Python for Data Analysis",
    description: "Pandas, NumPy, data wrangling, statistical operations, and Matplotlib visualisation.",
    icon: "code-2",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "Data Science",
    badgeColor: "bg-emerald-100 text-emerald-700",
    difficulty: "Beginner",
  },
  {
    id: "sql",
    name: "SQL & Databases",
    description: "Joins, aggregations, window functions, indexing strategies, and query optimisation.",
    icon: "database",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "Backend",
    badgeColor: "bg-violet-100 text-violet-700",
    difficulty: "Intermediate",
  },
  {
    id: "react",
    name: "React 18 & Frontend",
    description: "Hooks, Concurrent Rendering, state management, performance patterns, and component architecture.",
    icon: "layers",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    badge: "Frontend",
    badgeColor: "bg-cyan-100 text-cyan-700",
    difficulty: "Intermediate",
  },
  {
    id: "statistics",
    name: "MoSPI Statistical Methods",
    description: "NSSO sampling methodologies, NIF indicators, stratified sampling, and economic census.",
    icon: "bar-chart-3",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "MoSPI Core",
    badgeColor: "bg-amber-100 text-amber-700",
    difficulty: "Advanced",
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Scalable architectures, microservices, load balancing, caching, and distributed systems.",
    icon: "cpu",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "Architecture",
    badgeColor: "bg-rose-100 text-rose-700",
    difficulty: "Advanced",
  },
  {
    id: "cloud",
    name: "Cloud Infrastructure",
    description: "AWS / NIC Meghraj, Terraform, Kubernetes, CI/CD pipelines, and cloud security.",
    icon: "cloud",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    badge: "DevOps",
    badgeColor: "bg-sky-100 text-sky-700",
    difficulty: "Advanced",
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    description: "Supervised/unsupervised learning, model evaluation, feature engineering, and scikit-learn.",
    icon: "sparkles",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "AI / ML",
    badgeColor: "bg-purple-100 text-purple-700",
    difficulty: "Advanced",
  },
];

const DIFFICULTY_COLORS = {
  Beginner: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Intermediate: "text-amber-700 bg-amber-50 border-amber-200",
  Advanced: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function QuizPage({ showToast, userState }) {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(null);

  // Dynamic Topics Logic
  const getDynamicTopics = () => {
    if (!userState || !userState.missingSkills || userState.missingSkills.length === 0) {
      return QUIZ_TOPICS;
    }

    const roleBadge = userState.targetRole || "Target Skill";
    const styles = [
      { icon: "code", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", badgeColor: "bg-blue-100 text-blue-700" },
      { icon: "cpu", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", badgeColor: "bg-emerald-100 text-emerald-700" },
      { icon: "database", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", badgeColor: "bg-violet-100 text-violet-700" },
      { icon: "layers", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", badgeColor: "bg-cyan-100 text-cyan-700" },
      { icon: "bar-chart-3", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", badgeColor: "bg-amber-100 text-amber-700" },
      { icon: "cloud", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", badgeColor: "bg-sky-100 text-sky-700" },
      { icon: "sparkles", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", badgeColor: "bg-purple-100 text-purple-700" },
    ];

    const dynamicTopics = userState.missingSkills.map((skill, index) => {
      const match = QUIZ_TOPICS.find(t => 
        t.name.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(t.id.toLowerCase())
      );
      if (match) return match;

      const style = styles[index % styles.length];
      return {
        id: skill.toLowerCase().replace(/\s+/g, '-'),
        name: skill,
        description: `Test your knowledge and bridge your gap in ${skill} for the ${roleBadge} role.`,
        icon: style.icon,
        color: style.color,
        bg: style.bg,
        border: style.border,
        badge: roleBadge,
        badgeColor: style.badgeColor,
        difficulty: "Intermediate",
      };
    });

    if (dynamicTopics.length < 8) {
      const remaining = QUIZ_TOPICS.filter(qt => !dynamicTopics.some(dt => dt.id === qt.id));
      return [...dynamicTopics, ...remaining].slice(0, 8);
    }
    return dynamicTopics;
  };

  const currentTopics = getDynamicTopics();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("dashboard")}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
          >
            <Icon name="arrow-left" size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              AI Quiz Generator
              <span className="text-xs font-bold bg-blue-100 text-brand-900 px-2 py-0.5 rounded-full">
                Powered by Gemini
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Select a competency domain to generate an AI-tailored Bloom&apos;s taxonomy assessment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <Icon name="award" size={16} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-800">iGOT Karmayogi Aligned</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Topics Available", value: currentTopics.length, icon: "layers", color: "text-brand-900" },
          { label: "Avg Questions", value: "5–10", icon: "help-circle", color: "text-emerald-600" },
          { label: "AI Engine", value: "Gemini", icon: "sparkles", color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
              <Icon name={stat.icon} size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-lg font-extrabold font-display text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Topic grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {currentTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${topic.bg} border ${topic.border} flex items-center justify-center ${topic.color}`}>
                <Icon name={topic.icon} size={22} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${topic.badgeColor}`}>
                {topic.badge}
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug">{topic.name}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed flex-1">{topic.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${DIFFICULTY_COLORS[topic.difficulty]}`}>
                {topic.difficulty}
              </span>
              <button
                onClick={() => setActiveTopic(topic.name)}
                className="px-3.5 py-1.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Icon name="play" size={12} />
                Start Quiz
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom topic */}
      <div className="mt-8 bg-gradient-to-br from-brand-900 to-blue-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-base font-display mb-1 flex items-center gap-2">
            <Icon name="wand-2" size={18} className="text-amber-400" />
            Custom Topic Quiz
          </h3>
          <p className="text-xs text-blue-200 leading-relaxed">
            Type any skill, technology, or MoSPI domain — Gemini will generate tailored questions instantly.
          </p>
        </div>
        <CustomTopicInput onLaunch={setActiveTopic} showToast={showToast} />
      </div>

      {/* Quiz modal */}
      {activeTopic && (
        <TopicQuizModal
          topic={activeTopic}
          onClose={() => setActiveTopic(null)}
          showToast={showToast}
          setGlobalApiError={(err) => console.error("Quiz API Error:", err)}
        />
      )}
    </div>
  );
}

function CustomTopicInput({ onLaunch }) {
  const [value, setValue] = useState("");
  const handleSubmit = () => {
    const t = value.trim();
    if (!t) return;
    onLaunch(t);
    setValue("");
  };
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="e.g. Kubernetes, NSSO Surveys..."
        className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder-blue-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:bg-white/20 transition-all"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold text-sm rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
      >
        <Icon name="sparkles" size={15} />
        Generate
      </button>
    </>
  );
}
