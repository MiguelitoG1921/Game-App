import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor serves the app from local files inside the Android WebView.
  output: "export",
  trailingSlash: true,
  assetPrefix: "./",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
