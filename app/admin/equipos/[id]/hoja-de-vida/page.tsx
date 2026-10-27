"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  Wrench,
  Plus,
  X,
  AlertCircle,
  Laptop,
  FileText,
  BadgeCheck,
  Lock,
} from "lucide-react";
import { Equipo, Mantenimiento, TipoMantenimiento, EstadoEquipo } from "@/lib/db/types";
import { useAdminUser } from "@/components/AdminLayoutClient";
import FileUploadField from "@/components/FileUploadField";

export default function HojaDeVidaPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const user = useAdminUser();
  const canSeeCostos = user.rol === "admin";

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageUrl, setPageUrl] = useState("");

  // Modal para agregar mantenimiento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maintData, setMaintData] = useState({
    tipo: "Preventivo" as TipoMantenimiento,
    descripcion: "",
    responsable: "",
    costo: "",
    actualizar_estado_equipo: "" as EstadoEquipo | "",
    documento_url: null as string | null,
  });
  const [maintError, setMaintError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const loadData = async () => {
    if (isNaN(id)) {
      setError("ID de equipo inválido.");
      setLoading(false);
      return;
    }

    try {
      const [eqRes, maintRes] = await Promise.all([
        fetch(`/api/equipos/${id}`),
        fetch(`/api/equipos/${id}/mantenimientos`),
      ]);

      if (!eqRes.ok) throw new Error("Equipo no encontrado.");

      const eqData = await eqRes.json();
      const maintData = await maintRes.json();

      setEquipo(eqData);
      setMantenimientos(maintData);
    } catch (e: any) {
      setError(e.message || "Error al cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openModal = () => {
    setMaintData({
      tipo: "Preventivo",
      descripcion: "",
      responsable: "",
      costo: "",
      actualizar_estado_equipo: equipo ? equipo.estado : "",
      documento_url: null,
    });
    setMaintError("");
    setIsModalOpen(true);
  };

  const handleAddMantenimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setMaintError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/equipos/${id}/mantenimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(maintData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el mantenimiento.");

      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      setMaintError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !equipo) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl max-w-md mx-auto flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-xs">{error || "No se pudo cargar el equipo."}</span>
        </div>
        <Link href="/admin/equipos" className="inline-flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Volver a equipos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Botones de acción superiores */}
      <div className="flex items-center justify-between no-print border-b border-slate-800 pb-4">
        <Link
          href="/admin/equipos"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver a Equipos
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <Plus className="mr-1.5 h-4 w-4 text-violet-400" />
            Registrar Mantenimiento
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors shadow-md shadow-violet-600/10"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Imprimir Hoja de Vida
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL — estética de ficha / certificado */}
      <div className="print-page relative bg-slate-900/40 border border-violet-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md overflow-hidden">
        {/* Franja superior dorada/violeta, propia de esta identidad */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 print:hidden"></div>

        <div className="no-print mb-6">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <BadgeCheck className="h-3 w-3 mr-1.5" /> FICHA TÉCNICA CERTIFICADA
          </span>
        </div>

        {/* Cabecera de la Ficha Técnica */}
        <div className="print-header flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6 mb-8 gap-6">
          <div className="flex items-center space-x-4">
            {equipo.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={equipo.foto_url}
                alt={equipo.nombre}
                className="w-14 h-14 rounded-2xl object-cover border border-violet-500/20 flex-shrink-0"
              />
            ) : (
              <div className="p-3 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex-shrink-0">
                <Laptop className="h-8 w-8" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-ink leading-none">{equipo.nombre}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border print-badge ${
                    equipo.estado === "Excelente"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : equipo.estado === "Bueno"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : equipo.estado === "Falla"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {equipo.estado}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-none">
                Ubicación: <strong className="text-slate-200">{equipo.ubicacion}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Código Inventario</span>
              <span className="text-lg font-mono font-bold text-violet-400">{equipo.codigo_inventario}</span>
            </div>
            {/* Código QR — acceso directo a esta ficha desde un dispositivo móvil */}
            {pageUrl && (
              <div className="p-2 bg-white rounded-xl border border-slate-200 flex-shrink-0" title="Escanea para abrir esta hoja de vida">
                <QRCodeSVG value={pageUrl} size={64} bgColor="#ffffff" fgColor="#1e1b4b" level="M" />
              </div>
            )}
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="print-section mb-8">
          <h3 className="print-title text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4 flex items-center">
            <FileText className="h-4 w-4 text-violet-400 mr-2" />
            Especificaciones del Computador
          </h3>
          <div className="print-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="print-label text-slate-500 font-semibold block">Marca</span>
              <span className="print-value text-ink font-medium">{equipo.marca}</span>
            </div>
            <div>
              <span className="print-label text-slate-500 font-semibold block">Modelo</span>
              <span className="print-value text-ink font-medium">{equipo.modelo}</span>
            </div>
            <div>
              <span className="print-label text-slate-500 font-semibold block">Número de Serial</span>
              <span className="print-value text-ink font-mono font-medium">{equipo.serial}</span>
            </div>
            <div>
              <span className="print-label text-slate-500 font-semibold block">Procesador</span>
              <span className="print-value text-ink font-medium">{equipo.procesador}</span>
            </div>
            <div>
              <span className="print-label text-slate-500 font-semibold block">Memoria RAM</span>
              <span className="print-value text-ink font-medium">{equipo.ram}</span>
            </div>
            <div>
              <span className="print-label text-slate-500 font-semibold block">Disco Duro</span>
              <span className="print-value text-ink font-medium">{equipo.disco_duro}</span>
            </div>
            <div>
              <span className="print-label text-slate-500 font-semibold block">Sistema Operativo</span>
              <span className="print-value text-ink font-medium">{equipo.sistema_operativo}</span>
            </div>
            <div>
              <span className="print-label text-slate-500 font-semibold block">Fecha de Registro</span>
              <span className="print-value text-ink font-medium">
                {equipo.fecha_registro ? new Date(equipo.fecha_registro).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>

          {equipo.observaciones && (
            <div className="mt-5 pt-4 border-t border-slate-800/50 text-xs">
              <span className="print-label text-slate-500 font-semibold block mb-1">Observaciones Iniciales</span>
              <p className="print-value text-slate-300 leading-relaxed bg-slate-900/30 p-3.5 rounded-xl border border-slate-800">
                {equipo.observaciones}
              </p>
            </div>
          )}
        </div>

        {/* Historial de Mantenimientos */}
        <div className="print-section">
          <h3 className="print-title text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4 flex items-center">
            <Wrench className="h-4 w-4 text-fuchsia-400 mr-2" />
            Historial de Mantenimientos Realizados
          </h3>

          {mantenimientos.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No se han registrado mantenimientos técnicos para este computador.
            </div>
          ) : (
            <div className="space-y-4">
              {mantenimientos.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-800/10 border border-slate-800 text-xs flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${
                          m.tipo === "Preventivo"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20"
                        }`}
                      >
                        {m.tipo}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(m.fecha_mantenimiento).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-medium">{m.descripcion}</p>
                    {m.documento_url && (
                      <a
                        href={m.documento_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 underline decoration-dotted no-print"
                      >
                        <FileText className="h-3 w-3" /> Ver documento adjunto
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                    <div className="flex items-center text-[10px] text-slate-400">
                      <User className="h-3 w-3 mr-1" />
                      <span>{m.responsable}</span>
                    </div>
                    {canSeeCostos ? (
                      <div className="text-right text-xs font-semibold text-violet-400 mt-1">Costo: ${m.costo.toFixed(2)}</div>
                    ) : (
                      <div className="text-right text-[10px] text-slate-600 mt-1 flex items-center gap-1 print:hidden">
                        <Lock className="h-2.5 w-2.5" /> Solo administrador
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL REGISTRAR MANTENIMIENTO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl z-10"
            >
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-850/50">
                <h3 className="text-base font-bold text-ink">Registrar Ficha de Mantenimiento</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddMantenimiento} className="p-6 space-y-4">
                {maintError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{maintError}</span>
                  </div>
                )}

                <div className={`grid gap-4 ${canSeeCostos ? "grid-cols-2" : "grid-cols-1"}`}>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tipo de Mantenimiento</label>
                    <select
                      value={maintData.tipo}
                      onChange={(e) => setMaintData({ ...maintData, tipo: e.target.value as TipoMantenimiento })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-300 text-xs outline-none"
                    >
                      <option value="Preventivo">Preventivo</option>
                      <option value="Correctivo">Correctivo</option>
                    </select>
                  </div>
                  {canSeeCostos && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Costo ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={maintData.costo}
                        onChange={(e) => setMaintData({ ...maintData, costo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-100 text-xs outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Responsable técnico *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Laura Gómez"
                    value={maintData.responsable}
                    onChange={(e) => setMaintData({ ...maintData, responsable: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Actualizar Estado del Computador</label>
                  <select
                    value={maintData.actualizar_estado_equipo}
                    onChange={(e) => setMaintData({ ...maintData, actualizar_estado_equipo: e.target.value as EstadoEquipo })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-300 text-xs outline-none"
                  >
                    <option value="">No cambiar estado actual</option>
                    <option value="Excelente">Excelente</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Falla">Falla Técnica</option>
                    <option value="De Baja">De Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Descripción del Trabajo Realizado *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ej. Se realizó limpieza de componentes, cambio de pasta térmica e instalación de sistema operativo..."
                    value={maintData.descripcion}
                    onChange={(e) => setMaintData({ ...maintData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-violet-500 text-slate-100 text-xs outline-none resize-none"
                  ></textarea>
                </div>

                <FileUploadField
                  category="mantenimientos"
                  accent="violet"
                  label="Documento / Factura (opcional)"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  value={maintData.documento_url}
                  onChange={(url) => setMaintData({ ...maintData, documento_url: url })}
                />

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-md shadow-violet-600/10"
                  >
                    {submitting ? "Registrando..." : "Registrar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
