import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the on-screen Next.js route indicator (the floating badge in the
  // bottom-left corner during `next dev`) — still surfaces compile/runtime
  // errors, just no dev-tools branding overlay.
  devIndicators: false,
};

export default nextConfig;
