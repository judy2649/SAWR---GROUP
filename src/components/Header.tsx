import { Search, Bell, User, Calendar } from "lucide-react";
import { format } from "date-fns";

export function Header() {
  return (
    <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white/70 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search properties, tenants, or invoices..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sawr-gold/20 focus:border-sawr-gold transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar size={16} />
          <span className="text-xs font-medium">{format(new Date(), "MMMM do, yyyy")}</span>
        </div>

        <button className="relative text-slate-400 hover:text-sawr-blue transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sawr-orange rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Judith Oyoo</p>
            <p className="text-[10px] text-sawr-gold font-mono uppercase tracking-tight font-bold">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sawr-gold/10 border border-sawr-gold/20 flex items-center justify-center overflow-hidden">
            <User className="text-sawr-gold" size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}
