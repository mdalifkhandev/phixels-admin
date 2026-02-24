import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  MessageSquare,
  Briefcase,
  ChevronRight
} from
  'lucide-react';
import { Link } from 'react-router-dom';
import type { AnalyticsOverview } from '../../types/types';
interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: AnalyticsOverview['notifications'];
}
export function NotificationDropdown({
  isOpen,
  onClose,
  notifications
}: NotificationDropdownProps) {
  const staticNotifications = [
    {
      id: 1,
      type: 'lead',
      title: 'New Project Request',
      message: 'John Doe submitted a new project request.',
      time: '5 min ago',
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      id: 2,
      type: 'meeting',
      title: 'Meeting Confirmed',
      message: 'Sarah Smith booked a consultation for Mar 22.',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'text-[color:var(--vibrant-green)]',
      bg: 'bg-[color:var(--vibrant-green)]/10'
    },
    {
      id: 3,
      type: 'contact',
      title: 'New Message',
      message: 'Alice Brown sent a contact inquiry.',
      time: '3 hours ago',
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 4,
      type: 'job',
      title: 'Job Application',
      message: 'New application for Senior Designer role.',
      time: '5 hours ago',
      icon: Briefcase,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    }];

  const mappedNotifications = (notifications && notifications.length > 0 ? notifications : staticNotifications).map((notif: any, idx: number) => {
    const type = notif.type || 'contact';
    const iconByType: Record<string, any> = {
      lead: Clock,
      meeting: CheckCircle,
      contact: MessageSquare,
      job: Briefcase,
      newsletter: MessageSquare,
    };
    const colorByType: Record<string, string> = {
      lead: 'text-yellow-500',
      meeting: 'text-[color:var(--vibrant-green)]',
      contact: 'text-blue-500',
      job: 'text-pink-500',
      newsletter: 'text-purple-500',
    };
    const bgByType: Record<string, string> = {
      lead: 'bg-yellow-500/10',
      meeting: 'bg-[color:var(--vibrant-green)]/10',
      contact: 'bg-blue-500/10',
      job: 'bg-pink-500/10',
      newsletter: 'bg-purple-500/10',
    };

    return {
      id: notif.id ?? idx + 1,
      type,
      title: notif.title,
      message: notif.message,
      time: notif.time || 'Just now',
      icon: iconByType[type] || MessageSquare,
      color: colorByType[type] || 'text-blue-500',
      bg: bgByType[type] || 'bg-blue-500/10',
    };
  });

  return (
    <AnimatePresence>
      {isOpen &&
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.95
            }}
            className="absolute right-0 top-full mt-4 w-80 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col">

            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              <span className="text-[10px] font-bold bg-[color:var(--bright-red)] text-white px-2 py-0.5 rounded-full">
                {mappedNotifications.length} New
              </span>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {mappedNotifications.map((notif) =>
                <Link
                  key={notif.id}
                  to="/dashboard/leads"
                  onClick={onClose}
                  className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">

                  <div
                    className={`p-2 rounded-lg shrink-0 ${notif.bg} ${notif.color}`}>

                    <notif.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[color:var(--bright-red)] transition-colors">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </Link>
              )}
            </div>

            <Link
              to="/dashboard/leads"
              onClick={onClose}
              className="p-3 text-center text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10 flex items-center justify-center gap-1">

              View All Notifications <ChevronRight size={12} />
            </Link>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}
