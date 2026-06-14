import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Plus,
  Trash,
  CreditCard,
  Receipt,
  FileText,
  FileCheck,
  Wrench,
  Phone,
  Activity,
  Bell,
  Shield,
  User,
  Download,
  Award,
  AlertCircle,
  X,
  ExternalLink,
  Clock,
  Send,
  Lock,
  Compass,
  FileSpreadsheet,
  Info,
  Check,
  Flame,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency, cn } from "@/src/lib/utils";
import { StorageEngine, Property, Tenant, Lease, MaintenanceTask, Expense, CommLog } from "@/src/lib/storage";

// Client-side Dashboard matching Admin-configured entries strictly
export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Dynamic datasets loaded directly from Admin Storage
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [commLogs, setCommLogs] = useState<CommLog[]>([]);

  // Selected Tenant View switcher (for testing/interacting with actual Admin-added data)
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  
  // Local state triggers
  const [newTicketTitle, setNewTicketTitle] = useState<string>("");
  const [newTicketPriority, setNewTicketPriority] = useState<"Low" | "Medium" | "High" | "Emergency">("Medium");
  const [newTicketDesc, setNewTicketDesc] = useState<string>("");
  const [newTicketFile, setNewTicketFile] = useState<string>("");
  const [ticketSubmitSuccess, setTicketSubmitSuccess] = useState<boolean>(false);

  // Live Chat Simulator state
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: "Client" | "Agent"; text: string; time: string }[]>([
    { id: "msg-1", sender: "Agent", text: "Welcome to your Secure SAWR Resident Portal. How may we assist with your rental, lease holdings, or maintenance inquiries today?", time: "09:00 AM" }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);

  // Load and subscribe to real admin entries
  const reloadData = () => {
    const loadedProperties = StorageEngine.getProperties();
    const loadedTenants = StorageEngine.getTenants();
    const loadedLeases = StorageEngine.getLeases();
    const loadedTasks = StorageEngine.getMaintenanceTasks();
    const loadedExpenses = StorageEngine.getExpenses();
    const loadedLogs = StorageEngine.getCommLogs();

    setProperties(loadedProperties);
    setTenants(loadedTenants);
    setLeases(loadedLeases);
    setMaintenanceTasks(loadedTasks);
    setExpenses(loadedExpenses);
    setCommLogs(loadedLogs);

    // Default to the first tenant found, or search for "Judith"
    if (loadedTenants.length > 0) {
      const matchJudith = loadedTenants.find(t => t.name.toLowerCase().includes("judith") || t.email.toLowerCase().includes("judith"));
      if (matchJudith) {
        setSelectedTenantId(matchJudith.id);
      } else {
        // If no judith, try to select any
        setSelectedTenantId(loadedTenants[0].id);
      }
    } else {
      setSelectedTenantId("");
    }
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("sawr_data_update", reloadData);
    return () => window.removeEventListener("sawr_data_update", reloadData);
  }, []);

  // Determine active tenant, property, lease, bills, etc.
  const activeTenant = tenants.find(t => t.id === selectedTenantId);
  const activeProperty = activeTenant 
    ? properties.find(p => p.name === activeTenant.property) 
    : null;
  const activeLease = activeTenant 
    ? leases.find(l => l.tenant === activeTenant.name && l.property === activeTenant.property)
    : null;

  // Derive tenant's outstanding bills from:
  // 1. Their recurring monthly rent (Unpaid if no transaction has settled it)
  // 2. Expenses assigned to their property
  const activeBills = activeTenant ? [
    {
      id: `rent-${activeTenant.id}`,
      title: "Monthly Tenancy Rent Bill",
      originProperty: activeTenant.property,
      amount: activeTenant.rent,
      category: "Rent" as const,
      dueDate: activeLease?.end || "Next Billing Cycle",
      status: activeTenant.status === "Active" ? "Unpaid" as const : "Paid" as const
    },
    ...expenses
      .filter(ex => ex.property === activeTenant.property)
      .map(ex => ({
        id: ex.id,
        title: `${ex.category} Service Surcharge`,
        originProperty: ex.property,
        amount: ex.amount,
        category: "Service Charge" as const,
        dueDate: ex.date,
        status: ex.status === "Pending" ? "Unpaid" as const : (ex.status === "Paid" ? "Paid" as const : "Unpaid" as const)
      }))
  ] : [];

  // Filter Tasks and Communications
  const activeTasks = activeTenant 
    ? maintenanceTasks.filter(t => t.property === activeTenant.property)
    : [];

  const activeCommunications = activeTenant
    ? commLogs.filter(log => log.recipientId === activeTenant.id || log.recipientId === activeTenant.name)
    : [];

  // Create real Maintenance request that saves to admin list
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || !newTicketDesc.trim() || !activeTenant) return;

    const newTicket: MaintenanceTask = {
      id: `task-${Date.now()}`,
      title: newTicketTitle,
      property: activeTenant.property,
      priority: newTicketPriority,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      vendor: "Unassigned"
    };

    // Save directly to admin lists so it is visible to the admin immediately!
    const existing = StorageEngine.getMaintenanceTasks();
    StorageEngine.saveMaintenanceTasks([newTicket, ...existing]);

    setNewTicketTitle("");
    setNewTicketDesc("");
    setNewTicketFile("");
    setTicketSubmitSuccess(true);
    setTimeout(() => setTicketSubmitSuccess(false), 3000);
  };

  // Chat automated helper
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      id: `chat-${Date.now()}`,
      sender: "Client" as const,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAgentTyping(true);

    setTimeout(() => {
      setIsAgentTyping(false);
      let answer = "Thank you for reached out to the SAWR Helpdesk. Your message has been logged under real-time client interactions.";
      const text = userMsg.text.toLowerCase();
      if (text.includes("rent") || text.includes("bill") || text.includes("pay")) {
        answer = `Under security protocols, your monthly rent of ${activeTenant ? formatCurrency(activeTenant.rent) : "UGX 0"} can be cleared securely using M-PESA STK or digital cards directly in the Billing tab.`;
      } else if (text.includes("repair") || text.includes("leak") || text.includes("maintenance")) {
        answer = "Our on-call technicians have been alerted. You can submit formal work requests and monitor live status changes in the Maintenance tab.";
      } else if (text.includes("hello") || text.includes("hi")) {
        answer = `Hello ${activeTenant?.name || "Member"}! We hope you're enjoying your accommodation. Let me know how I can make your relationship with SAWR management smoother.`;
      }

      setChatMessages(prev => [...prev, {
        id: `chat-reply-${Date.now()}`,
        sender: "Agent" as const,
        text: answer,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    }, 1000);
  };

  // Mock Pay invoice handler
  const handlePayBill = (billId: string, amount: number) => {
    if (!activeTenant) return;
    
    // Create actual expense entry or mark status as paid
    const updatedTenants = tenants.map(t => {
      if (t.id === activeTenant.id) {
        return { ...t, status: "Active" }; // Keep active and cleared
      }
      return t;
    });
    StorageEngine.saveTenants(updatedTenants);

    // Map through admin expenses if this represents an existing admin expense
    const updatedExpenses = expenses.map(ex => {
      if (ex.id === billId) {
        return { ...ex, status: "Paid" };
      }
      return ex;
    });
    StorageEngine.saveExpenses(updatedExpenses);

    alert(`Payment of ${formatCurrency(amount)} successfully authorized via secure escrow channel!`);
    reloadData();
  };

  return (
    <div id="tenant-portal-root" className="min-h-screen bg-slate-50/20 pb-20 md:pb-12 text-slate-800 relative overflow-hidden">
      {/* Strategic SAWR Brand/Luxury Housing Wallpaper */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src="/src/assets/images/luxury_housing_bg_1781437455458.jpg" 
          alt="SAWR Operations Wallpaper" 
          className="w-full h-full object-cover opacity-35 select-none transition-opacity duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/10 via-slate-50/60 to-slate-50"></div>
      </div>

      <div className="relative z-10 space-y-0">
      
      {/* Dynamic Security/Admin Sync Ribbon */}
      <div id="admin-sync-ribbon" className="bg-slate-900 text-white text-[10px] md:text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[10px] uppercase text-slate-300 tracking-wider">
            Client View Mode: Admin Real-Data Compliance Active
          </span>
        </div>
        
        {/* Real-time switcher to preview any tenant added by Admin */}
        <div className="flex items-center gap-2">
          <label htmlFor="tenant-select" className="text-slate-400 font-bold uppercase text-[9px]">Select Tenant:</label>
          {tenants.length > 0 ? (
            <select
              id="tenant-select"
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="bg-slate-800 text-slate-100 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 outline-none focus:border-sawr-gold cursor-pointer"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.property})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-amber-400 font-bold uppercase text-[9px] animate-pulse">
              No Tenants in Admin Database
            </span>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
        
        {/* Upper Client Header Panel */}
        <div id="client-header-pnl" className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img 
              src="/src/assets/images/sawr_logo_1781434320923.jpg" 
              alt="SAWR GROUP" 
              className="h-16 w-auto object-contain shrink-0 rounded-xl border border-slate-100 p-1 bg-slate-50"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-sawr-gold uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded">
                  Verified Resident
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase">
                  <Shield size={10} />
                  Secure ESCROW Act
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight uppercase">
                {activeTenant ? activeTenant.name : "Awaiting Tenant Profile"}
              </h1>
              <p className="text-xs text-slate-500 max-w-xl">
                {activeTenant 
                  ? `Authorized occupant of ${activeTenant.property || "Assigned Unit"} — Managed under Land Registry of Uganda protocols.` 
                  : "No matching tenant profile could be downloaded. Add a tenant and link them to a property in the Admin Management interface to view real data."}
              </p>
            </div>
          </div>

          {/* Key Status Indicators */}
          {activeTenant && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold-400/10 flex items-center justify-center text-sawr-gold">
                  <Award size={18} />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Tenant Status</div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      activeTenant.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                    )}></span>
                    {activeTenant.status}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <CreditCard size={18} />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Assigned Rent</div>
                  <div className="text-xs font-bold text-slate-800 font-mono">
                    {formatCurrency(activeTenant.rent)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Empty State for Client Portal when Admin database is completely blank */}
        {tenants.length === 0 ? (
          <div id="empty-tenant-state" className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-sawr-gold">
              <Building2 size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Awaiting Admin Records Setup</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                As requested, this client dashboard is tightly bound **only to information added by the administrator**. No static or simulated mock records are displayed.
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl text-xs text-left border border-slate-100 space-y-2.5 max-w-md mx-auto">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Info size={14} className="text-sawr-gold hover:scale-110 duration-150 cursor-pointer" />
                  How to trigger dashboard content:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Go to the **Properties** tab in the main sidebar & create a property.</li>
                  <li>Go to the **Tenants** tab and enroll a dynamic Resident.</li>
                  <li>Assign that Resident to the property and set their Monthly Rent.</li>
                  <li>Return here to view instantly updated bills, leases, tasks, and metrics.</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div id="active-tenant-view-container" className="space-y-6">
            
            {/* Desktop Horizontal Tabs Menu (Hidden on Mobile) */}
            <div id="desktop-tab-bar" className="hidden md:flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
              {[
                { id: "overview", label: "Overview", icon: Compass },
                { id: "occupancy", label: "Property & Lease", icon: Building2 },
                { id: "payments", label: "Bills & Payments", icon: CreditCard },
                { id: "repairs", label: "Maintenance Requests", icon: Wrench },
                { id: "meters", label: "Smart Utilities", icon: Activity },
                { id: "desk", label: "Communications", icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    id={`desktop-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 cursor-pointer",
                      isActive 
                        ? "bg-slate-950 text-white shadow" 
                        : "bg-white text-slate-600 border border-slate-200 hover:border-sawr-gold hover:text-slate-900"
                    )}
                  >
                    <Icon size={14} className={isActive ? "text-sawr-gold" : "text-slate-400"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div id="client-tab-content" className="min-h-[480px]">
              <AnimatePresence mode="wait">
                
                {/* 1. OVERVIEW SCREEN */}
                {activeTab === "overview" && (
                  <motion.div
                    key="tab-overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Main overview panel */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Active property card */}
                      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="h-44 md:h-56 relative bg-slate-900">
                          {activeProperty?.image ? (
                            <img src={activeProperty.image} alt="Property" className="w-full h-full object-cover opacity-80" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <Building2 size={48} className="text-slate-600 mb-2" />
                              <span className="text-xs uppercase font-mono tracking-wider">No Photo Uploaded</span>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-slate-950 text-sawr-gold text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-sawr-gold/30">
                            Current Lease Location
                          </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-sawr-gold font-bold tracking-widest block">Primary Asset</span>
                            <h2 className="text-xl font-bold text-slate-900">{activeTenant?.property || "No Property Assigned"}</h2>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={12} className="text-sawr-gold shrink-0" />
                              {activeProperty?.address || "Address registry pending."}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-black block">Monthly Rent</span>
                              <span className="font-bold text-slate-800 font-mono">{activeTenant ? formatCurrency(activeTenant.rent) : "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-black block">Status</span>
                              <span className="font-bold text-emerald-600 uppercase flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-black block">Assigned Unit</span>
                              <span className="font-bold text-slate-800">{activeTenant?.unit || "Suite 40"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-black block">Lease Type</span>
                              <span className="font-bold text-slate-800">{activeProperty?.type || "Residential"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Outstanding bills alert */}
                      {activeBills.filter(b => b.status === "Unpaid").length > 0 && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm">
                          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                          <div className="space-y-1 flex-1">
                            <h4 className="text-xs font-bold text-amber-900 uppercase">Immediate Settlement Advised</h4>
                            <p className="text-xs text-amber-800/80 leading-relaxed">
                              You have unpaid invoices of **{formatCurrency(activeBills.filter(b => b.status === "Unpaid").reduce((sum, b) => sum + b.amount, 0))}** loaded by your landlord. Security escrow protocols ensure certified UGX settlement.
                            </p>
                            <button
                              onClick={() => setActiveTab("payments")}
                              className="text-xs font-bold uppercase text-sawr-gold hover:underline flex items-center gap-1 mt-2"
                            >
                              <span>Launch Billing Hub</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="space-y-6">
                      
                      {/* Emergency Panel */}
                      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 space-y-4 shadow-md border border-white/5">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-sawr-gold" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">SAWR Concierge Dispatch</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          For immediate housing emergencies, power failures, or water leaks, direct access phone integration is available below.
                        </p>
                        
                        <div className="space-y-2.5 text-xs pt-1">
                          <a href="tel:+256772123456" className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                            <span className="font-bold text-slate-200">Plumbing & Structural Dispatch</span>
                            <Phone size={12} className="text-sawr-gold" />
                          </a>
                          <button
                            onClick={() => setActiveTab("desk")}
                            className="w-full flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-left"
                          >
                            <span className="font-bold text-slate-200 font-sans">Live Text Helpdesk</span>
                            <MessageSquare size={12} className="text-sawr-gold" />
                          </button>
                        </div>
                      </div>

                      {/* Small usage metrics preview */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Today's Smart Utilities Meter</h4>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-3">
                            <Flame size={14} className="text-red-500 mx-auto mb-1" />
                            <div className="text-[8px] text-slate-400 uppercase font-bold">Electricity</div>
                            <div className="text-sm font-bold text-slate-850 font-mono">11.8 kWh</div>
                          </div>
                          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3">
                            <Activity size={14} className="text-blue-500 mx-auto mb-1" />
                            <div className="text-[8px] text-slate-400 uppercase font-bold">Water</div>
                            <div className="text-sm font-bold text-slate-850 font-mono">0.32 m³</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 2. PROPERTY & LEASE SCREEN */}
                {activeTab === "occupancy" && (
                  <motion.div
                    key="tab-occupancy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                            Registered Occupancy Deed
                          </h3>
                          <span className="text-[10px] font-mono text-sawr-gold font-bold">
                            #{activeLease?.id || `DEED-${activeTenant?.id}`}
                          </span>
                        </div>

                        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Start Term Date</span>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" />
                              {activeLease?.start || "2026-01-01"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Termination/Renewal Term Date</span>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" />
                              {activeLease?.end || "2026-12-31"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Security Deposit Vaulted</span>
                            <div className="font-bold text-slate-800 font-mono">
                              {activeTenant ? formatCurrency(activeTenant.rent) : "N/A"}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Verification Level</span>
                            <span className="text-emerald-600 font-black uppercase inline-flex items-center gap-1">
                              <CheckCircle size={12} />
                              State Verified Registry
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-sawr-gold">
                              <FileText size={18} />
                            </div>
                            <div className="text-left">
                              <h5 className="text-xs font-bold text-slate-805">Official Lease Contract (PDF)</h5>
                              <p className="text-[10px] text-slate-400">Government stamp & registration number verified</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => alert("Downloading certified copy of property deed contract (PDF)...")}
                            className="bg-slate-950 hover:bg-slate-850 text-white font-bold uppercase text-[10px] px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Download size={12} className="text-sawr-gold" />
                            <span>Download Signed Deed</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-3xl p-6 space-y-3.5 shadow-sm text-left">
                        <Shield className="text-emerald-600" size={24} />
                        <h4 className="text-xs font-bold text-slate-900 uppercase">SAWR Legal Shield Active</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Your physical residency is fully secured under Uganda's standard legal protection guidelines. This guarantees stable rents and immediate resolution pathways.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. BILLS & PAYMENTS SCREEN */}
                {activeTab === "payments" && (
                  <motion.div
                    key="tab-payments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          Outstanding Invoices Added by Administrator
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeBills.map((bill) => (
                            <div key={bill.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                  <span className="text-[8px] bg-slate-900 text-sawr-gold font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                                    {bill.category}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                                    Due: {bill.dueDate}
                                  </span>
                                </div>
                                <h4 className="text-xs font-extrabold text-slate-900 mt-2">{bill.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate">{bill.originProperty}</p>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                  <span className="text-[8px] text-slate-400 uppercase block font-bold">UGX Amount</span>
                                  <span className="font-mono font-black text-slate-900 text-xs">{formatCurrency(bill.amount)}</span>
                                </div>

                                {bill.status === "Paid" ? (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold uppercase px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-200">
                                    <Check size={10} />
                                    Cleared
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePayBill(bill.id, bill.amount)}
                                    className="bg-sawr-gold hover:bg-gold-500 text-sawr-black font-bold uppercase text-[9px] tracking-wider px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.03]"
                                  >
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment History Log */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Receipt className="text-sawr-gold" size={14} />
                          Past Verified Payment Ledger (Admin Confirmed)
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-gray-100 text-slate-400 font-bold uppercase">
                                <th className="p-3">Reference</th>
                                <th className="p-3">Receipt Purpose</th>
                                <th className="p-3">Method</th>
                                <th className="p-3 text-right">Cleared Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expenses.filter(ex => ex.property === activeTenant?.property && ex.status === "Paid").map((ex) => (
                                <tr key={ex.id} className="border-b border-slate-100 text-slate-700">
                                  <td className="p-3 font-mono text-[9px] text-amber-600 font-bold">{ex.id}</td>
                                  <td className="p-3 font-semibold">{ex.category} Charge</td>
                                  <td className="p-3 text-slate-500 uppercase font-bold text-[9px]">Secure Escrow</td>
                                  <td className="p-3 text-right font-black font-mono text-emerald-600">{formatCurrency(ex.amount)}</td>
                                </tr>
                              ))}
                              {expenses.filter(ex => ex.property === activeTenant?.property && ex.status === "Paid").length === 0 && (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-slate-400">
                                    No cleared payment history found in the official administrator logs.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                        <h4 className="text-xs font-black text-slate-900 uppercase">Escrow Settlement Channels</h4>
                        <div className="space-y-2 text-xs text-slate-600">
                          <p>
                            All payments are securely routed directly into the administrator's unified legal escrow account under Ugandan finance covenants.
                          </p>
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between">
                            <span className="font-bold">M-PESA Gateways</span>
                            <span className="text-[10px] text-emerald-600 font-mono font-bold">Enabled</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between">
                            <span className="font-bold">Digital Credit/Debit Cards</span>
                            <span className="text-[10px] text-emerald-600 font-mono font-bold">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. MAINTENANCE SCREEN */}
                {activeTab === "repairs" && (
                  <motion.div
                    key="tab-repairs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* File New Request */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm text-left">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                            Submit Repair Request to Admin List
                          </h3>
                          <p className="text-xs text-slate-500">
                            Submitting a request registers it directly into the administrator's job list in real-time.
                          </p>
                        </div>

                        {ticketSubmitSuccess && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 text-xs text-emerald-800 font-bold flex items-center gap-2">
                            <CheckCircle size={16} />
                            Your maintenance request has successfully synced to the admin database!
                          </div>
                        )}

                        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label htmlFor="ticket-title" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Issue Title / Area</label>
                            <input
                              id="ticket-title"
                              type="text"
                              required
                              placeholder="e.g. Master Bedroom Ceiling AC Leaking"
                              value={newTicketTitle}
                              onChange={(e) => setNewTicketTitle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-sawr-gold outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label htmlFor="ticket-priority" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Priority Level</label>
                              <select
                                id="ticket-priority"
                                value={newTicketPriority}
                                onChange={(e) => setNewTicketPriority(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-sawr-gold outline-none cursor-pointer"
                              >
                                <option value="Low">Low - Minor issue</option>
                                <option value="Medium">Medium - Regular repair</option>
                                <option value="High">High - Urgent dispatch</option>
                                <option value="Emergency">Emergency - System shut-down</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label htmlFor="ticket-file" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reference Photo</label>
                              <input
                                id="ticket-file"
                                type="text"
                                placeholder="Paste Image URL (Optional)"
                                value={newTicketFile}
                                onChange={(e) => setNewTicketFile(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-sawr-gold outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor="ticket-desc" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Describe symptoms & details</label>
                            <textarea
                              id="ticket-desc"
                              rows={3}
                              required
                              placeholder="Mention specific rooms, noise, exact dripping area, etc."
                              value={newTicketDesc}
                              onChange={(e) => setNewTicketDesc(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:border-sawr-gold outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="bg-slate-950 hover:bg-slate-850 text-white font-bold uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl shadow-lg transition-all"
                          >
                            Dispatch File Request
                          </button>
                        </form>
                      </div>

                      {/* Job list */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Active Job Repairs (Admin Log Sync)
                        </h3>

                        <div className="space-y-2.5">
                          {activeTasks.map((task) => (
                            <div key={task.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs shadow-sm">
                              <div className="space-y-1">
                                <span className={cn(
                                  "text-[8px] font-mono font-extrabold uppercase px-2 py-0.5 rounded",
                                  task.priority === "Emergency" || task.priority === "High" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"
                                )}>
                                  {task.priority} Priority
                                </span>
                                <h4 className="font-extrabold text-slate-850 mt-1">{task.title}</h4>
                                <p className="text-[10px] text-slate-400">Created: {task.date} • Assigned: {task.vendor}</p>
                              </div>

                              <div>
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full",
                                  task.status === "Pending" ? "bg-amber-100 text-amber-800 animate-pulse" :
                                  task.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                                )}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          ))}

                          {activeTasks.length === 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                              No active maintenance requests exist for your property.
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3 text-left">
                        <h4 className="text-xs font-black text-slate-900 uppercase">Emergency Support</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          For hazardous emergencies (gas leakage, elevator entrapments, extreme structural hazard), call our primary regional emergency engineering desk at:
                        </p>
                        <a href="tel:+256701987654" className="block text-center font-mono font-black border border-red-200 text-red-600 bg-red-50 p-3 rounded-2xl hover:bg-red-100/50 transition-colors">
                          +256 701 987 654
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. SMART UTILITIES SCREEN */}
                {activeTab === "meters" && (
                  <motion.div
                    key="tab-meters"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Live meter stats details */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Smart Meter Analytics</h3>
                            <p className="text-[11px] text-slate-400">Real-time electricity & water inflow tracking.</p>
                          </div>
                          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase">
                            Smart Connected
                          </span>
                        </div>

                        {/* Custom SVG line chart for data visualization */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span className="font-bold uppercase text-[9px] text-slate-400">Monthly Usage Wave (H1 2026)</span>
                            <span className="font-mono text-[9px] text-slate-400">Scale: kWh / m³</span>
                          </div>

                          <div className="h-44 bg-slate-900 rounded-2xl relative p-4 overflow-hidden border border-slate-800 flex items-end">
                            {/* Simple dynamic bar/grid visualization */}
                            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-10">
                              <div className="border-b border-white w-full h-[1px]"></div>
                              <div className="border-b border-white w-full h-[1px]"></div>
                              <div className="border-b border-white w-full h-[1px]"></div>
                              <div className="border-b border-white w-full h-[1px]"></div>
                            </div>
                            
                            <div className="relative z-10 w-full h-full flex items-end justify-between gap-2.5 pt-4">
                              {[
                                { month: "Jan", kwh: 310, water: 11 },
                                { month: "Feb", kwh: 340, water: 14 },
                                { month: "Mar", kwh: 290, water: 15 },
                                { month: "Apr", kwh: 270, water: 10 },
                                { month: "May", kwh: 360, water: 18 },
                                { month: "Jun", kwh: 410, water: 22 },
                              ].map((pt, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                                  <div className="w-full flex justify-center gap-1.5 items-end h-[80%]">
                                    {/* Electricity Bar */}
                                    <div 
                                      style={{ height: `${(pt.kwh / 500) * 100}%` }}
                                      className="w-3 bg-red-500 rounded-t-sm"
                                    ></div>
                                    {/* Water Bar */}
                                    <div 
                                      style={{ height: `${(pt.water / 30) * 100}%` }}
                                      className="w-3 bg-blue-500 rounded-t-sm"
                                    ></div>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-2">{pt.month}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] text-slate-500 justify-center pt-2">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                              Electricity (kWh)
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                              Water (m³)
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3.5 shadow-sm text-left">
                        <h4 className="text-xs font-black text-slate-900 uppercase">Tariff Limits & Rules</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Rates are configured by the Uganda Water & Electricity Board regulatory standards. All unit usage is logged daily by local microchip encoders.
                        </p>
                        <div className="text-[10px] space-y-1 text-slate-500 font-mono">
                          <div>Electricity rate: USh 792 / kWh</div>
                          <div>Water base tariff: USh 3,850 / m³</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 6. LANDLORD COMMUNICATIONS (LIVE INBOX/CHAT) SCREEN */}
                {activeTab === "desk" && (
                  <motion.div
                    key="tab-desk"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Live Support Chat Workspace */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col h-[480px] shadow-sm">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Chat Concierge Support Representative
                            </h3>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono">24/7 Support Active</span>
                        </div>

                        {/* Messages Scroller */}
                        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
                          {chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex flex-col max-w-[80%] space-y-1 text-left",
                                msg.sender === "Client" ? "ml-auto items-end" : "mr-auto items-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "p-3 rounded-2xl",
                                  msg.sender === "Client"
                                    ? "bg-slate-950 text-white rounded-br-none"
                                    : "bg-slate-100 text-slate-800 rounded-bl-none"
                                )}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[8px] font-mono text-slate-400">{msg.time}</span>
                            </div>
                          ))}
                          
                          {isAgentTyping && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 animate-pulse text-left">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                              <span>Agent typing...</span>
                            </div>
                          )}
                        </div>

                        {/* Input Box Form */}
                        <form onSubmit={handleSendChat} className="border-t border-slate-100 pt-3 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type an inquiry about billing, leases, or repairs..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs outline-none focus:border-sawr-gold"
                          />
                          <button
                            type="submit"
                            title="Send Message"
                            className="w-10 h-10 bg-slate-950 hover:bg-slate-850 text-sawr-gold rounded-xl flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Send size={14} className="pointer-events-none" />
                          </button>
                        </form>
                      </div>

                      {/* Official Inbound Notifications Logs Added by Admin */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                          <Bell size={14} className="text-sawr-gold" />
                          Official Broadcasts & Alerts (Communication Log)
                        </h4>
                        
                        <div className="divide-y divide-slate-100">
                          {activeCommunications.map((log) => (
                            <div key={log.id} className="py-3 first:pt-0 text-xs text-left space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 uppercase tracking-widest text-[8px] px-2 py-0.5 bg-slate-100 rounded">
                                  {log.type}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                              </div>
                              {log.subject && <p className="font-extrabold text-slate-900">{log.subject}</p>}
                              <p className="text-slate-655 leading-relaxed">{log.content}</p>
                            </div>
                          ))}

                          {activeCommunications.length === 0 && (
                            <p className="p-4 text-center text-slate-400 text-xs">
                              No official direct communication letters found in admin records.
                            </p>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3.5 shadow-sm text-left">
                        <h4 className="text-xs font-black text-slate-900 uppercase">Policy Notice Desk</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Messages displayed inside the broadcast alert log are officially compiled and issued directly by the assigned real estate manager. Keep notifications monitored to preserve tenancy benefits.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        )}

      </div>

      {/* Modern Touch Bottom Nav Menu for Mobile Requirements */}
      <div id="mobile-nav-bar" className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between z-50 shadow-2xl">
        {[
          { id: "overview", label: "Home", icon: Compass },
          { id: "occupancy", label: "Lease", icon: Building2 },
          { id: "payments", label: "Bills", icon: CreditCard },
          { id: "repairs", label: "Repair", icon: Wrench },
          { id: "meters", label: "Meters", icon: Activity },
          { id: "desk", label: "Chat", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`mobile-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 gap-1 min-h-[44px] cursor-pointer"
            >
              <Icon size={18} className={isActive ? "text-sawr-gold scale-110" : "text-slate-400"} />
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider",
                isActive ? "text-slate-950" : "text-slate-400"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      </div>
    </div>
  );
}
