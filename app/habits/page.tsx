'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';
import AddHabitForm from '@/components/AddHabitForm';

interface Habit {
  id: string;
  name: string;
  created_at: string;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/habits', {
        credentials: 'include',
      });
      if (res.status === 401) {
        console.warn('[Habits Page] Unauthorized - AuthGuard will handle redirect');
        // AuthGuard will handle redirect, just return early
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to fetch habits';
        console.error('Error loading habits:', {
          status: res.status,
          statusText: res.statusText,
          error: errorMessage,
        });
        throw new Error(errorMessage);
      }
      const { habits: habitsData } = await res.json();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (name: string) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        // #region agent log
        const responseText = await res.text().catch(() => '');
        fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/habits/page.tsx:handleAdd',message:'API error response received',data:{status:res.status,statusText:res.statusText,responseText:responseText.substring(0,200),contentType:res.headers.get('content-type')},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        let errorData: { message?: string; error?: string } = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          // #region agent log
          const parseError = e instanceof Error ? e.message : String(e);
          fetch('http://127.0.0.1:7244/ingest/e52713a9-07de-4743-ba22-4d27ab2cc1c1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/habits/page.tsx:handleAdd',message:'Failed to parse error response as JSON',data:{parseError,responseText:responseText.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
        }
        const errorMessage = errorData.message || errorData.error || 'Failed to add habit';
        console.error('Error adding habit:', {
          status: res.status,
          statusText: res.statusText,
          error: errorMessage,
          errorData,
        });
        throw new Error(errorMessage);
      }
      await loadHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      const res = await fetch(`/api/habits?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete habit');
      await loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const res = await fetch('/api/habits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: editingId, name: editName }),
      });

      if (!res.ok) throw new Error('Failed to update habit');
      await loadHabits();
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('Failed to update habit. Please try again.');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Habits</h1>
            <p className="mt-2 text-gray-600">
              Add, edit, or delete your habits
            </p>
          </div>

          <AddHabitForm onAdd={handleAdd} />

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading habits...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No habits yet. Add your first habit above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  {editingId === habit.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-lg font-medium text-gray-900">
                        {habit.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(habit)}
                          className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(habit.id)}
                          className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

