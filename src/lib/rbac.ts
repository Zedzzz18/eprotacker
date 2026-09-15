import type { CurrentUser } from "@/lib/auth";

/** "ALL" means unrestricted access; otherwise an array of allowed IDs. */
export type ScopeFilter = "ALL" | string[];

export function isAdmin(user: CurrentUser) {
  return user.scopes.some((s) => s.role === "ADMIN");
}

export function isViewerOnly(user: CurrentUser) {
  return user.scopes.length > 0 && user.scopes.every((s) => s.role === "VIEWER");
}

export function accessibleCountryIds(user: CurrentUser): ScopeFilter {
  const hasGlobalAccess = user.scopes.some(
    (s) => (s.role === "ADMIN" || s.role === "HQ") && !s.countryId
  );
  if (hasGlobalAccess) return "ALL";

  const ids = [...new Set(user.scopes.filter((s) => s.countryId).map((s) => s.countryId as string))];
  return ids;
}

export function accessibleBrandIds(user: CurrentUser): ScopeFilter {
  const hasGlobalAccess = user.scopes.some(
    (s) => (s.role === "ADMIN" || s.role === "HQ") && !s.brandId
  );
  if (hasGlobalAccess) return "ALL";

  const ids = [...new Set(user.scopes.filter((s) => s.brandId).map((s) => s.brandId as string))];
  return ids;
}

export function canWrite(user: CurrentUser) {
  return !isViewerOnly(user);
}

export function roleLabels(user: CurrentUser) {
  return [...new Set(user.scopes.map((s) => s.role))];
}

/** Build a Prisma `where` fragment scoping by country/brand id fields. Pass "ALL" arrays as undefined. */
export function scopeWhere(
  countryField: string,
  brandField: string | null,
  user: CurrentUser
): Record<string, unknown> {
  const countries = accessibleCountryIds(user);
  const brands = brandField ? accessibleBrandIds(user) : "ALL";

  const where: Record<string, unknown> = {};
  if (countries !== "ALL") {
    where[countryField] = { in: countries };
  }
  if (brandField && brands !== "ALL") {
    where[brandField] = { in: brands };
  }
  return where;
}
