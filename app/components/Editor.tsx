'use client';

import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import Checklist from '@editorjs/checklist';

interface EditorProps {
  data: any;
  onChange: (data: any) => void;
  holder: string;
}

export default function Editor({ data, onChange, holder }: EditorProps) {
  const ref = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        data: data,
        placeholder: 'Tell your story...',
        tools: {
          header: {
            class: Header as any,
            inlineToolbar: true,
            config: {
              levels: [2, 3],
              defaultLevel: 2,
            },
          },
          list: {
            class: List as any,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          checklist: {
            class: Checklist as any,
            inlineToolbar: true,
          },
          quote: {
            class: Quote as any,
            inlineToolbar: true,
          },
          image: {
            class: ImageTool as any,
            config: {
              uploader: {
                uploadByFile(file: File) {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            resolve({
                                success: 1,
                                file: {
                                    url: reader.result,
                                },
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                },
                uploadByUrl(url: string) {
                    return new Promise((resolve) => {
                         resolve({
                             success: 1,
                             file: {
                                 url: url,
                             }
                         });
                    });
                }
              }
            }
          }
        },
        onChange: async () => {
          const content = await editor.save();
          onChange(content);
        },
      });
      ref.current = editor;
    }

    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
        ref.current = null;
      }
    };
  }, []); // Empty dependency array: initialize once

  return <div id={holder} className="prose max-w-none prose-zinc" />;
}
