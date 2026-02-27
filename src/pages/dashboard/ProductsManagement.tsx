import { useState, useEffect } from 'react';
import { Plus, Package } from 'lucide-react';
import { DataTable } from '../../components/dashboard/DataTable';
import { ContentModal } from '../../components/dashboard/ContentModal';
import { ImageUploadField } from '../../components/dashboard/ImageUploadField';
import { ManagementStatsCard } from '../../components/dashboard/ManagementStatsCard';
import { StatusModal } from '../../components/dashboard/StatusModal';
import { productsApi } from '../../services/api';
import type { Product } from '../../types/types';

// Extended Product type for UI display
interface ProductDisplay extends Product {
  id: string;
}

export function ProductsManagement() {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Template',
    demoLink: '',
    features: [] as string[],
    image: '',
    reviewRating: null as number | null,
    userCount: null as number | null,
    downloadsEnabled: false,
    downloadCount: null as number | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [pinUpdatingId, setPinUpdatingId] = useState<string | null>(null);

  // Status Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    action?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      const displayData = data.map(p => ({
        ...p,
        id: p._id || '',
        category: p.category || 'Template',
        features: p.features || [],
        reviewRating: p.reviewRating ?? null,
        userCount: p.userCount ?? null,
        downloadsEnabled: p.downloadsEnabled ?? false,
        downloadCount: p.downloadCount ?? null,
      }));
      setProducts(displayData);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to load products'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: ProductDisplay) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      demoLink: product.demoLink || '',
      features: product.features,
      image: product.images?.[0] || '',
      reviewRating: product.reviewRating ?? null,
      userCount: product.userCount ?? null,
      downloadsEnabled: product.downloadsEnabled ?? false,
      downloadCount: product.downloadCount ?? null,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (product: ProductDisplay) => {
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      action: async () => {
        try {
          await productsApi.delete(product.id);
          setProducts(products.filter((p) => p.id !== product.id));
          setStatusModal({
            isOpen: true,
            type: 'success',
            title: 'Product Deleted',
            message: `"${product.name}" has been successfully deleted.`
          });
        } catch (err: any) {
          console.error('Error deleting product:', err);
          setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: err.message || 'Failed to delete product. Please try again.'
          });
        }
      },
      secondaryActionLabel: 'Cancel'
    });
  };

  const getAvailablePinOrders = (product?: ProductDisplay): Array<1 | 2 | 3> => {
    const occupied = new Set(
      products
        .filter((p) => p.isPinned && (!product || p.id !== product.id))
        .map((p) => p.pinOrder)
        .filter((order): order is 1 | 2 | 3 => order === 1 || order === 2 || order === 3),
    );

    return ([1, 2, 3] as Array<1 | 2 | 3>).filter((order) => !occupied.has(order));
  };

  const handlePin = async (product: ProductDisplay) => {
    try {
      const availableOrders = getAvailablePinOrders(product);
      if (availableOrders.length === 0) {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Pin Failed',
          message: 'Maximum 3 pinned products allowed. Unpin one product first.',
        });
        return;
      }

      setPinUpdatingId(product.id);
      const targetOrder = availableOrders[0];
      await productsApi.updatePin(product.id, { isPinned: true, pinOrder: targetOrder });
      await fetchProducts();
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Product Pinned',
        message: `"${product.name}" pinned at slot ${targetOrder}.`,
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Pin Failed',
        message: err.message || 'Failed to pin product.',
      });
    } finally {
      setPinUpdatingId(null);
    }
  };

  const handleUnpin = async (product: ProductDisplay) => {
    try {
      setPinUpdatingId(product.id);
      await productsApi.updatePin(product.id, { isPinned: false, pinOrder: null });
      await fetchProducts();
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Product Unpinned',
        message: `"${product.name}" removed from pinned products.`,
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Unpin Failed',
        message: err.message || 'Failed to unpin product.',
      });
    } finally {
      setPinUpdatingId(null);
    }
  };

  const handlePinOrderChange = async (product: ProductDisplay, pinOrder: 1 | 2 | 3) => {
    try {
      setPinUpdatingId(product.id);
      await productsApi.updatePin(product.id, { isPinned: true, pinOrder });
      await fetchProducts();
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Pin Order Update Failed',
        message: err.message || 'Failed to update pin order.',
      });
    } finally {
      setPinUpdatingId(null);
    }
  };

  const handleSave = async () => {
    try {
      // Basic Validation
      if (!formData.name || !formData.description || !formData.category) {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required fields (Name, Description, Category).'
        });
        return;
      }

      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await productsApi.uploadImage(imageFile);
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        demoLink: formData.demoLink || undefined,
        pricing: 0,
        features: formData.features,
        images: imageUrl ? [imageUrl] : [],
        reviewRating: formData.reviewRating,
        userCount: formData.userCount,
        downloadsEnabled: formData.downloadsEnabled,
        downloadCount: formData.downloadsEnabled ? formData.downloadCount : null,
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Product Updated',
          message: `"${formData.name}" has been successfully updated.`
        });
      } else {
        await productsApi.create(payload);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Product Created',
          message: `"${formData.name}" has been successfully created.`
        });
      }
      await fetchProducts();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Operation Failed',
        message: err.message || 'Failed to save product. Please try again.'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Template',
      demoLink: '',
      features: [],
      image: '',
      reviewRating: null,
      userCount: null,
      downloadsEnabled: false,
      downloadCount: null,
    });
    setImageFile(null);
    setFeatureInput('');
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      render: (value: string) => (
        <span className="font-bold text-white">{value}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span className="text-gray-300 line-clamp-1">{value}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
          {value}
        </span>
      ),
    },
    {
      key: 'features',
      label: 'Features',
      render: (value: string[]) => (
        <span className="text-gray-400">{value ? value.length : 0} features</span>
      ),
    },
    {
      key: 'reviewRating',
      label: 'Review',
      render: (_value: number | null, row: ProductDisplay) => (
        <span className="text-gray-300">
          {row.reviewRating != null ? row.reviewRating.toFixed(1) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'userCount',
      label: 'Users',
      render: (_value: number | null, row: ProductDisplay) => (
        <span className="text-gray-300">
          {row.userCount != null ? row.userCount.toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'downloadCount',
      label: 'Downloads',
      render: (_value: number | null, row: ProductDisplay) => (
        <span className="text-gray-300">
          {row.downloadsEnabled
            ? row.downloadCount != null
              ? row.downloadCount.toLocaleString()
              : 0
            : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'isPinned',
      label: 'Pinned',
      render: (_value: boolean, row: ProductDisplay) => {
        const availableOrders = getAvailablePinOrders(row);
        const selectableOrders = row.isPinned && row.pinOrder
          ? ([...new Set([row.pinOrder, ...availableOrders])] as Array<1 | 2 | 3>)
              .sort((a, b) => a - b)
          : availableOrders;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                row.isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'
              }`}
            >
              {row.isPinned ? `Pinned (${row.pinOrder ?? '-'})` : 'Not pinned'}
            </span>
            {row.isPinned ? (
              <>
                <select
                  value={row.pinOrder ?? ''}
                  onChange={(e) =>
                    handlePinOrderChange(row, Number(e.target.value) as 1 | 2 | 3)
                  }
                  disabled={pinUpdatingId === row.id}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                >
                  {selectableOrders.map((order) => (
                    <option key={order} value={order} className="bg-black text-white">
                      Slot {order}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleUnpin(row)}
                  disabled={pinUpdatingId === row.id}
                  className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 disabled:opacity-60"
                >
                  Unpin
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handlePin(row)}
                disabled={pinUpdatingId === row.id}
                className="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs hover:bg-yellow-500/30 disabled:opacity-60"
              >
                Pin
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Products Management
          </h1>
          <p className="text-gray-400">
            Manage your digital products and applications
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ManagementStatsCard
          title="Total Products"
          value={products.length}
          icon={Package}
          color="from-blue-500 to-cyan-500" />
        <ManagementStatsCard
          title="Categories"
          value={new Set(products.map(p => p.category)).size}
          icon={Package}
          color="from-purple-500 to-pink-500" />
        <ManagementStatsCard
          title="Pinned Products"
          value={products.filter((p) => p.isPinned).length}
          icon={Package}
          color="from-yellow-500 to-amber-500" />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchable />

      {/* Add/Edit Modal */}
      <ContentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        onSave={handleSave}
        saveLabel={editingProduct ? 'Update' : 'Create'}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
              placeholder="SaaS Starter Kit"
              required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none resize-none"
              placeholder="A complete starter kit for SaaS"
              required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Category *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="Template"
              required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Product URL (Launch Link)</label>
            <input
              type="url"
              value={formData.demoLink}
              onChange={(e) =>
                setFormData({ ...formData, demoLink: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="https://your-product-link.com"
            />
          </div>

          <ImageUploadField
            label="Product Image"
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            onFileChange={(file) => setImageFile(file)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Review Rating</label>
              <input
                type="number"
                min={0}
                max={5}
                step="0.1"
                value={formData.reviewRating ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reviewRating: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="4.8"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Users</label>
              <input
                type="number"
                min={0}
                value={formData.userCount ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    userCount: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="10000"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <label className="text-sm text-gray-300 font-medium">Show Downloads</label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    downloadsEnabled: !formData.downloadsEnabled,
                    downloadCount: !formData.downloadsEnabled
                      ? formData.downloadCount
                      : null,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.downloadsEnabled ? 'bg-[color:var(--bright-red)]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.downloadsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.downloadsEnabled && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Downloads</label>
                <input
                  type="number"
                  min={0}
                  value={formData.downloadCount ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      downloadCount: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="25000"
                />
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Features
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Add feature (press Enter)" />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="hover:text-red-500">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </ContentModal>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionLabel={statusModal.secondaryActionLabel ? 'Confirm' : undefined}
        onAction={statusModal.action}
        secondaryActionLabel={statusModal.secondaryActionLabel}
      />
    </div>
  );
}
