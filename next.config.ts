import type { NextConfig } from "next";

// Allow next/image to load (and resize) images from our Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The dev server logs every Server Action call with its arguments, which
  // would print passwords from the signup/login actions to the terminal.
  logging: { serverFunctions: false },
  images: {
    qualities: [75],
    remotePatterns: supabaseUrl
      ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)]
      : [],
  },
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
