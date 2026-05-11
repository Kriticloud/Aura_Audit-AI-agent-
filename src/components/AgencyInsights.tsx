import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, Target, Activity, Zap, FileText, Users } from "lucide-react";
import { getAgencyInsights } from "../services/auditService";
import { motion } from "motion/react";

export default function AgencyInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await getAgencyInsights();
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 opacity-20">
        <Activity className="w-12 h-12 animate-pulse text-emerald-500" />
        <span className="text-[10px] uppercase tracking-widest">Aggregating Agency Intelligence...</span>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-light tracking-tighter uppercase">
          Agency <span className="text-emerald-500 italic">Insights</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Global performance metrics and revenue potential analysis.</p>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Potential Revenue", value: `$${insights.potentialRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Total Audits", value: insights.totalAudits, icon: FileText, color: "text-white" },
          { label: "High-Value Leads", value: insights.totalLeads, icon: Users, color: "text-blue-500" },
          { label: "Conversion Rate", value: `${insights.leadConversionRate.toFixed(1)}%`, icon: TrendingUp, color: "text-purple-500" },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label} 
            className="glass p-6 rounded-2xl relative overflow-hidden"
          >
            <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 ${stat.color}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-2">{stat.label}</span>
            <span className={`text-3xl font-mono ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Breakdown */}
        <div className="lg:col-span-2 glass p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Zap size={16} className="text-emerald-500" />
              Efficiency Spectrum
            </h3>
            <span className="text-[10px] font-mono text-white/20">Updated in Real-time</span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-white/60">Avg. Portfolio Health</span>
                <span className="font-mono text-sm">{insights.avgOverallScore.toFixed(0)}/100</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${insights.avgOverallScore}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-4 bg-white/5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-white/30 block mb-1">Audit Velocity</span>
                <span className="text-xl font-mono">{(insights.totalAudits / 30).toFixed(1)}/day</span>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-white/30 block mb-1">Lead Desirability</span>
                <span className="text-xl font-mono">{(insights.leadConversionRate / 10).toFixed(1)}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Intensity */}
        <div className="glass p-8 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2 mb-6">
            <Target size={16} className="text-red-500" />
            Strategic Activity
          </h3>
          
          <div className="flex-1 space-y-4">
            {insights.recentAudits.map((audit: any, idx: number) => (
              <div key={audit.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center space-x-3 overflow-hidden">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                   <span className="text-[10px] font-mono truncate text-white/60">{audit.url}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">{audit.scores?.overall || 0}</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-[10px] uppercase font-bold hover:bg-white/5 transition-all">
            Export Historical Data
          </button>
        </div>
      </div>
    </div>
  );
}
