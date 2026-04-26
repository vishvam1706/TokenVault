"use client";
import { useState, useEffect, useMemo } from "react";
import { MODELS, formatCountdown } from "@/lib/models";
import clsx from "clsx";

export default function SummaryBar({ accounts, activeModel }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const total = accounts.length;
    let availableNow = 0;
    let nextReset = Infinity;
    let nextResetAccount = null;

    accounts.forEach((acc) => {
      const m = acc.models?.find((x) => x.key === activeModel);
      if (!m) return;
      const remaining = new Date(m.resetAt).getTime() - Date.now();
      if (remaining <= 0) {
        availableNow++;
      } else if (remaining < nextReset) {
        nextReset = remaining;
        nextResetAccount = acc;
      }
    });

    const modelLabel = MODELS.find((m) => m.key === activeModel)?.label || activeModel;
    const nextReturnStr = total === 0 ? "—" : nextReset === Infinity ? "Available" : formatCountdown(nextReset);

    return { total, availableNow, nextReturnStr, modelLabel, nextResetAccount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, activeModel, tick]);

  const items = [
    { label: "Total Accounts", value: stats.total, colorClass: "text-text-main" },
    { label: "Available Now", value: stats.availableNow, colorClass: "text-green-600" },
    {
      label: "Next Return In",
      value: stats.nextReturnStr,
      colorClass: "text-text-main",
      mono: true,
      extra: stats.nextResetAccount
        ? (stats.nextResetAccount.nickname
          ? `${stats.nextResetAccount.nickname} (${stats.nextResetAccount.email})`
          : stats.nextResetAccount.email)
        : null
    },
    { label: "Active Model", value: stats.modelLabel, colorClass: "text-text-muted", small: true },
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
      {items.map(({ label, value, colorClass, mono, small, extra }) => (
        <div key={label} className="bg-white rounded-[32px] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] px-6 py-5 sm:px-8 sm:py-6">
          <div className="text-[13px] font-bold text-text-muted uppercase tracking-[0.05em] mb-3">
            {label}
          </div>
          <div className={clsx(
            colorClass,
            "leading-[1.2] break-words",
            mono ? "font-mono text-[24px] tracking-[-0.02em]" : "font-jakarta tracking-[-0.01em]",
            !mono && (small ? "text-lg font-black" : "text-[32px] font-black")
          )}>
            {value}
          </div>
          {extra && (
            <div className="mt-2 text-[12px] font-bold text-text-muted bg-black/5 inline-block px-2 py-0.5 rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">
              {extra}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
