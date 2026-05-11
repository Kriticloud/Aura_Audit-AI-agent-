import { ArrowLeft, Share2, Mail, MessageSquare, Linkedin, Download, Copy, CheckCircle2, ChevronRight, Globe, AlertTriangle, Image as ImageIcon, Loader2 } from "lucide-react";
import ScoreDial from "./ScoreDial";
import { motion } from "motion/react";
import { useState } from "react";
import { generateMockup } from "../services/auditService";
import { toast } from "sonner";

interface AuditDetailViewProps {
  audit: any;
  onBack: () => void;
}

export default function AuditDetailView({ audit, onBack }: AuditDetailViewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [mockupUrl, setMockupUrl] = useState<string | null>(audit.mockupUrl || null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleGenerateMockup = async () => {
    setIsGeneratingMockup(true);
    try {
      const url = await generateMockup(audit.id);
      setMockupUrl(url);
      toast.success("AI Mockup Generated!");
    } catch (err) {
      toast.error("Failed to generate mockup");
    } finally {
      setIsGeneratingMockup(false);
    }
  };

  const handlePrint = () => {
    toast.info("Preparing report for export...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleShare = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?auditId=${audit.id}`;
    
    // Explicitly copy to clipboard first to ensure reliability
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      console.error("Clipboard failed", err);
    }

    const shareData = {
      title: `Aura Audit - ${audit.url}`,
      text: `Check out this AI-powered website audit for ${audit.url}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, we already copied it
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md py-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white no-print"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-xl tracking-tight leading-none">{audit.url}</h2>
            <span className="text-xs text-white/30">Audit Report • {new Date(audit.createdAt?.seconds * 1000).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 no-print">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-black text-xs font-bold rounded hover:bg-white/90 transition-colors uppercase"
          >
            <Download size={14} />
            <span>Export PDF</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500 transition-colors uppercase shadow-lg shadow-emerald-900/20"
          >
            <Share2 size={14} />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      {/* Main Scores Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="lg:col-span-1 glass p-4 rounded-xl flex flex-col items-center justify-center bg-emerald-500/5 border-emerald-500/20">
          <ScoreDial score={audit.scores.overall} label="Overall Score" size={90} />
        </div>
        <div className="glass p-4 rounded-xl flex flex-col items-center justify-center">
          <ScoreDial score={audit.scores.uiux} label="UI/UX" size={80} />
        </div>
        <div className="glass p-4 rounded-xl flex flex-col items-center justify-center">
          <ScoreDial score={audit.scores.branding} label="Branding" size={80} />
        </div>
        <div className="glass p-4 rounded-xl flex flex-col items-center justify-center">
          <ScoreDial score={audit.scores.conversion} label="Conversion" size={80} />
        </div>
        <div className="glass p-4 rounded-xl flex flex-col items-center justify-center">
          <ScoreDial score={audit.scores.mobile} label="Mobile" size={80} />
        </div>
        <div className="glass p-4 rounded-xl flex flex-col items-center justify-center">
          <ScoreDial score={audit.scores.seo} label="SEO" size={80} />
        </div>
        <div className="glass p-4 rounded-xl flex flex-col items-center justify-center">
          <ScoreDial score={audit.scores.trust} label="Trust" size={80} />
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Visual Captures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 glass rounded-2xl overflow-hidden group relative">
               <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Desktop Capture</span>
                  <Globe size={14} className="text-white/20" />
               </div>
               {audit.screenshotUrl ? (
                 <img src={audit.screenshotUrl} alt="Desktop Capture" className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center text-white/20">No Capture</div>
               )}
            </div>
            <div className="glass rounded-2xl overflow-hidden group relative">
               <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Mobile</span>
               </div>
               {audit.mobileScreenshotUrl ? (
                 <img src={audit.mobileScreenshotUrl} alt="Mobile Capture" className="w-full h-full min-h-[300px] object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <div className="w-full h-full min-h-[300px] bg-zinc-900 flex items-center justify-center text-white/20">No Capture</div>
               )}
            </div>
          </div>

          {/* Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "UI/UX Analysis", content: audit.analysis.uiux, score: audit.scores.uiux },
              { title: "Conversion Flow", content: audit.analysis.conversion, score: audit.scores.conversion },
              { title: "Branding & Trust", content: audit.analysis.branding, score: audit.scores.branding },
              { title: "Mobile Experience", content: audit.analysis.mobile, score: audit.scores.mobile },
            ].map((section, idx) => (
              <div key={idx} className="glass p-6 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white/90">{section.title}</h3>
                  <span className={`text-sm font-bold font-mono ${getScoreColor(section.score)}`}>{section.score}/100</span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Recommendations List */}
          <div className="glass p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <CheckCircle2 className="text-green-500" size={24} />
              <span>Strategic Recommendations</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {audit.recommendations.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="mt-1 w-5 h-5 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Redesign Vision */}
          <div className="glass p-8 rounded-2xl space-y-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 h-full flex flex-col justify-center opacity-5 pointer-events-none text-emerald-500">
              <Globe size={200} />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-sm font-bold flex items-center space-x-2 uppercase tracking-widest text-white/40">
                <ImageIcon className="text-emerald-500" size={18} />
                <span>AI Redesign Vision</span>
              </h3>
              {!mockupUrl ? (
                <button 
                  onClick={handleGenerateMockup}
                  disabled={isGeneratingMockup}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 no-print"
                >
                  {isGeneratingMockup ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generating Prototype...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={14} />
                      <span>Generate AI Mockup</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  Mockup Ready
                </div>
              )}
            </div>

            {mockupUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl z-10"
              >
                <img src={mockupUrl} alt="Redesign Mockup" className="w-full h-auto" referrerPolicy="no-referrer" />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/40 bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                  AI-Generated Concept • 2026-v2.1
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Visual Direction</label>
                  <p className="text-sm text-white/80">{audit.redesignVision.direction}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Typography</label>
                  <p className="text-sm text-white/80 font-mono">{audit.redesignVision.typography}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Suggested Palette</label>
                  <div className="flex space-x-2 mt-2">
                    {audit.redesignVision.colors.map((color: string, idx: number) => (
                      <div key={idx} className="group relative">
                        <div 
                          className="w-10 h-10 rounded-lg border border-white/10" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono whitespace-nowrap bg-black/80 px-1 rounded">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Animation Concept</label>
                  <p className="text-sm text-white/80 italic">"{audit.redesignVision.animations}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outreach Sidebar */}
        <div className="space-y-8 no-print">
          {/* Urgency Card */}
          <div className="glass p-6 rounded-2xl bg-red-500/5 border-red-500/20 space-y-4">
            <div className="flex items-center space-x-2 text-red-500 font-bold">
              <AlertTriangle size={20} />
              <span>Redesign Urgency</span>
            </div>
            <div className="text-4xl font-bold font-mono">{audit.scores.urgency}%</div>
            <p className="text-xs text-white/60 leading-relaxed italic">
              "Biggest missed opportunity: {audit.outreach.missedOpportunity}"
            </p>
          </div>

          {/* Outreach Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest px-1">Automated Outreach</h3>
            
            {/* Email */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Email Template</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(audit.outreach.email, 'email')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copiedSection === 'email' ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-white/60 line-clamp-4 leading-relaxed font-serif italic">
                  {audit.outreach.email}
                </p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Linkedin size={16} className="text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">LinkedIn DM</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(audit.outreach.linkedin, 'linkedin')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copiedSection === 'linkedin' ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                  {audit.outreach.linkedin}
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-green-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Message</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(audit.outreach.whatsapp, 'whatsapp')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copiedSection === 'whatsapp' ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                  {audit.outreach.whatsapp}
                </p>
              </div>
            </div>
          </div>

          {/* Lead Summary */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white/90">Lead Potential</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Lead Quality</span>
                <span className="font-mono text-sm font-bold text-green-500">{audit.scores.leadQuality}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-white/40 font-bold">Investment Potential</span>
                <span className="font-mono text-sm font-bold text-emerald-500">${(audit.scores.investmentPotential * 100).toLocaleString()}+</span>
              </div>
            </div>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center space-x-2 group">
              <span>Mark as Contacted</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
