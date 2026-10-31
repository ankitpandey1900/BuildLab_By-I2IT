import { getReadiness } from "@/lib/env";
export function GET() { const env = getReadiness(); return Response.json({ status: env.success ? "ready" : "not_ready" }, { status: env.success ? 200 : 503 }); }
