import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Lock, Mail, ArrowRight, ShieldCheck, Phone } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"admin" | "client">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth API call
    setTimeout(() => {
      setIsLoading(false);
      
      const finalName = name.trim() || (role === "admin" ? "Judith Oyoo" : "Valued Client");
      const finalEmail = email.trim() || "client@sawr.com";
      const finalPhone = phone.trim() || "+254 712 345678";

      localStorage.setItem("sawr_role", role);
      localStorage.setItem("sawr_name", finalName);
      localStorage.setItem("sawr_email", finalEmail);
      localStorage.setItem("sawr_phone", finalPhone);
      localStorage.setItem("sawr_auth", "true");
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/src/assets/images/luxury_housing_bg_1781437455458.jpg')` }}
      />
      
      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/30" />

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        <div className="text-center mb-6">
          <div className="bg-white p-3 rounded-2xl inline-block mb-4 shadow-xl relative">
            <div className="absolute inset-0 bg-sawr-gold mix-blend-overlay opacity-20 rounded-2xl"></div>
            <img 
              src="/src/assets/images/sawr_logo_1781434320923.jpg" 
              alt="SAWR GROUP" 
              className="h-12 w-auto object-contain relative z-10"
            />
          </div>
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">
            {isLogin ? "System Access" : "Portal Registration"}
          </h2>
          <p className="text-sawr-gold font-bold tracking-[0.1em] text-[10px] mt-1 uppercase">
            {role === "admin" ? "Administrative Operations" : "Premium Client Investment Portal"}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setRole("client")}
            className={cn(
              "py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
              role === "client" 
                ? "bg-sawr-gold text-sawr-black shadow" 
                : "text-white/60 hover:text-white"
            )}
          >
            Client Portal
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={cn(
              "py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
              role === "admin" 
                ? "bg-sawr-gold text-sawr-black shadow" 
                : "text-white/60 hover:text-white"
            )}
          >
            System Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                   <input 
                     type="text" 
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Full Name"
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-sawr-gold transition-colors"
                   />
                </div>
                <div className="relative">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                   <input 
                     type="tel" 
                     required
                     value={phone}
                     onChange={(e) => setPhone(e.target.value)}
                     placeholder="Phone Number"
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-sawr-gold transition-colors"
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
             <input 
               type="email" 
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="Email Address"
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-sawr-gold transition-colors"
             />
          </div>

          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
             <input 
               type="password" 
               required
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Password"
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-sawr-gold transition-colors"
             />
          </div>

          {isLogin && (
            <div className="flex justify-end pt-1">
              <button type="button" className="text-xs text-white/60 hover:text-sawr-gold transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-sawr-gold hover:bg-gold-600 text-sawr-black font-bold uppercase tracking-wider py-4 rounded-xl mt-6 transition-all shadow-lg glow-gold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer animate-none"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-sawr-black/30 border-t-sawr-black rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? "Sign In" : "Register Portal"}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">
            {isLogin ? "Need a property investment account?" : "Already have portal credentials?"} {" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sawr-gold font-bold hover:underline ml-1 cursor-pointer"
            >
              {isLogin ? "Sign up here" : "Sign in here"}
            </button>
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sawr-gold via-sawr-orange to-sawr-blue"></div>
      </motion.div>

      {/* System Status Footer */}
      <div className="absolute bottom-6 text-center w-full z-10 flex items-center justify-center gap-2">
        <ShieldCheck size={16} className="text-white/40" />
        <span className="text-white/40 text-xs font-mono uppercase tracking-widest">End-to-End Encrypted Access</span>
      </div>
    </div>
  );
}
