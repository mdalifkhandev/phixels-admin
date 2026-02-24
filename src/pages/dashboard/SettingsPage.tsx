import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  ChevronDown,
  Bell,
  Lock,
  Mail,
  Smartphone,
  Check,
  MessageSquare,
  Briefcase,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusModal } from '../../components/dashboard/StatusModal';
import { settingsApi } from '../../services/api';
import type { DashboardSettings } from '../../types/types';

const defaultSettings: DashboardSettings = {
  notificationRecipients: ['phixels.io@gmail.com'],
  alerts: {
    newLead: true,
    meetingBooked: true,
    contactMessages: true,
    newsletter: false,
    jobApplications: true
  },
  account: {
    fullName: 'Admin',
    email: 'admin@phixels.com',
    twoFactorEnabled: false
  }
};

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>('notifications');
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsApi.get();
        setSettings({
          ...defaultSettings,
          ...data,
          alerts: {
            ...defaultSettings.alerts,
            ...(data.alerts || {})
          },
          account: {
            ...defaultSettings.account,
            ...(data.account || {})
          },
          notificationRecipients:
            data.notificationRecipients && data.notificationRecipients.length > 0
              ? data.notificationRecipients
              : defaultSettings.notificationRecipients
        });
      } catch (error: any) {
        console.error('Failed to load settings', error);
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Load Failed',
          message: error?.response?.data?.message || 'Failed to load settings.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleSave = async (section: 'notifications' | 'account') => {
    setSaving(true);
    try {
      if (section === 'notifications') {
        await settingsApi.update({
          notificationRecipients: settings.notificationRecipients,
          alerts: settings.alerts
        });
      } else {
        await settingsApi.update({
          account: settings.account
        });
      }

      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Saved',
        message: 'Settings updated successfully.'
      });
    } catch (error: any) {
      console.error('Failed to save settings', error);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Save Failed',
        message: error?.response?.data?.message || 'Failed to save settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  const addRecipient = () => {
    const email = window.prompt('Enter recipient email');
    if (!email) return;
    const normalized = email.trim();
    if (!normalized) return;
    if (settings.notificationRecipients.includes(normalized)) return;

    setSettings((prev) => ({
      ...prev,
      notificationRecipients: [...prev.notificationRecipients, normalized]
    }));
  };

  const removeRecipient = (email: string) => {
    setSettings((prev) => ({
      ...prev,
      notificationRecipients: prev.notificationRecipients.filter((item) => item !== email)
    }));
  };

  const sections = [
    {
      id: 'notifications',
      title: 'Form Notifications',
      icon: Bell,
      description: 'Manage email alerts for new leads and submissions',
      content:
        <div className="space-y-6">
          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Email Recipients
            </h3>
            <div className="space-y-3">
              {settings.notificationRecipients.map((recipient, index) => (
                <div key={recipient} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-sm text-white">{recipient}</span>
                  {index === 0 ? (
                    <span className="text-xs px-2 py-1 bg-[color:var(--bright-red)]/20 text-[color:var(--bright-red)] rounded font-bold">
                      Primary
                    </span>
                  ) : (
                    <button
                      onClick={() => removeRecipient(recipient)}
                      className="text-xs text-gray-500 hover:text-white">
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed border-white/20 text-gray-400 hover:text-white text-xs py-2"
                onClick={addRecipient}>

                <Plus size={14} className="mr-2" /> Add Email Recipient
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Form Alerts
            </h3>

            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-500">
                  <Users size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">New Lead (Step 1)</div>
                  <div className="text-xs text-gray-400">
                    Notify when user submits details but hasn't booked
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.newLead}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      alerts: { ...prev.alerts, newLead: e.target.checked }
                    }))
                  }
                  className="sr-only peer" />

                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color:var(--vibrant-green)]/20 text-[color:var(--vibrant-green)]">
                  <Check size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">
                    Meeting Booked (Step 2)
                  </div>
                  <div className="text-xs text-gray-400">
                    Notify when a consultation is confirmed
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.meetingBooked}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      alerts: { ...prev.alerts, meetingBooked: e.target.checked }
                    }))
                  }
                  className="sr-only peer" />

                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Contact Messages</div>
                  <div className="text-xs text-gray-400">
                    Notify on new contact form submission
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.contactMessages}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      alerts: { ...prev.alerts, contactMessages: e.target.checked }
                    }))
                  }
                  className="sr-only peer" />

                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">
                    Newsletter Subscription
                  </div>
                  <div className="text-xs text-gray-400">
                    Notify on new subscriber (Daily Digest recommended)
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.newsletter}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      alerts: { ...prev.alerts, newsletter: e.target.checked }
                    }))
                  }
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-500">
                  <Briefcase size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Job Applications</div>
                  <div className="text-xs text-gray-400">
                    Notify on new career application
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.jobApplications}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      alerts: { ...prev.alerts, jobApplications: e.target.checked }
                    }))
                  }
                  className="sr-only peer" />

                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>
          </div>
        </div>

    },
    {
      id: 'account',
      title: 'Account & Security',
      icon: Shield,
      description: 'Manage your profile, password, and authentication methods',
      content:
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={settings.account.fullName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    account: { ...prev.account, fullName: e.target.value }
                  }))
                }
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none" />

            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={settings.account.email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    account: { ...prev.account, email: e.target.value }
                  }))
                }
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none" />

            </div>
          </div>

          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">Password</div>
                  <div className="text-xs text-gray-400">
                    Last changed {settings.account.passwordLastChangedAt ? new Date(settings.account.passwordLastChangedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
              <Button variant="outline" className="text-xs">
                Change Password
              </Button>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-white">
                  <Smartphone size={18} />
                </div>
                <div>
                  <div className="font-bold text-white">
                    Two-Factor Authentication
                  </div>
                  <div className="text-xs text-gray-400">
                    Secure your account with 2FA
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.account.twoFactorEnabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      account: { ...prev.account, twoFactorEnabled: e.target.checked }
                    }))
                  }
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>
          </div>
        </div>

    }];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">
            Manage your workspace preferences and security
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) =>
            <motion.div
              key={section.id}
              initial={false}
              animate={{
                backgroundColor:
                  activeSection === section.id ?
                    'rgba(255,255,255,0.03)' :
                    'rgba(255,255,255,0.01)'
              }}
              className="border border-white/10 rounded-2xl overflow-hidden">

              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">

                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${activeSection === section.id ? 'bg-[color:var(--bright-red)] text-white' : 'bg-white/5 text-gray-400'}`}>

                    <section.icon size={24} />
                  </div>
                  <div>
                    <h2
                      className={`text-lg font-bold ${activeSection === section.id ? 'text-white' : 'text-gray-300'}`}>

                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
                <div
                  className={`transition-transform duration-300 ${activeSection === section.id ? 'rotate-180' : ''}`}>

                  <ChevronDown className="text-gray-500" />
                </div>
              </button>

              <AnimatePresence>
                {activeSection === section.id &&
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0
                    }}
                    animate={{
                      height: 'auto',
                      opacity: 1
                    }}
                    exit={{
                      height: 0,
                      opacity: 0
                    }}
                    transition={{
                      duration: 0.3,
                      ease: 'easeInOut'
                    }}>

                    <div className="p-6 pt-0 border-t border-white/5">
                      <div className="pt-6">
                        {section.content}
                        <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                          <Button
                            variant="primary"
                            className="px-8"
                            onClick={() => handleSave(section.id as 'notifications' | 'account')}
                            disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </>
  );

}
