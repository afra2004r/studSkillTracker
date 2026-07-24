'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Sparkles, CheckCircle2, Plus, Edit2, Play, Trash2, AlertTriangle, X, Calendar } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

export default function CompanyEligibilityPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Edit company modal
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    target_roles: '',
    visiting_date: '',
    criteria: {
      min_cgpa: 7.5,
      max_arrears: 0,
      min_coding_score: 60.0,
      min_aptitude_score: 70.0,
      min_communication_score: 50.0,
      min_overall_avg: 65.0,
      allowed_departments: 'ALL',
    }
  });

  // Add Company modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    target_roles: '',
    visiting_date: '2026-12-01',
    description: '',
    criteria: {
      min_cgpa: 7.0,
      max_arrears: 0,
      min_coding_score: 60.0,
      min_aptitude_score: 65.0,
      min_overall_avg: 65.0,
      allowed_departments: 'ALL'
    }
  });

  // Delete confirmation modal
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.getCompanies();
      setCompanies(res);
      if (res.length > 0 && (!selectedCompany || !res.some((c: any) => c.id === selectedCompany.id))) {
        setSelectedCompany(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleGenerate = async (companyId: number) => {
    setEvaluating(true);
    try {
      const res = await api.generateCompanyEligibility(companyId);
      setResults(res);
    } catch (e) {
      alert('Failed to evaluate eligibility');
    } finally {
      setEvaluating(false);
    }
  };

  const handleOpenCriteria = (comp: any) => {
    setSelectedCompany(comp);
    setEditForm({
      name: comp.name || '',
      target_roles: comp.target_roles || '',
      visiting_date: comp.visiting_date ? String(comp.visiting_date).split('T')[0] : '2026-12-01',
      criteria: {
        min_cgpa: comp.criteria?.min_cgpa ?? 7.0,
        max_arrears: comp.criteria?.max_arrears ?? 0,
        min_coding_score: comp.criteria?.min_coding_score ?? 60.0,
        min_aptitude_score: comp.criteria?.min_aptitude_score ?? 65.0,
        min_communication_score: comp.criteria?.min_communication_score ?? 50.0,
        min_overall_avg: comp.criteria?.min_overall_avg ?? 65.0,
        allowed_departments: comp.criteria?.allowed_departments || 'ALL',
      }
    });
    setShowCriteriaModal(true);
  };

  const handleSaveCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      await api.updateCompany(selectedCompany.id, {
        name: editForm.name,
        target_roles: editForm.target_roles,
        visiting_date: editForm.visiting_date,
        criteria: editForm.criteria
      });
      setShowCriteriaModal(false);
      loadCompanies();
    } catch (e) {
      alert('Failed to save company details');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    try {
      const created = await api.createCompany(addForm);
      setShowAddModal(false);
      setAddForm({
        name: '',
        target_roles: '',
        visiting_date: '2026-12-01',
        description: '',
        criteria: {
          min_cgpa: 7.0,
          max_arrears: 0,
          min_coding_score: 60.0,
          min_aptitude_score: 65.0,
          min_overall_avg: 65.0,
          allowed_departments: 'ALL'
        }
      });
      await loadCompanies();
      setSelectedCompany(created);
    } catch (e) {
      alert('Failed to add company');
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setDeleting(true);

    try {
      await api.deleteCompany(companyToDelete.id);
      setCompanyToDelete(null);
      if (selectedCompany?.id === companyToDelete.id) {
        setSelectedCompany(null);
        setResults(null);
      }
      await loadCompanies();
    } catch (e) {
      alert('Failed to delete company');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-6 h-6 text-cyan-400" />
                Company Eligibility
              </h1>
              <p className="text-xs text-slate-400 mt-1">Configure company criteria & generate instant placement shortlists</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>

          {/* Companies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {companies.map((comp) => (
              <div
                key={comp.id}
                onClick={() => setSelectedCompany(comp)}
                className={`p-4 rounded-xl border cursor-pointer transition relative group ${
                  selectedCompany?.id === comp.id
                    ? 'bg-indigo-600/20 border-indigo-500/80 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white truncate">{comp.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenCriteria(comp); }}
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 transition"
                      title="Edit Company Details & Criteria"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCompanyToDelete(comp); }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition opacity-80 group-hover:opacity-100"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{comp.target_roles}</p>
                {comp.visiting_date && (
                  <p className="text-[10px] text-indigo-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {comp.visiting_date}
                  </p>
                )}

                {comp.criteria && (
                  <div className="mt-3 text-[10px] space-y-1 text-slate-300 border-t border-slate-800/80 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">CGPA ≥</span>
                      <span className="font-bold text-indigo-300">{comp.criteria.min_cgpa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coding &gt;</span>
                      <span className="font-bold text-cyan-300">{comp.criteria.min_coding_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Aptitude &gt;</span>
                      <span className="font-bold text-emerald-300">{comp.criteria.min_aptitude_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Arrears</span>
                      <span className="font-bold text-rose-300">{comp.criteria.max_arrears}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Bar for Selected Company */}
          {selectedCompany && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Evaluating: {selectedCompany.name}
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedCompany.target_roles}
                  </span>
                  {selectedCompany.visiting_date && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Date: {selectedCompany.visiting_date}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Criteria: CGPA ≥ {selectedCompany.criteria?.min_cgpa}, Coding &gt; {selectedCompany.criteria?.min_coding_score}%, Aptitude &gt; {selectedCompany.criteria?.min_aptitude_score}%, Arrears ≤ {selectedCompany.criteria?.max_arrears}
                </p>
              </div>

              <button
                onClick={() => handleGenerate(selectedCompany.id)}
                disabled={evaluating}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4 fill-white" />
                {evaluating ? 'Evaluating 218 Students...' : 'Generate Eligible Students List'}
              </button>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    {results.eligible_count} Eligible Students
                  </span>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
                    {results.ineligible_count} Ineligible
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Dept</th>
                      <th className="p-3">CGPA</th>
                      <th className="p-3">Eligibility Status</th>
                      <th className="p-3">Evaluation Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {results.eligible_students.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-indigo-300">{r.student_roll}</td>
                        <td className="p-3 font-semibold text-white">
                          <Link href={`/students/${r.student}`} className="hover:text-indigo-400">
                            {r.student_name}
                          </Link>
                        </td>
                        <td className="p-3 text-slate-300">{r.department_code}</td>
                        <td className="p-3 font-bold text-emerald-400">{r.cgpa}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Eligible
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">Meets all cutoff criteria</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Add New Company Recruitment Drive
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Caterpillar / Google / Wipro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Roles *</label>
                <input
                  type="text"
                  value={addForm.target_roles}
                  onChange={(e) => setAddForm({ ...addForm, target_roles: e.target.value })}
                  placeholder="e.g. Software Engineer / Systems Associate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Visiting Date *</span>
                  </label>
                  <input
                    type="date"
                    value={addForm.visiting_date}
                    onChange={(e) => setAddForm({ ...addForm, visiting_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 [color-scheme:dark] cursor-pointer font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    value={addForm.criteria.min_cgpa}
                    onChange={(e) => setAddForm({
                      ...addForm,
                      criteria: { ...addForm.criteria, min_cgpa: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Coding %</label>
                  <input
                    type="number"
                    value={addForm.criteria.min_coding_score}
                    onChange={(e) => setAddForm({
                      ...addForm,
                      criteria: { ...addForm.criteria, min_coding_score: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Aptitude %</label>
                  <input
                    type="number"
                    value={addForm.criteria.min_aptitude_score}
                    onChange={(e) => setAddForm({
                      ...addForm,
                      criteria: { ...addForm.criteria, min_aptitude_score: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Arrears</label>
                  <input
                    type="number"
                    value={addForm.criteria.max_arrears}
                    onChange={(e) => setAddForm({
                      ...addForm,
                      criteria: { ...addForm.criteria, max_arrears: parseInt(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Allowed Departments (e.g. MSc SS,MCA or ALL)</label>
                <input
                  type="text"
                  value={addForm.criteria.allowed_departments}
                  onChange={(e) => setAddForm({
                    ...addForm,
                    criteria: { ...addForm.criteria, allowed_departments: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Save & Create Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company & Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                Edit Company Drive: {selectedCompany?.name}
              </h3>
              <button onClick={() => setShowCriteriaModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCriteria} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Roles</label>
                <input
                  type="text"
                  value={editForm.target_roles}
                  onChange={(e) => setEditForm({ ...editForm, target_roles: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Visiting Date</label>
                  <input
                    type="date"
                    value={editForm.visiting_date}
                    onChange={(e) => setEditForm({ ...editForm, visiting_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 [color-scheme:dark] cursor-pointer font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.criteria.min_cgpa}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      criteria: { ...editForm.criteria, min_cgpa: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Coding %</label>
                  <input
                    type="number"
                    value={editForm.criteria.min_coding_score}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      criteria: { ...editForm.criteria, min_coding_score: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Aptitude %</label>
                  <input
                    type="number"
                    value={editForm.criteria.min_aptitude_score}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      criteria: { ...editForm.criteria, min_aptitude_score: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Arrears</label>
                  <input
                    type="number"
                    value={editForm.criteria.max_arrears}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      criteria: { ...editForm.criteria, max_arrears: parseInt(e.target.value) }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Allowed Departments (e.g. MSc SS,MCA or ALL)</label>
                <input
                  type="text"
                  value={editForm.criteria.allowed_departments}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    criteria: { ...editForm.criteria, allowed_departments: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCriteriaModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete &quot;{companyToDelete.name}&quot;?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete this company recruitment drive? This will permanently remove its criteria and eligibility records.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCompany}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
