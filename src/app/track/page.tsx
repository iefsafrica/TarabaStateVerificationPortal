"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowLeft, Loader2, CheckCircle2, Clock, XCircle, BadgeCheck, User, Briefcase, Calendar, Mail, Phone, Building } from "lucide-react";
import { toast } from "sonner";

type Registration = {
  registrationNo: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  grade: string;
  status: string;
  ninVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string; badge: string }> = {
  Pending: {
    label: "Pending Review",
    icon: <Clock className="h-5 w-5" />,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  Approved: {
    label: "Approved",
    icon: <CheckCircle2 className="h-5 w-5" />,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  Rejected: {
    label: "Rejected",
    icon: <XCircle className="h-5 w-5" />,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
};

export default function TrackPage() {
  const [activeTab, setActiveTab] = useState<"id" | "email">("id");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error(activeTab === "id" ? "Please enter a Registration ID." : "Please enter your email address.");
      return;
    }

    setIsSearching(true);
    setResult(null);
    setNotFound(false);

    try {
      const param = activeTab === "id" ? `registrationNo=${encodeURIComponent(query.trim())}` : `email=${encodeURIComponent(query.trim())}`;
      const res = await fetch(`/api/track?${param}`);
      const json = await res.json();

      if (json.success) {
        setResult(json.data);
      } else {
        setNotFound(true);
        if (res.status !== 404) {
          toast.error(json.error || "Failed to track registration.");
        }
      }
    } catch {
      toast.error("Error connecting to server. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const statusConfig = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG["Pending"]) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 px-4 pb-16" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 60%, #fdf4ff 100%)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-5 py-3 rounded-full shadow-sm border border-slate-100 mb-8">
        <Image src="/images/tsu-logo.png" alt="TSU Logo" width={28} height={28} className="rounded-full" />
        <span className="font-bold text-slate-700 tracking-widest text-sm uppercase">TSU Staff System</span>
      </div>

      {/* Search Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            Onboarding Status Check
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Staff Registration</h1>
          <p className="text-slate-500 text-sm">Enter your registration ID or email to check your staff onboarding status.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-full p-1 mb-7">
          <button
            onClick={() => { setActiveTab("id"); setQuery(""); setResult(null); setNotFound(false); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "id" ? "bg-green-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Search by ID
          </button>
          <button
            onClick={() => { setActiveTab("email"); setQuery(""); setResult(null); setNotFound(false); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "email" ? "bg-green-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Search by Email
          </button>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            {activeTab === "id" ? "Registration ID" : "Email Address"}
          </label>
          <div className="flex gap-2">
            <input
              type={activeTab === "email" ? "email" : "text"}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeTab === "id" ? "e.g. TSV-2026-48231" : "e.g. john.doe@tarabagov.ng"}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex items-center gap-2 px-5 py-3 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 disabled:opacity-70 transition-colors shadow-sm"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isSearching ? "Searching..." : "Send"}
            </button>
          </div>
        </div>

        {/* Not Found */}
        {notFound && !result && (
          <div className="mt-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>No registration found. Please check your {activeTab === "id" ? "Registration ID" : "email address"} and try again.</span>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Result Card */}
      {result && statusConfig && (
        <div className="w-full max-w-2xl mt-6 space-y-4">

          {/* Status Banner */}
          <div className={`rounded-3xl border p-6 flex items-center gap-4 ${statusConfig.bg} ${statusConfig.border}`}>
            <div className={`p-3 rounded-2xl ${statusConfig.badge}`}>
              {statusConfig.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Application Status</p>
              <p className={`text-xl font-bold ${statusConfig.text}`}>{statusConfig.label}</p>
              <p className="text-xs text-slate-500 mt-1">
                Last updated: {new Date(result.updatedAt).toLocaleDateString("en-NG", { dateStyle: "long" })}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.badge}`}>
              {result.registrationNo}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900">Registration Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailItem icon={<User className="h-4 w-4" />} label="Full Name" value={`${result.firstName} ${result.middleName || ""} ${result.lastName}`.trim()} />
              <DetailItem icon={<Mail className="h-4 w-4" />} label="Email" value={result.email} />
              <DetailItem icon={<Phone className="h-4 w-4" />} label="Phone" value={result.phone || "—"} />
              <DetailItem icon={<Building className="h-4 w-4" />} label="Department" value={result.department || "—"} />
              <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Designation" value={result.designation || "—"} />
              <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Grade Level" value={result.grade || "—"} />
              <DetailItem
                icon={<BadgeCheck className="h-4 w-4" />}
                label="NIN Verified"
                value={result.ninVerified ? "✅ Verified" : "❌ Not Verified"}
              />
              <DetailItem
                icon={<Calendar className="h-4 w-4" />}
                label="Submitted On"
                value={new Date(result.createdAt).toLocaleDateString("en-NG", { dateStyle: "long" })}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-5">Application Timeline</h2>
            <div className="space-y-4">
              <TimelineItem done={true} label="Registration Submitted" date={new Date(result.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} />
              <TimelineItem done={result.ninVerified} label="NIN Identity Verification" date={result.ninVerified ? "Completed" : "Pending"} />
              <TimelineItem done={result.status === "Approved"} label="Document Review" date={result.status === "Approved" ? "Completed" : result.status === "Rejected" ? "Rejected" : "In Progress"} isRejected={result.status === "Rejected"} />
              <TimelineItem done={result.status === "Approved"} label="Final Approval" date={result.status === "Approved" ? "Approved" : "Awaiting Review"} />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({ done, label, date, isRejected }: { done: boolean; label: string; date: string; isRejected?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isRejected ? "bg-red-100 text-red-600 border-2 border-red-200"
          : done ? "bg-green-100 text-green-600 border-2 border-green-200"
          : "bg-slate-100 text-slate-400 border-2 border-slate-200"
      }`}>
        {isRejected ? <XCircle className="h-4 w-4" /> : done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${done ? "text-slate-900" : "text-slate-400"}`}>{label}</p>
        <p className={`text-xs mt-0.5 ${isRejected ? "text-red-500" : done ? "text-green-600" : "text-slate-400"}`}>{date}</p>
      </div>
    </div>
  );
}
