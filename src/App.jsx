import React, { useState, useCallback, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import LandingPage from './components/LandingPage'
import { useAuth } from './context/AuthContext'
import SignInModal from './components/SignInModal'
import TopicQuizModal from './components/TopicQuizModal'
import SkillGapAnalyzer from './components/analyzer/SkillGapAnalyzer'
import AdminDashboard from './components/AdminDashboard'
import QuizPage from './components/QuizPage'

const EMPTY_USER_STATE = {
  name: null,
  email: null,
  picture: null,
  degree: null,
  targetRole: null,
  readinessScore: 0,
  identifiedGapsCount: 0,
  knownSkills: [],
  missingSkills: [],
  modulesCompleted: 0,
  totalModules: 0,
  recentActivity: [],
};

// ProtectedRoute component defined outside App to prevent remounting
const ProtectedRoute = ({ isAuthenticated, hasCompletedAnalysis, requireAnalysis, showToast, setAuthModalOpen, children }) => {
  useEffect(() => {
    if (!isAuthenticated) {
      showToast('🔒 Please sign in first to access this feature.');
      setAuthModalOpen(true);
    } else if (requireAnalysis && !hasCompletedAnalysis) {
      showToast('📊 Complete the Skill Analyzer first to unlock your Dashboard.');
    }
  }, [isAuthenticated, requireAnalysis, hasCompletedAnalysis, showToast, setAuthModalOpen]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (requireAnalysis && !hasCompletedAnalysis) {
    return <Navigate to="/analyzer" replace />;
  }
  return children;
};

function App() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [topicQuizTopic, setTopicQuizTopic] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Restore hasCompletedAnalysis if the user already has a saved target_role
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(
    () => !!(user && user.target_role)
  )

  // Seed name/email/picture from real Google auth if available;
  // Also restore analysis data if the returning user already has a saved target_role.
  const [userState, setUserState] = useState(() => {
    const base = { ...EMPTY_USER_STATE };
    if (user) {
      base.name = user.name;
      base.email = user.email;
      base.picture = user.picture;
      // Restore persisted analysis if available
      if (user.target_role) {
        base.targetRole = user.target_role;
        base.knownSkills = user.current_skills || [];
        base.missingSkills = user.missing_skills || [];
        base.readinessScore = user.readiness_score || 0;
        base.identifiedGapsCount = user.identified_gaps_count || 0;
        base.degree = user.degree || null;
      }
    }
    return base;
  })

  // Simple toast notification
  const showToast = useCallback((message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  // Topic quiz handler
  const handleOpenTopicQuiz = useCallback((topic) => {
    setTopicQuizTopic(topic)
  }, [])

  // Called by SkillGapAnalyzer when analysis results are fully generated
  const handleAnalysisComplete = useCallback((results) => {
    console.log('[App] Skill analysis complete — unlocking Dashboard');
    setHasCompletedAnalysis(true)
    if (results) {
      setUserState(prev => ({ ...prev, ...results }))
    }
    showToast('✅ Skill analysis complete! Dashboard is now unlocked.')
  }, [showToast])

  // Called by Header Sign Out — resets ALL session state so the next user starts fresh
  const handleSignOut = useCallback(() => {
    console.log('[App] Sign out — resetting session state');
    setHasCompletedAnalysis(false)
    setUserState(EMPTY_USER_STATE)
    setTopicQuizTopic(null)
    navigate('/')
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        setAuthModalOpen={setAuthModalOpen}
        hasCompletedAnalysis={hasCompletedAnalysis}
        onSignOut={handleSignOut}
      />
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
          {toastMessage}
        </div>
      )}
      
      <main className="flex-grow">
      <Routes>
        <Route path="/" element={
          <LandingPage
            setAuthModalOpen={setAuthModalOpen}
            isAuthenticated={isAuthenticated}
            userState={userState}
            setUserState={setUserState}
            showToast={showToast}
          />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            hasCompletedAnalysis={hasCompletedAnalysis}
            requireAnalysis
            showToast={showToast}
            setAuthModalOpen={setAuthModalOpen}
          >
            <Dashboard
              userState={userState}
              showToast={showToast}
              onOpenTopicQuiz={handleOpenTopicQuiz}
              setAuthModalOpen={setAuthModalOpen}
            />
          </ProtectedRoute>
        } />
        <Route path="/analyzer/*" element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            hasCompletedAnalysis={hasCompletedAnalysis}
            showToast={showToast}
            setAuthModalOpen={setAuthModalOpen}
          >
            <SkillGapAnalyzer
              userState={userState}
              setUserState={setUserState}
              showToast={showToast}
              onOpenTopicQuiz={handleOpenTopicQuiz}
              onAnalysisComplete={handleAnalysisComplete}
              setGlobalApiError={(err) => console.error("API Error:", err)}
            />
          </ProtectedRoute>
        } />
        <Route path="/quiz" element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            hasCompletedAnalysis={hasCompletedAnalysis}
            showToast={showToast}
            setAuthModalOpen={setAuthModalOpen}
          >
            <QuizPage
              showToast={showToast}
              onOpenTopicQuiz={(topic) => setTopicQuizTopic(topic)}
              userState={userState}
            />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            hasCompletedAnalysis={hasCompletedAnalysis}
            showToast={showToast}
            setAuthModalOpen={setAuthModalOpen}
          >
            <AdminDashboard
              showToast={showToast}
            />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Sign-In Modal */}
      <SignInModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        showToast={showToast}
        onSuccess={(loggedInUser) => {
          // Populate userState from backend-returned profile (which includes persisted analysis)
          setUserState(prev => ({
            ...prev,
            name: loggedInUser.name,
            email: loggedInUser.email,
            picture: loggedInUser.picture,
            degree: loggedInUser.degree || prev.degree,
            ...(loggedInUser.target_role ? {
              targetRole: loggedInUser.target_role,
              knownSkills: loggedInUser.current_skills || [],
              missingSkills: loggedInUser.missing_skills || [],
              readinessScore: loggedInUser.readiness_score || 0,
              identifiedGapsCount: loggedInUser.identified_gaps_count || 0,
            } : {}),
          }));
          // Auto-unlock Dashboard if a prior analysis was already saved for this user
          if (loggedInUser.target_role) {
            setHasCompletedAnalysis(true);
            showToast(`Welcome back, ${loggedInUser.name}! 🎉 Your dashboard is ready.`);
            navigate('/dashboard');
          } else {
            showToast(`Welcome, ${loggedInUser.name}! 🎉 Start with the Skill Analyzer.`);
            navigate('/analyzer');
          }
        }}
      />

      {/* Topic Quiz Modal */}
      {topicQuizTopic && (
        <TopicQuizModal
          topic={topicQuizTopic}
          onClose={() => setTopicQuizTopic(null)}
          showToast={showToast}
          setGlobalApiError={(err) => console.error("API Error:", err)}
        />
      )}
      </main>
    </div>
  )
}

export default App

