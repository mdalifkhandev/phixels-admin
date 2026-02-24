import { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar, Settings } from 'lucide-react';
import { DataTable } from '../../components/dashboard/DataTable';
import { ContentModal } from '../../components/dashboard/ContentModal';
import { CategoryModal } from '../../components/dashboard/CategoryModal';
import { ManagementStatsCard } from '../../components/dashboard/ManagementStatsCard';
import { ImageUploadField } from '../../components/dashboard/ImageUploadField';
import { RichTextEditor } from '../../components/dashboard/RichTextEditor';
import { StatusModal } from '../../components/dashboard/StatusModal';
import { blogsApi, servicesApi } from '../../services/api';
import type { Blog, CreateBlogPayload, Service } from '../../types/types';

interface BlogDisplay extends Blog {
  id: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  slug: string;
  tags: string[];
  status: 'published' | 'draft';
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  count: number;
}

const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Mobile',
    description: 'Mobile development',
    color: '#3B82F6',
    count: 0
  },
  {
    id: '2',
    name: 'AI',
    description: 'Artificial Intelligence',
    color: '#8B5CF6',
    count: 0
  },
  {
    id: '3',
    name: 'Web3',
    description: 'Blockchain & Web3',
    color: '#F59E0B',
    count: 0
  },
  {
    id: '4',
    name: 'Backend',
    description: 'Server side tech',
    color: '#10B981',
    count: 0
  }
];

