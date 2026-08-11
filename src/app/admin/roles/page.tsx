"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, RefreshCcw, Loader2, Key, Users, Settings } from "lucide-react";
import { toast } from "sonner";

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  status: string;
  createdAt: string;
};

type Permission = {
  id: string;
  name: string;
  label: string;
  module: string;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const fetchRolesAndPermissions = async () => {
    try {
      setIsLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/permissions")
      ]);
      
      const rolesJson = await rolesRes.json();
      const permsJson = await permsRes.json();

      if (rolesJson.success) setRoles(rolesJson.data);
      if (permsJson.success) setPermissions(permsJson.data);
      
    } catch (error) {
      toast.error("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const togglePermission = (permId: string) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return toast.error("Role name is required");

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: selectedPerms
        })
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Role created successfully!");
        setIsModalOpen(false);
        setNewRoleName("");
        setNewRoleDesc("");
        setSelectedPerms([]);
        fetchRolesAndPermissions();
      } else {
        toast.error(json.error || "Failed to create role");
      }
    } catch (error) {
      toast.error("Error creating role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium mb-4 w-fit">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              Access Control
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1527] tracking-tight">Role Management</h1>
            <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">
              Define roles and assign permissions to control user access across the system.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={fetchRolesAndPermissions}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00894F] text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Role
            </button>
          </div>
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">System Roles</h2>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
            {roles.length} roles total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase text-slate-900 font-semibold border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-5">Role Name</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5">Permissions</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600 mb-2" />
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Shield className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map(role => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {role.description || "No description"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map(p => (
                          <span key={p} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-medium">
                            {p}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                        {role.permissions.length === 0 && (
                          <span className="text-slate-400 italic text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${role.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {role.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(role.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Create New Role</h2>
              <p className="text-slate-500 text-sm mt-1">Configure role details and access permissions.</p>
            </div>
            
            <form onSubmit={handleCreateRole} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Role Name</label>
                  <input 
                    type="text" 
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., HR Manager"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Briefly describe this role's purpose..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Assign Permissions</label>
                {permissions.length === 0 ? (
                  <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    No permissions found. Add permissions from the Permissions page first.
                  </div>
                ) : (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-6 max-h-[300px] overflow-y-auto">
                    {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => (
                      <div key={moduleName} className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{moduleName}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {modulePerms.map(perm => (
                            <label key={perm.name} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-green-500 hover:shadow-sm transition-all has-[:checked]:border-green-500 has-[:checked]:ring-1 has-[:checked]:ring-green-500">
                              <div className="pt-0.5">
                                <input 
                                  type="checkbox" 
                                  checked={selectedPerms.includes(perm.name)}
                                  onChange={() => togglePermission(perm.name)}
                                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{perm.label}</div>
                                <div className="text-xs text-slate-500 mt-0.5 font-mono">{perm.name}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#00894F] text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
