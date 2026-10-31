import { Project, User } from "@prisma/client";
import { canManagePlatform } from "@/lib/permissions";

export const canManageProject = (user: Pick<User, "id" | "role">, project: Pick<Project, "ownerId">) =>
  user.id === project.ownerId || canManagePlatform(user.role);

export const parseList = (value: string) => {
  try { const result = JSON.parse(value); return Array.isArray(result) ? result : []; } catch { return []; }
};
