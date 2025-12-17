'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogInteractionsProps {
  blogId: string;
  initialLikes: number;
  blogAuthorId: string;
}

export function BlogInteractions({ blogId, initialLikes, blogAuthorId }: BlogInteractionsProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [userLiked, setUserLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    // Fetch initial like/bookmark status and comments
    const fetchData = async () => {
        try {
            const [likeData, bookmarkRes, commentsData] = await Promise.all([
                api.get<{ count: number, userLiked: boolean }>(`/api/likes?blogId=${blogId}`),
                session ? api.get<{ isBookmarked: boolean }>(`/api/bookmarks?blogId=${blogId}`) : Promise.resolve({ isBookmarked: false }),
                api.get<any[]>(`/api/comments?blogId=${blogId}`)
            ]);

            setLikes(likeData.count);
            setUserLiked(likeData.userLiked);
            setIsBookmarked(bookmarkRes.isBookmarked);
            setComments(commentsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingComments(false);
        }
    };
    fetchData();
  }, [blogId, session]);

  const handleLike = async () => {
    if (!session) return;
    try {
        const isLiked = !userLiked;
        setUserLiked(isLiked);
        setLikes(prev => isLiked ? prev + 1 : prev - 1);

        const res = await api.post<{ liked: boolean }>('/api/likes', { blogId });
        setUserLiked(res.liked);
    } catch (e) {
        console.error(e);
        setUserLiked(!userLiked);
        setLikes(prev => userLiked ? prev + 1 : prev - 1);
    }
  };

  const handleBookmark = async () => {
      if (!session) return;
      try {
          const newStatus = !isBookmarked;
          setIsBookmarked(newStatus);
          const res = await api.post<{ isBookmarked: boolean }>('/api/bookmarks', { blogId });
          setIsBookmarked(res.isBookmarked);
      } catch (e) {
          console.error(e);
          setIsBookmarked(!isBookmarked);
      }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !commentText.trim()) return;

    setLoading(true);
    try {
        const newComment = await api.post('/api/comments', { blogId, content: commentText });
        setComments([newComment, ...comments]);
        setCommentText('');
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
      if (!confirm('Are you sure you want to delete this comment?')) return;
      try {
          await api.delete(`/api/comments/${commentId}`);
          setComments(comments.filter(c => c.id !== commentId));
      } catch (e) {
          console.error(e);
          alert('Failed to delete comment');
      }
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
                <button 
                    onClick={handleLike}
                    disabled={!session}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${userLiked ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={userLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    {likes}
                </button>
                
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                    {comments.length}
                </div>
            </div>

            <button 
                onClick={handleBookmark}
                disabled={!session}
                className={`text-zinc-500 hover:text-zinc-900 transition-colors ${isBookmarked ? 'text-zinc-900' : ''}`}
                title="Save to Library"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
            </button>
        </div>

        <div className="max-w-xl">
            <h3 className="text-xl font-bold mb-4">Responses</h3>
            
            {!session ? (
                <div className="bg-zinc-50 p-4 rounded-lg mb-8 text-center">
                    <Link href="/login" className="text-zinc-900 font-medium hover:underline">Sign in</Link> to like and comment.
                </div>
            ) : (
                <form onSubmit={handleComment} className="mb-8">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 min-h-[100px] resize-y mb-2"
                    />
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading || !commentText.trim()}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Respond'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {loadingComments ? (
                    <div className="text-center py-4 text-zinc-500">Loading comments...</div>
                ) : comments.map((comment) => (
                    <div key={comment.id} className="border-b border-zinc-100 pb-4 group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded-full bg-zinc-200 overflow-hidden">
                                    {comment.user?.image ? (
                                        <Image 
                                          src={comment.user.image} 
                                          alt={comment.user.name || "User"} 
                                          fill
                                          sizes="24px"
                                          className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                                            {comment.user?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium">{comment.user?.name || 'User'}</span>
                                <span className="text-xs text-zinc-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            {(session?.user?.id === comment.userId || session?.user?.role === 'ADMIN' || session?.user?.id === blogAuthorId) && (
                                <button 
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all text-xs"
                                    title="Delete comment"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                        <p className="text-zinc-700 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                ))}
                
                {!loadingComments && comments.length === 0 && (
                    <p className="text-zinc-500 text-sm italic">No comments yet.</p>
                )}
            </div>
        </div>
    </div>
  );
}
