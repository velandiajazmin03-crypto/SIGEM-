"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Laptop,
  Wrench,
  FileBarChart2,
  LogOut,
  User,
  Menu,
  X,
  School,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export interface AdminUser {
  nombre: string;
  username: string;
  rol: string;
}

const AdminUserContext = createContext<AdminUser | null>(null);

/** Acceso al usuario autenticado (rol incluido) desde cualquier página del panel admin. */
export function useAdminUser(): AdminUser {
  const ctx = useContext(AdminUserContext);
  if (!ctx) throw new Error("useAdminUser debe usarse dentro de AdminLayoutClient");
  return ctx;
}

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: AdminUser;
}

// Identidad de color propia por sección: cada pestaña se reconoce por su acento.
const menuItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/admin/dashboard",
    active: "bg-indigo-600 text-white shadow-md shadow-indigo-600/20",
    hover: "hover:bg-indigo-500/10 hover:text-indigo-300",
  },
  {
    label: "Gestión de Equipos",
    icon: <Laptop className="h-5 w-5" />,
    href: "/admin/equipos",
    active: "bg-cyan-600 text-white shadow-md shadow-cyan-600/20",
    hover: "hover:bg-cyan-500/10 hover:text-cyan-300",
  },
  {
    label: "Registro de Fallas",
    icon: <Wrench className="h-5 w-5" />,
    href: "/admin/fallas",
    active: "bg-rose-600 text-white shadow-md shadow-rose-600/20",
    hover: "hover:bg-rose-500/10 hover:text-rose-300",
  },
  {
    label: "Reportes",
    icon: <FileBarChart2 className="h-5 w-5" />,
    href: "/admin/reportes",
    active: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
    hover: "hover:bg-emerald-500/10 hover:text-emerald-300",
  },
];

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    }
  };

  const getPageTitle = () => {
    const active = menuItems.find((item) => pathname.startsWith(item.href));
    return active ? active.label : "Administración";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar para desktop */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 relative no-print ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header de Sidebar */}
        <div className="h-20 flex items-center px-5 border-b border-slate-800 justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-indigo-600 p-2 rounded-xl flex-shrink-0">
              <School className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col leading-none"
              >
                <span className="font-bold text-ink text-sm">SIGEM</span>
                <span className="text-[10px] text-indigo-400 font-semibold mt-0.5">Institucional</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-grow py-6 px-3 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all ${
                  isActive ? `${item.active} font-semibold` : `text-slate-400 hover:bg-slate-800 ${item.hover}`
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer de Sidebar (Perfil y Logout) */}
        <div className="p-4 border-t border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col leading-tight min-w-0"
              >
                <span className="text-sm font-semibold text-ink truncate">{user.nombre}</span>
                <span className="text-[10px] text-slate-500 capitalize">{user.rol}</span>
              </motion.div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>

        {/* Botón colapsar Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-20 -right-3.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Sidebar para mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden no-print">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative flex flex-col w-72 max-w-[80vw] h-full bg-slate-900 border-r border-slate-800 p-5"
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Logo */}
              <div className="flex items-center space-x-3 mt-2 mb-8">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <School className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-ink text-base">SIGEM</span>
                  <span className="text-[10px] text-indigo-400 font-semibold mt-0.5">Control & Mantenimiento</span>
                </div>
              </div>

              {/* Menú */}
              <nav className="flex-grow space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        isActive ? `${item.active} font-semibold` : `text-slate-400 hover:bg-slate-800 ${item.hover}`
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-ink">{user.nombre}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{user.rol}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header Superior */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-6 sm:px-8 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 no-print">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-ink tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-xs font-semibold text-slate-300">{user.nombre}</span>
              <span className="text-[10px] text-indigo-400 font-medium mt-1 uppercase tracking-wider">{user.rol}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenedor de la página actual */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto">
          <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>
        </main>
      </div>
    </div>
  );
}
