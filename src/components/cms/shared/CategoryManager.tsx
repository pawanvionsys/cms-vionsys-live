'use client';

import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2, Loader2, Layers } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/cms/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create category.');
      }

      setCategories(prev => [...prev, data.data]);
      setName('');
      setDescription('');
      setStatus({ type: 'success', message: `Category "${data.data.name}" added successfully.` });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'An error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? Blogs associated with this category will be marked as "Uncategorized".`)) {
      return;
    }

    setDeletingId(id);
    setStatus(null);

    try {
      const res = await fetch(`/api/cms/categories/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete category.');
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      setStatus({ type: 'success', message: 'Category deleted successfully.' });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'An error occurred.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Category List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 md:col-span-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Layers className="w-4 h-4 text-indigo-500" />
          Active Categories ({categories.length})
        </h3>

        {status && (
          <div className={`p-3 rounded-lg flex items-start gap-2 text-xs ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No categories configured yet.</p>
          ) : (
            categories.map(c => (
              <div key={c.id} className="p-3.5 border border-slate-100 rounded-lg bg-slate-50/20 text-xs flex justify-between items-start gap-4 group hover:border-slate-200 transition-colors">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <p className="text-slate-450 text-[10px] leading-relaxed">{c.description || 'No description provided.'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={deletingId !== null}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer active-press shrink-0"
                  title="Delete Category"
                >
                  {deletingId === c.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 h-fit">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Plus className="w-4 h-4 text-indigo-500" />
          Create New Category
        </h3>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              placeholder="Describe what content falls into this category..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs active-press flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
