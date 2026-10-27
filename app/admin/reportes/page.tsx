"use client";

import React, { useEffect, useState } from "react";
import { Printer, Search, Filter, FileSpreadsheet, FileBarChart2, Stamp } from "lucide-react";
import { Equipo } from "@/lib/db/types";

export default function ReportesPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  // Se calcula solo en cliente para evitar un mismatch de hidratación
  // (la hora exacta de render en servidor y cliente nunca coincide).
  const [generatedAt, setGeneratedAt] = useState("");

  useEffect(() => {
    const now = new Date();
    setGeneratedAt(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
  }, []);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [brandFilter, setBrandFilter] = useState("todos");

  // Opciones únicas de filtros extraídos de los datos
  const [ubicacionesUnicas, setUbicacionesUnicas] = useState<string[]>([]);
  const [marcasUnicas, setMarcasUnicas] = useState<string[]>([]);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await fetch("/api/equipos");
        const data = await res.json();
        setEquipos(data);

        const locations = Array.from(new Set(data.map((eq: Equipo) => eq.ubicacion))) as string[];
        const brands = Array.from(new Set(data.map((eq: Equipo) => eq.marca))) as string[];

        setUbicacionesUnicas(locations);
        setMarcasUnicas(brands);
      } catch (e) {
        console.error("Error fetching equipos for reports", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipos();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Filtrado de equipos
  const filteredEquipos = equipos.filter((eq) => {
    const matchesSearch =
      eq.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.codigo_inventario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.serial.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "todos" || eq.estado === statusFilter;
    const matchesLocation = locationFilter === "todos" || eq.ubicacion === locationFilter;
    const matchesBrand = brandFilter === "todos" || eq.marca === brandFilter;

    return matchesSearch && matchesStatus && matchesLocation && matchesBrand;
  });

  // Exportación a CSV (compatible con Excel) del subconjunto filtrado
  const escapeCsv = (value: string) => {
    if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  };

  const handleExportCsv = () => {
    const headers = ["Código", "Equipo", "Marca", "Modelo", "Serial", "Procesador", "RAM", "Disco", "S.O.", "Ubicación", "Estado"];
    const rows = filteredEquipos.map((eq) => [
      eq.codigo_inventario,
      eq.nombre,
      eq.marca,
      eq.modelo,
      eq.serial,
      eq.procesador,
      eq.ram,
      eq.disco_duro,
      eq.sistema_operativo,
      eq.ubicacion,
      eq.estado,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.map((v) => escapeCsv(String(v))).join(",")).join("\r\n");
    // BOM UTF-8 para que Excel respete tildes y ñ correctamente
    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_inventario_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Estadísticas del subconjunto filtrado
  const countTotal = filteredEquipos.length;
  const countExcelente = filteredEquipos.filter((e) => e.estado === "Excelente").length;
  const countBueno = filteredEquipos.filter((e) => e.estado === "Bueno").length;
  const countFalla = filteredEquipos.filter((e) => e.estado === "Falla").length;
  const countDeBaja = filteredEquipos.filter((e) => e.estado === "De Baja").length;

  return (
    <div className="space-y-6">
      {/* Cabecera de identidad — Documentación oficial (esmeralda) */}
      <div className="no-print flex items-center justify-between">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-2">
            <Stamp className="h-3 w-3 mr-1.5" /> DOCUMENTACIÓN OFICIAL
          </span>
          <h2 className="text-xl font-bold text-ink">Reportes de Inventario</h2>
        </div>
      </div>

      {/* Panel de Filtros Interactivos (Ocultar al imprimir) */}
      <div className="no-print bg-slate-900/40 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-ink flex items-center">
            <Filter className="h-4 w-4 text-emerald-400 mr-2" />
            Filtros del Reporte
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={filteredEquipos.length === 0}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-bold text-xs transition-colors"
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-400" />
              Exportar CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={filteredEquipos.length === 0}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/10"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              Imprimir Reporte
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Buscar por Nombre/Serial</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre, serial, código..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Filtrar por Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Falla">Con Falla</option>
              <option value="De Baja">De Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Filtrar por Ubicación</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todas las Ubicaciones</option>
              {ubicacionesUnicas.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Filtrar por Marca</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todas las Marcas</option>
              {marcasUnicas.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen numérico del reporte */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 bg-slate-900/20 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
        <div className="p-3 text-center rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Filtrados</span>
          <span className="text-xl font-bold text-ink">{countTotal}</span>
        </div>
        <div className="p-3 text-center rounded-xl bg-emerald-950/15 border border-emerald-500/20">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Excelente</span>
          <span className="text-xl font-bold text-emerald-400">{countExcelente}</span>
        </div>
        <div className="p-3 text-center rounded-xl bg-blue-950/15 border border-blue-500/20">
          <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Bueno</span>
          <span className="text-xl font-bold text-blue-400">{countBueno}</span>
        </div>
        <div className="p-3 text-center rounded-xl bg-rose-950/15 border border-rose-500/20">
          <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">Con Falla</span>
          <span className="text-xl font-bold text-rose-400">{countFalla}</span>
        </div>
        <div className="p-3 text-center rounded-xl bg-amber-950/15 border border-amber-500/20">
          <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">De Baja</span>
          <span className="text-xl font-bold text-amber-400">{countDeBaja}</span>
        </div>
      </div>

      {/* VISTA DE REPORTE — estética de documento oficial */}
      <div className="print-page bg-slate-900/40 border border-emerald-900/30 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        {/* Cabecera de documento (visible en pantalla e impresión) */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-emerald-600/40 pb-4 mb-6 gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 print:hidden">
              <FileBarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink print:text-black">SIGEM · Reporte de Inventario de Cómputo</h2>
              <p className="text-[10px] text-slate-500 print:text-gray-500 mt-0.5">Institución Educativa — Oficina de Infraestructura Tecnológica</p>
            </div>
          </div>
          <div className="text-left sm:text-right text-[10px] text-slate-500 print:text-gray-500 font-mono">
            Generado: {generatedAt || "—"}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredEquipos.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            No se encontraron equipos bajo los filtros seleccionados para generar el reporte.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-850/50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Equipo</th>
                  <th className="px-4 py-3">Marca / Modelo</th>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEquipos.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400 print:text-black">{eq.codigo_inventario}</td>
                    <td className="px-4 py-3 text-ink font-medium print:text-black">{eq.nombre}</td>
                    <td className="px-4 py-3 text-slate-300 print:text-black">
                      {eq.marca} - {eq.modelo}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 print:text-black">{eq.serial}</td>
                    <td className="px-4 py-3 text-slate-300 print:text-black">{eq.ubicacion}</td>
                    <td className="px-4 py-3">
                      <span className="print:text-black px-2 py-0.5 rounded text-[9px] font-bold border border-slate-800/10 bg-slate-800/20 text-slate-300">
                        {eq.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pie de documento — solo impresión */}
            <div className="hidden print:flex justify-between mt-8 pt-4 border-t border-gray-300 text-[9px] text-gray-500">
              <span>SIGEM — Sistema de Gestión de Equipos de Cómputo</span>
              <span>Total de registros: {filteredEquipos.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
