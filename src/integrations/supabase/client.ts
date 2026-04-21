import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oqfbunldiynmfyfvirwv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZmJ1bmxkaXlubWZ5ZnZpcnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzExNzIsImV4cCI6MjA5MTUwNzE3Mn0.RRArLY_S8kPUhvQvVog6fMhCCauX7pVuXhmAtLV-2m4";

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        lock: (name, acquireTimeout, fn) => {
          // Usa lock nativo do browser quando disponível
          if (typeof navigator !== 'undefined' && navigator.locks) {
            return navigator.locks.request(name, { ifAvailable: false }, fn)
          }
          // Fallback sem lock para evitar conflitos
          return fn()
        }
      },
    });
  }
  return supabaseInstance;
})();