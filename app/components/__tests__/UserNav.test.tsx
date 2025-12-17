import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/app/components/Header';

// We need to mock the server component logic or test a client part. 
// Since Header is an async server component, testing it directly in unit tests 
// requires a bit of work or converting it. 
// For this example, let's test the 'UserNav' which is a Client Component and handles user flow.

import { UserNav } from '../UserNav';

describe('UserNav Component', () => {
  it('renders user initials when no image provided', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
    };

    render(<UserNav user={user} />);
    
    // Check if initial 'J' exists (User flow: seeing their avatar)
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders user image when provided', () => {
    const user = {
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    render(<UserNav user={user} />);
    
    // Check if image is rendered
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });
});

