import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuración para saltar errores y obtener la URL rápido */
  typescript: {
    // ESTO ignora los errores de tipos (letras rojas) al construir
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESTO ignora los avisos de código al construir
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
