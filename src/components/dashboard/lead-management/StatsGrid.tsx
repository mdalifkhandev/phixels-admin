import { Users, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { ManagementStatsCard } from "../ManagementStatsCard";

interface StatsGridProps {
  totalLeads: number;
  inProgressLeads: number;
  workingLeads: number;
  completedLeads: number;
}

export function StatsGrid({
  totalLeads,
  inProgressLeads,
  workingLeads,
  completedLeads,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ManagementStatsCard
        title="Total Leads"
        value={totalLeads}
        icon={Users}
        color="from-blue-500 to-cyan-500"
      />

      <ManagementStatsCard
        title="In-Progress"
        value={inProgressLeads}
        icon={Clock}
        color="from-indigo-500 to-purple-500"
      />

      <ManagementStatsCard
        title="Working"
        value={workingLeads}
        icon={TrendingUp}
        color="from-orange-500 to-amber-500"
      />

      <ManagementStatsCard
        title="Completed"
        value={completedLeads}
        icon={CheckCircle}
        color="from-green-500 to-emerald-500"
      />
    </div>
  );
}
