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
  Upload
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
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    async function fetchData() {
      try {
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
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
      
      {/* Top Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          {["Staff", "Pending Staff", "Import Staff"].map((tab) => (
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
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsImporting(true);
                    try {
                      const text = await file.text();
                      const rows = text.split("\n").filter(row => row.trim());
                      const headers = rows[0].split(",").map(h => h.trim());
                      
                      let imported = 0;
                      for (let i = 1; i < rows.length; i++) {
                        const values = rows[i].split(",");
                        if (values.length !== headers.length) continue;
                        
                        const empData: any = {};
                        headers.forEach((h, idx) => {
                          empData[h] = values[idx].trim();
                        });
                        
                        if (empData.firstName && empData.lastName) {
                           await fetch("/api/employees", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify(empData)
                           });
                           imported++;
                        }
                      }
                      toast.success(`Successfully imported ${imported} employees!`);
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
                  className="flex items-center gap-2 bg-[#00894F] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm text-sm disabled:opacity-50"
                >
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isImporting ? "Importing..." : "Import Staff"}
                </button>
                <a href="/template.csv" download className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm">
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </a>
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
                <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm">
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
                        emp.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(emp.joinDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{emp.documentCount} docs</td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/admin/employees/${emp.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-xs font-medium transition-colors border border-gray-200"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Manage
                      </Link>
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
        <Image 
          src="/images/tsu-logo.png" 
          alt="State Seal" 
          width={40} 
          height={40} 
          className="object-contain"
        />
        <p>© 2026 Taraba State Verification Portal. All rights reserved.</p>
      </div>
    </div>
  );
}
