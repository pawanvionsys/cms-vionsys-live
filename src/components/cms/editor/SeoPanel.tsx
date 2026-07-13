'use client';

import React, { useState } from 'react';
import { FormField } from '../shared/FormField';
import { HelpCircle, Search, Share2, ToggleLeft, ToggleRight, X } from 'lucide-react';

interface SeoPanelProps {
  seo: any;
  onChange: (field: string, value: any) => void;
  title: string;
  excerpt: string;
  slug: string;
  contentType: 'blog' | 'case-study';
}

export function SeoPanel({
  seo = {},
  onChange,
  title,
  excerpt,
  slug,
  contentType
}: SeoPanelProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'serp' | 'social'>('serp');
  const [secKeywordInput, setSecKeywordInput] = useState('');

  // Fallbacks
  const metaTitle = seo.title || title || 'Untitled Post';
  const metaDesc = seo.description || excerpt || 'Enter meta description to display here...';
  const displayUrl = `https://vionsys.com/${contentType === 'blog' ? 'blog' : 'case-studies'}/${slug || 'your-slug'}`;

  const handleAddSecondaryKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && secKeywordInput.trim()) {
      e.preventDefault();
      const current = seo.secondaryKeywords || [];
      if (!current.includes(secKeywordInput.trim()) && current.length < 5) {
        onChange('secondaryKeywords', [...current, secKeywordInput.trim()]);
      }
      setSecKeywordInput('');
    }
  };

  const handleRemoveSecondaryKeyword = (kw: string) => {
    const current = seo.secondaryKeywords || [];
    onChange('secondaryKeywords', current.filter((k: string) => k !== kw));
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActivePreviewTab('serp')}
          className={`pb-2 px-1 cursor-pointer transition-colors ${
            activePreviewTab === 'serp'
              ? 'border-b-2 border-indigo-600 text-indigo-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Google SERP
        </button>
        <button
          type="button"
          onClick={() => setActivePreviewTab('social')}
          className={`pb-2 px-1 cursor-pointer transition-colors ${
            activePreviewTab === 'social'
              ? 'border-b-2 border-indigo-600 text-indigo-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Social (OG Card)
        </button>
      </div>

      {/* Previews */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[120px]">
        {activePreviewTab === 'serp' ? (
          /* Google SERP Preview */
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 block truncate">{displayUrl}</span>
            <h4 className="text-sm font-semibold text-blue-805 hover:underline cursor-pointer leading-tight truncate">
              {metaTitle}
            </h4>
            <p className="text-[11px] text-slate-600 leading-normal max-w-lg">
              {metaDesc}
            </p>
          </div>
        ) : (
          /* OG Preview */
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
            <div className="h-28 bg-slate-100 flex items-center justify-center text-slate-350 text-[10px] uppercase font-bold tracking-wider">
              {seo.ogImage ? (
                <img src={seo.ogImage} alt="OG Card" className="w-full h-full object-cover" />
              ) : (
                'Social Card Image Preview'
              )}
            </div>
            <div className="p-3 border-t border-slate-100">
              <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">Vionsys</span>
              <h5 className="text-[11px] font-bold text-slate-800 truncate leading-snug">{seo.ogTitle || metaTitle}</h5>
              <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                {seo.ogDescription || metaDesc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Forms inputs */}
      <div className="space-y-4">
        {/* Meta Title */}
        <FormField
          label="Meta Title"
          description={`${metaTitle.length}/60 characters`}
        >
          <input
            id="seo-title-input"
            type="text"
            placeholder="Focus keyword should be near the start..."
            value={seo.title || ''}
            onChange={e => onChange('title', e.target.value.substring(0, 60))}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </FormField>

        {/* Meta Description */}
        <FormField
          label="Meta Description"
          description={`${metaDesc.length}/160 characters`}
        >
          <textarea
            id="seo-description-input"
            rows={3}
            placeholder="Search engines show this snippet in list items..."
            value={seo.description || ''}
            onChange={e => onChange('description', e.target.value.substring(0, 160))}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 resize-none leading-relaxed"
          />
        </FormField>

        {/* Focus Keyword */}
        <FormField label="Focus Keyword">
          <input
            id="seo-focus-keyword-input"
            type="text"
            placeholder="e.g. Next.js performance"
            value={seo.focusKeyword || ''}
            onChange={e => onChange('focusKeyword', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </FormField>

        {/* Secondary Keywords */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Secondary Keywords (Max 5)
          </label>
          <input
            type="text"
            placeholder="Type keyword and press Enter"
            value={secKeywordInput}
            onChange={e => setSecKeywordInput(e.target.value)}
            onKeyDown={handleAddSecondaryKeyword}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(seo.secondaryKeywords || []).map((kw: string) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10px] font-semibold"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => handleRemoveSecondaryKeyword(kw)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Canonical URL */}
        <FormField label="Canonical URL">
          <input
            type="url"
            placeholder="https://vionsys.com/original-source"
            value={seo.canonicalUrl || ''}
            onChange={e => onChange('canonicalUrl', e.target.value || null)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </FormField>

        {/* Index / Follow Toggles */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Search Indexing</span>
            <button
              type="button"
              onClick={() => onChange('index', seo.index === undefined ? false : !seo.index)}
              className="text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              {seo.index === false ? (
                <span className="text-[11px] font-bold text-red-500">NOINDEX</span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600">INDEX</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Link Following</span>
            <button
              type="button"
              onClick={() => onChange('follow', seo.follow === undefined ? false : !seo.follow)}
              className="text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              {seo.follow === false ? (
                <span className="text-[11px] font-bold text-red-500">NOFOLLOW</span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600">FOLLOW</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SeoPanel;
