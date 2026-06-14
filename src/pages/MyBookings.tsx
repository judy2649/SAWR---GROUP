import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  CheckCircle, 
  Receipt, 
  ChevronRight, 
  FileText, 
  FileCheck, 
  X,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency, cn } from "@/src/lib/utils";

interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  type: "Rent" | "Buy";
  paymentAmount: number;
  paymentMethod: string;
  paymentReference: string;
  date: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedContract, setSelectedContract] = useState<Booking | null>(null);

  useEffect(() => {
    // Fetch bookings from localStorage
    const saved = JSON.parse(localStorage.getItem("sawr_bookings") || "[]");
    setBookings(saved);

    const handleUpdate = () => {
      setBookings(JSON.parse(localStorage.getItem("sawr_bookings") || "[]"));
    };
    window.addEventListener("sawr_data_update", handleUpdate);
    return () => window.removeEventListener("sawr_data_update", handleUpdate);
  }, []);

  const totalPaid = bookings.reduce((sum, item) => sum + item.paymentAmount, 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 uppercase tracking-widest">
            My Portfolio Bookings
          </h2>
          <p className="text-sawr-gold font-bold tracking-[0.2em] text-[10px] sm:text-xs mt-2 uppercase">
            Sustained Acquisitions & Active Leases
          </p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
          <Receipt size={14} className="text-sawr-gold" />
          <span>Active Accounts Portal</span>
        </div>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Capital Invested</p>
              <h4 className="text-2xl font-bold mt-2 font-mono text-sawr-gold">{formatCurrency(totalPaid)}</h4>
              <p className="text-[10px] text-slate-400 mt-2">SAWR Digital Secure Gateway</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-sawr-gold">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Leaseholds</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-2">
                {bookings.filter(b => b.type === "Rent").length} Assets
              </h4>
              <p className="text-[10px] text-slate-500 mt-2">Monthly Automated Renewals</p>
            </div>
            <div className="p-3 bg-sawr-gold/10 border border-sawr-gold/20 rounded-2xl text-sawr-gold">
              <FileText size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acquisitions Owned</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-2">
                {bookings.filter(b => b.type === "Buy").length} Assets
              </h4>
              <p className="text-[10px] text-slate-500 mt-2">100% Freehold Certificates Issued</p>
            </div>
            <div className="p-3 bg-sawr-blue/10 border border-sawr-blue/20 rounded-2xl text-sawr-blue">
              <FileCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-sawr-gold/5 border border-sawr-gold/20 rounded-full flex items-center justify-center mx-auto text-sawr-gold mb-6">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Transactions Captured</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            You currently have no properties bought or lease agreements active. Find listing assets inside our "Browse Assets" matrix.
          </p>
          <div className="mt-6">
            <a 
              href="/properties" 
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/properties");
                window.dispatchEvent(new Event("popstate"));
              }}
              className="inline-flex items-center gap-2 bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-xl transition-all shadow-md glow-gold"
            >
              <span>Explore Locations Catalog</span>
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
            Consolidated Ledger & Documents Block
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-sawr-gold/40 hover:shadow-md transition-all space-y-4 relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-l from-slate-50 to-transparent -z-10"></div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md",
                      booking.type === "Buy" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-sawr-gold/10 text-sawr-black border border-sawr-gold/20"
                    )}>
                      {booking.type === "Buy" ? "Equity Land Purchase" : "Active Leasehold agreement"}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{booking.date}</span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{booking.propertyName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-sawr-gold" />
                      {booking.propertyAddress}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Capital Paid</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{formatCurrency(booking.paymentAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Method & Reference</span>
                    <span className="font-bold text-sawr-gold block mt-0.5 truncate">{booking.paymentMethod} • {booking.paymentReference}</span>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button 
                    onClick={() => setSelectedContract(booking)}
                    className="flex-1 bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={12} className="text-sawr-gold" />
                    <span>Generate Secure PDF Deed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract/Certificate Generator Modal overlay */}
      <AnimatePresence>
        {selectedContract && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-slate-700 flex flex-col"
            >
              {/* Receipt / Certificate Header */}
              <div className="p-6 border-b border-slate-100 justify-between flex items-center bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-sawr-gold" />
                  <h4 className="text-sm font-bold uppercase tracking-widest text-sawr-gold">
                    Official Investment Document
                  </h4>
                </div>
                <button 
                  onClick={() => setSelectedContract(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-300 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Certificate content styled to print perfectly */}
              <div className="p-8 space-y-6 text-center text-slate-800">
                <div className="border-[3px] border-double border-sawr-gold p-6 rounded-2xl bg-slate-50 relative space-y-6">
                  {/* Decorative corner borders */}
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-sawr-gold">SAWR</div>
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-sawr-gold">GROUP</div>
                  
                  <div className="space-y-2">
                    <img 
                      src="/src/assets/images/sawr_logo_1781434320923.jpg" 
                      alt="SAWR GROUP" 
                      className="h-10 w-auto object-contain mx-auto"
                    />
                    <h3 className="font-display font-bold text-xl uppercase tracking-widest text-slate-950 mt-4">
                      {selectedContract.type === "Buy" ? "Equity Purchase Title Deed" : "Certificate of Tenant Tenancy"}
                    </h3>
                    <p className="text-[10px] leading-snug uppercase tracking-wider font-bold text-slate-400">
                      SAWR GROUP REAL ESTATE & INVENTORIES LIMITED
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 max-w-md mx-auto">
                    This official instrument validates that <strong className="text-slate-900">{localStorage.getItem("sawr_name")}</strong> is registered as the fully authenticated holder of the property assets details listed below, following compliant offline/online payment.
                  </p>

                  <div className="text-left text-xs space-y-2 bg-white p-4 rounded-xl border border-slate-100 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Certificate Reference:</span>
                      <span className="font-bold text-sawr-gold">{selectedContract.paymentReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Estate Asset:</span>
                      <span className="text-slate-900 font-sans font-bold">{selectedContract.propertyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registration Address:</span>
                      <span className="text-slate-900 font-sans">{selectedContract.propertyAddress}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 font-sans font-bold text-sm">
                      <span>Certified Payment:</span>
                      <span className="text-sawr-blue">{formatCurrency(selectedContract.paymentAmount)}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100">
                    <div className="text-left">
                      <p className="font-bold uppercase">Issued Date</p>
                      <p className="font-mono">{selectedContract.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold uppercase">Authorized Clerk</p>
                      <p className="font-mono text-sawr-gold">DIGITAL SAWR SECURE</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => alert("Simulating document export. Contract certificate downloaded in high resolution PDF format successfully!")}
                  className="w-full bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all shadow-md glow-gold cursor-pointer"
                >
                  Download Formal Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
