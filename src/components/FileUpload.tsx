import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}
export function FileUpload({
  files,
  onFilesChange,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx']
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      let errorMsg = null;
      newFiles.forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          errorMsg = `File ${file.name} exceeds ${maxSizeMB}MB limit`;
        } else {
          validFiles.push(file);
        }
      });
      if (errorMsg) setError(errorMsg);else
      setError(null);
      onFilesChange([...files, ...validFiles]);
    }
  };
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return (
    <div className="w-full">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[color:var(--bright-red)] hover:bg-white/5 transition-all group">

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept={acceptedTypes.join(',')} />

        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Upload
            className="text-gray-400 group-hover:text-[color:var(--bright-red)]"
            size={24} />

        </div>
        <p className="text-sm text-gray-300 font-medium">
          Click to upload project files
        </p>
        <p className="text-xs text-gray-500 mt-1">Max {maxSizeMB}MB per file</p>
      </div>

      {error &&
      <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      }

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {files.map((file, index) =>
          <motion.div
            key={`${file.name}-${index}`}
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.9
            }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">

              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                  {file.type.startsWith('image/') ?
                <ImageIcon size={16} /> :

                <FileText size={16} />
                }
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile(index);
              }}
              className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors">

                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>);

}