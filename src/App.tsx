import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "@/src/components/Sidebar";
import { Header } from "@/src/components/Header";
import Dashboard from "@/src/pages/Dashboard";
import Properties from "@/src/pages/Properties";
import Tenants from "@/src/pages/Tenants";
import Finance from "@/src/pages/Finance";
import Maintenance from "@/src/pages/Maintenance";
import Communications from "@/src/pages/Communications";
import Reports from "@/src/pages/Reports";
import Leases from "@/src/pages/Leases";
import Vacancy from "@/src/pages/Vacancy";
import Expenses from "@/src/pages/Expenses";
import Auth from "@/src/pages/Auth";

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("sawr_auth") === "true";
  });
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!isAuthenticated) {
    return (
      <Auth 
        onLogin={() => {
          localStorage.setItem("sawr_auth", "true");
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-sawr-gold/20 overflow-hidden relative">
      {/* Premium System Background Layer with Ambient Gradient Mask */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
        <img 
          src="/src/assets/images/system_background_1781434655744.jpg" 
          alt="System Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-slate-50/50 to-transparent"></div>
      </div>

      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 z-10 relative bg-white/40 backdrop-blur-[2px]">
        <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide pb-20 lg:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/vacancy" element={<Vacancy />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/leases" element={<Leases />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
