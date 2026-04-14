import React from "react";
import { Eye } from "lucide-react";
import { DataTable } from "../DataTable";

interface JobsTableProps {
  data: any[];
  onView: (job: any) => void;
}

export function JobsTable({ data, onView }: JobsTableProps) {
  const columns = [
    {
      key: "name",
      label: "Applicant",
      render: (value: string, row: any) => (
        <div onClick={() => onView(row)} className="cursor-pointer group">
          <div className="font-bold text-white group-hover:text-pink-500 transition-colors">{value}</div>
          <div className="text-xs text-gray-400">{row.jobTitle}</div>
        </div>
      ),
    },
    {
      key: "portfolio",
      label: "Portfolio",
      render: (_value: string) => (
        <a
          href={_value}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-400 hover:underline truncate max-w-[150px] block"
        >
          {_value}
        </a>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => {
        let colorClass = "bg-gray-500/20 text-gray-400";
        if (value === "New") colorClass = "bg-blue-500/20 text-blue-500";
        if (value === "Shortlisted") colorClass = "bg-green-500/20 text-green-500";
        if (value === "Rejected") colorClass = "bg-red-500/20 text-red-500";
        return (
          <span
            onClick={() => onView(row)}
            className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold ${colorClass}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "id",
      label: "Action",
      render: (_value: string, row: any) => (
        <button
          onClick={() => onView(row)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchable={false}
    />
  );
}
