import { Search, Bell, User, Calendar, Menu } from "lucide-react";
import { format } from "date-fns";

export function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className="h-20 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-500 hover:text-sawr-gold lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search properties, tenants..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sawr-gold/20 focus:border-sawr-gold transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar size={16} />
          <span className="text-xs font-medium">{format(new Date(), "MMMM do, yyyy")}</span>
        </div>

        <button className="relative text-slate-400 hover:text-sawr-blue transition-colors p-2">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-sawr-orange rounded-full border-2 border-white"></span>
        </button>

        <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide group-hover:text-sawr-gold transition-colors">Judith Oyoo</p>
            <p className="text-[10px] text-sawr-gold font-bold tracking-widest uppercase">Group Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sawr-black border border-sawr-gold flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-sawr-gold/20 transition-all">
            <User className="text-sawr-gold" size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
