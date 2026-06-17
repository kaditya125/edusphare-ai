import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  FileText,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { DocumentDetail } from "./DocumentDetail";
import api from "../services/api";
import { Pagination } from "./Pagination";

export function KnowledgeHub() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Set up polling to check processing status
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDocuments();
    } catch (error) {
      console.error("Upload error", error);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/documents/${id}`);
      await fetchDocuments();
      if (selectedDocId === id) setSelectedDocId(null);
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const selectedDoc = documents.find((d) => d._id === selectedDocId);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-8 relative">
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-20"
          >
            <DocumentDetail
              document={selectedDoc}
              onBack={() => setSelectedDocId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Knowledge Hub
            </h1>
            <p className="text-slate-700 dark:text-slate-300 mt-1">
              Upload and manage campus documents for AI processing.
            </p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="hidden sm:flex px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/20 font-medium items-center gap-2 transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
            {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>

        {/* Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-border/60 hover:border-primary-500/50 rounded-3xl bg-surface/30 flex flex-col items-center justify-center transition-colors cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.txt"
          />
          <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-medium">
            Drag & drop documents here
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            Support PDF, TXT up to 50MB
          </p>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Indexed Documents
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search documents..."
                className="pl-9 pr-4 py-2 rounded-xl bg-surface border border-border/50 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500/50 w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const filteredDocs = documents.filter(doc => 
                doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
              );
              const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
              const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

              return (
                <>
                  {paginatedDocs.map((doc, i) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedDocId(doc._id)}
                      className="p-5 rounded-2xl bg-surface border border-border/50 hover:bg-white/[0.02] transition-colors relative group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            doc.status === "ready"
                              ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <button 
                          onClick={(e) => handleDelete(doc._id, e)}
                          className="text-slate-500 dark:text-slate-500 hover:text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3
                        className="font-mono text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate mb-1"
                        title={doc.originalName}
                      >
                        {doc.originalName}
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">
                        Uploaded {new Date(doc.uploadDate).toLocaleDateString()} • {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-mono uppercase text-[10px] tracking-widest font-medium text-slate-500 dark:text-slate-500 px-2.5 py-1 rounded-md bg-card border border-border/50">
                          {doc.pages || 1} Pages
                        </span>

                        {doc.status === "ready" ? (
                          <div className="flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-widest font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Indexed AI Ready
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-widest font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5" />
                            Processing
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
