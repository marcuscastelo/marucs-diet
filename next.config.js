/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sbhhxgeaflzmzpmatnir.supabase.co',
        port: '',
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig
