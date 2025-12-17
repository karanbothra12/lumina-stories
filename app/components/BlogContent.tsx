import Image from 'next/image';

export function BlogContent({ content }: { content: any }) {
  if (!content) return null;
  
  // Handle legacy string content
  if (typeof content === 'string') {
      return <p>{content}</p>;
  }

  // Expecting { blocks: [...] }
  const blocks = content.blocks || [];

  if (!Array.isArray(blocks)) {
      return null;
  }

  return (
    <div className="space-y-4 font-serif">
      {blocks.map((block: any) => {
        switch (block.type) {
          case 'header':
            const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
            return <HeaderTag key={block.id} className="font-bold mt-8 mb-4 text-zinc-900" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
            
          case 'paragraph':
            return <p key={block.id} className="text-xl leading-relaxed text-zinc-800 mb-6" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
            
          case 'list':
             const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
             return (
                 <ListTag key={block.id} className="list-inside list-disc pl-4 space-y-2 mb-6">
                     {block.data.items.map((item: any, i: number) => {
                         // Handle nested lists or objects in newer Editor.js list versions
                         const content = typeof item === 'string' ? item : item.content;
                         return (
                            <li key={i} dangerouslySetInnerHTML={{ __html: content }} />
                         );
                     })}
                 </ListTag>
             );

          case 'checklist':
              return (
                  <div key={block.id} className="space-y-2 mb-6">
                      {block.data.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-start gap-3">
                              <div className={`mt-1.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.checked ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300'}`}>
                                  {item.checked && (
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                                      </svg>
                                  )}
                              </div>
                              <span className={`text-lg ${item.checked ? 'text-zinc-400 line-through' : 'text-zinc-800'}`} dangerouslySetInnerHTML={{ __html: item.text }} />
                          </div>
                      ))}
                  </div>
              );

          case 'quote':
             return (
                 <blockquote key={block.id} className="border-l-4 border-zinc-900 pl-4 italic text-zinc-700 my-8 text-xl">
                     <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                     {block.data.caption && <cite className="block text-sm text-zinc-500 mt-2 not-italic">— {block.data.caption}</cite>}
                 </blockquote>
             );

          case 'image':
              return (
                  <figure key={block.id} className="my-10">
                      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                        <Image 
                            src={block.data.file.url} 
                            alt={block.data.caption || "Blog image"} 
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                      </div>
                      {block.data.caption && (
                          <figcaption className="text-center text-zinc-500 text-sm mt-3">{block.data.caption}</figcaption>
                      )}
                  </figure>
              );

          default:
            return null;
        }
      })}
    </div>
  );
}
