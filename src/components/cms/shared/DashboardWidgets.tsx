'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Briefcase,
  Layers,
  TrendingUp,
  FileEdit,
  Globe,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

interface CardItem {
  label: string;
  count: number;
  sub: string;
  iconType: 'blog' | 'case-study' | 'combined';
  bg: string;
  accent?: string;
}

const iconMap = {
  'blog': FileText,
  'case-study': Briefcase,
  'combined': Layers
};

interface LogItem {
  id: string;
  action: string;
  details: string;
  createdAt: string | Date;
  user: {
    name: string;
  };
}

interface DashboardWidgetsProps {
  cards: CardItem[];
  logs: LogItem[];
}

// Relative time formatting utility
function getRelativeTime(date: Date | string): string {
  const time = new Date(date).getTime();
  const now = Date.now();
  const diff = now - time;
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (secs < 60) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Sleek CountUp hook
function CountUp({ end }: { end: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (end === 0) return;
    let start = 0;
    const duration = 800; // ms
    const incrementTime = Math.max(Math.floor(duration / end), 25);
    
    const timer = setInterval(() => {
      start += 1;
      setValue(start);
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{value}</span>;
}

export function DashboardWidgets({ cards, logs }: DashboardWidgetsProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Stagger variants for layout entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.2, 0.8, 0.2, 1] as const
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 select-none w-full"
    >
      {/* Stats Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(card => {
          const Icon = iconMap[card.iconType] || Layers;
          const href = card.iconType === 'blog' ? '/blogs' : card.iconType === 'case-study' ? '/case-studies' : '/blogs';
          const accent = card.accent || 'border-l-emerald-400';
          
          return (
            <Link
              key={card.label}
              href={href}
              className={`p-6 bg-white border border-slate-200 border-l-4 ${accent} rounded-xl flex items-center justify-between shadow-3xs hover:shadow-xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/30 active-press cursor-pointer block`}
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{card.label}</span>
                <span className="text-3xl font-extrabold text-slate-800 block leading-none">
                  <CountUp end={card.count} />
                </span>
                <span className="text-[10px] font-semibold text-slate-500 block">{card.sub}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Columns splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Tools Accordion List */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 border-l-4 border-l-rose-400 rounded-xl p-6 shadow-3xs space-y-4 lg:col-span-1"
        >
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600 ring-1 ring-rose-100">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            Publisher Workspace
          </h3>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/blogs/new"
              className="flex items-center justify-between p-3.5 border border-rose-100 rounded-lg hover:border-rose-200 hover:bg-rose-50/40 transition-all duration-150 text-xs font-bold text-slate-700 active-press shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <FileEdit className="w-4 h-4 text-rose-500" />
                Write new Blog Post
              </div>
              <span className="text-[9px] font-extrabold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                Canvas
              </span>
            </Link>
            
            <Link
              href="/case-studies/new"
              className="flex items-center justify-between p-3.5 border border-emerald-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-150 text-xs font-bold text-slate-700 active-press shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                Build Case Study
              </div>
              <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                Repeatable
              </span>
            </Link>

            <Link
              href="/seo-tools/sitemap"
              className="flex items-center justify-between p-3.5 border border-amber-100 rounded-lg hover:border-amber-200 hover:bg-amber-50/40 transition-all duration-150 text-xs font-bold text-slate-700 active-press shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-500" />
                Verify XML Sitemap
              </div>
              <span className="text-[9px] font-extrabold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                SEO Tools
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Audit Log timeline */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 border-l-4 border-l-yellow-400 rounded-xl p-6 shadow-3xs space-y-4 lg:col-span-2"
        >
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-yellow-50 rounded-lg text-yellow-600 ring-1 ring-yellow-100">
              <History className="w-3.5 h-3.5" />
            </div>
            Audit Action Timeline
          </h3>
          
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No editorial changes recorded yet.</p>
          ) : (
            <div className="space-y-3 relative pl-3.5 border-l border-amber-100 py-1">
              {logs.map((log, idx) => {
                const isExpanded = expandedLogId === log.id;
                const dotColor =
                  idx % 3 === 0
                    ? 'border-rose-500'
                    : idx % 3 === 1
                      ? 'border-amber-500'
                      : 'border-emerald-500';
                return (
                  <div key={log.id} className="relative flex flex-col gap-1 text-xs border border-slate-100/70 hover:border-amber-200 rounded-lg p-3 hover:bg-amber-50/20 transition-all select-none">
                    {/* Timeline bullet dot */}
                    <span className={`absolute -left-[19.5px] top-4 w-2 h-2 rounded-full border ${dotColor} bg-white`} />
                    
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="w-full text-left flex justify-between items-center gap-2 font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <span className="truncate pr-2">{log.action.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-semibold text-amber-700 uppercase tracking-wide bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-100">
                          {getRelativeTime(log.createdAt)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="pt-2.5 mt-2.5 border-t border-amber-100 text-[11px] text-slate-600 space-y-1.5 animate-fade-in leading-relaxed">
                        <p>
                          <span className="font-bold text-slate-750">Details:</span> {log.details}
                        </p>
                        <p className="text-[10px] text-slate-450 font-medium">
                          Modified by: <span className="text-slate-600 font-bold">{log.user.name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DashboardWidgets;
