import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Globe,
  Share2,
  Activity,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Briefcase,
  Package,
  FileText,
  Users,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Star,
  Wrench
} from
  'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusModal } from './StatusModal';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
}
interface MenuCategory {
  title: string;
  items: MenuItem[];
  id: string;
}
const categories: MenuCategory[] = [
  {
    id: 'analytics',
    title: 'Analytics',
    items: [
      {
        name: 'Overview',
        path: '/dashboard',
        icon: LayoutDashboard
      },
      {
        name: 'Lead Management',
        path: '/dashboard/leads',
        icon: MessageSquare
      },
      {
        name: 'Conversion Funnel',
        path: '/dashboard/funnel',
        icon: TrendingUp
      },
      {
        name: 'Geographic Data',
        path: '/dashboard/geographic',
        icon: Globe
      },
      {
        name: 'Traffic Sources',
        path: '/dashboard/traffic',
        icon: Share2
      },
      {
        name: 'Real-time Monitor',
        path: '/dashboard/realtime',
        icon: Activity
      }]

  },
  {
    id: 'content',
    title: 'Content',
    items: [
      {
        name: 'Blog Posts',
        path: '/dashboard/blog',
        icon: BookOpen
      },
      {
        name: 'Services',
        path: '/dashboard/services',
        icon: Wrench
      },
      {
        name: 'Case Studies',
        path: '/dashboard/case-studies',
        icon: FileText
      },
      {
        name: 'Portfolio',
        path: '/dashboard/portfolio',
        icon: Briefcase
      },
      {
        name: 'Products',
        path: '/dashboard/products',
        icon: Package
      },
      {
        name: 'Reviews',
        path: '/dashboard/reviews',
        icon: Star
      },
      {
        name: 'Careers',
        path: '/dashboard/careers',
        icon: Users
      }]

  },
  {
    id: 'settings',
    title: 'System',
    items: [
      {
        name: 'Settings',
        path: '/dashboard/settings',
        icon: Settings
      }]

  }];

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}
export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'analytics',
    'content',
    'settings']
  );

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleCategory = (id: string) => {
    if (isCollapsed) return;
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 256
        }}
        className="h-screen bg-[#0A0A0A] border-r border-white/10 flex flex-col fixed left-0 top-0 z-50 overflow-hidden transition-all duration-300 ease-in-out">

        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/10 bg-[#050505] shrink-0">
          {!isCollapsed ?
            <div className="flex items-center justify-between w-full">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap">

                <img
                  src="/Phixels-Logo.svg"
                  alt="Phixels"
                  className="h-8 w-auto" />

              </Link>
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Collapse Sidebar">

                <ChevronsLeft size={18} />
              </button>
            </div> :

            <div className="w-full flex items-center justify-center gap-2">
              <div
                onClick={toggleCollapse}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                title="Expand Sidebar">

                <img
                  src="/Phixels-Logo.svg"
                  alt="P"
                  className="h-6 w-auto" />

              </div>
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors absolute right-[-10px] bg-[#0A0A0A] border border-white/10 shadow-lg z-10"
                title="Expand Sidebar"
                style={{
                  transform: 'translateX(50%)'
                }}>

                <ChevronsRight size={14} />
              </button>
            </div>
          }
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="space-y-6">
            {categories.map((category) =>
              <div key={category.id}>
                {!isCollapsed &&
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-white transition-colors mb-1">

                    {category.title}
                    {expandedCategories.includes(category.id) ?
                      <ChevronDown size={12} /> :

                      <ChevronRight size={12} />
                    }
                  </button>
                }

                <div className="space-y-1">
                  {(isCollapsed || expandedCategories.includes(category.id)) &&
                    category.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          title={isCollapsed ? item.name : ''}>

                          <div
                            className={`
                            flex items-center gap-3 px-3 py-2 rounded-md transition-all relative group border border-transparent
                            ${isActive ? 'bg-red-500/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            hover:border-[color:var(--bright-red)]
                          `}>

                            <item.icon
                              size={18}
                              className={`shrink-0 transition-colors ${isActive ? 'text-[color:var(--bright-red)]' : 'group-hover:text-white'}`} />

                            {!isCollapsed &&
                              <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                                {item.name}
                              </span>
                            }
                          </div>
                        </Link>);

                    })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-[#050505] shrink-0 flex flex-col gap-2">
          {/* User Profile */}
          {!isCollapsed ?
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {user?.email || 'admin@pixcel.com'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="absolute right-2 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Sign Out">

                <LogOut size={14} />
              </button>
            </div> :

            <div className="flex flex-col items-center gap-4">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0"
                title={user?.name}>

                <span className="text-white font-bold text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Sign Out">

                <LogOut size={16} />
              </button>
            </div>
          }
        </div>
      </motion.div>

      <StatusModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        type="error"
        title="Confirm Logout"
        message="Are you sure you want to sign out of the admin panel?"
        actionLabel="Logout"
        onAction={confirmLogout}
        secondaryActionLabel="Cancel"
        onSecondaryAction={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
