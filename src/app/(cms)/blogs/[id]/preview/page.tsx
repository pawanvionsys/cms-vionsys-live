import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { requireAuthPage } from '@/features/auth/require-auth';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, BookOpen, Tag, Eye, Info, Sparkles, Award } from 'lucide-react';

interface BlogPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPreviewPage({ params }: BlogPreviewPageProps) {
  await requireAuthPage();
  const { id } = await params;

  const blog = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      tags: true,
      seoMeta: true,
      aeoGeoMeta: true,
      schemaSettings: true
    }
  });

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Premium Preview Banner */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 px-6 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Preview Mode</span>
            <h1 className="text-[11px] text-slate-400 font-medium mt-0.5">Viewing local draft layout of: <span className="text-white font-semibold">{blog.title}</span></h1>
          </div>
        </div>
        <Link
          href={`/blogs/${blog.id}/edit`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 active-press rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Editor
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* Core Article Canvas */}
        <article className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="w-full relative h-[400px] bg-slate-100 border-b border-slate-100">
              <img
                src={blog.featuredImage}
                alt={blog.featuredImageAlt || blog.title}
                className="w-full h-full object-cover"
              />
              {blog.featuredImageAlt && (
                <div className="absolute bottom-4 left-4 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md font-medium">
                  Alt text: {blog.featuredImageAlt}
                </div>
              )}
            </div>
          )}

          {/* Article Header */}
          <div className="p-8 pb-4 border-b border-slate-100 space-y-6">
            {/* Category and Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {blog.category && (
                <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 rounded-md tracking-wider">
                  {blog.category.name}
                </span>
              )}
              {blog.isFeatured && (
                <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 rounded-md tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Featured
                </span>
              )}
              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 rounded-md tracking-wider">
                {blog.status}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {blog.title}
            </h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-base text-slate-500 font-normal border-l-2 border-slate-200 pl-4 py-1 italic">
                {blog.excerpt}
              </p>
            )}

            {/* Author and Date Metadata */}
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-xs text-slate-500 font-medium pt-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                  {blog.author.name.charAt(0)}
                </div>
                <span>
                  By <strong className="text-slate-800 font-semibold">{blog.author.name}</strong>
                  {blog.guestAuthor && <span className="text-slate-400"> (Guest: {blog.guestAuthor})</span>}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Last saved {new Date(blog.updatedAt).toLocaleDateString()}</span>
              </div>
              {blog.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Published {new Date(blog.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* HTML Render Canvas */}
          <div className="p-8 pt-6">
            <div 
              className="preview-content editorjs-wrapper"
              dangerouslySetInnerHTML={{ __html: blog.contentHtml }} 
            />
          </div>

          {/* Tag Badges Footer */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="p-8 pt-0 border-t border-slate-50 flex flex-wrap gap-2 mt-4">
              {blog.tags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-md">
                  <Tag className="w-2.5 h-2.5" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Development Audit Intelligence Panels */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-4 h-4" /> SEO & Intelligence Metadata Check
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SEO Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-indigo-500" /> SERP Preview
              </h3>
              {blog.seoMeta ? (
                <div className="space-y-3">
                  <div className="border border-slate-100 p-3 rounded-lg bg-slate-50 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">Google Snippet</span>
                    <h4 className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer leading-tight">
                      {blog.seoMeta.title}
                    </h4>
                    <p className="text-[11px] text-green-700 font-normal">
                      vionsys.com/blog/{blog.slug}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {blog.seoMeta.description}
                    </p>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600 font-medium">
                    <p><strong className="font-semibold text-slate-800">Focus Keyword:</strong> {blog.seoMeta.focusKeyword}</p>
                    <p><strong className="font-semibold text-slate-800">Robots:</strong> {blog.seoMeta.index ? 'index' : 'noindex'}, {blog.seoMeta.follow ? 'follow' : 'nofollow'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No SEO Metadata configured.</p>
              )}
            </div>

            {/* AEO / GEO Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Engine (AEO) Context
              </h3>
              {blog.aeoGeoMeta ? (
                <div className="space-y-3 text-[11px] text-slate-600 font-medium">
                  {blog.aeoGeoMeta.snippetCandidate && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">AI Direct Answer Candidate</span>
                      <p className="text-slate-700 italic leading-relaxed">"{blog.aeoGeoMeta.snippetCandidate}"</p>
                    </div>
                  )}
                  {blog.aeoGeoMeta.keyTakeaways && blog.aeoGeoMeta.keyTakeaways.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Key Takeaways</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {blog.aeoGeoMeta.keyTakeaways.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p><strong className="font-semibold text-slate-800">Reviewed By:</strong> {blog.aeoGeoMeta.reviewedBy || 'N/A'}</p>
                  <p><strong className="font-semibold text-slate-800">AI Crawler Permission:</strong> {blog.aeoGeoMeta.allowAiCrawler ? 'Allowed' : 'Blocked'}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No AI Search Metadata configured.</p>
              )}
            </div>
          </div>

          {/* JSON-LD Schema Panel */}
          {blog.schemaSettings && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-500" /> Schema markup settings
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-550 font-medium">Target JSON-LD Schema Type:</span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono text-[10px] font-semibold">
                  {blog.schemaSettings.type}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Embedded CSS styles for parser content */}
      <style dangerouslySetInnerHTML={{__html: `
        .preview-content {
          font-family: inherit;
        }
        .preview-content p {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 1.25rem;
        }
        .preview-content h2 {
          font-size: 1.5rem;
          font-weight: 500 !important;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.025em;
        }
        .preview-content h3 {
          font-size: 1.25rem;
          font-weight: 500 !important;
          color: #0f172a;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .preview-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
          color: #334155;
        }
        .preview-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
          color: #334155;
        }
        .preview-content li {
          margin-bottom: 0.35rem;
        }
        .preview-content blockquote {
          border-left: 4px solid #3b82f6;
          background-color: #f8fafc;
          padding: 1rem 1.25rem;
          font-style: italic;
          color: #334155;
          margin: 1.5rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .preview-content pre {
          background-color: #0f172a;
          color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          font-size: 0.825rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }
        .preview-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9rem;
        }
        .preview-content th, .preview-content td {
          border: 1px solid #e2e8f0;
          padding: 0.65rem 0.75rem;
          text-align: left;
        }
        .preview-content th {
          background-color: #f8fafc;
          font-weight: 500 !important;
          color: #0f172a;
        }
        .preview-content figure {
          margin: 1.75rem 0;
          text-align: center;
        }
        .preview-content img {
          border-radius: 0.75rem;
          border: 1px solid #f1f5f9;
          max-width: 100%;
          height: auto;
        }
        .preview-content figcaption {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }
      `}} />
    </div>
  );
}
