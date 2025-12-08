'use client';

import { useState } from 'react';
import StreakDisplay from './StreakDisplay';
import EncouragementMessage from './EncouragementMessage';
import { getEncouragementMessage, getNextHabitMessage } from '@/lib/encouragement';

interface HabitItemProps {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
  remainingCount: number;
}

export default function HabitItem({
  id,
  name,
  completed,
  streak,
  onToggle,
  remainingCount,
}: HabitItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onToggle(id, !completed);
      
      if (!completed) {
        // Show encouragement when checking off
        const encouragement = getEncouragementMessage(streak + 1);
        setMessage(encouragement);
        setShowMessage(true);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showMessage && (
        <EncouragementMessage
          message={message}
          onClose={() => setShowMessage(false)}
        />
      )}
      <div
        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
          completed
            ? 'bg-green-50 border-green-200'
            : 'bg-white border-gray-200 hover:border-gray-300'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggle}
            disabled={isLoading}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <label
              className={`text-lg font-medium ${
                completed ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {name}
            </label>
            {streak > 0 && (
              <div className="mt-1">
                <StreakDisplay streak={streak} />
              </div>
            )}
          </div>
        </div>
        {!completed && remainingCount > 0 && (
          <div className="text-sm text-gray-500">
            {getNextHabitMessage(remainingCount)}
          </div>
        )}
      </div>
    </>
  );
}

