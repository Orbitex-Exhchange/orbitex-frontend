import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_BASE_URL: z.string().url().default("http://localhost:3001"),
    WS_BASE_URL: z.string().url().default("ws://localhost:3001"),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3001"),
    NEXT_PUBLIC_WS_BASE_URL: z.string().url().default("ws://localhost:3001"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_BASE_URL: process.env.API_BASE_URL,
    WS_BASE_URL: process.env.WS_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL,
  },
});
