import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './lib/supabase/env';

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Clone request headers (they are immutable)
          const requestHeaders = new Headers(request.headers);
          
          // Build updated cookie header for Supabase session refresh logic
          const updatedCookies = new Map<string, string>();
          
          // Preserve existing cookies
          request.cookies.getAll().forEach((cookie) => {
            updatedCookies.set(cookie.name, cookie.value);
          });
          
          // Add/update new cookies
          cookiesToSet.forEach(({ name, value }) => {
            updatedCookies.set(name, value);
          });
          
          // Update cloned headers with merged cookie values
          const cookieHeader = Array.from(updatedCookies.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
          requestHeaders.set('cookie', cookieHeader);
          
          // Create response with modified headers
          // Next.js merges the headers with the original request, preserving
          // URL, method, body, and all other request properties
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          
          // Set cookies on response with proper options (secure, httpOnly, etc.)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
