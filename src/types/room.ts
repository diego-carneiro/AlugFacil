export interface Room {
  id: string;
  consultoryId: string;
  ownerId: string;
  name: string;
  description?: string;
  pricePerPeriod: number;
  equipment: string[];
  imageKeys?: string[];
  images: string[];
  periods: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  available: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

export interface CreateRoomInput {
  consultoryId: string;
  ownerId: string;
  name: string;
  description?: string;
  pricePerPeriod: number;
  equipment: string[];
  periodMorning: boolean;
  periodAfternoon: boolean;
  periodEvening: boolean;
}
