'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { BlogFeed } from '@/app/components/BlogFeed';

export function LibraryView() {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'saved') {
                const res = await api.get<any>('/api/bookmarks?limit=20');
                // Transform bookmark structure to blog structure expected by BlogFeed
                const blogs = res.bookmarks.map((b: any) => b.blog);
                setData(blogs);
            } else {
                const res = await api.get<any>('/api/history?limit=20');
                // Transform history structure to blog structure
                const blogs = res.history.map((h: any) => h.blog);
                setData(blogs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div>
        <div className="flex items-center gap-8 border-b border-zinc-200 mb-8">
            <button 
                onClick={() => setActiveTab('saved')}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'saved' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
                Saved lists
                {activeTab === 'saved' && (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900"></div>
                )}
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
                History
                {activeTab === 'history' && (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900"></div>
                )}
            </button>
        </div>

        {loading ? (
            <div className="py-20 text-center text-zinc-500">Loading...</div>
        ) : (
            <>
                {data.length === 0 ? (
                    <div className="py-20 text-center text-zinc-500 bg-zinc-50 rounded-lg">
                        {activeTab === 'saved' ? 'No saved stories yet.' : 'No reading history yet.'}
                    </div>
                ) : (
                    <BlogFeed initialBlogs={data} initialHasMore={false} />
                )}
            </>
        )}
    </div>
  );
}

