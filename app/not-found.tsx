import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-zinc-900 mb-4">404</h1>
      <p className="text-lg text-zinc-600 mb-8">Page not found</p>
      <Link 
        href="/"
        className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}

