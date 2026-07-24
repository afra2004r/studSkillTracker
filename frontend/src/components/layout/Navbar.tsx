'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, X, Loader2, CheckCheck, User, Building2, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
  students: Array<{ id: number; roll_number: string; name: string; department_code?: string; department_name?: string; cgpa: number; placement_status: string }>;
  companies: Array<{ id: number; name: string; target_roles: string }>;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'warning' | 'info' | 'success';
  read: boolean;
}

export default function Navbar() {
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ students: [], companies: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Notification state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'At Risk Alert',
      description: '62 students flagged needing remedial intervention in technical skills.',
      time: '10m ago',
      type: 'warning',
      read: false,
    },
    {
      id: '2',
      title: 'TCS Placement Drive',
      description: 'TCS (Ninja / Digital) criteria updated. Drive date: Dec 1, 2026.',
      time: '1h ago',
      type: 'info',
      read: false,
    },
    {
      id: '3',
      title: 'Assessment Scores Uploaded',
      description: 'Aptitude Test 2 results processed for 218 students.',
      time: '3h ago',
      type: 'success',
      read: false,
    },
    {
      id: '4',
      title: 'Top Performer Flagged',
      description: 'Student 221001 achieved top score of 98 in Coding Round 1.',
      time: '5h ago',
      type: 'info',
      read: true,
    },
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Unread count calculation
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ students: [], companies: [] });
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [studentsData, companiesData] = await Promise.all([
          api.getStudents({ search: searchQuery.trim() }).catch(() => ({ results: [] })),
          api.getCompanies().catch(() => []),
        ]);

        const rawStudents = Array.isArray(studentsData) ? studentsData : (studentsData.results || []);
        const rawCompanies = Array.isArray(companiesData) ? companiesData : [];

        const filteredCompanies = rawCompanies.filter((c: any) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.target_roles.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults({
          students: rawStudents.slice(0, 5),
          companies: filteredCompanies.slice(0, 3),
        });
        setIsSearchOpen(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Input Container */}
      <div className="relative w-80" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
            placeholder="Search roll no, student, company..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
          />
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </form>

        {/* Live Search Dropdown Popup */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-2 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {/* Students Section */}
              {searchResults.students.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-400" />
                    Students ({searchResults.students.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => {
                          router.push(`/students?search=${student.roll_number}`);
                          setIsSearchOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition">
                            {student.name} ({student.roll_number})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {student.department_code || student.department_name || 'Dept'} • CGPA: {student.cgpa}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {student.placement_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies Section */}
              {searchResults.companies.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-t border-slate-800/60 pt-2">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    Companies ({searchResults.companies.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.companies.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => {
                          router.push('/company-eligibility');
                          setIsSearchOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition">
                            {company.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{company.target_roles}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {searchResults.students.length === 0 && searchResults.companies.length === 0 && !isSearching && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching student or company found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Footer View All */}
            <div className="p-2 border-t border-slate-800 bg-slate-950/40 text-center">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition"
              >
                Press Enter to view all results in Students Directory &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell with Popup */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-800 relative transition hover:text-white"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white font-bold text-[9px] flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-slate-900 shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-wide">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleNotificationRead(item.id)}
                    className={`p-3 cursor-pointer transition flex items-start gap-3 hover:bg-slate-800/50 ${
                      !item.read ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {item.type === 'info' && <Sparkles className="w-4 h-4 text-cyan-400" />}
                      {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${!item.read ? 'font-semibold text-white' : 'text-slate-300'}`}>
                          {item.title}
                        </p>
                        <span className="text-[9px] text-slate-500 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-800 bg-slate-950/40 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  SkillTrack Alert System &bull; Live Updates
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
