'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Code, Brain, MessageSquare, Award, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

export default function RankingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'top10' | 'top25' | 'top50' | 'bottom'>('top10');

  useEffect(() => {
    api.getRankings().then(res => setData(res)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <span>Calculating Global Leaderboards...</span>
          </div>
        </div>
      </div>
    );
  }

  const { category_leaders, top_10, top_25, top_50, bottom_performers } = data;
  const currentList = {
    top10: top_10,
    top25: top_25,
    top50: top_50,
    bottom: bottom_performers,
  }[activeTab];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Automated Ranking Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1">Institutional leaderboard, department ranks, and category excellence leaders</p>
          </div>

          {/* Category Leaders Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Highest Coding */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Code className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Highest Coding Leader</span>
              </div>
              {category_leaders.highest_coding ? (
                <div>
                  <h3 className="text-lg font-bold text-white">{category_leaders.highest_coding.name}</h3>
                  <p className="text-xs text-slate-400">{category_leaders.highest_coding.roll_number} • {category_leaders.highest_coding.dept_code}</p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-indigo-300">{category_leaders.highest_coding.coding_avg}%</span>
                    <span className="text-[10px] text-slate-400">Avg Coding Score</span>
                  </div>
                </div>
              ) : <p className="text-xs text-slate-500">No data</p>}
            </div>

            {/* Highest Aptitude */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Brain className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Highest Aptitude Leader</span>
              </div>
              {category_leaders.highest_aptitude ? (
                <div>
                  <h3 className="text-lg font-bold text-white">{category_leaders.highest_aptitude.name}</h3>
                  <p className="text-xs text-slate-400">{category_leaders.highest_aptitude.roll_number} • {category_leaders.highest_aptitude.dept_code}</p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-cyan-300">{category_leaders.highest_aptitude.aptitude_avg}%</span>
                    <span className="text-[10px] text-slate-400">Avg Aptitude Score</span>
                  </div>
                </div>
              ) : <p className="text-xs text-slate-500">No data</p>}
            </div>

            {/* Highest Communication */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Highest Communication Leader</span>
              </div>
              {category_leaders.highest_communication ? (
                <div>
                  <h3 className="text-lg font-bold text-white">{category_leaders.highest_communication.name}</h3>
                  <p className="text-xs text-slate-400">{category_leaders.highest_communication.roll_number} • {category_leaders.highest_communication.dept_code}</p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-emerald-300">{category_leaders.highest_communication.comm_avg}%</span>
                    <span className="text-[10px] text-slate-400">Avg Comm Score</span>
                  </div>
                </div>
              ) : <p className="text-xs text-slate-500">No data</p>}
            </div>
          </div>

          {/* Leaderboard Tabs & Table */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex border-b border-slate-800 gap-2">
              {[
                { key: 'top10', label: 'Top 10 Performers' },
                { key: 'top25', label: 'Top 25 Performers' },
                { key: 'top50', label: 'Top 50 Performers' },
                { key: 'bottom', label: 'Bottom Performers' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
                    activeTab === t.key
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Dept Rank</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Avg Score</th>
                  <th className="p-3">Coding Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentList.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-amber-400">#{r.overall_rank}</td>
                    <td className="p-3 font-semibold text-white">
                      <Link href={`/students/${r.id}`} className="hover:text-indigo-400 flex items-center gap-1">
                        {r.name}
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </Link>
                      <p className="text-[10px] text-slate-400">{r.roll_number}</p>
                    </td>
                    <td className="p-3 text-slate-300">{r.dept_code}</td>
                    <td className="p-3 font-semibold text-cyan-300">#{r.dept_rank}</td>
                    <td className="p-3 text-slate-200 font-bold">{r.cgpa}</td>
                    <td className="p-3 font-bold text-emerald-400">{r.avg_score}%</td>
                    <td className="p-3 font-semibold text-indigo-300">{r.coding_avg}%</td>
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
