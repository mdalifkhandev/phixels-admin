import { useState } from 'react';
import { ContentModal } from './ContentModal';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { StatusModal } from './StatusModal';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  count: number;
}
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (categories: Category[]) => void;
  type: 'Blog' | 'Product';
}
export function CategoryModal({
  isOpen,
  onClose,
  categories: initialCategories,
  onSave,
  type
}: CategoryModalProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

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

  const colors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#6366F1',
    '#14B8A6' // Teal
  ];
  const handleAdd = () => {
    if (!formData.name) return;
    if (editingId) {
      setCategories(
        categories.map((c) =>
          c.id === editingId ?
            {
              ...c,
              ...formData
            } :
            c
        )
      );
      setEditingId(null);
    } else {
      setCategories([
        ...categories,
        {
          id: Date.now().toString(),
          ...formData,
          count: 0
        }]
      );
    }
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
  };
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
  };
  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Delete Category',
      message: `Are you sure you want to delete the category "${category?.name}"?`,
      action: () => {
        setCategories(categories.filter((c) => c.id !== id));
        setStatusModal({ ...statusModal, isOpen: false });
      },
      secondaryActionLabel: 'Cancel'
    });
  };
  const handleSaveAll = () => {
    onSave(categories);
    onClose();
  };
  return (
    <>
      <ContentModal
        isOpen={isOpen}
        onClose={onClose}
        title={`Manage ${type} Categories`}
        onSave={handleSaveAll}
        saveLabel="Save Changes">

        <div className="space-y-6">
          {/* Form */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-white">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              {editingId &&
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: '',
                      description: '',
                      color: '#3B82F6'
                    });
                  }}
                  className="text-xs text-gray-400 hover:text-white">

                  Cancel Edit
                </button>
              }
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="Category Name" />

              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c) =>
                    <button
                      key={c}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          color: c
                        })
                      }
                      className={`w-6 h-6 rounded-full border-2 transition-all ${formData.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{
                        backgroundColor: c
                      }} />

                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value
                  })
                }
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Brief description..." />

            </div>

            <button
              onClick={handleAdd}
              disabled={!formData.name}
              className="w-full py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">

              {editingId ? <Edit2 size={14} /> : <Plus size={14} />}
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {categories.map((category) =>
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">

                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: category.color
                    }} />

                  <div>
                    <div className="text-sm font-bold text-white">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.description || 'No description'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">
                    {category.count} {type === 'Blog' ? 'posts' : 'products'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">

                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">

                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {categories.length === 0 &&
              <div className="text-center py-8 text-gray-500 text-sm">
                No categories yet. Add one above.
              </div>
            }
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
    </>
  );
}