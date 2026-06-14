import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MoreHorizontal,
  Plus,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, Tenant, Property } from "@/src/lib/storage";

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    property: "",
    unit: "",
    rent: "",
    status: "Active"
  });

  useEffect(() => {
    setTenants(StorageEngine.getTenants());
    const loadedProps = StorageEngine.getProperties();
    setProperties(loadedProps);
    if (loadedProps.length > 0) {
      setFormData(prev => ({ ...prev, property: loadedProps[0].name }));
    }

    const handleUpdate = () => {
      setTenants(StorageEngine.getTenants());
      setProperties(StorageEngine.getProperties());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.property) return;

    const newTenant: Tenant = {
      id: `T-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "N/A",
      property: formData.property,
      unit: formData.unit || "N/A",
      rent: Number(formData.rent) || 0,
      status: formData.status
    };

    const updated = [newTenant, ...tenants];
    StorageEngine.saveTenants(updated);
    setTenants(updated);
    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      property: properties.length > 0 ? properties[0].name : "",
      unit: "",
      rent: "",
      status: "Active"
    });
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.unit.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "All") return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Tenants</h2>
          <p className="text-slate-500 mt-1">Directory of all active and past tenants.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sawr-gold w-full sm:w-64 text-slate-900 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-sawr-gold cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Warning">Warning</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2 rounded-xl transition-all shadow-lg glow-gold cursor-pointer"
            >
              Register Tenant
            </button>
          </div>
        </div>
      </div>

      {filteredTenants.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border-slate-200 bg-white max-w-2xl mx-auto shadow-md">
          <div className="w-16 h-16 bg-sawr-gold/10 rounded-full flex items-center justify-center mx-auto text-sawr-gold mb-6">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Registered Tenants</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            {searchQuery || statusFilter !== "All" ? "No tenants match your filters." : "Start registering tenants into physical property units to track billing and communication logs."}
          </p>
          {!searchQuery && statusFilter === "All" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Register First Tenant</span>
            </button>
          )}
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden shadow-xl border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-mono uppercase tracking-wider">
                <th className="px-6 py-4">Tenant Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Property / Unit</th>
                <th className="px-6 py-4">Rent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sawr-gold/10 flex items-center justify-center text-sawr-gold font-bold text-xs ring-1 ring-sawr-gold/20">
                        {tenant.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-sawr-blue transition-colors">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Mail size={12} className="text-sawr-gold" />
                        <span>{tenant.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Phone size={12} className="text-sawr-gold" />
                        <span>{tenant.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-bold text-slate-900">{tenant.property}</p>
                    <p className="text-xs text-slate-500">{tenant.unit}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                    KSh {tenant.rent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5",
                      tenant.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      tenant.status === "Warning" ? "bg-rose-50 text-sawr-orange border border-rose-100" :
                      "bg-slate-100 text-slate-500 border border-slate-200"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        tenant.status === "Active" ? "bg-emerald-500" :
                        tenant.status === "Warning" ? "bg-sawr-orange" :
                        "bg-slate-400"
                      )}></span>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Showing {filteredTenants.length} tenants</p>
          </div>
        </div>
      )}

      {/* Add Tenant Form Modal */}
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
                  <h3 className="text-xl font-bold text-slate-900">Register Tenant</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddTenant} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Full Name</label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Alice Mwangi"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      name="email"
                      type="email" 
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. alice.m@gmail.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input 
                      name="phone"
                      type="text" 
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +254 712 345 678"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit / Box #</label>
                    <input 
                      name="unit"
                      type="text" 
                      required
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="e.g. Apt 3B, Suite 4"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rent Amount (KSh)</label>
                    <input 
                      name="rent"
                      type="number"
                      required
                      value={formData.rent}
                      onChange={handleInputChange}
                      placeholder="e.g. 45000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lease Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Warning">Warning</option>
                      <option value="Inactive">Inactive</option>
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
                    Register Tenant
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
