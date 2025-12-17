'use client';

import { useMemo, useState } from 'react';
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
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || initialData?.title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '');
  const [seoError, setSeoError] = useState('');

  const generatedSlug = useMemo(() => {
    if (isEditing && slug) return slug;
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [title, slug, isEditing]);

  const seoTitleCount = seoTitle.trim().length;
  const seoDescriptionCount = seoDescription.trim().length;
  const seoTitleLimit = 60;
  const seoDescriptionLimit = 160;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSeoError('');

    if (!seoTitle.trim() || !seoDescription.trim()) {
      setSeoError('SEO title and description are required.');
      setLoading(false);
      return;
    }

    try {
      const tagList = tags.split(',').map((t: string) => t.trim()).filter(Boolean);

      const payload = {
        title,
        slug: isEditing ? slug : undefined,
        content: content,
        tags: tagList,
        published,
        coverImage,
        seoTitle,
        seoDescription,
        seoKeywords,
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

      <div className="space-y-10">
        {/* Cover Image Section */}
        <div className="group relative rounded-2xl border border-zinc-200 p-4 bg-white shadow-sm">
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

        <div className="grid gap-6 rounded-2xl border border-zinc-200 p-6 bg-white shadow-sm">
          <div>
            <label className="text-sm font-medium text-zinc-600">Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl md:text-5xl font-bold border-none focus:ring-0 placeholder:text-zinc-300 p-0 bg-transparent"
              placeholder="What is your story title?"
            />
            <p className="text-xs text-zinc-400 mt-2">Make it captivating. 55-70 characters works best.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600">URL Preview</span>
              <button
                type="button"
                onClick={() => setSlug(generatedSlug)}
                className="text-xs text-zinc-500 hover:text-zinc-900"
                disabled={isEditing}
              >
                {isEditing ? 'Editable below' : 'Use current suggestion'}
              </button>
            </div>
            <div className="rounded-md bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-600">
              https://lumina.com/blog/<span className="text-zinc-900">{isEditing ? slug || '...' : generatedSlug || '...'}</span>
            </div>
            {isEditing && (
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono text-sm"
                placeholder="custom-slug"
              />
            )}
          </div>

          <div className="min-h-[400px]">
            <Editor
              holder="editorjs-container"
              data={content}
              onChange={setContent}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6 bg-white shadow-sm grid gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
              placeholder="tech, creativity, design"
            />
            <p className="text-xs text-zinc-400 mt-1">Use up to 5 descriptive tags to aid discovery.</p>
          </div>

          <label className="inline-flex items-center gap-3 text-sm text-zinc-600">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
            />
            Publish immediately once saved
          </label>

            <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-zinc-700">SEO Title</label>
                        <span className="text-xs text-zinc-400">Required</span>
                    </div>
                    <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        placeholder="Custom title for search engines"
                        required
                    />
                    <p className={`text-xs ${seoTitleCount > seoTitleLimit ? 'text-red-600' : 'text-zinc-400'} mt-1`}>
                      {seoTitleCount}/{seoTitleLimit} characters
                    </p>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-zinc-700">Meta Description</label>
                        <span className="text-xs text-zinc-400">Required</span>
                    </div>
                    <textarea
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        placeholder="Short summary shown in search results"
                        required
                    />
                    <p className={`text-xs ${seoDescriptionCount > seoDescriptionLimit ? 'text-red-600' : 'text-zinc-400'} mt-1`}>
                      {seoDescriptionCount}/{seoDescriptionLimit} characters
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Keywords</label>
                    <input
                        type="text"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        placeholder="Comma separated keywords"
                    />
                </div>
                {seoError && (
                    <p className="text-xs text-red-600">{seoError}</p>
                )}

                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Search Preview</p>
                  <p className="text-[#1a0dab] text-base font-medium">
                    {seoTitle || '(SEO title preview)'}
                  </p>
                  <p className="text-[#006621] text-sm">
                    https://lumina.com/blog/{generatedSlug || 'your-slug'}
                  </p>
                  <p className="text-zinc-600 text-sm mt-1">
                    {seoDescription || '(Meta description preview goes here...)'}
                  </p>
                </div>
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
