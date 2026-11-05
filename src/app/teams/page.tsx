import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { TeamsPage } from "@/components/teams/TeamsPage";

export const metadata: Metadata = {
  title: "Teams | BuildLab by I2IT",
  description: "Meet the BuildLab team head and faculty mentors at I2IT.",
};

export const dynamic = "force-dynamic";

export default async function TeamsRoute() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <TeamsPage
      isAuthenticated={Boolean(session)}
      userEmail={session?.user?.email ?? undefined}
    />
  );
}
