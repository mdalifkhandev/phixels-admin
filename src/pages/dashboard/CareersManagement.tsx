import { useState, useEffect } from 'react';
import { Plus, Users, MapPin, Briefcase, Calendar, Mail } from 'lucide-react';
import { DataTable } from '../../components/dashboard/DataTable';
import { ContentModal } from '../../components/dashboard/ContentModal';
import { ManagementStatsCard } from '../../components/dashboard/ManagementStatsCard';
import { RichTextEditor } from '../../components/dashboard/RichTextEditor';
import { StatusModal } from '../../components/dashboard/StatusModal';
import { careersApi } from '../../services/api';
import type { Career } from '../../types/types';

interface CareerDisplay extends Career {
  id: string;
}

export function CareersManagement() {
  const [jobs, setJobs] = useState<CareerDisplay[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CareerDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobType: 'Full-time',
    location: 'Remote',
    description: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    salaryRange: '',
    deadline: '',
    applicationEmail: ''
  });
  const [reqInput, setReqInput] = useState('');
  const [respInput, setRespInput] = useState('');

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
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const data = await careersApi.getAll();
      const displayData = data.map(c => ({
        ...c,
        id: c._id,
      }));
      setJobs(displayData);
    } catch (err: any) {
      console.error('Error fetching careers:', err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to load careers'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: CareerDisplay) => {
    setEditingJob(job);
    setFormData({
      jobTitle: job.jobTitle,
      jobType: job.jobType,
      location: job.location,
      description: job.description,
      requirements: job.requirements || [],
      responsibilities: job.responsibilities || [],
      salaryRange: job.salaryRange || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      applicationEmail: job.applicationEmail || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (job: CareerDisplay) => {
    setStatusModal({
      isOpen: true,
      type: 'error',
      title: 'Delete Job Posting',
      message: `Are you sure you want to delete "${job.jobTitle}"?`,
      action: async () => {
        try {
          await careersApi.delete(job.id);
          setJobs(jobs.filter((j) => j.id !== job.id));
          setStatusModal({
            isOpen: true,
            type: 'success',
            title: 'Job Deleted',
            message: 'The job posting has been successfully deleted.'
          });
        } catch (err: any) {
          console.error('Error deleting career:', err);
          setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: err.message || 'Failed to delete career'
          });
        }
      },
      secondaryActionLabel: 'Cancel'
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData
      };

      if (editingJob) {
        await careersApi.update(editingJob.id, payload);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Job Updated',
          message: 'The job posting has been successfully updated.'
        });
      } else {
        await careersApi.create(payload);
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Job Created',
          message: 'The new job posting has been successfully created.'
        });
      }
      fetchCareers();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving career:', err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Failed to save career'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    setFormData({
      jobTitle: '',
      jobType: 'Full-time',
      location: 'Remote',
      description: '',
      requirements: [],
      responsibilities: [],
      salaryRange: '',
      deadline: '',
      applicationEmail: ''
    });
    setReqInput('');
    setRespInput('');
  };

  const addRequirement = () => {
    if (reqInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, reqInput.trim()],
      });
      setReqInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const addResponsibility = () => {
    if (respInput.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, respInput.trim()],
      });
      setRespInput('');
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index),
    });
  };

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (value: string) => (
        <span className="font-bold text-white">{value}</span>
      ),
    },
    {
      key: 'salaryRange',
      label: 'Salary',
      render: (value: string) => (
        <span className="text-sm text-green-400">{value}</span>
      ),
    },
    {
      key: 'jobType',
      label: 'Type',
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
          {value}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value: string) => (
        <span className="flex items-center gap-1 text-gray-300">
          <Calendar size={14} /> {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'applicationEmail',
      label: 'Contact',
      render: (value: string) => (
        <span className="flex items-center gap-1 text-gray-400 text-xs">
          <Mail size={12} /> {value}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[color:var(--bright-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading careers...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Careers Management
            </h1>
            <p className="text-gray-400">Manage job postings and applications</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all">
            <Plus size={20} />
            Post Job
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ManagementStatsCard
            title="Active Jobs"
            value={jobs.length}
            icon={Briefcase}
            color="from-green-500 to-emerald-500" />
          <ManagementStatsCard
            title="Total Postings"
            value={jobs.length}
            icon={Users}
            color="from-blue-500 to-cyan-500" />
          <ManagementStatsCard
            title="Locations"
            value={new Set(jobs.map((j) => j.location)).size}
            icon={MapPin}
            color="from-purple-500 to-pink-500" />
        </div>

        <DataTable
          columns={columns}
          data={jobs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchable />

        <ContentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingJob ? 'Edit Job Posting' : 'Create New Job'}
          onSave={handleSave}
          saveLabel={editingJob ? 'Update' : 'Post Job'}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Backend Engineer"
                required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Job Type *
                </label>
                <input
                  type="text"
                  value={formData.jobType}
                  onChange={(e) =>
                    setFormData({ ...formData, jobType: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="Full-time"
                  required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="Remote"
                  required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Salary Range *
                </label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryRange: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="$60,000 - $80,000"
                  required />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Deadline *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Application Email *
              </label>
              <input
                type="email"
                value={formData.applicationEmail}
                onChange={(e) =>
                  setFormData({ ...formData, applicationEmail: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="careers@phixels.io"
                required />
            </div>

            <RichTextEditor
              value={formData.description}
              onChange={(description) =>
                setFormData({ ...formData, description })
              }
              label="Job Description *"
              placeholder="Describe the role, team, and what makes this opportunity exciting..." />

            {/* Requirements */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Requirements
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addRequirement())
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="Add requirement (press Enter)" />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Add
                </button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.requirements.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <span className="flex-1 text-white text-sm">{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(i)}
                      className="text-red-500 hover:text-red-400">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Responsibilities
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={respInput}
                  onChange={(e) => setRespInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addResponsibility())
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="Add responsibility (press Enter)" />
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                  Add
                </button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.responsibilities.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <span className="flex-1 text-white text-sm">{req}</span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(i)}
                      className="text-red-500 hover:text-red-400">
                      ×
                    </button>
                  </div>
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
