'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

const REPORT_TYPES = [
  { key: 'TOP_20', title: 'Top 20 Performers Report', desc: 'Institutional highest ranking student cohort' },
  { key: 'STUDENTS_ABOVE_80', title: 'Students Scoring >80%', desc: 'High achievers batch for premium drives' },
  { key: 'STUDENTS_BELOW_40', title: 'Students Below <40%', desc: 'At risk students requiring remedial training' },
  { key: 'INTERVIEW_ELIGIBLE', title: 'Interview Eligible Students', desc: 'Students meeting standard corporate interview cutoffs' },
  { key: 'DEPARTMENT_WISE', title: 'Department-wise Report', desc: 'Academic department performance breakdown' },
  { key: 'COMPANY_ELIGIBILITY', title: 'Company Eligibility Report', desc: 'Summary of company drive shortlists' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('TOP_20');
  const [format, setFormat] = useState('PDF');
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReports();
      setReports(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMsg('');

    const item = REPORT_TYPES.find(r => r.key === selectedType);
    try {
      const res = await api.generateReport({
        title: item ? item.title : 'Placement Report',
        report_type: selectedType,
        file_format: format,
      });
      setMsg(`Report generated successfully!`);
      loadReports();
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-400" />
              Reports Generator & Downloads
            </h1>
            <p className="text-xs text-slate-400 mt-1">Export executive PDF, Excel, and CSV report packages for placement management and company visits</p>
          </div>

          {msg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {msg}
            </div>
          )}

          {/* Generator Form */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Generate Custom Report</h3>
            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Select Report Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-semibold"
                >
                  {REPORT_TYPES.map(r => (
                    <option key={r.key} value={r.key}>{r.title} — {r.desc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Export Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-semibold"
                >
                  <option value="PDF">Formatted PDF Document</option>
                  <option value="EXCEL">Excel Spreadsheet (.xlsx)</option>
                  <option value="CSV">Comma Separated Values (.csv)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  {generating ? 'Generating File...' : 'Generate & Save Report'}
                </button>
              </div>
            </form>
          </div>

          {/* Generated Reports List */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Generated Reports Archive</h3>
            <div className="space-y-2">
              {reports.map((rep) => (
                <div key={rep.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-xs font-bold text-white">{rep.title}</p>
                      <p className="text-[10px] text-slate-400">{rep.report_type} • Generated at {new Date(rep.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {rep.file_path && (
                    <a
                      href={`http://localhost:8000${rep.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold text-white flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download {rep.file_format}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
