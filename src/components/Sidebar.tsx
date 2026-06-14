import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wallet, 
  Wrench, 
  Settings, 
  LogOut,
  ChevronRight,
  MessageSquare,
  BarChart3,
  ScrollText,
  Key,
  BadgeCent
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Properties", path: "/properties" },
  { icon: Key, label: "Vacancy", path: "/vacancy" },
  { icon: Users, label: "Tenants", path: "/tenants" },
  { icon: ScrollText, label: "Leases", path: "/leases" },
  { icon: Wallet, label: "Finance", path: "/finance" },
  { icon: BadgeCent, label: "Expenses", path: "/expenses" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: MessageSquare, label: "Communication", path: "/communications" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 flex flex-col bg-white h-screen sticky top-0 md:relative z-40">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <img 
            src="/src/assets/images/sawr_logo_1781434320923.jpg" 
            alt="SAWR GROUP" 
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
              isActive 
                ? "bg-sawr-gold text-sawr-black shadow-lg glow-gold" 
                : "text-slate-500 hover:text-sawr-blue hover:bg-slate-50"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn(isActive ? "text-sawr-black" : "text-slate-400 group-hover:text-sawr-blue")} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute right-2"
                  >
                    <ChevronRight size={14} className="text-sawr-black/30" />
                  </motion.div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-sawr-orange hover:bg-slate-50 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
