"use client";

import { useState, useEffect } from "react";
import { FileCheck, FileClock, FileX, Users, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  status: string;
  joinDate: string;
};

type DashboardData = {
  documents: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
  recentEmployees: Employee[];
  pendingEmployees: Employee[];
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"Recent" | "Pending">("Recent");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const displayedEmployees = activeTab === "Recent" ? data?.recentEmployees : data?.pendingEmployees;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
      
      {/* Top Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Verified Documents */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-44 relative">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-900 font-medium">Verified documents</h3>
            <div className="p-2.5 bg-[#e8f5f0] rounded-xl text-[#00894F]">
              <FileCheck className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Documents cleared for use</div>
            <p className="text-xs text-gray-400">Updated from the latest dashboard pull</p>
          </div>
          <div className="mt-4 text-4xl font-bold text-gray-900">
            {data?.documents.verified || 0}
          </div>
        </div>

        {/* Pending Documents */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-44 relative">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-900 font-medium">Pending documents</h3>
            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500">
              <FileClock className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Documents still under review</div>
            <p className="text-xs text-gray-400">Updated from the latest dashboard pull</p>
          </div>
          <div className="mt-4 text-4xl font-bold text-gray-900">
            {data?.documents.pending || 0}
          </div>
        </div>

        {/* Rejected Documents */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-44 relative">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-900 font-medium">Rejected documents</h3>
            <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
              <FileX className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Items that need correction</div>
            <p className="text-xs text-gray-400">Updated from the latest dashboard pull</p>
          </div>
          <div className="mt-4 text-4xl font-bold text-gray-900">
            {data?.documents.rejected || 0}
          </div>
        </div>
      </div>

      {/* Employee Management Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Employee management</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Switch between recent and pending employees.</p>
          
          <div className="flex items-center gap-2 bg-gray-50/50 p-1 rounded-xl w-fit border border-gray-100">
            {["Recent", "Pending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Employee List Preview */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00894F] mx-auto" />
                  </td>
                </tr>
              ) : displayedEmployees && displayedEmployees.length > 0 ? (
                displayedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {emp.department} <span className="text-gray-400 ml-1">• {emp.position}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-700' :
                        emp.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/admin/employees/${emp.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#00894F] hover:text-green-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Manage <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                    No {activeTab.toLowerCase()} employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <Link href="/admin/employees" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              View all employees →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
