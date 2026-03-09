import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Github,
  Info,
  Linkedin,
  Plus,
  Save,
  Twitter,
  Users,
} from "lucide-react";
import { ContentModal } from "../../components/dashboard/ContentModal";
import { DataTable } from "../../components/dashboard/DataTable";
import { ImageUploadField } from "../../components/dashboard/ImageUploadField";
import { ManagementStatsCard } from "../../components/dashboard/ManagementStatsCard";
import { StatusModal } from "../../components/dashboard/StatusModal";
import { aboutContentApi, teamMembersApi } from "../../services/api";
import type { AboutContent, AboutMetric, TeamMember } from "../../types/types";

type TabKey = "metrics" | "philosophy" | "team";

interface TeamMemberDisplay extends TeamMember {
  id: string;
}

const emptyTeamForm = {
  name: "",
  role: "",
  image: "",
  linkedin: "",
  twitter: "",
  github: "",
  isActive: true,
};

export function AboutManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>("metrics");
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    metrics: [],
    philosophy: {
      heading: "Our Philosophy",
      description: "",
      image: "",
    },
  });
  const [philosophyImageFile, setPhilosophyImageFile] = useState<File | null>(
    null,
  );
  const [teamMembers, setTeamMembers] = useState<TeamMemberDisplay[]>([]);
  const [teamForm, setTeamForm] = useState(emptyTeamForm);
  const [teamImageFile, setTeamImageFile] = useState<File | null>(null);
  const [editingTeamMember, setEditingTeamMember] =
    useState<TeamMemberDisplay | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingPhilosophy, setSavingPhilosophy] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
    action?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aboutData, teamData] = await Promise.all([
        aboutContentApi.get(),
        teamMembersApi.getAll(),
      ]);

      setAboutContent(aboutData);
      setTeamMembers(
        teamData.map((member) => ({
          ...member,
          id: member._id,
        })),
      );
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Load Failed",
        message: err.message || "Failed to load About page content",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMetrics = async (metrics: AboutMetric[]) => {
    try {
      const updated = await aboutContentApi.update({ metrics });
      setAboutContent(updated);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Metrics Updated",
        message: "About page metrics have been updated.",
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to update metrics",
      });
    }
  };

  const handleMetricChange = (
    index: number,
    key: keyof AboutMetric,
    value: string | number,
  ) => {
    setAboutContent((prev) => {
      const nextMetrics = [...prev.metrics];
      nextMetrics[index] = {
        ...nextMetrics[index],
        [key]: key === "value" ? Number(value) || 0 : value,
      };
      return { ...prev, metrics: nextMetrics };
    });
  };

  const addMetric = () => {
    setAboutContent((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { label: "", value: 0, suffix: "" }],
    }));
  };

  const removeMetric = (index: number) => {
    const nextMetrics = aboutContent.metrics.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    void saveMetrics(nextMetrics);
  };

  const handleSaveMetrics = async () => {
    const validMetrics = aboutContent.metrics.filter(
      (metric) => metric.label.trim() && Number.isFinite(metric.value),
    );

    if (!validMetrics.length) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: "Add at least one metric with a label and value.",
      });
      return;
    }

    await saveMetrics(validMetrics);
  };

  const handleSavePhilosophy = async () => {
    if (
      !aboutContent.philosophy.heading.trim() ||
      !aboutContent.philosophy.description.trim()
    ) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: "Heading and description are required.",
      });
      return;
    }

    try {
      setSavingPhilosophy(true);
      let image = aboutContent.philosophy.image || "";

      if (philosophyImageFile) {
        image = await aboutContentApi.uploadImage(philosophyImageFile);
      }

      const updated = await aboutContentApi.update({
        philosophy: {
          ...aboutContent.philosophy,
          image,
        },
      });

      setAboutContent(updated);
      setPhilosophyImageFile(null);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Philosophy Updated",
        message: "The philosophy section has been updated.",
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to update the philosophy section",
      });
    } finally {
      setSavingPhilosophy(false);
    }
  };

  const openCreateTeamModal = () => {
    setEditingTeamMember(null);
    setTeamImageFile(null);
    setTeamForm(emptyTeamForm);
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (member: TeamMemberDisplay) => {
    setEditingTeamMember(member);
    setTeamImageFile(null);
    setTeamForm({
      name: member.name,
      role: member.role,
      image: member.image || "",
      linkedin: member.socialLinks?.linkedin || "",
      twitter: member.socialLinks?.twitter || "",
      github: member.socialLinks?.github || "",
      isActive: member.isActive !== false,
    });
    setIsTeamModalOpen(true);
  };

  const closeTeamModal = () => {
    setEditingTeamMember(null);
    setTeamImageFile(null);
    setTeamForm(emptyTeamForm);
    setIsTeamModalOpen(false);
  };

  const handleSaveTeamMember = async () => {
    if (!teamForm.name.trim() || !teamForm.role.trim()) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: "Name and role are required.",
      });
      return;
    }

    try {
      const payload = {
        name: teamForm.name,
        role: teamForm.role,
        image: teamForm.image,
        socialLinks: {
          linkedin: teamForm.linkedin,
          twitter: teamForm.twitter,
          github: teamForm.github,
        },
        isActive: teamForm.isActive,
        sortOrder: editingTeamMember?.sortOrder ?? teamMembers.length,
      };

      if (editingTeamMember) {
        await teamMembersApi.update(
          editingTeamMember.id,
          payload,
          teamImageFile ?? undefined,
        );
      } else {
        await teamMembersApi.create(
          payload as Omit<TeamMember, "_id">,
          teamImageFile ?? undefined,
        );
      }

      await fetchData();
      closeTeamModal();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: editingTeamMember ? "Team Member Updated" : "Team Member Added",
        message: editingTeamMember
          ? "The team member has been updated."
          : "The team member has been added.",
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to save team member",
      });
    }
  };

  const handleDeleteTeamMember = async (member: TeamMemberDisplay) => {
    setStatusModal({
      isOpen: true,
      type: "error",
      title: "Delete Team Member",
      message: `Are you sure you want to delete "${member.name}"?`,
      action: async () => {
        try {
          await teamMembersApi.delete(member.id);
          await fetchData();
          setStatusModal({
            isOpen: true,
            type: "success",
            title: "Deleted",
            message: `${member.name} has been removed.`,
          });
        } catch (err: any) {
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Delete Failed",
            message: err.message || "Failed to delete team member",
          });
        }
      },
      secondaryActionLabel: "Cancel",
    });
  };

  const handleReorderTeamMembers = async (newOrder: TeamMemberDisplay[]) => {
    try {
      setTeamMembers(newOrder);
      await teamMembersApi.reorder(newOrder.map((member) => member.id));
    } catch (err: any) {
      await fetchData();
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Reorder Failed",
        message: err.message || "Failed to reorder team members",
      });
    }
  };

  const stats = useMemo(
    () => [
      {
        title: "Metrics",
        value: aboutContent.metrics.length,
        icon: BarChart3,
        color: "from-amber-500 to-yellow-500",
      },
      {
        title: "Team Members",
        value: teamMembers.length,
        icon: Users,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Active Members",
        value: teamMembers.filter((member) => member.isActive !== false).length,
        icon: Info,
        color: "from-green-500 to-emerald-500",
      },
    ],
    [aboutContent.metrics.length, teamMembers],
  );

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "metrics", label: "Metrics" },
    { key: "philosophy", label: "Philosophy" },
    { key: "team", label: "Team Members" },
  ];

  const teamColumns = [
    {
      key: "name",
      label: "Member",
      render: (value: string, row: TeamMemberDisplay) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img
              src={row.image}
              alt={value}
              className="w-12 h-12 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold">
              {value.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-bold text-white">{value}</div>
            <div className="text-xs text-gray-400">{row.role}</div>
          </div>
        </div>
      ),
    },
    {
      key: "socialLinks",
      label: "Socials",
      render: (_value: unknown, row: TeamMemberDisplay) => (
        <div className="flex items-center gap-2 text-gray-400">
          {row.socialLinks?.linkedin ? <Linkedin size={16} /> : null}
          {row.socialLinks?.twitter ? <Twitter size={16} /> : null}
          {row.socialLinks?.github ? <Github size={16} /> : null}
          {!row.socialLinks?.linkedin &&
          !row.socialLinks?.twitter &&
          !row.socialLinks?.github ? (
            <span className="text-xs text-gray-500">No links</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            value !== false
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {value !== false ? "Active" : "Hidden"}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="text-white p-4">Loading About page content...</div>;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              About Page Management
            </h1>
            <p className="text-gray-400">
              Manage live metrics, philosophy content, and team members.
            </p>
          </div>

          {activeTab === "team" ? (
            <button
              onClick={openCreateTeamModal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all"
            >
              <Plus size={20} />
              Add Team Member
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item) => (
            <ManagementStatsCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 rounded-xl border transition-colors ${
                activeTab === tab.key
                  ? "border-[color:var(--bright-red)] bg-[color:var(--bright-red)]/10 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "metrics" ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Metrics</h2>
                <p className="text-sm text-gray-400">
                  Add, edit, and remove the public About page counters.
                </p>
              </div>
              <button
                onClick={addMetric}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                Add Metric
              </button>
            </div>

            <div className="space-y-4">
              {aboutContent.metrics.map((metric, index) => (
                <div
                  key={`${metric.label}-${index}`}
                  className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_0.8fr_auto] gap-4 items-end rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">
                      Label
                    </label>
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) =>
                        handleMetricChange(index, "label", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                      placeholder="Projects Delivered"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">
                      Value
                    </label>
                    <input
                      type="number"
                      value={metric.value}
                      onChange={(e) =>
                        handleMetricChange(index, "value", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={metric.suffix}
                      onChange={(e) =>
                        handleMetricChange(index, "suffix", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                      placeholder="+"
                    />
                  </div>
                  <button
                    onClick={() => removeMetric(index)}
                    className="px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveMetrics}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all"
              >
                <Save size={18} />
                Save Metrics
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === "philosophy" ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Philosophy</h2>
              <p className="text-sm text-gray-400">
                Update the section heading, description, and featured image.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Heading
              </label>
              <input
                type="text"
                value={aboutContent.philosophy.heading}
                onChange={(e) =>
                  setAboutContent((prev) => ({
                    ...prev,
                    philosophy: {
                      ...prev.philosophy,
                      heading: e.target.value,
                    },
                  }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Our Philosophy"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Description
              </label>
              <textarea
                value={aboutContent.philosophy.description}
                onChange={(e) =>
                  setAboutContent((prev) => ({
                    ...prev,
                    philosophy: {
                      ...prev.philosophy,
                      description: e.target.value,
                    },
                  }))
                }
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Describe your philosophy..."
              />
            </div>

            <ImageUploadField
              value={aboutContent.philosophy.image || ""}
              onChange={(url) =>
                setAboutContent((prev) => ({
                  ...prev,
                  philosophy: {
                    ...prev.philosophy,
                    image: url,
                  },
                }))
              }
              onFileChange={setPhilosophyImageFile}
              label="Philosophy Image"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSavePhilosophy}
                disabled={savingPhilosophy}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all disabled:opacity-60"
              >
                <Save size={18} />
                {savingPhilosophy ? "Saving..." : "Save Philosophy"}
              </button>
            </div>
          </section>
        ) : null}

        {activeTab === "team" ? (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Team Members</h2>
              <p className="text-sm text-gray-400">
                Manage member details, image uploads, visibility, and drag-and-drop
                order.
              </p>
            </div>

            <DataTable
              columns={teamColumns}
              data={teamMembers}
              onEdit={openEditTeamModal}
              onDelete={handleDeleteTeamMember}
              searchable
              onReorder={handleReorderTeamMembers}
            />
          </section>
        ) : null}
      </div>

      <ContentModal
        isOpen={isTeamModalOpen}
        onClose={closeTeamModal}
        title={editingTeamMember ? "Edit Team Member" : "Add Team Member"}
        onSave={handleSaveTeamMember}
        saveLabel={editingTeamMember ? "Update" : "Create"}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Name</label>
              <input
                type="text"
                value={teamForm.name}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Alex Chen"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Role</label>
              <input
                type="text"
                value={teamForm.role}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Founder & CEO"
              />
            </div>
          </div>

          <ImageUploadField
            value={teamForm.image}
            onChange={(url) => setTeamForm((prev) => ({ ...prev, image: url }))}
            onFileChange={setTeamImageFile}
            label="Member Image"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                LinkedIn
              </label>
              <input
                type="url"
                value={teamForm.linkedin}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, linkedin: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Twitter
              </label>
              <input
                type="url"
                value={teamForm.twitter}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, twitter: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="https://x.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">GitHub</label>
              <input
                type="url"
                value={teamForm.github}
                onChange={(e) =>
                  setTeamForm((prev) => ({ ...prev, github: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={teamForm.isActive}
              onChange={(e) =>
                setTeamForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="rounded border-white/20 bg-white/5"
            />
            Show this member on the website
          </label>
        </div>
      </ContentModal>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionLabel={statusModal.secondaryActionLabel ? "Confirm" : undefined}
        onAction={statusModal.action}
        secondaryActionLabel={statusModal.secondaryActionLabel}
        onSecondaryAction={statusModal.onSecondaryAction}
      />
    </>
  );
}
