/**
 * SentinelForge Cyber-Ops Design System Tokens & Constants
 */

export const THEME_COLORS = {
  bg: {
    primary: '#06090e',
    secondary: '#0c111a',
    card: '#101726',
    cardBorder: 'rgba(56, 189, 248, 0.15)',
    cardHover: 'rgba(56, 189, 248, 0.25)'
  },
  accent: {
    cyan: '#00f5d4',
    violet: '#7b2cbf',
    purple: '#a855f7',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#ff3366',
    blue: '#38bdf8'
  },
  severity: {
    CRITICAL: {
      color: '#ff3366',
      badgeBg: 'rgba(255, 51, 102, 0.15)',
      badgeBorder: 'rgba(255, 51, 102, 0.4)'
    },
    HIGH: {
      color: '#f97316',
      badgeBg: 'rgba(249, 115, 22, 0.15)',
      badgeBorder: 'rgba(249, 115, 22, 0.4)'
    },
    MEDIUM: {
      color: '#eab308',
      badgeBg: 'rgba(234, 179, 8, 0.15)',
      badgeBorder: 'rgba(234, 179, 8, 0.4)'
    },
    LOW: {
      color: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeBorder: 'rgba(56, 189, 248, 0.4)'
    },
    INFORMATIONAL: {
      color: '#94a3b8',
      badgeBg: 'rgba(148, 163, 184, 0.15)',
      badgeBorder: 'rgba(148, 163, 184, 0.4)'
    }
  },
  ssvc: {
    ACT: {
      label: 'Act (Immediate)',
      color: '#ff3366',
      bg: 'rgba(255, 51, 102, 0.2)'
    },
    ATTEND: {
      label: 'Attend (Rapid)',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.2)'
    },
    TRACK_STAR: {
      label: 'Track*',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.2)'
    },
    TRACK: {
      label: 'Track',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.2)'
    }
  }
};

export function getSeverityStyle(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL') {
  return THEME_COLORS.severity[severity] || THEME_COLORS.severity.INFORMATIONAL;
}

export function getSSVCStyle(decision: 'TRACK' | 'TRACK_STAR' | 'ATTEND' | 'ACT') {
  return THEME_COLORS.ssvc[decision] || THEME_COLORS.ssvc.TRACK;
}
