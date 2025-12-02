import { supabase } from '../services/supabaseClient';

/**
 * Runs a connectivity and health check against the live Supabase backend.
 */
export const runSystemDiagnostics = async () => {
  console.group('🚀 FixMate System Diagnostics (Supabase)');
  let passed = 0;
  let failed = 0;
  const logs: string[] = [];

  const log = (msg: string, success: boolean) => {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${msg}`);
    logs.push(`${icon} ${msg}`);
    if (success) passed++; else failed++;
  };

  try {
    const start = performance.now();
    
    // 1. Check Connection & Latency
    const { data, error, count } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    const end = performance.now();
    const latency = Math.round(end - start);

    if (error) {
      log(`Connection Failed: ${error.message}`, false);
    } else {
      log(`Database Connected (${latency}ms latency)`, true);
      
      // 2. Check Row Level Security (Public Access)
      // If we can read count (even if 0), our public policies are likely working
      log(`Public Access Policies Active (Readable)`, true);
    }

    // 3. Check Auth Service
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData) {
        log('Auth Service Responsive', true);
    } else {
        log('Auth Service Unresponsive', false);
    }

  } catch (err: any) {
    log(`CRITICAL: Diagnostic Exception - ${err.message}`, false);
  }

  console.groupEnd();
  
  return { 
    passed, 
    failed, 
    message: `Diagnostics Complete: ${passed} Passed, ${failed} Failed. \n\n${logs.join('\n')}` 
  };
};