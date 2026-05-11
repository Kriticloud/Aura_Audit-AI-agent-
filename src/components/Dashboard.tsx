import React, { useState, useEffect } from "react";
import { Search, Plus, ExternalLink, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { runAudit, getRecentAudits } from "../services/auditService";
import ScoreDial from "./ScoreDial";
import { motion } from "motion/react";

export default function Dashboard({ onSelectAudit }: { onSelectAudit: (id: string) => void }) {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    const audits = await getRecentAudits();
    setRecentAudits(audits);
  };

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setError(null);
    setIsProcessing(true);
    try {
      const id = await runAudit(url);
      loadAudits();
      onSelectAudit(id);
    } catch (err: any) {
      setError(err.message || "Failed to analyze website. Try another URL.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header & Main Action */}
      <section className="text-center space-y-6 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-500 uppercase tracking-widest font-bold">
            <Sparkles size={12} />
            <span>AI-Powered Redesign Engine</span>
          </div>
          <h1 className="text-5xl font-light tracking-tighter max-w-2xl mx-auto leading-[0.95]">
            IDENTIFY <span className="text-white/40 italic">WEAKNESS.</span> <br />
            GENERATE <span className="text-emerald-500 italic">OPPORTUNITY.</span>
          </h1>
          <p className="text-white/40 max-w-xl mx-auto text-lg">
            Identify design weaknesses, reveal conversion gaps, and generate high-converting redesign opportunities automatically.
          </p>
        </motion.div>

        <form onSubmit={handleStartAudit} className="max-w-2xl mx-auto relative group">
          <div className={`flex items-center transition-all duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
              <input
                type="url"
                required
                placeholder="Enter client website URL (e.g., https://acme-dental.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-5 pl-14 pr-32 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm placeholder:text-white/20 font-mono"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-emerald-400 transition-colors flex items-center space-x-2 uppercase text-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Start Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center space-x-2 text-red-400 text-sm"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </form>
      </section>

      {/* Stats / Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl space-y-2">
          <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Total Audits</span>
          <div className="text-3xl font-bold">{recentAudits.length}</div>
        </div>
        <div className="glass p-6 rounded-2xl space-y-2">
          <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Redesign Leads</span>
          <div className="text-3xl font-bold">{recentAudits.filter(a => a.scores?.overall < 70).length}</div>
        </div>
        <div className="glass p-6 rounded-2xl space-y-2">
          <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Estimated Pipeline</span>
          <div className="text-3xl font-bold">${(recentAudits.filter(a => a.scores?.overall < 70).length * 5000).toLocaleString()}</div>
        </div>
      </section>

      {/* Recent Audits Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Audits</h2>
          <button className="text-[#F27D26] text-sm font-medium hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/[0.02]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-white/10 bg-white/5">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Website</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-center">Score</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-center">Urgency</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentAudits.map((audit) => (
                <tr 
                  key={audit.id} 
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  onClick={() => onSelectAudit(audit.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white/90">{audit.url}</span>
                      <span className="text-xs text-white/30">{new Date(audit.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      audit.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                      audit.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono text-lg">{audit.scores?.overall || '--'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
                      <div 
                        className={`h-full ${audit.scores?.urgency > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${audit.scores?.urgency || 0}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 group-hover:text-emerald-500 transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {recentAudits.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20">
                    No audits found. Start by entering a URL above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
