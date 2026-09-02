'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Flame,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Utensils');
    setSortOrder(String(categories.length + 1));
    setIsActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon || 'Utensils');
    setSortOrder(String(cat.sortOrder));
    setIsActive(cat.isActive);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        icon,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category.');
      }

      setSuccessMessage(
        editingCategory ? 'Category updated successfully!' : 'New category created successfully!'
      );
      setIsModalOpen(false);
      fetchCategories();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All items under it will also be removed.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Category deleted successfully!');
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Add or organize menu categories. Any updates reflect immediately on the storefront navigation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 text-[#111111] font-bold px-4 py-2.5 rounded-xl text-xs shadow-glow-flame transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Category</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-darker text-neutral-400 uppercase font-mono text-[11px] border-b border-brand-border/60">
              <tr>
                <th className="py-3.5 px-5">Sort Order</th>
                <th className="py-3.5 px-5">Category Name</th>
                <th className="py-3.5 px-5">Slug</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-neutral-600">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-flame mx-auto mb-2" />
                    <span className="text-neutral-500">Loading categories...</span>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-neutral-500">
                    No categories configured yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-brand-cardHover transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-brand-yellow">
                      #{cat.sortOrder}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#111111] text-sm">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-neutral-500">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="bg-brand-darker hover:bg-neutral-800 text-white p-2 rounded-xl border border-brand-border transition-colors inline-flex items-center"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="bg-brand-darker hover:bg-red-500/20 text-neutral-400 hover:text-red-400 p-2 rounded-xl border border-brand-border hover:border-red-500/40 transition-colors inline-flex items-center"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-brand-dark border border-brand-border rounded-3xl shadow-2xl overflow-hidden my-8 animate-fade-in">
            
            <div className="bg-brand-card p-5 border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-brand-flame" />
                <h3 className="text-lg font-black text-[#111111]">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white p-1.5 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {errorMessage && (
                <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Category Name <span className="text-brand-flame">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 🍕 Party Platters & Boxes"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2.5 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="1"
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
                />
              </div>

              <div className="pt-2 border-t border-brand-border/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-flame"
                  />
                  <span className="text-neutral-200">Active (Visible on Storefront Navigation)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white hover:bg-neutral-100 text-[#111111] px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-glow-flame"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}