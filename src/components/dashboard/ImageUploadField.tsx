import React, { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File) => void;
  label: string;
}

export function ImageUploadField({
  value,
  onChange,
  onFileChange,
  label,
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl);

    // Pass raw file if handler exists
    if (onFileChange) {
      onFileChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <label className="text-sm text-gray-400 font-medium">{label}</label>

      {/* Preview Section */}
      {value && (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 text-white hover:bg-red-500 transition-colors z-10"
            title="Clear Image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload/Input Section */}
      <div
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-[color:var(--bright-red)] bg-[color:var(--bright-red)]/5"
            : "border-white/10 hover:border-white/20 bg-white/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center gap-2 mb-4">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-400">
            {value ? "Change Image: " : ""}Drag & drop or{" "}
            <span className="text-[color:var(--bright-red)] font-semibold">
              click to upload
            </span>
          </p>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="relative">
          <input
            type="text"
            value={value.startsWith("blob:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
