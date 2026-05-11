import React, { useState, useEffect, useRef } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Search, Globe, Star, MapPin, ExternalLink, ShieldCheck, Zap, Loader2, Sparkles, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { runAudit, bulkAddLeads } from "../services/auditService";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Users } from "lucide-react";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";

interface DiscoveryLead {
  id: string;
  name: string;
  address: string;
  website?: string;
  rating?: number;
  userRatingCount?: number;
  designDebtScore?: number;
  isAuditing?: boolean;
}

export default function LeadProspector() {
  const [useSimulation, setUseSimulation] = useState(!API_KEY);

  if (!API_KEY && !useSimulation) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass rounded-2xl text-center space-y-4">
        <ShieldCheck size={48} className="text-emerald-500/40" />
        <h2 className="text-xl font-bold uppercase tracking-widest">Google Maps Key Required</h2>
        <p className="text-white/40 max-w-md text-sm">
          To enable real-time discovery, please add your <code>GOOGLE_MAPS_PLATFORM_KEY</code> in Settings.
        </p>
        <button 
          onClick={() => setUseSimulation(true)}
          className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg text-xs uppercase"
        >
          Try Demo Mode (Simulated)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {useSimulation ? (
        <ProspectorContent isSimulated={true} />
      ) : (
        <APIProvider apiKey={API_KEY} version="weekly">
          <ProspectorContent isSimulated={false} />
        </APIProvider>
      )}
    </div>
  );
}

