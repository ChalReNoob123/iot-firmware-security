/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sentinelforge/shared-types", "@sentinelforge/ui", "@sentinelforge/mcp-servers"]
};

export default nextConfig;
