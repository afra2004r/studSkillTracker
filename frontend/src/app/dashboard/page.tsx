'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Building2,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/ui/StatCard';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Loading Dashboard Metrics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, dept_comparison, assessment_trend, top_performers, bottom_performers, recent_reports, upcoming_companies } = data;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Placement Analytics Dashboard
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">Real-time assessment scores, department rankings, and placement readiness overview</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboard}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <Link
                href="/company-eligibility"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Company Eligibility
              </Link>
            </div>
          </div>

          {/* 7 KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard
              title="Students"
              value={kpis.total_students}
              subtitle="Enrolled Batch"
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="Assessments"
              value={kpis.assessments_conducted}
              subtitle="Conducted"
              icon={GraduationCap}
              color="cyan"
            />
            <StatCard
              title="Average Score"
              value={`${kpis.average_score}%`}
              subtitle="Batch Mean"
              icon={Award}
              color="violet"
            />
            <StatCard
              title="Eligible"
              value={kpis.eligible_students}
              subtitle="Ready for Drives"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Highest Score"
              value={kpis.highest_score}
              subtitle="Top Performer"
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Lowest Score"
              value={kpis.lowest_score}
              subtitle="Needs Practice"
              icon={TrendingDown}
              color="amber"
            />
            <StatCard
              title="At Risk"
              value={kpis.at_risk_students}
              subtitle="Needs Remedial"
              icon={AlertTriangle}
              color="rose"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Trend Line Chart */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    📈 Assessment Trend
                  </h3>
                  <p className="text-xs text-slate-400">Average score progression over time across all modules</p>
                </div>
                <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">12 Tests</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessment_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="average" name="Avg Score (%)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#818cf8' }} />
                    <Line type="monotone" dataKey="max" name="Highest (%)" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Comparison Bar Chart */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    📊 Department Comparison
                  </h3>
                  <p className="text-xs text-slate-400">Average score breakdown across academic departments</p>
                </div>
                <Link href="/analytics" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dept_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="department" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="average" name="Dept Average (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tables Row: Top Performers & At-Risk Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  🏆 Top Performers
                </h3>
                <Link href="/ranking" className="text-xs text-indigo-400 hover:underline">View Leaderboard</Link>
              </div>
              <div className="space-y-2">
                {top_performers.map((st: any, idx: number) => (
                  <div key={st.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        #{st.overall_rank}
                      </span>
                      <div>
                        <Link href={`/students/${st.id}`} className="text-xs font-semibold text-white hover:text-indigo-400 transition">
                          {st.name}
                        </Link>
                        <p className="text-[10px] text-slate-400">{st.roll_number} • {st.dept_code} • CGPA {st.cgpa}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">{st.avg_score}% Avg</span>
                      <p className="text-[10px] text-slate-400">Coding: {st.coding_avg}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* At-Risk Students Needing Improvement */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  ⚠️ Students Needing Improvement
                </h3>
                <Link href="/ai-insights" className="text-xs text-rose-400 hover:underline">View Risk Matrix</Link>
              </div>
              <div className="space-y-2">
                {bottom_performers.map((st: any) => (
                  <div key={st.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-rose-500/20 flex items-center justify-between hover:border-rose-500/40 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <Link href={`/students/${st.id}`} className="text-xs font-semibold text-white hover:text-rose-300 transition">
                          {st.name}
                        </Link>
                        <p className="text-[10px] text-slate-400">{st.roll_number} • {st.dept_code} • CGPA {st.cgpa}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400">{st.avg_score}% Avg</span>
                      <p className="text-[10px] text-rose-300/80">{st.arrears_count} Arrears</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Cards: Recent Reports & Upcoming Company Eligibility */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reports */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  📄 Recent Reports
                </h3>
                <Link href="/reports" className="text-xs text-indigo-400 hover:underline">Generate Report</Link>
              </div>
              <div className="space-y-2">
                {recent_reports.map((rep: any) => (
                  <div key={rep.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold text-white">{rep.title}</p>
                        <p className="text-[10px] text-slate-400">{rep.report_type} • {rep.file_format}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {rep.file_format}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Company Eligibility */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  🏢 Upcoming Company Eligibility
                </h3>
                <Link href="/company-eligibility" className="text-xs text-indigo-400 hover:underline">Manage Drives</Link>
              </div>
              <div className="space-y-2">
                {upcoming_companies.map((comp: any) => (
                  <div key={comp.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-xs font-semibold text-white">{comp.name}</p>
                        <p className="text-[10px] text-slate-400">{comp.target_roles}</p>
                      </div>
                    </div>
                    <Link
                      href="/company-eligibility"
                      className="px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-[11px] font-semibold text-white flex items-center gap-1 transition"
                    >
                      Filter <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
