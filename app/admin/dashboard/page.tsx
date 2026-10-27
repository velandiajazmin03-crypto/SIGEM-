"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  PlusCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Activity,
  PieChart,
} from "lucide-react";
import { DashboardStats, Falla } from "@/lib/db/types";
import { useAdminUser } from "@/components/AdminLayoutClient";

// Referencian las mismas variables CSS del tema (globals.css): los colores del
// gráfico responden automáticamente a claro/oscuro y al modo daltónico, sin
// necesitar lógica en JS.
const ESTADO_COLORS = {
  Excelente: "rgb(var(--emerald-400))",
  Bueno: "rgb(var(--blue-400))",
  Falla: "rgb(var(--rose-400))",
  "De Baja": "rgb(var(--amber-400))",
} as const;

const FALLA_COLORS = {
  Reportado: "rgb(var(--rose-400))",
  "En Proceso": "rgb(var(--amber-400))",
  Resuelto: "rgb(var(--emerald-400))",
} as const;

function InventoryDonut({ stats }: { stats: DashboardStats }) {
  const data = [
    { label: "Buen Estado", value: stats.equiposBuenEstado, color: "rgb(var(--emerald-400))" },
    { label: "Con Falla", value: stats.equiposConFallas, color: "rgb(var(--rose-400))" },
    { label: "De Baja", value: stats.equiposDeBaja, color: "rgb(var(--amber-400))" },
  ];
  const total = data.reduce((s, d) => s + d.value, 0);

  let acc = 0;
  const gap = total > 0 ? 1.2 : 0;
  const stops: string[] = [];
  if (total === 0) {
    stops.push("rgb(var(--slate-800)) 0% 100%");
  } else {
    data
      .filter((d) => d.value > 0)
      .forEach((d) => {
        const span = (d.value / total) * 100;
        const start = acc + gap / 2;
        const end = acc + span - gap / 2;
        stops.push(`rgb(var(--slate-900)) ${acc}% ${start}%`);
        stops.push(`${d.color} ${start}% ${Math.max(start, end)}%`);
        acc += span;
      });
    stops.push(`rgb(var(--slate-900)) ${acc}% 100%`);
  }
  const gradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-44 h-44"
        style={{ background: gradient, borderRadius: "9999px" }}
      >
        <div className="absolute inset-[20%] rounded-full bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-ink leading-none">{total}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">Equipos</span>
        </div>
      </motion.div>

      <div className="w-full mt-6 space-y-2.5">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={d.label} className="flex items-center justify-between text-xs">
              <span className="flex items-center text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                {d.label}
              </span>
              <span className="text-slate-400 font-mono">
                {d.value} <span className="text-slate-600">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FallasBarChart({ stats }: { stats: DashboardStats }) {
  const data = [
    { label: "Reportado", value: stats.fallasReportadas, color: FALLA_COLORS.Reportado },
    { label: "En Proceso", value: stats.fallasEnProceso, color: FALLA_COLORS["En Proceso"] },
    { label: "Resuelto", value: stats.fallasResueltas, color: FALLA_COLORS.Resuelto },
  ];
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-5 w-full">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>{d.label}</span>
            <span className="font-mono text-slate-400">{d.value}</span>
          </div>
          <div className="w-full h-3 bg-slate-800/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: d.color }}
            ></motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAdminUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [fallas, setFallas] = useState<Falla[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, fallasRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/fallas"),
        ]);
        const statsData = await statsRes.json();
        const fallasData = await fallasRes.json();
        setStats(statsData);
        setFallas(fallasData.slice(0, 4));
      } catch (e) {
        console.error("Error fetching dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const total = stats.totalEquipos || 0;
  const pctBuenEstado = total > 0 ? Math.round((stats.equiposBuenEstado / total) * 100) : 0;
  const pctConFallas = total > 0 ? Math.round((stats.equiposConFallas / total) * 100) : 0;
  const pctDeBaja = total > 0 ? Math.round((stats.equiposDeBaja / total) * 100) : 0;

  const statCards = [
    {
      label: "Equipos Registrados",
      value: stats.totalEquipos,
      sub: "Inventario total",
      icon: <Laptop className="h-5 w-5 text-indigo-400" />,
      border: "border-t-indigo-500",
    },
    {
      label: "En Buen Estado",
      value: stats.equiposBuenEstado,
      sub: `${pctBuenEstado}% del inventario`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      border: "border-t-emerald-500",
    },
    {
      label: "Con Fallas Activas",
      value: stats.equiposConFallas,
      sub: `${pctConFallas}% del inventario`,
      icon: <Wrench className="h-5 w-5 text-rose-400" />,
      border: "border-t-rose-500",
    },
    {
      label: "De Baja",
      value: stats.equiposDeBaja,
      sub: `${pctDeBaja}% del inventario`,
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      border: "border-t-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Cabecera analítica — identidad propia del Dashboard */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-900/40 p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3">
              <Activity className="h-3 w-3 mr-1.5" /> CENTRO DE CONTROL
            </span>
            <h2 className="text-2xl font-bold text-ink tracking-tight">Hola, {user.nombre.split(" ")[0]}</h2>
            <p className="text-xs text-slate-400 mt-1">Estado en tiempo real de la infraestructura tecnológica institucional.</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/equipos"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/10"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Equipo
            </Link>
            <Link
              href="/admin/fallas"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-400" />
              Reportar Falla
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`p-6 rounded-2xl border border-slate-800 border-t-2 ${card.border} bg-slate-900/40 backdrop-blur-md flex justify-between items-center`}
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">{card.label}</span>
              <span className="text-3xl font-extrabold text-ink block">{card.value}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">{card.sub}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">{card.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Analítica: donut, barras de fallas, y últimos reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-ink mb-1 flex items-center">
            <PieChart className="h-4 w-4 text-indigo-400 mr-2" />
            Composición del Inventario
          </h3>
          <p className="text-[11px] text-slate-500 mb-6">Distribución real de equipos por condición.</p>
          <InventoryDonut stats={stats} />
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-ink mb-1 flex items-center">
            <Wrench className="h-4 w-4 text-rose-400 mr-2" />
            Fallas por Estado
          </h3>
          <p className="text-[11px] text-slate-500 mb-8">Embudo histórico de incidentes técnicos.</p>
          <div className="flex-grow flex items-center">
            <FallasBarChart stats={stats} />
          </div>
          <div className="mt-8 pt-5 border-t border-slate-800 text-center">
            <Link
              href="/admin/fallas"
              className="inline-flex items-center text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Abrir tablero de fallas
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-ink mb-1">Fallas Recientes</h3>
          <p className="text-[11px] text-slate-500 mb-5">Últimos reportes de incidentes por personal técnico.</p>

          <div className="space-y-3 flex-grow">
            {fallas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <CheckCircle2 className="h-9 w-9 text-slate-600 mb-3" />
                <p className="text-xs">No hay fallas reportadas recientemente.</p>
              </div>
            ) : (
              fallas.map((falla) => (
                <div
                  key={falla.id}
                  className="p-3.5 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-xs font-semibold text-ink truncate">{falla.equipo_nombre}</span>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md border flex-shrink-0 ${
                          falla.estado_reparacion === "Reportado"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : falla.estado_reparacion === "En Proceso"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {falla.estado_reparacion}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="flex items-center">
                        <UserCheck className="h-3 w-3 mr-1" />
                        {falla.responsable}
                      </span>
                      <span>{new Date(falla.fecha_reporte).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link
              href="/admin/reportes"
              className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Ver reporte de inventario completo
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
