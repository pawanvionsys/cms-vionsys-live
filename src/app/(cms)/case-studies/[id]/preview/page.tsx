import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { requireAuthPage } from '@/features/auth/require-auth';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, BookOpen, Star, Info, Sparkles, Award, ArrowUpRight, CheckCircle2, ChevronRight, Image, Eye, HelpCircle } from 'lucide-react';

interface CaseStudyPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseStudyPreviewPage({ params }: CaseStudyPreviewPageProps) {
  await requireAuthPage();
  const { id } = await params;

  const cs = await prisma.caseStudy.findUnique({
    where: { id },
    include: {
      author: true,
      resultStats: true,
      processSteps: {
        orderBy: { position: 'asc' }
      },
      mediaGallery: {
        orderBy: { position: 'asc' }
      },
      faqs: {
        orderBy: { position: 'asc' }
      },
      seoMeta: true,
      aeoGeoMeta: true,
      schemaSettings: true
    }
  });

  if (!cs) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-55 text-slate-800 font-sans pb-24">
      {/* Premium Preview Banner */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 px-6 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Preview Mode</span>
            <h1 className="text-[11px] text-slate-400 font-medium mt-0.5">Viewing local draft layout of: <span className="text-white font-semibold">{cs.title}</span></h1>
          </div>
        </div>
        <Link
          href={`/case-studies/${cs.id}/edit`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 active-press rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Editor
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* Core Case Study Canvas */}
        <article className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden space-y-10 pb-12">
          
          {/* Hero Header */}
          <div className="relative">
            {cs.heroImage ? (
              <div className="w-full h-[320px] bg-slate-100 relative">
                <img
                  src={cs.heroImage}
                  alt={cs.heroImageAlt || cs.title}
                  className="w-full h-full object-cover brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-[200px] bg-slate-900"></div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-white/20 backdrop-blur-xs text-white rounded-md tracking-wider">
                  {cs.industry}
                </span>
                <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-brand-500 text-white rounded-md tracking-wider">
                  {cs.engagementType.replace('_', ' ')}
                </span>
                {cs.isFeatured && (
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-500 text-white rounded-md tracking-wider flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-white" /> Featured Case Study
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3.5xl font-extrabold leading-tight">
                {cs.title}
              </h1>

              {/* Client meta */}
              <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span>Client: <strong className="text-white font-semibold">{cs.anonymizeClient ? 'Anonymous Client' : cs.clientName}</strong></span>
                {cs.clientLogo && !cs.anonymizeClient && (
                  <span className="w-4 h-4 rounded-full bg-white/20 inline-block overflow-hidden">
                    <img src={cs.clientLogo} alt="Logo" className="w-full h-full object-contain" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Excerpt Summary */}
          <div className="px-8">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 block mb-2">Executive Summary</span>
              <p className="text-slate-655 text-sm leading-relaxed font-normal">
                {cs.excerpt}
              </p>
            </div>
          </div>

          {/* High-Impact Result Stats Grid */}
          {cs.resultStats && cs.resultStats.length > 0 && (
            <div className="px-8 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Outcomes & Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {cs.resultStats.map((stat) => (
                  <div key={stat.id} className="bg-gradient-to-br from-brand-50 to-white border border-brand-100/60 rounded-xl p-5 shadow-3xs flex flex-col justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-brand-700 block tracking-tight">{stat.value}</span>
                      <span className="text-xs font-bold text-slate-800 block mt-1">{stat.label}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-2 leading-relaxed">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Content Challenge & Approach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 border-t border-slate-100 pt-8">
            {/* The Challenge */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-l-3 border-rose-500 pl-3 uppercase tracking-wider">The Challenge</h2>
              <div 
                className="preview-content text-slate-700 text-sm leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: cs.challengeHtml }}
              />
            </div>

            {/* The Approach */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-l-3 border-indigo-500 pl-3 uppercase tracking-wider">The Approach & Execution</h2>
              <div 
                className="preview-content text-slate-700 text-sm leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: cs.approachHtml }}
              />
            </div>
          </div>

          {/* Implementation Process Timeline */}
          {cs.processSteps && cs.processSteps.length > 0 && (
            <div className="px-8 border-t border-slate-100 pt-8 space-y-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Implementation Journey</h2>
              <div className="relative border-l border-slate-200 ml-3 space-y-6">
                {cs.processSteps.map((step, idx) => (
                  <div key={step.id} className="relative pl-6">
                    <span className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center border-4 border-white shadow-3xs">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{step.title}</h3>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed mt-1">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Gallery Grid */}
          {cs.mediaGallery && cs.mediaGallery.length > 0 && (
            <div className="px-8 border-t border-slate-100 pt-8 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Image className="w-3.5 h-3.5" /> Project Media Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {cs.mediaGallery.map((item) => (
                  <div key={item.id} className="group relative border border-slate-100 rounded-xl overflow-hidden shadow-3xs bg-slate-50 aspect-video">
                    <img src={item.imagePath} alt={item.alt || ''} className="w-full h-full object-cover" />
                    {item.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 p-2 text-white text-[9px] truncate">
                        {item.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial Quote */}
          {cs.testimonialQuote && (
            <div className="px-8 border-t border-slate-100 pt-8">
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-6 relative overflow-hidden">
                <span className="text-[60px] leading-[0px] text-indigo-200/50 font-serif absolute -top-2 left-2 select-none">“</span>
                <blockquote className="relative z-10 text-slate-700 italic text-sm leading-relaxed pl-6">
                  {cs.testimonialQuote}
                </blockquote>
                <div className="mt-4 flex items-center gap-3 pl-6">
                  {cs.testimonialImage && (
                    <img src={cs.testimonialImage} alt={cs.testimonialName || ''} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{cs.testimonialName}</h4>
                    <p className="text-[10px] text-slate-450 font-medium">{cs.testimonialDesignation}, {cs.testimonialCompany}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {cs.faqs && cs.faqs.length > 0 && (
            <div className="px-8 border-t border-slate-100 pt-8 space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-50 rounded-lg text-brand-650">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                {cs.faqs.map((faq) => (
                  <div key={faq.id} className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 shadow-3xs hover:shadow-2xs transition-all">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-start gap-2">
                      <span className="text-brand-600 font-extrabold">Q:</span>
                      {faq.question}
                    </h3>
                    <p className="text-slate-500 text-[11.5px] leading-relaxed mt-2 pl-4 border-l border-slate-200">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Box */}
          {cs.ctaHeading && (
            <div className="px-8 border-t border-slate-100 pt-8">
              <div className="bg-slate-900 text-white rounded-2xl p-8 text-center space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider">{cs.ctaHeading}</h3>
                {cs.ctaBody && <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">{cs.ctaBody}</p>}
                {cs.ctaButtonLabel && cs.ctaButtonUrl && (
                  <Link href={cs.ctaButtonUrl} className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 active-press rounded-lg shadow-sm mt-2 transition-all">
                    {cs.ctaButtonLabel}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
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
              {cs.seoMeta ? (
                <div className="space-y-3">
                  <div className="border border-slate-100 p-3 rounded-lg bg-slate-50 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-mono">Google Snippet</span>
                    <h4 className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer leading-tight">
                      {cs.seoMeta.title}
                    </h4>
                    <p className="text-[11px] text-green-700 font-normal">
                      vionsys.com/case-studies/{cs.slug}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {cs.seoMeta.description}
                    </p>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600 font-medium">
                    <p><strong className="font-semibold text-slate-800">Focus Keyword:</strong> {cs.seoMeta.focusKeyword}</p>
                    <p><strong className="font-semibold text-slate-800">Robots:</strong> {cs.seoMeta.index ? 'index' : 'noindex'}, {cs.seoMeta.follow ? 'follow' : 'nofollow'}</p>
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
              {cs.aeoGeoMeta ? (
                <div className="space-y-3 text-[11px] text-slate-600 font-medium">
                  {cs.aeoGeoMeta.snippetCandidate && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">AI Direct Answer Candidate</span>
                      <p className="text-slate-700 italic leading-relaxed">"{cs.aeoGeoMeta.snippetCandidate}"</p>
                    </div>
                  )}
                  {cs.aeoGeoMeta.keyTakeaways && cs.aeoGeoMeta.keyTakeaways.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Key Takeaways</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {cs.aeoGeoMeta.keyTakeaways.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p><strong className="font-semibold text-slate-800">Reviewed By:</strong> {cs.aeoGeoMeta.reviewedBy || 'N/A'}</p>
                  <p><strong className="font-semibold text-slate-800">AI Crawler Permission:</strong> {cs.aeoGeoMeta.allowAiCrawler ? 'Allowed' : 'Blocked'}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No AI Search Metadata configured.</p>
              )}
            </div>
          </div>

          {/* JSON-LD Schema Panel */}
          {cs.schemaSettings && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-500" /> Schema markup settings
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-550 font-medium">Target JSON-LD Schema Type:</span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono text-[10px] font-semibold">
                  {cs.schemaSettings.type}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Embedded CSS styles for parser content */}
      <style dangerouslySetInnerHTML={{__html: `
        .preview-content p {
          font-size: 0.95rem;
          line-height: 1.65;
          color: #475569;
          margin-bottom: 1rem;
        }
        .preview-content h3 {
          font-size: 1.15rem;
          font-weight: 500 !important;
          color: #0f172a;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .preview-content ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 1rem;
          color: #475569;
        }
        .preview-content ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin-bottom: 1rem;
          color: #475569;
        }
        .preview-content li {
          margin-bottom: 0.25rem;
        }
        .preview-content blockquote {
          border-left: 4px solid #3b82f6;
          background-color: #f8fafc;
          padding: 0.75rem 1rem;
          font-style: italic;
          color: #475569;
          margin: 1.25rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .preview-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.85rem;
        }
        .preview-content th, .preview-content td {
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.65rem;
          text-align: left;
        }
        .preview-content th {
          background-color: #f8fafc;
          font-weight: 500 !important;
          color: #0f172a;
        }
        .preview-content img {
          border-radius: 0.5rem;
          max-width: 100%;
          height: auto;
        }
      `}} />
    </div>
  );
}