function ProspectorContent({ isSimulated }: { isSimulated: boolean }) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DiscoveryLead[]>([]);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const placesLib = useMapsLibrary("places");
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    try {
      if (isSimulated) {
        // Simulate a delay
        await new Promise(r => setTimeout(r, 1500));
        
        // Generate high-fidelity simulation leads
        const mockSuffixes = ["School", "Academy", "Institute", "Learning Center", "Primary", "High"];
        const domain = query.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const generatedLeads: DiscoveryLead[] = Array.from({ length: 12 }).map((_, i) => ({
          id: `sim-${i}`,
          name: `${query.split(' ')[0] || 'Modern'} ${mockSuffixes[i % mockSuffixes.length]} ${i + 1}`,
          address: `${100 + i * 5} Main St, ${query.split('in ')[1] || 'Industrial Area'}, UP`,
          website: `https://example-${domain}-${i}.edu`,
          rating: 3.2 + (Math.random() * 1.5),
          userRatingCount: Math.floor(Math.random() * 200),
          designDebtScore: 65 + Math.floor(Math.random() * 30),
          isAuditing: false,
        }));
        setResults(generatedLeads);
      } else {
        if (!placesLib) return;
        const { places } = await placesLib.Place.searchByText({
          textQuery: query,
          fields: ["id", "displayName", "formattedAddress", "websiteUri", "rating", "userRatingCount"],
          maxResultCount: 20,
        });

        const mappedResults: DiscoveryLead[] = places.map((p: any) => ({
          id: p.id,
          name: p.displayName || "Unknown Business",
          address: p.formattedAddress || "",
          website: p.websiteUri || undefined,
          rating: p.rating,
          userRatingCount: p.userRatingCount,
          designDebtScore: Math.floor(Math.random() * 40) + (p.websiteUri ? 20 : 60) - (p.rating ? p.rating * 5 : 0),
          isAuditing: false,
        }));
        setResults(mappedResults.sort((a, b) => (b.designDebtScore || 0) - (a.designDebtScore || 0)));
      }
    } catch (err) {
      console.error("Discovery Search Failed:", err);
      toast.error("Discovery search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const startAudit = async (lead: DiscoveryLead) => {
    if (!lead.website) {
      toast.error("This business has no website listed to audit.");
      return;
    }

    setResults(prev => prev.map(p => p.id === lead.id ? { ...p, isAuditing: true } : p));
    try {
      await runAudit(lead.website);
      toast.success(`Audit initiated for ${lead.name}`);
    } catch (err) {
      toast.error(`Failed to audit ${lead.name}`);
    } finally {
      setResults(prev => prev.map(p => p.id === lead.id ? { ...p, isAuditing: false } : p));
    }
  };

  const handleBulkAdd = async () => {
    const validLeads = results.filter(r => r.website);
    if (validLeads.length === 0) {
      toast.error("No prospects with websites found to add.");
      return;
    }

    setIsBulkAdding(true);
    try {
      await bulkAddLeads(validLeads.map(l => ({ url: l.website!, name: l.name })));
      toast.success(`Successfully added ${validLeads.length} prospects to Lead Manager`);
    } catch (err) {
      toast.error("Failed to add prospects");
      console.error(err);
    } finally {
      setIsBulkAdding(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tighter uppercase">
            Lead <span className="text-emerald-500 italic">Prospector</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Discover high-value design opportunities across any industry or location.</p>
        </div>
        {isSimulated && (
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] uppercase font-bold tracking-widest flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Simulation Mode</span>
          </div>
        )}
      </header>

      <form onSubmit={handleSearch} className="relative max-w-3xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
        <input 
          type="text" 
          placeholder="e.g. 'Luxury spas in Dubai', 'Schools in Kanpur', 'Dentists in London'..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-40 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-lg placeholder:text-white/20 font-mono"
        />
        <button 
          type="submit"
          disabled={isSearching}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-black font-bold h-12 px-8 rounded-xl hover:bg-emerald-400 transition-colors flex items-center space-x-2 uppercase text-xs"
        >
          {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
          <span>Discover</span>
        </button>
      </form>

      {results.length > 0 && (
        <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Users className="text-emerald-500" size={18} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-tight">Bulk Import Available</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                {results.filter(r => r.website).length} prospects with active websites found
              </p>
            </div>
          </div>
          <button 
            onClick={handleBulkAdd}
            disabled={isBulkAdding}
            className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-lg text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isBulkAdding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            <span>{isBulkAdding ? "Importing..." : "Add All to Leads"}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {results.map((lead) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={lead.id}
              className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <MapPin className="text-emerald-500" size={18} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-white/20 mb-1">Prospect Rating</div>
                  <div className={`text-xl font-mono ${lead.designDebtScore && lead.designDebtScore > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {lead.designDebtScore}%
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-bold truncate leading-tight">{lead.name}</h3>
                <p className="text-[11px] text-white/40 truncate">{lead.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[9px] uppercase font-bold text-white/30 mb-1">G-Maps Rating</div>
                  <div className="flex items-center space-x-1">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-mono">{lead.rating || "N/A"}</span>
                    <span className="text-[9px] text-white/20">({lead.userRatingCount || 0})</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-[9px] uppercase font-bold text-white/30 mb-1">Web Presence</div>
                  <div className="flex items-center space-x-1">
                    {lead.website ? <ShieldCheck size={10} className="text-emerald-500" /> : <AlertCircle size={10} className="text-red-500" />}
                    <span className={`text-[10px] uppercase font-bold ${lead.website ? 'text-emerald-500' : 'text-red-500'}`}>
                      {lead.website ? 'Active' : 'Missing'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {lead.website ? (
                  <button 
                    onClick={() => startAudit(lead)}
                    disabled={lead.isAuditing}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center space-x-2"
                  >
                    {lead.isAuditing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>{lead.isAuditing ? 'Auditing...' : 'Run Audit'}</span>
                  </button>
                ) : (
                  <div className="flex-1 py-3 bg-white/5 text-white/20 text-[10px] uppercase font-bold rounded-xl flex items-center justify-center border border-white/5 cursor-not-allowed">
                    No Website Detected
                  </div>
                )}
                {lead.website && (
                  <a 
                    href={lead.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/40"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              
              {lead.designDebtScore && lead.designDebtScore > 80 && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] uppercase font-bold rounded border border-red-500/30">Hot Lead</div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {results.length === 0 && !isSearching && query && (
          <div className="col-span-full py-20 text-center glass rounded-2xl border-dashed">
            <p className="text-white/20 uppercase text-xs font-mono">No prospects located for this query</p>
          </div>
        )}
      </div>
    </div>
  );
}
