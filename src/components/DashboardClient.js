"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, LayoutGrid, Loader2, Search, Filter, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DEFAULT_MODEL } from "@/lib/models";
import ModelTabs from "@/components/ModelTabs";
import SummaryBar from "@/components/SummaryBar";
import AccountCard from "@/components/AccountCard";
import AddAccountModal from "@/components/AddAccountModal";
import EditAccountModal from "@/components/EditAccountModal";

export default function DashboardClient({ initialAccounts }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeModel, setActiveModel] = useState(DEFAULT_MODEL);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tokenvault_privacy_mode");
    if (saved === "true") {
      setIsPrivacyMode(true);
    }
  }, []);

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem("tokenvault_privacy_mode", String(next));
      return next;
    });
  };

  // Client-side refresh: always fetch from API on mount so stale SSR data never shows
  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
        }
      })
      .catch(() => {}); // Silent — SSR data is still shown if this fails
  }, []);

  // Sort accounts by active model's resetAt ascending (soonest / available first)
  const sorted = useMemo(() => {
    let filtered = [...accounts];
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.email.toLowerCase().includes(q) || 
        (a.nickname && a.nickname.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(a => {
        const m = a.models?.find((x) => x.key === activeModel);
        if (!m) return false;
        const remaining = new Date(m.resetAt).getTime() - Date.now();
        
        if (statusFilter === "available") return remaining <= 0;
        if (statusFilter === "1day") return remaining > 0 && remaining <= 86400000;
        if (statusFilter === "2days") return remaining > 0 && remaining <= 2 * 86400000;
        if (statusFilter === "7days") return remaining > 0 && remaining <= 7 * 86400000;
        return true;
      });
    }

    return filtered.sort((a, b) => {
      const getTs = (acc) => {
        const m = acc.models?.find((x) => x.key === activeModel);
        return m ? new Date(m.resetAt).getTime() : Infinity;
      };
      return getTs(a) - getTs(b);
    });
  }, [accounts, activeModel, searchQuery, statusFilter]);

  const handleAdded = useCallback((account) => {
    setAccounts((prev) => [account, ...prev]);
  }, []);

  const handleEdited = useCallback((updated) => {
    setAccounts((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/accounts/${deleteTarget}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setAccounts((prev) => prev.filter((a) => a._id !== deleteTarget));
      toast.success("Account deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* ── Model tab bar ── */}
      <div className="pt-6 px-4 md:px-8 max-w-[1400px] mx-auto">
        <ModelTabs activeModel={activeModel} onModelChange={setActiveModel} />
      </div>

      {/* ── Main content ── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 pb-16">

        {/* Summary bar */}
        <SummaryBar accounts={accounts} activeModel={activeModel} />

        {/* Actions row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 flex-1 w-full">
            <div className="flex items-center gap-2 shrink-0 hidden sm:flex">
              <LayoutGrid size={18} className="text-text-subtle" />
              <span className="text-sm font-semibold text-text-muted font-jakarta">
                {sorted.length} Account{sorted.length !== 1 ? "s" : ""}
              </span>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-text-muted" />
              </div>
              <input
                type="text"
                className="input !pl-9"
                placeholder="Search email/nickname..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center justify-between gap-2 h-[48px] w-full sm:w-auto sm:min-w-[180px] px-5 rounded-full border-2 border-black bg-[#FDE68A] font-jakarta text-[14px] font-bold text-text-main shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all outline-none shrink-0">
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>
                      {statusFilter === "all" ? "All Timings" : 
                       statusFilter === "available" ? "Available Now" : 
                       statusFilter === "1day" ? "Returns < 1 Day" : 
                       statusFilter === "2days" ? "Returns < 2 Days" : 
                       "Returns < 7 Days"}
                    </span>
                  </div>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 text-black">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="bg-white rounded-2xl p-2 border-2 border-black shadow-[6px_6px_0_rgba(0,0,0,1)] min-w-[200px] z-50 flex flex-col gap-1 font-jakarta"
                >
                  {[
                    { val: "all", label: "All Timings" },
                    { val: "available", label: "Available Now" },
                    { val: "1day", label: "Returns < 1 Day" },
                    { val: "2days", label: "Returns < 2 Days" },
                    { val: "7days", label: "Returns < 7 Days" },
                  ].map(opt => (
                    <DropdownMenu.Item
                      key={opt.val}
                      onClick={() => setStatusFilter(opt.val)}
                      className={clsx(
                        "px-4 py-2.5 rounded-xl text-[14px] font-bold cursor-pointer outline-none transition-colors",
                        statusFilter === opt.val 
                          ? "bg-black text-white" 
                          : "text-text-main hover:bg-black/5"
                      )}
                    >
                      {opt.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Privacy Mode Toggle */}
            <button
              id="privacy-toggle-btn"
              onClick={togglePrivacyMode}
              className={clsx(
                "flex items-center justify-center gap-2 h-[48px] w-full sm:w-auto px-5 rounded-full border-2 border-black font-jakarta text-[14px] font-bold shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all outline-none shrink-0",
                isPrivacyMode ? "bg-[#A7F3D0] text-black" : "bg-white text-text-main"
              )}
              title={isPrivacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
            >
              {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{isPrivacyMode ? "Privacy Mode On" : "Privacy Mode Off"}</span>
            </button>
          </div>
          <button
            id="add-account-btn"
            className="btn-primary shrink-0 w-full lg:w-auto mt-2 lg:mt-0"
            onClick={() => setShowAdd(true)}
          >
            Add Account <Plus size={16} />
          </button>
        </div>

        {/* Cards grid */}
        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 px-8 bg-white rounded-[32px] border-2 border-black shadow-[6px_6px_0_rgba(0,0,0,1)]"
          >
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="font-jakarta text-2xl font-black text-text-main mb-3 tracking-[-0.02em]">
              No accounts yet
            </h2>
            <p className="text-text-muted font-bold text-[15px] mb-8 max-w-[320px] mx-auto leading-[1.6]">
              Add your first Antigravity account to start tracking token reset countdowns.
            </p>
            <button className="btn-primary" onClick={() => setShowAdd(true)}>
              Add Your First Account <Plus size={16} />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
            <AnimatePresence>
              {sorted.map((account, i) => (
                <AccountCard
                  key={account._id}
                  account={account}
                  activeModel={activeModel}
                  index={i}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                  isPrivacyMode={isPrivacyMode}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddAccountModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={handleAdded}
      />
      <EditAccountModal
        open={!!editTarget}
        account={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={handleEdited}
      />

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog.Root open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AnimatePresence>
          {!!deleteTarget && (
            <AlertDialog.Portal forceMount>
              <AlertDialog.Overlay asChild>
                <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              </AlertDialog.Overlay>
              <AlertDialog.Content asChild>
                <motion.div
                  className="dialog p-8 max-w-[420px]"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <AlertDialog.Title className="font-jakarta text-xl font-bold text-text-main tracking-[-0.01em] mb-3">
                    Delete Account
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-text-muted text-sm mb-8 leading-relaxed">
                    Are you sure you want to delete this account? This action cannot be undone and will permanently remove all countdown data.
                  </AlertDialog.Description>
                  <div className="flex justify-end gap-3">
                    <AlertDialog.Cancel asChild>
                      <button className="btn-secondary">Cancel</button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete Account"}
                        {deleting ? <Loader2 size={16} className="animate-spin" /> : null}
                      </button>
                    </AlertDialog.Action>
                  </div>
                </motion.div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          )}
        </AnimatePresence>
      </AlertDialog.Root>
    </>
  );
}
