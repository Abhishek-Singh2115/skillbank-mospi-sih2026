import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function Header({ setActivePage, setAuthModalOpen, hasCompletedAnalysis, onSignOut }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();           // clears localStorage + AuthContext user/token
    setDropdownOpen(false);
    if (onSignOut) {
      onSignOut();      // resets App-level state: hasCompletedAnalysis, userState, activePage
    } else {
      setActivePage('landing');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActivePage('landing')}
          >
            <div className="w-8 h-8 rounded-lg bg-brand-900 text-amber-400 flex items-center justify-center font-bold">
              <Icon name="layers" size={18} />
            </div>
            <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
              Skill<span className="text-brand-900">Bank</span>
            </span>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Home — always accessible */}
            <button 
              onClick={() => setActivePage('landing')} 
              className="text-sm font-semibold text-slate-600 hover:text-brand-900 transition-colors"
            >
              Home
            </button>

            {/* Skill Analyzer — requires login */}
            <button 
              onClick={() => setActivePage('analyzer')} 
              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                isAuthenticated
                  ? 'text-slate-600 hover:text-brand-900'
                  : 'text-slate-400 hover:text-slate-500 cursor-pointer'
              }`}
              title={!isAuthenticated ? 'Sign in to access Skill Analyzer' : ''}
            >
              {!isAuthenticated && <Icon name="lock" size={12} className="text-slate-400" />}
              Skill Analyzer
            </button>

            {/* Dashboard — requires login + completed analysis */}
            <button 
              onClick={() => setActivePage('dashboard')} 
              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                isAuthenticated && hasCompletedAnalysis
                  ? 'text-slate-600 hover:text-brand-900'
                  : 'text-slate-400 hover:text-slate-500 cursor-pointer'
              }`}
              title={!isAuthenticated ? 'Sign in to access Dashboard' : !hasCompletedAnalysis ? 'Complete Skill Analyzer first' : ''}
            >
              {(!isAuthenticated || !hasCompletedAnalysis) && <Icon name="lock" size={12} className="text-slate-400" />}
              Dashboard
            </button>

            {/* AI Quiz — requires login */}
            <button 
              onClick={() => setActivePage('quiz')} 
              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                isAuthenticated
                  ? 'text-slate-600 hover:text-brand-900'
                  : 'text-slate-400 hover:text-slate-500 cursor-pointer'
              }`}
              title={!isAuthenticated ? 'Sign in to access AI Quiz' : ''}
            >
              {!isAuthenticated && <Icon name="lock" size={12} className="text-slate-400" />}
              AI Quiz
            </button>
          </nav>

          {/* AUTH SECTION */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Icon name="log-in" size={16} />
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar / name trigger */}
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900 leading-tight">{user?.name || "Candidate"}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{user?.email || ""}</span>
                  </div>
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <Icon name="chevron-down" size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Candidate"}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || ""}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        Google Verified
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <button
                        onClick={() => { setActivePage('dashboard'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Icon name="layout-dashboard" size={14} className="text-brand-900" />
                        My Dashboard
                      </button>
                      <button
                        onClick={() => { setActivePage('analyzer'); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Icon name="sparkles" size={14} className="text-amber-500" />
                        Skill Analyzer
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-slate-100 py-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Icon name="log-out" size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
