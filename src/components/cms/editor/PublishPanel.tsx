'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Save, Globe } from 'lucide-react';

interface PublishPanelProps {
  data: any;
  seo: any;
  aeoGeo: any;
  contentType: 'blog' | 'case-study';
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  onChecklistItemClick?: (fieldKey: string) => void;
}

interface Issue {
  type: 'blocker' | 'warning';
  message: string;
  field?: string;
}

export function PublishPanel({
  data,
  seo = {},
  aeoGeo = {},
  contentType,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
  onChecklistItemClick
}: PublishPanelProps) {
  const [issues, setIssues] = useState<Issue[]>([]);

  // Calculate blockers & warnings dynamically
  useEffect(() => {
    const list: Issue[] = [];

    // --- Blockers ---
    if (!data.title || !data.title.trim()) {
      list.push({ type: 'blocker', message: 'Title is missing or empty.', field: 'title' });
    }
    if (!data.slug || !data.slug.trim()) {
      list.push({ type: 'blocker', message: 'URL Slug is missing or empty.', field: 'slug' });
    }
    if (!seo.title || !seo.title.trim()) {
      list.push({ type: 'blocker', message: 'SEO Meta Title is empty.', field: 'seo.title' });
    }
    if (!seo.description || !seo.description.trim()) {
      list.push({ type: 'blocker', message: 'SEO Meta Description is empty.', field: 'seo.description' });
    }

    if (contentType === 'blog') {
      if (data.featuredImage && (!data.featuredImageAlt || !data.featuredImageAlt.trim())) {
        list.push({ type: 'blocker', message: 'Featured image is missing Alt text.', field: 'featuredImageAlt' });
      }
    } else {
      if (data.heroImage && (!data.heroImageAlt || !data.heroImageAlt.trim())) {
        list.push({ type: 'blocker', message: 'Hero image is missing Alt text.', field: 'heroImageAlt' });
      }
      if (!data.clientName || !data.clientName.trim()) {
        list.push({ type: 'blocker', message: 'Client Name is required.', field: 'clientName' });
      }
      if (data.clientApprovalStatus === 'PENDING') {
        list.push({ type: 'blocker', message: 'Client approval status is Pending.', field: 'clientApprovalStatus' });
      }
      if (!data.resultStats || data.resultStats.length < 2) {
        list.push({ type: 'blocker', message: 'Case study needs at least 2 metrics.', field: 'resultStats' });
      }
    }

    // --- Warnings ---
    if (seo.title && (seo.title.length < 30 || seo.title.length > 60)) {
      list.push({ type: 'warning', message: `Meta title is ${seo.title.length} chars (Target: 30-60).`, field: 'seo.title' });
    }
    if (seo.description && (seo.description.length < 120 || seo.description.length > 160)) {
      list.push({ type: 'warning', message: `Meta description is ${seo.description.length} chars (Target: 120-160).`, field: 'seo.description' });
    }
    if (!seo.focusKeyword || !seo.focusKeyword.trim()) {
      list.push({ type: 'warning', message: 'SEO Focus keyword is not defined.', field: 'seo.focusKeyword' });
    }
    if (data.serviceIds?.length === 0) {
      list.push({ type: 'warning', message: 'No related services associated.', field: 'serviceIds' });
    }
    if (!aeoGeo.directAnswerPrompt || !aeoGeo.directAnswerPrompt.trim()) {
      list.push({ type: 'warning', message: 'Direct Answer prompt is empty.', field: 'aeoGeo.directAnswerPrompt' });
    }
    if (!aeoGeo.keyTakeaways || aeoGeo.keyTakeaways.length === 0) {
      list.push({ type: 'warning', message: 'Key Takeaways are empty.', field: 'aeoGeo.keyTakeaways' });
    }

    setIssues(list);
  }, [data, seo, aeoGeo, contentType]);

  const blockers = issues.filter(i => i.type === 'blocker');
  const warnings = issues.filter(i => i.type === 'warning');
  const canPublish = blockers.length === 0;

  return (
    <div className="space-y-6 select-none">
      {/* Verification status report */}
      <div className="space-y-4">
        {blockers.length > 0 ? (
          <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-700 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              Publishing Blocked
            </div>
            <p className="text-[10px] text-rose-600 leading-normal">
              Click any blocker to jump to its input field:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-rose-700">
              {blockers.map((b, idx) => (
                <li key={idx}>
                  {b.field ? (
                    <button
                      type="button"
                      onClick={() => onChecklistItemClick?.(b.field!)}
                      className="text-left underline hover:text-rose-900 cursor-pointer decoration-dotted focus:outline-none font-semibold transition-colors"
                    >
                      {b.message}
                    </button>
                  ) : (
                    <span>{b.message}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl text-emerald-800 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              Content Verified
            </div>
            <p className="text-[10px] text-emerald-600 leading-normal">
              No critical blockers. Ready to publish on vionsys.com!
            </p>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl text-amber-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              Recommendations ({warnings.length})
            </div>
            <p className="text-[10px] text-amber-600 leading-normal">
              Click to refine recommended SEO fields:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-amber-700">
              {warnings.map((w, idx) => (
                <li key={idx}>
                  {w.field ? (
                    <button
                      type="button"
                      onClick={() => onChecklistItemClick?.(w.field!)}
                      className="text-left underline hover:text-amber-900 cursor-pointer decoration-dotted focus:outline-none font-semibold transition-colors"
                    >
                      {w.message}
                    </button>
                  ) : (
                    <span>{w.message}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active-press transition-all rounded-lg shadow-2xs cursor-pointer"
        >
          <Save className="w-4 h-4 text-slate-400" />
          {isSaving ? 'Saving Draft...' : 'Save Draft'}
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={!canPublish || isPublishing}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm active-press transition-all cursor-pointer ${
            canPublish
              ? 'bg-brand-600 hover:bg-brand-700'
              : 'bg-slate-350 cursor-not-allowed opacity-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          {isPublishing ? 'Publishing...' : 'Publish to vionsys.com'}
        </button>
      </div>
    </div>
  );
}

export default PublishPanel;
