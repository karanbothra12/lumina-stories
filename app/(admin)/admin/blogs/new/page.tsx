import { BlogEditor } from '@/app/components/BlogEditor';

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Write a new story</h1>
      <BlogEditor />
    </div>
  );
}

