import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Download } from "lucide-react";

const PdfAutoScrollViewer = ({ url }: { url: string }) => {
  const [pages, setPages] = useState<number[]>([1]);
  const [hasMore, setHasMore] = useState(true);

  const getPageUrl = (page: number) => {
    return url
      .replace('/upload/fl_attachment/', '/upload/')
      .replace('/upload/', `/upload/pg_${page}/`)
      .replace(/\.pdf$/i, '.jpg');
  };

  return (
    <div className="absolute inset-0 overflow-y-auto custom-scrollbar flex flex-col items-center bg-black/40 p-4 gap-4 md:p-8 md:gap-8">
      {pages.map((pageNum) => (
        <img
          key={pageNum}
          src={getPageUrl(pageNum)}
          alt={`Page ${pageNum}`}
          className="max-w-full h-auto object-contain bg-white shadow-2xl p-2 rounded-lg"
          style={{ width: 'auto', maxHeight: '1200px' }}
          onLoad={() => {
            if (hasMore && pageNum === pages.length && pageNum < 50) {
              setPages((prev) => [...prev, pageNum + 1]);
            }
          }}
          onError={(e) => {
            setHasMore(false);
            e.currentTarget.style.display = 'none';
          }}
        />
      ))}
      {!hasMore && pages.length > 1 && (
        <div className="text-gray-500 text-sm font-medium py-8 pb-12">
          End of document
        </div>
      )}
    </div>
  );
};

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string | null;
  fileFormat: string | null;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileFormat,
}: FilePreviewModalProps) {
  if (!isOpen || !fileUrl) return null;

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
    fileFormat?.toLowerCase() || "",
  );

  const isPdf = fileFormat?.toLowerCase() === "pdf";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-[90vh] max-w-6xl bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 z-10 shrink-0">
            <h3 className="text-white font-bold truncate pr-4">
              {fileName || "File Preview"}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Open original file"
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={onClose}
                className="p-2.5 rounded-lg hover:bg-red-500/20 text-gray-300 hover:text-red-500 transition-colors bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black/40">
            {isImage && !isPdf ? (
              <img
                src={fileUrl}
                alt={fileName || "Preview"}
                className="max-w-full max-h-full object-contain p-4 bg-white/5"
              />
            ) : isPdf ? (
              <PdfAutoScrollViewer url={fileUrl} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 font-bold uppercase text-xl">
                  {fileFormat || "?"}
                </div>
                <div>
                  <p className="text-gray-300 font-medium mb-1">
                    No preview available for this file type
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    You can still download or open the file using the button
                    above.
                  </p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2.5 bg-[color:var(--bright-red)] text-white font-bold rounded-xl hover:bg-red-700 transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Download size={16} /> Download File
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
