import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoogleOAuth } from '../context/GoogleOAuthContext';
import Icon from './Icon';

// ==========================================
// DYNAMIC GOOGLE AUTHENTICATION MODAL (SIGNINMODAL)
// ==========================================
export default function SignInModal({ isOpen, onClose, showToast, onSuccess }) {
  const { loginWithGoogle, loading, authError } = useAuth();
  const { clientId } = useGoogleOAuth();
  const [localError, setLocalError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const googleBtnContainerRef = useRef(null);

  // Mount Google Identity Services (GIS) client and button
  useEffect(() => {
    console.log('[SignInModal] Modal open state changed:', isOpen, '| window.google available:', !!(window.google?.accounts?.id));
    if (isOpen && window.google && window.google.accounts && window.google.accounts.id) {
      try {
        console.log('[SignInModal] Initializing GIS with clientId:', clientId);
        window.google.accounts.id.initialize({
          client_id: clientId || "dummy-id-to-prevent-crash.apps.googleusercontent.com",
          callback: async (response) => {
            console.log('[SignInModal] GIS callback fired, credential present:', !!response?.credential);
            if (response && response.credential) {
              setIsAuthenticating(true);
              setLocalError(null);
              try {
                const loggedInUser = await loginWithGoogle(response.credential);
                console.log('[SignInModal] Login successful:', loggedInUser?.email);
                showToast(`Authenticated as ${loggedInUser.name} (${loggedInUser.email})`);
                if (onSuccess) onSuccess(loggedInUser);
                onClose();
              } catch (err) {
                console.error('[SignInModal] Login failed:', err.message);
                setLocalError(err.message || "Google token verification failed.");
              } finally {
                setIsAuthenticating(false);
              }
            }
          }
        });

        // If container is rendered, display native Google Sign In button
        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill"
          });
          console.log('[SignInModal] GIS button rendered successfully');
        }
      } catch (e) {
        console.warn("[SignInModal] Google Identity Services note:", e);
      }
    } else if (isOpen) {
      console.warn('[SignInModal] Google GIS not available yet. window.google:', typeof window.google);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Icon name="x" size={18} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-900 to-blue-600 text-amber-400 flex items-center justify-center shadow-md shadow-blue-900/15 flex-shrink-0">
            <Icon name="landmark" size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 font-display tracking-tight">MoSPI Candidate Portal</h3>
            <p className="text-xs text-slate-500">Sign in with your Google account to sync your profile</p>
          </div>
        </div>

        {/* Error Banner */}
        {(localError || authError) && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <Icon name="alert-circle" size={16} className="text-red-600 flex-shrink-0" />
            <span className="leading-snug">{localError || authError}</span>
          </div>
        )}

        {/* ONLY THE REAL GOOGLE AUTHENTICATION ACTION */}
        <div className="space-y-4 mb-6">
          {/* GIS Native Container (The only Google Sign-In button) */}
          <div ref={googleBtnContainerRef} className="flex justify-center w-full min-h-[44px]"></div>


          <p className="text-[11px] text-center text-slate-500 leading-relaxed mt-4">
            Connect using your personal or university Google Account. Your assessment progress, identified skill gaps, and iGOT courses will sync directly with MongoDB.
          </p>
        </div>

        {/* Footer Trust Indicator */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Icon name="lock" size={13} className="text-emerald-600" />
            <span>Google OAuth 2.0 Verified</span>
          </div>
          <span className="font-semibold text-slate-500">MongoDB Sync Enabled</span>
        </div>
      </div>
    </div>
  );
}
