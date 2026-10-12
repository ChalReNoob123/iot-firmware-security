'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PatchStudioPage() {
  const [activeTab, setActiveTab] = useState<'SOURCE_DIFF' | 'ASSEMBLY_STUB' | 'MICROVM_VERIFICATION'>('SOURCE_DIFF');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'VERIFIED' | 'FAILED' | null;
    originalCrashMitigated: boolean;
    regressionTestsPassed: number;
    regressionTestsTotal: number;
    guestKernelAttestation: string;
    executionTimeMs: number;
  }>({
    status: null,
    originalCrashMitigated: false,
    regressionTestsPassed: 0,
    regressionTestsTotal: 0,
    guestKernelAttestation: '',
    executionTimeMs: 0
  });

  const cDiff = `--- a/src/mini_httpd.c
+++ b/src/mini_httpd.c
@@ -248,8 +248,15 @@ int handle_request(struct connection *conn, char *raw_buf, size_t raw_len) {
     char req_path[256];
     size_t path_len = 0;
 
-    /* VULNERABLE: Unbounded memory copy without buffer ceiling verification */
-    path_len = parse_header_length(raw_buf);
-    memcpy(req_path, raw_buf + offset, path_len);
+    /* SENTINELFORGE AUTO-SYNTHESIZED HOTFIX: */
+    /* Bounds check enforced against destination stack array capacity */
+    path_len = parse_header_length(raw_buf);
+    if (path_len >= sizeof(req_path)) {
+        syslog(LOG_WARNING, "[sf-patch-guard] Ingress header length %zu exceeds buffer %zu; dropping",
+               path_len, sizeof(req_path));
+        return -1;
+    }
+    memcpy(req_path, raw_buf + offset, path_len);
+    req_path[sizeof(req_path) - 1] = '\\0';
 
     return dispatch_route(req_path);
 }`;

  const assemblyDiff = `// In-Situ Binary Hotpatch Insertion at Address 0x00014a7c:
// Original Trampoline Replacement:
0x00014a7c:  bl   0x00014f00   ; Hook jump to synthesized patch trampoline

// Synthesized In-Situ Patch Trampoline (Allocated at .sf_hotfix section):
0x00014f00:  cmp  r2, #255      ; Compare user packet length ($r2) against 255
0x00014f04:  ble  .proceed      ; If $r2 <= 255, execute safe copy
0x00014f08:  mov  r0, #-1       ; Return failure error code
0x00014f0c:  pop  {r4, r5, pc}  ; Graceful function return without stack corruption
.proceed:
0x00014f10:  mov  r0, r3        ; Restore original register
0x00014f14:  bl   0x10b40       ; Call memcpy@plt
0x00014f18:  b    0x00014a84    ; Resume original control flow`;

  const handleRunVerification = () => {
    setIsVerifying(true);
    setVerificationResult({ status: null, originalCrashMitigated: false, regressionTestsPassed: 0, regressionTestsTotal: 0, guestKernelAttestation: '', executionTimeMs: 0 });

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        status: 'VERIFIED',
        originalCrashMitigated: true,
        regressionTestsPassed: 38,
        regressionTestsTotal: 38,
        guestKernelAttestation: 'sha256:4d8e20f91a673c2b... (Measured Firecracker vTPM Boundary)',
        executionTimeMs: 142
      });
    }, 2200);
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([cDiff], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CVE-2026-8812-sentinelforge-hotfix.patch';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald animate-pulse" />
            <h1 className="text-xl font-bold text-white">AUTONOMOUS VULNERABILITY PATCH SYNTHESIS</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            Neural AST & Assembly Analysis &bull; Unified C/C++ Diffs &bull; In-Situ Binary Hotpatching &bull; MicroVM Verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPatch}
            className="px-3.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-muted hover:text-white transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Download .patch
          </button>
          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="px-4 py-1.5 rounded-lg bg-cyber-emerald text-cyber-bg font-bold text-xs hover:bg-cyber-emerald/90 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyber-bg animate-ping" />
                Re-Fuzzing MicroVM...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify Hotfix in MicroVM
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Weakness Overview Callout */}
      <div className="glass-panel p-4 rounded-xl border border-cyber-rose/40 bg-cyber-rose/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <div className="text-cyber-rose font-bold flex items-center gap-2">
            <span>TARGET FLAW: CVE-2026-8812 &bull; CWE-121 STACK BUFFER OVERFLOW</span>
            <span className="px-2 py-0.5 rounded bg-cyber-rose/20 text-cyber-rose font-bold text-[10px] border border-cyber-rose/40">
              ZERO-DAY
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
            Faulting binary: <span className="text-white font-bold">mini_httpd</span> (PID 218) &bull; Faulting PC: <span className="text-cyber-cyan font-bold">0x00014a88</span> &bull; Root Cause: Unchecked memcpy packet length parameter.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-cyber-muted">Estimated Exploitability</div>
          <div className="text-lg font-bold text-cyber-rose">100% Reliable RCE</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('SOURCE_DIFF')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'SOURCE_DIFF'
              ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_15px_rgba(0,245,212,0.3)]'
              : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
          }`}
        >
          Upstream C/C++ Unified Diff
        </button>
        <button
          onClick={() => setActiveTab('ASSEMBLY_STUB')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'ASSEMBLY_STUB'
              ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
          }`}
        >
          In-Situ Binary Hotpatch Assembly
        </button>
        <button
          onClick={() => setActiveTab('MICROVM_VERIFICATION')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'MICROVM_VERIFICATION'
              ? 'bg-cyber-emerald text-cyber-bg shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-cyber-surface text-cyber-muted hover:text-white border border-cyber-border'
          }`}
        >
          MicroVM Attestation & Regression Re-Run
        </button>
      </div>

      {/* Content Viewers */}
      {activeTab === 'SOURCE_DIFF' && (
        <div className="glass-panel p-4 rounded-xl border border-cyber-border space-y-2">
          <div className="flex items-center justify-between text-xs text-cyber-muted border-b border-cyber-border/40 pb-2">
            <span>UNIFIED PATCH CONTEXT (PRD SECTION 7.3)</span>
            <span className="text-[11px] text-cyber-emerald font-bold">+10 lines inserted / -3 lines removed</span>
          </div>

          <pre className="p-4 rounded-xl bg-cyber-bg/95 font-mono text-xs overflow-x-auto leading-relaxed border border-cyber-border/40 text-slate-200">
            {cDiff.split('\n').map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isDel = line.startsWith('-') && !line.startsWith('---');
              const isHdr = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
              return (
                <div
                  key={idx}
                  className={`${
                    isAdd
                      ? 'bg-cyber-emerald/15 text-cyber-emerald font-bold'
                      : isDel
                      ? 'bg-cyber-rose/15 text-cyber-rose line-through opacity-80'
                      : isHdr
                      ? 'text-cyber-cyan font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      )}

      {activeTab === 'ASSEMBLY_STUB' && (
        <div className="glass-panel p-4 rounded-xl border border-cyber-purple/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyber-muted border-b border-cyber-border/40 pb-2">
            <span className="text-cyber-purple font-bold">IN-SITU BINARY HOOK & TRAMPOLINE STUB</span>
            <span className="text-[11px] text-slate-300">Target ISA: ARMv7-A / Thumb-2</span>
          </div>

          <pre className="p-4 rounded-xl bg-cyber-bg/95 font-mono text-xs overflow-x-auto leading-relaxed border border-cyber-border/40 text-cyber-purple">
            {assemblyDiff}
          </pre>
        </div>
      )}

      {activeTab === 'MICROVM_VERIFICATION' && (
        <div className="glass-panel p-5 rounded-xl border border-cyber-emerald/40 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white">EPHEMERAL MICROVM REGRESSION VERIFICATION</h3>
              <p className="text-[11px] text-cyber-muted">
                Re-injects patch, executes AFL++ original crash seed, and verifies 0 fault crashes occur.
              </p>
            </div>
            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg bg-cyber-emerald text-cyber-bg font-bold text-xs hover:bg-cyber-emerald/90 transition-all disabled:opacity-50"
            >
              {isVerifying ? 'Running MicroVM Sandbox...' : 'Trigger Verification'}
            </button>
          </div>

          {verificationResult.status ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-cyber-emerald/10 border border-cyber-emerald/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-cyber-emerald" />
                  <div>
                    <div className="text-xs font-bold text-cyber-emerald">HOTFIX ATTESTED & VERIFIED</div>
                    <div className="text-[11px] text-slate-300">Original Crash Payload Successfully Blocked Without Exception</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">{verificationResult.executionTimeMs} ms</div>
                  <div className="text-[10px] text-cyber-muted">Execution Duration</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-border">
                  <div className="text-[10px] text-cyber-muted">CRASH REPRODUCTION</div>
                  <div className="text-sm font-bold text-cyber-emerald mt-1">MITIGATED (SAFE EXIT 0)</div>
                </div>
                <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-border">
                  <div className="text-[10px] text-cyber-muted">REGRESSION SUITE</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {verificationResult.regressionTestsPassed} / {verificationResult.regressionTestsTotal} PASSED (100%)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-cyber-surface border border-cyber-border">
                  <div className="text-[10px] text-cyber-muted">HARDWARE ATTESTATION</div>
                  <div className="text-sm font-bold text-cyber-cyan mt-1">vTPM KERNEL VALID</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-cyber-border text-center text-cyber-muted space-y-2">
              <p>Click &quot;Trigger Verification&quot; to test the synthesized patch inside Firecracker MicroVM.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
