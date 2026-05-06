import { client, hasAmplifyBackend } from "./client";
import type { Review, ReviewType } from "../../types/review";

function getClient() {
  if (!hasAmplifyBackend || !client) {
    throw new Error("Backend AWS não configurado para avaliações.");
  }
  return client;
}

function mapBackendReview(item: Record<string, unknown>): Review {
  return {
    id: String(item.id ?? ""),
    bookingId: String(item.bookingId ?? ""),
    consultoryId: String(item.consultoryId ?? ""),
    fromUserId: String(item.fromUserId ?? ""),
    fromUserName: String(item.fromUserName ?? ""),
    toUserId: String(item.toUserId ?? ""),
    toUserName: typeof item.toUserName === "string" ? item.toUserName : undefined,
    rating: Number(item.rating ?? 0),
    comment: String(item.comment ?? ""),
    reviewDate: String(item.reviewDate ?? ""),
    type: String(item.type ?? "tenant_to_owner") as ReviewType,
  };
}

export async function listReviewsByConsultory(consultoryId: string): Promise<Review[]> {
  const api = getClient();

  const response = await api.models.Review.list({
    filter: {
      consultoryId: {
        eq: consultoryId,
      },
    },
    authMode: "apiKey",
    limit: 1000,
  });

  return response.data.map((item) =>
    mapBackendReview(item as unknown as Record<string, unknown>)
  );
}

export interface CreateReviewInput {
  bookingId: string;
  consultoryId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName?: string;
  rating: number;
  comment?: string;
  type: ReviewType;
  reviewDate: string;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const api = getClient();

  const created = await api.models.Review.create({
    bookingId: input.bookingId,
    consultoryId: input.consultoryId,
    fromUserId: input.fromUserId,
    fromUserName: input.fromUserName,
    toUserId: input.toUserId,
    toUserName: input.toUserName,
    rating: input.rating,
    comment: input.comment,
    type: input.type,
    reviewDate: input.reviewDate,
  });

  if (!created.data) {
    const message = created.errors?.[0]?.message ?? "Não foi possível registrar a avaliação.";
    throw new Error(message);
  }

  return mapBackendReview(created.data as unknown as Record<string, unknown>);
}
