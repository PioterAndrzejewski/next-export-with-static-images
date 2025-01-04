import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default process.env.NODE_ENV === "production"
  ? {
      ...nextConfig,
      output: "export",
      images: {
        ...nextConfig["images"],
        loader: "custom",
        loaderFile: "./src/imageLoader.ts",
      },
    }
  : nextConfig;
