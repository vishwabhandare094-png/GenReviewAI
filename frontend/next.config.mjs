/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export' generates the static 'out/' directory for Render Static Site hosting

  trailingSlash: true,
  env: {
    // Baked-in fallback for production; override via NEXT_PUBLIC_API_BASE_URL env var on Render
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://genreviewai-backend.onrender.com",
  },
};

export default nextConfig;
