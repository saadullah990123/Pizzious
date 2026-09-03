'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Category, MenuItem, DealItem } from '@/lib/types';
import { optimizeImage } from '@/lib/image-optimization';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  Flame,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  PackagePlus,
  Loader2,
  Sparkles,
  Layers,
  UploadCloud,
} from 'lucide-react';

const MAX_PRODUCT_IMAGE_WIDTH = 800;

export default function AdminItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isDeal, setIsDeal] = useState(false);
  const [dealItems, setDealItems] = useState<DealItem[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [stock, setStock] = useState<string>('100');

  // Image upload (device) state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // New Deal Item Sub-form State
  const [dealItemName, setDealItemName] = useState('');
  const [dealItemQty, setDealItemQty] = useState('1');
  const [dealItemDesc, setDealItemDesc] = useState('');

  async function uploadImage(file: File) {
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Use a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    setIsUploading(true);
    try {
      const optimizedFile = await optimizeImage(file, MAX_PRODUCT_IMAGE_WIDTH);
      const localPreviewUrl = URL.createObjectURL(optimizedFile);
      setImagePreviewUrl((previousUrl) => {
        if (previousUrl.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
        return localPreviewUrl;
      });

      const body = new FormData();
      body.append('file', optimizedFile);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUploadError(data.error || 'Upload failed. Please try again.');
      } else {
        setImageUrl(data.url);
      }
    } catch (err) {
      setUploadError('Upload failed. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadImage(file);
    e.target.value = '';
  }

  async function handleImageDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadImage(file);
  }

  const removeImage = () => {
    setImageUrl('');
    setImagePreviewUrl((previousUrl) => {
      if (previousUrl.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
      return '';
    });
    setUploadError(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes] = await Promise.all([
        fetch('/api/admin/items'),
        fetch('/api/admin/categories'),
      ]);

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(data.items || []);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(data.categories || []);
        if (data.categories && data.categories.length > 0 && !editingItem) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading admin items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = (dealMode = false) => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setSalePrice('');
    setImageUrl('');
    setImagePreviewUrl('');
    setIsDeal(dealMode);
    setDealItems([]);
    setIsActive(true);
    setIsFeatured(false);
    setIsBestseller(false);
    setStock('100');
    setErrorMessage(null);
    if (categories.length > 0) {
      const defaultCat = dealMode
        ? categories.find((c) => c.slug.includes('deal')) || categories[0]
        : categories[0];
      setCategoryId(defaultCat.id);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setDescription(item.description || '');
    setPrice(String(item.price));
    setSalePrice(item.salePrice ? String(item.salePrice) : '');
    setImageUrl(item.images && item.images.length > 0 ? item.images[0] : '');
    setImagePreviewUrl('');
    setIsDeal(item.isDeal);
    setDealItems(item.dealItems || []);
    setIsActive(item.isActive);
    setIsFeatured(item.isFeatured);
    setIsBestseller(item.isBestseller);
    setStock(String(item.stock));
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleAddDealItem = () => {
    if (!dealItemName.trim()) return;
    setDealItems((prev) => [
      ...prev,
      {
        name: dealItemName.trim(),
        quantity: Number(dealItemQty) || 1,
        description: dealItemDesc.trim() || undefined,
      },
    ]);
    setDealItemName('');
    setDealItemQty('1');
    setDealItemDesc('');
  };

  const handleRemoveDealItem = (index: number) => {
    setDealItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Item name is required.');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setErrorMessage('Please enter a valid price.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        categoryId: Number(categoryId),
        description: description.trim(),
        price: Number(price),
        salePrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : null,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        isDeal,
        dealItems: isDeal ? dealItems : [],
        isActive,
        isFeatured,
        isBestseller,
        stock: Number(stock) || 100,
      };

      const url = editingItem ? `/api/admin/items/${editingItem.id}` : '/api/admin/items';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save item.');
      }

      setSuccessMessage(editingItem ? 'Item updated successfully!' : 'New item created successfully!');
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const res = await fetch(`/api/admin/items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Item deleted successfully!');
        setItems((prev) => prev.filter((i) => i.id !== id));
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCategoryFilter === 'all'
        ? true
        : selectedCategoryFilter === 'deals'
        ? item.isDeal
        : item.categoryId === Number(selectedCategoryFilter);

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
            Menu Items & Combo Deals
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Add gourmet pizzas, burgers, shakes, or configure custom bundle combo deals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#111111] font-bold px-4 py-2.5 rounded-xl text-xs shadow-glow-yellow transition-all"
          >
            <Flame className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
            <span>+ New Combo Deal</span>
          </button>

          <button
            onClick={() => openAddModal(false)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 text-[#111111] font-bold px-4 py-2.5 rounded-xl text-xs shadow-glow-flame transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Menu Item</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-brand-card border border-brand-border p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or description..."
            className="w-full bg-brand-darker border border-brand-border rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-brand-flame"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-brand-darker border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-flame"
          >
            <option value="all">All Categories ({items.length})</option>
            <option value="deals">🔥 Combo Deals Only ({items.filter((i) => i.isDeal).length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({items.filter((i) => i.categoryId === c.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-darker text-neutral-400 uppercase font-mono text-[11px] border-b border-brand-border/60">
              <tr>
                <th className="py-3.5 px-4">Item & Image</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / Sale Price</th>
                <th className="py-3.5 px-4">Type & Badges</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-neutral-600">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-flame mx-auto mb-2" />
                    <span className="text-neutral-500">Loading catalog...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-500">
                    No items match your filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const img = item.images && item.images.length > 0 ? item.images[0] : '';
                  return (
                    <tr key={item.id} className="hover:bg-brand-cardHover transition-colors">
                      {/* Name & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-brand-darker shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-brand-darker border border-brand-border flex items-center justify-center text-neutral-500 shrink-0">
                              🍕
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#111111] text-sm line-clamp-1">{item.name}</p>
                            <p className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs">{item.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[10px] font-mono border border-brand-border">
                          {item.categoryName || 'General'}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        {item.salePrice && item.salePrice > 0 ? (
                          <div>
                            <span className="text-neutral-500 line-through text-[10px] block font-mono">
                              {formatCurrency(item.price)}
                            </span>
                            <span className="text-brand-yellow font-black text-sm font-sans">
                              {formatCurrency(item.salePrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-brand-yellow font-black text-sm font-sans">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4 space-y-1">
                        {item.isDeal && (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 mr-1">
                            <Flame className="w-2.5 h-2.5 fill-amber-400" />
                            Combo Deal
                          </span>
                        )}
                        {item.isBestseller && (
                          <span className="bg-brand-flame/20 text-brand-flame border border-brand-flame/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mr-1">
                            Bestseller
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block">
                            Featured
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="bg-brand-darker hover:bg-neutral-800 text-white p-2 rounded-xl border border-brand-border transition-colors inline-flex items-center"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-brand-darker hover:bg-red-500/20 text-neutral-400 hover:text-red-400 p-2 rounded-xl border border-brand-border hover:border-red-500/40 transition-colors inline-flex items-center"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal with Custom Deals Builder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#f3f1ee] border border-neutral-300 rounded-3xl shadow-2xl overflow-hidden my-8 animate-fade-in">
            
            <div className="bg-brand-card p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isDeal ? (
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Flame className="w-5 h-5 fill-amber-400" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-brand-flame/20 text-brand-flame">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-[#111111]">
                    {editingItem
                      ? `Edit ${isDeal ? 'Combo Deal' : 'Menu Item'}`
                      : `Add New ${isDeal ? 'Combo Deal' : 'Menu Item'}`}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {isDeal
                      ? 'Bundle multiple items together with custom discount pricing.'
                      : 'Configure regular menu items with descriptions and pricing.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-[#111111] p-2 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Item / Deal Name <span className="text-brand-flame">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pizzious Mega Deal"
                    className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Category <span className="text-brand-flame">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Appetite-inducing description..."
                  className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame resize-none"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Regular Price (PKR) <span className="text-brand-flame">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1850"
                    className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Sale Price (Optional PKR)
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="1450"
                    className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="100"
                    className="w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
                  />
                </div>
              </div>

              {/* Image upload with live preview and URL fallback */}
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1">
                  Product Image
                  <span className="ml-1 text-neutral-500 font-normal">(optimized WebP, max 800px and 200KB)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                {(imagePreviewUrl || imageUrl.trim()) ? (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-brand-border bg-brand-darker">
                    <img
                      src={imagePreviewUrl || imageUrl}
                      alt="Product preview"
                      className="h-40 w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2">
                      <span className="text-[10px] font-mono text-white">
                        {isUploading ? 'Optimizing and uploading...' : 'Image ready'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#111111] hover:bg-neutral-100"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="rounded-lg bg-red-500 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleImageDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white px-4 py-7 text-center transition-colors hover:border-brand-flame hover:bg-orange-50"
                  >
                    <UploadCloud className="mb-2 h-7 w-7 text-brand-flame" />
                    <span className="text-xs font-bold text-[#333333]">Choose or drop an image here</span>
                    <span className="mt-1 text-[10px] text-neutral-500">JPG, PNG, WEBP, or GIF. Automatically compressed below 200KB.</span>
                  </div>
                )}
                {uploadError && (
                  <p className="mt-1.5 text-[11px] font-semibold text-red-600">{uploadError}</p>
                )}
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste an external image URL"
                  className="mt-2 w-full bg-brand-card border border-brand-border rounded-xl px-3.5 py-2 text-[#111111] text-xs focus:outline-none focus:border-brand-flame font-mono"
                />
                <p className="mt-1 text-[10px] text-neutral-500">External URLs are saved as provided and are not optimized by this upload tool.</p>
              </div>

              {/* Dynamic Combo Deals Builder Section */}
              <div className="pt-3 border-t border-brand-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDealToggle"
                      checked={isDeal}
                      onChange={(e) => setIsDeal(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-flame focus:ring-brand-flame"
                    />
                    <label htmlFor="isDealToggle" className="text-xs font-bold text-brand-yellow cursor-pointer flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-brand-flame fill-brand-flame" />
                      <span>This is a Combo Deal Bundle</span>
                    </label>
                  </div>
                </div>

                {isDeal && (
                  <div className="bg-brand-card/90 border border-brand-border p-4 rounded-2xl space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>Bundle Inclusions Builder</span>
                    </h4>

                    {/* Deal items list */}
                    {dealItems.length > 0 && (
                      <div className="space-y-1.5">
                        {dealItems.map((di, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-neutral-200 text-xs"
                          >
                            <span className="text-[#333333] font-semibold">
                              {di.quantity}x {di.name} {di.description ? `(${di.description})` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDealItem(idx)}
                              className="text-neutral-500 hover:text-red-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sub-form to add items into deal */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-brand-border/60">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={dealItemName}
                          onChange={(e) => setDealItemName(e.target.value)}
                          placeholder="e.g. Large Pizza"
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[#111111] text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          value={dealItemQty}
                          onChange={(e) => setDealItemQty(e.target.value)}
                          placeholder="Qty"
                          min="1"
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[#111111] text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={dealItemDesc}
                          onChange={(e) => setDealItemDesc(e.target.value)}
                          placeholder="Flavors / details"
                          className="w-full bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 text-[#111111] text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddDealItem}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-brand-darker font-bold py-1.5 rounded-lg text-xs"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-brand-border/60 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-flame"
                  />
                  <span className="text-[#333333]">Active (Visible on Storefront)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-flame"
                  />
                  <span className="text-[#333333]">Bestseller Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-flame"
                  />
                  <span className="text-[#333333]">Featured Highlight</span>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}