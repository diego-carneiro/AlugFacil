import { client, hasAmplifyBackend } from "./client";
import type { Inspection, InspectionType } from "../../types/inspection";

function getClient() {
  if (!hasAmplifyBackend || !client) {
    throw new Error("Backend AWS não configurado para vistorias.");
  }
  return client;
}

function mapBackendInspection(item: Record<string, unknown>): Inspection {
  return {
    id: String(item.id ?? ""),
    bookingId: String(item.bookingId ?? ""),
    consultoryId: String(item.consultoryId ?? ""),
    createdById: String(item.createdById ?? ""),
    createdByName: String(item.createdByName ?? ""),
    type: String(item.type ?? "check_in") as InspectionType,
    findingsJson: String(item.findingsJson ?? ""),
    issueCount: Number(item.issueCount ?? 0),
    photoKeys: Array.isArray(item.photoKeys)
      ? item.photoKeys.filter((value): value is string => typeof value === "string")
      : [],
    inspectedAt: String(item.inspectedAt ?? ""),
  };
}

export interface CreateInspectionInput {
  bookingId: string;
  consultoryId: string;
  createdById: string;
  createdByName: string;
  type: InspectionType;
  findingsJson: string;
  issueCount: number;
  photoKeys?: string[];
  inspectedAt: string;
}

export async function createInspection(input: CreateInspectionInput): Promise<Inspection> {
  const api = getClient();

  const created = await api.models.Inspection.create({
    bookingId: input.bookingId,
    consultoryId: input.consultoryId,
    createdById: input.createdById,
    createdByName: input.createdByName,
    type: input.type,
    findingsJson: input.findingsJson,
    issueCount: input.issueCount,
    photoKeys: input.photoKeys,
    inspectedAt: input.inspectedAt,
  });

  if (!created.data) {
    const message = created.errors?.[0]?.message ?? "Não foi possível registrar a vistoria.";
    throw new Error(message);
  }

  return mapBackendInspection(created.data as unknown as Record<string, unknown>);
}
