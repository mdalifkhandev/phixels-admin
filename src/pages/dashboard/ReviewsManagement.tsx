import { useState, useEffect } from "react";
import { Plus, Star } from "lucide-react";
import { DataTable } from "../../components/dashboard/DataTable";
import { ContentModal } from "../../components/dashboard/ContentModal";
import { ManagementStatsCard } from "../../components/dashboard/ManagementStatsCard";
import { ImageUploadField } from "../../components/dashboard/ImageUploadField";
import { StatusModal } from "../../components/dashboard/StatusModal";
import { reviewsApi } from "../../services/api";
import type { Review } from "../../types/types";

interface ReviewDisplay extends Review {
  id: string;
}

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<ReviewDisplay[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDisplay | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    rating: 5,
    review: "",
    project: "",
    budget: "",
    duration: "",
    summary: "",
  });

  // Status Modal State
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
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getAll();
      const displayData = data.map((r) => ({
        ...r,
        id: r._id,
      }));
      setReviews(displayData);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      // Fallback for demo purposes if API fails (since it might not truly exist on backend yet)
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message:
          err.message ||
          "Failed to load reviews. Backend might be missing this endpoint.",
      });
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: ReviewDisplay) => {
    setEditingReview(review);
    setSelectedImageFile(null);
    setFormData({
      name: review.name,
      role: review.role,
      image: review.image,
      rating: review.rating,
      review: review.review,
      project: review.project,
      budget: review.budget,
      duration: review.duration,
      summary: review.summary,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (review: ReviewDisplay) => {
    setStatusModal({
      isOpen: true,
      type: "error",
      title: "Delete Review",
      message: `Are you sure you want to delete the review from "${review.name}"?`,
      action: async () => {
        try {
          await reviewsApi.delete(review.id);
          setReviews(reviews.filter((r) => r.id !== review.id));
          setStatusModal({
            isOpen: true,
            type: "success",
            title: "Review Deleted",
            message: "The review has been successfully deleted.",
          });
        } catch (err: any) {
          console.error("Error deleting review:", err);
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Delete Failed",
            message: err.message || "Failed to delete review",
          });
        }
      },
      secondaryActionLabel: "Cancel",
    });
  };

  const handleReorder = async (newOrder: ReviewDisplay[]) => {
    try {
      // Optimistically update UI
      setReviews(newOrder);

      const orderedIds = newOrder.map((review) => review.id);
      await reviewsApi.reorder(orderedIds);

      // Fetch fresh data from backend
      await fetchReviews();
    } catch (err: any) {
      console.error("Error reordering reviews:", err);
      // Revert to original order if failed
      await fetchReviews();
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Reorder Failed",
        message:
          err.message ||
          "Failed to gracefully reorder reviews. Please try again.",
      });
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };

      if (editingReview) {
        await reviewsApi.update(
          editingReview.id,
          payload,
          selectedImageFile || undefined,
        );
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Review Updated",
          message: "The review has been successfully updated.",
        });
      } else {
        await reviewsApi.create(payload, selectedImageFile || undefined);
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Review Created",
          message: "The new review has been successfully created.",
        });
      }
      fetchReviews();
      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving review:", err);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to save review",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setSelectedImageFile(null);
    setFormData({
      name: "",
      role: "",
      image: "",
      rating: 5,
      review: "",
      project: "",
      budget: "",
      duration: "",
      summary: "",
    });
  };

  const columns = [
    {
      key: "name",
      label: "Reviewer",
      render: (value: string, row: ReviewDisplay) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={value}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <div className="font-bold text-white">{value}</div>
            <div className="text-xs text-gray-400">{row.role}</div>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value: number) => (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
              }
            />
          ))}
        </div>
      ),
    },
    {
      key: "project",
      label: "Project",
      render: (value: string) => (
        <span className="text-sm text-gray-300">{value}</span>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (value: string) => (
        <span className="font-bold text-[color:var(--vibrant-green)]">
          {value}
        </span>
      ),
    },
  ];

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading reviews...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Reviews Management
            </h1>
            <p className="text-gray-400">
              Manage client testimonials and reviews
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20_rgba(237,31,36,0.6)] transition-all"
          >
            <Plus size={20} />
            Add Review
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ManagementStatsCard
            title="Total Reviews"
            value={reviews.length}
            icon={Star}
            color="from-yellow-500 to-orange-500"
          />

          <ManagementStatsCard
            title="Average Rating"
            value={averageRating}
            icon={Star}
            color="from-green-500 to-emerald-500"
          />

          <ManagementStatsCard
            title="5-Star Reviews"
            value={reviews.filter((r) => r.rating === 5).length}
            icon={Star}
            color="from-purple-500 to-pink-500"
          />
        </div>

        <DataTable
          columns={columns}
          data={reviews}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReorder={handleReorder}
          searchable
        />
      </div>

      <ContentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingReview ? "Edit Review" : "Add New Review"}
        onSave={handleSave}
        saveLabel={editingReview ? "Update" : "Create"}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Sarah Mitchell"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Role/Company *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="CEO, TechVenture Inc"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      rating: star,
                    })
                  }
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Star
                    size={24}
                    className={
                      star <= formData.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-600"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Review Text *
            </label>
            <textarea
              value={formData.review}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  review: e.target.value,
                })
              }
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none resize-none"
              placeholder="Write the client's review..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    project: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="E-commerce Platform"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Budget *
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="$35,000"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Duration *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="3 months"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">
              Project Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  summary: e.target.value,
                })
              }
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none resize-none"
              placeholder="Brief technical summary of the project..."
              required
            />
          </div>

          <ImageUploadField
            value={formData.image}
            onChange={(url) => {
              if (!url) {
                setSelectedImageFile(null);
              }
              setFormData({
                ...formData,
                image: url,
              });
            }}
            onFileChange={async (file) => {
              try {
                setUploadingImage(true);
                setSelectedImageFile(file);
                const imageUrl = await reviewsApi.uploadImage(file);
                setSelectedImageFile(null);
                setFormData((prev) => ({
                  ...prev,
                  image: imageUrl,
                }));
              } catch (err: any) {
                console.error("Error uploading review image:", err);
                setStatusModal({
                  isOpen: true,
                  type: "error",
                  title: "Upload Failed",
                  message: err.message || "Image upload failed",
                });
              } finally {
                setUploadingImage(false);
              }
            }}
            label="Client Photo *"
          />
          {uploadingImage && (
            <p className="text-sm text-gray-400">Uploading image...</p>
          )}
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
    </>
  );
}
