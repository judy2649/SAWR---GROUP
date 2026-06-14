import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Receipt, 
  FileText,
  AlertCircle,
  X,
  Sparkles
} from "lucide-react";
import { formatCurrency, cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, Tenant, Expense, Property } from "@/src/lib/storage";

export default function Finance() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Recording standard Payments
  const [formData, setFormData] = useState({
    tenantName: "",
    amount: "",
    method: "M-PESA Paybill",
    reference: "",
  });

  useEffect(() => {
    setTenants(StorageEngine.getTenants());
    setExpenses(StorageEngine.getExpenses());
    setProperties(StorageEngine.getProperties());

    const handleUpdate = () => {
      setTenants(StorageEngine.getTenants());
      setExpenses(StorageEngine.getExpenses());
      setProperties(StorageEngine.getProperties());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const totalReceivables = tenants.reduce((acc, t) => acc + t.rent, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netCashflow = totalReceivables - totalExpenses;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantName || !formData.amount) return;

    // Simulate instant matching & confirmation by updating tenant status or confirming ledger receipt
    const matchingTenant = tenants.find(t => t.name.toLowerCase() === formData.tenantName.toLowerCase());
    if (matchingTenant) {
      const updatedTenants = tenants.map(t => {
        if (t.id === matchingTenant.id) {
          return { ...t, status: "Active" }; // Mark active/paid on payment record
        }
        return t;
      });
      StorageEngine.saveTenants(updatedTenants);
      setTenants(updatedTenants);
    }
    setIsModalOpen(false);
    setFormData({
      tenantName: "",
      amount: "",
      method: "M-PESA Paybill",
      reference: "",
    });
  };

  // Build categories list dynamically from expenses
  const categorySummary: { [key: string]: number } = {};
  expenses.forEach(e => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
  });

  const categories = Object.entries(categorySummary).map(([label, amount]) => {
    const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
    return { label, amount, percentage };
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 uppercase tracking-widest">SAWR Finances</h2>
          <p className="text-sawr-gold font-bold tracking-[0.2em] text-[10px] sm:text-xs mt-2 uppercase">Real Estate | Investments</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-all font-bold text-slate-700 shadow-sm">
            <FileText size={18} className="text-sawr-gold" />
            <span>Generate Report</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-4 py-2 rounded-xl transition-all shadow-lg glow-gold cursor-pointer"
          >
            <Plus size={18} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Receivables", value: totalReceivables, sub: "Pending invoices sum", color: "blue" },
          { label: "Operating Expenses", value: totalExpenses, sub: "Repairs & Utilities logged", color: "orange" },
          { label: "Net Cashflow", value: netCashflow, sub: "Calculated corporate profit", color: "gold" },
        ].map((item, i) => (
          <div key={i} className="glass p-6 rounded-2xl relative overflow-hidden group shadow-sm bg-white border-slate-200">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(item.value)}</p>
            <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
            <div className={cn(
              "absolute -bottom-2 -right-2 p-2 opacity-5 group-hover:opacity-10 transition-opacity",
              item.color === "blue" ? "text-sawr-blue" : item.color === "orange" ? "text-sawr-orange" : "text-sawr-gold"
            )}>
              {item.color === "blue" ? <ArrowUpRight size={64} /> : item.color === "orange" ? <ArrowDownRight size={64} /> : <Receipt size={64} />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-3xl overflow-hidden shadow-xl border-slate-200 bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-display font-bold text-slate-900">M-PESA / Bank Reconciliation</h3>
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">AUTO-MATCHING LIVE</span>
            </div>
          </div>
          
          {tenants.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No tenants registered yet to generate MPESA match suggestions.</p>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span className="font-medium">Recent payment references match registered active suites.</span>
                </p>
              </div>
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] font-mono uppercase tracking-wider bg-slate-50">
                      <th className="px-6 py-4">Ref / Source</th>
                      <th className="px-6 py-4">Statement Date</th>
                      <th className="px-6 py-4">Matching Unit</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">Confirm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {tenants.slice(0, 3).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs text-sawr-gold font-bold">QRE829{i}0X</p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">M-PESA Paybill</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">Today, 10:20 AM</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{row.unit} ({row.name})</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1 border border-blue-100 rounded font-bold">98% Match</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(row.rent)}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="bg-sawr-gold text-sawr-black px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-gold-600">Approve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl flex flex-col bg-white">
            <h3 className="text-xl font-display font-medium text-slate-900 mb-6">Expense Categories Summary</h3>
            {categories.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                No logged expenses to graph categories.
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                  {categories.map((cat, i) => (
                      <div key={i} className="space-y-2">
                          <div className="flex justify-between text-sm">
                              <span className="font-bold text-slate-700">{cat.label}</span>
                              <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden font-bold">
                              <div className="h-full rounded-full bg-sawr-gold" style={{ width: `${cat.percentage}%` }} />
                          </div>
                      </div>
                  ))}
              </div>
            )}
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-xl border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-display font-bold text-slate-900">Recent Generated Invoices</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          {tenants.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No active tenants registered to generate monthly invoice copies.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] font-mono uppercase tracking-wider bg-slate-50">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tenants.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-sawr-gold font-bold">INV-2026-00{idx + 1}</td>
                    <td className="px-6 py-4 text-slate-500">June 25, 2026</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{t.name}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(t.rent)}</td>
                    <td className="px-6 py-4 text-xs font-bold">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md",
                        t.status === "Active" ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-50"
                      )}>
                        {t.status === "Active" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sawr-blue text-xs font-bold hover:underline">Download PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 justify-between flex items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-sawr-gold" />
                  <h3 className="text-lg font-bold text-slate-900">Reconcile Manual Payment</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Name</label>
                  <input 
                    name="tenantName"
                    type="text" 
                    required
                    value={formData.tenantName}
                    onChange={handleInputChange}
                    placeholder="e.g. Alice Mwangi"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid (KSh)</label>
                    <input 
                      name="amount"
                      type="number" 
                      required
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="e.g. 45000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Method</label>
                    <select
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="M-PESA Paybill">M-PESA Paybill</option>
                      <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                      <option value="Cheque Deposit">Cheque Deposit</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Code / Ref ID</label>
                  <input 
                    name="reference"
                    type="text" 
                    required
                    value={formData.reference}
                    onChange={handleInputChange}
                    placeholder="e.g. QRE82910X"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black rounded-xl text-xs font-bold uppercase transition-all shadow-md"
                  >
                    Post Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
