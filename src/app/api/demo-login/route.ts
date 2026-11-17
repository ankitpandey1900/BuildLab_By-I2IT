import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type DemoRole = "student" | "mentor" | "admin";

const demoAccountPrefixes: Record<DemoRole, string> = {
  student: "DEMO_STUDENT",
  mentor: "DEMO_MENTOR",
  admin: "DEMO_ADMIN",
};

function isDemoRole(value: unknown): value is DemoRole {
  return value === "student" || value === "mentor" || value === "admin";
}

export async function POST(request: Request) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.DEMO_LOGIN_ENABLED?.trim().toLowerCase() !== "true"
  ) {
    return NextResponse.json({ error: "Demo sign-in is unavailable." }, { status: 404 });
  }

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 403 });
  }

  let body: { role?: unknown };
  try {
    body = (await request.json()) as { role?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  if (!isDemoRole(body.role)) {
    return NextResponse.json({ error: "Choose a valid demo profile." }, { status: 400 });
  }

  const prefix = demoAccountPrefixes[body.role];
  const email = process.env[`${prefix}_EMAIL`]?.trim();
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) {
    return NextResponse.json({ error: "Demo sign-in is not configured." }, { status: 503 });
  }

  const signInRequest = new Request(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify({ email, password, callbackURL: "/dashboard" }),
  });
  const signInResponse = await auth.handler(signInRequest);

  if (!signInResponse.ok) {
    return NextResponse.json(
      { error: "Demo account is unavailable. Check that the configured profiles were seeded." },
      { status: signInResponse.status }
    );
  }

  return signInResponse;
}
