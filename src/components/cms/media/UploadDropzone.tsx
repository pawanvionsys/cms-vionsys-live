'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { siteConfig } from '../../../config/site';

interface UploadDropzoneProps {
  folderId?: string | null;
  onUploadComplete: () => void;
}

export function UploadDropzone({ folderId, onUploadComplete }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFiles = async (files: FileList) => {
    setUploading(true);
    setError(null);
    setProgress(5);

    // Mock progress ticker to make interface feel alive
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    const formData = new FormData();
    if (folderId) {
      formData.append('folderId', folderId);
    }

    let fileCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size
      if (file.size > siteConfig.storage.maxFileSize) {
        setError(`File "${file.name}" exceeds the maximum size of 10MB.`);
        clearInterval(interval);
        setUploading(false);
        return;
      }

      // Validate mime type
      if (!siteConfig.storage.allowedMimeTypes.includes(file.type)) {
        setError(`Mime type "${file.type}" is not supported.`);
        clearInterval(interval);
        setUploading(false);
        return;
      }

      formData.append('files', file);
      fileCount++;
    }

    if (fileCount === 0) {
      clearInterval(interval);
      setUploading(false);
      return;
    }

    try {
      const response = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error?.message || 'Failed to upload files.');
      }

      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        onUploadComplete();
      }, 300);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'An error occurred during upload.');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 min-h-[160px] active-press ${
          isDragActive
            ? 'border-brand-500 bg-brand-50/20 scale-[1.015] shadow-xs'
            : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50/70'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={siteConfig.storage.allowedMimeTypes.join(',')}
          onChange={handleChange}
          disabled={uploading}
        />

        <div className="flex flex-col items-center text-center gap-2 w-full">
          {uploading ? (
            <div className="w-full max-w-xs flex flex-col items-center gap-3">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] font-bold text-slate-550">
                {progress === 100 ? 'Processing...' : `Uploading Assets (${progress}%)`}
              </p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-white shadow-3xs border border-slate-100 flex items-center justify-center text-slate-400">
                <UploadCloud className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Drag and drop files here, or click to upload
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  JPEG, PNG, SVG, WebP, GIF, Video, PDF (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-105 rounded-lg text-red-750 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
export default UploadDropzone;
