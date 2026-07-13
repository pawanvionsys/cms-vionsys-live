export interface HeadingOutlineItem {
  level: number;
  text: string;
  isValid: boolean;
}

export function parseHeadingOutline(html: string): HeadingOutlineItem[] {
  if (!html) return [];

  // Match H2, H3, H4 tags and capture content
  const regex = <RegExp>/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: HeadingOutlineItem[] = [];
  let match;

  // Track heading levels to validate hierarchy
  let previousLevel = 1; // Base level is H1 (which is the document title)

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    
    // Strip any nested HTML inside headings
    const text = match[2].replace(/<\/?[^>]+(>|$)/g, '').trim();
    
    // An outline level is valid if:
    // - it is an H2 (level 2) - any H2 is always valid hierarchy-wise
    // - it is H3/H4 and does not jump more than 1 level deeper than the previous level
    const isValid = level <= previousLevel + 1;
    
    headings.push({
      level,
      text,
      isValid
    });
    
    previousLevel = level;
  }

  return headings;
}
