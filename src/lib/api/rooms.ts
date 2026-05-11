import { client, hasAmplifyBackend } from "./client";
import type { Room, CreateRoomInput } from "../../types/room";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800";

function getClient() {
  if (!hasAmplifyBackend || !client) {
    throw new Error("Backend AWS não configurado.");
  }
  return client;
}

function mapBackendRoom(item: Record<string, unknown>): Room {
  return {
    id: String(item.id ?? ""),
    consultoryId: String(item.consultoryId ?? ""),
    ownerId: String(item.ownerId ?? ""),
    name: String(item.name ?? ""),
    description: typeof item.description === "string" ? item.description : undefined,
    pricePerPeriod: Number(item.pricePerPeriod ?? 0),
    equipment: Array.isArray(item.equipment)
      ? item.equipment.filter((v): v is string => typeof v === "string")
      : [],
    imageKeys: Array.isArray(item.imageKeys)
      ? item.imageKeys.filter((v): v is string => typeof v === "string")
      : [],
    images: [DEFAULT_IMAGE],
    periods: {
      morning: Boolean(item.periodMorning),
      afternoon: Boolean(item.periodAfternoon),
      evening: Boolean(item.periodEvening),
    },
    available: item.available !== false,
    rating: Number(item.rating ?? 0),
    totalReviews: Number(item.totalReviews ?? 0),
    createdAt: String(item.createdAt ?? ""),
  };
}

export async function listRoomsByConsultory(consultoryId: string): Promise<Room[]> {
  const api = getClient();

  const response = await api.models.Room.list({
    authMode: "apiKey",
    filter: { consultoryId: { eq: consultoryId } },
    limit: 500,
  });

  return response.data.map((item) => mapBackendRoom(item as unknown as Record<string, unknown>));
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const api = getClient();

  const created = await api.models.Room.create({
    consultoryId: input.consultoryId,
    ownerId: input.ownerId,
    name: input.name,
    description: input.description,
    pricePerPeriod: input.pricePerPeriod,
    equipment: input.equipment,
    periodMorning: input.periodMorning,
    periodAfternoon: input.periodAfternoon,
    periodEvening: input.periodEvening,
  });

  if (!created.data) {
    const message = created.errors?.[0]?.message ?? "Não foi possível criar a sala.";
    throw new Error(message);
  }

  return mapBackendRoom(created.data as unknown as Record<string, unknown>);
}

export async function updateRoom(
  id: string,
  fields: Partial<Omit<CreateRoomInput, "consultoryId" | "ownerId">>
): Promise<void> {
  const api = getClient();

  const updated = await api.models.Room.update({ id, ...fields });

  if (updated.errors?.length) {
    throw new Error(updated.errors[0].message ?? "Não foi possível atualizar a sala.");
  }
}

export async function deleteRoom(id: string): Promise<void> {
  const api = getClient();

  const result = await api.models.Room.delete({ id });

  if (result.errors?.length) {
    throw new Error(result.errors[0].message ?? "Não foi possível excluir a sala.");
  }
}
