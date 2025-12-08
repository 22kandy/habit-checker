'use client';

interface StreakDisplayProps {
  streak: number;
  className?: string;
}

export default function StreakDisplay({ streak, className = '' }: StreakDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-2xl">🔥</span>
      <span className="font-semibold text-gray-700">
        {streak} {streak === 1 ? 'day' : 'days'} streak
      </span>
    </div>
  );
}

