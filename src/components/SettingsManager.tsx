import React from "react";
import { auth } from "../lib/firebase";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  CreditCard,
  ChevronRight,
  ExternalLink,
  Key
} from "lucide-react";
import { motion } from "motion/react";

export default function SettingsManager() {
  const user = auth.currentUser;

  const sections = [
    {
      title: "Profile",
      icon: User,
      items: [
        { label: "Display Name", value: user?.displayName || "Not Set", type: "text" },
        { label: "Email Address", value: user?.email || "Not Set", type: "text" },
      ]
    },
    {
      title: "Integrations & API",
      icon: Key,
      items: [
        { 
          label: "Google Maps Platform", 
          value: process.env.GOOGLE_MAPS_PLATFORM_KEY ? "Configured" : "Missing", 
          status: process.env.GOOGLE_MAPS_PLATFORM_KEY ? "success" : "warning",
          description: "Required for Lead Discovery feature."
        },
        { 
          label: "Gemini AI Engine", 
          value: "Active", 
          status: "success",
          description: "Internal orchestration for website analysis."
        }
      ]
    },
    {
      title: "Preferences",
      icon: SettingsIcon,
      items: [
        { label: "Default Currency", value: "USD ($)", type: "select" },
        { label: "Email Notifications", value: "On", type: "toggle" },
      ]
    }
  ];

  return (
    <div className="space-y-10 max-w-4xl">
      <header>
        <h1 className="text-4xl font-light tracking-tighter uppercase">
          System <span className="text-emerald-500 italic">Settings</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Configure your agency dashboard and external integrations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          {sections.map((section) => (
            <button 
              key={section.title}
              className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-white/5 transition-colors group text-left"
            >
              <section.icon size={18} className="text-white/20 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs uppercase font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">
                {section.title}
              </span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-white/5">
             <a 
              href="https://ai.studio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 rounded-xl hover:bg-white/5 transition-colors group text-emerald-500/60"
            >
              <ExternalLink size={18} />
              <span className="text-[10px] uppercase font-bold tracking-widest">Platform Console</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {sections.map((section) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={section.title} 
              className="glass p-8 rounded-2xl space-y-6"
            >
              <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
                <section.icon size={20} className="text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest">{section.title}</h3>
              </div>

              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.label} className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60 font-medium">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        {('status' in item) && (
                          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        )}
                        <span className={`text-[11px] font-mono ${('status' in item) ? (item.status === 'success' ? 'text-emerald-500' : 'text-amber-500') : 'text-white/40'}`}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                    {('description' in item) && (
                      <p className="text-[10px] text-white/20 italic">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <div className="glass p-8 rounded-2xl bg-red-500/5 border-red-500/10">
             <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 flex items-center gap-2 mb-4">
               <Shield size={16} />
               Security Zone
             </h3>
             <p className="text-xs text-white/40 mb-6">
               Access to secret management is handled via the AI Studio platform. 
               API keys and environment variables are encrypted at rest.
             </p>
             <button className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-[10px] font-bold uppercase rounded-lg transition-all border border-red-500/20">
               Rotate Access Tokens
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
