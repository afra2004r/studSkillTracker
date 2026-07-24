'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, Plus, Calendar, Clock, Award, Trash2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'APTITUDE',
    date: new Date().toISOString().split('T')[0],
    max_marks: 100,
    duration_minutes: 90,
    weightage_percent: 15,
  });

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await api.getAssessments();
      setAssessments(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAssessment(form);
      setShowCreateModal(false);
      loadAssessments();
    } catch (e) {
      alert('Failed to create assessment');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this assessment and all associated score entries?')) {
      await api.deleteAssessment(id);
      loadAssessments();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
                Assessment Management
              </h1>
              <p className="text-xs text-slate-400 mt-1">Schedule and manage Aptitude, Coding, Technical MCQ, SQL, and Interview rounds</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((asm) => (
              <div key={asm.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3 relative hover:border-slate-700 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {asm.type_display}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{asm.name}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(asm.id)}
                    className="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-b border-slate-800/80 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{asm.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{asm.duration_minutes} Mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Max {asm.max_marks} Marks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-300">Weight: {asm.weightage_percent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">{asm.submitted_scores_count} Submissions</span>
                  <span className="font-bold text-emerald-400">Avg: {asm.average_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Assessment</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assessment Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aptitude Test 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assessment Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                >
                  <option value="APTITUDE">Aptitude</option>
                  <option value="CODING">Coding</option>
                  <option value="TECHNICAL_MCQ">Technical MCQ</option>
                  <option value="SQL">SQL</option>
                  <option value="COMMUNICATION">Communication</option>
                  <option value="MOCK_INTERVIEW">Mock Interview</option>
                  <option value="GROUP_DISCUSSION">Group Discussion</option>
                  <option value="RESUME_REVIEW">Resume Review</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={form.max_marks}
                    onChange={(e) => setForm({ ...form, max_marks: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={form.weightage_percent}
                    onChange={(e) => setForm({ ...form, weightage_percent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
