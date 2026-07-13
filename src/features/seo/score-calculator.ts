import { SeoMeta, AeoGeoMeta, SeoScore } from '../../types/seo';
import { calculateKeywordDensity } from '../../lib/keyword-density';

export class ScoreCalculator {
  /**
   * Evaluates SEO, AEO, and GEO scores on active content.
   */
  static calculate(params: {
    title: string;
    excerpt: string;
    contentHtml: string;
    contentText: string;
    seo: Partial<SeoMeta> | null;
    aeoGeo: Partial<AeoGeoMeta> | null;
  }): SeoScore {
    const { title, excerpt, contentHtml, contentText, seo, aeoGeo } = params;
    const suggestions: { type: 'error' | 'warning'; message: string; field?: string }[] = [];

    // 1. Calculate SEO Score
    let seoScore = 0;
    const focusKeyword = seo?.focusKeyword || '';

    // Check title keyword
    if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
      seoScore += 20;
    } else if (focusKeyword) {
      suggestions.push({
        type: 'warning',
        message: 'Focus keyword not found in the page title.',
        field: 'title'
      });
    }

    // Check meta title length
    if (seo?.title) {
      const len = seo.title.length;
      if (len >= 30 && len <= 60) {
        seoScore += 20;
      } else {
        suggestions.push({
          type: 'warning',
          message: `Meta title length is ${len} chars. Recommended is 30-60.`,
          field: 'seo.title'
        });
      }
    } else {
      suggestions.push({
        type: 'error',
        message: 'SEO Meta Title is missing.',
        field: 'seo.title'
      });
    }

    // Check meta description length
    if (seo?.description) {
      const len = seo.description.length;
      if (len >= 120 && len <= 160) {
        seoScore += 20;
      } else {
        suggestions.push({
          type: 'warning',
          message: `Meta description length is ${len} chars. Recommended is 120-160.`,
          field: 'seo.description'
        });
      }
      if (focusKeyword && seo.description.toLowerCase().includes(focusKeyword.toLowerCase())) {
        seoScore += 20;
      } else if (focusKeyword) {
        suggestions.push({
          type: 'warning',
          message: 'Focus keyword not found in the meta description.',
          field: 'seo.description'
        });
      }
    } else {
      suggestions.push({
        type: 'error',
        message: 'SEO Meta Description is missing.',
        field: 'seo.description'
      });
    }

    // Check keyword density
    if (focusKeyword && contentText) {
      const densityResult = calculateKeywordDensity(contentText, [focusKeyword])[0];
      if (densityResult && densityResult.density >= 0.8 && densityResult.density <= 2.5) {
        seoScore += 20;
      } else if (densityResult) {
        suggestions.push({
          type: 'warning',
          message: `Keyword density is ${densityResult.density}%. Recommended density is 0.8% - 2.5%.`,
          field: 'seo.focusKeyword'
        });
      }
    } else {
      seoScore += 10; // partial fallback if no focus keyword defined yet
    }

    // 2. Calculate AEO Score
    let aeoScore = 0;
    if (aeoGeo?.directAnswerPrompt && aeoGeo.directAnswerPrompt.trim().length > 0) {
      aeoScore += 30;
    } else {
      suggestions.push({
        type: 'warning',
        message: 'Provide a direct answer prompt for voice and assistant search discovery.',
        field: 'aeoGeo.directAnswerPrompt'
      });
    }

    if (aeoGeo?.snippetCandidate && aeoGeo.snippetCandidate.trim().length > 0) {
      aeoScore += 30;
      const wordCount = aeoGeo.snippetCandidate.trim().split(/\s+/).length;
      if (wordCount > 50) {
        suggestions.push({
          type: 'warning',
          message: `Snippet candidate has ${wordCount} words. Keep it under 50 words for voice snippet cards.`,
          field: 'aeoGeo.snippetCandidate'
        });
      }
    } else {
      suggestions.push({
        type: 'warning',
        message: 'No voice search snippet candidate defined.',
        field: 'aeoGeo.snippetCandidate'
      });
    }

    if (aeoGeo?.peopleAlsoAsk && Array.isArray(aeoGeo.peopleAlsoAsk) && aeoGeo.peopleAlsoAsk.length > 0) {
      aeoScore += 40;
    } else {
      suggestions.push({
        type: 'warning',
        message: 'Add People Also Ask (Q&A) mappings for instant schema answer cards.',
        field: 'aeoGeo.peopleAlsoAsk'
      });
    }

    // 3. Calculate GEO Score (Generative Engine Optimization)
    let geoScore = 0;
    if (aeoGeo?.keyTakeaways && aeoGeo.keyTakeaways.length > 0) {
      geoScore += 40;
    } else {
      suggestions.push({
        type: 'warning',
        message: 'Add semantic Key Takeaways to summarize the B2B analysis for LLM crawlers.',
        field: 'aeoGeo.keyTakeaways'
      });
    }

    if (aeoGeo?.statsSources && Array.isArray(aeoGeo.statsSources) && aeoGeo.statsSources.length > 0) {
      geoScore += 30;
    } else {
      suggestions.push({
        type: 'warning',
        message: 'Link references or stats sources to establish high citation authority for AI search engines.',
        field: 'aeoGeo.statsSources'
      });
    }

    if (aeoGeo?.authorCredibility && aeoGeo.authorCredibility.trim().length > 0) {
      geoScore += 30;
    } else {
      suggestions.push({
        type: 'warning',
        message: 'Add credentials or author authority fields to meet Google EEAT and LLM trust standards.',
        field: 'aeoGeo.authorCredibility'
      });
    }

    return {
      seo: Math.min(100, seoScore),
      aeo: Math.min(100, aeoScore),
      geo: Math.min(100, geoScore),
      suggestions
    };
  }
}
