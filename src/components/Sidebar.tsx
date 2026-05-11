import { LayoutDashboard, FileText, Users, Settings, LogOut, BarChart3, Zap } from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "prospect", icon: Zap, label: "Lead Prospector" },
    { id: "audits", icon: FileText, label: "All Audits" },
    { id: "leads", icon: Users, label: "Lead Manager" },
    { id: "analytics", icon: BarChart3, label: "Agency Insights" },
  ];

  return (
    <div className="w-64 h-full border-r border-white/10 flex flex-col p-6 space-y-8 no-print">
      <div className="flex items-center space-x-3 px-2">
        <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center">
          <FileText className="text-black w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tighter">AURA <span className="text-[#10b981] italic">AUDIT</span></span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-6 border-t border-white/10 space-y-2">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-white/50 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-red-400/70 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
