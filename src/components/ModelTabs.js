"use client";
import { MODELS } from "@/lib/models";
import clsx from "clsx";

export default function ModelTabs({ activeModel, onModelChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {MODELS.map((model) => (
        <button
          key={model.key}
          id={`tab-${model.key}`}
          onClick={() => onModelChange(model.key)}
          className={clsx("tab", { active: activeModel === model.key })}
        >
          {model.label}
          {model.badge && (
            <span className="badge new-badge ml-1">{model.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
