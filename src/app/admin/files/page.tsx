"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FolderOpen, 
  File, 
  RefreshCcw, 
  Plus, 
  Upload, 
  Activity,
  HardDrive,
  Database,
  Search,
  Filter,
  Loader2,
  Trash2,
  Edit2,
  FolderTree,
  FolderMinus,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

type DashboardStats = {
  totalFiles: number;
  totalFolders: number;
  rootFolders: number;
  nestedFolders: number;
  storageUsedBytes: number;
  recentActivities: any[];
};

type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  parent?: { name: string };
  scope: string;
  createdAt: string;
};

type SystemFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string | null;
  folderId: string;
  folder?: { name: string };
  createdAt: string;
};

export default function FileManagerPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<SystemFile[]>([]);
  
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);
  const [isFilesLoading, setIsFilesLoading] = useState(true);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderScope, setNewFolderScope] = useState("Global");
  const [newFolderParentId, setNewFolderParentId] = useState("");

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderScope, setEditFolderScope] = useState("");

  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchDashboard = async () => {
    try {
      setIsStatsLoading(true);
      const res = await fetch("/api/file-manager/dashboard");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard summary.");
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      setIsFoldersLoading(true);
      const res = await fetch("/api/file-manager/folders");
      const json = await res.json();
      if (json.success) setFolders(json.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load folders.");
    } finally {
      setIsFoldersLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      setIsFilesLoading(true);
      const res = await fetch(`/api/file-manager/files?folderId=${selectedFolderId}`);
      const json = await res.json();
      if (json.success) setFiles(json.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load files.");
    } finally {
      setIsFilesLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [selectedFolderId]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return toast.error("Folder name is required");
    
    try {
      const res = await fetch("/api/file-manager/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newFolderName, 
          scope: newFolderScope,
          parentId: newFolderParentId || null 
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Folder created successfully!");
        setIsCreatingFolder(false);
        setNewFolderName("");
        fetchFolders();
        fetchDashboard();
      } else {
        toast.error(json.error || "Failed to create folder");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateFolder = async (id: string) => {
    if (!editFolderName) return toast.error("Folder name is required");
    try {
      const res = await fetch(`/api/file-manager/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editFolderName, scope: editFolderScope })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Folder updated!");
        setEditingFolderId(null);
        fetchFolders();
      } else toast.error(json.error || "Update failed");
    } catch (e) {
      toast.error("Error updating folder");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this folder and all its contents?")) return;
    try {
      const res = await fetch(`/api/file-manager/folders/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Folder deleted");
        fetchFolders();
        fetchDashboard();
      } else toast.error(json.error || "Delete failed");
    } catch (e) {
      toast.error("Error deleting folder");
    }
  };

  const handleUpdateFile = async (id: string) => {
    if (!editFileName) return toast.error("File name is required");
    try {
      const res = await fetch(`/api/file-manager/files/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editFileName })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("File updated!");
        setEditingFileId(null);
        fetchFiles();
      } else toast.error(json.error || "Update failed");
    } catch (e) {
      toast.error("Error updating file");
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/file-manager/files/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("File deleted");
        fetchFiles();
        fetchDashboard();
      } else toast.error(json.error || "Delete failed");
    } catch (e) {
      toast.error("Error deleting file");
    }
  };

  const handleUploadClick = () => {
    if (folders.length === 0) return toast.error("Create a folder first!");
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name;
    const size = file.size;
    const type = name.split('.').pop() || "unknown";

    fetch("/api/file-manager/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        size, 
        type, 
        folderId: selectedFolderId === 'all' ? folders[0].id : selectedFolderId 
      })
    }).then(res => res.json()).then(json => {
      if (json.success) {
        toast.success("File uploaded!");
        fetchFiles();
        fetchDashboard();
      } else {
        toast.error("Upload failed");
      }
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-amber-500" />
              File manager module
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0B1527] tracking-tight">Folder Management</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">
            Manage live folders and files from the file-manager endpoints with create, upload, view, and delete flows.
          </p>
        </div>
        <button 
          onClick={() => { fetchDashboard(); fetchFolders(); fetchFiles(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Dashboard</div>
          <div className="text-3xl font-bold text-slate-900">Live</div>
          <div className="text-xs text-slate-500 leading-tight">
            {!stats && isStatsLoading ? "Loading dashboard summary..." : "Active and connected to endpoints."}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Total Files</div>
          <div className="text-3xl font-bold text-slate-900">
            {isStatsLoading ? "-" : stats?.totalFiles || 0}
          </div>
          <div className="text-xs text-slate-500 leading-tight">All files returned by the API.</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Total Folders</div>
          <div className="text-3xl font-bold text-slate-900">
            {isStatsLoading ? "-" : stats?.totalFolders || 0}
          </div>
          <div className="text-xs text-slate-500 leading-tight">Folders returned by the dashboard endpoint.</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Storage Used</div>
          <div className="text-3xl font-bold text-slate-900">
            {isStatsLoading ? "-" : formatBytes(stats?.storageUsedBytes || 0)}
          </div>
          <div className="text-xs text-slate-500 leading-tight">Storage consumed by uploaded files.</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Root Folders</div>
          <div className="text-3xl font-bold text-slate-900">
            {isStatsLoading ? "-" : stats?.rootFolders || 0}
          </div>
          <div className="text-xs text-slate-500 leading-tight">Top level directories.</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Nested Folders</div>
          <div className="text-3xl font-bold text-slate-900">
            {isStatsLoading ? "-" : stats?.nestedFolders || 0}
          </div>
          <div className="text-xs text-slate-500 leading-tight">Sub-directories.</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent activity</h2>
            <p className="text-sm text-slate-500">Latest files from the dashboard endpoint.</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Activity className="h-4 w-4" />
            <span>{stats?.recentActivities?.length || 0} items</span>
          </div>
        </div>
        
        <div className="bg-[#F8FAFC] rounded-xl border border-slate-100 p-8 text-center border-dashed">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.map(act => (
                <div key={act.id} className="text-sm text-slate-600 bg-white p-3 rounded shadow-sm border border-slate-100 text-left">
                  {act.title} <span className="text-xs text-slate-400 ml-2">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-slate-500">No recent activity available.</span>
          )}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Folder Registry */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Folder registry</h2>
            <p className="text-sm text-slate-500">Browse, filter, and manage file-manager folders.</p>
          </div>
          <div className="text-sm text-slate-400">
            {isFoldersLoading ? "Loading folders..." : ""}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search folders..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button 
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </div>
          </div>
          
          {isCreatingFolder && (
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
              <input 
                type="text" 
                placeholder="Folder Name" 
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm w-48"
              />
              <select 
                value={newFolderScope}
                onChange={e => setNewFolderScope(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm bg-white"
              >
                <option value="Global">Global</option>
                <option value="Restricted">Restricted</option>
              </select>
              <select 
                value={newFolderParentId}
                onChange={e => setNewFolderParentId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm bg-white"
              >
                <option value="">No Parent (Root)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <button onClick={handleCreateFolder} className="px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800">Save</button>
              <button onClick={() => setIsCreatingFolder(false)} className="px-4 py-2 text-slate-500 text-sm hover:text-slate-700">Cancel</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase text-slate-900 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Folder Name</th>
                  <th className="px-6 py-4">Folder ID</th>
                  <th className="px-6 py-4">Parent Folder</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {folders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No folders found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  folders.map(folder => (
                    <tr key={folder.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {editingFolderId === folder.id ? (
                          <input 
                            type="text"
                            value={editFolderName}
                            onChange={(e) => setEditFolderName(e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-sm w-full focus:outline-none focus:border-green-500"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-4 w-4 text-slate-400" />
                            {folder.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{folder.id.split('-')[0]}</td>
                      <td className="px-6 py-4">
                        {folder.parent ? (
                          <span className="flex items-center gap-1.5"><FolderTree className="h-3 w-3 text-slate-400"/> {folder.parent.name}</span>
                        ) : (
                          <span className="text-slate-400">Root</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(folder.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {editingFolderId === folder.id ? (
                          <select 
                            value={editFolderScope}
                            onChange={(e) => setEditFolderScope(e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:border-green-500"
                          >
                            <option value="Global">Global</option>
                            <option value="Restricted">Restricted</option>
                          </select>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                            {folder.scope}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingFolderId === folder.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdateFolder(folder.id)} className="text-green-600 hover:text-green-700 text-sm font-medium">Save</button>
                            <button onClick={() => setEditingFolderId(null)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingFolderId(folder.id);
                                setEditFolderName(folder.name);
                                setEditFolderScope(folder.scope);
                              }}
                              className="text-slate-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteFolder(folder.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* File Registry */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium mb-2">
                <File className="h-3 w-3" />
                File manager module
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">File Registry</h2>
            <p className="text-sm text-slate-500 mt-1">Upload files, browse folder-scoped file lists, and remove documents through the live API.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchFiles}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#00894F] text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
            <div className="text-sm font-medium text-slate-900">Files in View</div>
            <div className="text-3xl font-bold text-slate-900">{files.length}</div>
            <div className="text-xs text-slate-500 leading-tight">Files currently returned by the selected folder endpoint.</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
            <div className="text-sm font-medium text-slate-900">Selected Folder</div>
            <div className="text-3xl font-bold text-slate-900 truncate">
              {selectedFolderId === "all" ? "Root" : folders.find(f => f.id === selectedFolderId)?.name || "Unknown"}
            </div>
            <div className="text-xs text-slate-500 leading-tight">Root Folder</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
            <div className="text-sm font-medium text-slate-900">Latest File</div>
            <div className="text-3xl font-bold text-slate-900 truncate">
              {files.length > 0 ? files[0].name : "0"}
            </div>
            <div className="text-xs text-slate-500 leading-tight">
              {files.length > 0 ? new Date(files[0].createdAt).toLocaleDateString() : "No files available."}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-lg">Files in folder</h3>
            <div className="flex items-center gap-3">
              <select 
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:border-green-500 min-w-[150px]"
              >
                <option value="all">All Folders</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <button 
                onClick={fetchFiles}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors"
              >
                <RefreshCcw className="h-4 w-4" />
                Reload
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase text-slate-900 font-semibold border-b border-slate-200 bg-white">
                <tr>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Folder</th>
                  <th className="px-6 py-4">Uploaded</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isFilesLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600 mb-2" />
                      Loading files...
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <HardDrive className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                      No files found in this folder.
                    </td>
                  </tr>
                ) : (
                  files.map(file => (
                    <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {editingFileId === file.id ? (
                          <input 
                            type="text"
                            value={editFileName}
                            onChange={(e) => setEditFileName(e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-sm w-full focus:outline-none focus:border-green-500"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <File className="h-4 w-4" />
                            </div>
                            {file.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatBytes(file.size)}</td>
                      <td className="px-6 py-4 text-slate-500 uppercase">{file.type}</td>
                      <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                        <FolderOpen className="h-3 w-3 text-slate-400" />
                        {file.folder?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {editingFileId === file.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleUpdateFile(file.id)} className="text-green-600 hover:text-green-700 text-sm font-medium">Save</button>
                            <button onClick={() => setEditingFileId(null)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingFileId(file.id);
                                setEditFileName(file.name);
                              }}
                              className="text-slate-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteFile(file.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
}
