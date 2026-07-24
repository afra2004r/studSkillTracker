'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  Trophy,
  BarChart3,
  Building2,
  BrainCircuit,
  FileText,
  History,
  LogOut,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Assessments', href: '/assessments', icon: GraduationCap },
  { name: 'Score Entry', href: '/scores', icon: ClipboardList },
  { name: 'Rankings Engine', href: '/ranking', icon: Trophy },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Company Eligibility', href: '/company-eligibility', icon: Building2 },
  { name: 'AI Insights & Prediction', href: '/ai-insights', icon: BrainCircuit },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Audit Logs', href: '/audit-logs', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-none">SkillTrack</h1>
            <span className="text-xs text-indigo-400 font-medium tracking-wide">Placement Analytics</span>
          </div>
        </div>

        {/* Role Badge */}
        {user && (
          <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-white">
                  {user.first_name === 'Dr. Rajesh' ? 'Admin' : (user.first_name || user.username || 'Admin')}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Admin
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-3 space-y-1 mt-2 max-h-[calc(100vh-210px)] overflow-y-auto custom-scrollbar">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
