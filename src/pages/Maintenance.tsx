import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Filter,
  User,
  Image as ImageIcon,
  X,
  Sparkles,
  Search
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, MaintenanceTask, Property } from "@/src/lib/storage";

export default function Maintenance() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    property: "",
    priority: "Medium",
    status: "Pending",
    vendor: ""
  });

  useEffect(() => {
    setTasks(StorageEngine.getMaintenanceTasks());
    
    const loadedProps = StorageEngine.getProperties();
    setProperties(loadedProps);
    if (loadedProps.length > 0) {
      setFormData(prev => ({ ...prev, property: loadedProps[0].name }));
    }

    const handleUpdate = () => {
      setTasks(StorageEngine.getMaintenanceTasks());
      setProperties(StorageEngine.getProperties());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.property) return;

    const newTask: MaintenanceTask = {
      id: `M-4${Date.now().toString().slice(-2)}`,
      title: formData.title,
      property: formData.property,
      priority: formData.priority,
      status: formData.status,
      date: "Just now",
      vendor: formData.vendor || "N/A"
    };

    const updated = [newTask, ...tasks];
    StorageEngine.saveMaintenanceTasks(updated);
    setTasks(updated);
    setIsModalOpen(false);
    setFormData({
      title: "",
      property: properties.length > 0 ? properties[0].name : "",
      priority: "Medium",
      status: "Pending",
      vendor: ""
    });
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stat card numbers dynamically
  const activeCount = tasks.filter(t => t.status !== "Completed").length;
  const pendingCount = tasks.filter(t => t.status === "Pending").length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const urgentCount = tasks.filter(t => t.priority === "Emergency" || t.priority === "High").length;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Maintenance Tracking</h2>
          <p className="text-slate-500 mt-1">Track service requests, manage vendors, and oversee upkeep.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-all font-bold text-slate-700 shadow-sm">
            <User size={18} className="text-sawr-gold" />
            <span>Vendors Directory</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-4 py-2 rounded-xl transition-all shadow-lg glow-gold cursor-pointer"
          >
            <Plus size={18} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Tickets", count: activeCount, icon: Wrench, color: "blue" },
          { label: "Pending Approval", count: pendingCount, icon: Clock, color: "gold" },
          { label: "Completed", count: completedCount, icon: CheckCircle2, color: "emerald" },
          { label: "Urgent Jobs", count: urgentCount, icon: AlertCircle, color: "orange" },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl flex items-center gap-4 bg-white border-slate-200 shadow-sm">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              stat.color === "blue" ? "bg-sawr-blue/10 text-sawr-blue" :
              stat.color === "gold" ? "bg-sawr-gold/10 text-sawr-gold" :
              stat.color === "emerald" ? "bg-emerald-500/10 text-emerald-500" :
              "bg-sawr-orange/10 text-sawr-orange"
            )}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6 bg-white border-slate-200 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-display font-medium text-slate-900">Task Queue</h3>
          <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-sawr-gold w-40 text-slate-900"
                />
              </div>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-2xl bg-slate-50/20 max-w-xl mx-auto">
             <Wrench className="mx-auto text-sawr-gold mb-3" size={32} />
             <p className="text-sm font-semibold text-slate-950">No Active Service Requests</p>
             <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
               You haven't logged any structural defects, utility leaks, or electrical work tickets.
             </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-sawr-gold/30 group transition-all hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-1.5 self-stretch rounded-full",
                    task.priority === "Emergency" ? "bg-rose-500" :
                    task.priority === "High" ? "bg-sawr-orange" :
                    task.priority === "Medium" ? "bg-sawr-gold" :
                    "bg-slate-300"
                  )}></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-sawr-blue transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-mono text-[10px] text-sawr-gold font-bold">{task.id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{task.property}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2 py-1 rounded-lg uppercase tracking-wider">
                    <User size={12} className="text-sawr-gold" />
                    {task.vendor}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <ImageIcon size={14} />
                    <span className="text-[10px] font-bold">1</span>
                  </div>
                  <div className="text-right hidden sm:block font-bold">
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">{task.date}</p>
                    <p className={cn(
                          "text-xs mt-0.5",
                          task.status === "Completed" ? "text-emerald-600" : "text-slate-500"
                    )}>{task.status}</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hidden md:block",
                    task.priority === "Emergency" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                    task.priority === "High" ? "bg-orange-50 text-sawr-orange border border-orange-100" :
                    task.priority === "Medium" ? "bg-amber-50 text-sawr-gold border border-sawr-gold/20" :
                    "bg-slate-100 text-slate-500 border border-slate-200"
                  )}>
                    {task.priority}
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Maintenance Ticket Modal */}
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
                  <h3 className="text-xl font-bold text-slate-900">Open Service Ticket</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddTicket} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trouble Title / Defect Details</label>
                  <input 
                    name="title"
                    type="text" 
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Broken elevator belt, Pipe blast Suite 2"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Location</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Vendor</label>
                    <input 
                      name="vendor"
                      type="text" 
                      value={formData.vendor}
                      onChange={handleInputChange}
                      placeholder="e.g. NCBA Technical, Bright Electrical"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Rank</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
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
                    Open Ticket
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
