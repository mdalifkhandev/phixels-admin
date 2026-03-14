import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Layout,
  Home,
  ShoppingBag,
  Info,
  UserPlus,
  Mail,
  Shield,
  FileCheck,
  Map,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";
import { DataTable } from "../../components/dashboard/DataTable";
import { ContentModal } from "../../components/dashboard/ContentModal";
import { StatusModal } from "../../components/dashboard/StatusModal";
import { ImageUploadField } from "../../components/dashboard/ImageUploadField";
import { RichTextEditor } from "../../components/dashboard/RichTextEditor";
import { apiService } from "../../services/api";
import { stripRichText } from "../../utils/richText";
import type { PageContent, PageSection } from "../../types/types";

const PAGES = [
  { id: "home", title: "Home Page", icon: Home },
  { id: "services", title: "Services", icon: Layers },
  { id: "products", title: "Products", icon: ShoppingBag },
  { id: "works", title: "Works (Portfolio)", icon: Layout },
  { id: "about", title: "About Us", icon: Info },
  { id: "career", title: "Careers", icon: UserPlus },
  { id: "blog", title: "Insights / Blog", icon: FileText },
  { id: "contact", title: "Contact Us", icon: Mail },
  { id: "popup", title: "Master Popup", icon: Sparkles },
  { id: "privacy", title: "Privacy Policy", icon: Shield },
  { id: "terms", title: "Terms & Conditions", icon: FileCheck },
  { id: "sitemap", title: "Sitemap", icon: Map },
];

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState(PAGES[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  // Section Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(
    null,
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<PageSection>({
    sectionKey: "",
    head: "",
    subHead: "",
    caption: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    image: "",
  });

  // Status Modal
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const fetchPageContent = async (pageKey: string) => {
    try {
      setLoading(true);
      const data = await apiService.pageContent.getOne(pageKey);
      if (data) {
        setPageContent(data);
      } else {
        const pageTitle = PAGES.find((p) => p.id === pageKey)?.title || pageKey;
        setPageContent({
          pageKey,
          title: pageTitle,
          sections: [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch page content", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent(activeTab);
  }, [activeTab]);



  const handleOpenModal = (section?: PageSection, index?: number) => {
    const defaultData: PageSection = {
      sectionKey: "",
      head: "",
      subHead: "",
      caption: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      image: "",
    };

    if (section) {
      setEditingSection(section);
      setEditingIndex(index !== undefined ? index : null);
      setFormData({ ...defaultData, ...section });
    } else {
      setEditingSection(null);
      setEditingIndex(null);
      setFormData(defaultData);
    }
    setIsModalOpen(true);
  };

  const handleSaveSection = async () => {
    if (!pageContent) return;

    const updatedSections = [...pageContent.sections];
    if (editingIndex !== null) {
      updatedSections[editingIndex] = formData;
    } else {
      updatedSections.push(formData);
    }

    const updatedContent = {
      ...pageContent,
      sections: updatedSections,
    };

    setPageContent(updatedContent);

    // Direct Save to Server
    try {
      setSaving(true);
      await apiService.pageContent.update(updatedContent);
      const displayTitle = updatedContent.title || PAGES.find((p) => p.id === activeTab)?.title || activeTab;
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: `${displayTitle} content updated successfully`,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save content", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to update content. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (index: number) => {
    if (!pageContent) return;
    if (confirm("Are you sure you want to delete this section?")) {
      const updatedSections = [...pageContent.sections];
      updatedSections.splice(index, 1);
      
      const updatedContent = {
        ...pageContent,
        sections: updatedSections,
      };

      setPageContent(updatedContent);

      try {
        setSaving(true);
        await apiService.pageContent.update(updatedContent);
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "Section deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete section", error);
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Error",
          message: "Failed to delete section. Please try again.",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await apiService.pageContent.uploadImage(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  const columns = [
    { key: "sectionKey", label: "Section Key" },
    { 
      key: "head", 
      label: "Heading",
      render: (val: string) => (
        <div className="max-w-[250px] truncate opacity-80" title={stripRichText(val)}>
          {stripRichText(val)}
        </div>
      )
    },
    { 
      key: "subHead", 
      label: "Sub-heading",
      render: (val: string) => (
        <div className="max-w-[200px] truncate opacity-60" title={stripRichText(val)}>
          {stripRichText(val)}
        </div>
      )
    },
    { 
      key: "caption", 
      label: "Caption" 
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, section: PageSection) => {
        const index = pageContent?.sections.indexOf(section) ?? -1;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal(section, index)}
              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
            >
              <Layout size={18} />
            </button>
            <button
              onClick={() => handleDeleteSection(index)}
              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400">
            Manage textual content and SEO across all pages
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map((page) => (
          <button
            key={page.id}
            onClick={() => setActiveTab(page.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === page.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <page.icon size={18} />
            {page.title}
          </button>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Layers className="text-blue-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {PAGES.find((p) => p.id === activeTab)?.title} Sections
              </h2>
              <p className="text-sm text-gray-400">
                Configure headings and descriptions for this page
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Section
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p>Loading page content...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={pageContent?.sections || []} />
          )}
        </div>
      </div>

      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? "Edit Section" : "Add New Section"}
      >
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Section Key (internal ID)
              </label>
              <input
                type="text"
                value={formData.sectionKey}
                onChange={(e) =>
                  setFormData({ ...formData, sectionKey: e.target.value })
                }
                placeholder="e.g. hero, services, pricing"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Caption / Badge
              </label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                placeholder="Micro-copy above heading"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <RichTextEditor
              label="Heading (Large text)"
              value={formData.head || ""}
              onChange={(value) => setFormData({ ...formData, head: value })}
              placeholder="Enter heading text..."
            />
          </div>

          <div className="space-y-2">
            <RichTextEditor
              label="Sub-heading / Secondary text"
              value={formData.subHead || ""}
              onChange={(value) => setFormData({ ...formData, subHead: value })}
              placeholder="Enter sub-heading text..."
            />
          </div>

          <div className="space-y-2">
            <RichTextEditor
              label="Description / Paragraph"
              value={formData.description || ""}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter description text..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Button Text
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Button Link / Path
              </label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) =>
                  setFormData({ ...formData, buttonLink: e.target.value })
                }
                placeholder="/contact"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <ImageUploadField
              label="Section Image"
              value={formData.image || ""}
              onFileChange={handleImageUpload}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSection}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
              Save Changes Now
            </button>
          </div>
        </div>
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
