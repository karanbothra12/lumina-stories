'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useSession } from 'next-auth/react';

export function HistoryTracker({ blogId }: { blogId: string }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      // Small delay to ensure not just a bounce? 
      // Or immediate. Immediate is fine for "visited".
      api.post('/api/history', { blogId }).catch(console.error);
    }
  }, [blogId, session]);

  return null;
}

