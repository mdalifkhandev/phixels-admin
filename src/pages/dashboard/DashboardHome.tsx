import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Briefcase,
  FileText,
  BookOpen,
  Users,
  Eye,
  Calendar,
  ChevronDown
} from
  'lucide-react';
import { CompactMetricCard } from '../../components/dashboard/CompactMetricCard';
import { Link } from 'react-router-dom';
export function DashboardHome() {
  const [timeRange, setTimeRange] = useState('1 Month');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeOptions = [
    '1 Hour',
    '1 Day',
    '3 Days',
    '1 Week',
    '1 Month',
    '3 Months',
    '6 Months',
    '1 Year'];

  const stats = [
    {
      title: 'Total Products',
      value: '12',
      change: '+2',
      icon: Package,
      color: 'text-blue-400'
    },
    {
      title: 'Portfolio Items',
      value: '15',
      change: '+3',
      icon: Briefcase,
      color: 'text-[color:var(--vibrant-green)]'
    },
    {
      title: 'Case Studies',
      value: '10',
      change: '+1',
      icon: FileText,
      color: 'text-purple-400'
    },
    {
      title: 'Blog Posts',
      value: '15',
      change: '+5',
      icon: BookOpen,
      color: 'text-[color:var(--neon-yellow)]'
    },
    {
      title: 'Active Jobs',
      value: '4',
      change: '0',
      icon: Users,
      color: 'text-[color:var(--bright-red)]'
    },
    {
      title: 'Page Views',
      value: '12.5K',
      change: '+15%',
      icon: Eye,
      color: 'text-[color:var(--deep-navy)]'
    }];

  const recentActivity = [
    {
      action: 'New product added',
      item: 'DevMark Pro',
      time: '2 hours ago'
    },
    {
      action: 'Blog post published',
      item: 'AI in Mobile Development',
      time: '5 hours ago'
    },
    {
      action: 'Case study updated',
      item: 'Global Logistics Co',
      time: '1 day ago'
    },
    {
      action: 'New job posted',
      item: 'Senior React Developer',
      time: '2 days ago'
    }];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm">
            Welcome back! Here's what's happening with your website.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="relative z-20">
          <button
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white hover:border-[color:var(--bright-red)] transition-colors min-w-[140px] justify-between">

            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span>{timeRange}</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />

          </button>

          {isTimeDropdownOpen &&
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsTimeDropdownOpen(false)} />

              <div className="absolute right-0 top-full mt-2 w-40 bg-[#0A0A0A] border border-white/10 rounded-lg shadow-xl z-30 overflow-hidden py-1">
                {timeOptions.map((option) =>
                  <button
                    key={option}
                    onClick={() => {
                      setTimeRange(option);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${timeRange === option ? 'text-[color:var(--bright-red)] font-bold' : 'text-gray-300'}`}>

                    {option}
                  </button>
                )}
              </div>
            </>
          }
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) =>
          <CompactMetricCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            delay={index * 0.05}
            trend={
              stat.change.startsWith('+') ?
                'up' :
                stat.change === '0' ?
                  'neutral' :
                  'down'
            } />

        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">

          <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Add Product',
                path: '/dashboard/products',
                icon: Package
              },
              {
                label: 'Write Blog',
                path: '/dashboard/blog',
                icon: BookOpen
              },
              {
                label: 'Add Portfolio',
                path: '/dashboard/portfolio',
                icon: Briefcase
              },
              {
                label: 'Post Job',
                path: '/dashboard/careers',
                icon: Users
              }].
              map((action, i) =>
                <Link
                  key={i}
                  to={action.path}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[color:var(--bright-red)] transition-all group">

                  <div className="w-8 h-8 rounded bg-[color:var(--bright-red)]/10 flex items-center justify-center group-hover:bg-[color:var(--bright-red)] transition-colors">
                    <action.icon className="w-4 h-4 text-[color:var(--bright-red)] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-white">
                    {action.label}
                  </span>
                </Link>
              )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}
          className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">

          <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) =>
              <div
                key={i}
                className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">

                <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--vibrant-green)] mt-1.5" />
                <div className="flex-1">
                  <p className="text-white text-xs font-bold">
                    {activity.action}
                  </p>
                  <p className="text-gray-400 text-[10px]">{activity.item}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>);

}