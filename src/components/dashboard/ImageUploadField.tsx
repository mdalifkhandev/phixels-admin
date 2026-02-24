import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

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
  label
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

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium">{label}</label>

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border border-white/10"
          />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange('');
            }}
            className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging
            ? 'border-[color:var(--bright-red)] bg-[color:var(--bright-red)]/5'
            : 'border-white/10 hover:border-white/20'
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

          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-2">Drag & drop or click to upload</p>
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste image URL"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}