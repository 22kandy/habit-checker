import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodayDateString } from '@/lib/habits';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getTodayDateString();
    const habitId = searchParams.get('habit_id');

    let query = supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('completion_date', date);

    if (habitId) {
      query = query.eq('habit_id', habitId);
    }

    const { data: completions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ completions });
  } catch (error) {
    console.error('Error fetching completions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habit_id, completion_date } = await request.json();

    if (!habit_id) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
        { status: 400 }
      );
    }

    const date = completion_date || getTodayDateString();

    // Verify habit belongs to user
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('id')
      .eq('id', habit_id)
      .eq('user_id', user.id)
      .single();

    if (habitError || !habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    const { data: completion, error } = await supabase
      .from('habit_completions')
      .insert({
        habit_id,
        user_id: user.id,
        completion_date: date,
      })
      .select()
      .single();

    if (error) {
      // If it's a unique constraint error, the completion already exists
      if (error.code === '23505') {
        return NextResponse.json({ completion: null, alreadyExists: true });
      }
      throw error;
    }

    return NextResponse.json({ completion });
  } catch (error) {
    console.error('Error creating completion:', error);
    return NextResponse.json(
      { error: 'Failed to create completion' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habit_id');
    const date = searchParams.get('date') || getTodayDateString();

    if (!habitId) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .eq('completion_date', date);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting completion:', error);
    return NextResponse.json(
      { error: 'Failed to delete completion' },
      { status: 500 }
    );
  }
}

