import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { PrismaClient } from "@prisma/client";

type DemoLoginProfile = {
  role: "student" | "faculty" | "admin";
  name: string;
  email: string;
  password: string;
  verificationStatus: "UNVERIFIED" | "VERIFIED";
};

const demoLoginRoleDefinitions = [
  { prefix: "DEMO_STUDENT", role: "student", verificationStatus: "UNVERIFIED" },
  { prefix: "DEMO_MENTOR", role: "faculty", verificationStatus: "VERIFIED" },
  { prefix: "DEMO_ADMIN", role: "admin", verificationStatus: "VERIFIED" },
] as const;

function getDemoLoginProfiles(): DemoLoginProfile[] {
  const enabled = process.env.DEMO_LOGIN_ENABLED?.trim().toLowerCase() === "true";
  const configuredValues = demoLoginRoleDefinitions.flatMap(({ prefix }) => [
    process.env[`${prefix}_NAME`],
    process.env[`${prefix}_EMAIL`],
    process.env[`${prefix}_PASSWORD`],
  ]);
  const hasConfiguredValues = configuredValues.some((value) => Boolean(value?.trim()));

  if (!enabled) {
    if (hasConfiguredValues) {
      throw new Error("Set DEMO_LOGIN_ENABLED=true to seed the configured role-demo profiles.");
    }
    console.info("Role-demo profiles were not configured; no login accounts were created.");
    return [];
  }

  const missing = demoLoginRoleDefinitions.flatMap(({ prefix }) =>
    [`${prefix}_NAME`, `${prefix}_EMAIL`, `${prefix}_PASSWORD`].filter(
      (key) => !process.env[key]?.trim()
    )
  );
  if (missing.length > 0) {
    throw new Error(`Missing required role-demo environment variables: ${missing.join(", ")}.`);
  }

  return demoLoginRoleDefinitions.map(({ prefix, role, verificationStatus }) => {
    const name = process.env[`${prefix}_NAME`]!.trim();
    const email = process.env[`${prefix}_EMAIL`]!.trim().toLowerCase();
    const password = process.env[`${prefix}_PASSWORD`]!;

    if (name.length < 2 || name.length > 70) {
      throw new Error(`${prefix}_NAME must be between 2 and 70 characters.`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`${prefix}_EMAIL must be a valid email address.`);
    }
    if (password.length < 12 || password.length > 128) {
      throw new Error(`${prefix}_PASSWORD must be between 12 and 128 characters.`);
    }

    return { role, name, email, password, verificationStatus };
  });
}

export async function seedDemoLoginProfiles(
  prisma: PrismaClient,
  options: {
    allowProduction?: boolean;
    allowExistingProfiles?: boolean;
    reservedEmails?: string[];
  } = {}
): Promise<number> {
  if (process.env.NODE_ENV === "production") {
    if (!options.allowProduction) {
      throw new Error(
        "The full seed is disabled in production. Use the dedicated demo-login seed command."
      );
    }
    if (process.env.DEMO_LOGIN_SEED_ENABLED?.trim().toLowerCase() !== "true") {
      throw new Error("Set DEMO_LOGIN_SEED_ENABLED=true to seed demo logins in production.");
    }
  }

  const profiles = getDemoLoginProfiles();
  const reservedEmails = new Set(options.reservedEmails?.map((email) => email.toLowerCase()));

  for (const profile of profiles) {
    if (reservedEmails.has(profile.email)) {
      throw new Error(
        `A role-demo email matches a fixed fixture profile. Configure a separate email for the ${profile.role} demo account.`
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });
    const password = await hashPassword(profile.password);

    if (existingUser) {
      if (options.allowExistingProfiles === false) {
        throw new Error(
          `The configured ${profile.role} demo email already exists. The production demo seed only creates new accounts.`
        );
      }

      const credentialAccount = await prisma.account.findUnique({
        where: {
          providerId_accountId: {
            providerId: "credential",
            accountId: existingUser.id,
          },
        },
        select: { id: true },
      });

      if (!credentialAccount || existingUser.role !== profile.role) {
        throw new Error(
          `The configured ${profile.role} demo email is already used by a different account. Choose a dedicated demo email.`
        );
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: profile.name,
            emailVerified: true,
            verificationStatus: profile.verificationStatus,
          },
        }),
        prisma.account.update({
          where: { id: credentialAccount.id },
          data: { password },
        }),
        prisma.session.deleteMany({ where: { userId: existingUser.id } }),
      ]);
    } else {
      const userId = randomUUID();
      await prisma.$transaction(async (transaction) => {
        await transaction.user.create({
          data: {
            id: userId,
            name: profile.name,
            email: profile.email,
            emailVerified: true,
            role: profile.role,
            verificationStatus: profile.verificationStatus,
          },
        });
        await transaction.account.create({
          data: {
            id: randomUUID(),
            accountId: userId,
            providerId: "credential",
            userId,
            password,
          },
        });
      });
    }

    console.info(`Role-demo login profile ready (${profile.role}).`);
  }

  return profiles.length;
}
