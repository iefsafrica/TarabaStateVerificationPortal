"use client";

import { useState, useEffect } from "react";
import { Settings, Mail, Server, Eye, EyeOff, Send, Loader2, CheckCircle2, RefreshCcw, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

type SettingsState = {
  email_enabled: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_name: string;
  smtp_from_email: string;
};

const defaultSettings: SettingsState = {
  email_enabled: "false",
  smtp_host: "",
  smtp_port: "587",
  smtp_user: "",
  smtp_pass: "",
  smtp_from_name: "Taraba State Verification Portal",
  smtp_from_email: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success) {
        setSettings({ ...defaultSettings, ...json.data });
      }
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) toast.success("Settings saved successfully!");
      else toast.error(json.error || "Failed to save settings.");
    } catch {
      toast.error("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) return toast.error("Please enter a test email address.");
    try {
      setIsTesting(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, test_email: testEmail }),
      });
      const json = await res.json();
      if (json.success) toast.success("Test email sent successfully!");
      else toast.error(json.error || "Failed to send test email.");
    } catch {
      toast.error("Error sending test email.");
    } finally {
      setIsTesting(false);
    }
  };

  const update = (key: keyof SettingsState, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const emailEnabled = settings.email_enabled === "true";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium mb-4 w-fit">
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              System Configuration
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1527] tracking-tight">Settings</h1>
            <p className="text-slate-500 mt-2 text-sm">Configure system-wide settings including email and SMTP.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium">
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 bg-[#00894F] text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-70">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-2" />
          <p className="text-slate-500 text-sm">Loading settings...</p>
        </div>
      ) : (
        <>
          {/* Email Toggle */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Email Notifications</h2>
                <p className="text-slate-500 text-sm">Control whether the system sends automated emails.</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div>
                <p className="font-semibold text-slate-900">Enable Email Sending</p>
                <p className="text-sm text-slate-500 mt-0.5">When enabled, registration confirmation emails will be sent to applicants.</p>
              </div>
              <button
                onClick={() => update("email_enabled", emailEnabled ? "false" : "true")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  emailEnabled
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {emailEnabled
                  ? <><ToggleRight className="h-5 w-5" /> Enabled</>
                  : <><ToggleLeft className="h-5 w-5" /> Disabled</>
                }
              </button>
            </div>
          </div>

          {/* SMTP Configuration */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">SMTP Configuration</h2>
                <p className="text-slate-500 text-sm">Set up your outgoing email server credentials.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">SMTP Host</label>
                  <input type="text" value={settings.smtp_host} onChange={e => update("smtp_host", e.target.value)} placeholder="e.g., smtp.gmail.com" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">SMTP Port</label>
                  <input type="number" value={settings.smtp_port} onChange={e => update("smtp_port", e.target.value)} placeholder="587" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">SMTP Username</label>
                  <input type="text" value={settings.smtp_user} onChange={e => update("smtp_user", e.target.value)} placeholder="your@email.com" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">SMTP Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={settings.smtp_pass} onChange={e => update("smtp_pass", e.target.value)} placeholder="••••••••" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">From Name</label>
                  <input type="text" value={settings.smtp_from_name} onChange={e => update("smtp_from_name", e.target.value)} placeholder="Taraba State Verification Portal" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">From Email</label>
                  <input type="email" value={settings.smtp_from_email} onChange={e => update("smtp_from_email", e.target.value)} placeholder="noreply@tarabagov.ng" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Test Email */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Send Test Email</h2>
                <p className="text-slate-500 text-sm">Verify your SMTP configuration by sending a test message.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="Enter email to send test to..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
              <button
                onClick={handleTestEmail}
                disabled={isTesting}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-70"
              >
                {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Test
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
