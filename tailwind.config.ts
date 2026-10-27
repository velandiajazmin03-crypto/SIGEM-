import type { Config } from "tailwindcss";

// Helper: define a color step backed by a CSS variable so light/dark/colorblind
// modes can repaint it globally without touching every component file.
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // Texto de máximo contraste (reemplaza el antiguo "text-white" fijo)
        ink: v("--ink"),
        // Escala neutra usada como fondo/borde/texto en toda la app.
        // Se sobreescribe la escala "slate" para que responda al tema.
        slate: {
          50: v("--slate-50"),
          100: v("--slate-100"),
          200: v("--slate-200"),
          300: v("--slate-300"),
          400: v("--slate-400"),
          500: v("--slate-500"),
          600: v("--slate-600"),
          700: v("--slate-700"),
          800: v("--slate-800"),
          850: v("--slate-850"),
          900: v("--slate-900"),
          950: v("--slate-950"),
        },
        // Paso "400" de cada acento: es el que se usa como texto/ícono sobre
        // el fondo de página, así que es el que necesita más contraste en
        // modo claro. El resto de la escala (500/600 sólidos, /10 /20 washes)
        // funciona razonablemente igual en ambos temas y no se sobreescribe.
        indigo: { 400: v("--indigo-400") },
        cyan: { 400: v("--cyan-400") },
        rose: { 400: v("--rose-400") },
        emerald: { 400: v("--emerald-400") },
        amber: { 400: v("--amber-400") },
        violet: { 400: v("--violet-400") },
        blue: { 400: v("--blue-400") },
        purple: { 400: v("--purple-400") },
        pink: { 400: v("--pink-400") },
        fuchsia: { 400: v("--fuchsia-400") },
      },
    },
  },
  plugins: [],
};
export default config;
