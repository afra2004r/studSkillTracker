'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Upload, Download, Search, Filter, ChevronRight, Trash2, Edit, X, CheckCircle2, AlertCircle } from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Department options from backend
  const [departments, setDepartments] = useState<any[]>([]);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState('');
  const [newStudent, setNewStudent] = useState({
    roll_number: '',
    name: '',
    department: 'MSc SS',
    section: 'A',
    year: 4,
    cgpa: 7.5,
    email: '',
    phone: '',
    placement_status: 'UNPLACED',
    arrears_count: 0
  });

  const loadDepartments = async () => {
    try {
      const res = await api.getDepartments();
      if (Array.isArray(res)) {
        setDepartments(res);
      }
    } catch (e) {
      console.error('Failed to load departments', e);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDept) params.department = selectedDept;
      if (selectedStatus) params.placement_status = selectedStatus;

      const res = await api.getStudents(params);
      setStudents(Array.isArray(res) ? res : (res.results || []));
    } catch (e) {
      console.error('Failed to load students', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [search, selectedDept, selectedStatus]);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportMsg('');
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.importStudents(formData);
      setImportMsg(`Import Successful: ${res.created} created, ${res.updated} updated.`);
      loadStudents();
      setTimeout(() => {
        setShowImportModal(false);
        setImportMsg('');
        setImportFile(null);
      }, 1500);
    } catch (err: any) {
      setImportMsg('Failed to process file import.');
    } finally {
      setImporting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newStudent.name.trim()) {
      setAddError('Student name is required.');
      return;
    }

    const rollNo = newStudent.roll_number.trim() || `22${Math.floor(1000 + Math.random() * 9000)}`;
    const emailVal = newStudent.email.trim() || `${newStudent.name.toLowerCase().replace(/\s+/g, '.')}.${rollNo.slice(-4)}@college.edu`;

    const payload = {
      ...newStudent,
      roll_number: rollNo,
      email: emailVal,
      department: newStudent.department
    };

    try {
      const res = await api.createStudent(payload);
      if (res.id || res.roll_number) {
        setShowAddModal(false);
        setAddError('');
        setNewStudent({
          roll_number: '',
          name: '',
          department: 'MSc SS',
          section: 'A',
          year: 4,
          cgpa: 7.5,
          email: '',
          phone: '',
          placement_status: 'UNPLACED',
          arrears_count: 0
        });
        // Clear filters so newly added student shows up immediately
        setSelectedDept('');
        setSelectedStatus('');
        setSearch(newStudent.name.trim());
        await loadStudents();
      } else {
        const msg = typeof res === 'object' ? JSON.stringify(res) : String(res);
        setAddError(`Failed to save student: ${msg}`);
      }
    } catch (err: any) {
      setAddError('Server error creating student.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student record?')) {
      await api.deleteStudent(id);
      loadStudents();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-400" />
                Student Directory & Management
              </h1>
              <p className="text-xs text-slate-400 mt-1">Manage roll numbers, academic performance, placement status, and profile links</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                Bulk Import CSV
              </button>
              <a
                href="http://localhost:8000/api/students/export/?format=csv"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Export CSV
              </a>
              <button
                onClick={() => { setAddError(''); setShowAddModal(true); }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Student
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by Roll No, Student Name, or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departments.length > 0 ? (
                    departments.map((d: any) => (
                      <option key={d.id} value={d.code}>{d.code} ({d.name})</option>
                    ))
                  ) : (
                    <>
                      <option value="MSc SS">MSc SS</option>
                      <option value="MCA">MCA</option>
                      <option value="MSc CS">MSc CS</option>
                      <option value="MSc IT">MSc IT</option>
                      <option value="MCM">MCM</option>
                    </>
                  )}
                </select>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Placement Status</option>
                <option value="UNPLACED">Unplaced</option>
                <option value="PLACED">Placed</option>
                <option value="IN_PROCESS">In Process</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Dept / Sec</th>
                    <th className="p-3.5">CGPA</th>
                    <th className="p-3.5">Arrears</th>
                    <th className="p-3.5">Placement Status</th>
                    <th className="p-3.5">Links</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 animate-pulse">
                        Loading student records...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No student records match your query.
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-indigo-300">
                          <Link href={`/students/${s.id}`} className="hover:underline flex items-center gap-1">
                            {s.roll_number}
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          </Link>
                        </td>
                        <td className="p-3.5 font-semibold text-white">
                          <Link href={`/students/${s.id}`} className="hover:text-indigo-400 transition">
                            {s.name}
                          </Link>
                          <p className="text-[10px] text-slate-400">{s.email}</p>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <span className="font-semibold text-slate-200">{s.department_code || s.department}</span> - {s.section}
                        </td>
                        <td className="p-3.5 font-bold text-slate-100">
                          <span className={s.cgpa >= 8.0 ? 'text-emerald-400' : (s.cgpa >= 7.0 ? 'text-slate-200' : 'text-amber-400')}>
                            {s.cgpa}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.arrears_count === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {s.arrears_count}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.placement_status === 'PLACED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : (s.placement_status === 'IN_PROCESS'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400')
                          }`}>
                            {s.placement_status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2 text-[11px]">
                            {s.resume_link && (
                              <a href={s.resume_link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Resume</a>
                            )}
                            {s.github_link && (
                              <a href={s.github_link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">GitHub</a>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Add New Student Profile
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g. Afra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Roll Number</label>
                <input
                  type="text"
                  value={newStudent.roll_number}
                  onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <select
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {departments.length > 0 ? (
                    departments.map((d: any) => (
                      <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="MSc SS">MSc SS</option>
                      <option value="MCA">MCA</option>
                      <option value="MSc CS">MSc CS</option>
                      <option value="MSc IT">MSc IT</option>
                      <option value="MCM">MCM</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={newStudent.cgpa}
                  onChange={(e) => setNewStudent({ ...newStudent, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="+91 9840123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Save & Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Bulk Import Students (CSV / Excel)
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {importMsg && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold text-center">
                {importMsg}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center bg-slate-950/50">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-slate-200 font-semibold">
                    {importFile ? importFile.name : 'Click to select CSV or Excel file'}
                  </p>
                  <p className="text-[10px] text-slate-500">Supported headers: Roll Number, Name, Department, CGPA, Email</p>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {importing ? 'Processing File...' : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
