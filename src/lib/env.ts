import { z } from "zod";
const optionalEnv = z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().optional());
const schema = z.object({ BETTER_AUTH_SECRET: z.string().min(32), BETTER_AUTH_URL: z.string().url(), DATABASE_URL: z.string().url(), DIRECT_URL: z.string().url().optional(), COLLEGE_EMAIL_DOMAIN: z.string().min(3).default("isquareit.edu.in"), GITHUB_CLIENT_ID: optionalEnv, GITHUB_CLIENT_SECRET: optionalEnv, RESEND_API_KEY: optionalEnv, EMAIL_FROM: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().email().optional()) });
const buildFallback = { BETTER_AUTH_SECRET: "build-only-secret-that-is-never-used-123", BETTER_AUTH_URL: "http://localhost:3000", DATABASE_URL: "postgresql://build:build@localhost:5432/build", DIRECT_URL: "postgresql://build:build@localhost:5432/build", COLLEGE_EMAIL_DOMAIN: "i2it.ac.in" };
export const getServerEnv = () => schema.parse(process.env.NEXT_PHASE === "phase-production-build" ? { ...process.env, ...buildFallback } : process.env);
export const getReadiness = () => schema.safeParse(process.env);
