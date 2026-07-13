'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function CmsTopbar() {
  const pathname = usePathname();

  // Simple title resolver based on pathname
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/blogs/new')) return 'New Blog Post';
    if (pathname.includes('/blogs/') && pathname.endsWith('/edit')) return 'Edit Blog Post';
    if (pathname.startsWith('/blogs')) return 'Manage Blog Posts';
    if (pathname.startsWith('/case-studies/new')) return 'New Case Study';
    if (pathname.includes('/case-studies/') && pathname.endsWith('/edit')) return 'Edit Case Study';
    if (pathname.startsWith('/case-studies')) return 'Manage Case Studies';
    if (pathname.startsWith('/media')) return 'Media Assets Library';
    if (pathname.startsWith('/seo-tools')) return 'SEO & Crawling Tools';
    if (pathname.startsWith('/settings')) return 'CMS Settings';
    return 'Content Management';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20 shrink-0 w-full">
      <div>
        <h1 className="text-[14px] font-bold text-slate-800 tracking-tight uppercase">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick create action buttons */}
        {!pathname.includes('/new') && !pathname.includes('/edit') && (
          <div className="flex gap-2">
            <Link
              href="/blogs/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-brand-650 hover:bg-brand-700 active-press rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Write Blog
            </Link>
            <Link
              href="/case-studies/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active-press rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              Build Case Study
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default CmsTopbar;
