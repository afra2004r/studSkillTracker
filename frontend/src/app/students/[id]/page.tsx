'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Award,
  Trophy,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  ArrowLeft,
  ExternalLink,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      api.getStudentDetail(params.id as string)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading || !data) {
    return (
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <span>Loading Student Profile...</span>
          </div>
        </div>
      </div>
    );
  }

  const { student, analytics, overall_rank, dept_rank, assessment_history } = data;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Back button & header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                {student.name}
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {student.roll_number}
                </span>
              </h1>
              <p className="text-xs text-slate-400">{student.department_name} ({student.department_code}) • Section {student.section} • Year {student.year}</p>
            </div>
          </div>

          {/* Quick Ranks & Scores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400">Overall Institutional Rank</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-400">#{overall_rank}</span>
                <span className="text-[10px] text-slate-500">out of 218</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400">Department Rank</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-cyan-400">#{dept_rank}</span>
                <span className="text-[10px] text-slate-500">in {student.department_code}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400">Average Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">{analytics.avg_score}%</span>
                <span className="text-[10px] text-slate-500">CGPA: {student.cgpa}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400">Placement Readiness</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">{analytics.placement_readiness_pct}%</span>
                <span className="text-[10px] text-amber-300/80 font-bold">{analytics.prediction}</span>
              </div>
            </div>
          </div>

          {/* Performance Graph & Skills Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance History Line Chart */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <h3 className="font-bold text-white text-base mb-2">📈 Assessment Performance Graph</h3>
              <p className="text-xs text-slate-400 mb-4">Historical marks obtained in all conducted tests</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessment_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="assessment_name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#a5b4fc' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights & Weak/Strong Areas */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                AI Skill Analysis
              </h3>

              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">Strong Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {analytics.strong_areas.map((area: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1.5">Weak Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {analytics.weak_areas.map((area: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coding Score Avg:</span>
                  <span className="font-bold text-indigo-300">{analytics.coding_avg}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aptitude Score Avg:</span>
                  <span className="font-bold text-cyan-300">{analytics.aptitude_avg}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Level:</span>
                  <span className={`font-bold ${analytics.risk_level === 'Low Risk' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {analytics.risk_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Interview:</span>
                  <span className="font-bold text-amber-400">{analytics.expected_interview_perf}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Scores Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Assessment History Log</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Assessment Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Score / Max</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assessment_history.map((h: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{h.assessment_name}</td>
                    <td className="p-3 text-slate-300">{h.type}</td>
                    <td className="p-3 text-slate-400">{h.date}</td>
                    <td className="p-3 font-bold text-indigo-300">{h.score} / {h.max_marks}</td>
                    <td className="p-3">
                      <span className={`font-bold ${h.percentage >= 75 ? 'text-emerald-400' : (h.percentage >= 50 ? 'text-slate-200' : 'text-rose-400')}`}>
                        {h.percentage}%
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{h.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
