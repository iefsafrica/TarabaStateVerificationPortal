"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, BadgeCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const steps = [
  { id: 1, label: "Verification" },
  { id: 2, label: "Personal Information" },
  { id: 3, label: "Employment Information" },
  { id: 4, label: "Document Upload" },
  { id: 5, label: "Review & Submit" },
];

type FormData = {
  bvn: string;
  nin: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  department: string;
  designation: string;
  employeeId: string;
  dateOfEmployment: string;
  grade: string;
  documents: File[];
  ninData?: Record<string, string>;
};

const initialData: FormData = {
  bvn: "",
  nin: "",
  firstName: "",
  lastName: "",
  middleName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  department: "",
  designation: "",
  employeeId: "",
  dateOfEmployment: "",
  grade: "",
  documents: [],
};

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // NIN Verification state
  const [ninVerified, setNinVerified] = useState(false);
  const [isVerifyingNin, setIsVerifyingNin] = useState(false);
  const userRef = useState(`reg-${Date.now()}`)[0];

  const handleVerifyNin = () => {
    if (!formData.nin || formData.nin.length !== 11) {
      toast.error("Please enter your 11-digit NIN before verifying.");
      return;
    }

    setIsVerifyingNin(true);

    // Poll until KycWidget is available (up to 2 seconds)
    let attempts = 0;
    const tryLaunch = () => {
      if ((window as any).KycWidget) {
        (window as any).KycWidget.init({
          publicKey: process.env.NEXT_PUBLIC_NETAPPS_PUBLIC_KEY || "NA_PUB_PROD-ec7d8308578d9a23909acdd53978ef9e",
          userRef,
          slug: "ippis_nin_verification",
          name: formData.firstName ? `${formData.firstName} ${formData.lastName}`.trim() : "Applicant",
          levelSlug: "tier_1",
          display: "modal",
          environment: "live",
          callbacks: {
            onSuccess: async () => {
              toast.success("Verification successful! Fetching data...");
              try {
                const res = await fetch(`/api/kyc-status?userRef=${userRef}&slug=ippis_nin_verification`);
                const data = await res.json();
                if (data && !data.error) {
                  setNinVerified(true);
                  setFormData(prev => ({
                    ...prev,
                    nin: data.nin || data.NIN || prev.nin,
                    firstName: data.firstName || data.firstname || prev.firstName,
                    lastName: data.lastName || data.surname || prev.lastName,
                    dateOfBirth: data.birthdate || data.dob || prev.dateOfBirth,
                    ninData: data,
                  }));
                  toast.success("NIN verified and data auto-filled.");
                } else {
                  toast.error("Failed to fetch verified data.");
                }
              } catch {
                toast.error("Error communicating with server.");
              } finally {
                setIsVerifyingNin(false);
              }
            },
            onError: ({ message }: any) => {
              toast.error(`Verification failed: ${message}`);
              setIsVerifyingNin(false);
            },
            onClose: () => {
              setIsVerifyingNin(false);
            },
          }
        });
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryLaunch, 200);
      } else {
        toast.error("KYC Widget failed to load. Please refresh the page and try again.");
        setIsVerifyingNin(false);
      }
    };

    tryLaunch();
  };

  const update = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!formData.bvn || formData.bvn.length !== 11) { toast.error("Please enter a valid 11-digit BVN"); return false; }
      if (!formData.nin || formData.nin.length !== 11) { toast.error("Please enter a valid 11-digit NIN"); return false; }
      if (!ninVerified) { toast.error("Please verify your NIN before continuing."); return false; }
    }
    if (currentStep === 2) {
      if (!formData.firstName.trim()) { toast.error("First name is required"); return false; }
      if (!formData.lastName.trim()) { toast.error("Last name is required"); return false; }
      if (!formData.email.trim()) { toast.error("Email is required"); return false; }
      if (!formData.phone.trim()) { toast.error("Phone number is required"); return false; }
    }
    if (currentStep === 3) {
      if (!formData.department.trim()) { toast.error("Department is required"); return false; }
      if (!formData.designation.trim()) { toast.error("Designation is required"); return false; }
      if (!formData.employeeId.trim()) { toast.error("Employee ID is required"); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
    toast.success("Registration submitted successfully!");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #fdf4ff 100%)" }}>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-slate-500 text-sm">Your information has been submitted for verification. You will be notified once it is reviewed.</p>
        </div>
        <footer className="mt-8 flex items-center gap-3 text-sm text-slate-500">
          <Image src="/images/tsu-logo.png" alt="Taraba State Logo" width={32} height={32} className="rounded-full" />
          © 2026 Taraba State Verification Portal. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #fdf4ff 100%)" }}>
      <Script src="https://kyc-verify-v2.netapps.ng/embed.js" strategy="afterInteractive" />
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-3xl">

          {/* Stepper */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex items-start justify-between">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-start flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step.id < currentStep
                        ? "bg-green-600 text-white"
                        : step.id === currentStep
                        ? "bg-green-600 text-white ring-4 ring-green-100"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {step.id < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                    </div>
                    <span className={`text-xs mt-2 text-center leading-tight max-w-[70px] ${
                      step.id === currentStep ? "text-green-700 font-semibold" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-5 mx-1 transition-all ${step.id < currentStep ? "bg-green-500" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

            {/* Step 1: Identity Verification */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Step 1: Identity Verification</h2>
                <p className="text-slate-500 mb-6 text-sm">Provide your Bank Verification Number (BVN) and National Identification Number (NIN).</p>
                <div className="bg-slate-50 rounded-xl p-6 space-y-6 border border-slate-100">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Bank Verification Number (BVN)</label>
                    <input
                      type="text"
                      maxLength={11}
                      value={formData.bvn}
                      onChange={e => update("bvn", e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter your 11-digit BVN"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">National Identification Number (NIN)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          maxLength={11}
                          value={formData.nin}
                          onChange={e => update("nin", e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter your 11-digit NIN"
                          readOnly={ninVerified}
                          className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 transition-all pr-10 ${
                            ninVerified
                              ? "border-green-400 bg-green-50 text-green-800 focus:ring-green-500/20 focus:border-green-500"
                              : "border-slate-200 focus:ring-green-500/20 focus:border-green-500"
                          }`}
                        />
                        {ninVerified && (
                          <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyNin}
                        disabled={isVerifyingNin || ninVerified || formData.nin.length !== 11}
                        className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                          ninVerified
                            ? "bg-green-100 text-green-700 cursor-default border border-green-300"
                            : "bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        {isVerifyingNin ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                        ) : ninVerified ? (
                          <><ShieldCheck className="h-4 w-4" /> Verified</>
                        ) : (
                          "Verify NIN"
                        )}
                      </button>
                    </div>
                    {ninVerified && (
                      <p className="text-xs text-green-600 mt-1.5 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> NIN verified successfully. Your details have been auto-filled.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <span className="font-semibold">Important: </span>
                    Please enter correct BVN and NIN. These cannot be changed later.
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Step 2: Personal Information</h2>
                <p className="text-slate-500 mb-6 text-sm">Provide your personal details as they appear on your official documents.</p>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">First Name</label>
                      <input type="text" value={formData.firstName} onChange={e => update("firstName", e.target.value)} placeholder="e.g., John" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Middle Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input type="text" value={formData.middleName} onChange={e => update("middleName", e.target.value)} placeholder="e.g., David" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Last Name</label>
                      <input type="text" value={formData.lastName} onChange={e => update("lastName", e.target.value)} placeholder="e.g., Smith" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Email Address</label>
                      <input type="email" value={formData.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Phone Number</label>
                      <input type="tel" value={formData.phone} onChange={e => update("phone", e.target.value)} placeholder="e.g., 08012345678" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Date of Birth</label>
                      <input type="date" value={formData.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Gender</label>
                      <select value={formData.gender} onChange={e => update("gender", e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Residential Address</label>
                    <textarea value={formData.address} onChange={e => update("address", e.target.value)} placeholder="Enter your full residential address" rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment Information */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Step 3: Employment Information</h2>
                <p className="text-slate-500 mb-6 text-sm">Provide your current employment details in the Taraba State civil service.</p>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Employee ID</label>
                      <input type="text" value={formData.employeeId} onChange={e => update("employeeId", e.target.value)} placeholder="Enter your Employee ID" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Department/Ministry</label>
                      <input type="text" value={formData.department} onChange={e => update("department", e.target.value)} placeholder="e.g., Ministry of Finance" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Designation</label>
                      <input type="text" value={formData.designation} onChange={e => update("designation", e.target.value)} placeholder="e.g., Senior Accountant" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Grade Level</label>
                      <select value={formData.grade} onChange={e => update("grade", e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                        <option value="">Select grade level</option>
                        {Array.from({ length: 17 }, (_, i) => i + 1).map(g => (
                          <option key={g} value={`GL-${g}`}>GL-{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Date of Employment</label>
                    <input type="date" value={formData.dateOfEmployment} onChange={e => update("dateOfEmployment", e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Step 4: Document Upload</h2>
                <p className="text-slate-500 mb-6 text-sm">Upload supporting documents for identity and employment verification.</p>
                <div className="space-y-4">
                  {["Passport Photograph", "Letter of First Appointment", "National ID / Voter's Card / Driver's License"].map(docType => (
                    <label key={docType} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 cursor-pointer hover:border-green-400 transition-all group">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{docType}</div>
                        <div className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG (max 5MB)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium group-hover:underline">Upload</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                  <span>Ensure all uploaded documents are clear and legible. Blurry or incomplete documents may result in rejection.</span>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Step 5: Review & Submit</h2>
                <p className="text-slate-500 mb-6 text-sm">Please review your information before submitting for verification.</p>
                <div className="space-y-6">
                  <ReviewSection title="Identity" items={[
                    { label: "BVN", value: formData.bvn || "—" },
                    { label: "NIN", value: formData.nin || "—" },
                  ]} />
                  <ReviewSection title="Personal" items={[
                    { label: "Full Name", value: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim() || "—" },
                    { label: "Email", value: formData.email || "—" },
                    { label: "Phone", value: formData.phone || "—" },
                    { label: "Date of Birth", value: formData.dateOfBirth || "—" },
                    { label: "Gender", value: formData.gender || "—" },
                  ]} />
                  <ReviewSection title="Employment" items={[
                    { label: "Employee ID", value: formData.employeeId || "—" },
                    { label: "Department", value: formData.department || "—" },
                    { label: "Designation", value: formData.designation || "—" },
                    { label: "Grade Level", value: formData.grade || "—" },
                  ]} />
                </div>
                <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                  <span>By submitting, you confirm that all information provided is accurate and complete to the best of your knowledge.</span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button onClick={prevStep} className="px-6 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors">
                  ← Previous
                </button>
              ) : <div />}

              {currentStep < 5 ? (
                <button onClick={nextStep} className="px-8 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm">
                  {currentStep === 1 ? "Verify & Continue" : "Next Step"} →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isLoading} className="px-8 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Registration
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 flex items-center justify-center gap-3 text-sm text-slate-500">
        <Image src="/images/tsu-logo.png" alt="Taraba State Logo" width={32} height={32} className="rounded-full" />
        © 2026 Taraba State Verification Portal. All rights reserved.
      </footer>
    </div>
  );
}

function ReviewSection({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.label}>
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
