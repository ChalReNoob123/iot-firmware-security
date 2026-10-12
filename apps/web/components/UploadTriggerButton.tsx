'use client';

import React from 'react';
import { useSentinelStore } from '@/lib/store';

export default function UploadTriggerButton() {
  const { openUploadModal } = useSentinelStore();

  return (
    <button
      onClick={openUploadModal}
      className="px-3 py-1.5 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-cyan/50 text-xs font-mono text-cyber-cyan hover:text-white transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,245,212,0.15)]"
      title="Upload Vendor Firmware Binary (POST /api/v1/firmware/upload)"
    >
      <svg className="w-3.5 h-3.5 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <span>Ingest FW</span>
    </button>
  );
}
