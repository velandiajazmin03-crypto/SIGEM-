"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  cvd: boolean;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  setCvd: (cvd: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const MODE_KEY = "sigem-theme-mode";
const CVD_KEY = "sigem-theme-cvd";

/**
 * Script inyectado antes de la hidratación para aplicar el tema guardado
 * sin parpadeo (evita el flash de tema incorrecto al cargar la página).
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var mode = localStorage.getItem('${MODE_KEY}') || 'dark';
    var cvd = localStorage.getItem('${CVD_KEY}') === 'true';
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode === 'light' ? 'light' : 'dark');
    root.classList.toggle('cvd', cvd);
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("dark");
  const [cvd, setCvdState] = useState(false);

  useEffect(() => {
    const storedMode = (localStorage.getItem(MODE_KEY) as Mode) || "dark";
    const storedCvd = localStorage.getItem(CVD_KEY) === "true";
    setModeState(storedMode);
    setCvdState(storedCvd);
  }, []);

  const applyMode = useCallback((next: Mode) => {
    setModeState(next);
    localStorage.setItem(MODE_KEY, next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
  }, []);

  const applyCvd = useCallback((next: boolean) => {
    setCvdState(next);
    localStorage.setItem(CVD_KEY, String(next));
    document.documentElement.classList.toggle("cvd", next);
  }, []);

  const toggleMode = useCallback(() => {
    applyMode(mode === "dark" ? "light" : "dark");
  }, [mode, applyMode]);

  return (
    <ThemeContext.Provider value={{ mode, cvd, setMode: applyMode, toggleMode, setCvd: applyCvd }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
