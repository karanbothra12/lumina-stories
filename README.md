# Lumina (Formerly Medium Clone)

A modern, high-performance full-stack blogging platform built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **PostgreSQL**. This project demonstrates a production-ready architecture with Next.js-native caching (ISR), role-based authentication, and a rich text editing experience.

## 🧱 Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Components, Server Actions)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Authentication:** [NextAuth.js (v5 Beta)](https://authjs.dev/)
*   **Editor:** [Editor.js](https://editorjs.io/) (Block-based rich text editor)
*   **Performance:** `next/image` for optimized image delivery, minimal CLS/INP.
*   **Testing:** Vitest + React Testing Library (Unit & Integration).
*   **Quality Control:** Husky (Pre-commit hooks).
*   **Containerization:** [Docker](https://www.docker.com/) (For local database)

## ✨ Key Features

1.  **Public Blog (ISR):**
    *   **Incremental Static Regeneration:** Home and blog pages are cached and revalidated automatically on new content (`revalidateTag`).
    *   **Rich Content:** Blogs render blocks (Headers, Lists, Images, Checklists) efficiently.
    *   **Interaction:** Likes and Comments functionality for authenticated users.
        *   Comments can be deleted by the **Comment Author**, **Blog Owner**, or **Super Admin**.
    *   **Infinite Scroll:** "Load More" functionality for the blog feed.

2.  **Library & History:**
    *   **Wishlist:** Save stories to your personal library for later reading.
    *   **Reading History:** Automatically tracks stories you've visited.
    *   **Dedicated Page:** `/library` tab organizing Saved and History lists.

3.  **Authentication & Roles:**
    *   **Secure Auth:** Email/Password login with `bcrypt` hashing.
    *   **Role-Based Access Control (RBAC):**
        *   `USER`: Can read, like, comment, and create their own stories.
        *   `ADMIN` (Super Admin): Can manage all users, assign roles, and delete any content (blogs, comments).
    *   **User Management:** Admins can deactivate users to prevent login.

4.  **Admin Dashboard:**
    *   **Manage Stories:** Create, Edit, Publish/Unpublish stories.
    *   **User Management:** View all users and toggle their active status.
    *   **Responsive:** Fully mobile-optimized sidebar and layout.

5.  **Rich Editor:**
    *   Medium-like editing experience.
    *   Support for Cover Images, Tags, and structured JSON content storage.

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 18+
*   Docker (optional, for local DB)

### 2. Setup Environment
Clone the repo and install dependencies:
```bash
npm install
```

Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/medium_clone"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Start Database
If using Docker, spin up the local Postgres instance:
```bash
docker-compose up -d
```

Push the Prisma schema to the database:
```bash
npx prisma db push
```

### 4. Run the Application
```bash
npm run dev
```
Visit `http://localhost:3000`.

### 5. Create a Super Admin
1.  Register a new account at `/register`.
2.  Run the SQL command to promote yourself (or use a DB tool):
    ```sql
    UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
    ```

## 👨‍🏫 Codebase Walkthrough (For Teaching)

This project is structured to be clean and modular. Here are the key areas to explain:

### 1. **Next.js App Router Structure (`app/`)**
*   **`(public)/`**: Contains public-facing pages (Home, Blog Detail). Uses `(group)` folders to organize routes without affecting the URL path.
*   **`(admin)/`**: Protected routes for the dashboard.
*   **`(auth)/`**: Login and Register pages.
*   **`api/`**: Route Handlers for backend logic (fetching data, processing updates).

### 2. **Caching Strategy (`ISR`)**
Explain how we avoid hitting the DB on every request:
*   **Fetch:** `fetch(url, { next: { tags: ['blogs'], revalidate: 60 } })`
*   **Revalidation:** When a blog is created/updated, we call `revalidateTag('blogs')` to purge the cache instantly.
*   *Location:* `app/(public)/page.tsx` (Consumption) and `app/api/blogs/route.ts` (Invalidation).

### 3. **Prisma & Database (`prisma/schema.prisma`)**
Show how relations work:
*   `User` has many `Blog`s.
*   `Blog` has many `Like`s, `Comment`s, `Bookmark`s, and `History`.
*   **Cascade Delete:** Explain `onDelete: Cascade` on the `Like` model—deleting a blog automatically cleans up its likes.

### 4. **Authentication Flow (`lib/auth.ts`)**
*   Uses **NextAuth v5**.
*   **Middleware Protection:** Pages check `session` before rendering.
*   **Role Check:** `if (session.user.role !== 'ADMIN')` ensures security on sensitive actions.

### 5. **Rich Text Editor (`components/Editor.tsx`)**
*   Demonstrates how to wrap a non-React library (**Editor.js**) inside a React component using `useRef` and `useEffect`.
*   Shows how to store content as **JSON** in the database instead of raw HTML, allowing flexibility in how it's rendered later.

### 6. **Testing (`vitest`)**
*   **Unit & Integration Tests:** Located in `__tests__` directories next to their source files (Colocation).
*   **Tools:** Vitest + React Testing Library.
*   **Command:** `npm run test` or `npx vitest`.

### 7. **Quality Control (`husky`)**
*   **Pre-commit:** Automatically runs `npm run test` and `npm run build` before allowing a commit to ensure code quality.

## 🤝 Contributing
Feel free to fork this project and submit pull requests.
