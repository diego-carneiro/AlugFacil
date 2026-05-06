import { client, hasAmplifyBackend } from "./client";
import type { Booking, BookingPeriod, BookingStatus } from "../../types/booking";
import type { User } from "../../types/user";
import type { Consultory } from "../../types/consultory";
import { blockAvailabilitySlot } from "./availability";

function getClient() {
  if (!hasAmplifyBackend || !client) {
    throw new Error("Backend AWS não configurado para reservas.");
  }
  return client;
}

function mapBackendBooking(item: Record<string, unknown>): Booking {
  return {
    id: String(item.id ?? ""),
    consultoryId: String(item.consultoryId ?? ""),
    consultoryName: String(item.consultoryName ?? "Consultório"),
    consultoryImage:
      typeof item.consultoryImage === "string"
        ? item.consultoryImage
        : "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    tenantId: String(item.tenantId ?? ""),
    tenantName: String(item.tenantName ?? "Locatário"),
    ownerId: String(item.ownerId ?? ""),
    ownerName: String(item.ownerName ?? "Proprietário"),
    date: String(item.date ?? ""),
    period: String(item.period ?? "morning") as BookingPeriod,
    status: String(item.status ?? "pending") as BookingStatus,
    price: Number(item.price ?? 0),
    reviewedByTenant: Boolean(item.reviewedByTenant),
    reviewedByOwner: Boolean(item.reviewedByOwner),
    inspectedCheckIn: Boolean(item.inspectedCheckIn),
    inspectedCheckOut: Boolean(item.inspectedCheckOut),
  };
}

export async function listBookings(): Promise<Booking[]> {
  const api = getClient();

  const response = await api.models.Booking.list({
    limit: 1000,
  });

  return response.data.map((item) =>
    mapBackendBooking(item as unknown as Record<string, unknown>)
  );
}

export async function listBookingsByTenant(tenantId: string): Promise<Booking[]> {
  const api = getClient();

  const response = await api.models.Booking.list({
    filter: {
      tenantId: {
        eq: tenantId,
      },
    },
    limit: 1000,
  });

  return response.data.map((item) =>
    mapBackendBooking(item as unknown as Record<string, unknown>)
  );
}

export async function listBookingsByOwner(ownerId: string): Promise<Booking[]> {
  const api = getClient();

  const response = await api.models.Booking.list({
    filter: {
      ownerId: {
        eq: ownerId,
      },
    },
    limit: 1000,
  });

  return response.data.map((item) =>
    mapBackendBooking(item as unknown as Record<string, unknown>)
  );
}

export async function listBookingsByConsultory(consultoryId: string): Promise<Booking[]> {
  const api = getClient();

  const response = await api.models.Booking.list({
    filter: {
      consultoryId: {
        eq: consultoryId,
      },
    },
    limit: 1000,
  });

  return response.data.map((item) =>
    mapBackendBooking(item as unknown as Record<string, unknown>)
  );
}

export async function createBooking(input: {
  consultory: Consultory;
  tenant: User;
  ownerName: string;
  date: string;
  period: BookingPeriod;
}): Promise<Booking> {
  const api = getClient();

  const created = await api.models.Booking.create({
    consultoryId: input.consultory.id,
    consultoryName: input.consultory.name,
    consultoryImage: input.consultory.images[0],
    tenantId: input.tenant.id,
    tenantName: input.tenant.name,
    ownerId: input.consultory.ownerId,
    ownerName: input.ownerName,
    date: input.date,
    period: input.period,
    status: "pending",
    price: input.consultory.pricePerPeriod,
    reviewedByTenant: false,
    reviewedByOwner: false,
    inspectedCheckIn: false,
    inspectedCheckOut: false,
  });

  if (!created.data) {
    const message = created.errors?.[0]?.message ?? "Não foi possível criar a reserva.";
    throw new Error(message);
  }

  const booking = mapBackendBooking(created.data as unknown as Record<string, unknown>);

  await blockAvailabilitySlot({
    consultoryId: input.consultory.id,
    date: input.date,
    period: input.period,
    blockedByBookingId: booking.id,
  });

  return booking;
}

export async function updateBooking(id: string, patch: Partial<Booking>): Promise<void> {
  const api = getClient();

  const updated = await api.models.Booking.update({
    id,
    status: patch.status,
    reviewedByTenant: patch.reviewedByTenant,
    reviewedByOwner: patch.reviewedByOwner,
    inspectedCheckIn: patch.inspectedCheckIn,
    inspectedCheckOut: patch.inspectedCheckOut,
  });

  if (updated.errors?.length) {
    throw new Error(updated.errors[0].message ?? "Falha ao atualizar reserva.");
  }
}

export async function getUnavailablePeriodsByDate(
  consultoryId: string,
  date: string
): Promise<BookingPeriod[]> {
  const bookings = await listBookingsByConsultory(consultoryId);

  const blocked = bookings
    .filter(
      (booking) =>
        booking.date === date &&
        booking.status !== "cancelled"
    )
    .map((booking) => booking.period);

  return Array.from(new Set(blocked));
}
