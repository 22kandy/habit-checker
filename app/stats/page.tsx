'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';
import StreakDisplay from '@/components/StreakDisplay';

interface Habit {
  id: string;
  name: string;
}

interface StreakData {
  [habitId: string]: number;
}

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<StreakData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Fetch habits
      const habitsRes = await fetch('/api/habits');
      if (!habitsRes.ok) throw new Error('Failed to fetch habits');
      const { habits: habitsData } = await habitsRes.json();

      // Fetch streaks
      const streaksRes = await fetch('/api/streaks');
      if (!streaksRes.ok) throw new Error('Failed to fetch streaks');
      const { streaks: streaksData } = await streaksRes.json();

      setHabits(habitsData);
      setStreaks(streaksData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalStreaks = Object.values(streaks).reduce((sum, streak) => sum + streak, 0);
  const averageStreak =
    habits.length > 0 ? totalStreaks / habits.length : 0;
  const longestStreak = Math.max(...Object.values(streaks), 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
            <p className="mt-2 text-gray-600">
              View your habit streaks and progress
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading statistics...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-500 mb-1">Total Habits</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {habits.length}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-500 mb-1">
                    Average Streak
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {averageStreak.toFixed(1)} days
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-sm text-gray-500 mb-1">
                    Longest Streak
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {longestStreak} days
                  </div>
                </div>
              </div>

              {/* Individual Habit Streaks */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Habit Streaks
                </h2>
                {habits.length === 0 ? (
                  <p className="text-gray-500">
                    No habits yet. Add some habits to start tracking!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {habits.map((habit) => {
                      const streak = streaks[habit.id] || 0;
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-lg font-medium text-gray-900">
                            {habit.name}
                          </span>
                          <StreakDisplay streak={streak} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

