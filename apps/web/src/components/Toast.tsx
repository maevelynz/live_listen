'use client';

import { useEffect } from 'react';

export function Toast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-black/10 bg-white/90 p-3 text-sm shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="text-gray-900">{message}</div>
        <button
          onClick={onClose}
          className="rounded px-2 py-1 text-gray-600 hover:bg-black/5"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

