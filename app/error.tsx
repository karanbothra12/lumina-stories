'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: number };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <h2 className="text-2xl font-bold text-zinc-900 mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

