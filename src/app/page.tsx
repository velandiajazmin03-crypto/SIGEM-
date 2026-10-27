"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Laptop,
  Wrench,
  FileText,
  BarChart3,
  ShieldAlert,
  LogIn,
  Mail,
  Phone,
  MapPin,
  School,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", correo: "", mensaje: "" });
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormData({ nombre: "", correo: "", mensaje: "" });
      setFormSent(false);
    }, 3000);
  };

  const menuItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Características", href: "#caracteristicas" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Contacto", href: "#contacto" },
    { label: "Alerta", href: "#alerta" },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh text-slate-100 flex flex-col font-sans">
      {/* Header / Navegación */}
      <header className="fixed top-0 left-0 w-full z-50 glassmorphism border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <School className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-ink block leading-none">SIGEM</span>
              <span className="text-xs text-indigo-400 font-medium">Control & Mantenimiento</span>
            </div>
          </div>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-slate-300 hover:text-indigo-400 text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02]"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Inicio de Sesión
            </Link>
          </div>

          {/* Botón Mobile Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menú Mobile Desplegable */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glassmorphism border-b border-slate-800 absolute top-20 left-0 w-full px-4 py-6 space-y-4"
          >
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-indigo-400 text-base font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Inicio de Sesión
            </Link>
          </motion.div>
        )}
      </header>

      <main className="flex-grow pt-20">
        {/* Sección Inicio (Hero) */}
        <section id="inicio" className="relative py-24 sm:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                    <Laptop className="h-3.5 w-3.5 mr-1.5" /> Gestión Tecnológica Educativa
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-tight">
                    Control absoluto de tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">equipos de cómputo</span>
                  </h1>
                  <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                    SIGEM es la solución inteligente e integrada para instituciones educativas que permite gestionar el inventario, registrar fallas técnicas, y llevar la hoja de vida digital de cada computador en tiempo real.
                  </p>
                  <div className="mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] w-full sm:w-auto"
                    >
                      Comenzar Ahora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <a
                      href="#nosotros"
                      className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-base transition-all w-full sm:w-auto mt-4 sm:mt-0"
                    >
                      Saber Más
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Grid visual del sistema */}
              <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative mx-auto w-full max-w-md lg:max-w-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative glassmorphism rounded-3xl p-6 border border-slate-700 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                      <div className="flex space-x-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/80"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-green-500/80"></div>
                      </div>
                      <span className="text-xs font-semibold text-indigo-400">SIGEM_v1.0_Dashboard</span>
                    </div>
                    {/* Tarjeta de simulación */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                          <span className="text-xs text-slate-400 block mb-1">Registrados</span>
                          <span className="text-2xl font-bold text-ink">48</span>
                        </div>
                        <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/20">
                          <span className="text-xs text-emerald-400 block mb-1">Activos</span>
                          <span className="text-2xl font-bold text-emerald-400">45</span>
                        </div>
                        <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20">
                          <span className="text-xs text-rose-400 block mb-1">Con Fallas</span>
                          <span className="text-2xl font-bold text-rose-400">3</span>
                        </div>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-200">Estado Reciente de Fallas</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                            Monitoreo Activo
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/50">
                            <span className="text-slate-300">Portátil HP - Aula 3</span>
                            <span className="text-rose-400">Falla de Disco</span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/50">
                            <span className="text-slate-300">Torre Dell - Biblioteca</span>
                            <span className="text-amber-400 font-medium">En Reparación</span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1.5">
                            <span className="text-slate-300">Torre Lenovo - Sala 1</span>
                            <span className="text-emerald-400">Mantenido Ok</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Nosotros */}
        <section id="nosotros" className="py-20 bg-slate-900/60 border-t border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">Nuestra Institución</h2>
              <div className="h-1.5 w-20 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Comprometidos con el desarrollo tecnológico de nuestra comunidad académica. Garantizamos que docentes, alumnos y personal administrativo tengan acceso a recursos informáticos óptimos y siempre operativos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800/35 p-8 rounded-2xl border border-slate-800 text-center">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mx-auto mb-6">
                  <School className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">Infraestructura Escolar</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Llevamos el control ordenado de salas de informática, oficinas administrativas y bibliotecas, asegurando su correcto funcionamiento.
                </p>
              </div>

              <div className="bg-slate-800/35 p-8 rounded-2xl border border-slate-800 text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mx-auto mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">Mantenimiento Preventivo</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Planificación oportuna y registro de limpieza, actualizaciones y revisiones técnicas para alargar la vida útil de los computadores.
                </p>
              </div>

              <div className="bg-slate-800/35 p-8 rounded-2xl border border-slate-800 text-center">
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mx-auto mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">Respuesta Rápida</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Canal directo para reportar fallas de hardware y software, minimizando los tiempos de inactividad de las salas académicas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Características */}
        <section id="caracteristicas" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">Características del Sistema</h2>
              <div className="h-1.5 w-20 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Módulos diseñados para cubrir cada una de las necesidades del área de soporte técnico e inventario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Laptop className="h-6 w-6 text-indigo-400" />,
                  title: "Gestión de Inventario",
                  desc: "Control total de características de hardware, ubicación, modelo, serial e información operativa.",
                },
                {
                  icon: <Wrench className="h-6 w-6 text-purple-400" />,
                  title: "Control de Fallas",
                  desc: "Permite registrar incidencias técnicas, asignar responsables y dar seguimiento en tiempo real.",
                },
                {
                  icon: <FileText className="h-6 w-6 text-pink-400" />,
                  title: "Hoja de Vida de PC",
                  desc: "Generación de ficha técnica completa, detalles del hardware e historial de mantenimientos realizados.",
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-indigo-400" />,
                  title: "Reportes Detallados",
                  desc: "Filtros de búsqueda avanzada, listados en PDF de equipos con fallas o en excelente estado.",
                },
              ].map((feature, i) => (
                <div key={i} className="glassmorphism-card p-6 rounded-2xl border border-slate-800">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sección Beneficios */}
        <section id="beneficios" className="py-20 bg-slate-950/40 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              <div className="lg:col-span-5">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ink leading-tight">
                  ¿Por qué implementar SIGEM en nuestra institución?
                </h2>
                <div className="h-1.5 w-20 bg-indigo-600 mt-4 rounded-full mb-6"></div>
                <p className="text-base text-slate-300 leading-relaxed mb-6">
                  Nuestra plataforma automatiza el papeleo físico y centraliza toda la información técnica en un único panel de fácil acceso.
                </p>
                <div className="space-y-4">
                  {[
                    "Acceso rápido a la hoja de vida desde cualquier lugar.",
                    "Ahorro de costos al prevenir daños mayores de hardware.",
                    "Reportes transparentes de estado tecnológico listos para imprimir.",
                    "Planificación eficiente de adquisiciones de nuevos equipos.",
                  ].map((ben, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300 font-medium">{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elemento gráfico interactivo */}
              <div className="mt-12 lg:mt-0 lg:col-span-7 bg-slate-800/30 p-8 rounded-3xl border border-slate-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <span className="text-3xl font-extrabold text-indigo-400 block mb-2">100%</span>
                    <h4 className="text-base font-bold text-ink mb-2">Información Centralizada</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Se acabaron las hojas de cálculo confusas. Todo tu inventario en un único software web.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <span className="text-3xl font-extrabold text-purple-400 block mb-2">-80%</span>
                    <h4 className="text-base font-bold text-ink mb-2">Papeleo Físico</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Genera fichas y hojas de vida en PDF al instante, listo para compartir y archivar digitalmente.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <span className="text-3xl font-extrabold text-pink-400 block mb-2">0s</span>
                    <h4 className="text-base font-bold text-ink mb-2">Retrasos en Reportes</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Registra una falla y el equipo de TI la verá inmediatamente en el dashboard principal.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <span className="text-3xl font-extrabold text-emerald-400 block mb-2">24/7</span>
                    <h4 className="text-base font-bold text-ink mb-2">Acceso Seguro</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Roles diferenciados para administradores y técnicos de soporte institucional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Contacto */}
        <section id="contacto" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">Contacto y Soporte</h2>
              <div className="h-1.5 w-20 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                ¿Tienes dudas sobre la implementación del sistema o necesitas soporte técnico institucional? Escríbenos.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Info de contacto */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 mt-1 flex-shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">Correo Electrónico</h4>
                      <p className="text-xs text-slate-400 mt-1">soporte.ti@institucion.edu.co</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 mt-1 flex-shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">Teléfono de Oficina</h4>
                      <p className="text-xs text-slate-400 mt-1">+57 (601) 321-4567 Ext. 440</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-400 mt-1 flex-shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">Ubicación Física</h4>
                      <p className="text-xs text-slate-400 mt-1">Bloque C, Segundo Piso - Oficina de Infraestructura Tecnológica</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed mt-6 lg:mt-0">
                  <strong>Horario de Atención:</strong> Lunes a Viernes de 7:00 AM a 5:00 PM y Sábados de 8:00 AM a 12:00 PM.
                </div>
              </div>

              {/* Formulario */}
              <div className="lg:col-span-7 bg-slate-850 p-8 rounded-2xl border border-slate-800 glassmorphism">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej. Ing. Carlos Mendoza"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Correo Institucional</label>
                    <input
                      type="email"
                      required
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      placeholder="carlos.mendoza@institucion.edu.co"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Mensaje / Requerimiento</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.mensaje}
                      onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                      placeholder="Describa brevemente su requerimiento técnico o consulta..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm outline-none transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/10 active:scale-[0.99]"
                  >
                    Enviar Mensaje
                  </button>

                  {formSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold text-center"
                    >
                      ¡Mensaje enviado con éxito! Nos contactaremos a la brevedad.
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Alerta */}
        <section id="alerta" className="py-16 bg-gradient-to-b from-transparent to-red-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-red-950/25 border border-red-500/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-red-500/5 select-none pointer-events-none">
                <ShieldAlert className="h-64 w-64" />
              </div>
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" /> ALERTA DE SISTEMA
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-ink">
                    ¿Detectaste una falla crítica en algún equipo?
                  </h3>
                  <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                    Si eres docente o encargado de aula y encuentras un desperfecto en un equipo de cómputo, no esperes más. El personal técnico está listo para intervenir. Inicia sesión para registrar el reporte de falla técnica de forma inmediata.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02]"
                  >
                    Reportar Incidente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-500/20">
              <School className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-base font-bold text-ink">SIGEM</span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} SIGEM - Sistema de Gestión de Equipos de Cómputo. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 text-xs text-slate-400">
            <a href="#" className="hover:text-indigo-400 transition-colors">Términos de Uso</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
