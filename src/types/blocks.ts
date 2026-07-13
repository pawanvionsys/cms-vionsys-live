export type BlockType =
  | 'faq'
  | 'stats'
  | 'cta'
  | 'testimonial'
  | 'process'
  | 'comparison'
  | 'callout'
  | 'image_caption'
  | 'embed'
  | 'toc'
  | 'author_bio'
  | 'key_takeaways'
  | 'stats_sources';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface FAQBlock extends BaseBlock {
  type: 'faq';
  items: { question: string; answer: string }[];
}

export interface StatItem {
  value: string;
  label: string;
  description: string;
}

export interface StatsBlock extends BaseBlock {
  type: 'stats';
  items: StatItem[];
}

export interface CTABlock extends BaseBlock {
  type: 'cta';
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  style?: 'primary' | 'secondary' | 'accent';
}

export interface TestimonialBlock extends BaseBlock {
  type: 'testimonial';
  quote: string;
  name: string;
  designation: string;
  company: string;
  avatarUrl?: string;
}

export interface ProcessItem {
  title: string;
  description: string;
  icon?: string;
}

export interface ProcessBlock extends BaseBlock {
  type: 'process';
  items: ProcessItem[];
}

export interface ComparisonBlock extends BaseBlock {
  type: 'comparison';
  title?: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  title?: string;
  content: string;
  style: 'info' | 'warning' | 'error' | 'success';
}

export interface ImageCaptionBlock extends BaseBlock {
  type: 'image_caption';
  imageUrl: string;
  altText: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right' | 'full';
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  provider: 'youtube' | 'vimeo' | 'linkedin';
  url: string;
  embedCode?: string;
}

export interface TableOfContentsBlock extends BaseBlock {
  type: 'toc';
  title?: string;
  headings: { text: string; id: string; level: number }[];
}

export interface AuthorBioBlock extends BaseBlock {
  type: 'author_bio';
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  socialLinks?: { provider: string; url: string }[];
}

export interface KeyTakeawaysBlock extends BaseBlock {
  type: 'key_takeaways';
  title?: string;
  items: string[];
}

export interface StatisticsSourcesBlock extends BaseBlock {
  type: 'stats_sources';
  title?: string;
  sources: { label: string; url: string }[];
}

export type ContentBlock =
  | FAQBlock
  | StatsBlock
  | CTABlock
  | TestimonialBlock
  | ProcessBlock
  | ComparisonBlock
  | CalloutBlock
  | ImageCaptionBlock
  | EmbedBlock
  | TableOfContentsBlock
  | AuthorBioBlock
  | KeyTakeawaysBlock
  | StatisticsSourcesBlock;
