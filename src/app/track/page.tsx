"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Search, ArrowLeft, Loader2, CheckCircle2, Clock, XCircle, BadgeCheck, User, Briefcase, Calendar, Mail, Phone, Building, Download, ShieldCheck, Fingerprint, MapPin, School, GraduationCap, Building2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAppConfig } from "@/components/AppConfigContext";

// Helper to format dates coming from external APIs into YYYY-MM-DD format for HTML date inputs
const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  
  // If it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try parsing DD-MM-YYYY or DD/MM/YYYY
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      // It's DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // Fallback to JS Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return "";
};

type Registration = {
  id?: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  grade: string;
  status: string;
  ninVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Extra imported details
  currentStation?: string;
  lga?: string;
  gender?: string;
  cadre?: string;
  birthdate?: string;
  dateOfFirstAppointment?: string;
  dateOfLastPromotion?: string;
  lgaOfOrigin?: string;
  nationality?: string;
  rank?: string;
  highestQualification?: string;
  stateOfOrigin?: string;
  subjectTaught?: string;
  bankName?: string;
  accountNumber?: string;
  bvn?: string;
  nin?: string;
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
  "Self-Verified": {
    label: "NIN Verified - Pending Admin",
    icon: <ShieldCheck className="h-5 w-5" />,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Approved: {
    label: "Approved & Active",
    icon: <CheckCircle2 className="h-5 w-5" />,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  Active: {
    label: "Approved & Active",
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
  const { appName, appLogo } = useAppConfig();
  const [activeTab, setActiveTab] = useState<"id" | "email">("id");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);
  const [notFound, setNotFound] = useState(false);

  // NIN Verification Modal State
  const [showNinModal, setShowNinModal] = useState(false);
  const [isVerifyingNin, setIsVerifyingNin] = useState(false);
  const [ninData, setNinData] = useState<any>(null); // holds mock data for the form overlay
  const userRef = useState(`emp-${Date.now()}`)[0];
  
  // Load KYC Widget script dynamically
  useEffect(() => {
    if (document.querySelector('script[src="https://kyc-verify-v2.netapps.ng/embed.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://kyc-verify-v2.netapps.ng/embed.js";
    script.async = true;
    script.setAttribute("data-public-key", "dummy");
    script.setAttribute("data-user-ref", "dummy");
    script.setAttribute("data-slug", "dummy");
    script.setAttribute("data-name", "dummy");
    script.setAttribute("data-level-slug", "dummy");
    document.body.appendChild(script);
  }, []);
  
  // Auto-fill & Edit Profile form state
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "",
    birthdate: "",
    photo: "",
    phone: "",
    email: "",
    department: "",
    designation: "",
    grade: "",
    stateOfOrigin: "",
    lga: "",
    nationality: "",
    fileNo: "",
    employmentId: "",
    serviceNo: "",
    dateOfFirstAppointment: "",
    rank: "",
    cadre: "",
    highestQualification: "",
    bankName: "",
    accountNumber: "",
    bvn: "",
  });

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error(activeTab === "id" ? "Please enter your NIN." : "Please enter your email address.");
      return;
    }

    setIsSearching(true);
    setResult(null);
    setNotFound(false);
    setShowNinModal(false);
    setIsEditingProfile(false);
    setNinData(null);

    try {
      const param = activeTab === "id" ? `registrationNo=${encodeURIComponent(query.trim())}` : `email=${encodeURIComponent(query.trim())}`;
      const res = await fetch(`/api/track?${param}`);
      const json = await res.json();

      if (json.success) {
        setResult(json.data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleVerifyNin = async () => {
    if (!(window as any).KycWidget) {
      toast.error("NIN verification SDK is still loading. Please try again in a few seconds.");
      return;
    }

    setIsVerifyingNin(true);

    // Proactively check if the user already verified their NIN in a previous session
    // to prevent the widget from throwing a "Verification failed" or duplicate error.
    try {
      const checkRes = await fetch(`/api/kyc-status?userRef=${userRef}&slug=ippis_nin_verification`);
      if (checkRes.ok) {
        const data = await checkRes.json();
        // If we get valid data back, they are already verified!
        if (data && !data.error && data.nin) {
          toast.success("NIN already verified! Fetching your auto-fill data...");
          setNinData(data);
          setFormData(prev => ({
            ...prev,
            firstName: data.firstName || data.firstname || result?.firstName || "",
            lastName: data.lastName || data.surname || result?.lastName || "",
            middleName: data.middleName || result?.middleName || "",
            gender: data.gender || result?.gender || "",
            birthdate: formatDateForInput(data.birthdate || data.dob) || (result?.birthdate ? new Date(result.birthdate).toISOString().split('T')[0] : ""),
          }));
          setShowNinModal(true);
          setIsVerifyingNin(false);
          return; // Skip launching the widget
        }
      }
    } catch (e) {
      // Ignore error and fall through to opening the widget
      console.error("Pre-check failed", e);
    }

    (window as any).KycWidget.init({
      publicKey: process.env.NEXT_PUBLIC_NETAPPS_PUBLIC_KEY || "NA_PUB_PROD-ec7d8308578d9a23909acdd53978ef9e",
      userRef,
      slug: "ippis_nin_verification",
      name: "Taraba Staff",
      levelSlug: "tier_1",
      display: "modal",
      environment: "live",
      callbacks: {
        onSuccess: async () => {
          toast.success("Verification successful! Fetching auto-fill data...");
          try {
            const res = await fetch(`/api/kyc-status?userRef=${userRef}&slug=ippis_nin_verification`);
            const data = await res.json();
            
            if (data && !data.error) {
              setNinData(data);
              
              setFormData(prev => ({
                ...prev,
                firstName: data.firstName || data.firstname || result?.firstName || "",
                lastName: data.lastName || data.surname || result?.lastName || "",
                middleName: data.middleName || result?.middleName || "",
                gender: data.gender || result?.gender || "",
                birthdate: formatDateForInput(data.birthdate || data.dob) || (result?.birthdate ? new Date(result.birthdate).toISOString().split('T')[0] : ""),
              }));
              
              setShowNinModal(true);
              toast.success("NIN Data securely fetched and auto-filled.");
            } else {
               toast.error("Could not fetch data from NetApps.");
               setIsVerifyingNin(false);
            }
          } catch (e) {
            toast.error("Error communicating with server.");
            setIsVerifyingNin(false);
          }
        },
        onError: ({ message }: any) => {
          toast.error(`Verification error: ${message}`);
          setIsVerifyingNin(false);
        },
        onClose: () => {
           setIsVerifyingNin(false);
        }
      }
    });
  };

  const handleConfirmAndSave = async () => {
    if (!result?.id) {
      toast.error("Employee ID is missing, cannot update.");
      return;
    }

    setIsSubmittingForm(true);
    try {
      const res = await fetch(`/api/track/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: result.id,
          updatedData: {
            ...formData,
            nin: ninData?.nin || ninData?.NIN || result?.nin || "",
          }
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Profile verified & saved! A receipt has been sent to your email.");
        setShowNinModal(false);
        setIsVerifyingNin(false);
        // Refresh the profile automatically
        setResult({
          ...result,
          ...formData,
          ninVerified: true,
          status: "Self-Verified"
        });
      } else {
        toast.error(`Verification failed: ${json.error}`);
      }
    } catch (err) {
      toast.error("An error occurred during verification saving.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleStartEdit = () => {
    setFormData({
      firstName: result?.firstName || "",
      lastName: result?.lastName || "",
      middleName: result?.middleName || "",
      gender: result?.gender || "",
      birthdate: result?.birthdate ? new Date(result.birthdate).toISOString().split('T')[0] : "",
      photo: (result as any)?.photo || "",
      phone: result?.phone || "",
      email: result?.email || "",
      department: result?.department || "",
      designation: result?.designation || "",
      grade: result?.grade || "",
      stateOfOrigin: (result as any)?.stateOfOrigin || "",
      lga: (result as any)?.lga || "",
      nationality: (result as any)?.nationality || "",
      fileNo: (result as any)?.fileNo || (result as any)?.registrationNo || "",
      employmentId: (result as any)?.employmentId || "",
      serviceNo: (result as any)?.serviceNo || "",
      dateOfFirstAppointment: (result as any)?.dateOfFirstAppointment ? new Date((result as any).dateOfFirstAppointment).toISOString().split('T')[0] : "",
      rank: (result as any)?.rank || "",
      cadre: (result as any)?.cadre || "",
      highestQualification: (result as any)?.highestQualification || "",
      bankName: (result as any)?.bankName || "",
      accountNumber: (result as any)?.accountNumber || "",
      bvn: (result as any)?.bvn || "",
    });
    setIsEditingProfile(true);
  };

  const handleUpdateProfile = async () => {
    if (!result?.id) {
      toast.error("Employee ID is missing, cannot update.");
      return;
    }

    setIsSubmittingForm(true);
    try {
      const res = await fetch(`/api/employees/${result.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          gender: formData.gender,
          birthdate: formData.birthdate,
          photo: formData.photo,
          phone: formData.phone,
          email: formData.email,
          department: formData.department,
          designation: formData.designation,
          grade: formData.grade,
          stateOfOrigin: formData.stateOfOrigin,
          lga: formData.lga,
          nationality: formData.nationality,
          fileNo: formData.fileNo,
          employmentId: formData.employmentId,
          serviceNo: formData.serviceNo,
          dateOfFirstAppointment: formData.dateOfFirstAppointment,
          rank: formData.rank,
          cadre: formData.cadre,
          highestQualification: formData.highestQualification,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          bvn: formData.bvn,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Profile updated successfully!");
        setIsEditingProfile(false);
        // Refresh the profile automatically
        setResult({
          ...result,
          ...json.data
        });
      } else {
        toast.error(`Update failed: ${json.error}`);
      }
    } catch (err) {
      toast.error("An error occurred during update.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const statusConfig = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG["Pending"]) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 px-4 pb-16" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 60%, #fdf4ff 100%)" }}>


      {/* Logo */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-5 py-3 rounded-full shadow-sm border border-slate-100 mb-8">
        <Image src={appLogo || "/images/tsu-logo.png"} alt="System Logo" width={28} height={28} className="rounded-full" />
        <span className="font-bold text-slate-700 tracking-widest text-sm uppercase">{appName || "TSU Staff System"}</span>
      </div>

      {/* Search Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10">

        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            Onboarding Status Check
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Staff Registration</h1>
          <p className="text-slate-500 text-sm">Enter your NIN or email to check your staff onboarding status.</p>
        </div>

        <div className="flex bg-slate-100 rounded-full p-1 mb-7">
          <button
            onClick={() => { setActiveTab("id"); setQuery(""); setResult(null); setNotFound(false); setShowNinModal(false); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "id" ? "bg-green-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Search by NIN
          </button>
          <button
            onClick={() => { setActiveTab("email"); setQuery(""); setResult(null); setNotFound(false); setShowNinModal(false); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "email" ? "bg-green-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Search by Email
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            {activeTab === "id" ? "National Identity Number (NIN)" : "Email Address"}
          </label>
          <div className="flex gap-2">
            <input
              type={activeTab === "email" ? "email" : "text"}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeTab === "id" ? "e.g. 12345678901" : "e.g. john.doe@tarabagov.ng"}
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

        {notFound && !result && (
          <div className="mt-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>No record found. Please check your {activeTab === "id" ? "NIN" : "email address"} and try again.</span>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Result Card */}
      {result && statusConfig && !showNinModal && !isEditingProfile && (
        <div className="w-full max-w-4xl mt-6 space-y-4">
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

          {!result.ninVerified && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-4">
                <Fingerprint className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">NIN Verification Required</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                You need to verify your National Identity Number (NIN) to proceed with your onboarding and auto-fill your profile details.
              </p>
              <button
                onClick={handleVerifyNin}
                disabled={isVerifyingNin}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00894F] text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm"
              >
                {isVerifyingNin ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {isVerifyingNin ? "Initializing Identity Portal..." : "Start NIN Verification"}
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-900">Registration Details</h2>
              {result.ninVerified && (
                 <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                   <CheckCircle2 className="h-3 w-3" /> NIN Verified
                 </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-0 gap-x-0 divide-y md:divide-y-0 md:divide-x border-b border-slate-100">
               <div className="p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1"><UserCircle2 className="w-3 h-3"/> Personal</h3>
                  {(result as any)?.photo && (
                    <div className="mb-2 flex justify-center">
                      <img src={(result as any).photo} alt="Profile Photo" className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-sm" />
                    </div>
                  )}
                  <DetailItem icon={<User className="h-4 w-4" />} label="Full Name" value={`${result.firstName} ${result.middleName || ""} ${result.lastName}`.trim()} />
                  <DetailItem icon={<Fingerprint className="h-4 w-4" />} label="Gender" value={result.gender || "—"} />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={result.birthdate ? new Date(result.birthdate).toLocaleDateString() : "—"} />
                  <DetailItem icon={<MapPin className="h-4 w-4" />} label="State of Origin" value={result.stateOfOrigin || "—"} />
                  <DetailItem icon={<MapPin className="h-4 w-4" />} label="LGA of Origin" value={result.lgaOfOrigin || result.lga || "—"} />
                  <DetailItem icon={<Fingerprint className="h-4 w-4" />} label="Nationality" value={result.nationality || "—"} />
               </div>

               <div className="p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1"><Building2 className="w-3 h-3"/> Employment</h3>
                  <DetailItem icon={<Building className="h-4 w-4" />} label="Department / MDAs" value={result.department || "—"} />
                  <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Designation / Rank" value={result.designation || result.rank || "—"} />
                  <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Grade Level" value={result.grade || "—"} />
                  <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Cadre" value={result.cadre || "—"} />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label="Date of 1st Appt" value={result.dateOfFirstAppointment ? new Date(result.dateOfFirstAppointment).toLocaleDateString() : "—"} />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label="Last Promotion" value={result.dateOfLastPromotion ? new Date(result.dateOfLastPromotion).toLocaleDateString() : "—"} />
               </div>

               <div className="p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1"><School className="w-3 h-3"/> Posting & Contact</h3>
                  <DetailItem icon={<School className="h-4 w-4" />} label="Current Station / School" value={result.currentStation || "—"} />
                  <DetailItem icon={<GraduationCap className="h-4 w-4" />} label="Highest Qualification" value={result.highestQualification || "—"} />
                  <DetailItem icon={<School className="h-4 w-4" />} label="Subject Taught" value={result.subjectTaught || "—"} />
                  <DetailItem icon={<Mail className="h-4 w-4" />} label="Email Address" value={result.email || "—"} />
                  <DetailItem icon={<Phone className="h-4 w-4" />} label="Phone Number" value={result.phone || "—"} />
                  <DetailItem icon={<Building className="h-4 w-4" />} label="Bank Name" value={result.bankName || "—"} />
                  <DetailItem icon={<BadgeCheck className="h-4 w-4" />} label="BVN" value={result.bvn || "—"} />
               </div>
            </div>
            
            <div className="p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
               <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3"/> NIN Verification: {result.ninVerified ? "Verified" : "Not Verified"}</span>
               <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Registered: {new Date(result.createdAt).toLocaleDateString("en-NG", { dateStyle: "long" })}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-5">Application Timeline</h2>
            <div className="space-y-4">
              <TimelineItem done={true} label="Profile Created/Imported" date={new Date(result.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} />
              <TimelineItem done={result.ninVerified} label="NIN Identity Verification" date={result.ninVerified ? "Completed" : "Pending"} />
              <TimelineItem done={result.status === "Active" || result.status === "Approved"} label="Admin Final Review" date={result.status === "Active" || result.status === "Approved" ? "Completed" : result.status === "Rejected" ? "Rejected" : "Pending"} isRejected={result.status === "Rejected"} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-green-600 text-green-700 rounded-2xl font-semibold hover:bg-green-50 transition-colors shadow-sm text-sm"
            >
              <Download className="h-4 w-4" />
              Download Status Report
            </button>
            <button
              onClick={handleStartEdit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-green-700 text-white rounded-2xl font-semibold hover:bg-green-800 transition-colors shadow-sm text-sm"
            >
              <User className="h-4 w-4" />
              Update Profile
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile View */}
      {isEditingProfile && result && (
        <div className="w-full max-w-4xl mt-6 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
          <div className="px-8 py-6 border-b border-slate-100 bg-[#00894F] text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">Update Profile</h2>
              <p className="text-green-100 text-sm opacity-90 mt-1">You can only fill in information that is missing from your record</p>
            </div>
            <UserCircle2 className="h-8 w-8 text-green-200 opacity-50" />
          </div>

          <div className="p-8">
            {/* Info banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Locked fields</strong> contain verified data from official records and cannot be changed. Only fields marked <strong className="text-green-700">editable</strong> can be updated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Photo â€” always editable */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Passport Photograph <span className="text-xs font-normal text-green-600 ml-1">(editable)</span>
                </label>
                <div className="flex items-center gap-4">
                  {formData.photo && (
                    <img src={formData.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm" />
                  )}
                  <label className="flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl px-4 py-3 cursor-pointer hover:border-green-400 transition-all">
                    <span className="text-sm font-medium text-green-600">
                      {formData.photo ? "Change Photo" : "Upload Photo"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) { toast.error("File is too large. Max 5MB."); return; }
                        const uploadPromise = fetch("/api/upload", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ filename: file.name, contentType: file.type })
                        })
                        .then(res => res.json())
                        .then(async data => {
                          if (data.url) {
                            await fetch(data.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
                            return data.publicUrl;
                          } else if (data.success && data.fileUrl) {
                            return data.fileUrl;
                          } else {
                            return new Promise((resolve) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target?.result); reader.readAsDataURL(file); });
                          }
                        });
                        toast.promise(uploadPromise, {
                          loading: "Uploading photo...",
                          success: (url) => { setFormData({ ...formData, photo: url as string }); return "Photo uploaded successfully!"; },
                          error: "Failed to upload photo"
                        });
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  First Name {result.firstName ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.firstName ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.firstName}</div>
                ) : (
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Last Name {result.lastName ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.lastName ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.lastName}</div>
                ) : (
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Middle Name {result.middleName ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.middleName ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.middleName}</div>
                ) : (
                  <input type="text" value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Gender {result.gender ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.gender ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.gender}</div>
                ) : (
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none bg-white">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Email Address {result.email ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.email ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.email}</div>
                ) : (
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Phone Number {result.phone ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.phone ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.phone}</div>
                ) : (
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Department / MDA {result.department ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.department ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.department}</div>
                ) : (
                  <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Designation {result.designation ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {result.designation ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{result.designation}</div>
                ) : (
                  <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* State of Origin */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  State of Origin {(result as any)?.stateOfOrigin ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.stateOfOrigin ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.stateOfOrigin}</div>
                ) : (
                  <input type="text" value={formData.stateOfOrigin} onChange={(e) => setFormData({...formData, stateOfOrigin: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* LGA */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  LGA {(result as any)?.lga ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.lga ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.lga}</div>
                ) : (
                  <input type="text" value={formData.lga} onChange={(e) => setFormData({...formData, lga: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nationality {(result as any)?.nationality ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.nationality ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.nationality}</div>
                ) : (
                  <input type="text" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* File No */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  File Number {(result as any)?.fileNo ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.fileNo ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.fileNo}</div>
                ) : (
                  <input type="text" value={formData.fileNo} onChange={(e) => setFormData({...formData, fileNo: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Rank */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Rank {(result as any)?.rank ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.rank ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.rank}</div>
                ) : (
                  <input type="text" value={formData.rank} onChange={(e) => setFormData({...formData, rank: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Cadre */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Cadre {(result as any)?.cadre ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.cadre ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.cadre}</div>
                ) : (
                  <input type="text" value={formData.cadre} onChange={(e) => setFormData({...formData, cadre: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Bank Name {(result as any)?.bankName ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.bankName ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.bankName}</div>
                ) : (
                  <input type="text" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Account Number {(result as any)?.accountNumber ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.accountNumber ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.accountNumber}</div>
                ) : (
                  <input type="text" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>

              {/* BVN */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  BVN {(result as any)?.bvn ? <span className="text-amber-600 ml-1">&#x1F512; locked</span> : <span className="text-green-600 ml-1">(editable)</span>}
                </label>
                {(result as any)?.bvn ? (
                  <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">{(result as any)?.bvn}</div>
                ) : (
                  <input type="text" value={formData.bvn} onChange={(e) => setFormData({...formData, bvn: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none" />
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={isSubmittingForm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00894F] text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm"
              >
                {isSubmittingForm && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NIN Verification Overlay / Form Review */}
      {showNinModal && ninData && (
        <div className="w-full max-w-2xl mt-6 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
          <div className="px-8 py-6 border-b border-slate-100 bg-[#00894F] text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">Identity Verification</h2>
              <p className="text-green-100 text-sm opacity-90 mt-1">Review your auto-filled details</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-green-200 opacity-50" />
          </div>

          <div className="p-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">NIN Verified Successfully via NetApps!</p>
                <p className="text-xs text-green-700 mt-1">Please review the auto-filled data from NIMC before saving your profile.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none bg-white"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setNinData(null); setShowNinModal(false); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndSave}
                disabled={isSubmittingForm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00894F] text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm"
              >
                {isSubmittingForm && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm & Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-only Status Report Document */}
      {result && (
        <div id="print-status-report" className="print-only-container p-8 font-sans max-w-4xl mx-auto">
          <div className="flex items-center gap-4 border-b-2 border-green-700 pb-4 mb-6 text-left">
            {/* eslint-disable-next-html-element-warnings, @next/next/no-img-element */}
            <img src={appLogo || "/images/tsu-logo.png"} alt="System Logo" className="h-14 w-14 object-contain shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-green-800">{appName || "TARABA STATE GOVERNMENT"}</h1>
              <p className="text-sm text-slate-600">Staff Onboarding & Verification Portal — Verification Status Receipt</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Registration Number</p>
            <p className="text-2xl font-bold text-green-700 tracking-widest mt-1">{result.registrationNo}</p>
            <p className="text-xs text-slate-500 mt-1">Status: <strong>{result.status === 'Self-Verified' ? 'NIN Verified - Pending Admin Approval' : result.status}</strong></p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <table className="w-full text-xs border-collapse">
              <tbody>
                {[
                  ["Full Name", `${result.firstName} ${result.middleName || ""} ${result.lastName}`.trim()],
                  ["Email Address", result.email],
                  ["Phone Number", result.phone || "—"],
                  ["Gender", result.gender || "—"],
                  ["Date of Birth", result.birthdate ? new Date(result.birthdate).toLocaleDateString() : "—"],
                  ["State of Origin", result.stateOfOrigin || "—"],
                  ["LGA of Origin", result.lgaOfOrigin || result.lga || "—"],
                  ["Nationality", result.nationality || "—"],
                  ["BVN", result.bvn || "—"],
                ].map(([lbl, val], idx) => (
                  <tr key={lbl} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                    <td className="py-2.5 px-3 font-semibold text-slate-600 border border-slate-200 w-1/2">{lbl}</td>
                    <td className="py-2.5 px-3 text-slate-900 border border-slate-200">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <table className="w-full text-xs border-collapse">
              <tbody>
                {[
                  ["Department / MDA", result.department || "—"],
                  ["Designation", result.designation || "—"],
                  ["Grade Level", result.grade || "—"],
                  ["Cadre", result.cadre || "—"],
                  ["Current Station", result.currentStation || "—"],
                  ["Highest Qualification", result.highestQualification || "—"],
                  ["Subject Taught", result.subjectTaught || "—"],
                  ["Date of 1st Appt", result.dateOfFirstAppointment ? new Date(result.dateOfFirstAppointment).toLocaleDateString() : "—"],
                  ["Date of Last Promo", result.dateOfLastPromotion ? new Date(result.dateOfLastPromotion).toLocaleDateString() : "—"],
                ].map(([lbl, val], idx) => (
                  <tr key={lbl} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                    <td className="py-2.5 px-3 font-semibold text-slate-600 border border-slate-200 w-1/2">{lbl}</td>
                    <td className="py-2.5 px-3 text-slate-900 border border-slate-200">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {result.ninVerified ? (
            <div className="mt-8 border border-green-200 bg-green-50 rounded-xl p-4 text-center">
               <p className="font-bold text-green-800 text-sm">Verification Successful</p>
               <p className="text-xs text-green-700 mt-1">This document confirms that the staff member has successfully verified their National Identity Number (NIN) on the portal.</p>
            </div>
          ) : (
            <div className="mt-8 border border-amber-200 bg-amber-50 rounded-xl p-4 text-center">
               <p className="font-bold text-amber-800 text-sm">Verification Pending</p>
               <p className="text-xs text-amber-700 mt-1">This staff member's profile is currently imported but their NIN is not yet verified. Verification is required to proceed.</p>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-8">
            © {new Date().getFullYear()} Taraba State Verification Portal. Official Computer-Generated Document.
          </p>
        </div>
      )}

      <style jsx global>{`
        .print-only-container {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-status-report, #print-status-report *, #print-status-report img {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-status-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5 break-words">{value}</p>
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
