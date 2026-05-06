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
