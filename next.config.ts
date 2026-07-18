import type { NextConfig } from "next";

function parseSupabaseHostname(): string | undefined {
  try {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    return raw ? new URL(raw).hostname : undefined;
  } catch {
    // A malformed URL shouldn't break the whole build — it only disables
    // next/image loading of Supabase Storage photos.
    return undefined;
  }
}

const supabaseHostname = parseSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/sign/**",
          },
        ]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
