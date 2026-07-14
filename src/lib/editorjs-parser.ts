export interface EditorJsBlock {
  id?: string;
  type: string;
  data: any;
}

export interface EditorJsData {
  time?: number;
  blocks: EditorJsBlock[];
  version?: string;
}

/**
 * Converts Editor.js JSON blocks to standard semantic HTML markup.
 */
export function editorJsToHtml(data: any): string {
  if (!data) return '';
  
  // If data is passed as a string representation of JSON, parse it
  let parsed: EditorJsData;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse Editor.js JSON string:', e);
      return '';
    }
  } else {
    parsed = data as EditorJsData;
  }

  if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
    return '';
  }

  return parsed.blocks
    .map((block: EditorJsBlock) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.data.text || ''}</p>`;
          
        case 'header': {
          const level = block.data.level || 2;
          return `<h${level}>${block.data.text || ''}</h${level}>`;
        }
          
        case 'list': {
          const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
          const listClass = tag === 'ol' ? 'list-decimal pl-5 space-y-1 my-4' : 'list-disc pl-5 space-y-1 my-4';
          
          const parseListItemsHtml = (items: any[]): string => {
            return (items || [])
              .map((item: any) => {
                if (typeof item === 'string') {
                  return `<li>${item}</li>`;
                }
                const content = item?.content || '';
                const nested = item?.items && item.items.length > 0
                  ? `<${tag} class="${listClass}">${parseListItemsHtml(item.items)}</${tag}>`
                  : '';
                return `<li>${content}${nested}</li>`;
              })
              .join('');
          };

          const items = parseListItemsHtml(block.data.items || []);
          return `<${tag} class="${listClass}">${items}</${tag}>`;
        }
          
        case 'table': {
          const withHeadings = block.data.withHeadings || false;
          const content = block.data.content || [];
          if (content.length === 0) return '';

          const rows = content.map((row: string[], rowIndex: number) => {
            const cells = row.map((cell: string) => {
              if (withHeadings && rowIndex === 0) {
                return `<th class="bg-slate-50 border border-slate-200 px-4 py-2 text-slate-700 font-bold">${cell}</th>`;
              }
              return `<td class="border border-slate-200 px-4 py-2 text-slate-600">${cell}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
          }).join('');

          return `<table class="border-collapse table-auto w-full my-6 border border-slate-200 rounded-lg overflow-hidden"><tbody>${rows}</tbody></table>`;
        }
          
        case 'quote': {
          const text = block.data.text || '';
          const caption = block.data.caption || '';
          const cite = caption ? `<cite class="block text-xs font-semibold text-slate-400 mt-2">— ${caption}</cite>` : '';
          return `<blockquote class="border-l-4 border-indigo-500 bg-slate-50 p-4 italic my-6 text-slate-700">${text}${cite}</blockquote>`;
        }
          
        case 'code': {
          const code = block.data.code || '';
          return `<pre class="rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-xs my-6 overflow-x-auto"><code>${code}</code></pre>`;
        }
          
        case 'raw':
          // Raw HTML injected directly (used for our custom blocks like FAQ, CTA, NDA box, etc.)
          return block.data.html || '';
          
        case 'image': {
          const url = block.data.file?.url || block.data.url || '';
          const caption = block.data.caption || '';
          const alt = block.data.alt || caption || '';
          if (!url) return '';
          
          return `<figure class="my-6 text-center">
            <img src="${url}" alt="${alt}" class="rounded-xl border border-slate-100 max-w-full mx-auto" />
            ${caption ? `<figcaption class="text-xs text-slate-400 mt-2">${caption}</figcaption>` : ''}
          </figure>`;
        }
          
        default:
          console.warn('Unknown Editor.js block type:', block.type);
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Extracts plain text from Editor.js JSON data (for search indexes, excerpt generation, and statistics).
 */
export function editorJsToText(data: any): string {
  if (!data) return '';

  let parsed: EditorJsData;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      return '';
    }
  } else {
    parsed = data as EditorJsData;
  }

  if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
    return '';
  }

  const stripHtml = (html: any): string => {
    if (html === null || html === undefined) return '';
    if (typeof html === 'object') {
      if (typeof html.content === 'string') {
        return stripHtml(html.content);
      }
      return '';
    }
    const str = String(html);
    return str.replace(/<\/?[^>]+(>|$)/g, ' ').trim();
  };

  return parsed.blocks
    .map((block: EditorJsBlock) => {
      switch (block.type) {
        case 'paragraph':
        case 'header':
        case 'quote':
          return stripHtml(block.data.text || '');
          
        case 'list': {
          const parseListItemsText = (items: any[]): string => {
            return (items || [])
              .map((item: any) => {
                if (typeof item === 'string') {
                  return stripHtml(item);
                }
                const content = stripHtml(item?.content || '');
                const nested = item?.items && item.items.length > 0
                  ? parseListItemsText(item.items)
                  : '';
                return `${content} ${nested}`.trim();
              })
              .join(' ');
          };
          return parseListItemsText(block.data.items || []);
        }
          
        case 'table':
          return (block.data.content || [])
            .map((row: string[]) => row.map(cell => stripHtml(cell)).join(' '))
            .join(' ');
            
        case 'code':
          return block.data.code || '';
          
        case 'raw':
          return stripHtml(block.data.html || '');
          
        case 'image':
          return block.data.caption || '';
          
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');
}
