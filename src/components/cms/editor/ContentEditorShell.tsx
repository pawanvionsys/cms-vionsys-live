'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Link2,
  Plus,
  Trash,
  FileText,
  HelpCircle,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from './RichTextEditor';
import { EditorSidebar } from './EditorSidebar';
import { ContentIntelligenceBar } from './ContentIntelligenceBar';
import { StatusBadge } from '../shared/StatusBadge';
import { INDUSTRIES_LIST } from '@/config/taxonomy';

interface ContentEditorShellProps {
  id?: string;
  initialData?: any;
  contentType: 'blog' | 'case-study';
  categories: { id: string; name: string }[];
  services: { id: string; label: string }[];
}

export function ContentEditorShell({
  id,
  initialData,
  contentType,
  categories,
  services
}: ContentEditorShellProps) {
  const router = useRouter();
  const [isNew] = useState(!id);

  // 1. Form States
  const [docData, setDocData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    featuredImage: initialData?.featuredImage || initialData?.heroImage || null,
    featuredImageAlt: initialData?.featuredImageAlt || initialData?.heroImageAlt || null,
    categoryId: initialData?.categoryId || null,
    tags: initialData?.tags || [],
    isFeatured: initialData?.isFeatured || false,
    guestAuthor: initialData?.guestAuthor || null,
    internalNote: initialData?.internalNote || null,
    serviceIds: initialData?.serviceIds || [],
    caseStudyIds: initialData?.caseStudyIds || [],
    contentBriefUrl: initialData?.contentBriefUrl || null,
    status: initialData?.status || 'DRAFT',
    
    // Case study specific structured fields
    clientName: initialData?.clientName || '',
    clientLogo: initialData?.clientLogo || null,
    industry: initialData?.industry || '',
    engagementType: initialData?.engagementType || 'PROJECT',
    testimonialQuote: initialData?.testimonialQuote || null,
    testimonialName: initialData?.testimonialName || null,
    testimonialDesignation: initialData?.testimonialDesignation || null,
    testimonialCompany: initialData?.testimonialCompany || null,
    testimonialImage: initialData?.testimonialImage || null,
    ctaHeading: initialData?.ctaHeading || null,
    ctaBody: initialData?.ctaBody || null,
    ctaButtonLabel: initialData?.ctaButtonLabel || null,
    ctaButtonUrl: initialData?.ctaButtonUrl || null,
    resultStats: initialData?.resultStats || [],
    processSteps: initialData?.processSteps || [],
    mediaGallery: initialData?.mediaGallery || [],
    faqs: initialData?.faqs || []
  });

  // Tiptap Content
  const [contentHtml, setContentHtml] = useState(
    contentType === 'blog'
      ? initialData?.contentHtml || ''
      : initialData?.challengeHtml || '' // Case studies load challengeHtml as main content block
  );
  const [contentJson, setContentJson] = useState(
    contentType === 'blog'
      ? initialData?.contentJson || {}
      : initialData?.challengeJson || {}
  );
  const [contentText, setContentText] = useState(
    contentType === 'blog'
      ? initialData?.contentText || ''
      : initialData?.excerpt || ''
  );

  // SEO, AEO/GEO, Schema states
  const [seo, setSeo] = useState({
    title: initialData?.seo?.title || '',
    description: initialData?.seo?.description || '',
    focusKeyword: initialData?.seo?.focusKeyword || '',
    secondaryKeywords: initialData?.seo?.secondaryKeywords || [],
    canonicalUrl: initialData?.seo?.canonicalUrl || '',
    index: initialData?.seo?.index !== false,
    follow: initialData?.seo?.follow !== false,
    ogTitle: initialData?.seo?.ogTitle || '',
    ogDescription: initialData?.seo?.ogDescription || '',
    ogImage: initialData?.seo?.ogImage || '',
    twitterCardType: initialData?.seo?.twitterCardType || 'summary_large_image'
  });

  const [aeoGeo, setAeoGeo] = useState({
    directAnswerPrompt: initialData?.aeoGeo?.directAnswerPrompt || '',
    snippetCandidate: initialData?.aeoGeo?.snippetCandidate || '',
    peopleAlsoAsk: initialData?.aeoGeo?.peopleAlsoAsk || [],
    semanticSummary: initialData?.aeoGeo?.semanticSummary || '',
    keyTakeaways: initialData?.aeoGeo?.keyTakeaways || [],
    statsSources: initialData?.aeoGeo?.statsSources || [],
    authorCredibility: initialData?.aeoGeo?.authorCredibility || '',
    reviewedBy: initialData?.aeoGeo?.reviewedBy || '',
    allowAiCrawler: initialData?.aeoGeo?.allowAiCrawler !== false
  });

  const [schema, setSchema] = useState({
    type: initialData?.schema?.type || (contentType === 'blog' ? 'BlogPosting' : 'CaseStudy/WebPage'),
    customSchemaJson: initialData?.schema?.customSchemaJson || null
  });

  // Autosave and Loading indicators
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lifted Sidebar States for Smooth Synchronized Animations
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'doc' | 'seo' | 'aeo' | 'schema' | 'publish'>('doc');

  const scrollToField = (fieldKey: string) => {
    let targetTab: 'doc' | 'seo' | 'aeo' | 'schema' | 'publish' | null = null;
    let inputId = '';

    if (fieldKey === 'title') {
      inputId = 'document-title-input';
    } else if (fieldKey === 'slug') {
      inputId = 'document-slug-input';
    } else if (fieldKey === 'featuredImageAlt' || fieldKey === 'heroImageAlt') {
      targetTab = 'doc';
      inputId = 'document-image-alt-input';
    } else if (fieldKey === 'resultStats') {
      targetTab = 'doc';
      inputId = 'document-result-stats-section';
    } else if (fieldKey === 'faqs') {
      targetTab = 'doc';
      inputId = 'document-faqs-section';
    } else if (fieldKey === 'clientName') {
      targetTab = 'doc';
      inputId = 'document-client-name-input';
    } else if (fieldKey.startsWith('seo.')) {
      targetTab = 'seo';
      if (fieldKey === 'seo.title') inputId = 'seo-title-input';
      if (fieldKey === 'seo.description') inputId = 'seo-description-input';
    } else if (fieldKey === 'schema.type') {
      targetTab = 'schema';
      inputId = 'schema-type-select';
    } else if (fieldKey === 'authorId') {
      targetTab = 'doc';
      inputId = 'document-author-select';
    }

    if (targetTab) {
      setSidebarTab(targetTab);
      setSidebarOpen(true);
    }

    setTimeout(() => {
      const el = document.getElementById(inputId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 150);
  };

  // Track changes to trigger save
  const hasChangesRef = useRef(false);
  const isSavingRef = useRef(false);
  const docDataRef = useRef({ docData, contentHtml, contentJson, contentText, seo, aeoGeo, schema });

  useEffect(() => {
    docDataRef.current = { docData, contentHtml, contentJson, contentText, seo, aeoGeo, schema };
  }, [docData, contentHtml, contentJson, contentText, seo, aeoGeo, schema]);

  // Handle any field update
  const updateField = (field: string, value: any) => {
    setDocData(prev => ({ ...prev, [field]: value }));
    hasChangesRef.current = true;
    setSaveStatus('unsaved');
  };

  const updateSeo = (field: string, value: any) => {
    setSeo(prev => ({ ...prev, [field]: value }));
    hasChangesRef.current = true;
    setSaveStatus('unsaved');
  };

  const updateAeoGeo = (field: string, value: any) => {
    setAeoGeo(prev => ({ ...prev, [field]: value }));
    hasChangesRef.current = true;
    setSaveStatus('unsaved');
  };

  const updateSchema = (field: string, value: any) => {
    setSchema(prev => ({ ...prev, [field]: value }));
    hasChangesRef.current = true;
    setSaveStatus('unsaved');
  };

  // --- SAVE OPERATION ---
  const handleSave = async (isDraft = true, statusOverride?: string) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setSaveStatus('saving');
    setErrorMessage(null);

    const activeState = docDataRef.current;
    
    // Prepare endpoint
    const route = contentType === 'blog' ? '/api/cms/blogs' : '/api/cms/case-studies';
    const endpoint = id ? `${route}/${id}` : route;
    const method = id ? 'PUT' : 'POST';

    // Format body data
    const body: any = {
      ...activeState.docData,
      contentHtml: activeState.contentHtml,
      contentJson: activeState.contentJson,
      seo: activeState.seo,
      aeoGeo: activeState.aeoGeo,
      schema: activeState.schema
    };

    if (contentType === 'case-study') {
      body.challengeHtml = activeState.contentHtml;
      body.challengeJson = activeState.contentJson;
      body.approachHtml = initialData?.approachHtml || '';
      body.approachJson = initialData?.approachJson || {};
    }

    if (statusOverride) {
      body.status = statusOverride;
    } else if (isDraft) {
      body.status = 'DRAFT';
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const resData = await res.json();

      if (!resData.success) {
        throw new Error(resData.error?.message || 'Failed to save document.');
      }

      hasChangesRef.current = false;
      setSaveStatus('saved');
      
      // If it was a new document, redirect to the edit path
      if (isNew && resData.data?.id) {
        router.push(
          contentType === 'blog'
            ? `/blogs/${resData.data.id}/edit`
            : `/case-studies/${resData.data.id}/edit`
        );
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setErrorMessage(err.message || 'An error occurred during save.');
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  // --- PUBLISH OPERATION ---
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await handleSave(false, 'PUBLISHED');
      updateField('status', 'PUBLISHED');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  // Autosave interval loop (30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (hasChangesRef.current && id) {
        handleSave(true);
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [id]);

  // Autosave on tab blur
  useEffect(() => {
    const handleBlur = () => {
      if (hasChangesRef.current && id) {
        handleSave(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [id]);

  // Case Study section accordion states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    challenge: true,
    results: false,
    testimonial: false,
    cta: false,
    faqs: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddStat = () => {
    const current = docData.resultStats || [];
    updateField('resultStats', [...current, { value: '', label: '', description: '' }]);
  };

  const handleUpdateStat = (index: number, key: string, val: string) => {
    const current = [...(docData.resultStats || [])];
    current[index] = { ...current[index], [key]: val };
    updateField('resultStats', current);
  };

  const handleRemoveStat = (index: number) => {
    const current = [...(docData.resultStats || [])];
    current.splice(index, 1);
    updateField('resultStats', current);
  };

  const handleAddFaq = () => {
    const current = docData.faqs || [];
    updateField('faqs', [...current, { question: '', answer: '' }]);
  };

  const handleUpdateFaq = (index: number, key: string, val: string) => {
    const current = [...(docData.faqs || [])];
    current[index] = { ...current[index], [key]: val };
    updateField('faqs', current);
  };

  const handleRemoveFaq = (index: number) => {
    const current = [...(docData.faqs || [])];
    current.splice(index, 1);
    updateField('faqs', current);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/20">
      {/* Editor Top Bar */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <Link
            href={contentType === 'blog' ? '/blogs' : '/case-studies'}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <StatusBadge status={docData.status} />
          
          {/* Save Status Indicators */}
          <span className="text-xs text-slate-400 font-medium">
            {saveStatus === 'saved' && 'Autosaved'}
            {saveStatus === 'saving' && 'Saving draft...'}
            {saveStatus === 'unsaved' && 'Unsaved changes'}
            {saveStatus === 'error' && 'Save failed'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {id && (
            <>
              <Link
                href={contentType === 'blog' ? `/blogs/${id}/preview` : `/case-studies/${id}/preview`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active-press rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Local Preview
              </Link>
              <Link
                href={`/api/cms/preview?id=${id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="External Live site redirect preview"
              >
                <Globe className="w-3.5 h-3.5" />
                Live URL
              </Link>
            </>
          )}
          
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-755 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Editor Inner Layout Workspace */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
        {contentType === 'case-study' ? (
          /* Structured Card Sections for Case Studies */
          <div className="flex-1 flex flex-col p-8 overflow-y-auto gap-6 bg-slate-50/20 max-w-4xl mx-auto w-full pb-20">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Document Title / Header area */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <input
                id="document-title-input"
                type="text"
                placeholder="Case Study Title (e.g. Scaling HealthTech SaaS Platform)"
                value={docData.title}
                onChange={e => {
                  const val = e.target.value;
                  updateField('title', val);
                  if (isNew) {
                    updateField(
                      'slug',
                      val
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '')
                    );
                  }
                }}
                className="w-full text-2xl font-extrabold text-slate-900 border-none outline-hidden placeholder-slate-200 focus:ring-0 leading-tight focus:border-transparent focus:box-shadow-none"
              />
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-medium text-slate-500">https://vionsys.com/case-studies/</span>
                <input
                  id="document-slug-input"
                  type="text"
                  value={docData.slug}
                  onChange={e => updateField('slug', e.target.value)}
                  placeholder="case-study-slug"
                  className="border-b border-slate-200 hover:border-slate-400 focus:border-indigo-500 outline-hidden pb-0.5 px-0.5 bg-transparent font-semibold text-slate-700"
                />
              </div>
            </div>

            {/* Section 1: Client & Project Details */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('client')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-brand-50 rounded-lg text-brand-650">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Client & Project</span>
                    <span className="text-[10px] text-slate-400">Define client business profiles and engagement dynamics</span>
                  </div>
                </div>
                {expandedSections.client ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              
              {expandedSections.client && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Client Name</label>
                      <input
                        id="document-client-name-input"
                        type="text"
                        placeholder="e.g. Acme Health"
                        value={docData.clientName}
                        onChange={e => updateField('clientName', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Industry</label>
                      <select
                        value={docData.industry || ''}
                        onChange={e => updateField('industry', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white cursor-pointer"
                      >
                        <option value="">Select Industry...</option>
                        {INDUSTRIES_LIST.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Challenge (The Main Editor canvas) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('challenge')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-brand-50 rounded-lg text-brand-650">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Challenge & Canvas</span>
                    <span className="text-[10px] text-slate-400">Describe the core client challenge and context details</span>
                  </div>
                </div>
                {expandedSections.challenge ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSections.challenge && (
                <div className="p-5 border-t border-slate-100 bg-white min-h-[420px] editorjs-wrapper">
                  <RichTextEditor
                    initialJson={contentJson}
                    onChange={(html, json, text) => {
                      setContentHtml(html);
                      setContentJson(json);
                      setContentText(text);
                      hasChangesRef.current = true;
                      setSaveStatus('unsaved');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Section 3: Results Metrics */}
            <div id="document-result-stats-section" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('results')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-brand-50 rounded-lg text-brand-650">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Results & Metrics</span>
                    <span className="text-[10px] text-slate-400">Minimum 2 metrics demonstrating quantitative results</span>
                  </div>
                </div>
                {expandedSections.results ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSections.results && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/10 space-y-4">
                  <div className="space-y-3">
                    {(docData.resultStats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-3 relative shadow-3xs">
                        <button
                          type="button"
                          onClick={() => handleRemoveStat(idx)}
                          className="absolute top-3 right-3 p-1 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex flex-col gap-1.5 col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Metric Value</label>
                            <input
                              type="text"
                              placeholder="e.g. +145% or $1.2M"
                              value={stat.value}
                              onChange={e => handleUpdateStat(idx, 'value', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Label / Dimension</label>
                            <input
                              type="text"
                              placeholder="e.g. Monthly Active Users growth"
                              value={stat.label}
                              onChange={e => handleUpdateStat(idx, 'label', e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Context / Details</label>
                          <input
                            type="text"
                            placeholder="Brief context detailing how this metric was tracked..."
                            value={stat.description || ''}
                            onChange={e => handleUpdateStat(idx, 'description', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white"
                          />
                        </div>
                      </div>
                    ))}
                    {(docData.resultStats || []).length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center py-6">No results metrics added. Please add at least 2 metrics to publish.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg active-press transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Metric
                  </button>
                </div>
              )}
            </div>

            {/* Section 4: Testimonial */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('testimonial')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-brand-50 rounded-lg text-brand-650">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Client Testimonial</span>
                    <span className="text-[10px] text-slate-400">Include quotes and client endorsements</span>
                  </div>
                </div>
                {expandedSections.testimonial ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSections.testimonial && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/10 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Quote Description</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Working with Vionsys allowed us to unlock scalable content pipelines and drive real growth..."
                      value={docData.testimonialQuote || ''}
                      onChange={e => updateField('testimonialQuote', e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white resize-none leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Author Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={docData.testimonialName || ''}
                        onChange={e => updateField('testimonialName', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. CTO"
                        value={docData.testimonialDesignation || ''}
                        onChange={e => updateField('testimonialDesignation', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Company</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Health"
                        value={docData.testimonialCompany || ''}
                        onChange={e => updateField('testimonialCompany', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: CTA Block */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('cta')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-brand-50 rounded-lg text-brand-650">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Call to Action (CTA)</span>
                    <span className="text-[10px] text-slate-400">Configure page callouts and lead conversions</span>
                  </div>
                </div>
                {expandedSections.cta ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSections.cta && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">CTA Heading</label>
                      <input
                        type="text"
                        placeholder="e.g. Ready to transform your infrastructure?"
                        value={docData.ctaHeading || ''}
                        onChange={e => updateField('ctaHeading', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">CTA Description</label>
                      <input
                        type="text"
                        placeholder="Brief summary pitching the value proposition..."
                        value={docData.ctaBody || ''}
                        onChange={e => updateField('ctaBody', e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Button Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Let's connect"
                        value={docData.ctaButtonLabel || ''}
                        onChange={e => updateField('ctaButtonLabel', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Button Target URL</label>
                      <input
                        type="text"
                        placeholder="e.g. /contact"
                        value={docData.ctaButtonUrl || ''}
                        onChange={e => updateField('ctaButtonUrl', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 6: FAQ Section */}
            <div id="document-faqs-section" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('faqs')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 cursor-pointer text-left focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-brand-50 rounded-lg text-brand-650">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Frequently Asked Questions (FAQ)</span>
                    <span className="text-[10px] text-slate-400">Add questions and answers related to this case study</span>
                  </div>
                </div>
                {expandedSections.faqs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSections.faqs && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/10 space-y-4">
                  <div className="space-y-3">
                    {(docData.faqs || []).map((faq: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-3 relative shadow-3xs">
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="absolute top-3 right-3 p-1 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Question</label>
                          <input
                            type="text"
                            placeholder="e.g. How long did the implementation take?"
                            value={faq.question}
                            onChange={e => handleUpdateFaq(idx, 'question', e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Answer</label>
                          <textarea
                            rows={3}
                            placeholder="e.g. The initial deployment was completed in 6 weeks, with full rollout in 3 months."
                            value={faq.answer}
                            onChange={e => handleUpdateFaq(idx, 'answer', e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-white resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                    {(docData.faqs || []).length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center py-6">No FAQs added yet.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg active-press transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add FAQ
                  </button>
                </div>
              )}
            </div>

            </div>

            {/* Bottom intelligence bar */}
            <ContentIntelligenceBar
              contentText={contentText}
              contentHtml={contentHtml}
              focusKeyword={seo.focusKeyword}
            />
          </div>
        ) : (
          /* Main Writing Canvas for Blog Posts */
          <div className="flex-1 flex flex-col p-8 overflow-y-auto gap-6 bg-slate-50/20 max-w-4xl mx-auto w-full pb-20">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Title Area */}
            <div className="space-y-2">
              <input
                id="document-title-input"
                type="text"
                placeholder="Title of your post..."
                value={docData.title}
                onChange={e => {
                  const val = e.target.value;
                  updateField('title', val);
                  // Auto generate slug if new
                  if (isNew) {
                    updateField(
                      'slug',
                      val
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '')
                    );
                  }
                }}
                className="w-full text-3xl font-extrabold text-slate-900 border-none outline-hidden placeholder-slate-200 focus:ring-0 leading-tight focus:border-transparent focus:box-shadow-none"
              />

              {/* Editable Slug indicator with live url preview */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-medium text-slate-500">https://vionsys.com/{contentType === 'blog' ? 'blog' : 'case-studies'}/</span>
                <input
                  id="document-slug-input"
                  type="text"
                  value={docData.slug}
                  onChange={e => updateField('slug', e.target.value)}
                  placeholder="url-slug"
                  className="border-b border-slate-200 hover:border-slate-400 focus:border-indigo-500 outline-hidden pb-0.5 px-0.5 bg-transparent font-semibold text-slate-700"
                />
              </div>
            </div>

            {/* RichText Editor Component Canvas */}
            <div className="flex-1 flex flex-col min-h-[400px] editorjs-wrapper">
              <RichTextEditor
                initialJson={contentJson}
                onChange={(html, json, text) => {
                  setContentHtml(html);
                  setContentJson(json);
                  setContentText(text);
                  hasChangesRef.current = true;
                  setSaveStatus('unsaved');
                }}
              />
            </div>

            </div>

            {/* Bottom intelligence statistics bar */}
            <ContentIntelligenceBar
              contentText={contentText}
              contentHtml={contentHtml}
              focusKeyword={seo.focusKeyword}
            />
          </div>
        )}

        {/* Right Tab Sidebar */}
        <EditorSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          activeTab={sidebarTab}
          setActiveTab={setSidebarTab}
          onChecklistItemClick={scrollToField}
          data={docData}
          onChange={updateField}
          seo={seo}
          onChangeSeo={updateSeo}
          aeoGeo={aeoGeo}
          onChangeAeoGeo={updateAeoGeo}
          schema={schema}
          onChangeSchema={updateSchema}
          categories={categories}
          services={services}
          contentType={contentType}
          onSaveDraft={() => handleSave(true)}
          onPublish={handlePublish}
          isSaving={isSaving}
          isPublishing={isPublishing}
        />
      </div>
    </div>
  );
}

export default ContentEditorShell;
