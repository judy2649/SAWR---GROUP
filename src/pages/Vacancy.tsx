import React, { useState, useEffect } from "react";
import { 
  Home, 
  Search, 
  MapPin, 
  Clock, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  Filter,
  Plus,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, VacancyUnit, Property } from "@/src/lib/storage";

export default function Vacancy() {
  const [vacancies, setVacancies] = useState<VacancyUnit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Form State
  const [formData, setFormData] = useState({
    property: "",
    unit: "",
    type: "2 Bedroom",
    daysOnMarket: "0",
    marketRent: "",
    status: "Ready",
    leads: "0"
  });

  useEffect(() => {
    setVacancies(StorageEngine.getVacancyUnits());
    const loadedProps = StorageEngine.getProperties();
    setProperties(loadedProps);
    if (loadedProps.length > 0) {
      setFormData(prev => ({ ...prev, property: loadedProps[0].name }));
    }

    const handleUpdate = () => {
      setVacancies(StorageEngine.getVacancyUnits());
      setProperties(StorageEngine.getProperties());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.property || !formData.unit) return;

    const newVacancy: VacancyUnit = {
      id: `VACK-${Date.now()}`,
      property: formData.property,
      unit: formData.unit,
      type: formData.type,
      daysOnMarket: Number(formData.daysOnMarket) || 0,
      marketRent: Number(formData.marketRent) || 0,
      status: formData.status,
      leads: Number(formData.leads) || 0
    };

    const updated = [newVacancy, ...vacancies];
    StorageEngine.saveVacancyUnits(updated);
    setVacancies(updated);
    setIsModalOpen(false);
    setFormData({
      property: properties.length > 0 ? properties[0].name : "",
      unit: "",
      type: "2 Bedroom",
      daysOnMarket: "0",
      marketRent: "",
      status: "Ready",
      leads: "0"
    });
  };

  const filteredVacancies = vacancies.filter(v => {
    const matchesSearch = v.unit.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.property.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "All") return matchesSearch;
    return matchesSearch && v.status === activeTab;
  });

  // Analytics helper calculations
  const totalLeads = vacancies.reduce((acc, curr) => acc + curr.leads, 0);
  const totalRevLoss = vacancies.reduce((acc, curr) => acc + curr.marketRent, 0);
  const avgDays = vacancies.length > 0 
    ? Math.round(vacancies.reduce((acc, curr) => acc + curr.daysOnMarket, 0) / vacancies.length) 
    : 0;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Vacancy & Marketing</h2>
          <p className="text-slate-500 mt-1">Manage available inventory and leasing pipelines.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2 rounded-xl transition-all shadow-lg glow-gold flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Availability</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Vacant Units", value: vacancies.length.toString(), sub: "Available now", icon: Home, color: "blue" },
          { label: "Avg. Days on Market", value: `${avgDays} days`, sub: "Listing age metric", icon: Clock, color: "gold" },
          { label: "Active Leads", value: totalLeads.toString(), sub: "Leasing pipeline", icon: TrendingUp, color: "emerald" },
          { label: "Rev. Loss (Est.)", value: `KSh ${(totalRevLoss/1000).toFixed(0)}k`, sub: "Monthly rent impact", icon: ExternalLink, color: "orange" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl bg-white shadow-sm border border-slate-200">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
              stat.color === "blue" ? "bg-blue-50 text-blue-600" :
              stat.color === "gold" ? "bg-sawr-gold/10 text-sawr-gold" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
              "bg-orange-50 text-sawr-orange"
            )}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {filteredVacancies.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border-slate-200 bg-white max-w-2xl mx-auto shadow-md">
          <div className="w-16 h-16 bg-sawr-gold/10 rounded-full flex items-center justify-center mx-auto text-sawr-gold mb-6">
            <Home size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Vacant Units Listed</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            {searchQuery || activeTab !== "All" ? "No vacant units match your criteria." : "All properties are fully occupied! Add list items when tenants depart to manage marketing pipelines."}
          </p>
          {!searchQuery && activeTab === "All" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <Plus size={18} />
              <span>List Vacancy</span>
            </button>
          )}
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-display font-bold text-slate-900">Inventory Status</h3>
              <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                {["All", "Ready", "Listed", "Maintenance"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                      activeTab === tab ? "bg-sawr-gold text-sawr-black shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search units..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sawr-gold w-64 text-slate-900"
                  />
                </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                  <th className="px-6 py-4">Unit / Property</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Days on Market</th>
                  <th className="px-6 py-4">Market Rent</th>
                  <th className="px-6 py-4">Active Leads</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVacancies.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Home size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{unit.unit}</p>
                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <MapPin size={10} className="text-sawr-gold" />
                            {unit.property}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{unit.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-sm font-bold",
                           unit.daysOnMarket > 30 ? "text-rose-500" : "text-slate-900"
                         )}>{unit.daysOnMarket} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">KSh {unit.marketRent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{unit.leads} prospects</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        unit.status === "Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        unit.status === "Listed" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        unit.status === "Maintenance" ? "bg-amber-50 text-sawr-gold border border-sawr-gold/20" :
                        "bg-slate-100 text-slate-500 border border-slate-200"
                      )}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sawr-blue text-xs font-bold hover:underline">Manage Listing</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Vacancy Modal */}
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
                  <h3 className="text-xl font-bold text-slate-900">List Vacant Unit</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddVacancy} className="p-6 space-y-4">
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit / Ste #</label>
                    <input 
                      name="unit"
                      type="text"
                      required
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="e.g. Villa 2, Suite 10"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Type</label>
                    <input 
                      name="type"
                      type="text"
                      required
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="e.g. 2 Bedroom, Commercial"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Rent (KSh)</label>
                    <input 
                      name="marketRent"
                      type="number"
                      required
                      value={formData.marketRent}
                      onChange={handleInputChange}
                      placeholder="e.g. 85000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Days listed</label>
                    <input 
                      name="daysOnMarket"
                      type="number"
                      required
                      value={formData.daysOnMarket}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Leads</label>
                    <input 
                      name="leads"
                      type="number"
                      value={formData.leads}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Ready">Ready</option>
                      <option value="Listed">Listed</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Cleaning">Cleaning</option>
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
                    Add Vacancy
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
