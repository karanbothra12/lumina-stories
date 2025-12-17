import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogInteractions } from '../BlogInteractions';
import { api } from '@/lib/api-client';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Session
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe('BlogInteractions Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial state', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    
    // Mock initial fetch calls
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/likes')) return Promise.resolve({ count: 10, userLiked: false });
      if (url.includes('/api/bookmarks')) return Promise.resolve({ isBookmarked: false });
      if (url.includes('/api/comments')) return Promise.resolve([]);
      return Promise.resolve({});
    });

    render(<BlogInteractions blogId="123" initialLikes={10} blogAuthorId="author-1" />);

    // Wait for likes to settle
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(screen.getByText('Responses')).toBeInTheDocument();
  });

  it('optimistically updates likes when clicked', async () => {
    // Authenticated User
    mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1', name: 'Tester' } }, 
      status: 'authenticated' 
    });

    // Mock responses
    (api.get as any).mockResolvedValueOnce({ count: 10, userLiked: false }); // Likes
    (api.get as any).mockResolvedValueOnce({ isBookmarked: false }); // Bookmarks
    (api.get as any).mockResolvedValueOnce([]); // Comments
    
    // Mock Like POST
    (api.post as any).mockResolvedValue({ liked: true });

    render(<BlogInteractions blogId="123" initialLikes={10} blogAuthorId="author-1" />);

    // Find like button (it has the like count inside or near it)
    const likeBtn = await screen.findByRole('button', { name: /10/i }); // Regex matches "10" text inside button
    
    // Click Like
    fireEvent.click(likeBtn);

    // Expect Optimistic Update (10 -> 11)
    await waitFor(() => expect(screen.getByText('11')).toBeInTheDocument());

    // Verify API called
    expect(api.post).toHaveBeenCalledWith('/api/likes', { blogId: '123' });
  });

  it('handles bookmark toggling', async () => {
     mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1' } }, 
      status: 'authenticated' 
    });

    (api.get as any).mockImplementation((url: string) => {
        if (url.includes('/api/likes')) return Promise.resolve({ count: 5, userLiked: false });
        if (url.includes('/api/bookmarks')) return Promise.resolve({ isBookmarked: false });
        if (url.includes('/api/comments')) return Promise.resolve([]);
        return Promise.resolve({});
    });

    (api.post as any).mockResolvedValue({ isBookmarked: true });

    render(<BlogInteractions blogId="123" initialLikes={5} blogAuthorId="author-1" />);

    const bookmarkBtn = await screen.findByTitle('Save to Library');
    
    fireEvent.click(bookmarkBtn);

    // Verify API call
    expect(api.post).toHaveBeenCalledWith('/api/bookmarks', { blogId: '123' });
  });
});

