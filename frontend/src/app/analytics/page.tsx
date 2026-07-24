'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Building2,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Legend
} from 'recharts';

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/ui/StatCard';
import { api } from '@/lib/api';

const DEPT_COLORS: Record<string, string> = {
  'MSc SS': '#6366f1', // Indigo
  'MCA': '#06b6d4',    // Cyan
  'MSc CS': '#10b981',  // Emerald
  'MSc IT': '#f59e0b',  // Amber
  'MCM': '#ec4899',     // Pink
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsDetails()
      .then(res => setData(res))
      .catch(err => console.error('Failed to load analytics', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
              <span>Generating SkillTrack Placement & Performance Analytics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    overall_avg,
    total_evaluations,
    top_department,
    dept_comparison = [],
    score_trend = [],
    performance_improvement = { improved_percentage: 0, top_improvers: [] }
  } = data;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
                Placement Analytics & Department Benchmarks
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Comparative department mark analysis, historical score trends over time, and student performance improvement index
              </p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300">Live Evaluation Metrics</span>
            </div>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Overall Batch Mean"
              value={`${overall_avg}%`}
              subtitle="Average Across All Assessments"
              icon={GraduationCap}
              color="indigo"
            />
            <StatCard
              title="Top Performing Dept"
              value={top_department ? top_department.code : 'MSc SS'}
              subtitle={top_department ? `${top_department.average}% Avg Score` : ''}
              icon={Award}
              color="emerald"
            />
            <StatCard
              title="Performance Growth"
              value={`${performance_improvement.improved_percentage}%`}
              subtitle="Students Showing Upward Trajectory"
              icon={TrendingUp}
              color="cyan"
            />
            <StatCard
              title="Evaluations Recorded"
              value={total_evaluations?.toLocaleString() || '2,616'}
              subtitle="Individual Test Submissions"
              icon={Users}
              color="amber"
            />
          </div>

          {/* Main Analytics Grid: Department Comparison & Score Trend Over Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Department Wise Mark Comparison */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    Department-Wise Mark Comparison
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded">
                    5 Departments
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Average score comparison across MSc SS, MCA, MSc CS, MSc IT, and MCM
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dept_comparison} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 12, fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '10px',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                      formatter={(value: any) => [`${value}%`, 'Average Score']}
                    />
                    <Bar dataKey="average" name="Avg Score (%)" radius={[8, 8, 0, 0]}>
                      {dept_comparison.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={DEPT_COLORS[entry.code] || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-around gap-2 text-xs">
                {dept_comparison.map((d: any) => (
                  <div key={d.code} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEPT_COLORS[d.code] || '#6366f1' }} />
                    <span className="font-semibold text-slate-300">{d.code}:</span>
                    <span className="text-white font-bold">{d.average}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Score Trend Over Time */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-cyan-400" />
                    Score Trend Over Time
                  </h3>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 font-semibold px-2 py-0.5 rounded border border-cyan-500/30">
                    All Assessments
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Historical mean score progression across test modules conducted
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={score_trend} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                      interval={1}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis domain={[40, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => [`${value}%`, 'Batch Avg Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      name="Average Score"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#0f172a' }}
                      activeDot={{ r: 7, fill: '#38bdf8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Initial Test Avg: <strong className="text-slate-200">{score_trend[0]?.average || 70}%</strong></span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Progression Trajectory
                </span>
                <span>Recent Test Avg: <strong className="text-slate-200">{score_trend[score_trend.length - 1]?.average || 75}%</strong></span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Department Performance Matrix & Top Improved Students */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Breakdown Matrix (2 Columns) */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">🏫 Department Performance Breakdown</h3>
                  <p className="text-xs text-slate-400">Detailed metric comparison across academic streams</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Students</th>
                      <th className="p-3 text-center">Avg Mark</th>
                      <th className="p-3 text-center">Highest</th>
                      <th className="p-3 text-center">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {dept_comparison.map((dept: any) => (
                      <tr key={dept.code} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-semibold text-white flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: DEPT_COLORS[dept.code] || '#6366f1' }}
                          />
                          <div>
                            <span className="font-bold">{dept.code}</span>
                            <p className="text-[10px] text-slate-400 font-normal">{dept.name}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-300">{dept.student_count}</td>
                        <td className="p-3 text-center font-bold text-indigo-300">{dept.average}%</td>
                        <td className="p-3 text-center font-bold text-emerald-400">{dept.highest}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {dept.pass_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Improved Students Leaderboard (1 Column) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Top Performance Improvers
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
                    Highest Gain
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Students showing maximum score growth from initial to recent tests
                </p>
              </div>

              <div className="space-y-2.5 my-2">
                {performance_improvement.top_improvers?.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{st.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {st.roll_number}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {st.department} • Initial: {st.initial_avg}% &rarr; Recent: {st.recent_avg}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        +{st.growth_pct}%
                      </span>
                      <span className="text-[9px] text-slate-500">Growth Index</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-center">
                <p className="text-[10px] text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline mr-1" />
                  {performance_improvement.improved_percentage}% of total batch demonstrates positive score growth
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
