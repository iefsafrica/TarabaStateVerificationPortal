"use client";

import { RefreshCw, ArrowUpRight, Users, UserCheck, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      
      {/* Top Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dashboard Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex gap-2 mb-6">
            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">Overview</span>
            <span className="px-3 py-1 bg-white text-gray-900 text-xs font-medium rounded-full border border-gray-300 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              Admin dashboard
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Dashboard Overview</h2>
          <p className="text-gray-500 text-lg max-w-lg leading-relaxed mb-8">
            Monitor staff activity, document status, and recent onboarding progress from a cleaner shadcn-based layout.
          </p>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-[#00894F] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh data
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              <ArrowUpRight className="h-4 w-4" />
              View reports
            </button>
          </div>
        </div>

        {/* Live Activity Mix */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-gray-500 font-medium mb-2">Live activity mix</h3>
          <div className="text-3xl font-bold text-gray-900 mb-8">0% active</div>
          
          <div className="mt-auto">
            <div className="h-2 w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-red-600 w-full rounded-full"></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-8">
              <span>0 active</span>
              <span>0 total</span>
            </div>
            <div className="flex gap-3 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              <ArrowUpRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p>Activity and approval status are updating in real time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-900 font-medium text-sm">Total employees</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-500">All registered staff in the system</p>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-900 font-medium text-sm">Active employees</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-500">Employees currently marked</p>
          </div>
        </div>

        {/* Pending Employees */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-900 font-medium text-sm">Pending employees</h3>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-500">Awaiting review or approval</p>
          </div>
        </div>

      </div>
    </div>
  );
}
