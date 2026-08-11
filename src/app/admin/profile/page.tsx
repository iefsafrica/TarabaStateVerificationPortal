"use client";

import { useState } from "react";
import { User, Mail, Phone, Shield, Building, Key, CheckCircle2, Lock, Save, Camera } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [profile, setProfile] = useState({
    fullName: "Admin User",
    email: "info@tarabastate.gov",
    phone: "08012345678",
    role: "Administrator",
    department: "System Administration",
    bio: "Super administrator managing Taraba State Verification Portal.",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile details updated successfully!");
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password updated successfully!");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-3xl shadow-md">
            AU
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200 w-fit self-center sm:self-auto">
              <Shield className="h-3.5 w-3.5" />
              {profile.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">{profile.department} • Taraba State Government</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1 max-w-md">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="h-4 w-4" /> Profile Details
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock className="h-4 w-4" /> Change Password
        </button>
      </div>

      {/* Profile Details Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.department}
                  onChange={e => setProfile({ ...profile, department: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
                <Building className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bio / Notes</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
            />
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSave} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Security & Password</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" /> Update Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
