'use client';

import HabitItem from './HabitItem';

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
}

interface HabitListProps {
  habits: Habit[];
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
}

export default function HabitList({ habits, onToggle }: HabitListProps) {
  const completedCount = habits.filter((h) => h.completed).length;
  const remainingCount = habits.length - completedCount;

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No habits yet. Add your first habit to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          id={habit.id}
          name={habit.name}
          completed={habit.completed}
          streak={habit.streak}
          onToggle={onToggle}
          remainingCount={
            habit.completed ? remainingCount : remainingCount - 1
          }
        />
      ))}
      {completedCount > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {completedCount} of {habits.length} completed today
        </div>
      )}
    </div>
  );
}

