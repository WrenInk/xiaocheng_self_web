/** @type {import('next').NextConfig} */

// GitHub Pages serves the site under `username.github.io/<repo>/`, so every
// asset URL needs a `basePath` prefix at build time. The CI workflow sets
// BASE_PATH = "/<repo>" automatically (or "" for username.github.io repos).
// Locally it's unset, so basePath is "" and the dev server works as usual.
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // Static export — no Node server at runtime, just files. Required for GH Pages.
  output: "export",
  basePath,
  // GH Pages serves `foo/` as `foo/index.html`. Trailing slashes keep links sane.
  trailingSlash: true,
  // No image optimization server on GH Pages.
  images: { unoptimized: true },
  // Surface basePath to client code (history.pushState et al.).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
