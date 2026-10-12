'use client';

import React, { useState } from 'react';
import { useSentinelStore } from '@/lib/store';

interface RbacMember {
  name: string;
  email: string;
  role: string;
  mfa: string;
  lastLogin: string;
}

export default function SettingsPage() {
  const { showToast } = useSentinelStore();
  const [activeTab, setActiveTab] = useState<'RBAC' | 'AUDIT_LOG' | 'INTEGRATIONS' | 'PENTEST_POLICY'>('AUDIT_LOG');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'ANALYST' | 'AUDITOR (Read-Only)' | 'DEVELOPER'>('ANALYST');

  const auditLogs = [
    { id: 'aud_1001', time: '2026-09-01 20:17:42', actor: 'security-lead@sentinelforge.internal', action: 'ATTESTATION_SIGNED', target: 'DEV:dev_edge_gateway_01', ip: '192.168.1.104', status: 'VERIFIED' },
    { id: 'aud_1002', time: '2026-09-01 20:18:05', actor: 'security-lead@sentinelforge.internal', action: 'AUTONOMOUS_FUZZING_STARTED', target: 'Harness:AFL++_ARMv7', ip: '192.168.1.104', status: 'SUCCESS' },
    { id: 'aud_1003', time: '2026-09-01 20:20:11', actor: 'security-lead@sentinelforge.internal', action: 'ZERO_DAY_TRIAGED', target: 'SF-ZERO-2026-001 (BLE Overflow)', ip: '192.168.1.104', status: 'ALERT_DISPATCHED' },
    { id: 'aud_1004', time: '2026-09-01 20:21:49', actor: 'system-agent@mcp.internal', action: 'VEX_ASSERTION_GENERATED', target: 'CycloneDX:libble_protocol_core@2.4.1', ip: '127.0.0.1', status: 'SUCCESS' }
  ];

  const [rbacMembers, setRbacMembers] = useState<RbacMember[]>([
    { name: 'Lead Offensive Architect', email: 'security-lead@sentinelforge.internal', role: 'OWNER', mfa: 'TOTP Active', lastLogin: 'Just now' },
    { name: 'Senior Firmware Researcher', email: 'firmware-re@sentinelforge.internal', role: 'ANALYST', mfa: 'FIDO2 WebAuthn', lastLogin: '2 hours ago' },
    { name: 'Compliance Auditor', email: 'auditor@external-cert.com', role: 'AUDITOR (Read-Only)', mfa: 'TOTP Active', lastLogin: '1 day ago' }
  ]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const newMember: RbacMember = {
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      mfa: 'Pending Setup',
      lastLogin: 'Invitation Sent'
    };

    setRbacMembers((prev) => [...prev, newMember]);
    showToast(`Invitation successfully dispatched to ${inviteEmail}`, 'SUCCESS');
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteName('');
  };

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue animate-pulse" />
            <h1 className="text-xl font-bold text-white">ORGANIZATION, RBAC & AUDIT LOGS</h1>
          </div>
          <p className="text-xs text-cyber-muted">
            Multi-Tenant Administration &bull; Cryptographic Audit Trail &bull; Dual-Use Safety Governance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'AUDIT_LOG' as const, label: 'Immutable Audit Logs' },
          { id: 'RBAC' as const, label: 'Role-Based Access Control (RBAC)' },
          { id: 'PENTEST_POLICY' as const, label: 'Nightly Pentest & Safety Policy' },
          { id: 'INTEGRATIONS' as const, label: 'Webhooks & CI/CD Scanning' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(0,245,212,0.2)]'
                : 'text-cyber-muted hover:text-white bg-cyber-surface/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Log Tab */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="glass-panel rounded-xl overflow-hidden border border-cyber-border">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-cyber-surface/90 border-b border-cyber-border/40 text-cyber-muted">
              <tr>
                <th className="p-3.5">TIMESTAMP</th>
                <th className="p-3.5">ACTOR</th>
                <th className="p-3.5">ACTION</th>
                <th className="p-3.5">TARGET RESOURCE</th>
                <th className="p-3.5">IP ADDRESS</th>
                <th className="p-3.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/30 bg-cyber-card/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-cyber-surface/50 transition-colors">
                  <td className="p-3.5 text-cyber-muted text-[11px]">{log.time}</td>
                  <td className="p-3.5 text-white">{log.actor}</td>
                  <td className="p-3.5 text-cyber-cyan font-bold">{log.action}</td>
                  <td className="p-3.5 text-slate-300">{log.target}</td>
                  <td className="p-3.5 text-cyber-muted">{log.ip}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RBAC Tab */}
      {activeTab === 'RBAC' && (
        <div className="glass-panel p-5 rounded-xl border border-cyber-border flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
            <h2 className="text-sm font-bold text-white">ORGANIZATION TEAM MEMBERS & PERMISSIONS</h2>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-[0_0_12px_rgba(0,245,212,0.2)]"
            >
              + Invite Member
            </button>
          </div>

          <div className="space-y-3">
            {rbacMembers.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-cyber-surface/70 border border-cyber-border/40 flex items-center justify-between text-xs">
                <div>
                  <div className="text-white font-bold">{m.name}</div>
                  <div className="text-cyber-muted text-[11px]">{m.email}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 rounded bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40 font-bold text-[10px]">
                    {m.role}
                  </span>
                  <span className="text-[11px] text-cyber-emerald">{m.mfa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nightly Pentest Policy */}
      {activeTab === 'PENTEST_POLICY' && (
        <div className="glass-panel p-5 rounded-xl border border-cyber-border flex flex-col gap-4 text-xs">
          <h2 className="text-sm font-bold text-white">NIGHTLY AUTONOMOUS PENTEST SCHEDULER</h2>
          <p className="text-cyber-muted leading-relaxed">
            Once a device profile and SBOM exist, SentinelForge runs thousands of simulated attack mutations against the emulated digital twin overnight (unattended), presenting a prioritized &ldquo;check these first&rdquo; triage queue each morning.
          </p>
          <div className="p-4 rounded-xl bg-cyber-surface/80 border border-cyber-border/60 flex items-center justify-between">
            <div>
              <div className="text-white font-bold">Automatic Nightly Emulation Fuzzing</div>
              <div className="text-cyber-muted text-[11px]">Runs 00:00 - 06:00 UTC with 8 dedicated QEMU sandbox threads</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 font-bold text-[10px]">
              ENABLED
            </span>
          </div>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="glass-panel p-5 rounded-xl border border-cyber-border flex flex-col gap-4 text-xs">
          <h2 className="text-sm font-bold text-white">ALERTS & CI/CD PIPELINE INTEGRATIONS</h2>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border/40 flex items-center justify-between">
              <div>
                <div className="text-white font-bold">Slack & Microsoft Teams Webhook</div>
                <div className="text-cyber-muted text-[11px]">Instant notifications on discovered Zero-Days (EPSS &gt; 80%)</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 text-[10px] font-bold">
                CONNECTED
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-cyber-surface/80 border border-cyber-border/40 flex items-center justify-between">
              <div>
                <div className="text-white font-bold">GitHub Actions & GitLab CI Scanner Plugin</div>
                <div className="text-cyber-muted text-[11px]">Fail build if unmitigated CISA &apos;ACT&apos; level vulnerabilities are introduced</div>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 text-[10px] font-bold">
                API TOKEN ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Member Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyber-cyan/40 max-w-md w-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
                <h3 className="text-sm font-bold text-white">INVITE SECURITY TEAM COLLABORATOR</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-cyber-muted hover:text-white text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-cyber-muted block mb-1">FULL NAME / CALLSIGN</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">CORPORATE EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. alex@sentinelforge.internal"
                  className="w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div>
                <label className="text-cyber-muted block mb-1">RBAC ROLE PERMISSION</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-cyber-surface border border-cyber-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyber-cyan"
                >
                  <option value="ANALYST">ANALYST (Full Exploitation & Taint Replay)</option>
                  <option value="AUDITOR (Read-Only)">AUDITOR (Read-Only Compliance & Reports)</option>
                  <option value="DEVELOPER">DEVELOPER (Patch Studio & Binary Hotpatching)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-cyber-border/40 mt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-xs text-cyber-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyber-cyan text-cyber-bg font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-[0_0_12px_rgba(0,245,212,0.3)]"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
