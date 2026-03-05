import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FolderTree, Wrench } from "lucide-react";
import { ContentModal } from "../../components/dashboard/ContentModal";
import { ImageUploadField } from "../../components/dashboard/ImageUploadField";
import { ManagementStatsCard } from "../../components/dashboard/ManagementStatsCard";
import { StatusModal } from "../../components/dashboard/StatusModal";
import { servicesApi } from "../../services/api";
import type { ServiceCategory, ServiceSubcategory } from "../../types/types";

interface ServiceCategoryDisplay extends ServiceCategory {
  id: string;
}

interface ServiceSubcategoryDisplay extends ServiceSubcategory {
  id: string;
}

const iconOptions = [
  "code",
  "smartphone",
  "globe",
  "cpu",
  "palette",
  "bar-chart",
  "shield",
  "cloud",
  "zap",
  "blocks",
  "building2",
  "brain",
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getCategoryIdFromSubcategory = (
  subcategory: ServiceSubcategoryDisplay,
) => {
  if (typeof subcategory.categoryId === "string") {
    return subcategory.categoryId;
  }
  return subcategory.categoryId?._id || "";
};

export function ServicesManagement() {
  const [categories, setCategories] = useState<ServiceCategoryDisplay[]>([]);
  const [subcategories, setSubcategories] = useState<
    ServiceSubcategoryDisplay[]
  >([]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<ServiceCategoryDisplay | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<ServiceSubcategoryDisplay | null>(null);

  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    iconKey: "code",
    heroImage: "",
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);

  const [subcategoryForm, setSubcategoryForm] = useState({
    categoryId: "",
    name: "",
    slug: "",
    shortDescription: "",
  });

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
    action?: () => void;
    secondaryActionLabel?: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(
    null,
  );
  const [draggingSubcategoryId, setDraggingSubcategoryId] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const subcategoriesByCategory = useMemo(() => {
    const grouped: Record<string, ServiceSubcategoryDisplay[]> = {};
    subcategories.forEach((subcategory) => {
      const categoryId = getCategoryIdFromSubcategory(subcategory);
      if (!grouped[categoryId]) grouped[categoryId] = [];
      grouped[categoryId].push(subcategory);
    });
    return grouped;
  }, [subcategories]);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => {
      const categoryMatched =
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query);

      if (categoryMatched) return true;

      const categorySubcategories = subcategoriesByCategory[category.id] || [];
      return categorySubcategories.some((subcategory) => {
        return (
          subcategory.name.toLowerCase().includes(query) ||
          subcategory.slug.toLowerCase().includes(query) ||
          subcategory.shortDescription.toLowerCase().includes(query)
        );
      });
    });
  }, [categories, searchTerm, subcategoriesByCategory]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [categoryData, subcategoryData] = await Promise.all([
        servicesApi.getCategories(),
        servicesApi.getSubcategories(),
      ]);

      setCategories(
        categoryData.map((category) => ({
          ...category,
          id: category._id || "",
        })),
      );

      setSubcategories(
        subcategoryData.map((subcategory) => ({
          ...subcategory,
          id: subcategory._id || "",
        })),
      );
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: err.message || "Failed to load service management data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const finalSlug = categoryForm.slug || slugify(categoryForm.name);
      if (
        !categoryForm.name ||
        !categoryForm.description ||
        !finalSlug ||
        !categoryForm.iconKey
      ) {
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Validation Error",
          message: "Please fill all category required fields.",
        });
        return;
      }

      let heroImage = categoryForm.heroImage;
      if (categoryImageFile) {
        heroImage = await servicesApi.uploadCategoryImage(categoryImageFile);
      }

      const payload = {
        name: categoryForm.name,
        slug: finalSlug,
        description: categoryForm.description,
        iconKey: categoryForm.iconKey,
        heroImage,
      };

      if (editingCategory) {
        await servicesApi.updateCategory(editingCategory.id, payload);
      } else {
        const created = await servicesApi.createCategory(payload);
        const newId = created._id || "";
        if (newId)
          setExpandedCategoryIds((prev) =>
            Array.from(new Set([...prev, newId])),
          );
      }

      await fetchAllData();
      handleCloseCategoryModal();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: editingCategory ? "Category Updated" : "Category Created",
        message: `"${payload.name}" has been successfully ${
          editingCategory ? "updated" : "created"
        }.`,
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Category Save Failed",
        message: err.message || "Failed to save category.",
      });
    }
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
      iconKey: "code",
      heroImage: "",
    });
    setCategoryImageFile(null);
  };

  const handleEditCategory = (category: ServiceCategoryDisplay) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconKey: category.iconKey,
      heroImage: category.heroImage || "",
    });
    setCategoryImageFile(null);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: ServiceCategoryDisplay) => {
    setStatusModal({
      isOpen: true,
      type: "error",
      title: "Delete Category",
      message: `Delete "${category.name}" category?`,
      action: async () => {
        try {
          await servicesApi.deleteCategory(category.id);
          await fetchAllData();
          setStatusModal({
            isOpen: true,
            type: "success",
            title: "Category Deleted",
            message: `"${category.name}" deleted successfully.`,
          });
        } catch (err: any) {
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Delete Failed",
            message: err.message || "Failed to delete category.",
          });
        }
      },
      secondaryActionLabel: "Cancel",
    });
  };

  const handleOpenSubcategoryModal = (categoryId?: string) => {
    setEditingSubcategory(null);
    setSubcategoryForm({
      categoryId: categoryId || "",
      name: "",
      slug: "",
      shortDescription: "",
    });
    setIsSubcategoryModalOpen(true);
  };

  const handleEditSubcategory = (subcategory: ServiceSubcategoryDisplay) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      categoryId: getCategoryIdFromSubcategory(subcategory),
      name: subcategory.name,
      slug: subcategory.slug,
      shortDescription: subcategory.shortDescription,
    });
    setIsSubcategoryModalOpen(true);
  };

  const handleCloseSubcategoryModal = () => {
    setEditingSubcategory(null);
    setSubcategoryForm({
      categoryId: "",
      name: "",
      slug: "",
      shortDescription: "",
    });
    setIsSubcategoryModalOpen(false);
  };

  const handleSaveSubcategory = async () => {
    try {
      const finalSlug = subcategoryForm.slug || slugify(subcategoryForm.name);
      if (
        !subcategoryForm.categoryId ||
        !subcategoryForm.name ||
        !subcategoryForm.shortDescription ||
        !finalSlug
      ) {
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Validation Error",
          message:
            "Main category, subcategory name, slug and short description are required.",
        });
        return;
      }

      const payload = {
        categoryId: subcategoryForm.categoryId,
        name: subcategoryForm.name,
        slug: finalSlug,
        shortDescription: subcategoryForm.shortDescription,
      };

      if (editingSubcategory) {
        await servicesApi.updateSubcategory(editingSubcategory.id, payload);
      } else {
        await servicesApi.createSubcategory(payload);
      }

      await fetchAllData();
      setExpandedCategoryIds((prev) =>
        Array.from(new Set([...prev, subcategoryForm.categoryId])),
      );
      handleCloseSubcategoryModal();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: editingSubcategory
          ? "Subcategory Updated"
          : "Subcategory Created",
        message: `"${payload.name}" has been successfully ${
          editingSubcategory ? "updated" : "created"
        }.`,
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Subcategory Save Failed",
        message: err.message || "Failed to save subcategory.",
      });
    }
  };

  const handleDeleteSubcategory = (subcategory: ServiceSubcategoryDisplay) => {
    setStatusModal({
      isOpen: true,
      type: "error",
      title: "Delete Subcategory",
      message: `Delete "${subcategory.name}" subcategory?`,
      action: async () => {
        try {
          await servicesApi.deleteSubcategory(subcategory.id);
          await fetchAllData();
          setStatusModal({
            isOpen: true,
            type: "success",
            title: "Subcategory Deleted",
            message: `"${subcategory.name}" deleted successfully.`,
          });
        } catch (err: any) {
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Delete Failed",
            message: err.message || "Failed to delete subcategory.",
          });
        }
      },
      secondaryActionLabel: "Cancel",
    });
  };

  const handleToggleCategory = async (category: ServiceCategoryDisplay) => {
    try {
      const newStatus = category.isActive === false ? true : false;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, isActive: newStatus } : c,
        ),
      );
      await servicesApi.updateCategory(category.id, { isActive: newStatus });
    } catch (err: any) {
      await fetchAllData();
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Toggle Failed",
        message: err.message || "Failed to update category status.",
      });
    }
  };

  const handleToggleSubcategory = async (
    subcategory: ServiceSubcategoryDisplay,
  ) => {
    try {
      const newStatus = subcategory.isActive === false ? true : false;
      setSubcategories((prev) =>
        prev.map((s) =>
          s.id === subcategory.id ? { ...s, isActive: newStatus } : s,
        ),
      );
      await servicesApi.updateSubcategory(subcategory.id, {
        isActive: newStatus,
      });
    } catch (err: any) {
      await fetchAllData();
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Toggle Failed",
        message: err.message || "Failed to update subcategory status.",
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const moveItem = <T,>(arr: T[], from: number, to: number) => {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  const handleCategoryDrop = async (targetCategoryId: string) => {
    if (
      !draggingCategoryId ||
      draggingCategoryId === targetCategoryId ||
      searchTerm.trim()
    )
      return;
    const fromIndex = categories.findIndex(
      (category) => category.id === draggingCategoryId,
    );
    const toIndex = categories.findIndex(
      (category) => category.id === targetCategoryId,
    );
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = moveItem(categories, fromIndex, toIndex);
    setCategories(reordered);
    setDraggingCategoryId(null);

    try {
      await servicesApi.reorderCategories(reordered.map((item) => item.id));
    } catch (err: any) {
      await fetchAllData();
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Reorder Failed",
        message: err.message || "Failed to reorder categories.",
      });
    }
  };

  const handleSubcategoryDrop = async (
    categoryId: string,
    targetSubcategoryId: string,
  ) => {
    if (
      !draggingSubcategoryId ||
      draggingSubcategoryId === targetSubcategoryId ||
      searchTerm.trim()
    ) {
      return;
    }

    const categorySubs = subcategories.filter(
      (subcategory) => getCategoryIdFromSubcategory(subcategory) === categoryId,
    );
    const fromIndex = categorySubs.findIndex(
      (subcategory) => subcategory.id === draggingSubcategoryId,
    );
    const toIndex = categorySubs.findIndex(
      (subcategory) => subcategory.id === targetSubcategoryId,
    );
    if (fromIndex === -1 || toIndex === -1) return;

    const reorderedCategorySubs = moveItem(categorySubs, fromIndex, toIndex);
    const reorderedIds = reorderedCategorySubs.map(
      (subcategory) => subcategory.id,
    );
    const idToOrder = new Map(reorderedIds.map((id, index) => [id, index]));

    setSubcategories((prev) => {
      const categoryOnly = prev.filter(
        (subcategory) =>
          getCategoryIdFromSubcategory(subcategory) === categoryId,
      );
      const reorderedCategoryOnly = [...categoryOnly]
        .map((subcategory) => ({
          ...subcategory,
          sortOrder: idToOrder.get(subcategory.id) ?? subcategory.sortOrder,
        }))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      let pointer = 0;
      return prev.map((subcategory) => {
        if (getCategoryIdFromSubcategory(subcategory) !== categoryId) {
          return subcategory;
        }
        const nextSubcategory = reorderedCategoryOnly[pointer];
        pointer += 1;
        return nextSubcategory;
      });
    });
    setDraggingSubcategoryId(null);

    try {
      await servicesApi.reorderSubcategories(categoryId, reorderedIds);
    } catch (err: any) {
      await fetchAllData();
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Reorder Failed",
        message: err.message || "Failed to reorder subcategories.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading service categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Services Management
          </h1>
          <p className="text-gray-400">
            Manage your service categories and subcategories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
        >
          <FolderTree size={20} />
          Add Service Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ManagementStatsCard
          title="Total Categories"
          value={categories.length}
          icon={FolderTree}
          color="from-blue-500 to-cyan-500"
        />
        <ManagementStatsCard
          title="Total Subcategories"
          value={subcategories.length}
          icon={FolderTree}
          color="from-green-500 to-emerald-500"
        />
        <ManagementStatsCard
          title="Expanded Categories"
          value={expandedCategoryIds.length}
          icon={Wrench}
          color="from-purple-500 to-pink-500"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="text-white font-bold text-lg whitespace-nowrap">
              Service Categories
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="Search category or subcategory"
            />
          </div>
          <button
            onClick={() => handleOpenSubcategoryModal()}
            className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/20 transition-colors whitespace-nowrap"
          >
            Add Subcategory
          </button>
        </div>
        <div className="divide-y divide-white/10">
          {filteredCategories.length === 0 ? (
            <div className="px-6 py-5 text-sm text-gray-400">
              No matching categories found.
            </div>
          ) : (
            filteredCategories.map((category) => {
              const categorySubs = subcategoriesByCategory[category.id] || [];
              const query = searchTerm.trim().toLowerCase();
              const visibleSubcategories = !query
                ? categorySubs
                : categorySubs.filter(
                    (subcategory) =>
                      subcategory.name.toLowerCase().includes(query) ||
                      subcategory.slug.toLowerCase().includes(query) ||
                      subcategory.shortDescription
                        .toLowerCase()
                        .includes(query),
                  );
              const isExpanded = query
                ? true
                : expandedCategoryIds.includes(category.id);

              return (
                <div
                  key={category.id}
                  className="px-4 py-3"
                  draggable={!searchTerm.trim()}
                  onDragStart={() => setDraggingCategoryId(category.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleCategoryDrop(category.id)}
                  onDragEnd={() => setDraggingCategoryId(null)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex-1 text-left flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="text-gray-300" size={18} />
                      ) : (
                        <ChevronRight className="text-gray-300" size={18} />
                      )}
                      <span className="text-white font-semibold">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({visibleSubcategories.length})
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCategory(category);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mr-2 ${
                          category.isActive !== false
                            ? "bg-green-500"
                            : "bg-gray-600"
                        }`}
                        title={
                          category.isActive !== false ? "Published" : "Draft"
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            category.isActive !== false
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleOpenSubcategoryModal(category.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20"
                      >
                        Add Subcategory
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-xs text-red-300 hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ml-7 mt-2 rounded-xl border border-white/10 bg-white/[0.02]">
                      {visibleSubcategories.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          No subcategories under this category.
                        </div>
                      ) : (
                        visibleSubcategories.map((subcategory) => (
                          <div
                            key={subcategory.id}
                            className="px-4 py-3 border-b border-white/5 last:border-b-0 flex items-center justify-between gap-4"
                            draggable={!searchTerm.trim()}
                            onDragStart={() =>
                              setDraggingSubcategoryId(subcategory.id)
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() =>
                              handleSubcategoryDrop(category.id, subcategory.id)
                            }
                            onDragEnd={() => setDraggingSubcategoryId(null)}
                          >
                            <div>
                              <p className="text-white font-medium">
                                {subcategory.name}
                              </p>
                              <p className="text-sm text-gray-400 line-clamp-1">
                                {subcategory.shortDescription}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSubcategory(subcategory);
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mr-2 ${
                                  subcategory.isActive !== false
                                    ? "bg-green-500"
                                    : "bg-gray-600"
                                }`}
                                title={
                                  subcategory.isActive !== false
                                    ? "Published"
                                    : "Draft"
                                }
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    subcategory.isActive !== false
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleEditSubcategory(subcategory)
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSubcategory(subcategory)
                                }
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-xs text-red-300 hover:bg-red-500/30"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <ContentModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        title={
          editingCategory ? "Edit Service Category" : "Add Service Category"
        }
        onSave={handleSaveCategory}
        saveLabel={editingCategory ? "Update" : "Create"}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Category Name *
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="Web Development"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Slug *</label>
            <input
              type="text"
              value={categoryForm.slug}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  slug: slugify(e.target.value),
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="web-development"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Description *
            </label>
            <textarea
              rows={3}
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  description: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none resize-none"
              placeholder="Category description"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Icon Key *
            </label>
            <select
              value={categoryForm.iconKey}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, iconKey: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon} className="bg-black text-white">
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <ImageUploadField
            label="Main Service Detail Image (optional)"
            value={categoryForm.heroImage}
            onChange={(url) =>
              setCategoryForm({ ...categoryForm, heroImage: url })
            }
            onFileChange={(file) => setCategoryImageFile(file)}
          />
        </div>
      </ContentModal>

      <ContentModal
        isOpen={isSubcategoryModalOpen}
        onClose={handleCloseSubcategoryModal}
        title={
          editingSubcategory
            ? "Edit Service Subcategory"
            : "Add Service Subcategory"
        }
        onSave={handleSaveSubcategory}
        saveLabel={editingSubcategory ? "Update" : "Create"}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Main Category *
            </label>
            <select
              value={subcategoryForm.categoryId}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  categoryId: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
            >
              <option value="" className="bg-black text-white">
                Select main category
              </option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="bg-black text-white"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Subcategory Name *
            </label>
            <input
              type="text"
              value={subcategoryForm.name}
              onChange={(e) =>
                setSubcategoryForm({ ...subcategoryForm, name: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="Frontend Development"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Slug *</label>
            <input
              type="text"
              value={subcategoryForm.slug}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  slug: slugify(e.target.value),
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
              placeholder="frontend-development"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Short Description *
            </label>
            <textarea
              rows={3}
              value={subcategoryForm.shortDescription}
              onChange={(e) =>
                setSubcategoryForm({
                  ...subcategoryForm,
                  shortDescription: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none resize-none"
              placeholder="Short details about this subcategory"
            />
          </div>
        </div>
      </ContentModal>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionLabel={statusModal.secondaryActionLabel ? "Confirm" : undefined}
        onAction={statusModal.action}
        secondaryActionLabel={statusModal.secondaryActionLabel}
      />
    </div>
  );
}
