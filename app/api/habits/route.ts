import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    console.log('[API GET /api/habits] Request received');
    
    // Log cookie presence for debugging
    const cookieStore = await cookies();
    const cookieNames = cookieStore.getAll().map(c => c.name);
    console.log('[API GET /api/habits] Cookies available:', {
      count: cookieNames.length,
      names: cookieNames,
    });
    
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    const user = session?.user;
    const authError = sessionError || (!session ? { message: 'No session found', status: 401 } : null);
    
    console.log('[API GET /api/habits] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      error: authError?.message,
      errorCode: authError?.status,
    });

    if (authError || !user) {
      console.error('[API GET /api/habits] Authentication failed:', {
        error: authError?.message,
        errorCode: authError?.status,
        hasCookies: cookieNames.length > 0,
        cookieNames,
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: authError?.message || 'Authentication required. Please log in.',
        },
        { status: 401 }
      );
    }

    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ habits });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API POST /api/habits] Request received');
    
    // Log cookie presence for debugging
    const cookieStore = await cookies();
    const cookieNames = cookieStore.getAll().map(c => c.name);
    console.log('[API POST /api/habits] Cookies available:', {
      count: cookieNames.length,
      names: cookieNames,
    });
    
    const supabase = await createClient();
    // #region agent log
    const cookieStore2 = await cookies();
    const cookiesBeforeGetSession = cookieStore2.getAll();
    fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/habits/route.ts:POST',message:'Before getSession() call',data:{cookieCount:cookiesBeforeGetSession.length,cookieNames:cookiesBeforeGetSession.map(c=>c.name),cookieValuePreview:cookiesBeforeGetSession.find(c=>c.name.includes('auth'))?.value?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    const user = session?.user;
    const authError = sessionError || (!session ? { message: 'No session found', status: 401 } : null);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/habits/route.ts:POST',message:'After getSession() call',data:{hasSession:!!session,hasUser:!!user,userId:user?.id,error:authError?.message,errorStatus:authError?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    console.log('[API POST /api/habits] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      error: authError?.message,
      errorCode: authError?.status,
    });

    if (authError || !user) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/habits/route.ts:POST',message:'Returning 401 error response',data:{error:authError?.message,errorCode:authError?.status,hasCookies:cookieNames.length>0},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      console.error('[API POST /api/habits] Authentication failed:', {
        error: authError?.message,
        errorCode: authError?.status,
        hasCookies: cookieNames.length > 0,
        cookieNames,
      });
      const errorResponse = { 
        error: 'Unauthorized',
        message: authError?.message || 'Authentication required. Please log in.',
      };
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/habits/route.ts:POST',message:'Error response payload',data:{errorResponse},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Habit name is required' },
        { status: 400 }
      );
    }

    const { data: habit, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: name.trim(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('[API DELETE /api/habits] Request received');
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    const user = session?.user;
    const authError = sessionError || (!session ? { message: 'No session found', status: 401 } : null);

    if (authError || !user) {
      console.error('[API DELETE /api/habits] Authentication failed:', {
        error: authError?.message,
        errorCode: authError?.status,
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: authError?.message || 'Authentication required. Please log in.',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('[API PATCH /api/habits] Request received');
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    const user = session?.user;
    const authError = sessionError || (!session ? { message: 'No session found', status: 401 } : null);

    if (authError || !user) {
      console.error('[API PATCH /api/habits] Authentication failed:', {
        error: authError?.message,
        errorCode: authError?.status,
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: authError?.message || 'Authentication required. Please log in.',
        },
        { status: 401 }
      );
    }

    const { id, name } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Habit name is required' },
        { status: 400 }
      );
    }

    const { data: habit, error } = await supabase
      .from('habits')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}

