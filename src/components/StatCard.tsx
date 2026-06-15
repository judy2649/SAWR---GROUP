import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
  color: "blue" | "gold" | "orange";
  theme?: "light" | "dark";
}

export function StatCard({ title, value, change, icon: Icon, trend, color, theme = "light" }: StatCardProps) {
  const colorMap = {
    blue: "text-sawr-blue bg-sawr-blue/10 border-sawr-blue/20",
    gold: "text-sawr-gold bg-sawr-gold/10 border-sawr-gold/20",
    orange: "text-sawr-orange bg-sawr-orange/10 border-sawr-orange/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={cn(
        "p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden group transition-all bg-white border border-slate-200 shadow-sm hover:shadow-md",
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", colorMap[color])}>
          <Icon size={20} />
        </div>
        <div className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-md",
          trend === "up" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
          trend === "down" ? "bg-red-50 text-red-600 border border-red-100" :
          "bg-slate-50 text-slate-600 border border-slate-100"
        )}>
          {change}
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
        <p className="text-xl font-bold mt-1 text-slate-900">{value}</p>
      </div>

      <div className={cn(
        "absolute -bottom-6 -right-6 w-20 h-20 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
        color === "blue" ? "bg-sawr-blue" : color === "gold" ? "bg-sawr-gold" : "bg-sawr-orange"
      )}></div>
    </motion.div>
  );
}
