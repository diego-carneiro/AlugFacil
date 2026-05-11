import { client, hasAmplifyBackend } from "./client";
import type { Consultory } from "../../types/consultory";
import { deleteStorageFile, resolveStorageUrl, resolveStorageUrls, uploadConsultoryLogo } from "../storage/media";
import {
  createPublicSlug,
  matchesNameSlug,
  normalizeRouteSlug,
} from "../slug";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800";

export interface SearchConsultoriesInput {
  neighborhood?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  equipment?: string[];
  periods?: Array<"morning" | "afternoon" | "evening">;
  featured?: boolean;
  isPremium?: boolean;
  query?: string;
}

function getClient() {
  if (!hasAmplifyBackend || !client) {
    throw new Error("Backend AWS não configurado para consulta de consultórios.");
  }
  return client;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanFilterText(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length > 0 && normalized !== "Todos" ? normalized : undefined;
}

function mapToPeriodField(period: "morning" | "afternoon" | "evening") {
  if (period === "morning") {
    return "periodMorning";
  }
  if (period === "afternoon") {
    return "periodAfternoon";
  }
  return "periodEvening";
}

function buildConsultoriesFilter(input: SearchConsultoriesInput) {
  const filters: Array<Record<string, unknown>> = [];

  const neighborhood = cleanFilterText(input.neighborhood);
  const city = cleanFilterText(input.city);
  const state = cleanFilterText(input.state);
  const minPrice = typeof input.minPrice === "number" ? input.minPrice : undefined;
  const maxPrice = typeof input.maxPrice === "number" ? input.maxPrice : undefined;
  const equipment = Array.isArray(input.equipment)
    ? input.equipment.filter((item) => item.trim().length > 0)
    : [];
  const periods = Array.isArray(input.periods) ? input.periods : [];

  if (neighborhood) {
    filters.push({ neighborhood: { eq: neighborhood } });
  }
  if (city) {
    filters.push({ city: { eq: city } });
  }
  if (state) {
    filters.push({ state: { eq: state } });
  }
  if (minPrice !== undefined) {
    filters.push({ pricePerPeriod: { ge: minPrice } });
  }
  if (maxPrice !== undefined) {
    filters.push({ pricePerPeriod: { le: maxPrice } });
  }
  if (typeof input.featured === "boolean") {
    filters.push({ featured: { eq: input.featured } });
  }
  if (typeof input.isPremium === "boolean") {
    filters.push({ isPremium: { eq: input.isPremium } });
  }

  for (const eq of equipment) {
    filters.push({ equipment: { contains: eq } });
  }

  if (periods.length > 0) {
    filters.push({
      or: periods.map((period) => ({
        [mapToPeriodField(period)]: { eq: true },
      })),
    });
  }

  if (filters.length === 0) {
    return undefined;
  }

  return { and: filters };
}

function applyClientSideConsultoryFilters(
  items: Consultory[],
  input: SearchConsultoriesInput
): Consultory[] {
  const neighborhood = cleanFilterText(input.neighborhood);
  const city = cleanFilterText(input.city);
  const state = cleanFilterText(input.state);
  const minPrice = typeof input.minPrice === "number" ? input.minPrice : undefined;
  const maxPrice = typeof input.maxPrice === "number" ? input.maxPrice : undefined;
  const equipment = Array.isArray(input.equipment)
    ? input.equipment.filter((item) => item.trim().length > 0)
    : [];
  const query = cleanFilterText(input.query);
  const periods = Array.isArray(input.periods) ? input.periods : [];

  return items.filter((item) => {
    if (neighborhood && item.neighborhood !== neighborhood) {
      return false;
    }
    if (city && item.city !== city) {
      return false;
    }
    if (state && item.state !== state) {
      return false;
    }
    if (minPrice !== undefined && item.pricePerPeriod < minPrice) {
      return false;
    }
    if (maxPrice !== undefined && item.pricePerPeriod > maxPrice) {
      return false;
    }
    if (typeof input.featured === "boolean" && item.featured !== input.featured) {
      return false;
    }
    if (typeof input.isPremium === "boolean" && Boolean(item.isPremium) !== input.isPremium) {
      return false;
    }
    if (equipment.length > 0 && !equipment.every((eq) => item.equipment.includes(eq))) {
      return false;
    }
    if (
      periods.length > 0 &&
      !periods.some((period) => {
        if (period === "morning") {
          return item.periods.morning;
        }
        if (period === "afternoon") {
          return item.periods.afternoon;
        }
        return item.periods.evening;
      })
    ) {
      return false;
    }
    if (query) {
      const queryValue = normalizeText(query);
      const searchableFields = [
        item.name,
        item.neighborhood,
        item.city,
        item.state,
        item.description,
      ];
      const matchesQuery = searchableFields.some((value) =>
        normalizeText(String(value)).includes(queryValue)
      );
      if (!matchesQuery) {
        return false;
      }
    }

    return true;
  });
}

function extractImageKeys(item: Record<string, unknown>): string[] {
  if (!Array.isArray(item.imageKeys)) {
    return [];
  }

  return item.imageKeys.filter((value): value is string => typeof value === "string");
}

function withFallbackConsultorySlug(consultory: Consultory): Consultory {
  return {
    ...consultory,
    publicSlug: consultory.publicSlug ?? createPublicSlug(consultory.name, "consultorio"),
  };
}

async function mapBackendConsultory(item: Record<string, unknown>): Promise<Consultory> {
  const id = String(item.id ?? "");
  const imageKeys = extractImageKeys(item);
  let images = [DEFAULT_IMAGE];

  if (imageKeys.length > 0 && hasAmplifyBackend) {
    const resolvedUrls = await resolveStorageUrls(imageKeys);
    if (resolvedUrls.length > 0) {
      images = resolvedUrls;
    }
  }

  const logoKey = typeof item.logoKey === "string" && item.logoKey.length > 0 ? item.logoKey : undefined;
  let logoUrl: string | undefined;

  if (logoKey && hasAmplifyBackend) {
    try {
      logoUrl = await resolveStorageUrl(logoKey);
    } catch {
      // noop — logo URL resolution failures are non-blocking
    }
  }

  return {
    id,
    name: String(item.name ?? ""),
    publicSlug: typeof item.publicSlug === "string" ? item.publicSlug : undefined,
    neighborhood: String(item.neighborhood ?? ""),
    city: String(item.city ?? ""),
    state: String(item.state ?? ""),
    address: typeof item.address === "string" ? item.address : undefined,
    zipCode: typeof item.zipCode === "string" ? item.zipCode : undefined,
    pricePerPeriod: Number(item.pricePerPeriod ?? 0),
    description: String(item.description ?? ""),
    equipment: Array.isArray(item.equipment)
      ? item.equipment.filter((value): value is string => typeof value === "string")
      : [],
    imageKeys,
    images,
    logoKey,
    logoUrl,
    whatsappNumber: typeof item.whatsappNumber === "string" ? item.whatsappNumber : "",
    featured: Boolean(item.featured),
    ownerId: String(item.ownerId ?? ""),
    rating: Number(item.rating ?? 0),
    totalReviews: Number(item.totalReviews ?? 0),
    isPremium: Boolean(item.isPremium),
    periods: {
      morning: Boolean(item.periodMorning),
      afternoon: Boolean(item.periodAfternoon),
      evening: Boolean(item.periodEvening),
    },
  };
}

export async function listConsultories(): Promise<Consultory[]> {
  const api = getClient();

  const response = await api.models.Consultory.list({
    authMode: "apiKey",
    limit: 1000,
  });

  const mapped = await Promise.all(
    response.data.map((item) => mapBackendConsultory(item as unknown as Record<string, unknown>))
  );

  return mapped.map(withFallbackConsultorySlug);
}

export async function searchConsultories(input: SearchConsultoriesInput = {}): Promise<Consultory[]> {
  const api = getClient();
  const filter = buildConsultoriesFilter(input);

  try {
    const response = await api.models.Consultory.list({
      authMode: "apiKey",
      limit: 1000,
      ...(filter ? { filter } : {}),
    });

    const mapped = await Promise.all(
      response.data.map((item) => mapBackendConsultory(item as unknown as Record<string, unknown>))
    );

    return applyClientSideConsultoryFilters(mapped.map(withFallbackConsultorySlug), input);
  } catch (error) {
    if (!filter) {
      throw error;
    }

    const fallbackItems = await listConsultories();
    return applyClientSideConsultoryFilters(fallbackItems, input);
  }
}

export async function listFeaturedConsultories(): Promise<Consultory[]> {
  const items = await listConsultories();
  return items.filter((consultory) => consultory.featured).slice(0, 3);
}

export async function listConsultoriesByOwner(ownerId: string): Promise<Consultory[]> {
  const api = getClient();

  const response = await api.models.Consultory.list({
    authMode: "apiKey",
    filter: {
      ownerId: {
        eq: ownerId,
      },
    },
    limit: 1000,
  });

  const mapped = await Promise.all(
    response.data.map((item) => mapBackendConsultory(item as unknown as Record<string, unknown>))
  );

  return mapped.map(withFallbackConsultorySlug);
}

export async function getConsultoryById(id: string): Promise<Consultory | null> {
  const api = getClient();

  const response = await api.models.Consultory.list({
    filter: {
      id: {
        eq: id,
      },
    },
    authMode: "apiKey",
    limit: 1,
  });

  const item = response.data[0];
  if (!item) {
    return null;
  }

  const mapped = await mapBackendConsultory(item as unknown as Record<string, unknown>);
  return withFallbackConsultorySlug(mapped);
}

async function findUniqueConsultorySlug(baseSlug: string): Promise<string> {
  const api = getClient();
  let candidate = baseSlug;
  let suffix = 2;

  for (;;) {
    const response = await api.models.Consultory.list({
      authMode: "apiKey",
      filter: {
        publicSlug: {
          eq: candidate,
        },
      },
      limit: 1,
    });

    if (!response.data[0]) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function buildConsultoryPublicSlug(name: string): Promise<string> {
  const baseSlug = createPublicSlug(name, "consultorio");
  return findUniqueConsultorySlug(baseSlug);
}

export async function getConsultoryByPublicSlug(slug: string): Promise<Consultory | null> {
  const normalizedSlug = normalizeRouteSlug(slug);
  const api = getClient();

  const exact = await api.models.Consultory.list({
    authMode: "apiKey",
    filter: {
      publicSlug: {
        eq: normalizedSlug,
      },
    },
    limit: 1,
  });

  const exactItem = exact.data[0];
  if (exactItem) {
    const mapped = await mapBackendConsultory(exactItem as unknown as Record<string, unknown>);
    return withFallbackConsultorySlug(mapped);
  }

  const legacyCandidates = await api.models.Consultory.list({
    authMode: "apiKey",
    limit: 1000,
  });

  const legacyMatch = legacyCandidates.data.find((item) => {
    const payload = item as unknown as Record<string, unknown>;
    const name = String(payload.name ?? "");
    return matchesNameSlug(name, normalizedSlug, "consultorio");
  });

  if (!legacyMatch) {
    return null;
  }

  const payload = legacyMatch as unknown as Record<string, unknown>;
  let mapped = await mapBackendConsultory(payload);

  if (!mapped.publicSlug && mapped.id) {
    const generatedSlug = await buildConsultoryPublicSlug(mapped.name);
    const updated = await api.models.Consultory.update({
      id: mapped.id,
      publicSlug: generatedSlug,
    });

    if (!updated.errors?.length) {
      mapped = {
        ...mapped,
        publicSlug: generatedSlug,
      };
    }
  }

  return withFallbackConsultorySlug(mapped);
}

export async function listRelatedConsultories(
  consultoryId: string,
  limit = 3
): Promise<Consultory[]> {
  const items = await listConsultories();
  return items.filter((c) => c.id !== consultoryId).slice(0, limit);
}

export interface CreateConsultoryInput {
  name: string;
  publicSlug?: string;
  description?: string;
  neighborhood: string;
  city: string;
  state: string;
  address?: string;
  zipCode?: string;
  equipment: string[];
  pricePerPeriod: number;
  whatsappNumber: string;
  ownerId: string;
  periodMorning: boolean;
  periodAfternoon: boolean;
  periodEvening: boolean;
  imageKeys?: string[];
}

export async function createConsultory(input: CreateConsultoryInput): Promise<Consultory> {
  const api = getClient();
  const publicSlug = input.publicSlug ?? (await buildConsultoryPublicSlug(input.name));

  const created = await api.models.Consultory.create({
    name: input.name,
    publicSlug,
    description: input.description,
    neighborhood: input.neighborhood,
    city: input.city,
    state: input.state,
    address: input.address,
    zipCode: input.zipCode,
    equipment: input.equipment,
    pricePerPeriod: input.pricePerPeriod,
    whatsappNumber: input.whatsappNumber,
    ownerId: input.ownerId,
    periodMorning: input.periodMorning,
    periodAfternoon: input.periodAfternoon,
    periodEvening: input.periodEvening,
    imageKeys: input.imageKeys,
  });

  if (!created.data) {
    const message = created.errors?.[0]?.message ?? "Não foi possível criar o consultório.";
    throw new Error(message);
  }

  const mapped = await mapBackendConsultory(created.data as unknown as Record<string, unknown>);
  return withFallbackConsultorySlug(mapped);
}

export async function updateConsultoryLogoKey(consultoryId: string, logoKey: string | null): Promise<void> {
  const api = getClient();

  const updated = await api.models.Consultory.update({
    id: consultoryId,
    logoKey: logoKey ?? undefined,
  });

  if (updated.errors?.length) {
    throw new Error(updated.errors[0].message ?? "Não foi possível atualizar a logo do consultório.");
  }
}

export async function uploadAndSaveConsultoryLogo(input: {
  consultoryId: string;
  ownerId: string;
  file: File;
  previousLogoKey?: string;
}): Promise<string> {
  const key = await uploadConsultoryLogo(input.ownerId, input.file);
  await updateConsultoryLogoKey(input.consultoryId, key);

  if (input.previousLogoKey && input.previousLogoKey !== key) {
    try {
      await deleteStorageFile(input.previousLogoKey);
    } catch {
      // Keep operation non-blocking if old file cleanup fails.
    }
  }

  return key;
}
