export type ReviewType = "tenant_to_owner" | "owner_to_tenant";

export interface Review {
  id: string;
  bookingId: string;
  consultoryId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName?: string;
  rating: number;
  comment: string;
  reviewDate: string;
  type: ReviewType;
}
