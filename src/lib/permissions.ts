export const platformRoles = ["student", "project_owner", "maintainer", "reviewer", "moderator", "admin"] as const;
export type PlatformRole = (typeof platformRoles)[number];

export const canManagePlatform = (role: string) => role === "moderator" || role === "admin";
export const canReviewSupport = (role: string) => role === "reviewer" || canManagePlatform(role);
