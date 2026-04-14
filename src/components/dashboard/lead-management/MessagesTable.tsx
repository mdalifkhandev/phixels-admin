import React from "react";
import { DataTable } from "../DataTable";

interface MessagesTableProps {
  data: any[];
  onView: (message: any) => void;
}

export function MessagesTable({ data, onView }: MessagesTableProps) {
  const columns = [
    {
      key: "name",
      label: "Sender",
      render: (value: string, row: any) => (
        <div onClick={() => onView(row)} className="cursor-pointer group">
          <div className="font-bold text-white group-hover:text-blue-500 transition-colors">{value}</div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: "message",
      label: "Message Preview",
      render: (value: string, row: any) => (
        <div onClick={() => onView(row)} className="cursor-pointer text-sm text-gray-300 truncate max-w-[300px]">
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => (
        <span
          onClick={() => onView(row)}
          className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold ${value === "Unread" ? "bg-blue-500/20 text-blue-500" : "bg-gray-500/20 text-gray-400"}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "timestamp",
      label: "Date",
      render: (value: string, row: any) => (
        <span onClick={() => onView(row)} className="cursor-pointer text-xs text-gray-500">{value}</span>
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
