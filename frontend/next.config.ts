import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 静的エクスポートを有効化
  images: {
    unoptimized: true, // 静的エクスポート時は画像最適化を無効化
  },
};

export default nextConfig;
