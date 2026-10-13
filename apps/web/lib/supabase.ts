import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-sentinelforge.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-sentinelforge';

/**
 * Supabase Client Instance
 * Configured for instant PostgreSQL queries, real-time database subscriptions, and OAuth/Password Auth.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LocalUserAccount {
  email: string;
  passwordHash: string;
  name: string;
  organization: string;
  role: string;
  createdAt: string;
}

// In-Memory store as cache & SSR fallback
const MEMORY_ACCOUNTS: Record<string, LocalUserAccount> = {
  'security-lead@sentinelforge.internal': {
    email: 'security-lead@sentinelforge.internal',
    passwordHash: 'Sentinel#2026!KyberPQC$',
    name: 'Dr. Elena Vance',
    organization: 'SentinelForge CyberOps Lab',
    role: 'OFFENSIVE_SECURITY_ARCHITECT',
    createdAt: '2026-01-01T00:00:00Z'
  },
  'admin@sentinelforge.internal': {
    email: 'admin@sentinelforge.internal',
    passwordHash: 'Admin#Sentinel2026!',
    name: 'Operations Administrator',
    organization: 'SentinelForge CyberOps Lab',
    role: 'ADMIN',
    createdAt: '2026-01-01T00:00:00Z'
  },
  'analyst@sentinelforge.internal': {
    email: 'analyst@sentinelforge.internal',
    passwordHash: 'Analyst#Pass2026!',
    name: 'Cyber Threat Analyst',
    organization: 'Sovereign Incident Response',
    role: 'DEFENSE_ANALYST',
    createdAt: '2026-01-01T00:00:00Z'
  }
};

/**
 * Retrieve all registered accounts from localStorage + default store
 */
function getStoredAccounts(): Record<string, LocalUserAccount> {
  const accounts = { ...MEMORY_ACCOUNTS };
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('sentinelforge_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(accounts, parsed);
      }
    } catch (e) {
      console.warn('Failed to parse local accounts:', e);
    }
  }
  return accounts;
}

/**
 * Persist an account to localStorage
 */
function saveStoredAccount(account: LocalUserAccount) {
  MEMORY_ACCOUNTS[account.email] = account;
  if (typeof window !== 'undefined') {
    try {
      const accounts = getStoredAccounts();
      accounts[account.email] = account;
      localStorage.setItem('sentinelforge_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to save account to localStorage:', e);
    }
  }
}

/**
 * Sign In with Email and Password
 */
export async function signInWithEmailPassword(email: string, pass: string) {
  const isPlaceholderUrl =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-sentinelforge') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

  // If connected to a real live configured Supabase instance, authenticate against it
  if (!isPlaceholderUrl) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        return { data: null, error };
      }
      if (typeof document !== 'undefined') {
        document.cookie = `sentinelforge_session=${data.session?.access_token || 'authenticated'}; path=/; max-age=86400; SameSite=Lax`;
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  // Local Sovereign Identity Authentication
  const accounts = getStoredAccounts();
  const matched = accounts[email.trim().toLowerCase()];

  if (matched && matched.passwordHash === pass) {
    if (typeof document !== 'undefined') {
      document.cookie = 'sentinelforge_session=sentinelforge_authenticated_session_token; path=/; max-age=86400; SameSite=Lax';
      try {
        localStorage.setItem(
          'sentinelforge_current_user',
          JSON.stringify({
            id: `usr_${matched.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email: matched.email,
            name: matched.name,
            role: matched.role,
            organization: matched.organization
          })
        );
      } catch (e) {}
    }

    return {
      data: {
        user: {
          id: `usr_${matched.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: matched.email,
          user_metadata: {
            role: matched.role,
            name: matched.name,
            organization: matched.organization
          }
        },
        session: { access_token: 'sec_token_kyber1024_auth' }
      },
      error: null
    };
  }

  return {
    data: null,
    error: new Error(
      matched
        ? 'Access Denied: Invalid passphrase for this operator account.'
        : 'Access Denied: Account not recognized. Please sign up or use preconfigured test credentials.'
    )
  };
}

/**
 * Sign Up with Email and Password
 */
export async function signUpWithEmailPassword(email: string, pass: string, metadata?: any) {
  if (pass.length < 8) {
    return {
      data: null,
      error: new Error('Passphrase does not meet NIST SP 800-63B standards (minimum 8 characters required).')
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const isPlaceholderUrl =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-sentinelforge') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

  if (!isPlaceholderUrl) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: metadata }
      });
      if (error) return { data: null, error };
      if (typeof document !== 'undefined') {
        document.cookie = `sentinelforge_session=${data.session?.access_token || 'authenticated'}; path=/; max-age=86400; SameSite=Lax`;
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  // Register into local sovereign store
  const newAccount: LocalUserAccount = {
    email: cleanEmail,
    passwordHash: pass,
    name: metadata?.name || 'Authorized Field Operator',
    organization: metadata?.organization || 'National Cyber Defense Command',
    role: metadata?.role || 'DEFENSE_ANALYST',
    createdAt: new Date().toISOString()
  };

  saveStoredAccount(newAccount);

  if (typeof document !== 'undefined') {
    document.cookie = 'sentinelforge_session=sentinelforge_authenticated_session_token; path=/; max-age=86400; SameSite=Lax';
    try {
      localStorage.setItem(
        'sentinelforge_current_user',
        JSON.stringify({
          id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: newAccount.email,
          name: newAccount.name,
          role: newAccount.role,
          organization: newAccount.organization
        })
      );
    } catch (e) {}
  }

  return {
    data: {
      user: {
        id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: cleanEmail,
        user_metadata: {
          name: newAccount.name,
          role: newAccount.role,
          organization: newAccount.organization
        }
      },
      session: { access_token: 'sec_token_kyber1024_new' }
    },
    error: null
  };
}

/**
 * Sign Out
 */
export async function signOutUser() {
  if (typeof document !== 'undefined') {
    document.cookie = 'sentinelforge_session=; path=/; max-age=0; SameSite=Lax';
    try {
      localStorage.removeItem('sentinelforge_current_user');
    } catch (e) {}
  }
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // Ignore signOut errors
  }
}

/**
 * Federated SSO OAuth Provider
 */
export async function signInWithOAuthProvider(provider: 'github' | 'google') {
  const isPlaceholderUrl =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-sentinelforge') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

  if (!isPlaceholderUrl) {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
      }
    });
  }

  // Instant Federated Demo SSO for local / staging evaluation
  if (typeof document !== 'undefined') {
    document.cookie = 'sentinelforge_session=sentinelforge_authenticated_session_token; path=/; max-age=86400; SameSite=Lax';
    try {
      localStorage.setItem(
        'sentinelforge_current_user',
        JSON.stringify({
          id: `usr_${provider}_sso_operator`,
          email: `sso-operator@${provider}.internal`,
          name: provider === 'github' ? 'GitHub Cyber Security Engineer' : 'Google Cloud Security Architect',
          role: 'OFFENSIVE_SECURITY_ARCHITECT',
          organization: 'Sovereign Zero-Day Alliance'
        })
      );
    } catch (e) {}
    window.location.href = '/dashboard';
  }
}
