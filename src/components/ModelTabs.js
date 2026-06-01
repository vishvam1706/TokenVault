"use client";
import { MODELS } from "@/lib/models";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function ModelTabs({ activeModel, onModelChange }) {
  return (
    <div className="relative w-full overflow-x-auto pb-1 scrollbar-none">
      {/* Premium Neobrutalist Sliding Track */}
      <div className="inline-flex p-1.5 bg-[#EAEAE6] rounded-full border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] gap-1">
        {MODELS.map((model) => {
          const isActive = activeModel === model.key;
          return (
            <button
              key={model.key}
              id={`tab-${model.key}`}
              onClick={() => onModelChange(model.key)}
              className={clsx(
                "relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold cursor-pointer whitespace-nowrap transition-colors outline-none",
                isActive ? "text-white" : "text-text-muted hover:text-text-main"
              )}
            >
              {/* Smooth Sliding Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeModelTab"
                  className="absolute inset-0 bg-black rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              {/* Sleek Brand Colored Dots */}
              <span className={clsx(
                "w-2 h-2 rounded-full transition-transform",
                isActive ? "scale-125" : "scale-100",
                model.key.startsWith("gemini") ? "bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]" :
                model.key.startsWith("claude") ? "bg-[#F97316] shadow-[0_0_8px_#F97316]" : 
                "bg-[#10B981] shadow-[0_0_8px_#10B981]"
              )} />
              
              <span>{model.label}</span>
              
              {model.badge && (
                <span className={clsx(
                  "text-[9px] px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase ml-1",
                  isActive ? "bg-white text-black" : "bg-black text-white"
                )}>
                  {model.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
