import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | SIGEM",
  description: "Portal de acceso al Sistema de Gestión de Equipos de Cómputo",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
