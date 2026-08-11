"use client";

import { useState, useEffect } from "react";
import { Key, Plus, RefreshCcw, Loader2, Shield, Component } from "lucide-react";
import { toast } from "sonner";

type Permission = {
  id: string;
  name: string;
  label: string;
  module: string;
  description: string | null;
  createdAt: string;
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [newLabel, setNewLabel] = useState("");
  const [newName, setNewName] = useState("");
  const [newModule, setNewModule] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/permissions");
      const json = await res.json();
      if (json.success) {
        setPermissions(json.data);
      } else {
        toast.error("Failed to load permissions.");
      }
    } catch (error) {
      toast.error("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newModule.trim()) {
      return toast.error("Label and Module are required");
    }

    try {
      setIsSubmitting(true);
      
      // Auto generate name if not provided
      const permissionName = newName.trim() 
        ? newName 
        : newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');

      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: permissionName,
          label: newLabel,
          module: newModule,
          description: newDesc
        })
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success("Permission created successfully!");
        setIsModalOpen(false);
        setNewLabel("");
        setNewName("");
        setNewModule("");
        setNewDesc("");
        fetchPermissions();
      } else {
        toast.error(json.error || "Failed to create permission");
      }
    } catch (error) {
      toast.error("Error creating permission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Get unique modules for the dropdown suggestions
  const existingModules = Array.from(new Set(permissions.map(p => p.module)));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium mb-4 w-fit">
              <Key className="h-3.5 w-3.5 text-amber-500" />
              Access Control
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1527] tracking-tight">Permissions</h1>
            <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">
              Create and manage granular permissions based on system modules.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={fetchPermissions}
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
              Add Permission
            </button>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-3" />
          Loading permissions...
        </div>
      ) : permissions.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
          <Key className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Permissions Found</h3>
          <p className="text-sm">Get started by creating your first permission.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[#00894F] text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Create Permission
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => (
            <div key={moduleName} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Component className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{moduleName} Module</h2>
                  <p className="text-xs text-slate-500">{modulePerms.length} permissions</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase text-slate-900 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Label</th>
                      <th className="px-6 py-4">Code Name</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modulePerms.map(perm => (
                      <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {perm.label}
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono">
                            {perm.name}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-sm truncate">
                          {perm.description || "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(perm.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Permission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Add New Permission</h2>
            </div>
            
            <form onSubmit={handleCreatePermission} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Permission Label</label>
                <input 
                  type="text" 
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Delete Employees"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Module Category</label>
                <input 
                  type="text" 
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                  placeholder="e.g., Employees, Documents, System"
                  list="module-list"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  required
                />
                <datalist id="module-list">
                  {existingModules.map(mod => (
                    <option key={mod} value={mod} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Code Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., delete_employees (auto-generated if empty)"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What does this permission allow?"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#00894F] text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
