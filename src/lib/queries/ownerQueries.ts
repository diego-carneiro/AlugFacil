import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listConsultoriesByOwner } from "../api/consultories";
import { listBookingsByOwner } from "../api/bookings";
import { listRoomsByConsultory } from "../api/rooms";
import type { Consultory } from "../../types/consultory";

export const queryKeys = {
  ownerConsultories: (ownerId: string) =>
    ["consultory", "byOwner", ownerId] as const,
  ownerBookings: (ownerId: string) =>
    ["bookings", "byOwner", ownerId] as const,
  consultoryRooms: (consultoryId: string) =>
    ["rooms", "byConsultory", consultoryId] as const,
} as const;

export function useOwnerConsultories(ownerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ownerConsultories(ownerId ?? ""),
    queryFn: () => listConsultoriesByOwner(ownerId!),
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOwnerBookings(ownerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ownerBookings(ownerId ?? ""),
    queryFn: () => listBookingsByOwner(ownerId!),
    enabled: !!ownerId,
    staleTime: 60 * 1000,
  });
}

export function useConsultoryRooms(consultoryId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.consultoryRooms(consultoryId ?? ""),
    queryFn: () => listRoomsByConsultory(consultoryId!),
    enabled: !!consultoryId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useInvalidateOwnerData() {
  const queryClient = useQueryClient();

  return {
    invalidateBookings: (ownerId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ownerBookings(ownerId),
      }),
    invalidateRooms: (consultoryId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultoryRooms(consultoryId),
      }),
    invalidateConsultories: (ownerId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.ownerConsultories(ownerId),
      }),
    updateConsultoryLogo: (
      ownerId: string,
      consultoryId: string,
      logoKey: string,
      logoUrl: string
    ) => {
      queryClient.setQueryData<Consultory[]>(
        queryKeys.ownerConsultories(ownerId),
        (prev) =>
          prev?.map((c) =>
            c.id === consultoryId ? { ...c, logoKey, logoUrl } : c
          )
      );
    },
  };
}
