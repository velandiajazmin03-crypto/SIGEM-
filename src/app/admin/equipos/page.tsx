"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  FileText,
  X,
  AlertCircle,
  Laptop,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Lock,
  CheckCircle2,
  ThumbsUp,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Equipo, EstadoEquipo } from "@/lib/db/types";
import { useAdminUser } from "@/components/AdminLayoutClient";
import FileUploadField from "@/components/FileUploadField";

type SortKey = "nombre" | "estado" | "ubicacion" | "codigo_inventario";
type ViewMode = "grid" | "table";

const PAGE_SIZE = 8;

// El ícono acompaña siempre al color y al texto: el estado nunca depende
// únicamente del color (accesible para daltonismo por diseño, no solo en el modo CVD).
const ESTADO_BADGE: Record<EstadoEquipo, { className: string; icon: React.ReactNode }> = {
  Excelente: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle2 className="h-2.5 w-2.5" /> },
  Bueno: { className: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <ThumbsUp className="h-2.5 w-2.5" /> },
  Falla: { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: <AlertTriangle className="h-2.5 w-2.5" /> },
  "De Baja": { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <XCircle className="h-2.5 w-2.5" /> },
};

export default function EquiposPage() {
  const user = useAdminUser();
  const isAdmin = user.rol === "admin";

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Estado para los modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    codigo_inventario: "",
    nombre: "",
    marca: "",
    modelo: "",
    serial: "",
    procesador: "",
    ram: "",
    disco_duro: "",
    sistema_operativo: "",
    estado: "Excelente" as EstadoEquipo,
    ubicacion: "",
    observaciones: "",
    foto_url: null as string | null,
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchEquipos = async () => {
    try {
      const res = await fetch("/api/equipos");
      const data = await res.json();
      setEquipos(data);
    } catch (e) {
      console.error("Error al obtener equipos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, viewMode]);

  const openCreateModal = () => {
    setFormData({
      codigo_inventario: "",
      nombre: "",
      marca: "",
      modelo: "",
      serial: "",
      procesador: "",
      ram: "",
      disco_duro: "",
      sistema_operativo: "Windows 11 Pro",
      estado: "Excelente",
      ubicacion: "",
      observaciones: "",
      foto_url: null,
    });
    setFormError("");
    setIsCreateOpen(true);
  };

  const openEditModal = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setFormData({
      codigo_inventario: equipo.codigo_inventario,
      nombre: equipo.nombre,
      marca: equipo.marca,
      modelo: equipo.modelo,
      serial: equipo.serial,
      procesador: equipo.procesador,
      ram: equipo.ram,
      disco_duro: equipo.disco_duro,
      sistema_operativo: equipo.sistema_operativo,
      estado: equipo.estado,
      ubicacion: equipo.ubicacion,
      observaciones: equipo.observaciones,
      foto_url: equipo.foto_url || null,
    });
    setFormError("");
    setIsEditOpen(true);
  };

  const openDeleteModal = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setDeleteError("");
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Fallo al registrar equipo.");

      setIsCreateOpen(false);
      fetchEquipos();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipo) return;
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/equipos/${selectedEquipo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Fallo al actualizar equipo.");

      setIsEditOpen(false);
      fetchEquipos();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEquipo) return;
    setSubmitting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/equipos/${selectedEquipo.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Fallo al eliminar equipo.");

      setIsDeleteOpen(false);
      fetchEquipos();
    } catch (e: any) {
      setDeleteError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Filtrado, orden y paginación
  const filteredEquipos = useMemo(() => {
    const f = equipos.filter((eq) => {
      const matchesSearch =
        eq.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.codigo_inventario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.serial.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "todos" || eq.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const sorted = [...f].sort((a, b) => {
      const va = a[sortKey].toLowerCase();
      const vb = b[sortKey].toLowerCase();
      const cmp = va.localeCompare(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [equipos, searchQuery, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedEquipos = filteredEquipos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Cabecera de identidad — Inventario (cian) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-2">
            <Laptop className="h-3 w-3 mr-1.5" /> INVENTARIO TECNOLÓGICO
          </span>
          <h2 className="text-xl font-bold text-ink">Gestión de Equipos</h2>
        </div>

        {/* Toggle de vista */}
        <div className="hidden sm:flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Vista de galería"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "table" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Vista de tabla"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros superior */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, código..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Falla">Con Falla</option>
              <option value="De Baja">De Baja</option>
            </select>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors shadow-md shadow-cyan-600/10"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Registrar Equipo
        </button>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredEquipos.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <Laptop className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <p className="text-sm font-semibold">No se encontraron equipos registrados.</p>
          <p className="text-xs text-slate-600 mt-1">Prueba cambiando los filtros o registra uno nuevo.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {paginatedEquipos.map((eq, i) => (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/40"
            >
              <div className="flex items-start justify-between mb-4">
                {eq.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={eq.foto_url} alt={eq.nombre} className="w-11 h-11 rounded-xl object-cover border border-cyan-500/20" />
                ) : (
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Laptop className="h-5 w-5" />
                  </div>
                )}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${ESTADO_BADGE[eq.estado].className}`}>
                  {ESTADO_BADGE[eq.estado].icon}
                  {eq.estado}
                </span>
              </div>

              <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider">{eq.codigo_inventario}</span>
              <h4 className="text-sm font-bold text-ink leading-tight mt-1 mb-1">{eq.nombre}</h4>
              <p className="text-[11px] text-slate-500 mb-3">{eq.marca} · {eq.modelo}</p>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-4">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {eq.ubicacion}
              </div>

              <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-center gap-2">
                <Link
                  href={`/admin/equipos/${eq.id}/hoja-de-vida`}
                  title="Ver Hoja de Vida"
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-400 hover:text-white transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => openEditModal(eq)}
                  title="Editar Datos"
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-400 hover:text-white transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => (isAdmin ? openDeleteModal(eq) : undefined)}
                  disabled={!isAdmin}
                  title={isAdmin ? "Eliminar Equipo" : "Solo un administrador puede eliminar"}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-800 text-slate-400 transition-colors ${
                    isAdmin ? "hover:bg-rose-600 hover:text-white" : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  {isAdmin ? <Trash2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {([
                    ["codigo_inventario", "Código"],
                    ["nombre", "Equipo / Modelo"],
                    ["ubicacion", "Ubicación"],
                    ["estado", "Estado"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="px-6 py-4">
                      <button onClick={() => toggleSort(key)} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                        {label}
                        <ArrowUpDown className={`h-3 w-3 ${sortKey === key ? "text-cyan-400" : "text-slate-600"}`} />
                      </button>
                    </th>
                  ))}
                  <th className="px-6 py-4">Serial</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {paginatedEquipos.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-cyan-400 font-semibold">{eq.codigo_inventario}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink">{eq.nombre}</div>
                      <div className="text-[10px] text-slate-500">{eq.marca} - {eq.modelo}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{eq.ubicacion}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${ESTADO_BADGE[eq.estado].className}`}>
                        {ESTADO_BADGE[eq.estado].icon}
                        {eq.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{eq.serial}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/equipos/${eq.id}/hoja-de-vida`}
                          title="Ver Hoja de Vida"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-400 hover:text-white transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(eq)}
                          title="Editar Datos"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => (isAdmin ? openDeleteModal(eq) : undefined)}
                          disabled={!isAdmin}
                          title={isAdmin ? "Eliminar Equipo" : "Solo un administrador puede eliminar"}
                          className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 transition-colors ${
                            isAdmin ? "hover:bg-rose-600 hover:text-white" : "opacity-40 cursor-not-allowed"
                          }`}
                        >
                          {isAdmin ? <Trash2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {filteredEquipos.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] text-slate-500">
            Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredEquipos.length)} de {filteredEquipos.length} equipos
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      <AnimatePresence>
        {(isCreateOpen || isEditOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-850/50">
                <h3 className="text-base font-bold text-ink">
                  {isCreateOpen ? "Registrar Nuevo Equipo" : "Editar Especificaciones del Equipo"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                  }}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={isCreateOpen ? handleCreate : handleEdit} className="p-6 space-y-4 overflow-y-auto">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Código de Inventario *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. EQ-001"
                      value={formData.codigo_inventario}
                      onChange={(e) => setFormData({ ...formData, codigo_inventario: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Nombre del Equipo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. PC Torre HP"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Marca *</label>
                    <input
                      type="text"
                      required
                      placeholder="HP, Dell, Lenovo..."
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Modelo *</label>
                    <input
                      type="text"
                      required
                      placeholder="OptiPlex, ThinkPad..."
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Número de Serial *</label>
                    <input
                      type="text"
                      required
                      placeholder="Serial del fabricante..."
                      value={formData.serial}
                      onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Procesador *</label>
                    <input
                      type="text"
                      required
                      placeholder="Intel Core i5, AMD Ryzen 5..."
                      value={formData.procesador}
                      onChange={(e) => setFormData({ ...formData, procesador: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Memoria RAM *</label>
                    <input
                      type="text"
                      required
                      placeholder="8 GB DDR4, 16 GB..."
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Disco Duro / Almacenamiento *</label>
                    <input
                      type="text"
                      required
                      placeholder="256 GB SSD, 1 TB HDD..."
                      value={formData.disco_duro}
                      onChange={(e) => setFormData({ ...formData, disco_duro: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Sistema Operativo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Windows 11 Pro, Ubuntu 22.04..."
                      value={formData.sistema_operativo}
                      onChange={(e) => setFormData({ ...formData, sistema_operativo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Ubicación Física *</label>
                    <input
                      type="text"
                      required
                      placeholder="Laboratorio 1, Biblioteca..."
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Estado Inicial *</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoEquipo })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-300 text-xs outline-none"
                    >
                      <option value="Excelente">Excelente</option>
                      <option value="Bueno">Bueno</option>
                      <option value="Falla">Falla Técnica</option>
                      <option value="De Baja">De Baja</option>
                    </select>
                  </div>
                </div>

                <FileUploadField
                  category="equipos"
                  accent="cyan"
                  label="Foto del Equipo"
                  value={formData.foto_url}
                  onChange={(url) => setFormData({ ...formData, foto_url: url })}
                />

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Observaciones y Notas</label>
                  <textarea
                    rows={3}
                    placeholder="Detalles adicionales, número de compra, licencias..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs outline-none resize-none"
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setIsEditOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-600/10"
                  >
                    {submitting ? "Guardando..." : "Guardar Equipo"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR */}
      <AnimatePresence>
        {isDeleteOpen && selectedEquipo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl z-10"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-ink">¿Confirmar Eliminación?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás a punto de eliminar el equipo <strong className="text-ink">{selectedEquipo.nombre} ({selectedEquipo.codigo_inventario})</strong>.
                  <br />
                  <span className="text-rose-400 font-semibold">Esta acción es irreversible y eliminará todo su historial de fallas y mantenimientos asociados.</span>
                </p>

                {deleteError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">{deleteError}</div>
                )}

                <div className="pt-4 flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
                  >
                    {submitting ? "Eliminando..." : "Eliminar permanentemente"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
