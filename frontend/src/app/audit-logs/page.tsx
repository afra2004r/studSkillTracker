'use client';

import React, { useEffect, useState } from 'react';
import { History, ShieldCheck } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLogs().then(res => setLogs(res)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-400" />
              Notification & Admin Audit Logs
            </h1>
            <p className="text-xs text-slate-400 mt-1">Immutable institutional activity timeline for audit and compliance</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{log.action}</span>
                        <span className="text-[10px] font-semibold text-slate-400">by {log.admin_name}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
