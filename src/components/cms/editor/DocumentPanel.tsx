'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Plus, X } from 'lucide-react';
import { FormField } from '../shared/FormField';
import { MediaPicker } from '../media/MediaPicker';

interface DocumentPanelProps {
  data: any;
  onChange: (field: string, value: any) => void;
  categories: { id: string; name: string }[];
  services: { id: string; label: string }[];
  caseStudies?: { id: string; title: string }[];
  blogPosts?: { id: string; title: string }[];
  contentType: 'blog' | 'case-study';
  onImageSelected?: (url: string, alt: string) => void;
}

export function DocumentPanel({
  data,
  onChange,
  categories,
  services,
  caseStudies = [],
  blogPosts = [],
  contentType,
  onImageSelected
}: DocumentPanelProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = data.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        onChange('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = data.tags || [];
    onChange('tags', currentTags.filter((t: string) => t !== tag));
  };

  return (
    <div className="space-y-5">
      {/* Featured/Hero Image */}
      <div className="pl-2.5 border-l-4 border-l-rose-400">
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          {contentType === 'blog' ? 'Featured Image' : 'Hero Image'}
        </label>
        {data.featuredImage ? (
          <div className="relative border border-slate-200 rounded-xl overflow-hidden group ring-1 ring-rose-100">
            <img
              src={data.featuredImage}
              alt={data.featuredImageAlt || ''}
              className="w-full h-32 object-cover"
            />
            <button
              onClick={() => {
                onChange('featuredImage', null);
                onChange('featuredImageAlt', null);
              }}
              className="absolute top-2 right-2 p-1 bg-slate-900/60 hover:bg-slate-950 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="p-3 border-t border-slate-100 bg-white">
              <input
                id="document-image-alt-input"
                type="text"
                placeholder="Alt text (Required to publish)"
                value={data.featuredImageAlt || ''}
                onChange={e => onChange('featuredImageAlt', e.target.value)}
                className="w-full text-[11px] px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full border-2 border-dashed border-rose-200 hover:border-rose-300 rounded-xl py-8 flex flex-col items-center justify-center text-rose-400 gap-1 hover:text-rose-500 transition-colors cursor-pointer bg-rose-50/40"
          >
            <ImageIcon className="w-6 h-6" />
            <span className="text-[11px] font-semibold">Choose image</span>
          </button>
        )}
      </div>

      {contentType === 'blog' ? (
        <>
          {/* Category Dropdown */}
          <FormField label="Category">
            <select
              value={data.categoryId || ''}
              onChange={e => onChange('categoryId', e.target.value || null)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Uncategorized</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Guest Author Override */}
          <FormField label="Guest Author Override" description="Leave empty to use session profile.">
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={data.guestAuthor || ''}
              onChange={e => onChange('guestAuthor', e.target.value || null)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </FormField>
        </>
      ) : (
        <>
          {/* Client Details */}
          <FormField label="Client Name" required>
            <input
              id="document-client-name-input"
              type="text"
              placeholder="e.g. Acme Corp"
              value={data.clientName || ''}
              onChange={e => onChange('clientName', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </FormField>

        </>
      )}

      {/* Excerpt */}
      <div className="pl-2.5 border-l-4 border-l-amber-400">
        <FormField
          label="Excerpt"
          description={`${(data.excerpt || '').length}/160 characters (Required for SEO tags)`}
        >
          <textarea
            rows={3}
            placeholder="Brief semantic summary of the post..."
            value={data.excerpt || ''}
            onChange={e => onChange('excerpt', e.target.value.substring(0, 160))}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 resize-none leading-relaxed"
          />
        </FormField>
      </div>

      {/* Tags Input */}
      <div className="pl-2.5 border-l-4 border-l-yellow-400">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tags</label>
        <input
          type="text"
          placeholder="Type tag and press Enter"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
        />
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {(data.tags || []).map((t: string) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-semibold"
            >
              {t}
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                className="hover:text-rose-500 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Relations: Related services */}
      <div className="pl-2.5 border-l-4 border-l-emerald-400">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Related Services</label>
        <div className="border border-slate-200 rounded-lg p-3 max-h-36 overflow-y-auto space-y-1.5 bg-emerald-50/20">
          {services.map(s => {
            const isChecked = (data.serviceIds || []).includes(s.id);
            return (
              <label key={s.id} className="flex items-center gap-2 text-xs text-slate-650 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={e => {
                    const current = data.serviceIds || [];
                    if (e.target.checked) {
                      onChange('serviceIds', [...current, s.id]);
                    } else {
                      onChange('serviceIds', current.filter((id: string) => id !== s.id));
                    }
                  }}
                  className="rounded-sm border-slate-350 text-emerald-600"
                />
                {s.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Internal notes */}
      <FormField label="Internal Notes (Never exposed publicly)">
        <textarea
          rows={2}
          placeholder="Workflow discussions or publisher notes..."
          value={data.internalNote || ''}
          onChange={e => onChange('internalNote', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 resize-none"
        />
      </FormField>

      {/* Image Library Picker */}
      <MediaPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url, alt) => {
          onChange('featuredImage', url);
          onChange('featuredImageAlt', alt || '');
          onImageSelected?.(url, alt || '');
        }}
      />
    </div>
  );
}
export default DocumentPanel;
