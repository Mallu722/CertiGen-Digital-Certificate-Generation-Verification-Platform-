import { useState, useEffect } from 'react';
import axios from 'axios';

interface HealthStatus {
  status: string;
  timestamp: string;
  latency?: number;
}

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<HealthStatus | null>(null);
  
  const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();
    try {
      const response = await axios.get(`${apiHost}/api/health/`);
      const latency = Date.now() - startTime;
      setStatus({
        status: response.data.status,
        timestamp: new Date().toLocaleTimeString(),
        latency
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-lg z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
            CertiGen
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">
            Digital Certificate Platform
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Glassmorphic border glow */}
          <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />

          <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
            System Connectivity Status
            {status?.status === 'ok' && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </h2>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-sky-500 animate-spin" />
              <p className="text-slate-400 text-sm animate-pulse">Pinging backend server...</p>
            </div>
          ) : error ? (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3">
                <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-red-400 font-semibold text-sm">Connection Failed</h3>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">{error}</p>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-900 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-300">Troubleshooting Steps:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Ensure Django backend server is running on <code className="text-indigo-400">{apiHost}</code></li>
                  <li>Verify PostgreSQL is running and connected</li>
                  <li>Confirm CORS settings allow requests from this origin</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3">
                <svg className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-emerald-400 font-semibold text-sm">Successfully Connected</h3>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    React frontend successfully verified connection to Django REST Framework backend.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-900">
                  <p className="text-slate-500 font-medium">Backend Status</p>
                  <p className="text-lg font-bold text-white mt-1 capitalize">{status?.status}</p>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-900">
                  <p className="text-slate-500 font-medium">Latency</p>
                  <p className="text-lg font-bold text-sky-400 mt-1">{status?.latency} ms</p>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-900">
                  <p className="text-slate-500 font-medium">Last Checked</p>
                  <p className="text-lg font-bold text-white mt-1">{status?.timestamp}</p>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-900">
                  <p className="text-slate-500 font-medium">API Endpoint</p>
                  <p className="text-lg font-bold text-indigo-400 mt-1 truncate" title={apiHost}>{apiHost}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">React + TS + Vite + Tailwind v3</span>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800/80 transition-all font-medium text-xs border border-slate-700/50 hover:border-slate-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
              <span>Refresh Connection</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          CertiGen Foundation Setup &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default App;
