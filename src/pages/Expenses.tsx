import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Search, 
  Plus, 
  TrendingUp, 
  ArrowUpCircle, 
  FileText,
  Building,
  MoreVertical,
  Calendar,
  CreditCard,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, Expense, Property } from "@/src/lib/storage";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    property: "",
    vendor: "",
    amount: "",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    status: "Paid"
  });

  useEffect(() => {
    setExpenses(StorageEngine.getExpenses());
    const loadedProps = StorageEngine.getProperties();
    setProperties(loadedProps);
    if (loadedProps.length > 0) {
      setFormData(prev => ({ ...prev, property: loadedProps[0].name }));
    }

    const handleUpdate = () => {
      setExpenses(StorageEngine.getExpenses());
      setProperties(StorageEngine.getProperties());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.property || !formData.amount) return;

    const newExpense: Expense = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      category: formData.category,
      property: formData.property,
      vendor: formData.vendor || "Direct Pay",
      amount: Number(formData.amount) || 0,
      date: formData.date,
      status: formData.status
    };

    const updated = [newExpense, ...expenses];
    StorageEngine.saveExpenses(updated);
    setExpenses(updated);
    setIsModalOpen(false);
    setFormData({
      category: "",
      property: properties.length > 0 ? properties[0].name : "",
      vendor: "",
      amount: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Paid"
    });
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Analytics
  const totalPaid = expenses.filter(e => e.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = expenses.filter(e => e.status === "Pending" || e.status === "Overdue").reduce((acc, curr) => acc + curr.amount, 0);
  const totalAll = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Expense Management</h2>
          <p className="text-slate-500 mt-1">Track operating costs and vendor disbursements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-4 py-2 rounded-xl transition-all shadow-lg glow-gold flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Operating Expenses (MTD)", value: `KSh ${totalAll.toLocaleString()}`, trend: "Fully dynamic", color: "blue", icon: CreditCard },
          { label: "Approved / Paid (YTD)", value: `KSh ${totalPaid.toLocaleString()}`, trend: "Settled invoices", color: "gold", icon: Receipt },
          { label: "Unpaid / Pending", value: `KSh ${totalPending.toLocaleString()}`, trend: `${expenses.filter(e => e.status !== "Paid").length} Actions Pending`, color: "orange", icon: Calendar },
        ].map((item, i) => (
          <div key={i} className="glass p-6 rounded-2xl bg-white shadow-lg border border-slate-200 flex items-center gap-6 group hover:border-sawr-gold/30 transition-all">
             <div className={cn(
               "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
               item.color === "blue" ? "bg-blue-50 text-blue-600" :
               item.color === "gold" ? "bg-sawr-gold/10 text-sawr-gold" :
               "bg-rose-50 text-sawr-orange"
             )}>
                <item.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">{item.trend}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {filteredExpenses.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border-slate-200 bg-white shadow-md">
              <div className="w-16 h-16 bg-sawr-orange/10 rounded-full flex items-center justify-center mx-auto text-sawr-orange mb-6">
                <Receipt size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Expenses Logged Yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">
                {searchQuery ? "No entries match your search filters." : "Log and reconcile property bills, operations maintenance receipts, and administrator expenses."}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Log Expense invoice</span>
                </button>
              )}
            </div>
          ) : (
            <div className="glass rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xl font-display font-bold text-slate-900">Recent Transactions</h3>
                  <div className="flex items-center gap-2">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                          type="text" 
                          placeholder="Filter expenses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-sawr-gold w-40 text-slate-900"
                        />
                      </div>
                  </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                      <th className="px-6 py-4">Expense ID</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-sawr-gold font-bold">{exp.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{exp.category}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tight">{exp.vendor}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <Building size={12} className="text-sawr-gold" />
                            {exp.property}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">KSh {exp.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">{exp.date}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                            exp.status === "Paid" ? "text-emerald-600 bg-emerald-50" :
                            exp.status === "Overdue" ? "text-sawr-orange bg-rose-50" :
                            "text-slate-500 bg-slate-50"
                          )}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl bg-white border border-slate-200 shadow-xl">
             <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-sawr-gold" />
                Operating Insights
             </h3>
             <div className="space-y-4 text-slate-600 text-xs leading-relaxed">
               <p>
                 Expenses tracked through the core SAWR platform automatically feed the monthly P&L and corporate reporting logs.
               </p>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="font-bold text-slate-900 text-xs">Expense Audit Safe</p>
                 <p className="text-[10px] text-slate-500 mt-1">
                   Keep a digitized ledger with direct receipts linked to property sheets. All registered invoices are fully exportable.
                 </p>
               </div>
             </div>
          </div>

          <div className="bg-sawr-blue rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
            <h3 className="text-xl font-display font-bold relative z-10">Direct Vendor Payment</h3>
            <p className="text-white/70 text-xs mt-2 relative z-10 leading-relaxed">
              Automate payouts to approved service vendors through M-PESA Business API.
            </p>
            <button className="mt-6 w-full py-3 bg-white text-sawr-blue font-bold rounded-xl text-sm relative z-10 transition-transform hover:scale-105 active:scale-95 shadow-lg">
              Set Up Auto-Pay
            </button>
            <ArrowUpCircle className="absolute -bottom-10 -right-10 text-white/5" size={180} />
          </div>
        </div>
      </div>

      {/* Add Expense Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 justify-between flex items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-sawr-gold" />
                  <h3 className="text-xl font-bold text-slate-900">Record Operational Expense</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Item / Category</label>
                  <input 
                    name="category"
                    type="text" 
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Ground Maintenance, Water Bills"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Property</label>
                    {properties.length === 0 ? (
                      <input 
                        name="property"
                        type="text"
                        required
                        value={formData.property}
                        onChange={handleInputChange}
                        placeholder="Type property name..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                      />
                    ) : (
                      <select
                        name="property"
                        value={formData.property}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                      >
                        {properties.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor / Beneficiary</label>
                    <input 
                      name="vendor"
                      type="text" 
                      required
                      value={formData.vendor}
                      onChange={handleInputChange}
                      placeholder="e.g. SGS Security, GreenThumb Ltd"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid/Owed (KSh)</label>
                    <input 
                      name="amount"
                      type="number" 
                      required
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="e.g. 25000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bill Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
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
                    Log Expense
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
