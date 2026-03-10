import React, { useState, useEffect } from "react";
import { Info, Plus, Save, Trash2 } from "lucide-react";
import { DataTable } from "../../components/dashboard/DataTable";
import { ContentModal } from "../../components/dashboard/ContentModal";
import { StatusModal } from "../../components/dashboard/StatusModal";
import { ImageUploadField } from "../../components/dashboard/ImageUploadField";
import { aboutContentApi, teamMembersApi } from "../../services/api";
import type { AboutContent, AboutMetric, TeamMember } from "../../types/types";

export function AboutManagement() {
  const [activeTab, setActiveTab] = useState<"metrics" | "philosophy" | "team">("metrics");
  const [loading, setLoading] = useState(true);

  // About Content State
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    metrics: [],
    philosophy: { heading: "", description: "", image: "" },
  });

  // Team State
  const [teamMembers, setTeamMembers] = useState<(TeamMember & { id: string })[]>([]);

  // Modals
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<(TeamMember & { id: string }) | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    name: "",
    role: "",
    image: "",
    socialLinks: { linkedin: "", twitter: "", github: "" },
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contentRes, teamRes] = await Promise.all([
        aboutContentApi.get(),
        teamMembersApi.getAll(),
      ]);
      setAboutContent(contentRes || { metrics: [], philosophy: { heading: "", description: "", image: "" } });
      const mappedTeam = (teamRes || []).map((t) => ({ ...t, id: t._id }));
      // Sort team members based on sortOrder
      mappedTeam.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setTeamMembers(mappedTeam);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAboutContent = async () => {
    try {
      await aboutContentApi.update(aboutContent);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "About content updated successfully",
      });
    } catch (error) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to update about content",
      });
    }
  };

  const addMetric = () => {
    setAboutContent({
      ...aboutContent,
      metrics: [...aboutContent.metrics, { label: "", value: 0, suffix: "" }],
    });
  };

  const updateMetric = (index: number, field: keyof AboutMetric, value: string | number) => {
    const newMetrics = [...aboutContent.metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setAboutContent({ ...aboutContent, metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = aboutContent.metrics.filter((_, i) => i !== index);
    setAboutContent({ ...aboutContent, metrics: newMetrics });
  };

  // Team Handlers
  const handleTeamReorder = async (reorderedItems: typeof teamMembers) => {
    setTeamMembers(reorderedItems);
    try {
      // Create array of IDs in new order
      const orderedIds = reorderedItems.map((item) => item.id);
      await teamMembersApi.reorder(orderedIds);
    } catch (error) {
      console.error("Failed to reorder team members", error);
      fetchData(); // Reset to backend state
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeamMember) {
        await teamMembersApi.update(editingTeamMember.id, teamFormData);
      } else {
        await teamMembersApi.create(teamFormData as any);
      }
      setIsTeamModalOpen(false);
      fetchData();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: `Team member ${editingTeamMember ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error(error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to save team member",
      });
    }
  };

  const handleTeamDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;
    try {
      await teamMembersApi.delete(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete team member");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading about content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">About Page Management</h1>
          <p className="text-gray-400">Manage metrics, philosophy, and team members</p>
        </div>
        <div className="p-3 bg-neon-cyan/10 rounded-xl">
          <Info className="w-6 h-6 text-neon-cyan" />
        </div>
      </div>

      <div className="bg-dark-200 border border-white/5 rounded-xl overflow-hidden">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "metrics" ? "text-neon-cyan border-b-2 border-neon-cyan" : "text-gray-400 hover:text-white"
            }`}
          >
            Company Metrics
          </button>
          <button
            onClick={() => setActiveTab("philosophy")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "philosophy" ? "text-neon-cyan border-b-2 border-neon-cyan" : "text-gray-400 hover:text-white"
            }`}
          >
            Our Philosophy
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "team" ? "text-neon-cyan border-b-2 border-neon-cyan" : "text-gray-400 hover:text-white"
            }`}
          >
            Team Members
          </button>
        </div>

        <div className="p-6">
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Count Metrics</h3>
                <button
                  onClick={addMetric}
                  className="flex items-center px-4 py-2 bg-neon-cyan/10 text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Metric
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aboutContent.metrics.map((metric, index) => (
                  <div key={index} className="bg-dark-300 p-4 rounded-lg border border-white/5 space-y-4">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-300">Metric #{index + 1}</h4>
                      <button onClick={() => removeMetric(index)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Label</label>
                      <input
                        type="text"
                        value={metric.label}
                        onChange={(e) => updateMetric(index, "label", e.target.value)}
                        className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
                        placeholder="e.g. Projects Delivered"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Value</label>
                        <input
                          type="number"
                          value={metric.value}
                          onChange={(e) => updateMetric(index, "value", Number(e.target.value))}
                          className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Suffix</label>
                        <input
                          type="text"
                          value={metric.suffix}
                          onChange={(e) => updateMetric(index, "suffix", e.target.value)}
                          className="w-full bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
                          placeholder="e.g. +"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveAboutContent}
                  className="flex items-center px-6 py-2 bg-neon-cyan text-dark-100 font-medium rounded-lg hover:bg-neon-cyan/90 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Metrics
                </button>
              </div>
            </div>
          )}

          {activeTab === "philosophy" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Heading</label>
                <input
                  type="text"
                  value={aboutContent.philosophy.heading}
                  onChange={(e) =>
                    setAboutContent({
                      ...aboutContent,
                      philosophy: { ...aboutContent.philosophy, heading: e.target.value },
                    })
                  }
                  className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description (Supports HTML/Text)</label>
                  <textarea
                    rows={8}
                    value={aboutContent.philosophy.description}
                    onChange={(e) =>
                      setAboutContent({
                        ...aboutContent,
                        philosophy: { ...aboutContent.philosophy, description: e.target.value },
                      })
                    }
                    className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Philosophy Image</label>
                  <div className="bg-dark-300 border border-white/10 rounded-lg p-4">
                    <ImageUploadField
                      label=""
                      value={aboutContent.philosophy.image || ""}
                      onChange={(url) =>
                        setAboutContent({
                          ...aboutContent,
                          philosophy: { ...aboutContent.philosophy, image: url },
                        })
                      }
                      onFileChange={async (file) => {
                        try {
                          const url = await aboutContentApi.uploadImage(file);
                          setAboutContent({
                            ...aboutContent,
                            philosophy: { ...aboutContent.philosophy, image: url },
                          });
                        } catch (e) {
                          console.error("Failed to upload logic image", e);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveAboutContent}
                  className="flex items-center px-6 py-2 bg-neon-cyan text-dark-100 font-medium rounded-lg hover:bg-neon-cyan/90 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Philosophy
                </button>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white">Manage Team Members</h3>
                <button
                  onClick={() => {
                    setEditingTeamMember(null);
                    setTeamFormData({
                      name: "",
                      role: "",
                      image: "",
                      socialLinks: { linkedin: "", twitter: "", github: "" },
                      isActive: true,
                    });
                    setIsTeamModalOpen(true);
                  }}
                  className="flex items-center px-4 py-2 bg-neon-cyan text-dark-100 rounded-lg hover:bg-neon-cyan/90 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </button>
              </div>
              
              <DataTable
                data={teamMembers}
                onReorder={handleTeamReorder}
                columns={[
                  {
                    key: "member",
                    label: "Member",
                    render: (value: any, row: any) => (
                      <div className="flex items-center space-x-3">
                        {row.image ? (
                          <img src={row.image} alt={row.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center border border-white/10 text-gray-400 text-xs">No img</div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">{row.name}</div>
                          <div className="text-xs text-gray-400">{row.role}</div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value: any, row: any) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${row.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {row.isActive ? "Active" : "Inactive"}
                      </span>
                    ),
                  },
                  {
                    key: "links",
                    label: "Links",
                    render: (value: any, row: any) => {
                      const links = [];
                      if (row.socialLinks?.linkedin) links.push("IN");
                      if (row.socialLinks?.twitter) links.push("TW");
                      if (row.socialLinks?.github) links.push("GH");
                      return <span className="text-xs text-gray-400">{links.join(", ") || "None"}</span>;
                    }
                  }
                ]}
                onEdit={(row) => {
                  setEditingTeamMember(row);
                  setTeamFormData({
                    name: row.name,
                    role: row.role,
                    image: row.image || "",
                    socialLinks: row.socialLinks || { linkedin: "", twitter: "", github: "" },
                    isActive: row.isActive ?? true,
                  });
                  setIsTeamModalOpen(true);
                }}
                onDelete={(row) => handleTeamDelete(row.id)}
              />
            </div>
          )}
        </div>
      </div>

      <ContentModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={editingTeamMember ? "Edit Team Member" : "Add Team Member"}
      >
        <form onSubmit={handleTeamSubmit} className="space-y-6">
          <ImageUploadField
            label="Profile Image"
            value={teamFormData.image || ""}
            onChange={(url) => setTeamFormData({ ...teamFormData, image: url })}
            onFileChange={async (file) => {
              try {
                const url = await teamMembersApi.uploadImage(file);
                setTeamFormData({ ...teamFormData, image: url });
              } catch (e) {
                console.error("Failed to upload team image", e);
              }
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
              <input
                required
                type="text"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role *</label>
              <input
                required
                type="text"
                value={teamFormData.role}
                onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Social Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={teamFormData.socialLinks.linkedin}
                  onChange={(e) => setTeamFormData({ ...teamFormData, socialLinks: { ...teamFormData.socialLinks, linkedin: e.target.value } })}
                  className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Twitter URL</label>
                <input
                  type="url"
                  value={teamFormData.socialLinks.twitter}
                  onChange={(e) => setTeamFormData({ ...teamFormData, socialLinks: { ...teamFormData.socialLinks, twitter: e.target.value } })}
                  className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={teamFormData.socialLinks.github}
                  onChange={(e) => setTeamFormData({ ...teamFormData, socialLinks: { ...teamFormData.socialLinks, github: e.target.value } })}
                  className="w-full bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={teamFormData.isActive}
              onChange={(e) => setTeamFormData({ ...teamFormData, isActive: e.target.checked })}
              className="w-4 h-4 rounded bg-dark-300 border-white/10 text-neon-cyan focus:ring-neon-cyan focus:ring-offset-dark-200"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
              Active (show on website)
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-neon-cyan text-dark-100 font-medium rounded-lg hover:bg-neon-cyan/90 transition-colors"
            >
              Save Team Member
            </button>
          </div>
        </form>
      </ContentModal>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  );
}
