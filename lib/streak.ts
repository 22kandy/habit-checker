import { format, subDays, isSameDay, parseISO } from 'date-fns';

export interface Completion {
  completion_date: string; // ISO date string
}

/**
 * Calculate consecutive day streak for a habit
 * @param completions Array of completion dates (sorted descending by date)
 * @param today Today's date (defaults to current date)
 * @returns Number of consecutive days streak
 */
export function calculateStreak(
  completions: Completion[],
  today: Date = new Date()
): number {
  if (completions.length === 0) return 0;

  // Sort completions by date descending (most recent first)
  const sortedCompletions = [...completions].sort(
    (a, b) =>
      new Date(b.completion_date).getTime() -
      new Date(a.completion_date).getTime()
  );

  // Check if today is completed
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayCompleted = sortedCompletions[0]?.completion_date === todayStr;

  let streak = 0;
  let currentDate = todayCompleted ? today : subDays(today, 1);

  for (const completion of sortedCompletions) {
    const completionDate = parseISO(completion.completion_date);
    const expectedDateStr = format(currentDate, 'yyyy-MM-dd');
    const completionDateStr = format(completionDate, 'yyyy-MM-dd');

    if (completionDateStr === expectedDateStr) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else if (completionDate < currentDate) {
      // Gap found, streak breaks
      break;
    }
    // If completion is in the future, skip it
  }

  return streak;
}

/**
 * Check if a habit was completed on a specific date
 */
export function isCompletedOnDate(
  completions: Completion[],
  date: Date
): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return completions.some((c) => c.completion_date === dateStr);
}

