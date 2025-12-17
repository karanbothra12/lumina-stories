export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-zinc-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight mb-2">Lumina</h1>
            <p className="text-zinc-500">Share your stories with the world</p>
          </div>
        {children}
      </div>
    </div>
  );
}

