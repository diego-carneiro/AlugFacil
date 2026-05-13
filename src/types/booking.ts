export type BookingPeriod = "morning" | "afternoon" | "evening";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "disputed";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "checked_in",
];

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
  completedAt?: string;
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
  checked_in: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  disputed: "Em disputa",
};

export const statusColors: Record<BookingStatus, string> = {
  pending: "bg-accent-100 text-accent-600",
  confirmed: "bg-primary-50 text-primary-600",
  checked_in: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
  disputed: "bg-orange-50 text-orange-600",
};
