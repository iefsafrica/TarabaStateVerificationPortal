"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ArrowDownToLine, Clock, User, FileText, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  date: string;
  status: string;
  type: string;
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/audit-logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      toast.error("Failed to load audit logs");
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">System Audit Logs</h2>
          <p className="text-sm text-gray-500">Track all activities and changes across the platform.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium shadow-sm shadow-green-600/20 w-full sm:w-auto justify-center">
            <ArrowDownToLine className="h-4 w-4" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Action & Details</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <p>Loading audit logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{log.action}</span>
                        <span className="text-xs text-gray-500 mt-0.5 whitespace-normal line-clamp-1 max-w-xs">{log.details}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                        <FileText className="h-3.5 w-3.5" />
                        {log.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.date).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === "Success" || log.status === "Successful" ? (
                        <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Success
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {log.status}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
