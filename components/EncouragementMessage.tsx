'use client';

import { useEffect, useState } from 'react';

interface EncouragementMessageProps {
  message: string;
  onClose?: () => void;
  duration?: number;
}

export default function EncouragementMessage({
  message,
  onClose,
  duration = 3000,
}: EncouragementMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for fade out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎉</span>
        <p className="font-semibold">{message}</p>
      </div>
    </div>
  );
}

