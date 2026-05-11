import React, { useState, useEffect } from "react";
import { Users, Search, MoreHorizontal, ExternalLink, Mail, Phone, Calendar, CheckCircle2, XCircle, Clock, Plus, Loader2, Trash2 } from "lucide-react";
import { getLeads, updateLeadStatus, addManualLead, deleteLead } from "../services/auditService";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function LeadManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchAgencyId, setSearchAgencyId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadUrl, setNewLeadUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadUrl) return;
    
    setIsSubmitting(true);
    try {
      await addManualLead(newLeadUrl);
      toast.success("Lead added successfully");
      setNewLeadUrl("");
      setIsAddModalOpen(false);
      loadLeads();
    } catch (err) {
      toast.error("Failed to add lead");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: string, website: string) => {
    if (!window.confirm(`Are you sure you want to remove lead for ${website}?`)) return;
    
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success("Lead removed");
    } catch (err) {
      toast.error("Failed to delete lead");
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateLeadStatus(id, status);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === "all" || lead.status === filter;
    const matchesWebsite = (lead.website || "").toLowerCase().includes(search.toLowerCase());
    const matchesAgencyId = (lead.agencyId || "").toLowerCase().includes(searchAgencyId.toLowerCase());
    return matchesFilter && matchesWebsite && matchesAgencyId;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = (a[key] || "").toString().toLowerCase();
    const bValue = (b[key] || "").toString().toLowerCase();
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getCount = (status: string) => {
    if (status === "all") return leads.length;
    return leads.filter(l => l.status === status).length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "contacted": return <Clock size={14} className="text-blue-500" />;
      case "converted": return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "rejected": return <XCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-white/40" />;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tighter uppercase">
            Lead <span className="text-emerald-500 italic">Central</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Manage and track your high-potential redesign prospects.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
        >
          <Plus size={16} />
          <span>Add Lead</span>
        </button>
      </header>

      {/* Filters & Sorting Header */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-2">
            {["all", "new", "contacted", "converted", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all gap-2 flex items-center ${
                  filter === f 
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                    : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
                }`}
              >
                <span>{f}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${
                  filter === f ? "bg-black/20 text-black" : "bg-white/5 text-white/30"
                }`}>
                  {getCount(f)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input 
                type="text" 
                placeholder="Search website URL..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-9 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono w-full md:w-56"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input 
                type="text" 
                placeholder="Agency ID..." 
                value={searchAgencyId}
                onChange={(e) => setSearchAgencyId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-9 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono w-full md:w-40"
              />
              {searchAgencyId && (
                <button 
                  onClick={() => setSearchAgencyId("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2">
          <div className="text-[10px] uppercase font-bold tracking-widest text-white/10">Prospect Overview</div>
          <button 
            onClick={() => toggleSort('agencyId')}
            className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-all p-2 rounded-lg hover:bg-white/5 ${
              sortConfig?.key === 'agencyId' ? "text-emerald-500" : "text-white/30"
            }`}
          >
            Sort by Agency ID
            {sortConfig?.key === 'agencyId' && (
              <span className="text-[14px]">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-20">
          <Users className="w-12 h-12 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest">Hydrating Lead Data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLeads.map((lead) => (
            <motion.div 
              layout
              key={lead.id}
              className="glass p-6 rounded-2xl group hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Users className="text-emerald-500" size={20} />
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(lead.status)}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{lead.status}</span>
                </div>
                <button 
                  onClick={() => handleDeleteLead(lead.id, lead.website)}
                  className="p-2 text-white/10 hover:text-red-500 transition-colors"
                  title="Remove Lead"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-4 pb-4 border-b border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-sm truncate">{lead.website}</h3>
                  <div className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-mono text-white/40 uppercase">
                    ID: {lead.agencyId || "AG-ROOT"}
                  </div>
                </div>
                <p className="text-[10px] text-white/20 uppercase tracking-widest flex items-center">
                  Added on {new Date(lead.updatedAt?.seconds * 1000).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] uppercase font-bold text-white/60 transition-colors"
                >
                  Mark Contacted
                </button>
                <button 
                  onClick={() => handleStatusUpdate(lead.id, 'converted')}
                  className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] uppercase font-bold transition-colors"
                >
                  Converted
                </button>
                <button 
                  onClick={() => handleStatusUpdate(lead.id, 'rejected')}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 rounded-lg text-[10px] uppercase font-bold transition-colors col-span-2"
                >
                  Reject Prospect
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40"><Mail size={14} /></button>
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40"><Calendar size={14} /></button>
                </div>
                <button className="text-[10px] uppercase font-bold text-white/40 group-hover:text-emerald-500 flex items-center space-x-1 transition-colors">
                  <span>View Audit</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>
          ))}

          {filteredLeads.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-2xl border-dashed">
              <p className="text-white/20 uppercase text-xs font-mono">No leads found matching criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass p-8 rounded-3xl w-full max-w-md relative z-10 border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>

              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Users className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Manual Entry</h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Add individual prospect</p>
                </div>
              </div>

              <form onSubmit={handleAddLead} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2 px-1">Website URL</label>
                  <input 
                    type="url"
                    placeholder="https://example.com"
                    required
                    value={newLeadUrl}
                    onChange={(e) => setNewLeadUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Capture Prospect</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
