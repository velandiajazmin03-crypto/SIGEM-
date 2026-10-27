"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Search,
  Plus,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Columns3,
  List,
  GripVertical,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Falla, Equipo, EstadoReparacion } from "@/lib/db/types";
import FileUploadField from "@/components/FileUploadField";

type ViewMode = "kanban" | "list";

// Ícono + color + texto siempre juntos: el estado nunca depende solo del color.
const FALLA_BADGE: Record<EstadoReparacion, { className: string; icon: React.ReactNode }> = {
  Reportado: { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: <AlertCircle className="h-2.5 w-2.5" /> },
  "En Proceso": { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <RefreshCw className="h-2.5 w-2.5" /> },
  Resuelto: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle2 className="h-2.5 w-2.5" /> },
};

const COLUMNS: { estado: EstadoReparacion; title: string; accent: string; dot: string; header: string }[] = [
  {
    estado: "Reportado",
    title: "Reportado",
    accent: "border-rose-500/30",
    dot: "bg-rose-500",
    header: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  },
  {
    estado: "En Proceso",
    title: "En Proceso",
    accent: "border-amber-500/30",
    dot: "bg-amber-500",
    header: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  {
    estado: "Resuelto",
    title: "Resuelto",
    accent: "border-emerald-500/30",
    dot: "bg-emerald-500",
    header: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
];

function FallaCard({
  falla,
  onManage,
  draggable,
  onDragStart,
}: {
  falla: Falla;
  onManage: () => void;
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onManage}
      className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-slate-700 transition-all ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wider block">{falla.equipo_codigo}</span>
          <h4 className="text-xs font-bold text-ink leading-tight truncate">{falla.equipo_nombre}</h4>
        </div>
        {draggable && <GripVertical className="h-3.5 w-3.5 text-slate-700 flex-shrink-0 mt-0.5" />}
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-3">{falla.descripcion}</p>
      {falla.evidencia_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={falla.evidencia_url}
          alt="Evidencia de la falla"
          className="w-full h-24 object-cover rounded-lg border border-slate-800 mb-3"
        />
      )}
      <div className="flex items-center justify-between text-[9px] text-slate-500">
        <span className="flex items-center">
          <User className="h-2.5 w-2.5 mr-1" />
          {falla.responsable}
        </span>
        <span className="flex items-center">
          <Calendar className="h-2.5 w-2.5 mr-1" />
          {new Date(falla.fecha_reporte).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default function FallasPage() {
  const [fallas, setFallas] = useState<Falla[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [dragOverCol, setDragOverCol] = useState<EstadoReparacion | null>(null);
  const [moveError, setMoveError] = useState("");

  // Modales
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSolveOpen, setIsSolveOpen] = useState(false);
  const [selectedFalla, setSelectedFalla] = useState<Falla | null>(null);

  // Formularios
  const [reportData, setReportData] = useState({
    equipo_id: "",
    descripcion: "",
    responsable: "",
    evidencia_url: null as string | null,
  });
  const [solveData, setSolveData] = useState({
    estado_reparacion: "En Proceso" as EstadoReparacion,
    solucion: "",
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [fallasRes, equiposRes] = await Promise.all([fetch("/api/fallas"), fetch("/api/equipos")]);
      const fallasData = await fallasRes.json();
      const equiposData = await equiposRes.json();

      setFallas(fallasData);
      setEquipos(equiposData);
    } catch (e) {
      console.error("Error al obtener fallas o equipos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReportModal = () => {
    setReportData({ equipo_id: "", descripcion: "", responsable: "", evidencia_url: null });
    setFormError("");
    setIsReportOpen(true);
  };

  const openSolveModal = (falla: Falla, presetEstado?: EstadoReparacion) => {
    setSelectedFalla(falla);
    setSolveData({
      estado_reparacion: presetEstado || falla.estado_reparacion,
      solucion: falla.solucion || "",
    });
    setFormError("");
    setIsSolveOpen(true);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.equipo_id) {
      setFormError("Por favor seleccione un equipo de cómputo.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/fallas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Fallo al reportar la falla.");

      setIsReportOpen(false);
      fetchData();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFalla) return;
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/fallas/${selectedFalla.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(solveData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Fallo al actualizar la falla.");

      setIsSolveOpen(false);
      fetchData();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Movimiento rápido por arrastre (drag & drop nativo)
  const handleDrop = async (target: EstadoReparacion, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCol(null);
    const idStr = e.dataTransfer.getData("text/falla-id");
    const id = parseInt(idStr);
    if (isNaN(id)) return;
    const falla = fallas.find((f) => f.id === id);
    if (!falla || falla.estado_reparacion === target) return;

    // Resolver requiere documentar la solución: abrimos el modal en vez de mover directo.
    if (target === "Resuelto") {
      openSolveModal(falla, "Resuelto");
      return;
    }

    setMoveError("");
    // Actualización optimista
    setFallas((prev) => prev.map((f) => (f.id === id ? { ...f, estado_reparacion: target } : f)));
    try {
      const res = await fetch(`/api/fallas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_reparacion: target }),
      });
      if (!res.ok) throw new Error("No se pudo mover la falla.");
      fetchData();
    } catch (err: any) {
      setMoveError(err.message || "Error al mover la falla.");
      fetchData();
    }
  };

  const filteredFallas = useMemo(
    () =>
      fallas.filter((falla) => {
        return (
          falla.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (falla.equipo_nombre && falla.equipo_nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (falla.equipo_codigo && falla.equipo_codigo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          falla.responsable.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }),
    [fallas, searchQuery]
  );

  return (
    <div className="space-y-6">
      {/* Cabecera de identidad — Mesa de Ayuda (alerta) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-2">
            <ShieldAlert className="h-3 w-3 mr-1.5" /> MESA DE AYUDA TÉCNICA
          </span>
          <h2 className="text-xl font-bold text-ink">Registro y Seguimiento de Fallas</h2>
        </div>

        <div className="hidden sm:flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "kanban" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Vista de tablero"
          >
            <Columns3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Vista de lista"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por falla, equipo, código, responsable..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        <button
          onClick={openReportModal}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-md shadow-rose-600/10"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Reportar Falla
        </button>
      </div>

      {moveError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{moveError}</span>
        </div>
      )}

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredFallas.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <CheckCircle2 className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-sm font-semibold">No hay fallas registradas.</p>
          <p className="text-xs text-slate-600 mt-1">¡Buen trabajo! Todos los equipos se encuentran en orden.</p>
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map((col) => {
            const items = filteredFallas.filter((f) => f.estado_reparacion === col.estado);
            return (
              <div
                key={col.estado}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.estado);
                }}
                onDragLeave={() => setDragOverCol((c) => (c === col.estado ? null : c))}
                onDrop={(e) => handleDrop(col.estado, e)}
                className={`rounded-3xl border-2 border-dashed p-4 min-h-[200px] transition-colors bg-slate-950/30 ${
                  dragOverCol === col.estado ? "border-slate-500 bg-slate-800/30" : "border-slate-800/60"
                }`}
              >
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-4 ${col.header}`}>
                  <span className="flex items-center text-xs font-bold">
                    <span className={`w-2 h-2 rounded-full mr-2 ${col.dot}`}></span>
                    {col.title}
                  </span>
                  <span className="text-[10px] font-mono opacity-80">{items.length}</span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((falla) => (
                      <FallaCard
                        key={falla.id}
                        falla={falla}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/falla-id", String(falla.id))}
                        onManage={() => openSolveModal(falla)}
                      />
                    ))}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-600">Arrastra una falla aquí</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFallas.map((falla) => (
            <motion.div
              layout
              key={falla.id}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md hover:border-slate-700/60 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 font-mono tracking-wider block mb-1">
                      {falla.equipo_codigo}
                    </span>
                    <h4 className="text-sm font-bold text-ink leading-tight">{falla.equipo_nombre}</h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${FALLA_BADGE[falla.estado_reparacion].className}`}
                  >
                    {FALLA_BADGE[falla.estado_reparacion].icon}
                    {falla.estado_reparacion}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-3 rounded-xl border border-slate-850">
                  {falla.descripcion}
                </p>

                {falla.evidencia_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={falla.evidencia_url}
                    alt="Evidencia de la falla"
                    className="w-full h-32 object-cover rounded-xl border border-slate-800"
                  />
                )}

                {falla.estado_reparacion === "Resuelto" && falla.solucion && (
                  <div className="text-xs p-3 rounded-xl bg-emerald-950/15 border border-emerald-500/20 text-emerald-400 space-y-1">
                    <span className="font-bold block">Solución Técnica:</span>
                    <p className="leading-relaxed text-[11px] text-slate-300">{falla.solucion}</p>
                    {falla.fecha_solucion && (
                      <span className="text-[9px] text-slate-500 block pt-1">
                        Resuelto el: {new Date(falla.fecha_solucion).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex flex-col space-y-1">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    Resp: {falla.responsable}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Reportado: {new Date(falla.fecha_reporte).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => openSolveModal(falla)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-semibold transition-colors"
                >
                  {falla.estado_reparacion === "Resuelto" ? "Ver Detalles" : "Gestionar Falla"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL REPORTAR FALLA */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl z-10"
            >
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-850/50">
                <h3 className="text-base font-bold text-ink">Reportar Falla de Computador</h3>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleReport} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Seleccionar Equipo de Cómputo *</label>
                  <select
                    required
                    value={reportData.equipo_id}
                    onChange={(e) => setReportData({ ...reportData, equipo_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-200 text-xs outline-none cursor-pointer"
                  >
                    <option value="">Seleccione un equipo del inventario...</option>
                    {equipos.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        [{eq.codigo_inventario}] {eq.nombre} - {eq.marca} (Sala: {eq.ubicacion})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Responsable del Reporte *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Carlos Mendoza"
                    value={reportData.responsable}
                    onChange={(e) => setReportData({ ...reportData, responsable: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Descripción de la Falla Técnica *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describa de forma clara y detallada el fallo observado en el computador (Ej. No da video, el mouse no funciona, pantalla azul constante, etc.)..."
                    value={reportData.descripcion}
                    onChange={(e) => setReportData({ ...reportData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-100 text-xs outline-none resize-none"
                  ></textarea>
                </div>

                <FileUploadField
                  category="fallas"
                  accent="rose"
                  label="Evidencia Fotográfica (opcional)"
                  value={reportData.evidencia_url}
                  onChange={(url) => setReportData({ ...reportData, evidencia_url: url })}
                />

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-600/10"
                  >
                    {submitting ? "Reportando..." : "Reportar Falla"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GESTIONAR / RESOLVER FALLA */}
      <AnimatePresence>
        {isSolveOpen && selectedFalla && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSolveOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl z-10"
            >
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-850/50">
                <div className="leading-tight">
                  <h3 className="text-base font-bold text-ink">Gestionar Falla</h3>
                  <span className="text-[10px] text-rose-400 font-mono block mt-1">
                    Equipo: {selectedFalla.equipo_nombre} ({selectedFalla.equipo_codigo})
                  </span>
                </div>
                <button
                  onClick={() => setIsSolveOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSolve} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="text-xs p-3.5 bg-slate-950/30 rounded-xl border border-slate-850 text-slate-300">
                  <strong className="text-slate-400 block mb-1">Descripción de la Falla:</strong>
                  {selectedFalla.descripcion}
                </div>

                {selectedFalla.estado_reparacion === "Resuelto" ? (
                  <div className="space-y-4">
                    <div className="text-xs p-3.5 bg-emerald-950/15 border border-emerald-500/20 rounded-xl text-emerald-400">
                      <strong className="block mb-1">Solución técnica registrada:</strong>
                      <p className="text-slate-200">{selectedFalla.solucion}</p>
                      {selectedFalla.fecha_solucion && (
                        <span className="text-[9px] text-slate-500 block pt-2">
                          Solucionado el: {new Date(selectedFalla.fecha_solucion).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsSolveOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        Cerrar Ventana
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Estado de la Reparación</label>
                      <select
                        value={solveData.estado_reparacion}
                        onChange={(e) => setSolveData({ ...solveData, estado_reparacion: e.target.value as EstadoReparacion })}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-300 text-xs outline-none"
                      >
                        <option value="Reportado">Reportado</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Descripción de la Solución *</label>
                      <textarea
                        rows={4}
                        required={solveData.estado_reparacion === "Resuelto"}
                        placeholder="Detalle los trabajos efectuados para reparar la falla técnica del equipo (Ej. Se reinstaló controlador de video, se reemplazó cable flex defectuoso, etc.)..."
                        value={solveData.solucion}
                        onChange={(e) => setSolveData({ ...solveData, solucion: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-slate-100 text-xs outline-none resize-none"
                      ></textarea>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsSolveOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-md shadow-rose-600/10"
                      >
                        {submitting ? "Guardando..." : "Actualizar Estado"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
