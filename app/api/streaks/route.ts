import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateStreak } from '@/lib/streak';

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
    const habitId = searchParams.get('habit_id');

    // Get all completions for the user (or specific habit)
    let completionsQuery = supabase
      .from('habit_completions')
      .select('habit_id, completion_date')
      .eq('user_id', user.id)
      .order('completion_date', { ascending: false });

    if (habitId) {
      completionsQuery = completionsQuery.eq('habit_id', habitId);
    }

    const { data: completions, error } = await completionsQuery;

    if (error) {
      throw error;
    }

    if (!completions || completions.length === 0) {
      return NextResponse.json({ streaks: {} });
    }

    // Group completions by habit_id
    const completionsByHabit: Record<string, Array<{ completion_date: string }>> = {};
    for (const completion of completions) {
      if (!completionsByHabit[completion.habit_id]) {
        completionsByHabit[completion.habit_id] = [];
      }
      completionsByHabit[completion.habit_id].push({
        completion_date: completion.completion_date,
      });
    }

    // Calculate streak for each habit
    const streaks: Record<string, number> = {};
    for (const [habitId, habitCompletions] of Object.entries(completionsByHabit)) {
      streaks[habitId] = calculateStreak(habitCompletions);
    }

    return NextResponse.json({ streaks });
  } catch (error) {
    console.error('Error calculating streaks:', error);
    return NextResponse.json(
      { error: 'Failed to calculate streaks' },
      { status: 500 }
    );
  }
}

