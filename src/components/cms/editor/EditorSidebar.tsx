'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Zap,
  Code,
  Globe,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { DocumentPanel } from './DocumentPanel';
import { SeoPanel } from './SeoPanel';
import { AeoGeoPanel } from './AeoGeoPanel';
import { SchemaPanel } from './SchemaPanel';
import { PublishPanel } from './PublishPanel';

interface EditorSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  activeTab: 'doc' | 'seo' | 'aeo' | 'schema' | 'publish';
  setActiveTab: (val: 'doc' | 'seo' | 'aeo' | 'schema' | 'publish') => void;
  onChecklistItemClick: (fieldKey: string) => void;
  data: any;
  onChange: (field: string, value: any) => void;
  seo: any;
  onChangeSeo: (field: string, value: any) => void;
  aeoGeo: any;
  onChangeAeoGeo: (field: string, value: any) => void;
  schema: any;
  onChangeSchema: (field: string, value: any) => void;
  categories: { id: string; name: string }[];
  services: { id: string; label: string }[];
  contentType: 'blog' | 'case-study';
  onSaveDraft: () => void;
  onPublish: () => void;
  onImageSelected?: (url: string, alt: string) => void;
  isSaving: boolean;
  isPublishing: boolean;
}

export function EditorSidebar({
  isOpen,
  setIsOpen,
  activeTab,
  setActiveTab,
  onChecklistItemClick,
  data,
  onChange,
  seo,
  onChangeSeo,
  aeoGeo,
  onChangeAeoGeo,
  schema,
  onChangeSchema,
  categories,
  services,
  contentType,
  onSaveDraft,
  onPublish,
  onImageSelected,
  isSaving,
  isPublishing
}: EditorSidebarProps) {
  const tabs = [
    { id: 'doc', icon: FileText, label: 'Doc', active: 'text-emerald-700 bg-emerald-50', collapsed: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    { id: 'seo', icon: Search, label: 'SEO', active: 'text-amber-700 bg-amber-50', collapsed: 'bg-amber-50 text-amber-600 border border-amber-100' },
    { id: 'aeo', icon: Zap, label: 'AEO', active: 'text-yellow-700 bg-yellow-50', collapsed: 'bg-yellow-50 text-yellow-600 border border-yellow-100' },
    { id: 'schema', icon: Code, label: 'Schema', active: 'text-rose-700 bg-rose-50', collapsed: 'bg-rose-50 text-rose-600 border border-rose-100' },
    { id: 'publish', icon: Globe, label: 'Publish', active: 'text-emerald-700 bg-emerald-50', collapsed: 'bg-emerald-50 text-emerald-600 border border-emerald-100' }
  ] as const;

  return (
    <motion.aside
      animate={{ width: isOpen ? 320 : 48 }}
      transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
      className="border-l border-slate-200 bg-white flex flex-col h-full relative overflow-hidden select-none shrink-0"
    >
      {/* Sidebar Header */}
      <div className="h-12 border-b border-slate-100 flex items-center justify-between px-3 shrink-0">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="tabs-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1"
            >
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer transition-colors relative ${
                      isActive ? tab.active : 'text-slate-405 hover:text-slate-700'
                    }`}
                    title={tab.label}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="tabs-collapsed-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-1"
            />
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 hover:bg-slate-50 active-press rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          title={isOpen ? "Collapse Sidebar" : "Open Sidebar"}
        >
          {isOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>

      {/* Body Content Areas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsed side-bar mini selector buttons */}
        {!isOpen && (
          <div className="w-12 flex flex-col items-center py-4 gap-4 border-r border-slate-50 shrink-0">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setIsOpen(true);
                    setActiveTab(tab.id);
                  }}
                  className={`p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer active-press ${
                    isActive ? tab.collapsed : 'hover:bg-slate-50'
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Form Panel Area (Visible only when expanded) */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.12 }}
                className="h-full"
              >
                {activeTab === 'doc' && (
                  <DocumentPanel
                    data={data}
                    onChange={onChange}
                    categories={categories}
                    services={services}
                    contentType={contentType}
                    onImageSelected={onImageSelected}
                  />
                )}
                {activeTab === 'seo' && (
                  <SeoPanel
                    seo={seo}
                    onChange={onChangeSeo}
                    title={data.title}
                    excerpt={data.excerpt}
                    slug={data.slug}
                    contentType={contentType}
                  />
                )}
                {activeTab === 'aeo' && (
                  <AeoGeoPanel aeoGeo={aeoGeo} onChange={onChangeAeoGeo} />
                )}
                {activeTab === 'schema' && (
                  <SchemaPanel
                    schema={schema}
                    onChange={onChangeSchema}
                    title={data.title}
                    excerpt={data.excerpt}
                    slug={data.slug}
                    contentType={contentType}
                    featuredImage={data.featuredImage}
                    clientName={data.clientName}
                    industry={data.industry}
                  />
                )}
                {activeTab === 'publish' && (
                  <PublishPanel
                    data={data}
                    seo={seo}
                    aeoGeo={aeoGeo}
                    contentType={contentType}
                    onSaveDraft={onSaveDraft}
                    onPublish={onPublish}
                    isSaving={isSaving}
                    isPublishing={isPublishing}
                    onChecklistItemClick={onChecklistItemClick}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

export default EditorSidebar;
