export type BookingPeriod = "morning" | "afternoon" | "evening";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  consultoryId: string;
  consultoryName: string;
  consultoryImage: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  ownerName: string;
  date: string;
  period: BookingPeriod;
  status: BookingStatus;
  price: number;
  reviewedByTenant: boolean;
  reviewedByOwner: boolean;
  inspectedCheckIn: boolean;
  inspectedCheckOut: boolean;
}

export const periodLabels: Record<BookingPeriod, string> = {
  morning: "Manhã (8h–12h)",
  afternoon: "Tarde (13h–17h)",
  evening: "Noite (18h–22h)",
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const statusColors: Record<BookingStatus, string> = {
  pending: "bg-accent-100 text-accent-600",
  confirmed: "bg-primary-50 text-primary-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

export const bookings: Booking[] = [
  {
    id: "bk-001",
    consultoryId: "jardim-aquarius",
    consultoryName: "Consultório Jardim Aquarius",
    consultoryImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    tenantId: "tenant-1",
    tenantName: "Dra. Ana Lima",
    ownerId: "owner-1",
    ownerName: "Dr. Roberto Alves",
    date: "2026-04-17",
    period: "morning",
    status: "confirmed",
    price: 300,
    reviewedByTenant: false,
    reviewedByOwner: false,
    inspectedCheckIn: false,
    inspectedCheckOut: false,
  },
  {
    id: "bk-002",
    consultoryId: "centro-sjc",
    consultoryName: "Consultório Centro",
    consultoryImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400",
    tenantId: "tenant-1",
    tenantName: "Dra. Ana Lima",
    ownerId: "owner-1",
    ownerName: "Dr. Roberto Alves",
    date: "2026-04-22",
    period: "afternoon",
    status: "pending",
    price: 200,
    reviewedByTenant: false,
    reviewedByOwner: false,
    inspectedCheckIn: false,
    inspectedCheckOut: false,
  },
  {
    id: "bk-003",
    consultoryId: "parque-residencial",
    consultoryName: "Consultório Parque Residencial Aquarius",
    consultoryImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    tenantId: "tenant-1",
    tenantName: "Dra. Ana Lima",
    ownerId: "owner-2",
    ownerName: "Clínica Sorria Bem",
    date: "2026-03-28",
    period: "morning",
    status: "completed",
    price: 350,
    reviewedByTenant: false,
    reviewedByOwner: true,
    inspectedCheckIn: true,
    inspectedCheckOut: true,
  },
  {
    id: "bk-004",
    consultoryId: "vila-adyana",
    consultoryName: "Consultório Vila Adyana",
    consultoryImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400",
    tenantId: "tenant-2",
    tenantName: "Dr. Carlos Mendes",
    ownerId: "owner-2",
    ownerName: "Clínica Sorria Bem",
    date: "2026-04-15",
    period: "afternoon",
    status: "confirmed",
    price: 250,
    reviewedByTenant: false,
    reviewedByOwner: false,
    inspectedCheckIn: false,
    inspectedCheckOut: false,
  },
  {
    id: "bk-005",
    consultoryId: "jardim-aquarius",
    consultoryName: "Consultório Jardim Aquarius",
    consultoryImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
    tenantId: "tenant-2",
    tenantName: "Dr. Carlos Mendes",
    ownerId: "owner-1",
    ownerName: "Dr. Roberto Alves",
    date: "2026-03-20",
    period: "evening",
    status: "completed",
    price: 300,
    reviewedByTenant: true,
    reviewedByOwner: true,
    inspectedCheckIn: true,
    inspectedCheckOut: true,
  },
  {
    id: "bk-006",
    consultoryId: "centro-sjc",
    consultoryName: "Consultório Centro",
    consultoryImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400",
    tenantId: "tenant-1",
    tenantName: "Dra. Ana Lima",
    ownerId: "owner-1",
    ownerName: "Dr. Roberto Alves",
    date: "2026-04-10",
    period: "morning",
    status: "cancelled",
    price: 200,
    reviewedByTenant: false,
    reviewedByOwner: false,
    inspectedCheckIn: false,
    inspectedCheckOut: false,
  },
];
