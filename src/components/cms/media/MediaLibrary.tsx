'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderPlus,
  Search,
  Tag,
  Grid,
  List as ListIcon,
  Trash2,
  X,
  FileText,
  Video,
  CornerLeftUp,
  Save,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { MediaAsset, MediaFolder } from '../../../types/media';
import { UploadDropzone } from './UploadDropzone';

interface MediaLibraryProps {
  onSelectImage?: (url: string, alt: string) => void;
  standalone?: boolean;
}

export function MediaLibrary({ onSelectImage, standalone = true }: MediaLibraryProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sidebar updates
  const [sidebarAlt, setSidebarAlt] = useState('');
  const [sidebarCaption, setSidebarCaption] = useState('');
  const [sidebarTags, setSidebarTags] = useState('');
  const [savingAsset, setSavingAsset] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/cms/media?folders=true');
      const data = await res.json();
      if (data.success) {
        setFolders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      let url = `/api/cms/media?page=1&limit=50`;
      if (currentFolderId) {
        url += `&folderId=${currentFolderId}`;
      } else {
        url += `&folderId=null`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAssets(data.data.assets || []);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [currentFolderId, searchQuery, selectedTag]);

  useEffect(() => {
    if (selectedAsset) {
      setSidebarAlt(selectedAsset.alt || '');
      setSidebarCaption(selectedAsset.caption || '');
      setSidebarTags(selectedAsset.tags?.join(', ') || '');
    }
  }, [selectedAsset]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_FOLDER',
          name: newFolderName.trim(),
          parentId: currentFolderId
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewFolderName('');
        setShowFolderModal(false);
        fetchFolders();
      }
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  const handleUpdateAsset = async () => {
    if (!selectedAsset) return;
    setSavingAsset(true);
    setMessage(null);

    try {
      const tagsArray = sidebarTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await fetch(`/api/cms/media/${selectedAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt: sidebarAlt,
          caption: sidebarCaption,
          tags: tagsArray
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Asset metadata saved successfully.');
        setSelectedAsset(data.data);
        fetchAssets(); // Refresh grid
      }
    } catch (err) {
      console.error('Error updating asset:', err);
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset permanently? This might break existing links.')) return;

    try {
      const res = await fetch(`/api/cms/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedAsset(null);
        fetchAssets();
      }
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');

  const getCurrentFolderObject = () => {
    return folders.find(f => f.id === currentFolderId);
  };

  // Extract all tags from assets for filtering list
  const allTags = Array.from(new Set(assets.flatMap(a => a.tags || [])));

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)] relative">
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Library Controls Header */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {currentFolderId && (
              <button
                onClick={() => {
                  const parent = folders.find(f => f.id === currentFolderId);
                  setCurrentFolderId(parent?.parentId || null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                title="Go Up"
              >
                <CornerLeftUp className="w-4 h-4" />
              </button>
            )}
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-indigo-500" />
              {currentFolderId ? getCurrentFolderObject()?.name : 'Media Root'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg py-1.5 px-2 bg-white"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowFolderModal(true)}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer flex items-center gap-1 text-xs font-medium"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              New Folder
            </button>

            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
            >
              {showUpload ? 'Close Upload' : 'Upload Files'}
            </button>
          </div>
        </div>

        {/* Dynamic Upload Area */}
        {showUpload && (
          <div className="p-4 border-b border-slate-200 bg-slate-50/20">
            <UploadDropzone
              folderId={currentFolderId}
              onUploadComplete={() => {
                setShowUpload(false);
                fetchAssets();
              }}
            />
          </div>
        )}

        {/* Content Explorer Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Folders List */}
          {folders.filter(f => f.parentId === currentFolderId).length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Folders</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {folders
                  .filter(f => f.parentId === currentFolderId)
                  .map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="flex items-center gap-3 p-3 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10 rounded-lg cursor-pointer transition-colors"
                    >
                      <Folder className="w-5 h-5 text-indigo-500 fill-indigo-50" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{folder.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {folder._count?.assets || 0} assets
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Assets Grid */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Files</h3>
            {assets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No files found in this folder.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {assets.map(asset => {
                  const isImg = isImage(asset.mimeType);
                  const isVid = isVideo(asset.mimeType);
                  const isSelected = selectedAsset?.id === asset.id;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`group border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {/* Thumbnail wrapper */}
                      <div className="h-28 bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                        {isImg ? (
                          <img
                            src={asset.url}
                            alt={asset.alt || asset.filename}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : isVid ? (
                          <Video className="w-8 h-8 text-slate-400" />
                        ) : (
                          <FileText className="w-8 h-8 text-slate-400" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-semibold bg-slate-900/60 text-white px-1 py-0.5 rounded-sm">
                          {asset.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="p-2 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-700 truncate mb-0.5" title={asset.filename}>
                          {asset.filename}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {Math.round(asset.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Asset Details Right Sidebar */}
      {selectedAsset && (
        <div className="w-80 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs h-full animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Asset Details</h3>
            <button
              onClick={() => setSelectedAsset(null)}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Preview image */}
            <div className="border border-slate-100 rounded-lg p-2 bg-slate-50/50 flex justify-center items-center h-40 overflow-hidden">
              {isImage(selectedAsset.mimeType) ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.alt || ''}
                  className="max-h-full max-w-full object-contain rounded-md"
                />
              ) : (
                <FileText className="w-12 h-12 text-slate-300" />
              )}
            </div>

            {/* Meta attributes list */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-50 py-1">
                <span className="text-slate-400">Filename:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[150px]">{selectedAsset.filename}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 py-1">
                <span className="text-slate-400">Mime Type:</span>
                <span className="font-semibold text-slate-700">{selectedAsset.mimeType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 py-1">
                <span className="text-slate-400">Size:</span>
                <span className="font-semibold text-slate-700">{Math.round(selectedAsset.size / 1024)} KB</span>
              </div>
              {selectedAsset.width && (
                <div className="flex justify-between border-b border-slate-50 py-1">
                  <span className="text-slate-400">Dimensions:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedAsset.width} × {selectedAsset.height} px
                  </span>
                </div>
              )}
            </div>

            {/* Editable Forms fields */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Alt Text (Required for SEO)</label>
                <input
                  type="text"
                  value={sidebarAlt}
                  onChange={e => setSidebarAlt(e.target.value)}
                  placeholder="Describe this image for screen readers"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Caption</label>
                <textarea
                  rows={2}
                  value={sidebarCaption}
                  onChange={e => setSidebarCaption(e.target.value)}
                  placeholder="Image caption text..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={sidebarTags}
                  onChange={e => setSidebarTags(e.target.value)}
                  placeholder="e.g. blog, client_logos"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {message && (
              <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {message}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
            {onSelectImage ? (
              <button
                type="button"
                disabled={isImage(selectedAsset.mimeType) && (!sidebarAlt || !sidebarAlt.trim())}
                onClick={async () => {
                  if (isImage(selectedAsset.mimeType) && sidebarAlt !== selectedAsset.alt) {
                    await handleUpdateAsset();
                  }
                  onSelectImage(selectedAsset.url, sidebarAlt);
                }}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white rounded-lg transition-all active-press cursor-pointer ${
                  isImage(selectedAsset.mimeType) && (!sidebarAlt || !sidebarAlt.trim())
                    ? 'bg-slate-350 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-brand-600 hover:bg-brand-700'
                }`}
                title={isImage(selectedAsset.mimeType) && (!sidebarAlt || !sidebarAlt.trim()) ? 'Alt text is required before inserting images' : 'Insert into editor'}
              >
                {isImage(selectedAsset.mimeType) && (!sidebarAlt || !sidebarAlt.trim()) ? 'Alt Text Required' : 'Insert Media'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUpdateAsset}
                disabled={savingAsset}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {savingAsset ? 'Saving...' : 'Save Meta'}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDeleteAsset(selectedAsset.id)}
              className="p-2 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="Delete asset permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-indigo-500" />
                Create New Folder
              </h3>
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <input
                type="text"
                placeholder="Folder Name (e.g. Banners)"
                required
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default MediaLibrary;
