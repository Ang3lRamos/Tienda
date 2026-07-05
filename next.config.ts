import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto (hay otro package-lock.json en la carpeta de usuario).
  outputFileTracingRoot: import.meta.dirname,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    // Optimiza imports de librerías con muchos iconos/componentes.
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
