import React, { useState, useEffect } from "react";
import { Users, Search, MoreHorizontal, ExternalLink, Mail, Phone, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getLeads, updateLeadStatus } from "../services/auditService";
import { motion } from "motion/react";

export default function LeadManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    const matchesSearch = (lead.website || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono w-64"
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
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center flex-wrap gap-2 border-b border-white/5 pb-6">
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-20">
          <Users className="w-12 h-12 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest">Hydrating Lead Data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
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
              </div>

              <div className="mt-4">
                <h3 className="font-mono text-sm truncate">{lead.website}</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-widest flex items-center mt-1">
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
    </div>
  );
}
