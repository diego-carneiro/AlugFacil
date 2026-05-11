export interface Consultory {
  id: string;
  name: string;
  publicSlug?: string;
  neighborhood: string;
  city: string;
  state: string;
  address?: string;
  zipCode?: string;
  pricePerPeriod: number;
  description: string;
  equipment: string[];
  imageKeys?: string[];
  images: string[];
  logoKey?: string;
  logoUrl?: string;
  whatsappNumber: string;
  featured: boolean;
  ownerId: string;
  rating: number;
  totalReviews: number;
  isPremium?: boolean;
  periods: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
}
