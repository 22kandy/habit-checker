import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          console.log('[DEBUG getAll CALLED] - Supabase SSR is reading cookies');
          const allCookies = cookieStore.getAll();
          console.log('[Server Supabase Client] Reading cookies:', {
            count: allCookies.length,
            names: allCookies.map(c => c.name),
          });
          return allCookies;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
            console.log('[Server Supabase Client] Set cookies:', {
              count: cookiesToSet.length,
              names: cookiesToSet.map(c => c.name),
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
            console.warn('[Server Supabase Client] Could not set cookies (expected in some contexts):', error);
          }
        },
      },
    }
  );
}

