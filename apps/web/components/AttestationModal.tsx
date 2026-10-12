'use client';

import React, { useState } from 'react';
import { useSentinelStore } from '@/lib/store';
import { submitAttestation } from '@/lib/api';

export default function AttestationModal() {
  const { attestationModalOpen, attestationTargetDevice, closeAttestationModal, setActiveDevice } = useSentinelStore();

  const [testerName, setTesterName] = useState('Lead Offensive Security Architect');
  const [testerEmail, setTesterEmail] = useState('security-lead@sentinelforge.internal');
  const [organization, setOrganization] = useState('SentinelForge CyberOps Lab');
  const [authorizationType, setAuthorizationType] = useState<'OWNER_CERTIFIED' | 'AUTHORIZED_PENTEST' | 'LAB_ISOLATED'>('OWNER_CERTIFIED');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!attestationModalOpen || !attestationTargetDevice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;

    setIsSubmitting(true);
    try {
      const record = await submitAttestation(attestationTargetDevice.id, {
        testerName,
        testerEmail,
        organization,
        deviceId: attestationTargetDevice.id,
        authorizationType,
        attestationTermsAccepted: termsAccepted
      });

      const updated = { ...attestationTargetDevice, activeAttestation: record };
      setActiveDevice(updated);
      closeAttestationModal();
    } catch (err) {
      console.error('Failed to sign attestation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel-glow p-6 rounded-2xl border border-cyber-cyan/40 flex flex-col gap-4 font-mono">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyber-border/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyber-rose/20 border border-cyber-rose/50 flex items-center justify-center text-cyber-rose">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">MANDATORY AUTHORIZATION ATTESTATION</h2>
              <p className="text-xs text-cyber-muted">Cryptographic Proof of Authorized Security Audit</p>
            </div>
          </div>
          <button onClick={closeAttestationModal} className="text-cyber-muted hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-lg bg-cyber-amber/10 border border-cyber-amber/30 text-cyber-amber text-xs leading-relaxed">
          <span className="font-bold">LEGAL & ETHICAL NOTICE:</span> SentinelForge executes active symbolic taint exploration and hardware fuzz-harness injection. You must attest that you own or have written authorization from the device manufacturer to test this firmware image.
        </div>

        {/* Target Details */}
        <div className="p-3 rounded-lg bg-cyber-surface/60 border border-cyber-border/40 text-xs space-y-1">
          <div className="text-cyber-muted">TARGET HARDWARE / FIRMWARE:</div>
          <div className="text-cyber-cyan font-bold">{attestationTargetDevice.name} ({attestationTargetDevice.model})</div>
          <div className="text-[11px] text-cyber-muted break-all">DIGEST: {attestationTargetDevice.firmwareHash}</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-cyber-muted block mb-1">TESTER FULL NAME</label>
              <input
                type="text"
                value={testerName}
                onChange={(e) => setTesterName(e.target.value)}
                required
                className="w-full bg-cyber-surface/80 border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
              />
            </div>
            <div>
              <label className="text-cyber-muted block mb-1">TESTER EMAIL</label>
              <input
                type="email"
                value={testerEmail}
                onChange={(e) => setTesterEmail(e.target.value)}
                required
                className="w-full bg-cyber-surface/80 border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div>
            <label className="text-cyber-muted block mb-1">AUDITING ORGANIZATION</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
              className="w-full bg-cyber-surface/80 border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="text-cyber-muted block mb-1">AUTHORIZATION BASIS</label>
            <select
              value={authorizationType}
              onChange={(e) => setAuthorizationType(e.target.value as any)}
              className="w-full bg-cyber-surface/80 border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
            >
              <option value="OWNER_CERTIFIED">Device / Firmware Owner Certified (Direct Legal Rights)</option>
              <option value="AUTHORIZED_PENTEST">Contracted Penetration Testing Agreement Active</option>
              <option value="LAB_ISOLATED">Air-Gapped Defensive Security Research Lab</option>
            </select>
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded border-cyber-border bg-cyber-surface text-cyber-cyan focus:ring-0"
            />
            <span className="text-[11px] text-cyber-muted leading-tight">
              I attest under penalty of audit log recordation that all actions performed with SentinelForge against this target comply with applicable cybersecurity laws, computer fraud statutes, and responsible disclosure protocols.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyber-border/40">
            <button
              type="button"
              onClick={closeAttestationModal}
              className="px-4 py-2 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 text-cyber-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!termsAccepted || isSubmitting}
              className="px-5 py-2 rounded-lg bg-cyber-cyan text-cyber-bg font-bold hover:bg-cyber-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,245,212,0.3)]"
            >
              {isSubmitting ? (
                <>Signing SHA-256 Digest...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sign & Authorize Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
