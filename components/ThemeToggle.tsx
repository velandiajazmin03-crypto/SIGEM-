"use client";

import React, { useState } from "react";
import { Sun, Moon, Eye, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

/** Selector compacto de tema: claro/oscuro + modo daltónico (paleta CVD-segura). */
export default function ThemeToggle({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { mode, cvd, toggleMode, setCvd } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1">
        <button
          onClick={toggleMode}
          title={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {mode === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          title="Accesibilidad de color"
          className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
            cvd ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Eye className="h-4 w-4" />
          {variant === "default" && <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={cvd}
                onChange={(e) => setCvd(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-indigo-600 cursor-pointer"
              />
              <span>
                <span className="block text-xs font-bold text-ink">Modo daltónico</span>
                <span className="block text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Usa una paleta más distinguible para daltonismo rojo-verde en gráficos y estados.
                </span>
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
