export type UserRole = "tenant" | "owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  cro?: string;
  specialty?: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
}
