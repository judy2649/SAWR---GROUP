import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  FileCheck, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
  PenTool,
  Wallet,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, Lease, Tenant, Property } from "@/src/lib/storage";

export default function Leases() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form State
  const [formData, setFormData] = useState({
    tenant: "",
    property: "",
    unit: "",
    start: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    status: "Active",
    risk: "Low"
  });

  useEffect(() => {
    setLeases(StorageEngine.getLeases());
    
    const loadedTenants = StorageEngine.getTenants();
    setTenants(loadedTenants);
    if (loadedTenants.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        tenant: loadedTenants[0].name,
        property: loadedTenants[0].property,
        unit: loadedTenants[0].unit
      }));
    }

    const loadedProps = StorageEngine.getProperties();
    setProperties(loadedProps);

    const handleUpdate = () => {
      setLeases(StorageEngine.getLeases());
      setTenants(StorageEngine.getTenants());
      setProperties(StorageEngine.getProperties());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "tenant") {
      const selectedTenantObj = tenants.find(t => t.name === value);
      if (selectedTenantObj) {
        setFormData(prev => ({ 
          ...prev, 
          tenant: value,
          property: selectedTenantObj.property,
          unit: selectedTenantObj.unit
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenant || !formData.property) return;

    const newLease: Lease = {
      id: `L-${Date.now().toString().slice(-4)}`,
      tenant: formData.tenant,
      property: formData.property,
      unit: formData.unit || "N/A",
      start: formData.start,
      end: formData.end,
      status: formData.status,
      risk: formData.risk
    };

    const updated = [newLease, ...leases];
    StorageEngine.saveLeases(updated);
    setLeases(updated);
    setIsModalOpen(false);
    setFormData({
      tenant: tenants.length > 0 ? tenants[0].name : "",
      property: tenants.length > 0 ? tenants[0].property : "",
      unit: tenants.length > 0 ? tenants[0].unit : "",
      start: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Active",
      risk: "Low"
    });
  };

  const filteredLeases = leases.filter(l => {
    const matchesSearch = l.tenant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.property.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.unit.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && l.status === statusFilter;
  });

  // Calculate stats dynamically
  const activeCount = leases.filter(l => l.status === "Active").length;
  const expiringCount = leases.filter(l => l.status === "Expiring").length;
  const draftCount = leases.filter(l => l.status === "Draft").length;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Lease Management</h2>
          <p className="text-slate-500 mt-1">E-signatures, renewals, expiries & templates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-all text-sm font-bold text-slate-700 shadow-sm">
            <PenTool size={18} className="text-sawr-gold" />
            <span>Manage Templates</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2 rounded-xl transition-all shadow-lg glow-gold flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            <span>New Lease</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Leases", count: activeCount, icon: FileCheck, color: "gold" },
          { label: "Expiring Soon", count: expiringCount, icon: Clock, color: "orange" },
          { label: "Drafts", count: draftCount, icon: AlertTriangle, color: "slate" },
          { label: "Pending Signatures", count: draftCount, icon: PenTool, color: "blue" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
              stat.color === "gold" ? "bg-sawr-gold/10 text-sawr-gold border border-sawr-gold/20" :
              stat.color === "orange" ? "bg-sawr-orange/10 text-sawr-orange border border-sawr-orange/20" :
              stat.color === "blue" ? "bg-sawr-blue/10 text-sawr-blue border border-sawr-blue/20" :
              "bg-slate-100 text-slate-500 border border-slate-200"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {filteredLeases.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border-slate-200 bg-white shadow-xl max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-sawr-gold/10 rounded-full flex items-center justify-center mx-auto text-sawr-gold mb-6">
                <FileCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Leases Logged Yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">
                {searchQuery || statusFilter !== "All" ? "No leases match your filters." : "Track legally binding leases, automate signing triggers, and configure reminder patterns."}
              </p>
              {!searchQuery && statusFilter === "All" && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Execute First Lease</span>
                </button>
              )}
            </div>
          ) : (
            <div className="glass rounded-3xl overflow-hidden border-slate-200 shadow-xl bg-white">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-display font-bold text-slate-900">Lease Directory</h3>
                  <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    {["All", "Active", "Expiring", "Draft"].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={cn(
                          "px-3 py-1 text-xs font-bold rounded-md transition-all",
                          statusFilter === tab ? "bg-sawr-gold text-sawr-black shadow-sm" : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search leases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sawr-gold w-64 text-slate-900 shadow-sm"
                  />
                </div>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                    <th className="px-6 py-4">Lease ID</th>
                    <th className="px-6 py-4">Tenant</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">E-Signature</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-sawr-gold font-bold">{lease.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {lease.tenant[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{lease.tenant}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-tight font-medium">{lease.property} • {lease.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">Until <span className={cn(lease.status === "Expiring" ? "text-rose-500 font-bold" : "text-slate-900")}>{lease.end}</span></p>
                      </td>
                      <td className="px-6 py-4">
                        {lease.status === "Draft" ? (
                          <button className="flex items-center gap-1.5 text-sawr-blue hover:underline text-[10px] font-bold uppercase">
                            <PenTool size={12} />
                            Request Signature
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase">
                            <FileCheck size={12} />
                            Signed
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                          lease.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          lease.status === "Expiring" ? "bg-sawr-orange/5 text-sawr-orange border border-sawr-orange/10" :
                          "bg-slate-50 text-slate-500 border border-slate-100"
                        )}>
                          {lease.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total executed: {leases.length}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-200 shadow-lg bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Wallet size={20} className="text-sawr-gold" />
              Recent Billings
            </h3>
            <div className="space-y-4 text-slate-500 text-xs">
              <p>Execute leases to schedule automated invoicing rails for matching corporate tenants.</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-900">Instant Digital Signing</p>
                <p className="text-[10px] text-slate-400 mt-1">Legatory options generated electronically using secure, encrypted PDF frameworks.</p>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
            <h3 className="text-lg font-bold text-sawr-gold mb-2 relative z-10">Manual Renewals</h3>
            <p className="text-xs text-slate-400 mb-6 relative z-10">Generate automated renewal options for expiring leases with adjusted rent terms.</p>
            <button className="w-full bg-sawr-gold text-sawr-black font-bold py-3 rounded-xl hover:bg-gold-600 transition-all shadow-lg glow-gold relative z-10">
              Bulk Process Renewals
            </button>
            <Clock className="absolute -bottom-6 -right-6 text-white/5 group-hover:text-sawr-gold/5 transition-all duration-700" size={140} />
          </div>
        </div>
      </div>

      {/* Add Lease Modal */}
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
                  <h3 className="text-xl font-bold text-slate-900">Prepare Electronic Lease</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddLease} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Tenant Link</label>
                  {tenants.length === 0 ? (
                    <input 
                      name="tenant"
                      type="text"
                      required
                      value={formData.tenant}
                      onChange={handleInputChange}
                      placeholder="e.g. Alice Mwangi"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  ) : (
                    <select
                      name="tenant"
                      value={formData.tenant}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="">-- Choose Tenant --</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.property})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Asset</label>
                    <input 
                      name="property"
                      type="text"
                      required
                      value={formData.property}
                      onChange={handleInputChange}
                      placeholder="e.g. Golden Heights"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit / Box</label>
                    <input 
                      name="unit"
                      type="text"
                      required
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="e.g. Suite 3B"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none/50 focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                    <input 
                      name="start"
                      type="text" 
                      required
                      value={formData.start}
                      onChange={handleInputChange}
                      placeholder="e.g. Jan 01, 2026"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                    <input 
                      name="end"
                      type="text" 
                      required
                      value={formData.end}
                      onChange={handleInputChange}
                      placeholder="e.g. Dec 31, 2026"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lease Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Expiring">Expiring</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Segment</label>
                    <select
                      name="risk"
                      value={formData.risk}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                      <option value="N/A">N/A</option>
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
                    Generate Contract
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
