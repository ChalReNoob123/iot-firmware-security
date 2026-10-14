'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TheaterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vulnerabilities');
  }, [router]);

  return (
    <div className="min-h-screen bg-void-950 flex flex-col items-center justify-center font-mono text-xs text-zinc-400 gap-3">
      <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      <span>Redirecting to Industrial Vulnerability Workbench...</span>
    </div>
  );
}
