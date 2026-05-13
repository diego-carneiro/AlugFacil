const RESERVED_ROOT_SLUGS = new Set([
  "",
  "about",
  "admin",
  "clinics",
  "confirm-registration",
  "contact",
  "dashboard",
  "login",
  "profile",
  "register",
]);

function normalizeBaseSlug(value: string, fallback: string): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return cleaned.length > 0 ? cleaned : fallback;
}

export function normalizeRouteSlug(value: string): string {
  return value.trim().toLowerCase();
}

export function createPublicSlug(value: string, fallbackPrefix: string): string {
  const base = normalizeBaseSlug(value, fallbackPrefix);

  if (!RESERVED_ROOT_SLUGS.has(base)) {
    return base;
  }

  return normalizeBaseSlug(`${fallbackPrefix}-${base}`, fallbackPrefix);
}

export function isReservedRootSlug(slug: string): boolean {
  return RESERVED_ROOT_SLUGS.has(normalizeRouteSlug(slug));
}

export function matchesNameSlug(name: string, slug: string, fallbackPrefix: string): boolean {
  return createPublicSlug(name, fallbackPrefix) === normalizeRouteSlug(slug);
}
