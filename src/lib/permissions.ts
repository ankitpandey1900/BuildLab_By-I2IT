export const platformRoles = [
  "student",
  "project_owner",
  "maintainer",
  "reviewer",
  "moderator",
  "admin",
  "faculty",
  "lead",
] as const;

export type PlatformRole = (typeof platformRoles)[number];

export const ALLOWED_ADMIN_ROLES = ["admin", "lead", "faculty", "reviewer", "moderator"] as const;

export const canManagePlatform = (role: string) => role === "moderator" || role === "admin";
export const canReviewSupport = (role: string) => role === "reviewer" || canManagePlatform(role);
export const canVerifyStudents = (role: string) => 
  ALLOWED_ADMIN_ROLES.some((allowed) => allowed.toLowerCase() === (role || "").toLowerCase());

/**
 * Role-change authorization policy:
 * Only users with the "admin" role have permission to promote, demote, or change user roles.
 */
export const canChangeUserRole = (role: string) => (role || "").toLowerCase() === "admin";
export const canElevateRoles = (role: string) => canChangeUserRole(role);

