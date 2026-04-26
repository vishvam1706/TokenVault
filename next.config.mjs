import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Turbopack alias — resolves @root/* to the project root
  turbopack: {
    resolveAlias: {
      "@root": __dirname,
    },
  },

  // Images — allow Google profile pictures
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
