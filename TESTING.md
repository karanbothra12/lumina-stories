# 🧪 Testing Documentation

Lumina uses **Vitest** + **React Testing Library** for a robust testing strategy that focuses on user flows and critical logic.

## 🛠️ Setup

### Prerequisites
Ensure dependencies are installed:
```bash
npm install
```

### Running Tests
*   **Run all tests:**
    ```bash
    npm run test
    # or
    npx vitest
    ```
*   **Watch mode:** (Default)
    ```bash
    npx vitest watch
    ```
*   **Coverage:**
    ```bash
    npx vitest run --coverage
    ```

---

## 🏗️ What We Test

We follow the "Testing Trophy" philosophy: favoring integration/component tests that resemble user behavior over implementation details.

### 1. **Unit Tests (Utilities)**
Logic that is independent of UI, ensuring helper functions behave correctly.
*   **File:** `lib/__tests__/url.test.ts`
*   **Flows Covered:**
    *   Determining base URL based on environment (Localhost vs Vercel vs Prod).
    *   Handling client-side vs server-side execution.

### 2. **Component Tests (UI & Rendering)**
Ensuring components render content correctly based on props.
*   **File:** `app/components/__tests__/BlogContent.test.tsx`
*   **Flows Covered:**
    *   Rendering structured JSON blocks (Paragraphs, Headers).
    *   Fallback for legacy string content.
    *   Handling empty/null states safely.

### 3. Integration Tests (User Flows)
Ensuring components interact correctly with the user and mock APIs.
*   **File:** `app/components/__tests__/UserNav.test.tsx`
    *   Displaying user avatar vs initials fallback.
*   **File:** `app/components/__tests__/BlogInteractions.test.tsx`
    *   Like functionality (Optimistic updates).
    *   Bookmark toggling.
*   **File:** `app/components/__tests__/LibraryView.test.tsx`
    *   Fetching Saved vs History stories.
    *   Tab switching logic.

---

## 📝 How to Add New Tests

### 1. Create a Test File
Create a file named `*.test.tsx` (for components) or `*.test.ts` (for logic) next to the source file.

### 2. Mock External Dependencies
Use `test/setup.tsx` or per-test `vi.mock()` for:
*   `next/navigation` (Router)
*   `next-auth/react` (Session)
*   `next/image` (Images)

### 3. Write Test Case
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## 🎯 Recommended Future Tests

To cover the full "Flow" of the application, consider adding:

1.  **Admin Dashboard Flow:**
    *   Mock `useSession` as ADMIN.
    *   Render Dashboard (Server Component testing requires E2E tools like Playwright or complex Server Component mocking).
    *   Expect "Publish" / "Delete" buttons to be visible.
2.  **API Route Tests:**
    *   Test `POST /api/blogs` with valid/invalid data using `node-mocks-http`.

