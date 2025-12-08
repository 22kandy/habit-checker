'use client';

import { useState, FormEvent } from 'react';
import { validateHabitName } from '@/lib/habits';

interface AddHabitFormProps {
  onAdd: (name: string) => Promise<void>;
}

export default function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateHabitName(name);
    if (!validation.valid) {
      setError(validation.error || 'Invalid habit name');
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(name.trim());
      setName('');
    } catch (err) {
      setError('Failed to add habit. Please try again.');
      console.error('Error adding habit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a new habit (e.g., Drink water, Meditate)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}

