import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibraryView } from '../LibraryView';
import { api } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock BlogFeed since we assume it works and just want to check data passing
vi.mock('@/app/components/BlogFeed', () => ({
  BlogFeed: ({ initialBlogs }: any) => <div data-testid="blog-feed">Count: {initialBlogs.length}</div>
}));

describe('LibraryView Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads saved stories by default', async () => {
    // Mock Saved response
    (api.get as any).mockResolvedValue({ 
      bookmarks: [
        { blog: { id: '1', title: 'Saved Blog 1' } },
        { blog: { id: '2', title: 'Saved Blog 2' } }
      ] 
    });

    render(<LibraryView />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId('blog-feed')).toBeInTheDocument());
    expect(screen.getByTestId('blog-feed')).toHaveTextContent('Count: 2');
    
    // Verify API call
    expect(api.get).toHaveBeenCalledWith('/api/bookmarks?limit=20');
  });

  it('switches to history tab and fetches history', async () => {
    // Mock responses
    (api.get as any)
      .mockResolvedValueOnce({ bookmarks: [] }) // Initial load (Saved)
      .mockResolvedValueOnce({ 
        history: [
            { blog: { id: '3', title: 'History Blog 1' } }
        ] 
      }); // Second load (History)

    render(<LibraryView />);

    // Wait for initial load
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/bookmarks?limit=20'));

    // Switch Tab
    const historyTab = screen.getByText('History');
    fireEvent.click(historyTab);

    // Verify loading state appears again or API is called
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/history?limit=20'));
    
    // Verify data updated (mocked BlogFeed should show count 1)
    await waitFor(() => expect(screen.getByTestId('blog-feed')).toHaveTextContent('Count: 1'));
  });
});

