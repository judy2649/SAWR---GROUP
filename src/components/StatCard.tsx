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
      whileHover={{ y: -5 }}
      className={cn(
        "p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group transition-all bg-white border border-slate-200 shadow-sm hover:shadow-md",
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", colorMap[color])}>
          <Icon size={24} />
        </div>
        <div className={cn(
          "text-xs font-bold px-2.5 py-1 rounded-full",
          trend === "up" ? "bg-emerald-500/10 text-emerald-500" : 
          trend === "down" ? "bg-red-500/10 text-red-500" :
          "bg-slate-500/10 text-slate-500"
        )}>
          {change}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-bold mt-1 text-slate-900">{value}</p>
      </div>

      <div className={cn(
        "absolute -bottom-6 -right-6 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
        color === "blue" ? "bg-sawr-blue" : color === "gold" ? "bg-sawr-gold" : "bg-sawr-orange"
      )}></div>
    </motion.div>
  );
}
