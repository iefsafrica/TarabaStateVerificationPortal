"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
// @ts-ignore
import naija from "naija-state-local-government";
import Script from "next/script";

// Helper component for standard inputs moved outside to prevent re-renders causing focus loss
const InputGroup = ({ label, name, value, onChange, type = "text", placeholder, required = false }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] focus:border-transparent transition-colors"
    />
  </div>
);

export default function AddEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    title: "",
    email: "",
    telephone: "",
    birthdate: "",
    nin: "",
    gender: "",
    maritalStatus: "",
    department: "",
    position: "",
    stateOfOrigin: "",
    residentialAddress: "",
    stateOfResidence: "",
    lga: "",
    profession: "",
    nokName: "",
    nokRelationship: "",
    nokPhone: "",
    nokAddress: "",
    employmentId: "",
    serviceNo: "",
    fileNo: "",
    rank: "",
    organization: "",
    employmentType: "",
    probationPeriod: "",
    workLocation: "",
    dateOfFirstAppointment: "",
    salaryStructure: "",
    gradeLevel: "",
    step: "",
    cadre: "",
    bankName: "",
    accountNumber: "",
    nuban: "",
    pfaName: "",
    rsaPin: "",
    educationalBackground: "",
    certifications: "",
  });

  const [ninVerified, setNinVerified] = useState(false);
  const [ninData, setNinData] = useState<any>(null);
  // Ensure stable userRef per component lifecycle
  const userRef = useState(`emp-${Date.now()}`)[0];

  const handleVerifyNin = () => {
    if (!(window as any).KycWidget) {
      toast.error("KYC Widget not loaded yet. Please try again in a moment.");
      return;
    }

    const handle = (window as any).KycWidget.init({
      publicKey: process.env.NEXT_PUBLIC_NETAPPS_PUBLIC_KEY || "NA_PUB_PROD-ec7d8308578d9a23909acdd53978ef9e",
      userRef,
      slug: "ippis_nin_verification",
      name: "Taraba Staff", // We could pass formData.firstName if we wanted
      levelSlug: "tier_1",
      display: "modal",
      environment: "live", // Required when using PROD keys
      callbacks: {
        onSuccess: async () => {
          toast.success("Verification successful! Fetching data...");
          try {
            const res = await fetch(`/api/kyc-status?userRef=${userRef}&slug=ippis_nin_verification`);
            const data = await res.json();
            
            if (data && !data.error) {
              setNinVerified(true);
              setNinData(data);
              
              // Map verified data into form safely if available
              setFormData(prev => ({
                ...prev,
                nin: data.nin || data.NIN || prev.nin,
                firstName: data.firstName || data.firstname || prev.firstName,
                lastName: data.lastName || data.surname || prev.lastName,
                birthdate: data.birthdate || data.dob || prev.birthdate,
              }));
              toast.success("NIN Data securely fetched and auto-filled.");
            } else {
              toast.error("Failed to fetch verified data from our server.");
            }
          } catch (e) {
            toast.error("Error communicating with server.");
          }
        },
        onError: ({ message }: any) => {
          toast.error(`Verification error: ${message}`);
        },
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset LGA if State of Residence changes
      if (name === "stateOfResidence") {
        newData.lga = "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        ninVerified,
        ninData
      };

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Employee added successfully!");
        router.push("/admin/employees");
      } else {
        toast.error(data.error || "Failed to add employee.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in-up">
      <Script src="https://kyc-verify-v2.netapps.ng/embed.js" strategy="lazyOnload" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/employees" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the employee details expected by the backend payload.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/employees" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
            Cancel
          </Link>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#00894F] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Employee
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Personal Details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Personal Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter first name" required />
            <InputGroup label="Surname" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter surname" required />
            <InputGroup label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Enter middle name" />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <select name="title" value={formData.title} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr</option>
                <option value="Prof">Prof</option>
              </select>
            </div>

            <InputGroup label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter email" required />
            <InputGroup label="Telephone Number" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Enter phone number" required />
            <InputGroup label="Birthdate" name="birthdate" value={formData.birthdate} onChange={handleChange} type="date" required />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex justify-between">
                <span>NIN <span className="text-red-500">*</span></span>
                {ninVerified ? (
                  <span className="text-green-600 text-xs flex items-center gap-1 font-bold"><ShieldCheck className="h-3 w-3"/> Verified</span>
                ) : (
                  <span className="text-amber-600 text-xs flex items-center gap-1 font-bold"><ShieldAlert className="h-3 w-3"/> Unverified</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="nin"
                  required
                  value={formData.nin}
                  onChange={handleChange}
                  placeholder="Enter NIN"
                  className={`w-full h-10 px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] focus:border-transparent transition-colors ${ninVerified ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}
                />
                {!ninVerified && (
                  <button 
                    type="button" 
                    onClick={handleVerifyNin}
                    className="whitespace-nowrap px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Verify NIN
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Marital Status <span className="text-red-500">*</span></label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select marital status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
              <select name="department" value={formData.department} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select department</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="IT">IT</option>
                <option value="Operations">Operations</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <InputGroup label="Position" name="position" value={formData.position} onChange={handleChange} placeholder="Enter position" required />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">State of Origin <span className="text-red-500">*</span></label>
              <select name="stateOfOrigin" value={formData.stateOfOrigin} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select state of origin</option>
                {naija.states().map((state: string) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="lg:col-span-2">
              <InputGroup label="Residential Address" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} placeholder="Enter residential address" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">State of Residence <span className="text-red-500">*</span></label>
              <select name="stateOfResidence" value={formData.stateOfResidence} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select state</option>
                {naija.states().map((state: string) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">LGA <span className="text-red-500">*</span></label>
              <select name="lga" value={formData.lga} onChange={handleChange} required disabled={!formData.stateOfResidence} className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white disabled:bg-gray-50 disabled:text-gray-400">
                <option value="">{formData.stateOfResidence ? "Select LGA" : "Select state first"}</option>
                {formData.stateOfResidence && naija.lgas(formData.stateOfResidence)?.lgas?.map((lga: string) => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>

            <InputGroup label="Profession" name="profession" value={formData.profession} onChange={handleChange} placeholder="Enter profession" />
          </div>
        </section>

        {/* Next of Kin */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Next of Kin</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputGroup label="Next of Kin Name" name="nokName" value={formData.nokName} onChange={handleChange} placeholder="Enter next of kin name" required />
            <InputGroup label="Relationship" name="nokRelationship" value={formData.nokRelationship} onChange={handleChange} placeholder="Enter relationship" required />
            <InputGroup label="Phone Number" name="nokPhone" value={formData.nokPhone} onChange={handleChange} placeholder="Enter next of kin phone number" required />
            <div className="lg:col-span-3">
              <InputGroup label="Address" name="nokAddress" value={formData.nokAddress} onChange={handleChange} placeholder="Enter next of kin address" required />
            </div>
          </div>
        </section>

        {/* Employment Record */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Employment Record</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputGroup label="Employment ID No" name="employmentId" value={formData.employmentId} onChange={handleChange} placeholder="Enter employment ID number" required />
            <InputGroup label="Service No" name="serviceNo" value={formData.serviceNo} onChange={handleChange} placeholder="Enter service number" />
            <InputGroup label="File No" name="fileNo" value={formData.fileNo} onChange={handleChange} placeholder="Enter file number" />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Rank/Position <span className="text-red-500">*</span></label>
              <select name="rank" value={formData.rank} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select rank/position</option>
                <option value="Junior Officer">Junior Officer</option>
                <option value="Senior Officer">Senior Officer</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
              </select>
            </div>
            
            <InputGroup label="Organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="Enter organization" required />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Employment Type <span className="text-red-500">*</span></label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select employment type</option>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Probation Period <span className="text-red-500">*</span></label>
              <select name="probationPeriod" value={formData.probationPeriod} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select probation period</option>
                <option value="None">None</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Employment Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputGroup label="Work Location" name="workLocation" value={formData.workLocation} onChange={handleChange} placeholder="Enter work location" required />
            <InputGroup label="Date of First Appointment" name="dateOfFirstAppointment" value={formData.dateOfFirstAppointment} onChange={handleChange} type="date" required />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Salary Structure <span className="text-red-500">*</span></label>
              <select name="salaryStructure" value={formData.salaryStructure} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select salary structure</option>
                <option value="CONPSS">CONPSS</option>
                <option value="CONMESS">CONMESS</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Grade Level</label>
              <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select salary structure first</option>
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Step</label>
              <select name="step" value={formData.step} onChange={handleChange} className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select salary structure first</option>
                <option value="Step 1">Step 1</option>
                <option value="Step 2">Step 2</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Cadre</label>
              <select name="cadre" value={formData.cadre} onChange={handleChange} className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select salary structure first</option>
                <option value="Admin">Admin</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
          </div>
        </section>

        {/* Banking and Pension */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Banking and Pension Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Bank Name <span className="text-red-500">*</span></label>
              <select name="bankName" value={formData.bankName} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="First Bank">First Bank</option>
                <option value="GTBank">GTBank</option>
                <option value="UBA">UBA</option>
                <option value="Zenith Bank">Zenith Bank</option>
              </select>
            </div>

            <InputGroup label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Enter account number" required />
            <InputGroup label="NUBAN Account Number" name="nuban" value={formData.nuban} onChange={handleChange} placeholder="Enter NUBAN account number" />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">PFA Name <span className="text-red-500">*</span></label>
              <select name="pfaName" value={formData.pfaName} onChange={handleChange} required className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] bg-white">
                <option value="">Select PFA</option>
                <option value="ARM Pension">ARM Pension</option>
                <option value="Stanbic IBTC Pension">Stanbic IBTC Pension</option>
                <option value="Premium Pension">Premium Pension</option>
              </select>
            </div>

            <InputGroup label="RSA PIN" name="rsaPin" value={formData.rsaPin} onChange={handleChange} placeholder="Enter RSA PIN" required />
          </div>
        </section>

        {/* Education */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Educational Background and Certifications</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Educational Background</label>
              <textarea
                name="educationalBackground"
                value={formData.educationalBackground}
                onChange={handleChange}
                placeholder="Enter educational background"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Certifications</label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                placeholder="Enter certifications"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F] focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00894F] text-white rounded-md text-sm font-medium hover:bg-[#007040] transition-colors disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Saving...' : 'Save Employee'}
          </button>
        </div>

      </form>
    </div>
  );
}
