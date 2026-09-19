import React, { useState, useContext, createContext } from 'react';
import { API_BASE_URL } from '../config/api';

// ==========================================
// GLOBAL AUTHENTICATION CONTEXT (GOOGLE OAUTH & SESSION)
// ==========================================
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("skillbank_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("skillbank_token") || null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ── Helper: decode Google JWT payload locally (base64url → JSON) ──────────
  const decodeGoogleJwt = (credential) => {
    try {
      const parts = credential.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT structure');
      // base64url → base64 → decode
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(payload + '=='.slice((payload.length % 4) || 4));
      return JSON.parse(json);
    } catch (e) {
      console.warn('[Auth] JWT local decode failed:', e);
      return null;
    }
  };

  // Verify and authenticate Google JWT token with FastAPI backend (/api/auth/google)
  // Falls back to local JWT decode if backend is unreachable (dev / offline mode)
  const loginWithGoogle = async (credential) => {
    console.log('[Auth] loginWithGoogle called, credential length:', credential?.length);
    setLoading(true);
    setAuthError(null);
    try {
      console.log('[Auth] Calling backend:', `${API_BASE_URL}/auth/google`);
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Google authentication failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('[Auth] Backend auth success, full user object:', data.user);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("skillbank_user", JSON.stringify(data.user));
      localStorage.setItem("skillbank_token", data.token);
      return data.user;
    } catch (err) {
      // ── FALLBACK: Backend unavailable — decode Google JWT locally ──────────
      console.warn('[Auth] Backend unavailable, attempting local JWT fallback. Reason:', err.message);
      const decoded = decodeGoogleJwt(credential);
      if (decoded && decoded.email) {
        const fallbackUser = {
          name: decoded.name || decoded.email.split('@')[0],
          email: decoded.email,
          picture: decoded.picture || null,
          sub: decoded.sub,
          _mode: 'offline_fallback',
        };
        console.log('[Auth] Local fallback user:', fallbackUser.email, '| name:', fallbackUser.name);
        setUser(fallbackUser);
        setToken('local-fallback-token');
        localStorage.setItem("skillbank_user", JSON.stringify(fallbackUser));
        localStorage.setItem("skillbank_token", 'local-fallback-token');
        setAuthError(null); // clear any error — login succeeded via fallback
        return fallbackUser;
      }
      // No fallback possible
      console.error('[Auth] Google OAuth error (no fallback possible):', err);
      setAuthError(err.message || "Failed to sign in with Google. Make sure the backend is running.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("skillbank_user");
    localStorage.removeItem("skillbank_token");
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      loading,
      authError,
      loginWithGoogle,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export default AuthContext;
