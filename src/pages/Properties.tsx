import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Home, 
  ArrowRight,
  X,
  Sparkles
} from "lucide-react";
import { formatCurrency, cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, Property } from "@/src/lib/storage";

const buildingImages = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400"
];

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "Residential",
    units: "",
    occupancy: "100",
    revenue: ""
  });

  useEffect(() => {
    setProperties(StorageEngine.getProperties());

    const handleUpdate = () => {
      setProperties(StorageEngine.getProperties());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    const randomImgIdx = Math.floor(Math.random() * buildingImages.length);
    const newProperty: Property = {
      id: `P-${Date.now()}`,
      name: formData.name,
      address: formData.address,
      type: formData.type,
      units: Number(formData.units) || 1,
      occupancy: Number(formData.occupancy) || 100,
      revenue: Number(formData.revenue) || 0,
      image: buildingImages[randomImgIdx]
    };

    const updated = [newProperty, ...properties];
    StorageEngine.saveProperties(updated);
    setProperties(updated);
    setIsModalOpen(false);
    setFormData({
      name: "",
      address: "",
      type: "Residential",
      units: "",
      occupancy: "100",
      revenue: ""
    });
  };

  const filteredProperties = properties.filter(prop => 
    prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Properties</h2>
          <p className="text-slate-500 mt-1">Manage your real estate portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sawr-gold w-64 text-slate-900 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-4 py-2 rounded-xl transition-all shadow-lg glow-gold cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border-slate-200 bg-white max-w-2xl mx-auto mt-8 shadow-md">
          <div className="w-16 h-16 bg-sawr-gold/10 rounded-full flex items-center justify-center mx-auto text-sawr-gold mb-6">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Properties Listed Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            {searchQuery ? "No properties match your filter criteria." : "Get started by registering your first high-end property asset into SAWR Group management."}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-6 py-2.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Register First Asset</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-sawr-gold/50 transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={property.image} 
                  alt={property.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-sawr-black uppercase tracking-widest border border-slate-200 shadow-sm">
                  {property.type}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-sawr-blue transition-colors">{property.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                    <MapPin size={14} className="text-sawr-gold" />
                    <span>{property.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Units</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Home size={14} className="text-sawr-gold" />
                      <span className="text-slate-900 font-bold">{property.units}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Occupancy</p>
                    <div className="mt-1">
                      <span className={cn(
                        "font-bold",
                        property.occupancy >= 90 ? "text-emerald-600" : "text-sawr-gold"
                      )}>{property.occupancy}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Mo. Revenue</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(property.revenue)}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-sawr-gold flex items-center justify-center text-sawr-black opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Property Form Modal */}
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
                  <h3 className="text-xl font-bold text-slate-900">Add Property Asset</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddProperty} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Name</label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Golden Heights, Westland Plaza"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location / Address</label>
                  <input 
                    name="address"
                    type="text" 
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Kilimani, Nairobi"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Units</label>
                    <input 
                      name="units"
                      type="number"
                      min="1"
                      required
                      value={formData.units}
                      onChange={handleInputChange}
                      placeholder="e.g. 24"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occupancy Rate (%)</label>
                    <input 
                      name="occupancy"
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.occupancy}
                      onChange={handleInputChange}
                      placeholder="e.g. 95"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue (KSh)</label>
                    <input 
                      name="revenue"
                      type="number"
                      required
                      value={formData.revenue}
                      onChange={handleInputChange}
                      placeholder="e.g. 750000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
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
                    Add Asset
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