export function BlogManagement() {
  const [posts, setPosts] = useState<BlogDisplay[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogDisplay | null>(null);
  const [loading, setLoading] = useState(true);

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

  const [postForm, setPostForm] = useState({
    title: '',
    category: 'Mobile',
    date: new Date().toISOString().split('T')[0],
    image: '',
    imageFile: null as File | null,
    slug: '',
    writer: 'Admin',
    readingTime: '5 min',
    details: '',
    tags: [] as string[],
    status: 'draft' as 'published' | 'draft',
    icon: '',
    serviceId: ''
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await servicesApi.getAll();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogsApi.getAll();
      const displayData = data.map(p => ({
        ...p,
        id: p._id,
        excerpt: p.details ? (p.details.substring(0, 100) + '...') : '',
        category: 'Uncategorized', // API might not have this yet
        date: p.createdAt || new Date().toISOString(),
        readTime: p.readingTime || '5 min',
        slug: p.title.toLowerCase().replace(/ /g, '-'),
        status: 'published' as const,
        tags: p.tags || []
      }));
      setPosts(displayData);
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to fetch blogs'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogDisplay) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      category: post.category,
      date: post.date,
      image: post.image || '',
      imageFile: null,
      slug: post.slug,
      writer: post.writer,
      readingTime: post.readingTime || '5 min',
      details: post.details,
      tags: post.tags,
      status: post.status,
      icon: post.icon || '',
      serviceId: post.serviceId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (post: BlogDisplay) => {
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Delete Blog Post',
      message: `Are you sure you want to delete "${post.title}"?`,
      action: async () => {
        try {
          await blogsApi.delete(post.id);
          setPosts(posts.filter((p) => p.id !== post.id));
          setStatusModal({
            isOpen: true,
            type: 'success',
            title: 'Post Deleted',
            message: `Blog post "${post.title}" has been successfully deleted.`
          });
        } catch (err: any) {
          console.error('Error deleting blog:', err);
          setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: err.message || 'Failed to delete blog post. Please try again.'
          });
        }
      },
      secondaryActionLabel: 'Cancel'
    });
  };

  const handleSave = async () => {
    try {

      // Basic Validation
      if (!postForm.title || !postForm.writer || !postForm.details) {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Validation Error',
          message: `Please fill in all required fields: ${!postForm.title ? 'Title, ' : ''}${!postForm.writer ? 'Author, ' : ''}${!postForm.details ? 'Content' : ''}`.replace(/, $/, '')
        });
        return;
      }

      if (!editingPost && !postForm.imageFile) {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Validation Error',
          message: 'Please upload a featured image for the blog post.'
        });
        return;
      }

      // Note: We are mocking the image file handling for now as the API expects FormData for file
      // but we are using JSON payload in this iteration unless we refactor api.ts strongly.
      // Assuming api.ts `create` handles JSON payload properly or we need to update it.
      // Based on previous files, we send a JSON object.

      const payload: CreateBlogPayload = {
        title: postForm.title,
        writer: postForm.writer,
        readingTime: postForm.readingTime,
        details: postForm.details,
        tags: postForm.tags,
        image: postForm.imageFile || undefined,
        icon: postForm.icon,
        serviceId: postForm.serviceId
      };

      if (editingPost) {
        await blogsApi.update(editingPost.id, payload);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Post Updated',
          message: `Blog post "${postForm.title}" has been successfully updated.`
        });
      } else {
        await blogsApi.create(payload);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Post Created',
          message: `Blog post "${postForm.title}" has been successfully created.`
        });
      }
      await fetchPosts();
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Operation Failed',
        message: err.message || 'Failed to save blog post. Please try again.'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setPostForm({
      title: '',
      category: 'Mobile',
      date: new Date().toISOString().split('T')[0],
      image: '',
      imageFile: null,
      slug: '',
      writer: 'Admin',
      readingTime: '5 min',
      details: '',
      tags: [],
      status: 'draft',
      icon: '',
      serviceId: ''
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !postForm.tags.includes(tagInput.trim())) {
      setPostForm({
        ...postForm,
        tags: [...postForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setPostForm({
      ...postForm,
      tags: postForm.tags.filter((_, i) => i !== index)
    });
  };

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (value: string) => (
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          <span className="text-xl">{value || '📰'}</span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Post Title',
      render: (value: string, row: BlogDisplay) =>
        <div className="flex items-center gap-3">
          {row.image && (
            <img
              src={row.image}
              alt={value}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Blog';
              }}
            />
          )}

          <div className="max-w-md">
            <div className="font-bold text-white line-clamp-1">{value}</div>
            <div className="text-xs text-gray-400 line-clamp-1">
              {row.excerpt}
            </div>
          </div>
        </div>
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => {
        const cat = categories.find((c) => c.name === value);
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: cat ? `${cat.color}20` : '#3B82F620',
              color: cat ? cat.color : '#3B82F6'
            }}>

            {value}
          </span>);

      }
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'readTime',
      label: 'Read Time'
    },
    {
      key: 'serviceId',
      label: 'Related Service',
      render: (value: string) => {
        const service = services.find(s => s._id === value);
        return service ? (
          <span className="text-blue-400 font-medium">{service.title}</span>
        ) : (
          <span className="text-gray-500">-</span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) =>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${value === 'published' ? 'bg-[color:var(--vibrant-green)]/20 text-[color:var(--vibrant-green)]' : 'bg-yellow-500/20 text-yellow-500'}`}>

          {value}
        </span>
    }];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading posts...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Blog Management
            </h1>
            <p className="text-gray-400">Create and manage blog posts</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">

              <Settings size={20} />
              Categories
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all">

              <Plus size={20} />
              New Post
            </button>
          </div>
        </div>





        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ManagementStatsCard
            title="Total Posts"
            value={posts.length}
            icon={BookOpen}
            color="from-blue-500 to-cyan-500" />

          <ManagementStatsCard
            title="Published"
            value={posts.filter((p) => p.status === 'published').length}
            icon={BookOpen}
            color="from-green-500 to-emerald-500" />

          <ManagementStatsCard
            title="Drafts"
            value={posts.filter((p) => p.status === 'draft').length}
            icon={BookOpen}
            color="from-yellow-500 to-orange-500" />

          <ManagementStatsCard
            title="Categories"
            value={categories.length}
            icon={Calendar}
            color="from-purple-500 to-pink-500" />

        </div>

        <DataTable
          columns={columns}
          data={posts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable />
      </div>



      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSave={setCategories}
        type="Blog" />


      <ContentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPost ? 'Edit Blog Post' : 'Create New Post'}
        onSave={handleSave}
        saveLabel={editingPost ? 'Update' : 'Publish'}>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Post Title *
            </label>
            <input
              type="text"
              value={postForm.title}
              onChange={(e) =>
                setPostForm({
                  ...postForm,
                  title: e.target.value
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="The Future of AI in Mobile Development"
              required />

          </div>



          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Category *
              </label>
              <select
                value={postForm.category}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    category: e.target.value
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none">

                {categories.map((cat) =>
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Date *
              </label>
              <input
                type="date"
                value={postForm.date}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    date: e.target.value
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                required />

            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Read Time
              </label>
              <input
                type="text"
                value={postForm.readingTime}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    readingTime: e.target.value
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="5 min" />

            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Author/Writer *
            </label>
            <input
              type="text"
              value={postForm.writer}
              onChange={(e) =>
                setPostForm({
                  ...postForm,
                  writer: e.target.value
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="John Doe"
              required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              URL Slug *
            </label>
            <input
              type="text"
              value={postForm.slug}
              onChange={(e) =>
                setPostForm({
                  ...postForm,
                  slug: e.target.value
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="future-of-ai-mobile-dev"
            />

          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addTag())
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Add tag (press Enter)" />

              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">

                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {postForm.tags.map((tag, i) =>
                <span
                  key={i}
                  className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2">

                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(i)}
                    className="hover:text-red-500">

                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Related Service
              </label>
              <select
                value={postForm.serviceId}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    serviceId: e.target.value
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none">
                <option value="">Select a Service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Icon
              </label>
              <input
                type="text"
                value={postForm.icon}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    icon: e.target.value
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
                placeholder="e.g., 🌐, web-icon, or FaLaptop" />
            </div>
          </div>

          <ImageUploadField
            value={postForm.image}
            onChange={(url) =>
              setPostForm({
                ...postForm,
                image: url
              })
            }
            onFileChange={(file) =>
              setPostForm({
                ...postForm,
                imageFile: file
              })
            }
            label="Featured Image *" />


          <RichTextEditor
            value={postForm.details}
            onChange={(details) =>
              setPostForm({
                ...postForm,
                details
              })
            }
            label="Post Content *"
            placeholder="Write your blog post content here..." />


          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="published"
                  checked={postForm.status === 'published'}
                  onChange={(e) =>
                    setPostForm({
                      ...postForm,
                      status: e.target.value as 'published' | 'draft'
                    })
                  } />

                <span className="text-white">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="draft"
                  checked={postForm.status === 'draft'}
                  onChange={(e) =>
                    setPostForm({
                      ...postForm,
                      status: e.target.value as 'published' | 'draft'
                    })
                  } />

                <span className="text-white">Draft</span>
              </label>
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
    </>
  );
}
