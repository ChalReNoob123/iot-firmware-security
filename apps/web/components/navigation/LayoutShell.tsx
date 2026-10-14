'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import GlobalNav from './GlobalNav';
import TerminalFooter from '../footer/TerminalFooter';
import UploadTriggerButton from '@/components/UploadTriggerButton';
import { signOutUser } from '@/lib/supabase';
import { useSentinelStore } from '@/lib/store';
import {
  Activity,
  Server,
  Zap,
  Flame,
  Terminal,
  GitBranch,
  Radio,
  Cpu,
  Layers,
  FileCode,
  Sliders,
  Shield,
  CheckCircle2,
  Lock,
  Search,
  Command,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  LogOut,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  ping?: boolean;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'CORE OPERATIONS',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Activity, badge: 'LIVE', badgeColor: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30' },
      { name: 'Vulnerability Tracker', href: '/vulnerabilities', icon: ShieldAlert, badge: 'KEV/ZERO', badgeColor: 'text-neon-crimson bg-neon-crimson/15 border-neon-crimson/40', ping: true },
      { name: 'Target Fleet', href: '/devices', icon: Server, badge: '3 DEV', badgeColor: 'text-zinc-300 bg-void-900 border-zinc-700' },
      { name: 'Live Pipeline', href: '/pipeline', icon: Zap, badge: 'AUTO', badgeColor: 'text-neon-emerald bg-neon-emerald/10 border-neon-emerald/30' },
      { name: 'War-Room', href: '/war-room', icon: Flame, badge: 'INCIDENT', badgeColor: 'text-neon-crimson bg-neon-crimson/15 border-neon-crimson/40', ping: true }
    ]
  },
  {
    title: 'EMULATION & ATTACK',
    items: [
      { name: 'Digital Twin', href: '/emulator', icon: Terminal, badge: 'QEMU', badgeColor: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30' },
      { name: 'Attack Graph', href: '/attack-graph', icon: GitBranch },
      { name: 'Side-Channel', href: '/side-channel', icon: Radio, badge: 'EM/SCA', badgeColor: 'text-neon-amber bg-neon-amber/10 border-neon-amber/30' }
    ]
  },
  {
    title: 'INTELLIGENCE & AI',
    items: [
      { name: 'Sentinel Copilot', href: '/copilot', icon: Cpu, badge: 'MCP AI', badgeColor: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30' },
      { name: 'Firmware Terminal', href: '/terminal', icon: FileCode },
      { name: 'Vulnerability Genome', href: '/genome', icon: Layers }
    ]
  },
  {
    title: 'GOVERNANCE & VEX',
    items: [
      { name: 'Patch Studio', href: '/patch-studio', icon: Sliders, badge: 'HOT', badgeColor: 'text-neon-emerald bg-neon-emerald/10 border-neon-emerald/30' },
      { name: 'SBOM & VEX', href: '/sbom-vex', icon: Shield },
      { name: 'EU CRA Audit', href: '/reports', icon: CheckCircle2 },
      { name: 'Admin & RBAC', href: '/settings', icon: Lock }
    ]
  }
];

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isLandingPage = pathname === '/';

  // Sidebar Collapse & Mobile Drawer State
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick Command Palette Modal (Ctrl+K / Cmd+K)
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');

  // Operator user profile state
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Elena Vance',
    role: 'OFFENSIVE_ARCHITECT',
    email: 'security-lead@sentinelforge.internal',
    initials: 'EV'
  });

  // Global Attestation Modal Trigger from Store
  const { openUploadModal } = useSentinelStore();

  // Load sidebar preference and user profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sentinelforge_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
      const rawUser = localStorage.getItem('sentinelforge_current_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const inits = (u.name || 'EV')
          .split(' ')
          .map((p: string) => p[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        setCurrentUser({
          name: u.name || 'Dr. Elena Vance',
          role: (u.role || 'OFFENSIVE_ARCHITECT').replace('_', ' '),
          email: u.email || '',
          initials: inits || 'EV'
        });
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, [pathname]);


  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sentinelforge_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paletteOpen]);

  // Handle Logout
  const handleLogout = async () => {
    await signOutUser();
    router.push('/login');
  };

  // If on landing page, render standard public marketing wrapper
  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col relative w-full bg-void-950 text-zinc-100 font-sans">
        <GlobalNav />
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <TerminalFooter />
      </div>
    );
  }

  // Filter commands in Palette
  const allNavItems = NAV_CATEGORIES.flatMap((c) => c.items);
  const filteredCommands = allNavItems.filter((item) =>
    item.name.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  // Compute active module title for breadcrumbs
  const currentNav = allNavItems.find((item) => item.href === pathname);
  const activeTitle = currentNav?.name || pathname.replace('/', '').toUpperCase();

  return (
    <div className="min-h-screen flex w-full bg-void-950 text-zinc-100 font-sans overflow-x-hidden">
      
      {/* =========================================================================
          1. COLLAPSIBLE LEFT COMMAND SIDEBAR (Desktop)
         ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col border-r border-zinc-border/70 bg-void-900/95 backdrop-blur-2xl transition-all duration-300 z-30 select-none ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand / Logo Titlebar */}
        <div className="h-16 px-4 border-b border-zinc-border/70 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-void-850 to-void-950 border border-neon-cyan/50 flex items-center justify-center text-neon-cyan font-mono font-black text-sm shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.25)] group-hover:scale-105 transition-transform">
              SF
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-heading font-black text-sm tracking-wider text-white">
                  SENTINEL<span className="text-neon-cyan">FORGE</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-500 tracking-tighter mt-1">
                  SEC-OPS &bull; v2.4-KYBER
                </span>
              </div>
            )}
          </Link>
          
          {!collapsed && (
            <span className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse shrink-0" title="System Kernel Online" />
          )}
        </div>

        {/* Quick Search / Command Palette Button */}
        <div className="p-3 border-b border-zinc-border/50">
          <button
            onClick={() => setPaletteOpen(true)}
            className={`w-full py-2 px-3 rounded-xl bg-void-950 hover:bg-void-850 border border-zinc-border/80 text-zinc-400 hover:text-white transition-all flex items-center gap-2 font-mono text-xs shadow-inner ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
            title="Press ⌘K or Ctrl+K to open Command Palette"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-neon-cyan" />
              {!collapsed && <span className="text-zinc-500">Quick Jump...</span>}
            </div>
            {!collapsed && (
              <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-void-900 border border-zinc-700 text-zinc-400 font-sans">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        {/* Sidebar Navigation Items Grouped by Category */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
          {NAV_CATEGORIES.map((cat) => (
            <div key={cat.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-mono font-bold text-zinc-500 tracking-wider">
                  {cat.title}
                </div>
              )}
              {cat.items.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all duration-200 ${
                      isActive
                        ? 'bg-neon-cyan/15 text-white font-bold border border-neon-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-void-850 border border-transparent'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.name : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-neon-cyan shadow-[0_0_8px_#00F0FF]" />
                    )}
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-neon-cyan' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 flex items-center gap-1 ${
                          item.badgeColor || 'text-zinc-400 bg-void-950 border-zinc-700'
                        }`}
                      >
                        {item.ping && <span className="w-1.5 h-1.5 rounded-full bg-neon-crimson animate-ping" />}
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Attestation Status & Collapse Toggle */}
        <div className="p-3 border-t border-zinc-border/70 flex flex-col gap-2 bg-void-950/60 font-mono text-xs">
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-void-900 border border-zinc-border/80 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-neon-emerald shrink-0" />
              <div className="leading-tight overflow-hidden">
                <div className="text-[10px] font-bold text-white truncate">DEFENSE ATTESTED</div>
                <div className="text-[9px] text-zinc-500 truncate">NIST SP 800-218 Verified</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <button
              onClick={toggleCollapsed}
              className={`p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-void-850 border border-zinc-border/60 transition-colors flex items-center gap-2 ${
                collapsed ? 'w-full justify-center' : ''
              }`}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-neon-cyan" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-zinc-400" />
                  <span className="text-[11px] text-zinc-400">Collapse Bar</span>
                </>
              )}
            </button>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-zinc-400 hover:text-neon-crimson hover:bg-neon-crimson/10 border border-zinc-border/60 transition-colors"
                title="Lock Console / Sign Out"
                aria-label="Lock Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE NAVIGATION DRAWER (< lg screens)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-void-900 border-r border-zinc-border h-full flex flex-col p-4 z-10 font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-border mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan font-bold">
                  SF
                </div>
                <span className="font-heading font-black text-sm text-white">SENTINELFORGE</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {NAV_CATEGORIES.map((cat) => (
                <div key={cat.title} className="space-y-1">
                  <div className="text-[10px] text-zinc-500 font-bold px-2">{cat.title}</div>
                  {cat.items.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs ${
                          isActive
                            ? 'bg-neon-cyan/15 text-neon-cyan font-bold border border-neon-cyan/40'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-border">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-void-950 border border-zinc-border text-xs text-zinc-300 hover:text-neon-crimson flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Lock Console</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. MAIN OPERATIONS WORKSPACE WRAPPER
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Cockpit Command Header */}
        <header className="sticky top-0 z-20 w-full h-16 border-b border-zinc-border/70 bg-void-900/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
          
          {/* Left: Mobile Toggle & System Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-void-950 border border-zinc-border text-zinc-400 hover:text-white"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb Indicator */}
            <div className="flex items-center gap-2 font-mono text-xs overflow-hidden">
              <span className="text-zinc-500 hidden sm:inline">SENTINELFORGE</span>
              <span className="text-zinc-700 hidden sm:inline">/</span>
              <span className="text-zinc-400 hidden md:inline">OPS-CENTER</span>
              <span className="text-zinc-700 hidden md:inline">/</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-void-950 border border-zinc-border/80 text-white font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                <span className="truncate">{activeTitle}</span>
              </div>
            </div>
          </div>

          {/* Center: Live Telemetry Status Pills (Desktop) */}
          <div className="hidden xl:flex items-center gap-3 font-mono text-[11px]">
            <div className="px-2.5 py-1 rounded-lg bg-void-950 border border-zinc-border text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald" />
              <span>QEMU: 4 CORES ACTIVE</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-void-950 border border-zinc-border text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
              <span>FUZZ VELOCITY: 1,840/s</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-neon-crimson/10 border border-neon-crimson/30 text-neon-crimson font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-crimson animate-ping" />
              <span>1 ZERO-DAY TRIAGED</span>
            </div>
          </div>

          {/* Right: Quick Action CTAs & Operator Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            <UploadTriggerButton />

            <Link
              href="/pipeline"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-cyan text-void-950 font-mono font-bold text-xs hover:bg-neon-cyan/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Scan Hub</span>
            </Link>

            {/* Operator Clearance Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-border/70 font-mono text-xs">
              <div className="w-8 h-8 rounded-xl bg-void-950 border border-zinc-border flex items-center justify-center text-neon-cyan font-bold text-xs">
                {currentUser.initials}
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight max-w-[140px]">
                <span className="text-white font-bold text-[11px] truncate">{currentUser.name}</span>
                <span className="text-[9px] text-neon-cyan truncate">{currentUser.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-neon-crimson hover:bg-neon-crimson/10 border border-zinc-border/60 transition-colors ml-1"
                title="Lock / Sign Out"
                aria-label="Sign out operator"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </header>

        {/* Console Main Content Viewport */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
          {children}
        </main>

        {/* Global Technical Telemetry Footer Bar */}
        <footer className="border-t border-zinc-border/60 py-3 px-6 text-xs font-mono text-zinc-500 bg-void-900/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-neon-emerald" />
            <span>
              SENTINELFORGE INDUSTRIAL AUDIT KERNEL &bull; AIR-GAPPED HARDWARE EMULATION &bull; MITRE EMB3D
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>AFL++ ENGINE: ONLINE</span>
            <span>&bull;</span>
            <span>GHIDRA SYMBOLIC: SYNCED</span>
            <span>&bull;</span>
            <span className="text-neon-cyan">SOCKETS: TLS 1.3 / KYBER</span>
          </div>
        </footer>
      </div>

      {/* =========================================================================
          4. INTERACTIVE COMMAND PALETTE MODAL (⌘K / Ctrl+K)
         ========================================================================= */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
          <div
            className="fixed inset-0"
            onClick={() => setPaletteOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-void-900 border border-neon-cyan/40 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden font-mono z-10 flex flex-col">
            
            {/* Search Input Bar */}
            <div className="p-4 border-b border-zinc-border flex items-center gap-3 bg-void-950">
              <Search className="w-4 h-4 text-neon-cyan shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a module, target device, or action..."
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <kbd className="px-2 py-0.5 rounded text-[10px] bg-void-900 border border-zinc-700 text-zinc-400">
                ESC
              </kbd>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="p-3 border-b border-zinc-border/50 bg-void-950/60 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-zinc-500 uppercase text-[10px] font-bold">Fast Actions:</span>
              <button
                onClick={() => {
                  setPaletteOpen(false);
                  openUploadModal();
                }}
                className="px-2.5 py-1 rounded-lg bg-void-900 hover:bg-neon-cyan/20 border border-zinc-border hover:border-neon-cyan/50 text-zinc-300 hover:text-white transition-colors"
              >
                + Ingest Firmware
              </button>
              <button
                onClick={() => {
                  setPaletteOpen(false);
                  router.push('/war-room');
                }}
                className="px-2.5 py-1 rounded-lg bg-void-900 hover:bg-neon-crimson/20 border border-zinc-border hover:border-neon-crimson/50 text-neon-crimson transition-colors"
              >
                Enter War-Room
              </button>
              <button
                onClick={() => {
                  setPaletteOpen(false);
                  router.push('/emulator');
                }}
                className="px-2.5 py-1 rounded-lg bg-void-900 hover:bg-neon-cyan/20 border border-zinc-border hover:border-neon-cyan/50 text-neon-cyan transition-colors"
              >
                Launch MicroVM
              </button>
            </div>

            {/* Filtered Modules List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase">
                Navigation Modules
              </div>
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No modules found matching &ldquo;{paletteQuery}&rdquo;
                </div>
              ) : (
                filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.href}
                      onClick={() => {
                        setPaletteOpen(false);
                        router.push(cmd.href);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-void-800 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-neon-cyan transition-colors" />
                        <span className="font-bold">{cmd.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <span>{cmd.href}</span>
                        <ArrowUpRight className="w-3 h-3 text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Hint */}
            <div className="px-4 py-2.5 border-t border-zinc-border bg-void-950 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Use arrow keys or click to select</span>
              <span>SentinelForge Command Gateway</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
