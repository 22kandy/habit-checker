'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';
import HabitList, { Habit } from '@/components/HabitList';
import { createClient } from '@/lib/supabase/client';
import { getTodayDateString } from '@/lib/habits';
import { calculateStreak } from '@/lib/streak';

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      const today = getTodayDateString();

      // Fetch habits
      const habitsRes = await fetch('/api/habits');
      if (habitsRes.status === 401) {
        // AuthGuard will handle redirect, just return early
        return;
      }
      if (!habitsRes.ok) throw new Error('Failed to fetch habits');
      const { habits: habitsData } = await habitsRes.json();

      // Fetch today's completions
      const completionsRes = await fetch(`/api/completions?date=${today}`);
      if (completionsRes.status === 401) {
        // AuthGuard will handle redirect, just return early
        return;
      }
      if (!completionsRes.ok) throw new Error('Failed to fetch completions');
      const { completions } = await completionsRes.json();

      const completedHabitIds = new Set(
        completions.map((c: { habit_id: string }) => c.habit_id)
      );

      // Fetch all completions for streak calculation
      const allCompletionsRes = await fetch('/api/completions');
      if (allCompletionsRes.status === 401) {
        // AuthGuard will handle redirect, just return early
        return;
      }
      if (!allCompletionsRes.ok)
        throw new Error('Failed to fetch all completions');
      const { completions: allCompletions } = await allCompletionsRes.json();

      // Group completions by habit_id
      const completionsByHabit: Record<
        string,
        Array<{ completion_date: string }>
      > = {};
      for (const completion of allCompletions) {
        if (!completionsByHabit[completion.habit_id]) {
          completionsByHabit[completion.habit_id] = [];
        }
        completionsByHabit[completion.habit_id].push({
          completion_date: completion.completion_date,
        });
      }

      // Build habits with completion status and streaks
      const habitsWithStatus: Habit[] = habitsData.map((habit: any) => {
        const completed = completedHabitIds.has(habit.id);
        const habitCompletions = completionsByHabit[habit.id] || [];
        const streak = calculateStreak(habitCompletions);

        return {
          id: habit.id,
          name: habit.name,
          completed,
          streak,
        };
      });

      setHabits(habitsWithStatus);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (habitId: string, completed: boolean) => {
    try {
      const today = getTodayDateString();

      if (completed) {
        // Add completion
        const res = await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habit_id: habitId,
            completion_date: today,
          }),
        });

        if (!res.ok) throw new Error('Failed to add completion');
      } else {
        // Remove completion
        const res = await fetch(
          `/api/completions?habit_id=${habitId}&date=${today}`,
          {
            method: 'DELETE',
          }
        );

        if (!res.ok) throw new Error('Failed to remove completion');
      }

      // Reload habits to update streaks
      await loadHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
      throw error;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Today&apos;s Habits
            </h1>
            <p className="mt-2 text-gray-600">
              Check off your habits as you complete them today
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading habits...</p>
            </div>
          ) : (
            <HabitList habits={habits} onToggle={handleToggle} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

