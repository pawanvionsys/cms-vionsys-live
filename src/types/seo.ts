export interface SeoMeta {
  title: string;
  description: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl?: string | null;
  index: boolean;
  follow: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCardType: 'summary' | 'summary_large_image';
}

export interface AeoGeoMeta {
  directAnswerPrompt?: string | null;
  snippetCandidate?: string | null; // max 50 words / 250 chars
  peopleAlsoAsk?: { question: string; answer: string }[] | null;
  semanticSummary?: string | null;
  keyTakeaways: string[];
  statsSources?: { label: string; url: string }[] | null;
  authorCredibility?: string | null;
  reviewedBy?: string | null;
  allowAiCrawler: boolean;
}

export interface SchemaSettings {
  type: 'BlogPosting' | 'Article' | 'HowTo' | 'FAQPage' | 'CaseStudy/WebPage';
  customSchemaJson?: any | null;
}

export interface SeoScore {
  seo: number;
  aeo: number;
  geo: number;
  suggestions: {
    type: 'error' | 'warning';
    message: string;
    field?: string;
  }[];
}
