import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Home, 
  ArrowRight,
  X,
  Sparkles,
  CheckCircle,
  CreditCard,
  Wallet,
  Info,
  ShieldCheck,
  Smartphone,
  ChevronRight
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
  const role = localStorage.getItem("sawr_role") || "client";

  // Selected Property for Details Sheet / Checkout flow
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Checkout / Payment Modal State Variables
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [payType, setPayType] = useState<"Rent" | "Buy">("Rent");
  const [payMethod, setPayMethod] = useState<"MPESA" | "Card">("MPESA");
  const [paymentPhone, setPaymentPhone] = useState(localStorage.getItem("sawr_phone") || "+254 712 345678");
  const [paymentCard, setPaymentCard] = useState("");
  const [paymentExpiry, setPaymentExpiry] = useState("");
  const [paymentCVV, setPaymentCVV] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [mpesaRef, setMpesaRef] = useState("");

  // Form State for Admin
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

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setIsPaying(true);
    
    // Simulate real payment gateway delay (M-PESA checkout or credit card verification)
    setTimeout(() => {
      setIsPaying(false);
      setPaySuccess(true);
      
      const newRef = "TX" + Math.random().toString(36).substring(2, 10).toUpperCase();
      setMpesaRef(newRef);
      
      // Calculate realistic amount based on selection
      const amountPaid = payType === "Buy" 
        ? (selectedProperty.type === "Commercial" ? 22000000 : 12500000)
        : (selectedProperty.type === "Commercial" ? 120000 : 55000);
      
      // 1. Save Booking object in localStorage lists
      const currentBookings = JSON.parse(localStorage.getItem("sawr_bookings") || "[]");
      const newBooking = {
        id: "BK-" + Date.now(),
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        propertyAddress: selectedProperty.address,
        type: payType,
        paymentAmount: amountPaid,
        paymentMethod: payMethod === "MPESA" ? "M-PESA Checkout" : "Visa/Mastercard",
        paymentReference: newRef,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      localStorage.setItem("sawr_bookings", JSON.stringify([newBooking, ...currentBookings]));
      
      // 2. If renting, add a tenant record to the database so they appear in admin panel
      if (payType === "Rent") {
        const currentTenants = StorageEngine.getTenants();
        const newTenant = {
          id: "T-" + Date.now(),
          name: localStorage.getItem("sawr_name") || "Valued Customer",
          email: localStorage.getItem("sawr_email") || "client@sawr.com",
          phone: paymentPhone || "+254 712 345678",
          property: selectedProperty.name,
          unit: "Suite " + Math.floor(Math.random() * 80 + 101),
          rent: amountPaid,
          status: "Active"
        };
        StorageEngine.saveTenants([newTenant, ...currentTenants]);
      } else {
        // Option Buy: Add full lease draft represent full equity ownership title
        const currentLeases = StorageEngine.getLeases();
        const newLease = {
          id: "L-" + Date.now(),
          tenant: localStorage.getItem("sawr_name") || "Valued Customer",
          property: selectedProperty.name,
          unit: "Whole Building",
          start: new Date().toISOString().split('T')[0],
          end: "Life Lease",
          status: "Active",
          risk: "Low"
        };
        StorageEngine.saveLeases([newLease, ...currentLeases]);
      }
      
      // 3. Register financial transaction (Income) under Storage Engine
      const expenses = StorageEngine.getExpenses(); 
      // Add transaction to finances dynamically by raising property statistics
      const currentProperties = StorageEngine.getProperties();
      const updatedProperties = currentProperties.map(p => {
        if (p.id === selectedProperty.id) {
          const addedOccupancy = payType === "Buy" ? 15 : 5;
          return {
            ...p,
            occupancy: Math.min(100, p.occupancy + addedOccupancy),
            revenue: p.revenue + (payType === "Rent" ? amountPaid : amountPaid / 100),
          };
        }
        return p;
      });
      StorageEngine.saveProperties(updatedProperties);
      
      // Dispatch updates
      window.dispatchEvent(new Event("sawr_data_update"));
    }, 2000);
  };

  const filteredProperties = properties.filter(prop => 
    prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 uppercase tracking-widest">
            {role === "admin" ? "SAWR Properties" : "Available Listings"}
          </h2>
          <p className="text-sawr-gold font-bold tracking-[0.2em] text-[10px] sm:text-xs mt-2 uppercase">
            {role === "admin" ? "Real Estate | Investments" : "Browse & Invest Offline or Safely Online"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sawr-gold w-full sm:w-64 text-slate-900 shadow-sm"
            />
          </div>
          
          {role === "admin" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg glow-gold cursor-pointer"
            >
              <Plus size={18} />
              <span>Add Property</span>
            </button>
          )}
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border-slate-200 bg-white max-w-2xl mx-auto mt-8 shadow-md">
          <div className="w-16 h-16 bg-sawr-gold/10 rounded-full flex items-center justify-center mx-auto text-sawr-gold mb-6">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Properties Listed Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            No high-end properties are currently matching your request or stored in SAWR system database.
          </p>
          {role === "admin" && !searchQuery && (
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
              onClick={() => setSelectedProperty(property)}
              className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-sawr-gold/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={property.image} 
                    alt={property.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-sawr-black uppercase tracking-widest border border-slate-200 shadow-sm">
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
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Est. Valuation</p>
                  <p className="text-sm font-bold text-slate-900">
                    {property.type === "Commercial" ? "USh 22.0M" : "USh 12.5M"}
                  </p>
                </div>
                <button className="flex items-center gap-1 bg-sawr-gold hover:bg-gold-600 text-sawr-black text-[10px] font-bold uppercase px-3 py-2 rounded-lg shadow transition-all">
                  <span>View & Pay</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Property Information + Checkout Modal Overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 justify-between flex items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-sawr-gold" />
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">
                    {isCheckoutOpen ? "Secure Checkout Portal" : "Property Information Profile"}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setSelectedProperty(null);
                    setIsCheckoutOpen(false);
                    setPaySuccess(false);
                  }}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Core Info Content */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-700">
                {!isCheckoutOpen ? (
                  // --- VIEW DETAIL MODE ---
                  <div className="space-y-6">
                    <div className="h-56 rounded-2xl overflow-hidden relative">
                      <img 
                        src={selectedProperty.image} 
                        alt={selectedProperty.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-sawr-gold text-sawr-black rounded-md inline-block mb-1">
                          {selectedProperty.type} ASSET
                        </span>
                        <h4 className="text-2xl font-bold font-display">{selectedProperty.name}</h4>
                        <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-sawr-gold" />
                          {selectedProperty.address}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Monthly Rent</span>
                        <span className="text-sm font-bold text-slate-900 block mt-1">
                          {selectedProperty.type === "Commercial" ? "USh 120,000" : "USh 55,000"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Acquisition Price</span>
                        <span className="text-sm font-bold text-slate-900 block mt-1">
                          {selectedProperty.type === "Commercial" ? "USh 22,000,000" : "USh 12,500,000"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Available Units</span>
                        <span className="text-sm font-bold text-slate-900 block mt-1">{selectedProperty.units} Total</span>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Asset Status</span>
                        <span className="text-sm font-bold text-emerald-600 block mt-1">Ready to Lease</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Info size={14} className="text-sawr-gold" />
                        Premium Corporate Specification
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        This gorgeous development asset combines elegant design criteria with robust high-density infrastructure. Engineered using premium specifications: features biometric security gates, high flow borehole networks, reliable solar water-heating grids, elite perimeter layout, and private multi-level parking allocations.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-bold text-sm uppercase tracking-wider text-slate-900">Amenities Matrix</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2"><CheckCircle size={12} className="text-sawr-gold" /> Core High Flow Backup Borehole</span>
                        <span className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2"><CheckCircle size={12} className="text-sawr-gold" /> 24/7 Security Patrol & CCTV</span>
                        <span className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2"><CheckCircle size={12} className="text-sawr-gold" /> High Speed Fibre Internet</span>
                        <span className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2"><CheckCircle size={12} className="text-sawr-gold" /> Dedicated Secure Parking</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => {
                          setPayType("Rent");
                          setIsCheckoutOpen(true);
                        }}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow text-center cursor-pointer"
                      >
                        Monthly Lease Application
                      </button>
                      <button 
                        onClick={() => {
                          setPayType("Buy");
                          setIsCheckoutOpen(true);
                        }}
                        className="flex-1 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md glow-gold text-center cursor-pointer"
                      >
                        Acquire Direct Equity
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- SECURE PAYMENT MODE / PROGRESS / SUCCESS RECEIPT ---
                  <div className="space-y-6">
                    {paySuccess ? (
                      // Pay Success Screen (Receipt)
                      <div className="space-y-6 text-center py-6">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <CheckCircle size={36} />
                        </div>
                        <h4 className="text-2xl font-display font-bold text-slate-950 uppercase tracking-wider">
                          Transaction Successful!
                        </h4>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                          Excellent. Your payment has been secured and a certificate of registration is generated successfully.
                        </p>

                        <div className="bg-slate-950 text-white rounded-3xl p-6 text-left max-w-md mx-auto space-y-4 font-mono text-xs border border-white/15 shadow-xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-transparent opacity-40"></div>
                          <div className="relative z-10 space-y-3">
                            <h5 className="text-[10px] font-bold text-sawr-gold uppercase text-center border-b border-white/10 pb-3 tracking-widest">
                              Official SAWR Payment Receipt
                            </h5>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Merchant:</span>
                              <span>SAWR Group Investments</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Payer Name:</span>
                              <span className="text-sawr-gold">{localStorage.getItem("sawr_name")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Asset:</span>
                              <span className="font-sans font-bold">{selectedProperty.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Order Style:</span>
                              <span>{payType === "Buy" ? "Direct Capital Purchase" : "Sustained Lease Rent"}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-bold text-white">
                              <span>Total Paid:</span>
                              <span className="text-sawr-blue">
                                {formatCurrency(
                                  payType === "Buy" 
                                    ? (selectedProperty.type === "Commercial" ? 22000000 : 12500000)
                                    : (selectedProperty.type === "Commercial" ? 120000 : 55000)
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 text-[10px]">
                              <span className="text-slate-400">M-PESA/Bank Ref:</span>
                              <span className="font-bold text-sawr-gold">{mpesaRef}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center gap-3 pt-4">
                          <a 
                            href="/my-bookings"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedProperty(null);
                              window.history.pushState({}, "", "/my-bookings");
                              window.dispatchEvent(new Event("popstate"));
                            }}
                            className="bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl transition-all shadow cursor-pointer text-center"
                          >
                            View Bookings
                          </a>
                          <button 
                            onClick={() => {
                              setSelectedProperty(null);
                              setIsCheckoutOpen(false);
                              setPaySuccess(false);
                            }}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-xl transition-all cursor-pointer text-center"
                          >
                            Close Portal
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Input payment details form
                      <form onSubmit={handleCompletePayment} className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Checkout Target</span>
                            <span className="text-base font-bold text-slate-900">{selectedProperty.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Amount Due</span>
                            <span className="text-base font-bold text-sawr-gold">
                              {formatCurrency(
                                payType === "Buy" 
                                  ? (selectedProperty.type === "Commercial" ? 22000000 : 12500000)
                                  : (selectedProperty.type === "Commercial" ? 120000 : 55000)
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Payment Method Hub */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Payment Medium</span>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setPayMethod("MPESA")}
                              className={cn(
                                "border p-4 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm tracking-wide transition-all uppercase",
                                payMethod === "MPESA" 
                                  ? "border-emerald-500 bg-emerald-50/20 text-emerald-800" 
                                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
                              )}
                            >
                              <Smartphone size={16} className={cn(payMethod === "MPESA" ? "text-emerald-600" : "text-slate-400")} />
                              <span>M-PESA Push</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayMethod("Card")}
                              className={cn(
                                "border p-4 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm tracking-wide transition-all uppercase",
                                payMethod === "Card" 
                                  ? "border-sawr-gold bg-sawr-gold/5 text-sawr-black" 
                                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
                              )}
                            >
                              <CreditCard size={16} className={cn(payMethod === "Card" ? "text-sawr-gold" : "text-slate-400")} />
                              <span>Debit/Credit Card</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Checkout Forms */}
                        <AnimatePresence mode="wait">
                          {payMethod === "MPESA" ? (
                            <motion.div
                              key="mpesa"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-3 bg-emerald-50/25 p-4 rounded-2xl border border-emerald-100"
                            >
                              <h5 className="text-xs font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                                <Smartphone size={14} /> M-PESA STK Push Handler
                              </h5>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                Enter your M-PESA registered phone number. Upon clicking checkout, we will trigger an STK PIN Prompt to your phone.
                              </p>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Recipient Phone Number</label>
                                <input 
                                  type="tel"
                                  required
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.target.value)}
                                  placeholder="e.g. +254 712 345 678"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-900"
                                />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="card"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200"
                            >
                              <h5 className="text-xs font-bold uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                                <CreditCard size={14} className="text-sawr-gold" /> Encrypted Card Processing
                              </h5>
                              
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Card Holder Number</label>
                                <input 
                                  type="text"
                                  required
                                  value={paymentCard}
                                  onChange={(e) => setPaymentCard(e.target.value)}
                                  placeholder="4000 1234 5678 9010"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sawr-gold text-slate-900 font-mono"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Expiration MM/YY</label>
                                  <input 
                                    type="text"
                                    required
                                    value={paymentExpiry}
                                    onChange={(e) => setPaymentExpiry(e.target.value)}
                                    placeholder="12/28"
                                    maxLength={5}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sawr-gold text-slate-900 font-mono text-center"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CVV Secure Pin</label>
                                  <input 
                                    type="password"
                                    required
                                    value={paymentCVV}
                                    onChange={(e) => setPaymentCVV(e.target.value)}
                                    placeholder="***"
                                    maxLength={3}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sawr-gold text-slate-900 font-mono text-center"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-500 justify-center">
                          <ShieldCheck size={14} className="text-sawr-gold shrink-0" />
                          <span className="font-mono uppercase tracking-wider">PCI-DSS Secure 256-Bit Gateway</span>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                          <button 
                            type="button"
                            onClick={() => setIsCheckoutOpen(false)}
                            className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            Back To Detail
                          </button>
                          <button 
                            type="submit"
                            disabled={isPaying}
                            className={cn(
                              "px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md text-white cursor-pointer flex items-center justify-center gap-2 min-w-[150px]",
                              payMethod === "MPESA" ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200" : "bg-sawr-gold hover:bg-gold-600 text-sawr-black"
                            )}
                          >
                            {isPaying ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <span>Pay {payType === "Buy" ? "Direct Equity" : "Month Rent"}</span>
                                <ArrowRight size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Property Form Modal (Admin Only) */}
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue (USh)</label>
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
