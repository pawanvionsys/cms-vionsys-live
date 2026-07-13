import React from 'react';

interface StatusBadgeProps {
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs = {
    DRAFT: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'Draft'
    },
    PUBLISHED: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Published'
    },
    SCHEDULED: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Scheduled'
    },
    ARCHIVED: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Archived'
    }
  };

  const current = configs[status] || configs.DRAFT;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}
    >
      {current.label}
    </span>
  );
}
