"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Timer, Layers, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-background">
      
      {/* ── Geometric Accents ── */}
      <motion.div 
        initial={{ opacity: 0, rotate: -20, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden md:block absolute top-[15%] left-[5%] w-12 h-12 border-[3px] border-black rounded-[14px] opacity-20 pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
        className="hidden md:block absolute bottom-[10%] left-[10%] w-16 h-16 bg-[#29A85C] rotate-12 pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden md:block absolute top-[20%] right-[5%] w-24 h-24 rounded-full bg-[#3B82F6] pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
        className="hidden md:block absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full border-[3px] border-black opacity-10 pointer-events-none"
      />

      {/* ── Left panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:p-16 max-w-[640px] z-10 relative md:pl-[10vw]">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white">
              <img src="/tokenvault_logo.svg" alt="TokenVault Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="font-jakarta text-[24px] font-extrabold tracking-[-0.03em] text-text-main">
              TokenVault
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="font-jakarta text-[clamp(48px,6vw,72px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-text-main mb-6">
            Track your<br />
            <span className="relative inline-block">
              <span className="relative z-10">Antigravity</span>
              <span className="absolute bottom-1 left-0 w-full h-4 bg-[#FDE68A] -z-10 -rotate-1"></span>
            </span>
            <br />accounts
          </h1>
          <p className="text-text-muted font-bold text-[16px] leading-[1.6] max-w-[420px] mb-10">
            Monitor token refresh countdowns for all 6 AI models across all your accounts — in one clean dashboard.
          </p>
        </motion.div>

        {/* Sign in button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-10"
        >
          <div className="relative inline-block">
            <button
              id="google-signin-btn"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="btn-primary text-[16px] py-4 px-8 relative z-10"
            >
              <GoogleIcon />
              Continue with Google
              <ArrowRight size={18} strokeWidth={3} />
            </button>
            <div className="absolute top-1.5 left-1.5 w-full h-full border-2 border-black rounded-full pointer-events-none"></div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4"
        >
          {[
            { icon: Timer,       text: "Live second-by-second countdowns" },
            { icon: Layers,      text: "All 6 Antigravity AI models tracked" },
            { icon: ShieldCheck, text: "Secured with Google OAuth + MongoDB" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                <Icon size={14} className="text-black stroke-[2.5px]" />
              </div>
              <span className="text-[14px] font-bold text-text-main tracking-[0.01em]">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right panel ── */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 z-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-[420px] relative"
        >
          {/* Decorative arrow behind card */}
          <div className="absolute -top-12 -right-12 w-32 h-32 z-0 opacity-40">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#29A85C] fill-current">
              <path d="M20,80 L80,20 L80,60 M80,20 L40,20" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          {/* Mock dashboard preview card */}
          <div className="bg-white rounded-[32px] border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 mb-6 relative z-10 rotate-1 transition-transform hover:rotate-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[15px] font-bold text-text-main mb-1">user@example.com</div>
                <div className="text-[12px] font-bold text-text-subtle uppercase tracking-[0.05em]">Main account</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#E8F5E9] text-[#1B5E20] border-2 border-[#1B5E20]">● Available</span>
            </div>
            <div className="font-mono text-[36px] font-bold text-[#1B5E20] tracking-[-0.02em] mb-2">
              0 : 00 : 00 : 00
            </div>
            <div className="text-[11px] font-bold text-text-subtle tracking-[0.08em] uppercase">
              D : HH : MM : SS
            </div>
          </div>

          <div className="bg-white rounded-[32px] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-8 opacity-80 relative z-0 -rotate-2 -ml-4 mt-[-20px] transition-transform hover:rotate-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[15px] font-bold text-text-main mb-1">alt@example.com</div>
                <div className="text-[12px] font-bold text-text-subtle uppercase tracking-[0.05em]">Secondary</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-white text-text-subtle border-2 border-text-subtle">● Exhausted</span>
            </div>
            <div className="font-mono text-[36px] font-bold text-text-subtle tracking-[-0.02em] mb-2">
              0 : 08 : 42 : 11
            </div>
            <div className="text-[11px] font-bold text-text-subtle tracking-[0.08em] uppercase">
              D : HH : MM : SS
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.333 17.64 12.025 17.64 9.2z" fill="#fff" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#fff" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#fff" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#fff" />
    </svg>
  );
}
