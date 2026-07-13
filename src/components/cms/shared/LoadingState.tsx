import React from 'react';

interface LoadingStateProps {
  rows?: number;
}

export function LoadingState({ rows = 4 }: LoadingStateProps) {
  return (
    <div className="w-full space-y-4 py-6 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center space-x-4 p-4 border border-slate-100 rounded-lg bg-white">
          <div className="h-4 w-4 bg-slate-200 rounded-sm" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded-md w-1/3" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />
          </div>
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
          <div className="h-8 w-8 bg-slate-100 rounded-md" />
        </div>
      ))}
    </div>
  );
}
