import { client, hasAmplifyBackend } from "./client";
import type { BookingPeriod } from "../../types/booking";

function getClient() {
  if (!hasAmplifyBackend || !client) {
    throw new Error("Backend AWS não configurado para disponibilidade.");
  }
  return client;
}

export async function blockAvailabilitySlot(input: {
  consultoryId: string;
  date: string;
  period: BookingPeriod;
  blockedByBookingId: string;
}): Promise<void> {
  const api = getClient();

  const existing = await api.models.Availability.list({
    filter: {
      consultoryId: {
        eq: input.consultoryId,
      },
    },
    limit: 1000,
  });

  const slot = existing.data.find(
    (item) => item?.date === input.date && item?.period === input.period
  );

  if (slot?.id) {
    const updated = await api.models.Availability.update({
      id: slot.id,
      status: "booked",
      blockedByBookingId: input.blockedByBookingId,
      blockedReason: "booking",
    });

    if (updated.errors?.length) {
      throw new Error(updated.errors[0].message ?? "Falha ao atualizar disponibilidade.");
    }

    return;
  }

  const created = await api.models.Availability.create({
    consultoryId: input.consultoryId,
    date: input.date,
    period: input.period,
    status: "booked",
    blockedByBookingId: input.blockedByBookingId,
    blockedReason: "booking",
  });

  if (created.errors?.length) {
    throw new Error(created.errors[0].message ?? "Falha ao criar disponibilidade.");
  }
}
