import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './lib/supabase/env';

export default async function proxy(request: NextRequest) {
  console.log('[Middleware] Request URL:', request.url);
  console.log('[Middleware] Cookies received:', request.cookies.getAll().map(c => ({ name: c.name, valueLength: c.value?.length })));
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:getAll',message:'Middleware getAll() called',data:{count:cookies.length,names:cookies.map(c=>c.name),valueLengths:cookies.map(c=>c.value?.length),firstValuePreview:cookies[0]?.value?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
          // #endregion
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log('[Middleware] setAll() called with', cookiesToSet.length, 'cookies:', 
            cookiesToSet.map(c => ({ name: c.name, hasValue: !!c.value })));
          
          // Set cookies on response with proper attributes
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = {
              ...options,
              sameSite: 'lax' as const,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: options?.httpOnly ?? false,
              path: options?.path ?? '/',
            };
            response.cookies.set(name, value, cookieOptions);
          });
        },
      },
    }
  );

  // Refresh session - this will update cookies if session is refreshed
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:getSession',message:'Middleware calling getSession()',data:{url:request.url,cookieCount:request.cookies.getAll().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  const { data: { session } } = await supabase.auth.getSession();
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:getSession',message:'Middleware getSession() result',data:{hasSession:!!session,userId:session?.user?.id,responseCookieCount:response.cookies.getAll().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  console.log('[Middleware] getSession() result:', { 
    hasSession: !!session, 
    userId: session?.user?.id,
    cookieCount: response.cookies.getAll().length,
  });

  return response;
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
