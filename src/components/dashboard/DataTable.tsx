import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onReorder?: (newOrder: any[]) => void;
  rowClassName?: (row: any) => string;
}

function SortableRow({
  item,
  index,
  columns,
  onEdit,
  onDelete,
  onView,
  onReorder,
  rowClassName,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as any,
  };

  return (
    <motion.tr
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`hover:bg-white/5 transition-colors ${isDragging ? "opacity-50 bg-white/10" : ""} ${rowClassName ? rowClassName(item) : ""}`}
    >
      {onReorder && (
        <td className="px-4 py-4 w-10">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:text-white text-gray-500"
          >
            <GripVertical size={16} />
          </button>
        </td>
      )}
      {columns.map((column: any) => (
        <td key={column.key} className="px-6 py-4 text-sm text-gray-300">
          {column.render
            ? column.render(item[column.key], item)
            : item[column.key]}
        </td>
      ))}
      {(onEdit || onDelete || onView) && (
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {onView && (
              <button
                onClick={() => onView(item)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="View"
              >
                <Eye size={16} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </td>
      )}
    </motion.tr>
  );
}

export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  onReorder,
  rowClassName,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = searchable
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : data;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  // If reordering is enabled, usually we'd want to reorder all data, but if paginated, we reorder the full filtered list
  // Actually, for a pure table we might disable pagination when reordering, or just show all.
  // We'll let the user reorder the visible page or the full data if not paginated.
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = paginatedData.findIndex(
        (item, index) => (item.id || index) === active.id,
      );
      const newIndex = paginatedData.findIndex(
        (item, index) => (item.id || index) === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // We only reorder within the current page
        const newPaginatedData = arrayMove(paginatedData, oldIndex, newIndex);
        // We need to merge this back into the main data array
        const newData = [...data];
        const dataStartIndex =
          data.findIndex((d) => (d.id || "") === paginatedData[0]?.id) >= 0
            ? data.findIndex((d) => (d.id || "") === paginatedData[0]?.id)
            : startIndex;

        newData.splice(
          dataStartIndex,
          paginatedData.length,
          ...newPaginatedData,
        );
        onReorder(newData);
      }
    }
  };

  const TableHeader = () => (
    <thead className="bg-white/5 border-b border-white/10">
      <tr>
        {onReorder && <th className="px-4 w-10"></th>}
        {columns.map((column) => (
          <th
            key={column.key}
            className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
          >
            {column.label}
          </th>
        ))}
        {(onEdit || onDelete || onView) && (
          <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
            Actions
          </th>
        )}
      </tr>
    </thead>
  );

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors"
          />
        </div>
      )}

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          {onReorder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full">
                <TableHeader />
                <SortableContext
                  items={paginatedData.map((item, index) => item.id || index)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-white/10">
                    <AnimatePresence mode="popLayout">
                      {paginatedData.map((item, index) => (
                        <SortableRow
                          key={item.id || index}
                          item={item}
                          index={index}
                          columns={columns}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onView={onView}
                          onReorder={onReorder}
                          rowClassName={rowClassName}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          ) : (
            <table className="w-full">
              <TableHeader />
              <tbody className="divide-y divide-white/10">
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((item, index) => (
                    <motion.tr
                      key={item.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-white/5 transition-colors ${rowClassName ? rowClassName(item) : ""}`}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 text-sm text-gray-300"
                        >
                          {column.render
                            ? column.render(item[column.key], item)
                            : item[column.key]}
                        </td>
                      ))}
                      {(onEdit || onDelete || onView) && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onView && (
                              <button
                                onClick={() => onView(item)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
