"use client";

import React, { useRef, useState } from "react";
import { Upload, X, FileText, AlertCircle, Loader2 } from "lucide-react";

type Accent = "indigo" | "cyan" | "rose" | "violet";

// Tailwind necesita ver las clases completas y literales en el código fuente
// para generarlas — por eso se mapean aquí en vez de interpolar el color.
const ACCENT_STYLES: Record<Accent, { chip: string; icon: string; dropzone: string }> = {
  indigo: {
    chip: "bg-indigo-500/10 border-indigo-500/20",
    icon: "text-indigo-400",
    dropzone: "hover:border-indigo-500 hover:text-indigo-400",
  },
  cyan: {
    chip: "bg-cyan-500/10 border-cyan-500/20",
    icon: "text-cyan-400",
    dropzone: "hover:border-cyan-500 hover:text-cyan-400",
  },
  rose: {
    chip: "bg-rose-500/10 border-rose-500/20",
    icon: "text-rose-400",
    dropzone: "hover:border-rose-500 hover:text-rose-400",
  },
  violet: {
    chip: "bg-violet-500/10 border-violet-500/20",
    icon: "text-violet-400",
    dropzone: "hover:border-violet-500 hover:text-violet-400",
  },
};

interface FileUploadFieldProps {
  category: "equipos" | "fallas" | "mantenimientos";
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  accept?: string;
  label: string;
  accent?: Accent;
}

const ACCEPT_DEFAULT = "image/png,image/jpeg,image/webp";

export default function FileUploadField({
  category,
  value,
  onChange,
  accept = ACCEPT_DEFAULT,
  label,
  accent = "indigo",
}: FileUploadFieldProps) {
  const styles = ACCENT_STYLES[accent];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir el archivo.");

      onChange(data.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          {isPdf ? (
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${styles.chip}`}>
              <FileText className={`h-5 w-5 ${styles.icon}`} />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-800 flex-shrink-0" />
          )}
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-white truncate flex-grow underline decoration-dotted"
          >
            Ver archivo adjunto
          </a>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Quitar archivo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 text-slate-400 text-xs font-semibold transition-colors disabled:opacity-60 ${styles.dropzone}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" /> Subir archivo
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-400">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
