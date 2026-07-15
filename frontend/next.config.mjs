/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  env: {
    // Baked-in fallback for production; override via NEXT_PUBLIC_API_BASE_URL env var on Render
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://genreviewai.onrender.com",
  },
};

export default nextConfig;
