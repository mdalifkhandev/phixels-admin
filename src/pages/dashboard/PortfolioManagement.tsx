import { useState, useEffect } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { DataTable } from '../../components/dashboard/DataTable';
import { ManagementStatsCard } from '../../components/dashboard/ManagementStatsCard';
import { ContentModal } from '../../components/dashboard/ContentModal';
import { StatusModal } from '../../components/dashboard/StatusModal';
import { portfolioApi } from '../../services/api';
import type { PortfolioItem } from '../../types/types';

interface PortfolioDisplay extends PortfolioItem {
  id: string;
}

export function PortfolioManagement() {
  const [items, setItems] = useState<PortfolioDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioDisplay | null>(null);
  const [formData, setFormData] = useState<Omit<PortfolioItem, '_id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    client: '',
    category: '',
    details: '',
    technology: [],
    image: '',
    liveLink: '',
    activeUsers: ''
  });
  const [techInput, setTechInput] = useState('');

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

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.getAll();
      // Map _id to id for DataTable compatibility
      const portfolioWithIds = data.map(item => ({
        ...item,
        id: item._id
      }));
      setItems(portfolioWithIds);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to load portfolio'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: PortfolioDisplay) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      client: item.client,
      category: item.category,
      details: item.details,
      technology: item.technology || [],
      image: item.image,
      liveLink: item.liveLink || '',
      activeUsers: item.activeUsers || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: PortfolioDisplay) => {
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Delete Project',
      message: `Are you sure you want to delete "${item.title}"?`,
      action: async () => {
        try {
          await portfolioApi.delete(item.id);
          setItems(items.filter(i => i.id !== item.id));
          setStatusModal({
            isOpen: true,
            type: 'success',
            title: 'Deleted',
            message: 'Project has been deleted successfully.'
          });
        } catch (err: any) {
          console.error('Error deleting portfolio item:', err);
          setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: err.message || 'Failed to delete item'
          });
        }
      },
      secondaryActionLabel: 'Cancel'
    });
  };

  const handleSave = async () => {
    try {
      // Basic validation
      if (!formData.title || !formData.client || !formData.category || !formData.image) {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required fields'
        });
        return;
      }

      if (editingItem) {
        await portfolioApi.update(editingItem.id, formData);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Updated',
          message: 'Project has been updated successfully.'
        });
      } else {
        await portfolioApi.create(formData);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Created',
          message: 'Project has been created successfully.'
        });
      }

      await fetchPortfolio();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving portfolio item:', err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to save item'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      client: '',
      category: '',
      details: '',
      technology: [],
      image: '',
      liveLink: '',
      activeUsers: ''
    });
    setTechInput('');
  };

  const addTech = () => {
    if (techInput.trim() && !formData.technology.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technology: [...formData.technology, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTech = (techToRemove: string) => {
    setFormData({
      ...formData,
      technology: formData.technology.filter(t => t !== techToRemove)
    });
  };

  const columns = [
    {
      key: 'title',
      label: 'Project',
      render: (value: string, row: PortfolioDisplay) => (
        <div className="flex items-center gap-3">
          {row.image && (
            <img
              src={row.image}
              alt={value}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Img';
              }}
            />
          )}
          <span className="font-bold text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
          {value}
        </span>
      ),
    },
    {
      key: 'technology',
      label: 'Tech Stack',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 3).map((tech, i) => (
            <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs">
              {tech}
            </span>
          ))}
          {value?.length > 3 && (
            <span className="text-xs text-gray-400">+{value.length - 3}</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Portfolio Management
            </h1>
            <p className="text-gray-400">View and manage your project showcase</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all">
            <Plus size={20} />
            Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ManagementStatsCard
            title="Total Projects"
            value={items.length}
            icon={Briefcase}
            color="from-blue-500 to-cyan-500" />
          <ManagementStatsCard
            title="Categories"
            value={new Set(items.map((i) => i.category)).size}
            icon={Briefcase}
            color="from-purple-500 to-pink-500" />
          <ManagementStatsCard
            title="Clients"
            value={new Set(items.map((i) => i.client)).size}
            icon={Briefcase}
            color="from-green-500 to-emerald-500" />
        </div>

        <DataTable
          columns={columns}
          data={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable />

        <ContentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingItem ? 'Edit Project' : 'Add New Project'}
          onSave={handleSave}
          saveLabel={editingItem ? 'Update' : 'Create'}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                  placeholder="e.g. E-commerce Platform"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                  placeholder="e.g. Tech Corp"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                  placeholder="e.g. Web Development"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Image URL *
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                  placeholder="https://..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Project Details
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none resize-none"
                placeholder="Describe the project..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Live Link
                </label>
                <input
                  type="text"
                  value={formData.liveLink}
                  onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Active Users
                </label>
                <input
                  type="text"
                  value={formData.activeUsers}
                  onChange={(e) => setFormData({ ...formData, activeUsers: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                  placeholder="e.g. 10k+"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Technologies
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="Add technology (press Enter)"
                />
                <button
                  type="button"
                  onClick={addTech}
                  className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technology.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </ContentModal>
      </div>

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
    </>
  );
}
