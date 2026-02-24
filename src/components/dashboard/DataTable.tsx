import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight } from
'lucide-react';
interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}
interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  searchable?: boolean;
}
export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  searchable = true
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredData = searchable ?
  data.filter((item) =>
  Object.values(item).some((value) =>
  String(value).toLowerCase().includes(searchTerm.toLowerCase())
  )
  ) :
  data;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  return (
    <div className="space-y-4">
      {searchable &&
      <div className="relative">
          <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20} />

          <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors" />

        </div>
      }

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {columns.map((column) =>
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">

                    {column.label}
                  </th>
                )}
                {(onEdit || onDelete || onView) &&
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                }
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <AnimatePresence mode="popLayout">
                {paginatedData.map((item, index) =>
                <motion.tr
                  key={item.id || index}
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  exit={{
                    opacity: 0
                  }}
                  className="hover:bg-white/5 transition-colors">

                    {columns.map((column) =>
                  <td
                    key={column.key}
                    className="px-6 py-4 text-sm text-gray-300">

                        {column.render ?
                    column.render(item[column.key], item) :
                    item[column.key]}
                      </td>
                  )}
                    {(onEdit || onDelete || onView) &&
                  <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onView &&
                      <button
                        onClick={() => onView(item)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">

                              <Eye size={16} />
                            </button>
                      }
                          {onEdit &&
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">

                              <Edit size={16} />
                            </button>
                      }
                          {onDelete &&
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors">

                              <Trash2 size={16} />
                            </button>
                      }
                        </div>
                      </td>
                  }
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {totalPages > 1 &&
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
              {filteredData.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
              onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        }
      </div>
    </div>);

}