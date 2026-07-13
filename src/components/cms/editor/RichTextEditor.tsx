'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { MediaPicker } from '../media/MediaPicker';
import { editorJsToHtml, editorJsToText } from '@/lib/editorjs-parser';

interface RichTextEditorProps {
  initialJson: any;
  onChange: (html: string, json: any, text: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  initialJson,
  onChange,
  placeholder = 'Start writing your premium B2B content...'
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let isDestroyed = false;
    let editor: any = null;

    const initEditor = async () => {
      // Dynamic imports to prevent server-side execution of window/document reliant Editor.js packages
      // @ts-ignore
      const EditorJS = (await import('@editorjs/editorjs')).default;
      // @ts-ignore
      const Header = (await import('@editorjs/header')).default;
      // @ts-ignore
      const List = (await import('@editorjs/list')).default;
      // @ts-ignore
      const Table = (await import('@editorjs/table')).default;
      // @ts-ignore
      const Quote = (await import('@editorjs/quote')).default;
      // @ts-ignore
      const Underline = (await import('@editorjs/underline')).default;
      // @ts-ignore
      const Code = (await import('@editorjs/code')).default;
      // @ts-ignore
      const Raw = (await import('@editorjs/raw')).default;
      // @ts-ignore
      const ImageTool = (await import('@editorjs/image')).default;

      if (isDestroyed || !containerRef.current) return;

      let initialData = undefined;
      if (initialJson && typeof initialJson === 'object' && Object.keys(initialJson).length > 0) {
        if (initialJson.blocks && Array.isArray(initialJson.blocks)) {
          initialData = initialJson;
        }
      }

      editor = new EditorJS({
        holder: containerRef.current,
        placeholder: placeholder,
        data: initialData,
        tools: {
          header: {
            class: Header as any,
            inlineToolbar: ['link', 'bold', 'italic', 'underline'],
            config: {
              placeholder: 'Heading',
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List as any,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          underline: Underline as any,
          table: {
            class: Table as any,
            inlineToolbar: true,
          },
          quote: {
            class: Quote as any,
            inlineToolbar: true,
          },
          code: Code as any,
          raw: Raw as any,
          image: {
            class: ImageTool as any,
            config: {
              uploader: {
                uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append('files', file);
                  return fetch('/api/cms/upload', {
                    method: 'POST',
                    body: formData,
                  })
                    .then(res => res.json())
                    .then(resData => {
                      if (resData.success) {
                        const url = resData.data.assets?.[0]?.url || resData.data.url;
                        return {
                          success: 1,
                          file: {
                            url: url,
                          }
                        };
                      }
                      return { success: 0 };
                    })
                    .catch(() => ({ success: 0 }));
                },
                uploadByUrl(url: string) {
                  return Promise.resolve({
                    success: 1,
                    file: {
                      url: url,
                    }
                  });
                }
              }
            }
          }
        },
        async onChange(api) {
          try {
            const savedData = await api.saver.save();
            const html = editorJsToHtml(savedData);
            const text = editorJsToText(savedData);
            onChange(html, savedData, text);
          } catch (err) {
            console.error('Error saving Editor.js content state:', err);
          }
        }
      });

      editorRef.current = editor;
    };

    initEditor();

    return () => {
      isDestroyed = true;
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
        } catch (e) {
          // Ignore destruction exceptions during fast HMR refreshes
        }
        editorRef.current = null;
      }
    };
  }, [isMounted]);

  const insertCustomBlock = (type: string) => {
    if (!editorRef.current) return;

    let blockHtml = '';
    if (type === 'faq') {
      blockHtml = `
        <div class="faq-block my-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Frequently Asked Questions</h4>
          <div class="space-y-4">
            <div>
              <p class="font-semibold text-slate-800">Q: Add your question here?</p>
              <p class="text-slate-600 mt-1">A: Add your detailed answer here. This will automatically generate Google FAQ schema.</p>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'stats') {
      blockHtml = `
        <div class="stats-block my-6 grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-indigo-50/30 border border-indigo-100 rounded-xl text-center">
          <div>
            <span class="text-3xl font-extrabold text-indigo-600 block">+150%</span>
            <span class="text-xs text-slate-500 font-medium mt-1">Lead Conversion</span>
          </div>
          <div>
            <span class="text-3xl font-extrabold text-indigo-600 block">10x</span>
            <span class="text-xs text-slate-500 font-medium mt-1">ROI Growth</span>
          </div>
        </div>
      `;
    } else if (type === 'cta') {
      blockHtml = `
        <div class="cta-block my-6 p-8 bg-indigo-600 text-white rounded-xl text-center">
          <h3 class="text-xl font-bold mb-2">Ready to transform your development cycle?</h3>
          <p class="text-indigo-100 text-sm mb-6 max-w-lg mx-auto">Get in touch with our tech architects to design a customized roadmap for your enterprise scaling.</p>
          <a href="https://vionsys.com/contact" class="inline-block px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-lg text-xs hover:bg-slate-50 transition-colors shadow-sm">Talk to our Experts</a>
        </div>
      `;
    } else if (type === 'testimonial') {
      blockHtml = `
        <div class="testimonial-block my-6 p-6 border-l-4 border-indigo-500 bg-slate-50 rounded-r-xl">
          <p class="italic text-slate-700">"Vionsys delivered the application three weeks ahead of schedule. The code cleanliness and scalability is exceptional."</p>
          <div class="mt-4 flex items-center gap-3">
            <div>
              <p class="font-bold text-xs text-slate-800">Jane Smith</p>
              <p class="text-[10px] text-slate-400">VP Engineering, SaaS Solutions</p>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'callout') {
      blockHtml = `
        <div class="callout-block my-6 p-4 border border-blue-200 bg-blue-50/30 text-blue-900 rounded-xl text-xs flex gap-2">
          <span class="font-bold">Info:</span>
          <p>Please note that this case study reflects a client project governed under strict NDA. Key metrics are verified by the board.</p>
        </div>
      `;
    } else if (type === 'key_takeaways') {
      blockHtml = `
        <div class="key-takeaways my-6 p-6 border border-emerald-200 bg-emerald-50/20 rounded-xl">
          <h4 class="font-bold text-emerald-800 text-sm mb-3">Key Takeaways</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>Transition to Next.js App Router reduced page load times by 40%.</li>
            <li>Prisma connection pooling avoided cold-start latency issues.</li>
          </ul>
        </div>
      `;
    }

    if (blockHtml) {
      try {
        editorRef.current.blocks.insert('raw', {
          html: blockHtml
        });
      } catch (err) {
        console.error('Error inserting raw block snippet:', err);
      }
    }
  };

  const addImage = (url: string, alt: string) => {
    if (!editorRef.current) return;
    try {
      editorRef.current.blocks.insert('image', {
        file: { url },
        caption: alt
      });
    } catch (err) {
      console.error('Error inserting image block:', err);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col flex-1 h-full shadow-xs min-h-[450px]">
      {/* Editor Toolbar */}
      <div className="border-b border-slate-100 p-2.5 flex flex-wrap items-center justify-between gap-1 bg-slate-50/50 select-none">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowMediaPicker(true)}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-slate-200 bg-white shadow-2xs"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            Insert Media Image
          </button>
        </div>

        {/* Custom blocks intelligence / modular blocks */}
        <div className="flex items-center gap-1.5">
          <select
            onChange={e => {
              if (e.target.value) {
                insertCustomBlock(e.target.value);
                e.target.value = ''; // Reset select
              }
            }}
            className="text-xs border border-slate-200 rounded-lg py-1 px-2 bg-white text-slate-600 font-semibold cursor-pointer shadow-2xs"
          >
            <option value="">Insert Content Block...</option>
            <option value="faq">FAQ Section</option>
            <option value="stats">Stats / Key Numbers</option>
            <option value="cta">CTA Callout</option>
            <option value="testimonial">Client Testimonial</option>
            <option value="callout">NDA Info Box</option>
            <option value="key_takeaways">Key Takeaways</option>
          </select>
        </div>
      </div>

      {/* Editor Content Box */}
      <div className="flex-1 overflow-y-auto px-12 py-10 prose prose-slate max-w-none focus:outline-hidden prose-sm prose-indigo leading-relaxed">
        {isMounted ? (
          <div ref={containerRef} className="editorjs-wrapper text-slate-700" />
        ) : (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-100 rounded-sm w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded-sm"></div>
            <div className="h-4 bg-slate-100 rounded-sm w-5/6"></div>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={addImage}
        title="Insert Image into Content"
      />
    </div>
  );
}

export default RichTextEditor;
