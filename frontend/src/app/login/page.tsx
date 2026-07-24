'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Lock, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login({ username, password });
      if (data.access) {
        login(data);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Connection to backend server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'officer' | 'coordinator') => {
    setError('');
    setLoading(true);
    const u = userType === 'officer' ? 'admin' : 'coordinator';
    const p = userType === 'officer' ? 'admin123' : 'coord123';

    try {
      const data = await api.login({ username: u, password: p });
      if (data.access) {
        login(data);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Quick login failed');
      }
    } catch (err) {
      setError('Connection to backend server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30 mb-3">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SkillTrack</h1>
          <p className="text-xs text-slate-400 mt-1">Placement Analytics & Assessment Engine</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or coordinator"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick One-Click Demo Access
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('officer')}
              disabled={loading}
              className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 group-hover:text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
                Placement Officer
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Full Admin Rights</p>
            </button>

            <button
              onClick={() => handleQuickLogin('coordinator')}
              disabled={loading}
              className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 group-hover:text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
                Coordinator
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Assessment Admin</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
