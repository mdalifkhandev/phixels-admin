import React from "react";
import { Calendar, Eye } from "lucide-react";
import { DataTable } from "../DataTable";
import { useTeamMembers } from "../../../hooks/queries/useTeamMembers";

interface LeadsTableProps {
  data: any[];
  onView: (lead: any) => void;
  onStatusChange: (id: string, newStatus: string, dbId?: string) => void;
  onAssigneeChange: (id: string, newAssignee: string, dbId?: string) => void;
}

export function LeadsTable({
  data,
  onView,
  onStatusChange,
  onAssigneeChange,
}: LeadsTableProps) {
  const { data: teamMembers = [] } = useTeamMembers();

  const getProgressColor = (status: string) => {
    switch (status) {
      case "New": return { row: "bg-blue-500/5", select: "text-blue-500 border-blue-500/30" };
      case "Pending": return { row: "bg-yellow-500/5", select: "text-yellow-500 border-yellow-500/30" };
      case "In-Progress": return { row: "bg-indigo-500/5", select: "text-indigo-500 border-indigo-500/30" };
      case "Meeting Scheduled": return { row: "bg-purple-500/5", select: "text-purple-500 border-purple-500/30" };
      case "Confirm": return { row: "bg-cyan-500/5", select: "text-cyan-500 border-cyan-500/30" };
      case "Working": return { row: "bg-orange-500/5", select: "text-orange-500 border-orange-500/30" };
      case "Completed": return { row: "bg-green-500/5", select: "text-green-500 border-green-500/30" };
      case "Cancelled": return { row: "bg-red-500/5", select: "text-red-500 border-red-500/30" };
      default: return { row: "", select: "text-white border-white/10" };
    }
  };

  const PhaseTracker = ({ currentPhase }: { currentPhase?: string }) => {
    const phases = ["UI/UX", "Frontend", "Backend", "Deploy"];
    const currentIndex = phases.indexOf(currentPhase || "");
    return (
      <div className="flex flex-col gap-1 mt-1">
        <div className="text-[10px] text-gray-500 font-medium">
          Stage {currentIndex + 1}: <span className="text-gray-400">{currentPhase || "UI/UX"}</span>
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      label: "Client Details",
      render: (value: string, row: any) => (
        <div onClick={() => onView(row)} className="cursor-pointer group">
          <div className="font-bold text-white group-hover:text-[color:var(--bright-red)] transition-colors">{value}</div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: "timestamp",
      label: "Submitted",
      render: (value: string, row: any) => (
        <span onClick={() => onView(row)} className="cursor-pointer text-xs text-gray-400">{value}</span>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (value: string, row: any) => (
        <span onClick={() => onView(row)} className="text-gray-300 font-medium cursor-pointer">{value}</span>
      ),
    },
    {
      key: "meetingDate",
      label: "Meeting",
      render: (value: string, row: any) => (
        <div onClick={() => onView(row)} className="cursor-pointer">
          {value ? (
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <Calendar size={12} />
              {value} at {row.meetingTime}
            </div>
          ) : (
            <span className="text-xs text-gray-500 italic">Not booked</span>
          )}
        </div>
      ),
    },
    {
      key: "assignedTo",
      label: "Assignee",
      render: (value: string, row: any) => (
        <select
          value={value}
          onChange={(e) => onAssigneeChange(row.id, e.target.value, row.dbId)}
          className="bg-[#0A0A0A] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[color:var(--bright-red)]"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="Unassigned">Unassigned</option>
          {teamMembers.map((member: any) => (
            <option key={member._id} value={member.name}>{member.name}</option>
          ))}
        </select>
      ),
    },
    {
      key: "projectProgress",
      label: "Project Progress",
      render: (value: string, row: any) => {
        const colors = getProgressColor(value);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <select
                value={value}
                onChange={(e) => onStatusChange(row.id, e.target.value, row.dbId)}
                className={`bg-[#0A0A0A] border rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:border-[color:var(--bright-red)] transition-colors ${colors.select}`}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Working">Working</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={(e) => { e.stopPropagation(); onView(row); }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </div>
            {value === "Working" && <PhaseTracker currentPhase={row.workingPhase} />}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchable={false}
      rowClassName={(row) => getProgressColor(row.projectProgress).row}
    />
  );
}
