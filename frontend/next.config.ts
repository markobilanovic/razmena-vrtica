import type { NextConfig } from "next"

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL environment variable is required. Please configure it in your .env file."
  )
}

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
}

export default nextConfig
