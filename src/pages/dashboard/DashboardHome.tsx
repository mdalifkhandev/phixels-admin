import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Briefcase,
  FileText,
  BookOpen,
  Users,
  Eye,
  Activity,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { CompactMetricCard } from '../../components/dashboard/CompactMetricCard';
import { Link } from 'react-router-dom';
import { 
  analyticsApi, 
  productsApi, 
  portfolioApi, 
  caseStudiesApi, 
  blogsApi, 
  careersApi 
} from '../../services/api';

export function DashboardHome() {
  const [timeRange, setTimeRange] = useState('1 Month');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [counts, setCounts] = useState({
    products: 0,
    portfolio: 0,
    caseStudies: 0,
    blogs: 0,
    jobs: 0,
    pageViews: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [products, portfolio, cases, blogs, careers, analytics] = await Promise.all([
          productsApi.getAll(),
          portfolioApi.getAll(),
          caseStudiesApi.getAll(),
          blogsApi.getAll(),
          careersApi.getAll(),
          analyticsApi.getOverview()
        ]);
        
        setCounts({
          products: products.length,
          portfolio: portfolio.length,
          caseStudies: cases.length,
          blogs: blogs.length,
          jobs: careers.filter(c => c.isActive !== false).length,
          pageViews: analytics.totalVisits
        });
      } catch (error) {
        console.error('Failed to fetch dashboard counts:', error);
      }
    };

    const fetchRealtime = async () => {
      try {
        const realtime = await analyticsApi.getRealtime();
        setActiveUsers(realtime.activeUsers);
      } catch (error) {
        console.error('Failed to fetch realtime users:', error);
      }
    };

    fetchCounts();
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 15000); // 15s refresh for active users
    return () => clearInterval(interval);
  }, []);

  const timeOptions = [
    '1 Hour',
    '1 Day',
    '3 Days',
    '1 Week',
    '1 Month',
    '3 Months',
    '6 Months',
    '1 Year'
  ];

  const stats = [
    {
      title: 'Active Users',
      value: activeUsers !== null ? activeUsers.toString() : '...',
      change: activeUsers !== null ? 'Live' : '',
      icon: Activity,
      color: 'text-[color:var(--vibrant-green)]'
    },
    {
      title: 'Total Products',
      value: counts.products.toString(),
      change: '',
      icon: Package,
      color: 'text-blue-400'
    },
    {
      title: 'Portfolio Items',
      value: counts.portfolio.toString(),
      change: '',
      icon: Briefcase,
      color: 'text-[color:var(--vibrant-green)]'
    },
    {
      title: 'Case Studies',
      value: counts.caseStudies.toString(),
      change: '',
      icon: FileText,
      color: 'text-purple-400'
    },
    {
      title: 'Blog Posts',
      value: counts.blogs.toString(),
      change: '',
      icon: BookOpen,
      color: 'text-[color:var(--neon-yellow)]'
    },
    {
      title: 'Page Views',
      value: counts.pageViews > 1000 ? `${(counts.pageViews / 1000).toFixed(1)}K` : counts.pageViews.toString(),
      change: '',
      icon: Eye,
      color: 'text-blue-500'
    }
  ];

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