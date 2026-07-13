'use client';

import React from 'react';
import {
  FileText,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { calculateReadingTime } from '../../../lib/reading-time';
import { calculateReadability } from '../../../lib/readability';
import { calculateKeywordDensity } from '../../../lib/keyword-density';
import { parseHeadingOutline } from '../../../lib/heading-outline';

interface ContentIntelligenceBarProps {
  contentText: string;
  contentHtml: string;
  focusKeyword: string;
}

export function ContentIntelligenceBar({
  contentText,
  contentHtml,
  focusKeyword
}: ContentIntelligenceBarProps) {
  // 1. Calculations
  const wordCount = contentText.trim().split(/\s+/).filter(w => w.length > 0).length || 0;
  const readingTime = calculateReadingTime(contentText);
  const readability = calculateReadability(contentText);
  
  // Keyword density
  const densities = focusKeyword 
    ? calculateKeywordDensity(contentText, [focusKeyword])
    : [];
  const keywordDensity = densities[0]?.density || 0;
  const keywordCount = densities[0]?.count || 0;

  // Heading hierarchy checks
  const headings = parseHeadingOutline(contentHtml);
  const invalidHeadings = headings.filter(h => !h.isValid);

  // Missing image alts check
  const hasImagesWithoutAlt = contentHtml.includes('<img') && 
    (contentHtml.includes('alt=""') || !contentHtml.includes('alt='));

  return (
    <div className="border border-slate-200 bg-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-6 shadow-xs text-xs">
      {/* Left side: stats cards */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-slate-600">
          <FileText className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="font-semibold text-slate-800">{wordCount}</span> words
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="font-semibold text-slate-800">{readingTime}</span> min read
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <div>
            Readability: <span className="font-semibold text-slate-800">{readability.score}</span> ({readability.grade})
          </div>
        </div>

        {focusKeyword && (
          <div className="flex items-center gap-2 text-slate-600">
            <ListTodo className="w-4 h-4 text-indigo-500" />
            <div>
              Keyword Density: <span className="font-semibold text-slate-800">{keywordDensity}%</span> ({keywordCount} times)
            </div>
          </div>
        )}
      </div>

      {/* Right side: quick alerts */}
      <div className="flex items-center gap-4">
        {hasImagesWithoutAlt && (
          <div className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            Missing image alt text!
          </div>
        )}

        {invalidHeadings.length > 0 ? (
          <div className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            Heading hierarchy error!
          </div>
        ) : (
          <div className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Semantic hierarchy clean
          </div>
        )}
      </div>
    </div>
  );
}
export default ContentIntelligenceBar;
