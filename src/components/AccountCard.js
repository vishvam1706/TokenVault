"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { MODELS, getModelStatus, formatCountdown } from "@/lib/models";
import { Pencil, Trash2, Tag, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function AccountCard({ account, activeModel, index, onEdit, onDelete, isPrivacyMode }) {
  const [now, setNow] = useState(Date.now());
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Reset individual reveal when global privacy mode changes
  useEffect(() => {
    setIsRevealed(false);
  }, [isPrivacyMode]);

  const activeModelData = account.models?.find((m) => m.key === activeModel);
  const resetAt = activeModelData ? new Date(activeModelData.resetAt).getTime() : now;
  const remaining = resetAt - now;
  const status = remaining <= 0 ? "available" : remaining < 6 * 3600 * 1000 ? "soon" : "exhausted";
  const countdownStr = formatCountdown(Math.max(0, remaining));

  const statusLabel = status === "available" ? "Available" : status === "soon" ? "Soon" : "Exhausted";

  const resetDateString = remaining > 0
    ? new Date(resetAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
    : null;

  const maskEmail = (email) => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!user || !domain) return "••••••••";
    if (user.length <= 3) return `${user[0] || ""}•••@${domain}`;
    return `${user.slice(0, 3)}••••@${domain}`;
  };

  const maskNickname = (nickname) => {
    if (!nickname) return "";
    return "••••";
  };

  const showDetails = !isPrivacyMode || isRevealed;
  const displayedEmail = showDetails ? account.email : maskEmail(account.email);
  const displayedNickname = showDetails ? account.nickname : maskNickname(account.nickname);

  return (
    <Tooltip.Provider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
        className={clsx("bg-white rounded-[28px] sm:rounded-[32px] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col gap-5 sm:gap-6 p-6 sm:p-8 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)]", {
          "bg-[#F0FDF4]": status === "available",
          "opacity-80": status === "exhausted",
        })}
      >
        {/* ── Top row ── */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-jakarta text-[14px] sm:text-[16px] font-bold text-text-main overflow-hidden text-ellipsis whitespace-nowrap">
                {displayedEmail}
              </span>
              {isPrivacyMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRevealed(!isRevealed);
                  }}
                  className="p-1 rounded-md text-text-subtle hover:bg-black/5 hover:text-text-main transition-colors shrink-0 outline-none cursor-pointer"
                  title={isRevealed ? "Hide details" : "Reveal details"}
                >
                  {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
            {account.nickname && (
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-text-subtle" />
                <span className="text-xs text-text-muted">
                  {displayedNickname}
                </span>
              </div>
            )}
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="btn-icon shrink-0 border-none">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="bg-card rounded-lg p-1 shadow-md border border-border min-w-[120px] z-50"
              >
                <DropdownMenu.Item
                  onClick={() => onEdit(account)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-muted rounded cursor-pointer outline-none hover:bg-subtle hover:text-text-main"
                >
                  <Pencil size={14} /> Edit
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onDelete(account._id)}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 rounded cursor-pointer outline-none hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* ── Countdown ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border-2", {
              "bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]": status === "available",
              "bg-[#FFFBEB] text-[#B45309] border-[#B45309]": status === "soon",
              "bg-white text-text-subtle border-text-subtle": status === "exhausted",
            })}>● {statusLabel}</span>
          </div>
          <div className={clsx("font-mono text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] mb-1", {
            "text-[#1B5E20]": status === "available",
            "text-[#B45309]": status === "soon",
            "text-text-subtle": status === "exhausted",
          })}>
            {countdownStr}
          </div>
          <div className="text-[11px] font-bold text-text-subtle mt-1 tracking-[0.08em] uppercase">
            D : HH : MM : SS
          </div>
          {resetDateString && (
            <div className="mt-3 text-[13px] font-bold text-text-main flex items-center gap-1.5">
              <span>Returns at:</span>
              <span className="bg-subtle px-2 py-0.5 rounded-md border border-black/10">
                {resetDateString}
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-0.5 bg-black/10 rounded-full my-1" />

        {/* ── Mini model grid ── */}
        <div className="flex flex-wrap gap-2">
          {MODELS.map((m) => {
            const md = account.models?.find((x) => x.key === m.key);
            const ms = md ? getModelStatus(md.resetAt) : "exhausted";
            return (
              <Tooltip.Root key={m.key}>
                <Tooltip.Trigger asChild>
                  <div className={clsx(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md cursor-default border-2",
                    m.key === activeModel ? "bg-black border-black text-white" : "bg-transparent border-black/20 text-text-main hover:border-black"
                  )}>
                    <span className={clsx("dot", ms)} />
                    <span className={clsx(
                      "font-jakarta text-[12px] font-bold",
                      m.key === activeModel ? "text-white" : "text-text-main"
                    )}>
                      {m.key.split("-").slice(-1)[0].toUpperCase()}
                    </span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={4}
                    className="bg-text-main text-white px-3 py-2 rounded-md text-xs shadow-md z-50 max-w-[200px]"
                  >
                    <strong className="block mb-0.5 font-semibold">{m.label}</strong>
                    <span className={clsx("capitalize", ms === "available" ? "text-green-300" : ms === "soon" ? "text-amber-300" : "text-gray-400")}>
                      {ms}
                    </span>
                    {md && (
                      <div className="text-white/70 text-[11px] mt-1">
                        Resets: {new Date(md.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    <Tooltip.Arrow className="fill-text-main" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </div>
      </motion.div>
    </Tooltip.Provider>
  );
}
