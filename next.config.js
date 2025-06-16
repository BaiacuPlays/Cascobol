/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração para build estático (se necessário)
  ...(process.env.BUILD_STATIC === 'true' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),

  // Configurações de imagem
  images: {
    domains: ['localhost'],
    unoptimized: process.env.BUILD_STATIC === 'true'
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
