import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["app.tomstacey.co.uk"],
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
