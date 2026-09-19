import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import Icon from './Icon';

// ==========================================
// TOPIC-SPECIFIC QUIZ MODAL (AI-GENERATED)
// ==========================================
export default function TopicQuizModal({ topic, onClose, setGlobalApiError, showToast }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/quiz/generate-topic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topic })
        });
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (isMounted) {
          setQuestions(data.questions || []);
        }
      } catch (err) {
        console.error("Error generating topic quiz:", err);
        if (setGlobalApiError) {
          setGlobalApiError("Unable to connect to MoSPI Standards API. Please ensure the server is running or try again later.");
        }
        if (isMounted) {
          // Resilient fallback questions for topic
          setQuestions([
            {
              id: 1,
              question: `What is the primary architectural advantage of applying ${topic} in modern enterprise software?`,
              options: [
                "Bypasses runtime validation checks for faster response times",
                `Improves modularity, fault isolation, and scalability for ${topic} implementations`,
                "Forces all network requests onto a single physical server",
                "Disables version control on source code repositories"
              ],
              correct_index: 1,
              correct_answer: `Improves modularity, fault isolation, and scalability for ${topic} implementations`,
              explanation: `Adopting standardized patterns in ${topic} ensures high reliability, testability, and decoupled services.`,
              topic: topic
            },
            {
              id: 2,
              question: `Which quality assurance strategy is best suited for certifying ${topic} before production deployment?`,
              options: [
                "Manual inspection of binary hex dumps",
                "Automated regression testing and continuous integration health checks",
                "Deploying directly to production on peak load hours",
                "Disabling error logging"
              ],
              correct_index: 1,
              correct_answer: "Automated regression testing and continuous integration health checks",
              explanation: "Comprehensive automated test suites validate that updates do not introduce performance regressions or functional errors.",
              topic: topic
            }
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchQuiz();
    return () => { isMounted = false; };
  }, [topic]);

  const handleSelectOption = (idx) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    
    const q = questions[currentIndex];
    // Coerce to number to handle API returning strings
    const correctIdx = q.correct_index !== undefined ? Number(q.correct_index) : Number(q.correctIndex || 0);
    
    if (idx === correctIdx) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all"
        >
          <Icon name="x" size={20} />
        </button>

        {loading && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-900 mx-auto flex items-center justify-center relative">
              <Icon name="loader-2" size={32} className="animate-spin text-brand-900" />
              <span className="w-3 h-3 rounded-full bg-amber-500 absolute -top-1 -right-1 animate-ping"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-display">Generating test for {topic}...</h3>
              <p className="text-xs text-slate-500 mt-1">Formulating Bloom's taxonomy assessment questions via Gemini AI</p>
            </div>
            <div className="max-w-xs mx-auto space-y-2 pt-2">
              <div className="h-2 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="h-2 bg-slate-200 rounded-full w-3/4 mx-auto animate-pulse"></div>
            </div>
          </div>
        )}

        {!loading && !isCompleted && currentQ && (
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-brand-900 px-2 py-0.5 rounded border border-blue-200">
                  {topic} Assessment
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">Question {currentIndex + 1} of {questions.length}</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">Score: {score}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
              <div 
                className="bg-brand-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-5 leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-2.5 mb-5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const correctIdx = currentQ.correct_index !== undefined ? Number(currentQ.correct_index) : Number(currentQ.correctIndex || 0);
                const isCorrect = idx === correctIdx;
                let optionStyle = "border-slate-200 hover:border-blue-400 hover:bg-slate-50";
                
                if (showExplanation) {
                  if (isCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                  } else if (isSelected && !isCorrect) {
                    optionStyle = "border-red-400 bg-red-50 text-red-900";
                  } else {
                    optionStyle = "border-slate-200 opacity-60";
                  }
                } else if (isSelected) {
                  optionStyle = "border-brand-900 bg-blue-50/70 font-semibold";
                }

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${optionStyle}`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      showExplanation && isCorrect 
                        ? 'bg-emerald-600 text-white' 
                        : showExplanation && isSelected && !isCorrect
                          ? 'bg-red-600 text-white'
                          : isSelected 
                            ? 'bg-brand-900 text-white' 
                            : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {showExplanation && isCorrect && (
                      <Icon name="check-circle" size={16} className="text-emerald-600 flex-shrink-0" />
                    )}
                    {showExplanation && isSelected && !isCorrect && (
                      <Icon name="x-circle" size={16} className="text-red-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {showExplanation && (
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 mb-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-brand-900 font-bold text-xs mb-1">
                  <Icon name="lightbulb" size={14} className="text-amber-500" />
                  <span>Pedagogical Rationale:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              {showExplanation ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
                >
                  <span>{currentIndex + 1 === questions.length ? "View Final Score" : "Next Question"}</span>
                  <Icon name="arrow-right" size={15} />
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Select an option above to verify answer</span>
              )}
            </div>
          </div>
        )}

        {!loading && isCompleted && (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <Icon name="award" size={36} />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {topic} Assessment Complete
              </span>
              <h3 className="font-bold text-2xl text-slate-900 font-display mt-2">
                Score: {score} / {questions.length} ({questions.length ? Math.round((score / questions.length) * 100) : 0}%)
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5">
                {score >= Math.ceil(questions.length * 0.7) 
                  ? "Great job! You demonstrated strong proficiency in this competency area." 
                  : "Keep practicing! We recommend reviewing the aligned iGOT Karmayogi modules to strengthen this skill."}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setShowExplanation(false);
                  setScore(0);
                  setIsCompleted(false);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Icon name="rotate-ccw" size={14} /> Retake Test
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Back to Gap Matrix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
