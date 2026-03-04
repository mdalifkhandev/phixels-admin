import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { authorsApi } from "../../services/api";
import { Author } from "../../types/types";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploadField } from "./ImageUploadField";

interface AuthorDropdownProps {
  value: string; // The author _id
  authorName: string; // The author's display name
  onChange: (id: string, name: string) => void;
}

export function AuthorDropdown({
  value,
  authorName,
  onChange,
}: AuthorDropdownProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New author form state
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    role: "",
    imageFile: null as File | null,
    imagePreview: "",
  });

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await authorsApi.getAll();
      setAuthors(data);
    } catch (error) {
      console.error("Failed to fetch authors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this author?")) {
      try {
        await authorsApi.delete(id);
        setAuthors(authors.filter((a) => a._id !== id));
        // If the deleted author was selected, clear the selection
        const deletedAuthor = authors.find((a) => a._id === id);
        if (deletedAuthor && deletedAuthor._id === value) {
          onChange("", "");
        }
      } catch (error) {
        console.error("Failed to delete author", error);
        alert("Failed to delete author");
      }
    }
  };

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.name || !newAuthor.role) {
      alert("Please fill in Name and Role");
      return;
    }

    try {
      setLoading(true);
      const createdAuth = await authorsApi.create(
        {
          name: newAuthor.name,
          role: newAuthor.role,
          profileImage: newAuthor.imagePreview,
        },
        newAuthor.imageFile || undefined,
      );
      setAuthors([createdAuth, ...authors]);
      onChange(createdAuth._id, createdAuth.name);
      setIsAddingNew(false);
      setIsOpen(false);
      setNewAuthor({ name: "", role: "", imageFile: null, imagePreview: "" });
    } catch (error) {
      console.error("Failed to create author", error);
      alert("Failed to create author");
    } finally {
      setLoading(false);
    }
  };

  const selectedAuthor = authors.find((a) => a._id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedAuthor ? (
          <div className="flex items-center gap-3">
            {selectedAuthor.profileImage ? (
              <img
                src={selectedAuthor.profileImage}
                alt={selectedAuthor.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                {selectedAuthor.name.charAt(0)}
              </div>
            )}
            <span className="font-medium">{selectedAuthor.name}</span>
          </div>
        ) : (
          <span className={value ? "text-white" : "text-gray-400"}>
            {authorName || "Select Author"}
          </span>
        )}
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-[#141414] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]"
          >
            {isAddingNew ? (
              <form
                onSubmit={handleAddNew}
                className="p-4 space-y-4 overflow-y-auto"
              >
                <h4 className="text-white font-medium mb-2 border-b border-white/10 pb-2">
                  Add New Author
                </h4>

                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Name *</label>
                  <input
                    type="text"
                    value={newAuthor.name}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Role *</label>
                  <input
                    type="text"
                    value={newAuthor.role}
                    onChange={(e) =>
                      setNewAuthor({ ...newAuthor, role: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Content Writer"
                    required
                  />
                </div>

                <div className="space-y-2 scale-90 transform origin-top-left w-[111%]">
                  <ImageUploadField
                    value={newAuthor.imagePreview}
                    onChange={(url) =>
                      setNewAuthor({ ...newAuthor, imagePreview: url })
                    }
                    onFileChange={(file) =>
                      setNewAuthor({ ...newAuthor, imageFile: file })
                    }
                    label="Profile Image"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-3 py-2 rounded-lg bg-[color:var(--bright-red)] text-white hover:bg-red-600 font-medium text-sm disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 text-center text-sm text-gray-400">
                      Loading authors...
                    </div>
                  ) : authors.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">
                      No authors found
                    </div>
                  ) : (
                    authors.map((author) => (
                      <div
                        key={author._id}
                        className={`flex justify-between items-center p-3 cursor-pointer hover:bg-white/5 ${value === author._id ? "bg-white/10" : ""}`}
                        onClick={() => {
                          onChange(author._id, author.name);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {author.profileImage ? (
                            <img
                              src={author.profileImage}
                              alt={author.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                              {author.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-white text-sm font-medium">
                              {author.name}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {author.role}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, author._id)}
                          className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Author"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-white/10 bg-[#1a1a1a]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingNew(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors"
                  >
                    <Plus size={16} />
                    Add New Name
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
