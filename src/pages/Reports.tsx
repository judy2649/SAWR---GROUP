import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Layers,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line
} from "recharts";
import { formatCurrency, cn } from "@/src/lib/utils";

const plData = [
  { name: "Income", amount: 1250000, color: "#1e40af" },
  { name: "Expenses", amount: 480000, color: "#f97316" },
  { name: "Maintenance", amount: 120000, color: "#d4af37" },
  { name: "Taxes", amount: 95000, color: "#64748b" },
];

const cashFlowData = [
  { name: "Mon", in: 120, out: 80 },
  { name: "Tue", in: 450, out: 120 },
  { name: "Wed", in: 180, out: 90 },
  { name: "Thu", in: 320, out: 240 },
  { name: "Fri", in: 590, out: 180 },
  { name: "Sat", in: 210, out: 70 },
  { name: "Sun", in: 150, out: 50 },
];

export default function Reports() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Intelligence & Reports</h2>
          <p className="text-slate-500 mt-1">Advanced property performance analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 text-sm text-slate-600 shadow-sm">
            <Calendar size={16} className="text-sawr-gold" />
            <span className="font-bold">June 2026</span>
          </div>
          <button className="flex items-center gap-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-4 py-2 rounded-xl transition-all shadow-lg glow-gold">
            <Download size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Portfolio Yield", value: "8.4%", icon: BarChart3 },
          { label: "Avg. Rent Rate", value: "USh 52.4k", icon: FileText },
          { label: "Growth Rate", value: "+12.2%", icon: TrendingUp },
          { label: "Retention", value: "94.8%", icon: Layers },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-slate-200 shadow-lg bg-white group hover:border-sawr-gold/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sawr-gold/10 group-hover:text-sawr-gold transition-colors">
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl bg-white">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon size={20} className="text-sawr-orange" />
              Monthly P&L Distribution
            </h3>
            <button className="text-xs font-bold text-sawr-blue hover:underline">Full Breakdown</button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000005" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {plData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl bg-white">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              Weekly Cashflow (In vs Out)
            </h3>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sawr-gold"/> <span className="text-[10px] font-bold text-slate-400">IN</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sawr-orange"/> <span className="text-[10px] font-bold text-slate-400">OUT</span></div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000005" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                />
                <Line type="monotone" dataKey="in" stroke="#d4af37" strokeWidth={3} dot={{ r: 4, fill: "#d4af37" }} />
                <Line type="monotone" dataKey="out" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: "#f97316" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-3xl border border-slate-200 overflow-hidden shadow-xl bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Rent Roll Details</h3>
            <button className="text-xs font-bold text-sawr-blue hover:underline">View Full Ledger</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] font-mono uppercase tracking-wider bg-slate-50">
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Gross Potential</th>
                  <th className="px-6 py-4">Actual Collected</th>
                  <th className="px-6 py-4">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {[
                  { name: "Golden Heights", gross: 1250000, actual: 1180000 },
                  { name: "Safari Park", gross: 3400000, actual: 3200000 },
                  { name: "Riverside Villas", gross: 960000, actual: 960000 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-sawr-blue transition-colors">{row.name}</td>
                    <td className="px-6 py-4 text-slate-500">{formatCurrency(row.gross)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">{formatCurrency(row.actual)}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">-{formatCurrency(row.gross - row.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 text-slate-900 border border-slate-200 relative overflow-hidden flex flex-col justify-between shadow-xl group">
          <div className="relative z-10">
            <h3 className="text-2xl font-display font-bold text-sawr-blue">Owner Statement</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">
              Generate consolidated monthly reports for all property owners including portfolio metrics and net disbursements.
            </p>
          </div>
          
          <div className="mt-8 relative z-10">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 group-hover:border-sawr-gold/30 transition-all shadow-sm">
                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                    <span>Portfolio Score</span>
                    <span className="text-sawr-gold">8.2/10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[82%] h-full bg-sawr-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]"/>
                </div>
            </div>
            <button className="w-full bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold py-3 rounded-xl transition-all shadow-lg glow-gold cursor-pointer">
              Run Statements
            </button>
          </div>

          <Layers className="absolute -bottom-10 -right-10 text-slate-50 group-hover:text-sawr-gold/5 transition-all duration-700" size={240} />
        </div>
      </div>
    </div>
  );
}
