'use client';

import React from 'react';
import { useSentinelStore } from '@/lib/store';

export default function CyberToastNotifier() {
  const { toasts, removeToast } = useSentinelStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-mono">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'SUCCESS';
        const isAlert = toast.type === 'ALERT';

        const borderColor = isSuccess
          ? 'border-cyber-emerald/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          : isAlert
          ? 'border-cyber-rose/60 shadow-[0_0_15px_rgba(255,51,102,0.3)]'
          : 'border-cyber-cyan/60 shadow-[0_0_15px_rgba(0,245,212,0.3)]';

        const dotColor = isSuccess ? 'bg-cyber-emerald' : isAlert ? 'bg-cyber-rose' : 'bg-cyber-cyan';
        const textColor = isSuccess ? 'text-cyber-emerald' : isAlert ? 'text-cyber-rose' : 'text-cyber-cyan';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl bg-cyber-bg/95 backdrop-blur-md border ${borderColor} flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="flex items-start gap-2.5">
              <span className={`w-2 h-2 rounded-full ${dotColor} mt-1 animate-pulse shrink-0`} />
              <div>
                <div className={`text-[10px] font-bold ${textColor} tracking-wider`}>
                  {isSuccess ? 'SYSTEM CONFIRMATION' : isAlert ? 'SECURITY ALERT' : 'TELEMETRY DISPATCH'}
                </div>
                <div className="text-xs text-white mt-0.5 leading-snug">{toast.message}</div>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 text-xs transition-colors shrink-0"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
