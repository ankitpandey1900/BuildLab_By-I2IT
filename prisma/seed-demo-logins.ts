import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { seedDemoLoginProfiles } from "./demo-login-seed";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

try {
  const count = await seedDemoLoginProfiles(prisma, {
    allowProduction: true,
    allowExistingProfiles: false,
  });
  console.info(`Created ${count} role-demo login profiles.`);
} catch (error) {
  console.error("Could not seed role-demo login profiles:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
