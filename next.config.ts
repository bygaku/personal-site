import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev が CLAUDE.md へ独自ブロックを追記するのを止める。
  // CLAUDE.md は手書きで管理しているため、自動生成を混ぜない。
  agentRules: false,
};

export default nextConfig;
