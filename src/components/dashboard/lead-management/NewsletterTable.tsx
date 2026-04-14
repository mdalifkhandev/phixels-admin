import React from "react";
import { DataTable } from "../DataTable";

interface NewsletterTableProps {
  data: any[];
  onView: (subscriber: any) => void;
}

export function NewsletterTable({ data, onView }: NewsletterTableProps) {
  const columns = [
    {
      key: "email",
      label: "Subscriber Email",
      render: (value: string, row: any) => (
        <div onClick={() => onView(row)} className="cursor-pointer font-bold text-white hover:text-purple-500 transition-colors">
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
          className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold ${value === "Active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "timestamp",
      label: "Subscribed Date",
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
