/**
 * Validates Supabase environment variables and provides helpful error messages
 */

function validateSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === 'your_supabase_project_url' || !url.startsWith('http')) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: "${url}". ` +
      `Please set a valid Supabase project URL in your .env.local file. ` +
      `Get your URL from: https://supabase.com/dashboard/project/_/settings/api`
    );
  }

  if (!anonKey || anonKey === 'your_supabase_anon_key' || anonKey.length < 20) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY: The key appears to be missing or invalid. ` +
      `Please set a valid Supabase anon key in your .env.local file. ` +
      `Get your key from: https://supabase.com/dashboard/project/_/settings/api`
    );
  }

  return { url, anonKey };
}

export function getSupabaseEnv() {
  return validateSupabaseEnv();
}

