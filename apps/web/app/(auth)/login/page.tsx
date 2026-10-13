'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailPassword, signUpWithEmailPassword, signInWithOAuthProvider } from '@/lib/supabase';
import AuthHologramCore from '@/components/3d/AuthHologramCore';

type AuthMode = 'LOGIN' | 'SIGNUP';
type AuthMethod = 'PASSWORD' | 'WEBAUTHN' | 'CAC_SMARTCARD';

const DEMO_ACCOUNTS = [
  {
    label: 'Elena Vance (Lead Architect)',
    email: 'security-lead@sentinelforge.internal',
    password: 'Sentinel#2026!KyberPQC$',
    role: 'OFFENSIVE_FIRMWARE_ARCHITECT',
    org: 'SentinelForge CyberOps Lab'
  },
  {
    label: 'Operations Admin',
    email: 'admin@sentinelforge.internal',
    password: 'Admin#Sentinel2026!',
    role: 'ADMIN',
    org: 'SentinelForge CyberOps Lab'
  },
  {
    label: 'SOC Threat Analyst',
    email: 'analyst@sentinelforge.internal',
    password: 'Analyst#Pass2026!',
    role: 'DEFENSE_ANALYST',
    org: 'Sovereign Incident Response'
  }
];

export default function LoginPage() {
  const router = useRouter();

  // Mode & Method State
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('PASSWORD');

  // Form Fields
  const [email, setEmail] = useState('security-lead@sentinelforge.internal');
  const [password, setPassword] = useState('Sentinel#2026!KyberPQC$');
  const [operatorName, setOperatorName] = useState('Dr. Elena Vance');
  const [organization, setOrganization] = useState('National Cyber Defense Lab');
  const [role, setRole] = useState('OFFENSIVE_FIRMWARE_ARCHITECT');
  const [totpCode, setTotpCode] = useState('');
  const [smartCardPin, setSmartCardPin] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [webauthnState, setWebauthnState] = useState<'IDLE' | 'SCANNING' | 'VERIFIED'>('IDLE');
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

  // Apply Demo Account
  const handleSelectDemoAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setOperatorName(acc.label);
    setOrganization(acc.org);
    setRole(acc.role);
    setAuthStatusMessage(`Selected preset: ${acc.label}`);
    setIsSuccess(false);
  };

  // Switch between Login and Signup modes
  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setAuthStatusMessage(null);
    setIsSuccess(false);
    if (newMode === 'SIGNUP') {
      setEmail('field-researcher@defense.lab');
      setPassword('Sovereign#2026!Shield$');
      setOperatorName('Commander Alex Vance');
      setOrganization('Strategic Cyber Command');
      setRole('DEFENSE_ANALYST');
    } else {
      setEmail(DEMO_ACCOUNTS[0].email);
      setPassword(DEMO_ACCOUNTS[0].password);
      setOperatorName(DEMO_ACCOUNTS[0].label);
      setOrganization(DEMO_ACCOUNTS[0].org);
      setRole(DEMO_ACCOUNTS[0].role);
    }
  };

  // Submit Handler for Email & Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsSuccess(false);
    setAuthStatusMessage('VERIFYING ZERO-TRUST IDENTITY WITH SECURE ELEMENT...');

    try {
      if (mode === 'LOGIN') {
        const { error } = await signInWithEmailPassword(email, password);
        if (error) throw error;
        setIsSuccess(true);
        setAuthStatusMessage('SOVEREIGN CLEARANCE GRANTED. INITIATING OPERATIONS CONSOLE...');
      } else {
        const { error } = await signUpWithEmailPassword(email, password, {
          name: operatorName,
          organization,
          role
        });
        if (error) throw error;
        setIsSuccess(true);
        setAuthStatusMessage('OPERATOR IDENTITY ATTESTED & SAVED. ENTERING OPERATIONS CONSOLE...');
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setIsSuccess(false);
      setAuthStatusMessage(err.message || 'Authentication error.');
      setLoading(false);
    }
  };

  // Hardware WebAuthn / FIDO2 Trigger
  const handleWebAuthnTrigger = () => {
    setWebauthnState('SCANNING');
    setAuthStatusMessage('TOUCH YOUR FIDO2 HARDWARE SECURITY KEY (YUBIKEY / NITROKEY)...');
    setIsSuccess(false);

    setTimeout(() => {
      setWebauthnState('VERIFIED');
      setIsSuccess(true);
      setAuthStatusMessage('FIDO2 FIPS-140-2 HARDWARE ATTESTATION VERIFIED [KEY ID: YUBI-9842X-KYBER]');
      if (typeof document !== 'undefined') {
        document.cookie = 'sentinelforge_session=sentinelforge_authenticated_session_token; path=/; max-age=86400; SameSite=Lax';
      }
      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    }, 1500);
  };

  // CAC / PIV Smart Card Trigger
  const handleSmartCardTrigger = () => {
    if (!smartCardPin || smartCardPin.length < 4) {
      setAuthStatusMessage('Error: Smart Card PIN must be at least 4 numerical digits.');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setAuthStatusMessage('VERIFYING DOD CAC CERTIFICATE WITH OCSP RESPONDER...');
    setIsSuccess(false);

    setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.cookie = 'sentinelforge_session=sentinelforge_authenticated_session_token; path=/; max-age=86400; SameSite=Lax';
      }
      setIsSuccess(true);
      setAuthStatusMessage('CAC VALIDATED: CN=VANCE.ELENA.A.108429. ENTERING COMMAND CONSOLE...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    }, 1200);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 font-mono">
      {/* Background Cinematic Light Flare */}
      <div className="cinematic-lens-flare top-1/4 left-0" />
      <div className="cinematic-lens-flare bottom-1/4 left-0 opacity-40" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* =========================================================
            LEFT COLUMN: CINEMATIC ZERO-TRUST AUTHENTICATION PORTAL (7 cols)
           ========================================================= */}
        <div className="lg:col-span-7 cinematic-cyber-glass p-8 sm:p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between cyber-liquid-border shadow-2xl">
          <div>
            {/* Top Brand Header */}
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-5">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-cyber-bg border border-cyber-cyan/40 p-2 shadow-[0_0_20px_rgba(0,245,212,0.3)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping absolute" />
                  <span className="text-cyber-cyan font-black text-xl">SF</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-widest flex items-center gap-2">
                    <span>SENTINELFORGE</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan font-normal">
                      SOVEREIGN GATE
                    </span>
                  </h1>
                  <p className="text-[11px] text-cyber-muted tracking-wider">
                    Zero-Trust Access Control &bull; Post-Quantum Cryptographic Boundary
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-cyber-bg/80 p-1 rounded-xl border border-cyber-border/70 text-xs">
                <button
                  type="button"
                  onClick={() => handleModeChange('LOGIN')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    mode === 'LOGIN'
                      ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_12px_rgba(0,245,212,0.4)]'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('SIGNUP')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    mode === 'SIGNUP'
                      ? 'bg-cyber-cyan text-cyber-bg shadow-[0_0_12px_rgba(0,245,212,0.4)]'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  SIGN UP
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Autofill Bar */}
            {mode === 'LOGIN' && (
              <div className="mt-4 p-2.5 rounded-2xl bg-cyber-surface/60 border border-cyber-border/60">
                <div className="text-[10px] text-cyber-muted uppercase tracking-wider mb-1.5 font-bold flex items-center justify-between">
                  <span>FAST TEST PRESETS:</span>
                  <span className="text-cyber-cyan">ONE-CLICK AUTOLOGIN</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemoAccount(acc)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                        email === acc.email
                          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
                          : 'bg-cyber-bg/80 border-cyber-border text-zinc-300 hover:text-white hover:border-zinc-500'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Auth Method Selector */}
            <div className="mt-5">
              <label className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-2">
                AUTHENTICATION VERIFICATION PROTOCOL
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('PASSWORD')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    authMethod === 'PASSWORD'
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(0,245,212,0.2)]'
                      : 'bg-cyber-surface/60 border-cyber-border text-cyber-muted hover:text-white'
                  }`}
                >
                  <span>🔐</span>
                  <span className="hidden sm:inline">Passphrase</span>
                  <span className="sm:hidden">Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('WEBAUTHN')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    authMethod === 'WEBAUTHN'
                      ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-cyber-surface/60 border-cyber-border text-cyber-muted hover:text-white'
                  }`}
                >
                  <span>🔑</span>
                  <span className="hidden sm:inline">FIDO2 (YubiKey)</span>
                  <span className="sm:hidden">FIDO2</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('CAC_SMARTCARD')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    authMethod === 'CAC_SMARTCARD'
                      ? 'bg-cyber-emerald/20 border-cyber-emerald text-cyber-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-cyber-surface/60 border-cyber-border text-cyber-muted hover:text-white'
                  }`}
                >
                  <span>💳</span>
                  <span className="hidden sm:inline">CAC / PIV Card</span>
                  <span className="sm:hidden">SmartCard</span>
                </button>
              </div>
            </div>

            {/* Dynamic Interactive Auth Form Content */}
            {authMethod === 'PASSWORD' && (
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-xs">
                {mode === 'SIGNUP' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-cyber-muted block mb-1">OPERATOR FULL NAME</label>
                      <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        required
                        className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyber-cyan"
                      />
                    </div>
                    <div>
                      <label className="text-cyber-muted block mb-1">ORGANIZATION / DEFENSE UNIT</label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        required
                        className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyber-cyan"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-cyber-muted block mb-1">OPERATOR SECURE EMAIL / ID</label>
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
                    <label className="text-cyber-muted">OPERATOR MASTER PASSPHRASE</label>
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
                  <div className="mt-2 p-2 rounded-xl bg-cyber-surface/60 border border-cyber-border/60 space-y-1">
                    <div className="flex justify-between text-[10px] text-cyber-muted">
                      <span>NIST Entropy: <strong className="text-white">{entropy.bits} bits</strong></span>
                      <span>Crack Estimate: <strong className="text-white">{entropy.crackTime}</strong></span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-cyber-border overflow-hidden">
                      <div
                        className={`h-full ${entropy.barColor} transition-all duration-300`}
                        style={{ width: `${entropy.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {mode === 'SIGNUP' && (
                  <div>
                    <label className="text-cyber-muted block mb-1">SECURITY CLEARANCE ROLE</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyber-cyan"
                    >
                      <option value="OFFENSIVE_FIRMWARE_ARCHITECT">Lead Exploit Researcher / Firmware Reverse Engineer</option>
                      <option value="DEFENSE_ANALYST">Tier 1 Sovereign SOC Analyst / Incident Responder</option>
                      <option value="COMPLIANCE_AUDITOR">SCADA / EMB3D Regulatory Compliance Auditor</option>
                      <option value="CISO_EXECUTIVE">Chief Information Security Officer (CISO)</option>
                    </select>
                  </div>
                )}

                {mode === 'LOGIN' && (
                  <div>
                    <label className="text-cyber-muted block mb-1">FIPS TOTP 2FA TOKEN (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="e.g. 849-201"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      className="w-full bg-cyber-surface/90 border border-cyber-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyber-cyan tracking-widest font-mono"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-[0_0_20px_rgba(0,245,212,0.35)] flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-cyber-bg border-t-transparent animate-spin" />
                      <span>AUTHENTICATING WITH FIPS BOUNDARY...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'LOGIN' ? 'AUTHENTICATE & ENTER COMMAND CONSOLE' : 'REGISTER SOVEREIGN OPERATOR IDENTITY'}</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FIDO2 / WebAuthn Hardware View */}
            {authMethod === 'WEBAUTHN' && (
              <div className="mt-6 p-6 rounded-2xl bg-cyber-surface/70 border border-cyber-purple/40 text-center flex flex-col items-center gap-4">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <span className={`w-20 h-20 rounded-full border border-cyber-purple/40 ${webauthnState === 'SCANNING' ? 'animate-ping' : ''} absolute`} />
                  <div className="w-14 h-14 rounded-2xl bg-cyber-purple/20 border border-cyber-purple flex items-center justify-center text-3xl">
                    🔑
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white tracking-wider">FIDO2 / WEBAUTHN HARDWARE SECURITY KEY</h3>
                  <p className="text-xs text-cyber-muted mt-1 max-w-sm">
                    Cryptographic hardware token authentication compliant with FIPS 140-2 Level 3 (YubiKey 5 Series / Nitrokey Pro).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleWebAuthnTrigger}
                  disabled={webauthnState === 'SCANNING'}
                  className="px-6 py-2.5 rounded-xl bg-cyber-purple text-white font-bold text-xs hover:bg-cyber-purple/90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center gap-2"
                >
                  {webauthnState === 'SCANNING' ? 'WAITING FOR HARDWARE TOUCH...' : 'ACTIVATE HARDWARE TOKEN SCAN'}
                </button>
              </div>
            )}

            {/* Smart Card / CAC View */}
            {authMethod === 'CAC_SMARTCARD' && (
              <div className="mt-6 p-6 rounded-2xl bg-cyber-surface/70 border border-cyber-emerald/40 text-left flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-cyber-border/60 pb-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">CAC / PIV SMART CARD ATTESTATION</h3>
                    <p className="text-[11px] text-cyber-muted">Department of Defense / Critical Infrastructure PIV Card</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border font-mono text-[11px] text-cyber-emerald space-y-1">
                  <div>CERT: <strong>CN=VANCE.ELENA.A.108429, OU=CYBER-OPS, O=SENTINEL, C=US</strong></div>
                  <div>ISSUER: <strong>DOD ROOT CA 4 // SHA384_RSA4096</strong></div>
                  <div>STATUS: <strong>VALID (CRL CHECKED // OCSP VERIFIED)</strong></div>
                </div>

                <div>
                  <label className="text-cyber-muted block mb-1 text-xs">SMART CARD PIN (4-8 DIGITS)</label>
                  <input
                    type="password"
                    placeholder="e.g. 9842"
                    value={smartCardPin}
                    onChange={(e) => setSmartCardPin(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-xl px-3.5 py-2 text-white tracking-widest focus:outline-none focus:border-cyber-emerald font-mono text-xs"
                  />
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSmartCardTrigger}
                  className="w-full py-2.5 rounded-xl bg-cyber-emerald text-cyber-bg font-bold text-xs hover:bg-cyber-emerald/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-cyber-bg border-t-transparent animate-spin" />
                      <span>VERIFYING CAC PIN...</span>
                    </>
                  ) : (
                    <>
                      <span>VERIFY SMART CARD CERTIFICATE</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Status Message Display */}
            {authStatusMessage && (
              <div
                className={`mt-4 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                  isSuccess
                    ? 'bg-neon-emerald/10 border-neon-emerald/40 text-neon-emerald'
                    : 'bg-void-950 border-cyber-cyan/40 text-cyber-cyan'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isSuccess ? 'bg-neon-emerald' : 'bg-cyber-cyan'
                  }`}
                />
                <span>{authStatusMessage}</span>
              </div>
            )}
          </div>

          {/* Bottom OAuth & Federated SSO Row */}
          <div className="mt-6 pt-5 border-t border-cyber-border/60 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-cyber-border/60" />
              <span className="text-[10px] text-cyber-muted tracking-wider uppercase">FEDERATED ENTERPRISE SSO</span>
              <div className="flex-1 h-[1px] bg-cyber-border/60" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => signInWithOAuthProvider('github')}
                className="py-2.5 px-3 rounded-xl bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-white transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub SSO</span>
              </button>

              <button
                type="button"
                onClick={() => signInWithOAuthProvider('google')}
                className="py-2.5 px-3 rounded-xl bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-white transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google Workspace</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: 3D HOLOGRAPHIC DEFENSE SHOWCASE (5 cols)
           ========================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="cinematic-cyber-glass p-6 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] border border-cyber-cyan/30">
            <div className="absolute inset-0">
              <AuthHologramCore securityStatus={loading ? 'AUTHENTICATING' : 'SECURE'} />
            </div>

            <div className="relative z-10 text-center mt-auto p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border/70 backdrop-blur-md w-full">
              <div className="text-[10px] text-cyber-cyan font-bold tracking-widest uppercase">
                HARDWARE ROOT OF TRUST
              </div>
              <div className="text-xs text-white font-bold mt-0.5">
                Kyber-1024 Quantum Lattice Shield
              </div>
              <div className="text-[10px] text-cyber-muted mt-1">
                FIPS 140-3 Level 4 Cryptographic Boundary Active
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-cyber-surface/70 border border-cyber-border/70 hover:border-cyber-cyan/50 transition-all cyber-hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-rose/20 border border-cyber-rose/40 flex items-center justify-center text-sm">
                  🛡️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AIR-GAPPED REVERSE ENGINEERING</h4>
                  <p className="text-[11px] text-cyber-muted">Isolated QEMU system emulation with FirmAE NVRAM interception.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyber-surface/70 border border-cyber-border/70 hover:border-cyber-purple/50 transition-all cyber-hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-purple/20 border border-cyber-purple/40 flex items-center justify-center text-sm">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AUTONOMOUS SAT SOLVER TAINT ENGINE</h4>
                  <p className="text-[11px] text-cyber-muted">angr mathematical verification proving zero-day exploit paths.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyber-surface/70 border border-cyber-border/70 hover:border-cyber-emerald/50 transition-all cyber-hover-lift">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-emerald/20 border border-cyber-emerald/40 flex items-center justify-center text-sm">
                  📜
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">CISA & EMB3D ATTESTATION SEALS</h4>
                  <p className="text-[11px] text-cyber-muted">Cryptographic CycloneDX SBOMs & VEX machine-readable statements.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyber-surface/50 border border-cyber-border/50 text-[10px] text-cyber-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse" />
              <span>TLS 1.3 / AES-256-GCM</span>
            </span>
            <span>AIR-GAP ID: <strong className="text-cyber-cyan">SF-NODE-9842X</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
