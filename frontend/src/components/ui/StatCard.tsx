'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet';
  trend?: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }: StatCardProps) {
  const colorStyles = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/30 icon-bg-indigo',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30 icon-bg-emerald',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30 icon-bg-amber',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30 icon-bg-rose',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30 icon-bg-cyan',
    violet: 'from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/30 icon-bg-violet',
  }[color];

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorStyles} border backdrop-blur-md relative overflow-hidden transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {trend && <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{trend}</span>}
      </div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
