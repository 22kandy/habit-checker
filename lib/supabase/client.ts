import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  // createBrowserClient handles cookies automatically
  return createBrowserClient(url, anonKey);
}

