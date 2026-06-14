import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Search,
  Filter,
  Send,
  Receipt,
  ChevronRight,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { StorageEngine, CommLog, Tenant } from "@/src/lib/storage";

export default function Communications() {
  const [logs, setLogs] = useState<CommLog[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    recipientId: "",
    type: "SMS",
    subject: "",
    content: ""
  });

  useEffect(() => {
    setLogs(StorageEngine.getCommLogs());
    
    const loadedTenants = StorageEngine.getTenants();
    setTenants(loadedTenants);
    if (loadedTenants.length > 0) {
      setFormData(prev => ({ ...prev, recipientId: loadedTenants[0].name }));
    }

    const handleUpdate = () => {
      setLogs(StorageEngine.getCommLogs());
      setTenants(StorageEngine.getTenants());
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientId || !formData.content) return;

    const newLog: CommLog = {
      id: `LOG-${Date.now().toString().slice(-3)}`,
      recipientId: formData.recipientId,
      type: formData.type,
      subject: formData.type === "Email" ? formData.subject || "SAWR Notification" : undefined,
      content: formData.content,
      status: "Delivered",
      timestamp: new Date().toISOString()
    };

    const updated = [newLog, ...logs];
    StorageEngine.saveCommLogs(updated);
    setLogs(updated);
    setIsModalOpen(false);
    setFormData({
      recipientId: tenants.length > 0 ? tenants[0].name : "",
      type: "SMS",
      subject: "",
      content: ""
    });
  };

  const filteredLogs = logs.filter(log => 
    log.recipientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.subject && log.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Communication Hub</h2>
          <p className="text-slate-500 mt-1">Manage SMS, Email and system notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 transition-all font-bold text-slate-700 shadow-sm">
            <Clock size={18} className="text-sawr-gold" />
            <span>Scheduled</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-4 py-2 rounded-xl transition-all shadow-lg glow-gold cursor-pointer"
          >
            <Send size={18} />
            <span>Compose Message</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl relative overflow-hidden bg-white border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-blue-500" />
            SMS Outbox
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-slate-900">
                {logs.filter(l => l.type === "SMS").length} Sent
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Units logs</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Auto credit matches enabled</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-emerald-500" />
            Automatic Triggers
          </h3>
          <div className="space-y-4">
            {[
              { label: "Automatic Receipts", status: true, sub: "Send SMS on payment match" },
              { label: "Arrears Reminders", status: true, sub: "Send on Day 5, 10, 15" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  <div className={cn(
                    "w-8 h-4 rounded-full relative transition-colors cursor-pointer",
                    item.status ? "bg-emerald-500" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all right-0.5"
                    )} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl group cursor-pointer hover:border-sawr-gold/50 transition-all bg-white border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-sawr-orange" />
            Deliverability Rate
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">All systems green</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-display font-bold text-slate-900">Live Delivery Logs</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-sawr-gold w-48 text-slate-900"
              />
            </div>
          </div>
        </div>
        
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
             <MessageSquare className="mx-auto text-sawr-gold mb-3" size={32} />
             <p className="text-xs">No correspondence logs sent by the system administrators yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] font-mono uppercase tracking-wider bg-slate-50">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Message Preview</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{log.recipientId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         {log.type === "SMS" && <Smartphone size={12} className="text-blue-500" />}
                         {log.type === "Email" && <Mail size={12} className="text-rose-500" />}
                         {log.type === "In-App" && <MessageSquare size={12} className="text-sawr-gold" />}
                         <span className="text-[10px] font-bold text-slate-400">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-sm truncate">
                       {log.subject ? `[${log.subject}] ` : ""}{log.content}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compose Message Modal Dialog */}
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
                  <h3 className="text-xl font-bold text-slate-900">Compose Communication</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Recipient Tenant</label>
                    {tenants.length === 0 ? (
                      <input 
                        name="recipientId"
                        type="text"
                        required
                        value={formData.recipientId}
                        onChange={handleInputChange}
                        placeholder="Recipient name..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                      />
                    ) : (
                      <select
                        name="recipientId"
                        value={formData.recipientId}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                      >
                        {tenants.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Mode</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    >
                      <option value="SMS">SMS Notification</option>
                      <option value="Email">Email Message</option>
                      <option value="In-App">In-App Alert</option>
                    </select>
                  </div>
                </div>

                {formData.type === "Email" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Title</label>
                    <input 
                      name="subject"
                      type="text" 
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Invoicing Reminder"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                  <textarea 
                    name="content"
                    required
                    rows={4}
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter SMS/Email text..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sawr-gold text-slate-900 resize-none font-sans"
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
                    className="px-4 py-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black rounded-xl text-xs font-bold uppercase transition-all shadow-md inline-flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Send Message</span>
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
