import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  FileText,
  ShieldCheck,
  Scale,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiService } from "../../services/api";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalContent {
  privacyPolicy: LegalSection[];
  termsConditions: LegalSection[];
}

export function LegalManagement() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");
  const [content, setContent] = useState<LegalContent>({
    privacyPolicy: [],
    termsConditions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLegalContent();
      if (response.success) {
        setContent(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch legal content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatus(null);
      const response = await apiService.updateLegalContent(content);
      if (response.success) {
        setStatus({
          type: "success",
          message: "Legal content updated successfully!",
        });
      } else {
        setStatus({
          type: "error",
          message: response.message || "Failed to update content",
        });
      }
    } catch (error) {
      setStatus({ type: "error", message: "An error occurred while saving." });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const addSection = () => {
    const newSection = { title: "", content: "" };
    if (activeTab === "privacy") {
      setContent({
        ...content,
        privacyPolicy: [...content.privacyPolicy, newSection],
      });
    } else {
      setContent({
        ...content,
        termsConditions: [...content.termsConditions, newSection],
      });
    }
  };

  const removeSection = (index: number) => {
    if (activeTab === "privacy") {
      const newSections = [...content.privacyPolicy];
      newSections.splice(index, 1);
      setContent({ ...content, privacyPolicy: newSections });
    } else {
      const newSections = [...content.termsConditions];
      newSections.splice(index, 1);
      setContent({ ...content, termsConditions: newSections });
    }
  };

  const updateSection = (
    index: number,
    field: keyof LegalSection,
    value: string,
  ) => {
    if (activeTab === "privacy") {
      const newSections = [...content.privacyPolicy];
      newSections[index] = { ...newSections[index], [field]: value };
      setContent({ ...content, privacyPolicy: newSections });
    } else {
      const newSections = [...content.termsConditions];
      newSections[index] = { ...newSections[index], [field]: value };
      setContent({ ...content, termsConditions: newSections });
    }
  };

  const handleReorder = (newSections: LegalSection[]) => {
    if (activeTab === "privacy") {
      setContent({ ...content, privacyPolicy: newSections });
    } else {
      setContent({ ...content, termsConditions: newSections });
    }
  };

  const activeSections =
    activeTab === "privacy" ? content.privacyPolicy : content.termsConditions;

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--bright-red)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FileText className="text-[color:var(--bright-red)]" />
            Legal Pages Management
          </h1>
          <p className="text-gray-400 mt-1">
            Manage Privacy Policy and Terms & Conditions section by section.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[color:var(--bright-red)] text-white rounded-lg hover:bg-red-600 transition-all font-bold disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            activeTab === "privacy"
              ? "bg-[color:var(--bright-red)] text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <ShieldCheck size={18} />
          <span className="font-bold">Privacy Policy</span>
        </button>
        <button
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            activeTab === "terms"
              ? "bg-[color:var(--bright-red)] text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Scale size={18} />
          <span className="font-bold">Terms & Conditions</span>
        </button>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            status.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{status.message}</span>
        </motion.div>
      )}

      {/* Content Section */}
      <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 text-capitalize">
            {activeTab === "privacy" ? "Privacy Policy" : "Terms & Conditions"}{" "}
            Sections
          </h2>
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all text-sm font-bold"
          >
            <Plus size={16} className="text-[color:var(--bright-red)]" />
            Add New Section
          </button>
        </div>

        <div className="p-6">
          {activeSections.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">
                No sections added yet.
              </p>
              <button
                onClick={addSection}
                className="mt-4 text-[color:var(--bright-red)] hover:underline font-bold"
              >
                Create your first section
              </button>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={activeSections}
              onReorder={handleReorder}
              className="space-y-4"
            >
              {activeSections.map((section, index) => (
                <Reorder.Item
                  key={index}
                  value={section}
                  className="bg-white/5 rounded-xl border border-white/10 p-5 group hover:border-white/20 transition-all"
                >
                  <div className="flex gap-4">
                    <div className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400">
                      <GripVertical size={20} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4 items-center">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            updateSection(index, "title", e.target.value)
                          }
                          placeholder="Section Title (e.g., 1. Introduction)"
                          className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-[color:var(--bright-red)] transition-all font-bold"
                        />
                        <button
                          onClick={() => removeSection(index)}
                          className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Remove Section"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <textarea
                        value={section.content}
                        onChange={(e) =>
                          updateSection(index, "content", e.target.value)
                        }
                        placeholder="Section Content (supports multiple paragraphs)..."
                        rows={5}
                        className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[color:var(--bright-red)] transition-all resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}
