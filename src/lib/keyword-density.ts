const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'as', 'into', 'through',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'them', 'their', 'our', 'your', 'my', 'his', 'her', 'its', 'us', 'me', 'him',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must', 'not', 'no', 'yes', 'only', 'so', 'then'
]);

export interface KeywordDensityResult {
  keyword: string;
  count: number;
  density: number; // percentage
}

export function calculateKeywordDensity(text: string, keywords: string[]): KeywordDensityResult[] {
  if (!text) return [];
  
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 1);
  const totalWords = words.length;
  
  if (totalWords === 0) return [];
  
  const textString = words.join(' ');
  const results: KeywordDensityResult[] = [];

  for (const keyword of keywords) {
    if (!keyword) continue;
    const cleanKeyword = keyword.toLowerCase().trim();
    
    // Count exact occurrences (supporting multi-word keywords)
    let count = 0;
    if (cleanKeyword.includes(' ')) {
      // For multi-word phrases, count occurrences in the joined text string
      const escaped = cleanKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'g');
      const matches = textString.match(regex);
      count = matches ? matches.length : 0;
    } else {
      // For single word, search in the words array
      count = words.filter(w => w === cleanKeyword).length;
    }

    results.push({
      keyword,
      count,
      density: parseFloat(((count / totalWords) * 100).toFixed(2))
    });
  }

  return results;
}

export function getTopKeywords(text: string, limit = 5): KeywordDensityResult[] {
  if (!text) return [];
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const totalWords = words.length;

  if (totalWords === 0) return [];

  const freqMap: Record<string, number> = {};
  for (const word of words) {
    freqMap[word] = (freqMap[word] || 0) + 1;
  }

  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: parseFloat(((count / totalWords) * 100).toFixed(2))
    }));
}
