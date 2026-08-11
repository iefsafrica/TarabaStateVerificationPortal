"use client";

import { useState, useEffect, useRef } from "react";
import { 
  File, 
  RefreshCcw, 
  Upload,
  Sparkles,
  FileText,
  Image as ImageIcon,
  FileArchive,
  Trash2,
  Edit2,
  Eye,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

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

export default function OfficialDocumentsPage() {
  const [files, setFiles] = useState<SystemFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/file-manager/files?folderId=all`);
      const json = await res.json();
      if (json.success) {
        setFiles(json.data);
      } else {
        toast.error("Failed to load documents.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
        toast.success("Document updated!");
        setEditingFileId(null);
        fetchFiles();
      } else toast.error(json.error || "Update failed");
    } catch (e) {
      toast.error("Error updating document");
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/file-manager/files/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Document deleted");
        fetchFiles();
      } else toast.error(json.error || "Delete failed");
    } catch (e) {
      toast.error("Error deleting document");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name;
    const size = file.size;
    const type = name.split('.').pop() || "unknown";

    fetch("/api/file-manager/folders").then(r => r.json()).then(folderRes => {
      const folderId = folderRes.data?.[0]?.id;
      if (!folderId) {
        toast.error("Please create a folder in File Manager first.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", folderId);

      fetch("/api/file-manager/files", {
        method: "POST",
        body: formData
      }).then(res => res.json()).then(json => {
        if (json.success) {
          toast.success("Document uploaded!");
          fetchFiles();
        } else {
          toast.error("Upload failed");
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
    });
  };

  const pdfCount = files.filter(f => f.type.toLowerCase() === 'pdf').length;
  const imgCount = files.filter(f => ['jpg','jpeg','png','gif','svg'].includes(f.type.toLowerCase())).length;
  const otherCount = files.length - pdfCount - imgCount;
  const latestFile = files.length > 0 ? files[0] : null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      
      {/* Header Container */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium mb-4 w-fit">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Official documents module
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1527] tracking-tight">Official Documents</h1>
            <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">
              Browse, preview, upload, and delete live files from the file-manager API.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={fetchFiles}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00894F] text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Total Documents</div>
          <div className="text-4xl font-bold text-slate-900">{files.length}</div>
          <div className="text-sm text-slate-500 leading-tight">All files returned by the file-manager endpoint.</div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Current Folder</div>
          <div className="text-4xl font-bold text-slate-900">Root</div>
          <div className="text-sm text-slate-500 leading-tight">Browsing root folder files.</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="text-sm font-medium text-slate-900">Latest Upload</div>
          <div className="text-4xl font-bold text-slate-900 truncate">
            {latestFile ? latestFile.name : "0"}
          </div>
          <div className="text-sm text-slate-500 leading-tight">
            {latestFile ? new Date(latestFile.createdAt).toLocaleDateString() : "No documents available."}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <FileText className="h-4 w-4 text-red-500" />
            PDF Documents
          </div>
          <div className="text-4xl font-bold text-slate-900">{pdfCount}</div>
          <div className="text-sm text-slate-500 leading-tight">Portable document formats.</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <ImageIcon className="h-4 w-4 text-blue-500" />
            Images
          </div>
          <div className="text-4xl font-bold text-slate-900">{imgCount}</div>
          <div className="text-sm text-slate-500 leading-tight">JPG, PNG, SVG files.</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <FileArchive className="h-4 w-4 text-amber-500" />
            Other Docs
          </div>
          <div className="text-4xl font-bold text-slate-900">{otherCount}</div>
          <div className="text-sm text-slate-500 leading-tight">Word, Excel, Zip, etc.</div>
        </div>
      </div>

      {/* Document List (Optional addition for full feature parity, similar to the mock) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Document Library</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase text-slate-900 font-semibold border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-5">Document Name</th>
                <th className="px-6 py-5">Size</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Uploaded</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600 mb-2" />
                    Loading documents...
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <File className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                    No documents found.
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
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <File className="h-4 w-4" />
                          </div>
                          {file.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatBytes(file.size)}</td>
                    <td className="px-6 py-4 text-slate-500 uppercase font-medium">{file.type}</td>
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
                              if (file.url) {
                                window.open(file.url, "_blank");
                              } else {
                                toast.error("No preview available");
                              }
                            }}
                            className="text-slate-400 hover:text-green-500 transition-colors"
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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
  );
}
