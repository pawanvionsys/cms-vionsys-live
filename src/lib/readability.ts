function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  // Basic syllable counting using vowels
  let vowels = word.match(/[aeiouy]{1,2}/g);
  let count = vowels ? vowels.length : 1;
  
  // Adjustments for common silent endings
  if (word.endsWith('es') || word.endsWith('ed')) {
    count--;
  }
  if (word.endsWith('e') && !word.endsWith('le')) {
    count--;
  }
  
  return Math.max(1, count);
}

export function calculateReadability(text: string): { score: number; grade: string } {
  if (!text || text.trim().length === 0) {
    return { score: 100, grade: 'Easy' };
  }

  const cleanText = text.trim();
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Split sentences by standard punctuations (. ! ?)
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllables(word);
  }

  // Flesch Reading Ease formula
  // Score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  const roundedScore = Math.min(100, Math.max(0, Math.round(score)));

  let grade = 'Fairly Hard';
  if (roundedScore >= 90) grade = 'Very Easy';
  else if (roundedScore >= 80) grade = 'Easy';
  else if (roundedScore >= 70) grade = 'Fairly Easy';
  else if (roundedScore >= 60) grade = 'Standard';
  else if (roundedScore >= 50) grade = 'Fairly Hard';
  else if (roundedScore >= 30) grade = 'Hard';
  else grade = 'Very Hard';

  return { score: roundedScore, grade };
}
