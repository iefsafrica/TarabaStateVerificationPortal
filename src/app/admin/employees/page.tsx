"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Database, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Plus, 
  Download, 
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Settings,
  Upload,
  Trash2,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  joinDate: string;
  documentCount: number;
};

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState("Staff");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0, selfVerified: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStatus, setExportStatus] = useState("Active"); // Default to Active/Verified
  const [exportPeriod, setExportPeriod] = useState("All Time");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/employees");
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
        setStats(json.stats);
      }
    } catch (error) {
      console.error("Failed to load employees", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    // 1. Filter by Active Tab
    if (activeTab === "Staff" && emp.status !== "Active") return false;
    if (activeTab === "Pending Staff" && emp.status !== "Pending") return false;
    if (activeTab === "Self-Verified" && emp.status !== "Self-Verified") return false;

    // 2. Filter by Search Query
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(lowerQuery) ||
      emp.lastName.toLowerCase().includes(lowerQuery) ||
      (emp.department && emp.department.toLowerCase().includes(lowerQuery)) ||
      (emp.position && emp.position.toLowerCase().includes(lowerQuery)) ||
      (emp.email && emp.email.toLowerCase().includes(lowerQuery))
    );
  });

  const handleVerify = async (id: string) => {
    try {
      toast.loading("Verifying employee and sending email...", { id: "verify" });
      const res = await fetch(`/api/employees/${id}/verify`, { method: "POST" });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Employee verified and email sent successfully", { id: "verify" });
        fetchEmployees(); // Refresh data
      } else {
        toast.error(`Verification failed: ${json.error}`, { id: "verify" });
      }
    } catch (err) {
      toast.error("An error occurred during verification", { id: "verify" });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      toast.loading("Approving employee profile and sending email...", { id: "approve" });
      const res = await fetch(`/api/employees/${id}/approve`, { method: "POST" });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Employee approved and email sent successfully", { id: "approve" });
        fetchEmployees();
      } else {
        toast.error(`Approval failed: ${json.error}`, { id: "approve" });
      }
    } catch (err) {
      toast.error("An error occurred during approval", { id: "approve" });
    }
  };

  const handleClearPending = async () => {
    if (!confirm("Are you sure you want to clear all pending employees? This cannot be undone.")) return;
    
    try {
      toast.loading("Clearing pending employees...", { id: "clear" });
      const res = await fetch(`/api/employees/pending`, { method: "DELETE" });
      const json = await res.json();
      
      if (json.success) {
        toast.success(`Cleared ${json.count} pending employees.`, { id: "clear" });
        fetchEmployees();
      } else {
        toast.error("Failed to clear pending employees.", { id: "clear" });
      }
    } catch (err) {
      toast.error("An error occurred.", { id: "clear" });
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      toast.loading("Generating report...", { id: "export" });
      const res = await fetch(`/api/employees/export?status=${encodeURIComponent(exportStatus)}&period=${encodeURIComponent(exportPeriod)}`);
      const json = await res.json();
      
      if (!json.success) {
        toast.error(`Export failed: ${json.error}`, { id: "export" });
        return;
      }

      const data = json.data;
      if (!data || data.length === 0) {
        toast.error("No records found for the selected criteria.", { id: "export" });
        return;
      }

      // Convert to Excel
      const XLSX = await import("xlsx");
      
      // Select fields to export
      const exportData = data.map((emp: any) => ({
        "Registration Number": emp.registrationNo || emp.nin,
        "First Name": emp.firstName,
        "Middle Name": emp.middleName,
        "Last Name": emp.lastName,
        "Email": emp.email,
        "Phone": emp.phone || emp.telephone,
        "Gender": emp.gender,
        "Date of Birth": emp.birthdate ? new Date(emp.birthdate).toLocaleDateString() : "",
        "State of Origin": emp.stateOfOrigin,
        "LGA of Origin": emp.lgaOfOrigin,
        "Department": emp.department,
        "Position / Designation": emp.designation || emp.position,
        "Grade Level": emp.grade || emp.gradeLevel,
        "Status": emp.status,
        "NIN Verified": emp.ninVerified ? "Yes" : "No",
        "Date Verified / Updated": new Date(emp.updatedAt).toLocaleDateString(),
        "Date of First Appointment": emp.dateOfFirstAppointment ? new Date(emp.dateOfFirstAppointment).toLocaleDateString() : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Report");
      
      // Generate filename
      const safeStatus = exportStatus.replace(" ", "_");
      const safePeriod = exportPeriod.replace(" ", "_");
      const fileName = `Taraba_Staff_Report_${safeStatus}_${safePeriod}_${new Date().toISOString().split("T")[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      toast.success("Report exported successfully!", { id: "export" });
      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred during export.", { id: "export" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
      
      {/* Top Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          {["Staff", "Pending Staff", "Self-Verified", "Import Staff"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#00894F] text-white"
                  : "text-green-700 hover:bg-green-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Initialize DB Button */}
        <button className="flex items-center gap-2 bg-[#00894F] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm">
          <Database className="h-4 w-4" />
          Initialize Database
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center h-32">
          <h3 className="text-gray-500 font-medium text-sm mb-4">Total Employees</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center h-32">
          <h3 className="text-gray-500 font-medium text-sm mb-4">Active (Current Page)</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.active}</span>
          </div>
        </div>

        {/* Inactive */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center h-32">
          <h3 className="text-gray-500 font-medium text-sm mb-4">Inactive (Current Page)</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
              <UserX className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.inactive}</span>
          </div>
        </div>

        {/* Self-Verified Queue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center h-32">
          <h3 className="text-gray-500 font-medium text-sm mb-4">Self-Verified Queue</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.selfVerified}</span>
          </div>
        </div>

        {/* Pending Queue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center h-32">
          <h3 className="text-gray-500 font-medium text-sm mb-4">Pending Queue</h3>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        
        {/* Panel Header */}
        <div className="p-6 sm:p-8 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activeTab}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and view {activeTab.toLowerCase()} in the system.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === "Import Staff" ? (
              <>
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsImporting(true);
                    try {
                      // Dynamically import xlsx to avoid bloating initial load
                      const XLSX = await import("xlsx");
                      
                      const data = await file.arrayBuffer();
                      const workbook = XLSX.read(data, { type: "array" });
                      // Search through all sheets to find the one with our data
                      let headerRowIndex = -1;
                      let rows: any[] = [];
                      let debugInfo = "";
                      
                      for (const sheetName of workbook.SheetNames) {
                        const ws = workbook.Sheets[sheetName];
                        const sheetRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
                        
                        for (let r = 0; r < Math.min(20, sheetRows.length); r++) {
                          const rowCells = (sheetRows[r] || []).map((c: any) => String(c).toLowerCase().replace(/[^a-z0-9]/g, ''));
                          
                          // Look for exact cell matches of our known headers
                          if (
                            rowCells.includes("fullname") || 
                            rowCells.includes("currentstationnameofschool") ||
                            rowCells.includes("dateofbirth") ||
                            rowCells.includes("phonenumber")
                          ) {
                            headerRowIndex = r;
                            rows = sheetRows;
                            break;
                          }
                        }
                        if (headerRowIndex !== -1) break;
                        debugInfo += `[${sheetName}: no headers found] `;
                      }
                      
                      if (headerRowIndex === -1 || !rows || rows.length < 2) {
                        toast.error(`Could not find a valid data table in any sheet. ${debugInfo}`);
                        setIsImporting(false);
                        return;
                      }

                      // Row `headerRowIndex` is the headers
                      const headers = (rows[headerRowIndex] || []).map((h: any) => String(h).toLowerCase().replace(/[^a-z0-9]/g, ''));
                      
                      let imported = 0;
                      let lastApiError = "";
                      
                      for (let i = headerRowIndex + 1; i < rows.length; i++) {
                        // Calculate progress
                        setUploadProgress(Math.round(((i - headerRowIndex) / (rows.length - headerRowIndex)) * 100));

                        const values = rows[i] || [];
                        if (values.length === 0) continue; // Skip empty rows
                        
                        const empData: any = {};
                        headers.forEach((key: string, idx: number) => {
                          const rawVal = values[idx];
                          const val = rawVal != null ? String(rawVal).trim() : "";
                          
                          if (key === "fullname") {
                             const parts = val.split(" ");
                             empData.firstName = parts[0] || "Unknown";
                             empData.lastName = parts.slice(1).join(" ") || "Unknown";
                          }
                          else if (key === "emailaddress" || key === "email") empData.email = val;
                          else if (key === "currentstationnameofschool" || key.includes("currentstation")) empData.currentStation = val;
                          else if (key === "sex" || key === "gender") empData.gender = val;
                          else if (key === "cadre") empData.cadre = val;
                          else if (key === "dateofbirth" || key === "dob") {
                            // Store raw value; serial fix applied after loop
                            empData._rawBirthdate = rawVal;
                          }
                          else if (key === "dateoflastpromotion") empData.dateOfLastPromotion = val;
                          else if (key === "localgovernmentoforigin" || key === "lgaoforigin") empData.lgaOfOrigin = val;
                          else if (key === "ntionality" || key === "nationality") empData.nationality = val;
                          else if (key === "phonenumber" || key === "phone") empData.telephone = val;
                          else if (key === "rank") empData.rank = val;
                          else if (key === "highestqualifications" || key.includes("qualification")) empData.highestQualification = val;
                          else if (key === "stateoforigin") empData.stateOfOrigin = val;
                          else if (key === "gradelevelgl" || key === "gradelevel") empData.gradeLevel = val;
                          else if (key === "subjecttaughtjobspecification" || key.includes("subject")) empData.subjectTaught = val;
                          else if (key === "bank" || key === "bankname") empData.bankName = val;
                          else if (key === "accountnumber") empData.accountNumber = val;
                          else if (key === "bvn") empData.bvn = val;
                          else if (key === "nin" || key === "nationalidentificationnumber") empData.nin = val;
                          else if (key === "lgastandardized") empData.standardizedLga = val;
                          else if (key === "sexstandardized") empData.standardizedSex = val;
                          else if (key === "cadrestandardized") empData.standardizedCadre = val;
                          else if (key === "duplicateflag") empData.duplicateFlag = val;
                          else if (key === "sharedidentifierflag") empData.sharedIdentifierFlag = val;
                          else if (key === "firstname" || key === "first name") empData.firstName = val;
                          else if (key === "lastname" || key === "surname" || key === "last name") empData.lastName = val;

                          // ── Health Facilities columns ──────────────────────────────
                          else if (key === "othername" || key === "other name") empData.middleName = val;
                          else if (key === "maidenname" || key === "maiden name") empData.maidenName = val;
                          else if (key === "title") empData.title = val;
                          else if (key === "maritalstatus" || key === "marital status") empData.maritalStatus = val;
                          else if (key === "areyounigerian" || key === "are you a nigerian" || key === "areyouanigeri") empData.areYouNigerian = val;
                          else if (key === "state") empData.stateOfOrigin = empData.stateOfOrigin || val;
                          else if (key === "lga") empData.lga = val;
                          else if (key === "senatorialwardoforigin" || key === "senatorial ward of origin") empData.senatoralWardOfOrigin = val;
                          else if (key === "wardoforigin" || key === "ward of origin") empData.wardOfOrigin = val;
                          else if (key === "country") empData.country = val;
                          else if (key === "fileempno" || key === "fileno" || key === "file emp no" || key === "empno") empData.fileNo = val;
                          else if (key === "stateofresident" || key === "stateofresidence" || key === "state of res") empData.stateOfResidence = val;
                          else if (key === "lgaofresidence" || key === "lga of re" || key === "lgaofres") empData.lga = empData.lga || val;
                          else if (key === "address" || key === "residentialaddress" || key === "ad") empData.residentialAddress = val;
                          else if (key === "mobileno" || key === "mobile n" || key === "mobilenumber") empData.mobileNo = val;
                          else if (key === "telephone" || key === "telephon") empData.telephone = empData.telephone || val;
                          else if (key === "permanentaddress" || key === "permane" || key === "state perri") empData.permanentAddress = val;
                          else if (key === "permanentstate" || key === "permne") empData.permanentState = val;
                          else if (key === "permanentlga" || key === "lga permne" || key === "lgaperm") empData.permanentLga = val;
                          // Next of Kin
                          else if (key === "nextofkinrelationship" || key === "next of kn") empData.nokRelationship = val;
                          else if (key === "nextofkinname" || key === "next of knext of k") empData.nokName = val;
                          else if (key === "nextofkinphone" || key === "nextofkin r") empData.nokPhone = val;
                          else if (key === "nextofkinaddress") empData.nokAddress = val;
                          // Education
                          else if (key === "institution" || key.includes("institution")) empData.educationalBackground = val;
                          else if (key === "certificate" || key.includes("certificate")) empData.certifications = val;
                          else if (key === "dateofgraduation" || key === "date of graduation") empData.dateOfGraduation = val;
                          // Professional Registration
                          else if (key === "mdcn" || key === "mdcnr" || key === "mdcnrothers" || key.includes("professio")) empData.mdcnRegNo = val;
                          else if (key === "practitioner" || key.includes("practiti")) empData.practitionerType = val;
                          else if (key === "nursespecialization" || key.includes("nursespe") || key.includes("nurse special")) empData.nurseSpecialization = val;
                          else if (key === "issuancedate" || key === "issuance date") empData.licenseIssuanceDate = val;
                          // Appointment
                          else if (key === "appointmenttype" || key === "additional" || key.includes("appointn")) empData.appointmentType = val;
                          else if (key === "presentposting" || key.includes("present f") || key === "present posting") empData.presentPosting = val;
                          else if (key === "currentgradelevel" || key === "current grade") empData.gradeLevel = empData.gradeLevel || val;
                          else if (key === "currentstep" || key === "current step") empData.step = val;
                          else if (key === "dateoffirstappointment" || key === "date of first appointment") {
                            empData._rawDateFirstAppt = rawVal;
                          }
                          else if (key === "dateofconfirmation" || key === "date of confirmation") {
                            empData._rawDateConfirm = rawVal;
                          }
                          else if (key === "dateofpresentappointment" || key === "date of present appointment") {
                            empData._rawDatePresentAppt = rawVal;
                          }
                          // Facility
                          else if (key === "secondary" || key === "facilityname" || key === "facility name") empData.facilityName = val;
                          else if (key === "facilitytype" || key === "facility type") empData.facilityType = val;
                          else if (key === "department" || key === "departm") empData.department = val;
                          else if (key === "branch" || key.includes("branch")) empData.branch = val;
                          // Submission metadata
                          else if (key === "uuid" || key === "submissionid" || key === "l_id") empData.submissionId = val;
                          else if (key === "validation" || key === "validati") empData.validationStatus = val;
                          else if (key === "notes") empData.importNotes = val;
                          else if (key === "_status" || key === "submitte") empData.importSource = val; // save as source, not status
                          else if (key === "_version" || key === "version") empData.importVersion = val;
                          else if (key === "tags") empData.importTags = val;
                          else {
                             empData[key] = val; // fallback
                          }
                        });

                        // ── Helper: safely parse a date (string or Excel serial) ──────
                        const safeParseDate = (raw: any): string | null => {
                          if (raw == null || raw === "") return null;
                          const asNum = Number(raw);
                          if (!isNaN(asNum) && asNum > 0 && asNum < 100000) {
                            // Excel serial number → use XLSX date util
                            const d = XLSX.SSF.parse_date_code(asNum);
                            if (d && d.y > 1900 && d.y < 2100) {
                              return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
                            }
                            return null;
                          }
                          const d = new Date(String(raw));
                          return (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100)
                            ? d.toISOString().split("T")[0]
                            : null;
                        };

                        // ── Fix all date fields ───────────────────────────────────────
                        empData.birthdate = safeParseDate(empData._rawBirthdate);
                        empData.dateOfFirstAppointment = safeParseDate(empData._rawDateFirstAppt);
                        empData.dateOfConfirmation = safeParseDate(empData._rawDateConfirm);
                        empData.dateOfPresentAppointment = safeParseDate(empData._rawDatePresentAppt);
                        // Clean up temp keys
                        delete empData._rawBirthdate;
                        delete empData._rawDateFirstAppt;
                        delete empData._rawDateConfirm;
                        delete empData._rawDatePresentAppt;

                        // ── Always force status to Pending ────────────────────────────
                        empData.status = "Pending";

                        // ── Auto-detect ministry from cadre/department ───────────────
                        if (!empData.ministry) {
                          const healthKeywords = ["nurse", "doctor", "medical", "health", "pharmacist", "laboratory", "midwif", "dental", "community health", "administrative professional", "hospital admin", "clinical"];
                          const cadreStr = (empData.cadre || "").toLowerCase();
                          const deptStr = (empData.department || "").toLowerCase();
                          if (healthKeywords.some(h => cadreStr.includes(h) || deptStr.includes(h))) {
                            empData.ministry = "Health";
                            if (!empData.department || empData.department === "Unassigned") empData.department = "Health Facilities";
                          } else if (empData.currentStation || empData.subjectTaught) {
                            empData.ministry = "Education";
                          }
                        }

                        // Provide dummy email if missing or if it's a generic placeholder like "none", "n/a", "-"
                        const emailVal = (empData.email || "").toLowerCase();
                        if (!emailVal || emailVal === "none" || emailVal === "n/a" || emailVal === "nil" || emailVal === "null" || emailVal === "-" || !emailVal.includes("@")) {
                          empData.email = `imported-${Date.now()}-row${i}@example.com`;
                        }
                        
                        // We must have at least a first name or last name
                        if (empData.firstName || empData.lastName || empData.currentStation) {
                           if (!empData.firstName) empData.firstName = "Unknown";
                           if (!empData.lastName) empData.lastName = "Unknown";

                           const res = await fetch("/api/employees", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify(empData)
                           });
                           
                           if (res.ok) {
                              imported++;
                            } else {
                              const rawText = await res.text();
                              let errMsg = rawText;
                              try { errMsg = JSON.stringify(JSON.parse(rawText)); } catch {}
                              lastApiError = errMsg.substring(0, 300);
                              console.error("Import error for row", i, lastApiError);
                            }
                        }
                      }
                      
                      if (imported === 0) {
                        toast.error(`Imported 0. Error: ${lastApiError || "No rows matched"}. Headers: ${headers.slice(0, 3).join(", ")}`);
                      } else {
                        toast.success(`Successfully imported ${imported} employees!`);
                      }
                      fetchEmployees(); // refresh list
                    } catch (err) {

                      toast.error("Failed to import employees");
                    } finally {
                      setIsImporting(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="relative flex items-center justify-center gap-2 bg-[#00894F] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm text-sm disabled:opacity-80 overflow-hidden w-40"
                >
                  {isImporting && (
                     <div 
                       className="absolute left-0 top-0 bottom-0 bg-green-800 transition-all duration-200" 
                       style={{ width: `${uploadProgress}%` }}
                     />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isImporting ? `Importing ${uploadProgress}%` : "Import Staff"}
                  </span>
                </button>
                <a href="/template.csv" download className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm">
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </a>
                {stats.pending > 0 && (
                  <button 
                    onClick={handleClearPending}
                    className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors shadow-sm text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Pending
                  </button>
                )}
              </>
            ) : (
              <>
                <Link 
                  href="/admin/employees/add"
                  className="flex items-center gap-2 bg-[#00894F] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Link>
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters Area */}
        <div className="p-6 bg-white border-b border-gray-100 flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00894F] focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-400" />
              Active
              <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              All Departments
              <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium">
              <Search className="h-4 w-4 text-gray-400" />
              Advanced Search
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-4 px-6 text-sm font-semibold text-gray-900">Employee</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-900">Department</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-900">Position</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-900">Join Date</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-900">Uploaded Documents</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                // Skeletons
                [1, 2, 3].map((row) => (
                  <tr key={row} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-gray-200 rounded-md w-28 animate-pulse"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="h-8 bg-gray-200 rounded-md w-20 animate-pulse inline-block"></div>
                    </td>
                  </tr>
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{emp.firstName} {emp.lastName}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{emp.department}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{emp.position}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-700' :
                        emp.status === 'Self-Verified' ? 'bg-blue-100 text-blue-700' :
                        emp.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(emp.joinDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{emp.documentCount} docs</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {emp.status === 'Pending' && (
                          <button
                            onClick={() => handleVerify(emp.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-medium transition-colors border border-green-200"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Verify & Approve
                          </button>
                        )}
                        {emp.status === 'Self-Verified' && (
                          <button
                            onClick={() => handleApprove(emp.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-xs font-medium transition-colors border border-blue-200"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Review & Approve
                          </button>
                        )}
                        {emp.status === 'Active' && (
                          <Link
                            href={`/admin/employees/${emp.id}/receipt`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors border border-blue-200"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Print Receipt
                          </Link>
                        )}
                        <Link 
                          href={`/admin/employees/${emp.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-xs font-medium transition-colors border border-gray-200"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Users className="h-10 w-10 mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">No employees found</p>
                      <p className="text-sm">Database is empty or no staff matched your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-10 pb-6 flex items-center justify-center gap-3 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Admin Dashboard. All rights reserved.</p>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Download className="h-5 w-5 text-[#00894F]" />
                Export Staff Report
              </h2>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Staff Status</label>
                <select 
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F]/20 focus:border-[#00894F] bg-white"
                >
                  <option value="All">All Staff</option>
                  <option value="Active">Approved / Active Staff</option>
                  <option value="Self-Verified">Self-Verified (Pending Admin)</option>
                  <option value="Pending">Pending (Unverified)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time Period</label>
                <select 
                  value={exportPeriod}
                  onChange={(e) => setExportPeriod(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00894F]/20 focus:border-[#00894F] bg-white"
                >
                  <option value="All Time">All Time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Filters based on when the staff record was last updated or verified.</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleExportData}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#00894F] text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-70 transition-colors"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExporting ? "Generating..." : "Download Excel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
