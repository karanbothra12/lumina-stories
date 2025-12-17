'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

interface BlogEditorProps {
  initialData?: any;
  isEditing?: boolean;
}

export function BlogEditor({ initialData, isEditing = false }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || { blocks: [] });
  const [tags, setTags] = useState(initialData?.tags?.map((t: any) => t.name).join(', ') || '');
  const [published, setPublished] = useState(initialData?.published || false);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagList = tags.split(',').map((t: string) => t.trim()).filter(Boolean);

      const payload = {
        title,
        slug: isEditing ? slug : undefined,
        content: content,
        tags: tagList,
        published,
        coverImage,
      };

      if (isEditing) {
        await api.put(`/api/blogs/${initialData.id}`, payload);
      } else {
        await api.post('/api/blogs', payload);
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setCoverImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Cover Image Section */}
        <div className="group relative">
             {coverImage ? (
                 <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden bg-zinc-100">
                     <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                     <button 
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white text-zinc-600 hover:text-red-600 transition-colors"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                     </button>
                 </div>
             ) : (
                 <div className="h-40 w-full rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors">
                     <label className="cursor-pointer flex flex-col items-center">
                         <span className="text-sm font-medium text-zinc-600 mb-1">Add a cover image</span>
                         <span className="text-xs text-zinc-400">Click to upload (Base64)</span>
                         <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="hidden" />
                     </label>
                 </div>
             )}
        </div>

        <div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl md:text-5xl font-bold border-none focus:ring-0 placeholder:text-zinc-300 p-0"
            placeholder="Title"
          />
        </div>

        {isEditing && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="font-medium">Slug:</span>
                <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="border-none focus:ring-0 p-0 text-zinc-600 bg-transparent font-mono text-sm w-full"
                    placeholder="slug"
                />
            </div>
        )}

        <div className="min-h-[400px]">
            <Editor 
                holder="editorjs-container" 
                data={content} 
                onChange={setContent} 
            />
        </div>

        <div className="border-t border-zinc-100 pt-6 grid gap-6">
            <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Tags</label>
            <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                placeholder="tech, life, coding (comma separated)"
            />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="published" className="text-sm font-medium text-zinc-700">Publish immediately</label>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
            type="submit"
            disabled={loading}
            className="bg-zinc-900 text-white px-6 py-2 rounded-full font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all"
        >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Publish')}
        </button>
        <button
            type="button"
            onClick={() => router.back()}
            className="text-zinc-600 hover:text-zinc-900 font-medium"
        >
            Cancel
        </button>
      </div>
    </form>
  );
}
