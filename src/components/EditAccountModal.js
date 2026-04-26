"use client";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { MODELS } from "@/lib/models";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Convert a resetAt date back to remaining d/h/m for pre-filling the form. */
function resetAtToTimes(resetAt) {
  const remaining = Math.max(0, new Date(resetAt).getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return { days, hours, minutes };
}

function buildInitialTimes(account) {
  return Object.fromEntries(
    MODELS.map((m) => {
      const md = account?.models?.find((x) => x.key === m.key);
      return [m.key, md ? resetAtToTimes(md.resetAt) : { days: 0, hours: 0, minutes: 0 }];
    })
  );
}

export default function EditAccountModal({ open, onClose, onSaved, account }) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [modelTimes, setModelTimes] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setEmail(account.email || "");
      setNickname(account.nickname || "");
      setModelTimes(buildInitialTimes(account));
    }
  }, [account]);

  const setTime = (key, field, val) => {
    const n = Math.max(0, parseInt(val) || 0);
    setModelTimes((prev) => {
      const next = { ...prev };
      if (key.startsWith("claude-") || key === "gpt-oss-120b") {
        Object.keys(next).forEach((k) => {
          if (k.startsWith("claude-") || k === "gpt-oss-120b") next[k] = { ...next[k], [field]: n };
        });
      } else if (key.startsWith("gemini-3-1-pro")) {
        Object.keys(next).forEach((k) => {
          if (k.startsWith("gemini-3-1-pro")) next[k] = { ...next[k], [field]: n };
        });
      } else {
        next[key] = { ...next[key], [field]: n };
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${account._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), nickname: nickname.trim(), modelTimes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      toast.success("Account updated successfully");
      onSaved(data.account);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content aria-describedby={undefined} asChild>
              <motion.div
                className="dialog p-8"
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="font-jakarta text-xl font-bold text-text-main tracking-[-0.01em]">
                    Edit Account
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="btn-icon"><X size={16} /></button>
                  </Dialog.Close>
                </div>

                {/* Email + Nickname */}
                <div className="flex flex-col gap-4 mb-8">
                  <div>
                    <label className="label" htmlFor="edit-email">Email Address *</label>
                    <input
                      id="edit-email" type="email" className="input"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="edit-nickname">Nickname (optional)</label>
                    <input
                      id="edit-nickname" type="text" className="input"
                      value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={50}
                    />
                  </div>
                </div>

                <div className="divider -mx-8 mb-6" />

                {/* Model time inputs */}
                <div className="mb-8">
                  <label className="label mb-4">Remaining Time per Model</label>
                  <div className="flex flex-col gap-3">
                    {MODELS.map((model) => (
                      <div key={model.key} className="flex items-center justify-between px-5 py-4 bg-white rounded-[24px] border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <span className="text-sm text-text-main font-medium">{model.label}</span>
                          {model.badge && <span className="badge new-badge">{model.badge}</span>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {[
                            { field: "days",    max: 30, label: "d" },
                            { field: "hours",   max: 23, label: "h" },
                            { field: "minutes", max: 59, label: "m" },
                          ].map(({ field, max, label }) => (
                            <div key={field} className="flex items-center gap-1">
                              <input
                                id={`edit-${model.key}-${field}`} type="number" className="spinner" min={0} max={max}
                                value={modelTimes[model.key]?.[field] ?? 0} onChange={(e) => setTime(model.key, field, e.target.value)}
                              />
                              <span className="text-xs text-text-subtle font-medium">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end">
                  <Dialog.Close asChild>
                    <button className="btn-secondary">Cancel</button>
                  </Dialog.Close>
                  <button id="edit-save-btn" className="btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
