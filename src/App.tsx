import { useState, useEffect } from "react";
import { auth, loginWithGoogle, logout, db } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AuditDetailView from "./components/AuditDetailView";
import LeadManager from "./components/LeadManager";
import AgencyInsights from "./components/AgencyInsights";
import LeadProspector from "./components/LeadProspector";
import { Loader2, Globe, Sparkles, LogIn, ChevronRight, Users, Zap } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      
      // Handle deep linking
      if (u && !isInitialized) {
        const params = new URLSearchParams(window.location.search);
        const auditId = params.get("auditId");
        if (auditId) {
          setSelectedAuditId(auditId);
        }
        setIsInitialized(true);
      }
    });
    return () => unsubscribe();
  }, [isInitialized]);

  useEffect(() => {
    if (selectedAuditId) {
      loadAuditDetails(selectedAuditId);
    } else {
      setAuditData(null);
    }
  }, [selectedAuditId]);

  const loadAuditDetails = async (id: string) => {
    const docRef = doc(db, "audits", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setAuditData({ id: snap.id, ...snap.data() });
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success("Welcome back!");
    } catch (err) {
      toast.error("Failed to sign in");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] space-y-4">
        <Loader2 className="w-10 h-10 text-[#F27D26] animate-spin" />
        <span className="text-white/20 font-medium tracking-widest uppercase text-xs">Initializing Expert System...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full relative overflow-hidden bg-[#050505] font-sans selection:bg-[#F27D26] selection:text-black">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        </div>

        <nav className="relative z-10 p-8 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center">
              <Globe className="text-black w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tighter uppercase">Aura <span className="text-emerald-500 italic">Audit</span></span>
          </div>
          <button 
            onClick={handleLogin}
            className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-colors flex items-center space-x-2"
          >
            <span>Get Started</span>
            <ChevronRight size={18} />
          </button>
        </nav>

        <main className="relative z-10 max-w-5xl mx-auto px-8 pt-20 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
             <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-emerald-500 font-medium backdrop-blur-sm uppercase tracking-widest text-[10px]">
                <Sparkles size={16} />
                <span>Expert AI Web Agent</span>
              </div>
            <h1 className="text-7xl md:text-8xl font-light tracking-tighter leading-[0.9]">
              GENERATE <span className="text-white/40 italic">PREMIUM</span> AUDITS.
            </h1>
            <p className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto leading-relaxed">
              Automate website audits. Generate high-quality redesign leads. Convert businesses with data-driven AI reports.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative pt-10"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10 h-32 bottom-0" />
            <div className="glass p-4 rounded-xl max-w-4xl mx-auto shadow-2xl shadow-emerald-500/5 transform">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard Preview" 
                className="w-full h-auto rounded-lg opacity-80"
              />
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedAuditId(null);
        }} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {selectedAuditId && auditData ? (
              <div key="detail">
                <AuditDetailView 
                  audit={auditData} 
                  onBack={() => setSelectedAuditId(null)} 
                />
              </div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {activeTab === "dashboard" && <Dashboard onSelectAudit={setSelectedAuditId} />}
                {activeTab === "prospect" && <LeadProspector />}
                {activeTab === "audits" && <Dashboard onSelectAudit={setSelectedAuditId} />}
                {activeTab === "leads" && <LeadManager />}
                {activeTab === "analytics" && <AgencyInsights />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest py-4 no-print">
          <div>Engine: Gemini-3.1-Pro-Vision-Optimized // Analysis Engine v2.4.1</div>
          <div className="flex gap-6">
            <span>Session: {user?.uid.substring(0, 8)}</span>
            <span className="text-emerald-500">System Status: Optimal</span>
          </div>
        </footer>
      </main>

      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
