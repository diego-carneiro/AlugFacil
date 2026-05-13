import {
  getAmplifyDataClientConfig,
  type DataClientEnv,
} from "@aws-amplify/backend/function/runtime";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../resource";

const clientPromise = (async () => {
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
    process.env as unknown as DataClientEnv
  );
  Amplify.configure(resourceConfig, libraryOptions);
  return generateClient<Schema>();
})();

function resolveActorId(event: unknown): string | null {
  if (!event || typeof event !== "object") {
    return null;
  }

  const payload = event as Record<string, unknown>;
  const identity =
    payload.identity && typeof payload.identity === "object"
      ? (payload.identity as Record<string, unknown>)
      : undefined;

  const directSub = typeof identity?.sub === "string" ? identity.sub.trim() : "";
  if (directSub.length > 0) {
    return directSub;
  }

  const claims =
    identity?.claims && typeof identity.claims === "object"
      ? (identity.claims as Record<string, unknown>)
      : undefined;
  const claimSub = typeof claims?.sub === "string" ? claims.sub.trim() : "";

  return claimSub.length > 0 ? claimSub : null;
}

function normalizeComment(comment: string | null | undefined): string | undefined {
  const trimmed = (comment ?? "").trim();
  return trimmed.length > 0 ? trimmed.slice(0, 400) : undefined;
}

export const handler: Schema["submitBookingReview"]["functionHandler"] = async (event) => {
  const actorId = resolveActorId(event);
  if (!actorId) {
    throw new Error("Não foi possível identificar o usuário autenticado.");
  }

  const bookingId = String(event.arguments.bookingId ?? "").trim();
  if (!bookingId) {
    throw new Error("bookingId é obrigatório.");
  }

  const rating = Number(event.arguments.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("A nota da avaliação deve ser um número inteiro entre 1 e 5.");
  }

  const comment = normalizeComment(event.arguments.comment);
  const client = await clientPromise;

  const bookingResult = await client.models.Booking.get({ id: bookingId });
  if (!bookingResult.data) {
    throw new Error("Locação não encontrada.");
  }

  const booking = bookingResult.data;
  const isTenant = actorId === String(booking.tenantId ?? "");
  const isOwner = actorId === String(booking.ownerId ?? "");

  if (!isTenant && !isOwner) {
    throw new Error("Somente locatário e owner vinculados à locação podem avaliar.");
  }

  if (String(booking.status ?? "") !== "completed" || !booking.inspectedCheckOut) {
    throw new Error("A avaliação só pode ser enviada após o fim da locação (check-out concluído).");
  }

  if ((isTenant && booking.reviewedByTenant) || (isOwner && booking.reviewedByOwner)) {
    throw new Error("Esta parte já enviou avaliação para esta locação.");
  }

  const reviewType = isTenant ? "tenant_to_consultory" : "owner_to_tenant";
  const toUserId = isTenant ? String(booking.consultoryId ?? "") : String(booking.tenantId ?? "");
  const toUserName = isTenant
    ? String(booking.consultoryName ?? "Consultório")
    : String(booking.tenantName ?? "Locatário");
  const fromUserName = isTenant
    ? String(booking.tenantName ?? "Locatário")
    : String(booking.ownerName ?? "Proprietário");
  const reviewDate = new Date().toISOString().slice(0, 10);

  const reviewResult = await client.models.Review.create({
    bookingId: String(booking.id ?? ""),
    consultoryId: String(booking.consultoryId ?? ""),
    fromUserId: actorId,
    fromUserName,
    toUserId,
    toUserName,
    rating,
    comment,
    reviewDate,
    type: reviewType,
  });

  if (!reviewResult.data) {
    const message = reviewResult.errors?.[0]?.message ?? "Não foi possível registrar a avaliação.";
    throw new Error(message);
  }

  const bookingUpdateResult = await client.models.Booking.update({
    id: String(booking.id ?? ""),
    reviewedByTenant: isTenant ? true : Boolean(booking.reviewedByTenant),
    reviewedByOwner: isOwner ? true : Boolean(booking.reviewedByOwner),
  });

  if (bookingUpdateResult.errors?.length) {
    throw new Error(bookingUpdateResult.errors[0].message ?? "A avaliação foi criada, mas a locação não foi atualizada.");
  }

  return {
    id: String(reviewResult.data.id ?? ""),
    bookingId: String(reviewResult.data.bookingId ?? ""),
    consultoryId: String(reviewResult.data.consultoryId ?? ""),
    fromUserId: String(reviewResult.data.fromUserId ?? ""),
    fromUserName: String(reviewResult.data.fromUserName ?? ""),
    toUserId: String(reviewResult.data.toUserId ?? ""),
    toUserName: typeof reviewResult.data.toUserName === "string" ? reviewResult.data.toUserName : undefined,
    rating: Number(reviewResult.data.rating ?? 0),
    comment: typeof reviewResult.data.comment === "string" ? reviewResult.data.comment : undefined,
    reviewDate: String(reviewResult.data.reviewDate ?? reviewDate),
    type: String(reviewResult.data.type ?? reviewType) as "tenant_to_consultory" | "owner_to_tenant",
  };
};
