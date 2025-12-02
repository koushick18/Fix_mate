import { createClient } from '@supabase/supabase-js';

const DEMO_MODE_KEY = 'FIXMATE_DEMO_MODE_OVERRIDE';

// Helper to safely access environment variables
const getEnv = (key: string) => {
  let value = undefined;
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      value = (import.meta as any).env[key];
    }
  } catch (e) {}
  if (!value) {
    try {
      const globalAny = globalThis as any;
      if (globalAny.process && globalAny.process.env) {
        value = globalAny.process.env[key];
      }
    } catch (e) {}
  }
  return value || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Check if user has manually forced demo mode
const isDemoOverride = localStorage.getItem(DEMO_MODE_KEY) === 'true';

export const isSupabaseConfigured = 
  !isDemoOverride &&
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder');

export const setDemoMode = (enabled: boolean) => {
  if (enabled) {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
  } else {
    localStorage.removeItem(DEMO_MODE_KEY);
  }
  // Reload to apply changes
  window.location.reload();
};

if (!isSupabaseConfigured) {
  console.warn("FixMate: Running in Demo Mode.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);