'use client';

import React, { useState } from 'react';
import { Eye, Edit, Trash2, CheckSquare, Square, Trash, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from './StatusBadge';

interface BlogPostWithRelations {
  id: string;
  title: string;
  status: string;
  category: { name: string } | null;
  author: { name: string };
  updatedAt: string | Date;
}

interface BlogListTableProps {
  posts: BlogPostWithRelations[];
}

export function BlogListTable({ posts }: BlogListTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.category?.name || 'Uncategorized').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected posts?`)) return;
    setIsDeleting(true);

    try {
      // Delete selected posts in parallel client-side
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/cms/blogs/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      console.error('Error during bulk deletion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await fetch(`/api/cms/blogs/${id}`, { method: 'DELETE' });
      setSelectedIds(prev => prev.filter(item => item !== id));
      router.refresh();
    } catch (err) {
      console.error('Error deleting blog post:', err);
    }
  };

  return (
    <div className="space-y-4 relative w-full">
      {/* Search Filter Header */}
      <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-3xs w-full">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search blogs by title or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-brand-500 bg-slate-50/20"
          />
        </div>
        {selectedIds.length > 0 && (
          <span className="text-[11px] font-bold text-brand-650 bg-brand-50 px-2 py-0.5 rounded-md">
            {selectedIds.length} Selected
          </span>
        )}
      </div>

      {/* Catalog Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden w-full">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-450 text-xs flex flex-col items-center gap-1.5">
            <FileText className="w-8 h-8 text-slate-300" />
            No articles match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 font-bold uppercase tracking-wider text-[9px] select-none">
                  <th className="py-3 px-4 w-10">
                    <button type="button" onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      {selectedIds.length === filteredPosts.length ? (
                        <CheckSquare className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3">Title</th>
                  <th className="py-3.5 px-3 w-24">Status</th>
                  <th className="py-3.5 px-3 w-32">Category</th>
                  <th className="py-3.5 px-3 w-32">Author</th>
                  <th className="py-3.5 px-3 w-28">Last Updated</th>
                  <th className="py-3.5 px-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPosts.map(post => {
                  const isChecked = selectedIds.includes(post.id);
                  return (
                    <tr
                      key={post.id}
                      className={`transition-colors duration-100 hover:bg-slate-50/50 ${
                        isChecked ? 'bg-brand-50/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleSelect(post.id)}
                          className="text-slate-405 hover:text-slate-600 cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-brand-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 max-w-sm truncate">
                        <Link href={`/blogs/${post.id}/edit`} className="hover:text-brand-600">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={post.status as any} />
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-500">
                        {post.category?.name || 'Uncategorized'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-medium">
                        {post.author.name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-semibold">
                        {new Date(post.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 shrink-0">
                        <Link
                          href={`/api/cms/preview?id=${post.id}`}
                          target="_blank"
                          className="inline-flex items-center p-1.5 border border-slate-200 rounded-md text-slate-405 hover:bg-slate-50 hover:text-slate-750 transition-all active-press cursor-pointer"
                          title="Preview Post"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/blogs/${post.id}/edit`}
                          className="inline-flex items-center p-1.5 border border-slate-200 rounded-md text-slate-405 hover:bg-slate-50 hover:text-slate-750 transition-all active-press cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteOne(post.id)}
                          className="inline-flex items-center p-1.5 border border-slate-200 rounded-md text-slate-405 hover:bg-rose-50 hover:text-rose-650 transition-all active-press cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-full flex items-center gap-4 shadow-xl z-50 select-none border border-slate-800"
          >
            <span className="text-[11px] font-bold tracking-wide">
              {selectedIds.length} catalog items selected
            </span>
            <div className="w-px h-4 bg-slate-750" />
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full active-press transition-all cursor-pointer"
            >
              <Trash className="w-3 h-3" />
              {isDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-[10px] text-slate-400 hover:text-white font-semibold cursor-pointer active-press"
            >
              Deselect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BlogListTable;
