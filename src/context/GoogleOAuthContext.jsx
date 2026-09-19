import React, { useState, useContext, createContext, useEffect } from 'react';

// ==========================================
// GOOGLE OAUTH PROVIDER (SAFE CLIENT ID & GIS BINDING)
// ==========================================
const GoogleOAuthContext = createContext({ clientId: "dummy-id-to-prevent-crash.apps.googleusercontent.com" });

export function GoogleOAuthProvider({ clientId, children }) {
  const safeClientId = clientId || "dummy-id-to-prevent-crash.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__GOOGLE_CLIENT_ID__ = safeClientId;
    }
  }, [safeClientId]);

  return (
    <GoogleOAuthContext.Provider value={{ clientId: safeClientId }}>
      {children}
    </GoogleOAuthContext.Provider>
  );
}

export function useGoogleOAuth() {
  return useContext(GoogleOAuthContext);
}

export default GoogleOAuthContext;
