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
  History
} from 'lucide-react';
import Link from 'next/link';

interface CardItem {
  label: string;
  count: number;
  sub: string;
  iconType: 'blog' | 'case-study' | 'combined';
  bg: string;
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
          return (
            <div
              key={card.label}
              className="p-6 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-3xs hover:shadow-xs transition-shadow duration-200 hover:border-slate-300"
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
            </div>
          );
        })}
      </motion.div>

      {/* Columns splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Tools Accordion List */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs space-y-4 lg:col-span-1"
        >
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <TrendingUp className="w-4 h-4 text-brand-600 animate-pulse" />
            Publisher Workspace
          </h3>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/blogs/new"
              className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:border-brand-200 hover:bg-slate-50/50 transition-all duration-150 text-xs font-bold text-slate-700 active-press shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <FileEdit className="w-4 h-4 text-slate-400" />
                Write new Blog Post
              </div>
              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                Canvas
              </span>
            </Link>
            
            <Link
              href="/case-studies/new"
              className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:border-brand-200 hover:bg-slate-50/50 transition-all duration-150 text-xs font-bold text-slate-700 active-press shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Build Case Study
              </div>
              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                Repeatable
              </span>
            </Link>

            <Link
              href="/seo-tools/sitemap"
              className="flex items-center justify-between p-3.5 border border-slate-100 rounded-lg hover:border-brand-200 hover:bg-slate-50/50 transition-all duration-150 text-xs font-bold text-slate-700 active-press shadow-3xs"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-slate-400" />
                Verify XML Sitemap
              </div>
              <span className="text-[9px] font-extrabold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                SEO Tools
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Audit Log timeline */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs space-y-4 lg:col-span-2"
        >
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-brand-600" />
            Audit Action Timeline
          </h3>
          
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No editorial changes recorded yet.</p>
          ) : (
            <div className="space-y-4 relative pl-3.5 border-l border-slate-100 py-1">
              {logs.map((log, idx) => (
                <div key={log.id} className="relative flex flex-col gap-1 text-xs">
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[19.5px] top-1.5 w-2 h-2 rounded-full border border-brand-500 bg-white" />
                  
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="font-bold text-slate-850 truncate leading-snug">{log.action}</p>
                    <span className="text-[9px] font-semibold text-slate-400 shrink-0 uppercase tracking-wide bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm">
                      {getRelativeTime(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{log.details}</p>
                  <p className="text-[10px] text-slate-405 font-medium">
                    Triggered by <span className="text-slate-650 font-bold">{log.user.name}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DashboardWidgets;
