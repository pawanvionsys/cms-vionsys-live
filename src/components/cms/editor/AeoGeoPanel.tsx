'use client';

import React, { useState } from 'react';
import { FormField } from '../shared/FormField';
import { Plus, Trash2, Globe, ShieldCheck } from 'lucide-react';

interface AeoGeoPanelProps {
  aeoGeo: any;
  onChange: (field: string, value: any) => void;
}

export function AeoGeoPanel({ aeoGeo = {}, onChange }: AeoGeoPanelProps) {
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [takeawayInput, setTakeawayInput] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const handleAddPAA = () => {
    if (!qaQuestion.trim() || !qaAnswer.trim()) return;
    const current = aeoGeo.peopleAlsoAsk || [];
    onChange('peopleAlsoAsk', [...current, { question: qaQuestion.trim(), answer: qaAnswer.trim() }]);
    setQaQuestion('');
    setQaAnswer('');
  };

  const handleRemovePAA = (idx: number) => {
    const current = aeoGeo.peopleAlsoAsk || [];
    onChange('peopleAlsoAsk', current.filter((_: any, i: number) => i !== idx));
  };

  const handleAddTakeaway = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && takeawayInput.trim()) {
      e.preventDefault();
      const current = aeoGeo.keyTakeaways || [];
      onChange('keyTakeaways', [...current, takeawayInput.trim()]);
      setTakeawayInput('');
    }
  };

  const handleRemoveTakeaway = (idx: number) => {
    const current = aeoGeo.keyTakeaways || [];
    onChange('keyTakeaways', current.filter((_: any, i: number) => i !== idx));
  };

  const handleAddSource = () => {
    if (!sourceLabel.trim() || !sourceUrl.trim()) return;
    const current = aeoGeo.statsSources || [];
    onChange('statsSources', [...current, { label: sourceLabel.trim(), url: sourceUrl.trim() }]);
    setSourceLabel('');
    setSourceUrl('');
  };

  const handleRemoveSource = (idx: number) => {
    const current = aeoGeo.statsSources || [];
    onChange('statsSources', current.filter((_: any, i: number) => i !== idx));
  };

  const snippet = aeoGeo.snippetCandidate || '';
  const snippetWords = snippet.trim() ? snippet.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Voice Search Snippet */}
      <FormField
        label="Voice Search Snippet Candidate"
        description={`${snippetWords}/50 words recommended limit`}
      >
        <textarea
          rows={3}
          placeholder="e.g. Next.js performance is optimized by default through automatic code splitting..."
          value={aeoGeo.snippetCandidate || ''}
          onChange={e => onChange('snippetCandidate', e.target.value)}
          className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-hidden focus:border-indigo-500 resize-none ${
            snippetWords > 50 ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'
          }`}
        />
      </FormField>

      {/* Direct Answer Prompt */}
      <FormField label="Direct Answer Prompt (LLMs)">
        <input
          type="text"
          placeholder="e.g. What reduces Next.js page sizes?"
          value={aeoGeo.directAnswerPrompt || ''}
          onChange={e => onChange('directAnswerPrompt', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
        />
      </FormField>

      {/* EEAT Signals: Author Credentials */}
      <div className="border-t border-slate-100 pt-4 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          EEAT & Generative Trust
        </h4>

        <FormField label="Author Credentials / Biography Details">
          <input
            type="text"
            placeholder="e.g. Certified Cloud Architect with 12+ years experience"
            value={aeoGeo.authorCredibility || ''}
            onChange={e => onChange('authorCredibility', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </FormField>

        <FormField label="Reviewed By Expert Profile">
          <input
            type="text"
            placeholder="e.g. Dr. Jane Smith, Principal DevOps Advocate"
            value={aeoGeo.reviewedBy || ''}
            onChange={e => onChange('reviewedBy', e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </FormField>
      </div>

      {/* Key Takeaways */}
      <div className="border-t border-slate-100 pt-4">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Key Takeaways (Press Enter to add)
        </label>
        <input
          type="text"
          placeholder="Summarize main points..."
          value={takeawayInput}
          onChange={e => setTakeawayInput(e.target.value)}
          onKeyDown={handleTakeawayInput => {
            if (handleTakeawayInput.key === 'Enter') {
              handleTakeawayInput.preventDefault();
              handleAddTakeaway(handleTakeawayInput);
            }
          }}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
        />
        <ul className="space-y-1.5 mt-3">
          {(aeoGeo.keyTakeaways || []).map((t: string, i: number) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600"
            >
              <span className="truncate">{t}</span>
              <button
                type="button"
                onClick={() => handleRemoveTakeaway(i)}
                className="hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* People Also Ask */}
      <div className="border-t border-slate-100 pt-4">
        <label className="text-xs font-semibold text-slate-700 block mb-2">People Also Ask (PAA)</label>
        <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
          <input
            type="text"
            placeholder="Add Question"
            value={qaQuestion}
            onChange={e => setQaQuestion(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-indigo-500"
          />
          <textarea
            placeholder="Add Answer"
            rows={2}
            value={qaAnswer}
            onChange={e => setQaAnswer(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-indigo-500 resize-none"
          />
          <button
            type="button"
            onClick={handleAddPAA}
            className="w-full py-1.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-650 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 rounded-md cursor-pointer"
          >
            <Plus className="w-3 h-3 text-slate-400" />
            Add Q&A Pair
          </button>
        </div>

        <div className="space-y-2 mt-3">
          {(aeoGeo.peopleAlsoAsk || []).map((item: any, i: number) => (
            <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg relative text-[11px] leading-relaxed group">
              <p className="font-bold text-slate-750">Q: {item.question}</p>
              <p className="text-slate-500 mt-0.5">A: {item.answer}</p>
              <button
                type="button"
                onClick={() => handleRemovePAA(i)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reference Citations */}
      <div className="border-t border-slate-100 pt-4">
        <label className="text-xs font-semibold text-slate-700 block mb-2">Citations / Statistics Sources</label>
        <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
          <input
            type="text"
            placeholder="Source Label (e.g. Gartner Report 2026)"
            value={sourceLabel}
            onChange={e => setSourceLabel(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-indigo-500"
          />
          <input
            type="url"
            placeholder="Source URL"
            value={sourceUrl}
            onChange={e => setSourceUrl(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddSource}
            className="w-full py-1.5 bg-white border border-slate-200 text-[10px] font-bold text-slate-650 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 rounded-md cursor-pointer"
          >
            <Plus className="w-3 h-3 text-slate-400" />
            Add Citation Reference
          </button>
        </div>

        <div className="space-y-2 mt-3">
          {(aeoGeo.statsSources || []).map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs leading-normal">
              <div>
                <p className="font-semibold text-slate-750">{item.label}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{item.url}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSource(i)}
                className="text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Crawler Control Toggle */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700">Allow AI Crawler indexing</span>
        </div>
        <button
          type="button"
          onClick={() => onChange('allowAiCrawler', aeoGeo.allowAiCrawler === false ? true : false)}
          className="text-slate-600 hover:text-slate-800 cursor-pointer"
        >
          {aeoGeo.allowAiCrawler === false ? (
            <span className="text-[11px] font-bold text-red-500">DISALLOW</span>
          ) : (
            <span className="text-[11px] font-bold text-emerald-600">ALLOW</span>
          )}
        </button>
      </div>
    </div>
  );
}
export default AeoGeoPanel;
