'use client';

import React, { useState } from 'react';
import { Key, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cms/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error?.message || 'Login failed. Invalid credentials.');
      }

      // Full navigation so the session cookie is sent to /dashboard.
      window.location.assign('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 space-y-6 animate-in fade-in zoom-in-95 duration-350 select-none">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-transparent flex items-center justify-center overflow-hidden">
            <img src="/logo-icon.png" alt="Vionsys Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Vionsys CMS Login</h2>
          <p className="text-xs text-slate-400 max-w-xs">
            Log in with your publisher credentials to write, edit, and publish content.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="editor@vionsys.com"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Security Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-hidden hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border border-indigo-200 border-t-white animate-spin" />
                  Authenticating session...
                </>
              ) : (
                'Sign In to Workspace'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
