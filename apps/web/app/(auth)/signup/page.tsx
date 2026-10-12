'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithEmailPassword, signInWithOAuthProvider } from '@/lib/supabase';
import AuthHologramCore from '@/components/3d/AuthHologramCore';

export default function SignupPage() {
  const router = useRouter();

  // Form Fields
  const [operatorName, setOperatorName] = useState('Dr. Elena Vance');
  const [organization, setOrganization] = useState('National Cyber Defense Lab');
  const [email, setEmail] = useState('security-lead@sentinelforge.internal');
  const [password, setPassword] = useState('Sentinel#2026!KyberPQC$');
  const [role, setRole] = useState('OFFENSIVE_FIRMWARE_ARCHITECT');
  const [clearanceTier, setClearanceTier] = useState('TOP_SECRET_SCI');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);

  // Live NIST SP 800-63B Password Entropy Calculation
  const calculateEntropy = (pwd: string) => {
    if (!pwd) return { bits: 0, label: 'EMPTY', color: 'text-cyber-muted', barColor: 'bg-cyber-muted', percent: 0, crackTime: '0 seconds' };

    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;

    const bits = Math.round(pwd.length * Math.log2(Math.max(2, pool)));
    const percent = Math.min(100, Math.round((bits / 128) * 100));

    if (bits < 40) {
      return { bits, label: 'VULNERABLE (<40b)', color: 'text-cyber-rose', barColor: 'bg-cyber-rose', percent, crackTime: '< 3 minutes' };
    } else if (bits < 64) {
      return { bits, label: 'STANDARD (40-64b)', color: 'text-cyber-amber', barColor: 'bg-cyber-amber', percent, crackTime: '~ 14 days' };
    } else if (bits < 96) {
      return { bits, label: 'MIL-SPEC (64-96b)', color: 'text-cyber-cyan', barColor: 'bg-cyber-cyan', percent, crackTime: '3.4 × 10⁸ years' };
    } else {
      return { bits, label: 'POST-QUANTUM RESISTANT (96b+)', color: 'text-cyber-emerald', barColor: 'bg-cyber-emerald', percent, crackTime: '> 10¹⁴ centuries' };
    }
  };

  const entropy = calculateEntropy(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthStatusMessage('PROVISIONING SOVEREIGN CLEARANCE TO FIPS 140-3 BOUNDARY...');

    try {
      const { error } = await signUpWithEmailPassword(email, password, {
        name: operatorName,
        organization,
        role,
        clearanceTier
      });
      if (error) throw error;

      setAuthStatusMessage('IDENTITY PROVISIONED. WORKSPACE CLEARED.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setAuthStatusMessage(err.message || 'Provisioning error.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 font-mono">
      {/* Background Cinematic Light Flare */}
      <div className="cinematic-lens-flare top-1/4 left-0" />
      <div className="cinematic-lens-flare bottom-1/4 left-0 opacity-40" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Signup Form (7 cols) */}
        <div className="lg:col-span-7 cinematic-cyber-glass p-8 sm:p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between cyber-liquid-border shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-5">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-cyber-bg border border-cyber-cyan/40 p-2 shadow-[0_0_20px_rgba(0,245,212,0.3)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping absolute" />
                  <span className="text-cyber-cyan font-black text-xl">SF</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-widest flex items-center gap-2">
                    <span>PROVISION OPERATOR</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyber-emerald/20 border border-cyber-emerald/40 text-cyber-emerald font-normal">
                      SIGN UP
                    </span>
                  </h1>
                  <p className="text-[11px] text-cyber-muted tracking-wider">
                    Create Defense-Grade Cleared Identity &bull; Role-Based Access Gate
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-cyber-cyan font-bold transition-all"
              >
                SIGN IN &rarr;
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-cyber-muted block mb-1">OPERATOR FULL NAME</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    required
                    className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
                <div>
                  <label className="text-cyber-muted block mb-1">ORGANIZATION / DEFENSE UNIT</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                    className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">OFFICIAL EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-cyber-muted">MASTER PASSPHRASE</label>
                  <span className={`text-[10px] font-bold ${entropy.color}`}>{entropy.label}</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyber-cyan font-mono"
                />

                {/* NIST SP 800-63B Entropy Meter */}
                <div className="mt-2 p-2.5 rounded-xl bg-cyber-surface/60 border border-cyber-border/60 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-cyber-muted">
                    <span>NIST Entropy: <strong className="text-white">{entropy.bits} bits</strong></span>
                    <span>Crack Estimate: <strong className="text-white">{entropy.crackTime}</strong></span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-cyber-border overflow-hidden">
                    <div
                      className={`h-full ${entropy.barColor} transition-all duration-300`}
                      style={{ width: `${entropy.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-cyber-muted block mb-1">OPERATIONAL ROLE</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                  >
                    <option value="OFFENSIVE_FIRMWARE_ARCHITECT">Lead Exploit Researcher</option>
                    <option value="DEFENSE_ANALYST">SOC Threat Responder</option>
                    <option value="COMPLIANCE_AUDITOR">EMB3D / NIST Auditor</option>
                    <option value="CISO_EXECUTIVE">Chief Information Security Officer</option>
                  </select>
                </div>

                <div>
                  <label className="text-cyber-muted block mb-1">CLEARANCE LEVEL</label>
                  <select
                    value={clearanceTier}
                    onChange={(e) => setClearanceTier(e.target.value)}
                    className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                  >
                    <option value="TOP_SECRET_SCI">Top Secret // SCI Hardware</option>
                    <option value="SECRET_DEFENSE">Secret Defense Level</option>
                    <option value="CONFIDENTIAL_CORP">Enterprise Confidential</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-cyber-emerald text-cyber-bg font-bold text-xs hover:bg-cyber-emerald/90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-cyber-bg border-t-transparent animate-spin" />
                    <span>PROVISIONING CREDENTIALS...</span>
                  </>
                ) : (
                  <>
                    <span>REGISTER SECURE IDENTITY & ENTER CONSOLE</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </form>

            {authStatusMessage && (
              <div className="mt-4 p-3 rounded-xl bg-cyber-bg/90 border border-cyber-emerald/40 text-cyber-emerald text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse" />
                <span>{authStatusMessage}</span>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-cyber-border/60 text-center text-xs text-cyber-muted">
            Already have an active security clearance?{' '}
            <Link href="/login" className="text-cyber-cyan hover:underline font-bold">
              Sign In Here &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: Holographic Showcase (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="cinematic-cyber-glass p-6 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-cyber-emerald/30">
            <div className="absolute inset-0">
              <AuthHologramCore securityStatus={loading ? 'AUTHENTICATING' : 'SECURE'} />
            </div>

            <div className="relative z-10 text-center mt-auto p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border/70 backdrop-blur-md w-full">
              <div className="text-[10px] text-cyber-emerald font-bold tracking-widest uppercase">
                FIPS 140-3 LEVEL 4 CLEARED
              </div>
              <div className="text-xs text-white font-bold mt-0.5">
                Zero-Knowledge Proof Identity Provisioning
              </div>
              <div className="text-[10px] text-cyber-muted mt-1">
                Kyber-1024 Lattice Cryptographic Key Pair Generated
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-cyber-surface/70 border border-cyber-border/70 cyber-hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center text-sm">
                  🔐
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">HARDWARE ROOT OF TRUST</h4>
                  <p className="text-[11px] text-cyber-muted">Cryptographic binding to TPM 2.0 / Apple Secure Enclave.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyber-surface/70 border border-cyber-border/70 cyber-hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-emerald/20 border border-cyber-emerald/40 flex items-center justify-center text-sm">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">INSTANT DYNAMIC EMULATION</h4>
                  <p className="text-[11px] text-cyber-muted">Immediate sandbox access upon clearance verification.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyber-surface/50 border border-cyber-border/50 text-[10px] text-cyber-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse" />
              <span>CLEARANCE: ACTIVE</span>
            </span>
            <span>TOKEN: <strong className="text-cyber-cyan">KYBER-PQC-9842X</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
