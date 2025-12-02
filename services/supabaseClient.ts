import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, Node, Browser)
const getEnv = (key: string) => {
  let value = undefined;
  
  // 1. Try Vite's import.meta.env
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      value = (import.meta as any).env[key];
    }
  } catch (e) {}

  // 2. Try process.env (Node/Polyfill)
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase Environment Variables! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file or hosting configuration.");
}

// Initialize Supabase. If keys are missing, we provide placeholders to prevent the app from crashing immediately on load.
// API calls will fail gracefully instead of a blank screen.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);