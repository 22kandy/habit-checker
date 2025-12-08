import { format } from 'date-fns';

/**
 * Format a date to YYYY-MM-DD format for database storage
 */
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return formatDateForDB(new Date());
}

/**
 * Validate habit name
 */
export function validateHabitName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Habit name cannot be empty' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Habit name must be 100 characters or less' };
  }
  
  return { valid: true };
}

