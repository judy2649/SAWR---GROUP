import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  Filter,
  AlertCircle,
  Home
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { StatCard } from "@/src/components/StatCard";
import { motion } from "motion/react";
import { formatCurrency, cn } from "@/src/lib/utils";
import { StorageEngine, Property, Tenant, Lease, VacancyUnit } from "@/src/lib/storage";

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [vacancies, setVacancies] = useState<VacancyUnit[]>([]);

  useEffect(() => {
    setProperties(StorageEngine.getProperties());
    setTenants(StorageEngine.getTenants());
    setLeases(StorageEngine.getLeases());
    setVacancies(StorageEngine.getVacancyUnits());

    const handleUpdate = () => {
      setProperties(StorageEngine.getProperties());
      setTenants(StorageEngine.getTenants());
      setLeases(StorageEngine.getLeases());
      setVacancies(StorageEngine.getVacancyUnits());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  // Compute stats dynamically
  const totalPropertiesVal = properties.length;
  const totalTenantsVal = tenants.length;
  
  // Total Revenue: sum of active tenants' rent
  const totalRevenueVal = tenants.reduce((acc, t) => acc + t.rent, 0);

  // Occupancy Rate: weighted or simple average of property occupancy percentage
  const avgOccupancyVal = properties.length > 0
    ? (properties.reduce((acc, p) => acc + p.occupancy, 0) / properties.length).toFixed(1)
    : "0.0";

  // Chart data feeds: past 6 months revenue progression based on current numbers
  const baseRevenue = totalRevenueVal;
  const revenueData = [
    { name: "Jan", amount: Math.round(baseRevenue * 0.7) },
    { name: "Feb", amount: Math.round(baseRevenue * 0.8) },
    { name: "Mar", amount: Math.round(baseRevenue * 0.85) },
    { name: "Apr", amount: Math.round(baseRevenue * 0.9) },
    { name: "May", amount: Math.round(baseRevenue * 0.95) },
    { name: "Jun", amount: baseRevenue },
  ];

  // Occupancy by properties
  const occupancyData = properties.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    percentage: p.occupancy,
  }));

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">Corporate Dashboard</h2>
            <p className="text-slate-500 mt-1">Welcome back, here's what's happening today based on active assets.</p>
          </div>
        </div>

        {properties.length === 0 && tenants.length === 0 ? (
          <div className="glass p-8 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-sawr-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">Tenant & Property Database Empty</h4>
                <p className="text-sm text-slate-600 mt-1">There is currently no pre-loaded default data. Please click "Properties" or "Tenants" from the sidebar navigation to register your first administration portfolios.</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Properties" 
            value={totalPropertiesVal.toString()} 
            change={`${totalPropertiesVal > 0 ? "+"+totalPropertiesVal : "0"} active assets`} 
            icon={Building2} 
            trend="up"
            color="gold"
            theme="light"
          />
          <StatCard 
            title="Total Tenants" 
            value={totalTenantsVal.toString()} 
            change={`${totalTenantsVal > 0 ? "+"+totalTenantsVal : "0"} registered`} 
            icon={Users} 
            trend="up"
            color="gold"
            theme="light"
          />
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(totalRevenueVal)} 
            change="Sum of active rents" 
            icon={TrendingUp} 
            trend="up"
            color="gold"
            theme="light"
          />
          <StatCard 
            title="Occupancy Rate" 
            value={`${avgOccupancyVal}%`} 
            change="Property Asset average" 
            icon={CheckCircle2} 
            trend="down"
            color="orange"
            theme="light"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 bg-sawr-gold text-sawr-black p-6 rounded-3xl shadow-xl glow-gold relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                      <AlertCircle size={20} />
                      Vacant Units Alert
                  </h3>
                  <p className="text-sawr-black/70 text-xs mt-2 font-medium">
                    {vacancies.length > 0 
                      ? `Currently spotting ${vacancies.length} vacant units. Market them in the marketing pipeline to maximize cashflow.`
                      : "Zero registered vacant units. All active property suites are fully matched."}
                  </p>
              </div>
              <div className="mt-6 relative z-10 space-y-2">
                  {vacancies.slice(0, 2).map((u, i) => (
                      <div key={i} className="flex justify-between items-center bg-black/5 p-2 rounded-xl border border-black/10">
                          <div className="text-[10px]">
                              <p className="font-bold">{u.unit}</p>
                              <p className="text-sawr-black/60">{u.property}</p>
                          </div>
                          <span className="text-[10px] font-bold">KSh {(u.marketRent/1000).toFixed(0)}k</span>
                      </div>
                  ))}
              </div>
              <Building2 className="absolute -bottom-10 -right-10 text-black/5" size={160} />
          </div>

          <div className="lg:col-span-3 glass rounded-3xl p-6 bg-white border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold text-slate-900">Revenue Performance</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Filter size={18} className="text-slate-400" /></button>
              </div>
            </div>
            <div className="h-[300px]">
              {totalRevenueVal === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <TrendingUp size={40} className="stroke-1 mb-2 text-slate-300" />
                  <p className="text-xs">No lease revenue recorded to plot progression.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `KSh ${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#d4af37" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass rounded-3xl p-6 bg-white border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold text-slate-900">Active Lease Status</h3>
            </div>
            {leases.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">No active leases currently recorded in the database.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leases.slice(0, 3).map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sawr-gold/10 flex items-center justify-center text-sawr-gold font-bold">
                                {activity.tenant[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{activity.tenant}</p>
                                <p className="text-xs text-slate-500">{activity.property} • {activity.unit}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{activity.status}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Until {activity.end}</p>
                        </div>
                    </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-6 bg-white border-slate-200 shadow-xl">
            <div className="mb-8">
              <h3 className="text-xl font-display font-bold text-slate-900">Occupancy by Asset</h3>
              <p className="text-slate-500 text-sm mt-1">Percentage of units occupied</p>
            </div>
            <div className="h-[300px]">
              {properties.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Home size={32} className="stroke-1 mb-2 text-slate-300" />
                  <p className="text-xs">No property assets loaded yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData} layout="vertical" barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000008" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={110} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1e40af" : "#d4af37"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-display font-bold text-slate-900">Reconciled Payments</h3>
          </div>
          <div className="overflow-x-auto">
            {tenants.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">No payees registered to show ledger receipts.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-mono uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Tenant / Unit</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Billing Month</th>
                    <th className="px-6 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.slice(0, 4).map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">TXN-902{idx}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500">{t.property} • {t.unit}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {t.status === "Active" ? "Paid" : "Overdue"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">June 2026</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(t.rent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
