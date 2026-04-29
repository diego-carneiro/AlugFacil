import { client, hasAmplifyBackend } from "./client";
import {
  consultories as mockConsultories,
  type Consultory,
} from "../../data/consultories";

function getFallbackImages(consultoryId: string): string[] {
  return mockConsultories.find((item) => item.id === consultoryId)?.images ?? [];
}

function mapBackendConsultory(item: Record<string, unknown>): Consultory {
  const id = String(item.id ?? "");

  return {
    id,
    name: String(item.name ?? ""),
    neighborhood: String(item.neighborhood ?? ""),
    city: String(item.city ?? ""),
    pricePerPeriod: Number(item.pricePerPeriod ?? 0),
    description: String(item.description ?? ""),
    equipment: Array.isArray(item.equipment)
      ? item.equipment.filter((value): value is string => typeof value === "string")
      : [],
    images: getFallbackImages(id),
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
  if (!hasAmplifyBackend || !client) {
    return mockConsultories;
  }

  const response = await client.models.Consultory.list({
    authMode: "apiKey",
  });

  return response.data.map((item) =>
    mapBackendConsultory(item as unknown as Record<string, unknown>)
  );
}

export async function listFeaturedConsultories(): Promise<Consultory[]> {
  const items = await listConsultories();
  return items.filter((consultory) => consultory.featured).slice(0, 3);
}

export async function getConsultoryById(id: string): Promise<Consultory | null> {
  if (!hasAmplifyBackend || !client) {
    return mockConsultories.find((item) => item.id === id) ?? null;
  }

  const response = await client.models.Consultory.list({
    filter: {
      id: {
        eq: id,
      },
    },
    authMode: "apiKey",
  });

  const item = response.data[0];
  return item ? mapBackendConsultory(item as unknown as Record<string, unknown>) : null;
}
