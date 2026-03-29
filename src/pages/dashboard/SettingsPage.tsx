import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  Eye,
  EyeOff,
  X,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  UserPlus,
  History,
  ShieldCheck,
  Scale,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatusModal } from "../../components/dashboard/StatusModal";
import {
  settingsApi,
  authApi,
  usersApi,
  activityLogsApi,
  legalContentApi,
} from "../../services/api";
import type { DashboardSettings, LegalSection } from "../../types/types";
import { RichTextEditor } from "../../components/dashboard/RichTextEditor";
import { useAuth } from "../../context/AuthContext";

const defaultSettings: DashboardSettings = {
  notificationRecipients: ["phixels.io@gmail.com"],
  alerts: {
    newLead: true,
    meetingBooked: true,
    contactMessages: true,
    newsletter: false,
    jobApplications: true,
  },
  account: {
    fullName: "Admin",
    email: "admin@phixels.com",
    twoFactorEnabled: false,
  },
};

export function SettingsPage() {
  const { user: currentUser, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(
    "notifications",
  );
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changePwModal, setChangePwModal] = useState(false);
  const [changePwForm, setChangePwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const [userModal, setUserModal] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    _id: "",
    name: "",
    email: "",
    password: "",
    role: "staff",
    isDeleted: false,
  });

  // Legal Content State
  const [legalContent, setLegalContent] = useState<{
    privacyPolicy: LegalSection[];
    termsConditions: LegalSection[];
  }>({
    privacyPolicy: [],
    termsConditions: [],
  });
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalSaving, setLegalSaving] = useState(false);
  const [legalTab, setLegalTab] = useState<"privacy" | "terms">("privacy");

  const handleLogsRefresh = async () => {
    setLogsLoading(true);
    try {
      const data = await activityLogsApi.getAll();
      setLogs(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleUserRefresh = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLegalRefresh = async () => {
    setLegalLoading(true);
    try {
      const response = await legalContentApi.get();
      if (response.success) {
        setLegalContent(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLegalLoading(false);
    }
  };

  const handleLegalSave = async () => {
    setLegalSaving(true);
    try {
      const response = await legalContentApi.update(legalContent);
      if (response.success) {
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Saved",
          message: "Legal policies updated successfully!",
        });
      }
    } catch (error: any) {
      console.error(error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to save legal policies",
      });
    } finally {
      setLegalSaving(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    try {
      if (userForm._id) {
        await usersApi.update(userForm._id, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
        });
      } else {
        const { _id, ...newUserData } = userForm;
        await usersApi.create(newUserData);
      }
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: `User ${userForm._id ? "updated" : "added"} successfully!`,
      });
      setUserModal(false);
      handleUserRefresh();
    } catch (error: any) {
      console.error(error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Failed to save user",
      });
    } finally {
      setUserLoading(false);
    }
  };

  const handleToggleRestriction = async (user: any) => {
    try {
      await usersApi.update(user._id, { isDeleted: !user.isDeleted });
      handleUserRefresh();
    } catch (error: any) {
      console.error(error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Failed to update status",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this user?")
    )
      return;
    try {
      await usersApi.delete(id);
      handleUserRefresh();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Deleted",
        message: "User permanently deleted",
      });
    } catch (error: any) {
      console.error(error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Failed to delete user",
      });
    }
  };

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
            ...(data.alerts || {}),
          },
          account: {
            ...defaultSettings.account,
            // Strictly use current user data for the account section
            fullName:
              currentUser?.name ||
              currentUser?.fullName ||
              defaultSettings.account.fullName,
            email: currentUser?.email || defaultSettings.account.email,
            passwordLastChangedAt: currentUser?.passwordLastChangedAt,
            twoFactorEnabled:
              currentUser?.twoFactorEnabled ||
              defaultSettings.account.twoFactorEnabled,
          },
          notificationRecipients:
            data.notificationRecipients &&
            data.notificationRecipients.length > 0
              ? data.notificationRecipients
              : defaultSettings.notificationRecipients,
        });
      } catch (error: any) {
        console.error("Failed to load settings", error);
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load settings.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    handleUserRefresh();
  }, [currentUser]); // Added currentUser to dependencies

  useEffect(() => {
    if (currentUser) {
      setSettings((prev) => ({
        ...prev,
        account: {
          ...prev.account,
          fullName:
            currentUser.name || currentUser.fullName || prev.account.fullName,
          email: currentUser.email || prev.account.email,
          passwordLastChangedAt:
            currentUser.passwordLastChangedAt ||
            prev.account.passwordLastChangedAt,
        },
      }));
    }
  }, [currentUser]);
  const toggleSection = (section: string) => {
    const nextSection = activeSection === section ? null : section;
    setActiveSection(nextSection);
    if (nextSection === "logs") {
      handleLogsRefresh();
    }
    if (nextSection === "legal") {
      handleLegalRefresh();
    }
  };

  const handleSave = async (section: "notifications" | "account") => {
    setSaving(true);
    try {
      if (section === "notifications") {
        await settingsApi.update({
          notificationRecipients: settings.notificationRecipients,
          alerts: settings.alerts,
        });
      } else {
        // No longer update global account settings, as they've been removed in favor of per-user profiles.
        // We only update the personal user profile here.

        // Also update current user profile if it's the account section
        if (currentUser?.id) {
          const updatedUser = await usersApi.update(currentUser.id, {
            name: settings.account.fullName,
          });
          if (updatedUser) {
            updateUser(updatedUser);
          }
        }
      }

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Saved",
        message: "Settings updated successfully.",
      });
    } catch (error: any) {
      console.error("Failed to save settings", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: error?.response?.data?.message || "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!changePwForm.newPassword || !changePwForm.currentPassword) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: "All fields are required.",
      });
      return;
    }
    if (changePwForm.newPassword !== changePwForm.confirmPassword) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Mismatch",
        message: "New password and confirmation do not match.",
      });
      return;
    }
    if (changePwForm.newPassword.length < 6) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Too Short",
        message: "New password must be at least 6 characters.",
      });
      return;
    }

    setChangePwLoading(true);
    try {
      const email = currentUser?.email;
      if (!email) throw new Error("User email not found");

      await authApi.changePassword({
        email,
        currentPassword: changePwForm.currentPassword,
        newPassword: changePwForm.newPassword,
      });

      // Update the currentUser in context to reflect new passwordLastChangedAt
      if (currentUser) {
        updateUser({
          ...currentUser,
          passwordLastChangedAt: new Date().toISOString(),
        });
      }

      setChangePwModal(false);
      setChangePwForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Password Changed",
        message: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to change password.",
      });
    } finally {
      setChangePwLoading(false);
    }
  };

  const addRecipient = () => {
    const email = window.prompt("Enter recipient email");
    if (!email) return;
    const normalized = email.trim();
    if (!normalized) return;
    if (settings.notificationRecipients.includes(normalized)) return;

    setSettings((prev) => ({
      ...prev,
      notificationRecipients: [...prev.notificationRecipients, normalized],
    }));
  };

  const removeRecipient = (email: string) => {
    setSettings((prev) => ({
      ...prev,
      notificationRecipients: prev.notificationRecipients.filter(
        (item) => item !== email,
      ),
    }));
  };

  const sections = [
    {
      id: "notifications",
      title: "Form Notifications",
      icon: Bell,
      description: "Manage email alerts for new leads and submissions",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Email Recipients
            </h3>
            <div className="space-y-3">
              {settings.notificationRecipients.map((recipient, index) => (
                <div
                  key={recipient}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                >
                  <span className="text-sm text-white">{recipient}</span>
                  {index === 0 ? (
                    <span className="text-xs px-2 py-1 bg-[color:var(--bright-red)]/20 text-[color:var(--bright-red)] rounded font-bold">
                      Primary
                    </span>
                  ) : (
                    <button
                      onClick={() => removeRecipient(recipient)}
                      className="text-xs text-gray-500 hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed border-white/20 text-gray-400 hover:text-white text-xs py-2"
                onClick={addRecipient}
              >
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
                      alerts: { ...prev.alerts, newLead: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />

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
                      alerts: {
                        ...prev.alerts,
                        meetingBooked: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />

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
                      alerts: {
                        ...prev.alerts,
                        contactMessages: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />

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
                      alerts: { ...prev.alerts, newsletter: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
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
                      alerts: {
                        ...prev.alerts,
                        jobApplications: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />

                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "account",
      title: "Account & Security",
      icon: Shield,
      description: "Manage your profile, password, and authentication methods",
      content: (
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
                    account: { ...prev.account, fullName: e.target.value },
                  }))
                }
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={settings.account.email}
                disabled
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none opacity-60 cursor-not-allowed"
              />
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
                    Last changed{" "}
                    {settings.account.passwordLastChangedAt
                      ? new Date(
                          settings.account.passwordLastChangedAt,
                        ).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setChangePwModal(true)}
              >
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
                      account: {
                        ...prev.account,
                        twoFactorEnabled: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[color:var(--vibrant-green)]"></div>
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "users",
      title: "User Management",
      icon: Users,
      description:
        "View and manage all registered dashboard administrators and staff members",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Registered Users
              </h3>
              <Button
                variant="primary"
                className="text-xs flex items-center gap-2"
                onClick={() => {
                  setUserForm({
                    _id: "",
                    name: "",
                    email: "",
                    password: "",
                    role: "user",
                    isDeleted: false,
                  });
                  setUserModal(true);
                }}
              >
                <UserPlus size={14} /> Add User
              </Button>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-400">
                      <th className="py-3 px-4 font-medium">Name</th>
                      <th className="py-3 px-4 font-medium">Email</th>
                      <th className="py-3 px-4 font-medium">Role</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user._id || index}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-white font-medium">
                          {user.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold uppercase 
                            ${
                              user.role === "super_admin"
                                ? "bg-purple-500/10 text-purple-400"
                                : user.role === "admin"
                                  ? "bg-[color:var(--bright-red)]/10 text-[color:var(--bright-red)]"
                                  : user.role === "client"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-green-500/10 text-green-400"
                            }`}
                          >
                            {user.role?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.isDeleted ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"}`}
                          >
                            {user.isDeleted ? "Restricted" : "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setUserForm({
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                password: "",
                                role: user.role,
                                isDeleted: user.isDeleted,
                              });
                              setUserModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleRestriction(user)}
                            className={`p-2 bg-white/5 rounded transition-colors ${user.isDeleted ? "text-green-500 hover:text-green-400" : "text-gray-400 hover:text-orange-500"}`}
                            title={
                              user.isDeleted
                                ? "Unrestrict User"
                                : "Restrict User"
                            }
                          >
                            {user.isDeleted ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Ban size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-gray-400 hover:text-[color:var(--bright-red)] bg-white/5 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "logs",
      title: "Activity Logs",
      icon: History,
      description: "Track administrator activities and modifications",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                System Activity
              </h3>
              <Button
                variant="outline"
                className="text-xs"
                onClick={handleLogsRefresh}
                disabled={logsLoading}
              >
                Refresh Logs
              </Button>
            </div>

            {logsLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[color:var(--bright-red)]"></div>
                <p className="mt-2 text-gray-400 text-sm">Fetching logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No recent activity logs found.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log, index) => (
                  <div
                    key={log._id || index}
                    className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-[color:var(--bright-red)]/10 text-[color:var(--bright-red)] mt-1">
                      <Shield size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-sm font-bold text-white truncate">
                          {log.userName}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1 truncate">
                        {log.userEmail}
                      </p>
                      <p className="text-sm text-gray-300">
                        {log.actionDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "legal",
      title: "Legal Policies",
      icon: ShieldCheck,
      description: "Manage Privacy Policy and Terms & Conditions",
      content: (
        <div className="space-y-6">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
            <button
              onClick={() => setLegalTab("privacy")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                legalTab === "privacy"
                  ? "bg-[color:var(--bright-red)] text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={18} />
              <span className="font-bold">Privacy Policy</span>
            </button>
            <button
              onClick={() => setLegalTab("terms")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                legalTab === "terms"
                  ? "bg-[color:var(--bright-red)] text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Scale size={18} />
              <span className="font-bold">Terms & Conditions</span>
            </button>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 capitalize">
                {legalTab === "privacy"
                  ? "Privacy Policy"
                  : "Terms & Conditions"}{" "}
                Sections
              </h2>
              <button
                onClick={() => {
                  const newSection = { title: "", content: "" };
                  if (legalTab === "privacy") {
                    setLegalContent({
                      ...legalContent,
                      privacyPolicy: [
                        ...legalContent.privacyPolicy,
                        newSection,
                      ],
                    });
                  } else {
                    setLegalContent({
                      ...legalContent,
                      termsConditions: [
                        ...legalContent.termsConditions,
                        newSection,
                      ],
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all text-sm font-bold"
              >
                <Plus size={16} className="text-[color:var(--bright-red)]" />
                Add Section
              </button>
            </div>

            <div className="p-6">
              {legalLoading ? (
                <div className="text-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[color:var(--bright-red)] mx-auto mb-4" />
                  <p className="text-gray-400">Loading policy content...</p>
                </div>
              ) : (legalTab === "privacy"
                  ? legalContent.privacyPolicy
                  : legalContent.termsConditions
                ).length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                  <ShieldCheck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">
                    No sections added yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(legalTab === "privacy"
                    ? legalContent.privacyPolicy
                    : legalContent.termsConditions
                  ).map((section, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl border border-white/10 p-5 group hover:border-white/20 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex gap-4 items-center">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                const newSections =
                                  legalTab === "privacy"
                                    ? [...legalContent.privacyPolicy]
                                    : [...legalContent.termsConditions];
                                newSections[index] = {
                                  ...newSections[index],
                                  title: e.target.value,
                                };
                                setLegalContent({
                                  ...legalContent,
                                  [legalTab === "privacy"
                                    ? "privacyPolicy"
                                    : "termsConditions"]: newSections,
                                });
                              }}
                              placeholder="Section Title"
                              className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-[color:var(--bright-red)] transition-all font-bold"
                            />
                            <button
                              onClick={() => {
                                const newSections =
                                  legalTab === "privacy"
                                    ? [...legalContent.privacyPolicy]
                                    : [...legalContent.termsConditions];
                                newSections.splice(index, 1);
                                setLegalContent({
                                  ...legalContent,
                                  [legalTab === "privacy"
                                    ? "privacyPolicy"
                                    : "termsConditions"]: newSections,
                                });
                              }}
                              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <RichTextEditor
                            label="Section Content"
                            value={section.content}
                            onChange={(val) => {
                              const newSections =
                                legalTab === "privacy"
                                  ? [...legalContent.privacyPolicy]
                                  : [...legalContent.termsConditions];
                              newSections[index] = {
                                ...newSections[index],
                                content: val,
                              };
                              setLegalContent({
                                ...legalContent,
                                [legalTab === "privacy"
                                  ? "privacyPolicy"
                                  : "termsConditions"]: newSections,
                              });
                            }}
                            placeholder="Write section content..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

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
          {sections.map((section) => (
            <motion.div
              key={section.id}
              initial={false}
              animate={{
                backgroundColor:
                  activeSection === section.id
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.01)",
              }}
              className="border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${activeSection === section.id ? "bg-[color:var(--bright-red)] text-white" : "bg-white/5 text-gray-400"}`}
                  >
                    <section.icon size={24} />
                  </div>
                  <div>
                    <h2
                      className={`text-lg font-bold ${activeSection === section.id ? "text-white" : "text-gray-300"}`}
                    >
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`transition-transform duration-300 ${activeSection === section.id ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="text-gray-500" />
                </div>
              </button>

              <AnimatePresence>
                {activeSection === section.id && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="p-6 pt-0 border-t border-white/5">
                      <div className="pt-6">
                        {section.content}
                        {(section.id === "notifications" ||
                          section.id === "account" ||
                          section.id === "legal") && (
                          <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                            <Button
                              variant="primary"
                              className="px-8"
                              onClick={() => {
                                if (section.id === "legal") {
                                  handleLegalSave();
                                } else {
                                  handleSave(
                                    section.id as "notifications" | "account",
                                  );
                                }
                              }}
                              disabled={saving || legalSaving}
                            >
                              {(section.id === "legal" ? legalSaving : saving)
                                ? "Saving..."
                                : "Save Changes"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Management Form Modal */}
      <AnimatePresence>
        {userModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setUserModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[color:var(--bright-red)]/20 text-[color:var(--bright-red)]">
                    <UserPlus size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {userForm._id ? "Edit User" : "Add New User"}
                  </h2>
                </div>
                <button
                  onClick={() => setUserModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                {!userForm._id && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Temporary Password
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                      placeholder="Assign a password"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({ ...userForm, role: e.target.value })
                      }
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="client">Client</option>
                      <option value="staff">Staff / Employee</option>
                      <option value="admin">Administrator / Manager</option>
                      <option value="super_admin">Super Admin (Founder)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3"
                    disabled={userLoading}
                  >
                    {userLoading ? "Saving..." : "Save User"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />

      {/* Change Password Modal */}
      <AnimatePresence>
        {changePwModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setChangePwModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[color:var(--bright-red)]/20 text-[color:var(--bright-red)]">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Change Password
                  </h2>
                </div>
                <button
                  onClick={() => setChangePwModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={changePwForm.currentPassword}
                    onChange={(e) =>
                      setChangePwForm({
                        ...changePwForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={changePwForm.newPassword}
                    onChange={(e) =>
                      setChangePwForm({
                        ...changePwForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={changePwForm.confirmPassword}
                    onChange={(e) =>
                      setChangePwForm({
                        ...changePwForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {changePwForm.confirmPassword &&
                  changePwForm.newPassword !== changePwForm.confirmPassword && (
                    <p className="text-xs text-red-400">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setChangePwModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changePwLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.4)] transition-all disabled:opacity-60 text-sm"
                >
                  {changePwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
