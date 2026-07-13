'use client';

import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, alt: string) => void;
  title?: string;
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset'
}: MediaPickerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Embedded Library */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-50/20">
          <MediaLibrary
            standalone={false}
            onSelectImage={(url, alt) => {
              onSelect(url, alt);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
export default MediaPicker;
