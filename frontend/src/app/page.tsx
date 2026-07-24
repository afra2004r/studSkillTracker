'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
        <span>Loading SkillTrack Analytics...</span>
      </div>
    </div>
  );
}
