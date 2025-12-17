import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlogContent } from '../BlogContent';

describe('BlogContent', () => {
  it('renders paragraph blocks', () => {
    const content = {
      blocks: [
        {
          id: '1',
          type: 'paragraph',
          data: { text: 'Hello World' }
        }
      ]
    };
    render(<BlogContent content={content} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders headers', () => {
    const content = {
      blocks: [
        {
          id: '1',
          type: 'header',
          data: { text: 'My Title', level: 2 }
        }
      ]
    };
    render(<BlogContent content={content} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('My Title');
  });

  it('renders legacy string content', () => {
    render(<BlogContent content="Legacy String" />);
    expect(screen.getByText('Legacy String')).toBeInTheDocument();
  });

  it('handles null/empty content gracefully', () => {
    const { container } = render(<BlogContent content={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

