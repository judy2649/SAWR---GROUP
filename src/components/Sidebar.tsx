import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Wallet, 
  Wrench, 
  LogOut,
  ChevronRight,
  MessageSquare,
  BarChart3,
  ScrollText,
  Key,
  BadgeCent,
  X,
  ShoppingBag
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const adminMenuItems = [
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

const clientMenuItems = [
  { icon: LayoutDashboard, label: "Client Portal", path: "/" },
  { icon: Building2, label: "Browse Assets", path: "/properties" },
  { icon: ShoppingBag, label: "My Bookings", path: "/my-bookings" },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const role = localStorage.getItem("sawr_role") || "client";
  const menuItems = role === "admin" ? adminMenuItems : clientMenuItems;

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white shadow-2xl lg:shadow-none flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex flex-col gap-4 w-full">
          <img 
            src="/src/assets/images/sawr_logo_1781434320923.jpg" 
            alt="SAWR GROUP" 
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-slate-400 hover:text-sawr-gold hover:bg-slate-50 rounded-lg absolute top-4 right-4"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
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
                <span className="font-medium text-sm lg:text-base">{item.label}</span>
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
        <button 
          onClick={() => {
            localStorage.setItem("sawr_auth", "false");
            window.location.reload();
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-sawr-orange hover:bg-slate-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm lg:text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
