'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ClipboardList, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, FileCheck, X } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

export default function ScoreEntryPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('bulk');
  const [selectedAsmId, setSelectedAsmId] = useState<number | ''>('');
  
  // Manual state
  const [rollNumber, setRollNumber] = useState('');
  const [score, setScore] = useState('');
  const [remarks, setRemarks] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bulk state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getAssessments().then(res => {
      setAssessments(res);
      if (res.length > 0) setSelectedAsmId(res[0].id);
    });
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsmId || !rollNumber || !score) return;

    try {
      const res = await api.uploadScores({
        assessment_id: selectedAsmId,
        roll_number: rollNumber.trim(),
        score: parseFloat(score),
        remarks: remarks,
      });

      if (res.score || res.message) {
        setMsg({ type: 'success', text: `Score ${score} successfully entered for "${rollNumber}"!` });
        setRollNumber('');
        setScore('');
        setRemarks('');
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to record score entry.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: 'Failed to record score entry. Check student roll number or name.' });
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsmId || !file) {
      setMsg({ type: 'error', text: 'Please select an assessment and choose a CSV/Excel file to upload.' });
      return;
    }

    setUploading(true);
    setMsg(null);
    const formData = new FormData();
    formData.append('assessment_id', selectedAsmId.toString());
    formData.append('file', file);

    try {
      const res = await api.uploadScores(formData);
      if (res.uploaded_count !== undefined) {
        let warningText = '';
        if (res.missing_students && res.missing_students.length > 0) {
          warningText = ` (${res.missing_students.length} roll numbers skipped - not found in database)`;
        }
        setMsg({
          type: 'success',
          text: `Successfully uploaded ${res.uploaded_count} scores!${warningText}`
        });
        setFile(null);
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to process file' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: 'Failed to upload score file. Ensure backend server is reachable.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-indigo-400" />
              Score Entry & Batch Upload
            </h1>
            <p className="text-xs text-slate-400 mt-1">Upload assessment marks via interactive single entry or bulk CSV/Excel sheet dropzone</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'bulk'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV / Excel Bulk Upload
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'manual'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Manual Single Entry
            </button>
          </div>

          {msg && (
            <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
              msg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Assessment Picker */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Assessment Module</label>
              <select
                value={selectedAsmId}
                onChange={(e) => setSelectedAsmId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type_display}) - Date: {a.date} - Max: {a.max_marks} Marks
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'bulk' ? (
              <form onSubmit={handleBulkSubmit} className="space-y-4 pt-2">
                {/* Clickable Dropzone Card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    file
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/60 hover:bg-slate-900/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {file ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{file.name}</p>
                        <p className="text-xs text-emerald-400 font-medium">{(file.size / 1024).toFixed(1)} KB • Ready for processing</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1 mx-auto pt-1"
                      >
                        <X className="w-3.5 h-3.5" /> Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">Click or Drag & Drop score file here</p>
                        <p className="text-xs text-slate-400 mt-1">Supports CSV or Excel files (`.csv`, `.xlsx`, `.xls`)</p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mt-2">
                        Browse Files
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300 uppercase tracking-wider">Sheet Headers Format Guide:</p>
                  <p>• Required columns: <code className="text-indigo-300">Roll No</code> (or <code className="text-indigo-300">Roll Number</code>), <code className="text-indigo-300">Score</code> (or <code className="text-indigo-300">Marks</code>)</p>
                  <p>• Optional columns: <code className="text-indigo-300">Remarks</code>, <code className="text-indigo-300">Status</code> (e.g. Absent)</p>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                    file && !uploading
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/30 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Processing & Validating Marks Sheet...' : 'Upload & Process Batch Scores'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Roll Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 221001"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Score Obtained</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 87"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-300 font-semibold mb-1">Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Good Problem Solving"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
                >
                  Submit Score Record
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
