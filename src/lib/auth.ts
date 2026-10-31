import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const env = getServerEnv();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "student", input: false },
      bio: { type: "string", defaultValue: "" },
      branchYear: { type: "string", defaultValue: "" },
      skills: { type: "string", defaultValue: "[]" },
      interests: { type: "string", defaultValue: "[]" },
      availability: { type: "number", defaultValue: 0 },
      prnNumber: { type: "string", required: false },
      rollNumber: { type: "string", required: false },
      academicYear: { type: "string", required: false },
      department: { type: "string", required: false },
      verificationStatus: { type: "string", defaultValue: "UNVERIFIED" },
      rejectionReason: { type: "string", required: false },
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
        console.info(`Verification link for ${user.email}: ${url}`);
        return;
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.EMAIL_FROM, to: user.email, subject: "Verify your BuildLab by I2IT email", html: `<p>Verify your I2IT identity to use college-only features on BuildLab.</p><p><a href="${url}">Verify email</a></p>` }),
      });
      if (!response.ok) throw new Error("Unable to send verification email.");
    },
  },
  socialProviders: env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } } : {},
});
