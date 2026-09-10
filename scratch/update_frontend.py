import re

# Read original index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add API_BASE_URL near the top of the React script
old_api_anchor = "const { useState, useEffect, useMemo, useRef } = React;"
new_api_anchor = """const { useState, useEffect, useMemo, useRef } = React;
    const API_BASE_URL = "http://localhost:8000/api";"""

if old_api_anchor in content and "const API_BASE_URL" not in content:
    content = content.replace(old_api_anchor, new_api_anchor, 1)
    print("Added API_BASE_URL")

# 2. Add backend health status check in App()
old_app_start = """    function App() {
      const [activePage, setActivePage] = useState('landing');"""

new_app_start = """    function App() {
      const [activePage, setActivePage] = useState('landing');
      const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });

      // Ping FastAPI Backend Health Check on Mount
      useEffect(() => {
        const checkHealth = () => {
          fetch(`${API_BASE_URL}/health`)
            .then(res => res.json())
            .then(data => {
              setBackendStatus({ online: true, checking: false, details: data });
            })
            .catch(() => {
              setBackendStatus({ online: false, checking: false });
            });
        };
        checkHealth();
        const interval = setInterval(checkHealth, 15000);
        return () => clearInterval(interval);
      }, []);"""

if old_app_start in content and "setBackendStatus" not in content:
    content = content.replace(old_app_start, new_app_start, 1)
    print("Added backend health monitoring in App()")

# 3. Add live backend status indicator badge in the top MoSPI / SIH banner
old_banner_right = """              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <Icon name="shield-check" size={14} className="text-amber-400" />
                  <span>iGOT Karmayogi Integrated</span>
                </span>"""

new_banner_right = """              <div className="flex items-center gap-3 text-slate-300">
                <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                  backendStatus.online 
                    ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-xs' 
                    : 'bg-amber-950/80 border-amber-500/80 text-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendStatus.online ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                  <span>{backendStatus.online ? 'FastAPI Backend Live (:8000)' : 'Backend Connecting...'}</span>
                </div>
                <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <Icon name="shield-check" size={14} className="text-amber-400" />
                  <span>iGOT Karmayogi Integrated</span>
                </span>"""

if old_banner_right in content and "FastAPI Backend Live" not in content:
    content = content.replace(old_banner_right, new_banner_right, 1)
    print("Added live backend status badge in banner")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Step 1 & 2 complete.")
